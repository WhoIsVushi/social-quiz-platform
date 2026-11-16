import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { QuizList } from "@/components/dashboard/quiz-list";
import { appUrl } from "@/lib/config";
export const metadata = { title: "Testlerim" };
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await requireSession();
  const { page: raw } = await searchParams;
  const page = Math.max(1, parseInt(raw || "1") || 1);
  const [quizzes, total] = await Promise.all([
    db.quiz.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
      skip: (page - 1) * 30,
      include: { _count: { select: { attempts: { where: { status: "COMPLETED" } } } } },
    }),
    db.quiz.count({ where: { ownerId: session.user.id } }),
  ]);
  return (
    <>
      <div className="page-heading">
        <div>
          <h1 className="page-title">Senin testlerin.</h1>
          <p className="page-subtitle">Her biri senden küçük bir parça.</p>
        </div>
        <Link className="button button-primary button-small" href="/dashboard/quizzes/new">
          <Plus size={16} />
          Yeni test
        </Link>
      </div>
      <QuizList
        baseUrl={appUrl}
        quizzes={quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          slug: q.slug,
          status: q.status,
          emoji: (q.draft as { settings?: { emoji?: string } }).settings?.emoji || "✌️",
          count: q._count.attempts,
          updatedAt: q.updatedAt.toISOString(),
        }))}
      />
      {total > 30 && (
        <div className="row spread" style={{ marginTop: 25 }}>
          {page > 1 ? (
            <Link className="text-link" href={`?page=${page - 1}`}>
              ← Önceki
            </Link>
          ) : (
            <span />
          )}
          <span className="small muted">Sayfa {page} · Arama bu sayfadaki testlerde yapılır</span>
          {page * 30 < total && (
            <Link className="text-link" href={`?page=${page + 1}`}>
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
