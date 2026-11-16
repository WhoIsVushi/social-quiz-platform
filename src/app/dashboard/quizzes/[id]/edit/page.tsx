import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Builder } from "@/components/quiz/builder";
import { quizSchema } from "@/lib/validation/quiz";
import { quizLimits } from "@/lib/config";
import { notFound } from "next/navigation";
export const metadata = { title: "Testi düzenle" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const quiz = await db.quiz.findFirst({ where: { id, ownerId: session.user.id } });
  if (!quiz) notFound();
  return (
    <div className="builder-shell">
      <div className="status-box">
        Düzenlemeler taslağa kaydedilir. Paylaşılan testin güncellenmesi için yeniden yayımla.
      </div>
      <Builder
        initial={quizSchema.parse(quiz.draft)}
        quizId={id}
        initialRevision={quiz.revision}
        limits={quizLimits}
      />
    </div>
  );
}
