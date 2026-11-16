import "server-only";
import { db } from "@/lib/db";
export async function dashboardStats(ownerId: string) {
  const where = { quiz: { ownerId }, status: "COMPLETED" as const };
  const [quizCount, attempts, recent, quizzes, nicknames] = await Promise.all([
    db.quiz.count({ where: { ownerId } }),
    db.quizAttempt.aggregate({ where, _count: true, _avg: { score: true }, _max: { score: true } }),
    db.quizAttempt.findMany({
      where,
      orderBy: { completedAt: "desc" },
      take: 6,
      select: {
        participantNickname: true,
        score: true,
        completedAt: true,
        quiz: { select: { id: true, title: true } },
      },
    }),
    db.quiz.findMany({
      where: { ownerId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { attempts: { where: { status: "COMPLETED" } } } } },
    }),
    db.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(DISTINCT LOWER(a."participantNickname")) AS count FROM "QuizAttempt" a INNER JOIN "Quiz" q ON q.id=a."quizId" WHERE q."ownerId"=${ownerId} AND a.status='COMPLETED'`,
  ]);
  return {
    quizCount,
    completed: attempts._count,
    average: Math.round(attempts._avg.score || 0),
    highest: attempts._max.score || 0,
    nicknames: Number(nicknames[0]?.count || 0),
    recent,
    quizzes,
  };
}
