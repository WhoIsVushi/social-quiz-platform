import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/security";
import {
  quizSchema,
  settingsSchema,
  validatePublish,
  type QuizDraft,
  type PublicQuiz,
} from "@/lib/validation/quiz";
import { quizLimits } from "@/lib/config";
import { slugify } from "@/lib/utils";
import { scoreAnswers, publicNickname } from "@/features/quiz/scoring";

const versionInclude = {
  questions: {
    orderBy: { position: "asc" as const },
    include: { options: { orderBy: { position: "asc" as const } } },
  },
};
type Version = Prisma.QuizVersionGetPayload<{ include: typeof versionInclude }>;
type Snapshot = Omit<QuizDraft, "questions">;
export function snapshotOf(version: { snapshot: Prisma.JsonValue }) {
  return version.snapshot as unknown as Snapshot;
}
export async function ownedQuiz(id: string, ownerId: string) {
  const quiz = await db.quiz.findFirst({ where: { id, ownerId } });
  if (!quiz) throw new AppError("Test bulunamadı.", 404);
  return quiz;
}
export async function createQuiz(ownerId: string, raw: unknown) {
  const draft = quizSchema.parse(raw);
  return db.quiz.create({
    data: {
      ownerId,
      title: draft.title,
      description: draft.description,
      creatorName: draft.creatorName,
      category: draft.category,
      visibility: draft.visibility,
      slug: `${slugify(draft.title)}-${randomBytes(6).toString("hex")}`,
      draft: draft as Prisma.InputJsonValue,
    },
  });
}
export async function saveQuiz(id: string, ownerId: string, raw: unknown, revision: number) {
  const draft = quizSchema.parse(raw);
  const result = await db.quiz.updateMany({
    where: { id, ownerId, revision },
    data: {
      title: draft.title,
      description: draft.description,
      creatorName: draft.creatorName,
      category: draft.category,
      draft: draft as Prisma.InputJsonValue,
      revision: { increment: 1 },
    },
  });
  if (!result.count)
    throw new AppError("Test başka bir sekmede değişti. Sayfayı yenileyip tekrar dene.", 409);
  return { id, revision: revision + 1 };
}
export async function publishQuiz(id: string, ownerId: string) {
  return db.$transaction(async (tx) => {
    const quiz = await tx.quiz.findFirst({ where: { id, ownerId } });
    if (!quiz) throw new AppError("Test bulunamadı.", 404);
    const draft = validatePublish(quizSchema.parse(quiz.draft), quizLimits.min, quizLimits.max);
    const locked = await tx.quiz.updateMany({
      where: { id, ownerId, revision: quiz.revision },
      data: { revision: { increment: 1 } },
    });
    if (!locked.count) throw new AppError("Test değişti. Tekrar dene.", 409);
    const latest = await tx.quizVersion.aggregate({
      where: { quizId: id },
      _max: { versionNumber: true },
    });
    const { questions, ...snapshot } = draft;
    const version = await tx.quizVersion.create({
      data: {
        quizId: id,
        versionNumber: (latest._max.versionNumber ?? 0) + 1,
        snapshot: snapshot as Prisma.InputJsonValue,
        questions: {
          create: questions.map((q, position) => ({
            id: crypto.randomUUID(),
            text: q.text,
            explanation: q.explanation,
            position,
            options: {
              create: q.options.map((o, index) => ({
                id: crypto.randomUUID(),
                text: o.text,
                position: index,
                isCorrect: o.id === q.correctOptionId,
              })),
            },
          })),
        },
      },
    });
    await tx.quiz.update({
      where: { id },
      data: {
        activeVersionId: version.id,
        status: "PUBLISHED",
        visibility: draft.visibility,
        publishedAt: new Date(),
      },
    });
    return { slug: quiz.slug, revision: quiz.revision + 1 };
  });
}
export async function loadPublished(slug: string, ownerId?: string) {
  const quiz = await db.quiz.findUnique({
    where: { slug },
    include: { activeVersion: { include: versionInclude } },
  });
  if (
    !quiz ||
    quiz.status !== "PUBLISHED" ||
    !quiz.activeVersion ||
    (quiz.visibility === "PRIVATE" && quiz.ownerId !== ownerId)
  )
    return null;
  return quiz;
}
export function publicQuiz(
  quiz: { id: string; slug: string },
  version: Version,
  order?: string[],
): PublicQuiz {
  const snapshot = snapshotOf(version);
  const questions = version.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  }));
  if (order) questions.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  return {
    id: quiz.id,
    slug: quiz.slug,
    title: snapshot.title,
    description: snapshot.description,
    creatorName: snapshot.creatorName,
    category: snapshot.category,
    settings: settingsSchema.parse(snapshot.settings),
    questions,
  };
}
export async function startAttempt(
  slug: string,
  nickname: string,
  guestHash: string,
  ownerId?: string,
) {
  return db.$transaction(async (tx) => {
    // Serialize starts for the same browser and quiz, including replay-disabled starts.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${guestHash}:${slug}`}))`;
    const quiz = await tx.quiz.findUnique({
      where: { slug },
      include: { activeVersion: { include: versionInclude } },
    });
    if (
      !quiz ||
      quiz.status !== "PUBLISHED" ||
      !quiz.activeVersion ||
      (quiz.visibility === "PRIVATE" && quiz.ownerId !== ownerId)
    )
      throw new AppError("Test bulunamadı veya artık yayında değil.", 404);
    const settings = settingsSchema.parse(snapshotOf(quiz.activeVersion).settings);
    if (!settings.allowReplay) {
      const previous = await tx.quizAttempt.findFirst({
        where: { quizId: quiz.id, guestHash },
        orderBy: { startedAt: "desc" },
      });
      if (previous) {
        if (previous.status === "COMPLETED")
          throw new AppError("Bu testte tekrar katılıma izin verilmiyor.", 409);
        const original = await tx.quizVersion.findUniqueOrThrow({
          where: { id: previous.quizVersionId },
          include: versionInclude,
        });
        return { attemptId: previous.id, quiz: publicQuiz(quiz, original, previous.questionOrder) };
      }
    }
    const order = quiz.activeVersion.questions.map((q) => q.id);
    if (settings.shuffle)
      for (let i = order.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [order[i], order[j]] = [order[j], order[i]];
      }
    const attempt = await tx.quizAttempt.create({
      data: {
        quizId: quiz.id,
        quizVersionId: quiz.activeVersion.id,
        participantNickname: nickname,
        guestHash,
        totalQuestions: order.length,
        questionOrder: order,
      },
    });
    return { attemptId: attempt.id, quiz: publicQuiz(quiz, quiz.activeVersion, order) };
  });
}
export async function recoverAttempt(id: string, guestHash: string) {
  const attempt = await db.quizAttempt.findFirst({
    where: { id, guestHash },
    include: { quiz: true, quizVersion: { include: versionInclude } },
  });
  if (!attempt || attempt.quiz.status !== "PUBLISHED")
    throw new AppError("Katılım bulunamadı.", 404);
  return {
    attemptId: attempt.id,
    status: attempt.status,
    nickname: attempt.participantNickname,
    quiz: publicQuiz(attempt.quiz, attempt.quizVersion, attempt.questionOrder),
  };
}
export async function submitAttempt(
  id: string,
  guestHash: string,
  answers: { questionId: string; optionId: string }[],
  ownerId?: string,
) {
  return db.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.findFirst({
      where: { id, guestHash },
      include: { quiz: true, quizVersion: { include: versionInclude } },
    });
    if (
      !attempt ||
      attempt.quiz.status !== "PUBLISHED" ||
      (attempt.quiz.visibility === "PRIVATE" && attempt.quiz.ownerId !== ownerId)
    )
      throw new AppError("Katılım bulunamadı veya test artık yayında değil.", 404);
    if (attempt.status === "COMPLETED") return { attemptId: attempt.id, slug: attempt.quiz.slug };
    const scored = scoreAnswers(attempt.quizVersion.questions, answers);
    const locked = await tx.quizAttempt.updateMany({
      where: { id, guestHash, status: "STARTED" },
      data: {
        status: "COMPLETED",
        score: scored.score,
        correctCount: scored.correctCount,
        completedAt: new Date(),
      },
    });
    if (locked.count)
      await tx.attemptAnswer.createMany({
        data: scored.answers.map((a) => ({ ...a, attemptId: id })),
      });
    return { attemptId: id, slug: attempt.quiz.slug };
  });
}
export async function leaderboard(slug: string, page = 1, ownerId?: string) {
  const quiz = await loadPublished(slug, ownerId);
  if (!quiz) return null;
  const settings = settingsSchema.parse(snapshotOf(quiz.activeVersion!).settings);
  if (!settings.leaderboard || !settings.showScore) return null;
  const where = { quizId: quiz.id, status: "COMPLETED" as const, hidden: false };
  const [rows, total] = await Promise.all([
    db.quizAttempt.findMany({
      where,
      orderBy: [{ score: "desc" }, { correctCount: "desc" }, { completedAt: "asc" }, { id: "asc" }],
      skip: (page - 1) * 20,
      take: 20,
      select: { participantNickname: true, score: true, completedAt: true },
    }),
    db.quizAttempt.count({ where }),
  ]);
  return {
    title: snapshotOf(quiz.activeVersion!).title,
    rows: rows.map((r, index) => ({
      nickname: publicNickname(r.participantNickname, settings.maskNicknames),
      score: r.score,
      completedAt: r.completedAt,
      rank: (page - 1) * 20 + index + 1,
    })),
    total,
  };
}
