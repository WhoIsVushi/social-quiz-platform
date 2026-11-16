import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Layers, Trophy } from "lucide-react";
import { getSession } from "@/lib/auth";
import { loadPublished, publicQuiz } from "@/server/quizzes";
import { ReportQuiz } from "@/components/quiz/report";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const quiz = await loadPublished(slug);
  if (!quiz) return { title: "Test bulunamadı", robots: { index: false, follow: false } };
  const data = publicQuiz(quiz, quiz.activeVersion!);
  return {
    title: data.title,
    description: `${data.creatorName}’i ne kadar iyi tanıyorsun? ${data.questions.length} soruda keşfet.`,
    robots: { index: quiz.visibility === "PUBLIC", follow: quiz.visibility === "PUBLIC" },
    alternates: { canonical: `/quiz/${slug}` },
    openGraph: {
      title: data.title,
      description: "Testi çöz, seni en iyi kimin tanıdığını keşfet.",
    },
  };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  const quiz = await loadPublished(slug, session?.user.id);
  if (!quiz) notFound();
  const data = publicQuiz(quiz, quiz.activeVersion!);
  return (
    <div className="quiz-shell">
      <div className="card quiz-landing">
        <div className={`large-emoji tone-${data.settings.theme}`}>{data.settings.emoji}</div>
        <span className="eyebrow plain">
          {data.creatorName.toLocaleUpperCase("tr-TR")} SANA MEYDAN OKUYOR
        </span>
        <h1 style={{ marginTop: 15 }}>{data.title}</h1>
        <p>{data.description}</p>
        <div className="quiz-facts">
          <span>
            <Layers size={15} />
            {data.questions.length} soru
          </span>
          <span>
            <Clock size={15} />
            {Math.ceil(data.questions.length * 0.25)} dakika
          </span>
          <span>💜 Üyelik gerekmez</span>
        </div>
        <Link className="button button-primary full-width" href={`/quiz/${slug}/play`}>
          Meydan okumayı kabul et <ArrowRight size={18} />
        </Link>
        {data.settings.leaderboard && data.settings.showScore && (
          <Link className="button button-ghost" href={`/quiz/${slug}/leaderboard`}>
            <Trophy size={16} />
            Sıralamaya göz at
          </Link>
        )}
        <p className="quiz-note">Mükemmel puan şart değil. Birbirini keşfetmek yeter.</p>
      </div>
      <div className="row" style={{ justifyContent: "center", marginTop: 20 }}>
        <ReportQuiz quizId={quiz.id} />
      </div>
    </div>
  );
}
