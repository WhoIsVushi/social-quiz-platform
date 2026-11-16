import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ModerateButton } from "@/components/dashboard/moderate-button";
export const metadata = { title: "Test istatistikleri" };
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const { page: raw } = await searchParams;
  const page = Math.max(1, Math.min(10000, parseInt(raw || "1") || 1));
  const quiz = await db.quiz.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      activeVersion: { include: { questions: { orderBy: { position: "asc" } } } },
      _count: { select: { reports: true } },
    },
  });
  if (!quiz) notFound();
  const where = { quizId: id, status: "COMPLETED" as const };
  const [stats, started, attempts, distribution, difficulty, timeline, reports] = await Promise.all(
    [
      db.quizAttempt.aggregate({
        where,
        _count: true,
        _avg: { score: true },
        _max: { score: true },
      }),
      db.quizAttempt.count({ where: { quizId: id } }),
      db.quizAttempt.findMany({
        where,
        orderBy: [
          { score: "desc" },
          { correctCount: "desc" },
          { completedAt: "asc" },
          { id: "asc" },
        ],
        take: 20,
        skip: (page - 1) * 20,
        select: {
          id: true,
          participantNickname: true,
          score: true,
          correctCount: true,
          totalQuestions: true,
          completedAt: true,
          hidden: true,
        },
      }),
      db.$queryRaw<
        { bucket: number; count: bigint }[]
      >`SELECT LEAST(FLOOR(score/20)::int,4) AS bucket, COUNT(*) AS count FROM "QuizAttempt" WHERE "quizId"=${id} AND status='COMPLETED' GROUP BY bucket ORDER BY bucket`,
      db.$queryRaw<
        { questionId: string; count: bigint; correct: bigint }[]
      >`SELECT a."questionId", COUNT(*) AS count, COUNT(*) FILTER (WHERE a."isCorrect") AS correct FROM "AttemptAnswer" a INNER JOIN "QuizAttempt" t ON t.id=a."attemptId" WHERE t."quizId"=${id} AND t.status='COMPLETED' GROUP BY a."questionId"`,
      db.$queryRaw<
        { day: Date; count: bigint }[]
      >`SELECT DATE_TRUNC('day', "completedAt" AT TIME ZONE 'Europe/Istanbul') AS day, COUNT(*) AS count FROM "QuizAttempt" WHERE "quizId"=${id} AND status='COMPLETED' AND "completedAt">NOW()-INTERVAL '7 days' GROUP BY day ORDER BY day`,
      db.report.findMany({
        where: { quizId: id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, reason: true, createdAt: true },
      }),
    ],
  );
  const bars = Array.from({ length: 5 }, (_, i) =>
    Number(distribution.find((d) => d.bucket === i)?.count || 0),
  );
  const max = Math.max(...bars, 1);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow plain">CEVAPLAR NE ANLATIYOR?</span>
          <h1 className="page-title" style={{ marginTop: 10 }}>
            {quiz.title}
          </h1>
          <p className="page-subtitle">Tüm yayımlanmış sürümlerin sonuçları birlikte gösterilir.</p>
        </div>
        <Link
          className="button button-secondary button-small"
          href={`/dashboard/quizzes/${id}/edit`}
        >
          Testi düzenle
        </Link>
      </div>
      <div className="stats-grid">
        {[
          { label: "Tamamlanan", value: stats._count },
          { label: "Ortalama puan", value: `%${Math.round(stats._avg.score || 0)}` },
          { label: "En yüksek puan", value: `%${stats._max.score || 0}` },
          {
            label: "Tamamlama oranı",
            value: started ? `%${Math.round((stats._count / started) * 100)}` : "—",
          },
        ].map((s) => (
          <div className="card stat-card" key={s.label}>
            <span>{s.label}</span>
            <strong>{s.value}</strong>
            <small>
              {s.label === "Tamamlama oranı"
                ? `${started} başlatılmış katılım üzerinden`
                : "Gerçek katılım verileri"}
            </small>
          </div>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="card">
          <h2 className="card-title">Puan dağılımı</h2>
          {stats._count ? (
            <>
              <div
                className="chart-bars"
                role="img"
                aria-label={`Puan dağılımı: ${bars.map((n, i) => `${i * 20}–${i === 4 ? 100 : i * 20 + 19}: ${n} katılım`).join(", ")}`}
              >
                {bars.map((count, i) => (
                  <div className="chart-bar" key={i}>
                    <span>{count}</span>
                    <div style={{ height: `${(count / max) * 125}px` }} />
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {["0–19", "20–39", "40–59", "60–79", "80–100"].map((x) => (
                  <span key={x}>{x}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="form-note">İlk katılım tamamlanınca puan dağılımı burada görünecek.</p>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Son 7 gün</h2>
          {timeline.length ? (
            <>
              <div
                className="chart-bars"
                role="img"
                aria-label={timeline
                  .map((t) => `${formatDate(t.day)}: ${t.count} katılım`)
                  .join(", ")}
              >
                {timeline.map((t) => (
                  <div className="chart-bar" key={t.day.toISOString()}>
                    <span>{Number(t.count)}</span>
                    <div
                      style={{
                        height: `${(Number(t.count) / Math.max(...timeline.map((x) => Number(x.count)), 1)) * 125}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                {timeline.map((t) => (
                  <span key={t.day.toISOString()}>{formatDate(t.day)}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="form-note">Son 7 günde tamamlanan katılım yok.</p>
          )}
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title">Hangi sorular düşündürüyor?</h2>
        <p className="small muted">Güncel sürümdeki sorular · Yalnızca bu sürümün cevapları.</p>
        {quiz.activeVersion?.questions.map((q, i) => {
          const d = difficulty.find((d) => d.questionId === q.id);
          const percent = d ? Math.round((Number(d.correct) / Number(d.count)) * 100) : 0;
          return (
            <div className="difficulty-row" key={q.id}>
              <div className="row spread">
                <span>
                  {i + 1}. {q.text}
                </span>
                <strong style={{ whiteSpace: "nowrap" }}>
                  {d ? `%${percent}` : "Henüz cevap yok"}
                </strong>
              </div>
              <div className="progress-track">
                <span style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        }) || (
          <p className="form-note" style={{ marginTop: 15 }}>
            Soru analizi için testini yayımla.
          </p>
        )}
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="card-title">Katılımcılar ve sıralama</h2>
        {attempts.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sıra</th>
                  <th>Takma ad</th>
                  <th>Puan</th>
                  <th>Doğru</th>
                  <th>Tarih</th>
                  <th>Görünürlük</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a.id}>
                    <td>{(page - 1) * 20 + i + 1}</td>
                    <td>
                      {a.participantNickname}
                      {a.hidden && (
                        <span className="pill" style={{ marginLeft: 6 }}>
                          Gizli
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: "var(--primary)" }}>%{a.score}</strong>
                    </td>
                    <td>
                      {a.correctCount}/{a.totalQuestions}
                    </td>
                    <td>{a.completedAt ? formatDate(a.completedAt) : ""}</td>
                    <td>
                      <ModerateButton quizId={id} attemptId={a.id} hidden={a.hidden} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="form-note">
            Henüz tamamlanan katılım yok. Bağlantını arkadaşlarınla paylaş.
          </p>
        )}
        <div className="row spread" style={{ marginTop: 20 }}>
          {page > 1 ? (
            <Link className="text-link" href={`?page=${page - 1}`}>
              ← Önceki
            </Link>
          ) : (
            <span />
          )}
          {page * 20 < stats._count && (
            <Link className="text-link" href={`?page=${page + 1}`}>
              Sonraki →
            </Link>
          )}
        </div>
      </div>
      {reports.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <h2 className="card-title">İçerik bildirimleri ({quiz._count.reports})</h2>
          <p className="small muted">
            Son 10 bildirim. Gerekirse katılımı gizleyebilir veya testini arşivleyebilirsin.
          </p>
          {reports.map((r) => (
            <div className="result-review" key={r.id}>
              <p>{r.reason}</p>
              <span className="small muted">{formatDate(r.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
