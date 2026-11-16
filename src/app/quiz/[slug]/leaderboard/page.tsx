import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { getSession } from "@/lib/auth";
import { leaderboard } from "@/server/quizzes";
import { formatDate } from "@/lib/utils";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dostluk sıralaması", robots: { index: false, follow: false } };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const page = Math.max(1, Math.min(10000, parseInt(query.page || "1") || 1));
  const session = await getSession();
  const data = await leaderboard(slug, page, session?.user.id);
  if (!data) notFound();
  return (
    <div className="quiz-shell">
      <div className="leaderboard-hero">
        <span>🏆</span>
        <h1>Seni en iyi onlar tanıyor.</h1>
        <p className="small">{data.title}</p>
      </div>
      <div className="card">
        {data.rows.length ? (
          data.rows.map((r) => (
            <div className={`leaderboard-row rank-${r.rank}`} key={r.rank}>
              <span className="rank-number">
                {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}
              </span>
              <div className="mini-avatar">{r.nickname[0]}</div>
              <div>
                <strong>{r.nickname}</strong>
                <small>{r.completedAt ? formatDate(r.completedAt) : ""}</small>
              </div>
              <span className="leaderboard-score">%{r.score}</span>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Trophy size={35} />
            <h2>İlk sırayı kapmaya ne dersin?</h2>
            <p>Henüz tamamlanan bir katılım yok. İlk adımı sen at.</p>
            <Link className="button button-primary" href={`/quiz/${slug}/play`}>
              Testi çöz
            </Link>
          </div>
        )}
      </div>
      <div className="row spread" style={{ marginTop: 20 }}>
        {page > 1 ? (
          <Link className="text-link" href={`?page=${page - 1}`}>
            ← Önceki
          </Link>
        ) : (
          <span />
        )}
        {page * 20 < data.total && (
          <Link className="text-link" href={`?page=${page + 1}`}>
            Sonraki →
          </Link>
        )}
      </div>
      <p className="quiz-note">
        Eşit puanda önce doğru sayısı, sonra bitirme zamanı dikkate alınır.
        <br />
        Tekrar katılımlar ayrı ayrı listelenir.
      </p>
      <Link
        className="button button-secondary full-width"
        style={{ marginTop: 25 }}
        href={`/quiz/${slug}`}
      >
        Teste dön
      </Link>
    </div>
  );
}
