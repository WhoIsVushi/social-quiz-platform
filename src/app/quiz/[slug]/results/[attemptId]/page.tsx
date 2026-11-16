import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";
import { getSession } from "@/lib/auth";
import { guestIdentity } from "@/lib/security";
import { db } from "@/lib/db";
import { snapshotOf } from "@/server/quizzes";
import { resultMessage } from "@/lib/utils";
import { settingsSchema } from "@/lib/validation/quiz";
import { ScoreReveal } from "@/components/quiz/result-reveal";
import { Share } from "@/components/share";
import { appUrl } from "@/lib/config";
export const dynamic = "force-dynamic";
export const metadata = { title: "Test sonucun", robots: { index: false, follow: false } };
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = await params;
  const [session, guest] = await Promise.all([getSession(), guestIdentity()]);
  const attempt = await db.quizAttempt.findFirst({
    where: { id: attemptId, status: "COMPLETED", quiz: { slug } },
    include: {
      quiz: true,
      quizVersion: {
        include: { questions: { orderBy: { position: "asc" }, include: { options: true } } },
      },
      answers: true,
    },
  });
  if (
    !attempt ||
    (attempt.guestHash !== guest && attempt.quiz.ownerId !== session?.user.id) ||
    attempt.quiz.status !== "PUBLISHED" ||
    (attempt.quiz.visibility === "PRIVATE" && attempt.quiz.ownerId !== session?.user.id)
  )
    notFound();
  const snapshot = snapshotOf(attempt.quizVersion);
  const settings = settingsSchema.parse(snapshot.settings);
  let rank: number | null = null;
  if (settings.leaderboard && settings.showScore && !attempt.hidden) {
    rank =
      (await db.quizAttempt.count({
        where: {
          quizId: attempt.quizId,
          status: "COMPLETED",
          hidden: false,
          OR: [
            { score: { gt: attempt.score } },
            { score: attempt.score, correctCount: { gt: attempt.correctCount } },
            {
              score: attempt.score,
              correctCount: attempt.correctCount,
              completedAt: { lt: attempt.completedAt! },
            },
            {
              score: attempt.score,
              correctCount: attempt.correctCount,
              completedAt: attempt.completedAt,
              id: { lt: attempt.id },
            },
          ],
        },
      })) + 1;
  }
  return (
    <div className="quiz-shell stack">
      <div className="card result-hero">
        <span className="eyebrow plain">
          {attempt.participantNickname.toLocaleUpperCase("tr-TR")}, İŞTE SONUCUN
        </span>
        {settings.showScore ? (
          <>
            <ScoreReveal score={attempt.score} />
            <h1>{resultMessage(attempt.score)}</h1>
            <p>
              {attempt.totalQuestions} sorudan{" "}
              <strong style={{ color: "var(--foreground)" }}>{attempt.correctCount} doğru</strong>.{" "}
              {snapshot.creatorName} hakkında bir şeyler daha öğrendin!
            </p>
            {rank && (
              <span className="pill">
                <Trophy size={13} />
                Sıralamada {rank}. sıradasın
              </span>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 65, marginBlock: 20 }}>💌</div>
            <h1>Cevapların sahibine ulaştı!</h1>
            <p>Bu testte puanlar katılımcılarla paylaşılmıyor. Katıldığın için teşekkürler.</p>
          </>
        )}
        <div style={{ marginTop: 30, textAlign: "left" }}>
          <Share
            url={`${appUrl}/quiz/${slug}`}
            text={
              settings.showScore
                ? `Bu testte %${attempt.score} aldım! Sen kaç puan alabilirsin? 👀`
                : "Bu testi tamamladım. Sen de dene! 💜"
            }
          />
        </div>
        <div className="row wrap" style={{ justifyContent: "center", marginTop: 25 }}>
          {settings.allowReplay && (
            <Link className="button button-secondary button-small" href={`/quiz/${slug}/play`}>
              <RotateCcw size={14} />
              Tekrar dene
            </Link>
          )}
          {settings.leaderboard && settings.showScore && (
            <Link
              className="button button-secondary button-small"
              href={`/quiz/${slug}/leaderboard`}
            >
              <Trophy size={14} />
              Sıralama
            </Link>
          )}
        </div>
      </div>
      {settings.showAnswers && settings.showScore && (
        <div className="card">
          <h2 className="card-title">Cevapların hikâyesi.</h2>
          {attempt.quizVersion.questions.map((q, i) => {
            const answer = attempt.answers.find((a) => a.questionId === q.id);
            const correct = q.options.find((o) => o.isCorrect);
            return (
              <div className="result-review" key={q.id}>
                <h3>
                  {i + 1}. {q.text}
                </h3>
                <p className={answer?.isCorrect ? "review-correct" : "review-incorrect"}>
                  {answer?.isCorrect ? "✓" : "✕"} Senin cevabın:{" "}
                  {q.options.find((o) => o.id === answer?.selectedOptionId)?.text}
                </p>
                {!answer?.isCorrect && (
                  <p className="review-correct">Doğru cevap: {correct?.text}</p>
                )}
                {q.explanation && <p>{q.explanation}</p>}
              </div>
            );
          })}
        </div>
      )}
      <Link href="/dashboard/quizzes/new" className="button button-primary">
        Şimdi sen kendi testini oluştur <ArrowRight size={17} />
      </Link>
    </div>
  );
}
