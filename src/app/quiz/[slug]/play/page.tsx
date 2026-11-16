import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { loadPublished, publicQuiz } from "@/server/quizzes";
import { Player } from "@/components/quiz/player";
export const dynamic = "force-dynamic";
export const metadata = { title: "Meydan okumayı çöz", robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  const quiz = await loadPublished(slug, session?.user.id);
  if (!quiz) notFound();
  return (
    <div className="quiz-shell">
      <Player quiz={publicQuiz(quiz, quiz.activeVersion!)} />
    </div>
  );
}
