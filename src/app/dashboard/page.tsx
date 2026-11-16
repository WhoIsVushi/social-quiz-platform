import Link from "next/link";
import { ArrowUpRight, BarChart3, Layers, Plus, Sparkles, Users, Activity } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { dashboardStats } from "@/server/analytics";
import { formatDate } from "@/lib/utils";
export const metadata = { title: "Panelim" };
export default async function Page() {
  const session = await requireSession();
  const stats = await dashboardStats(session.user.id);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow plain">SENİN KÜÇÜK DOSTLUK EVRENİN</span>
          <h1 className="page-title" style={{ marginTop: 10 }}>
            Merhaba, {session.user.name.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">Biraz merak, biraz rekabet. Bugün kim seni şaşırtacak?</p>
        </div>
        <Link href="/dashboard/quizzes/new" className="button button-primary button-small">
          <Plus size={16} />
          Yeni test
        </Link>
      </div>
      <div className="stats-grid">
        {[
          { label: "Toplam test", value: stats.quizCount, icon: Layers, note: "Senin hikâyelerin" },
          {
            label: "Tamamlanan katılım",
            value: stats.completed,
            icon: Activity,
            note: "Tüm testlerinde",
          },
          {
            label: "Farklı takma ad",
            value: stats.nicknames,
            icon: Users,
            note: "Yaklaşık · Doğrulanmış kişi sayısı değil",
          },
          {
            label: "Ortalama puan",
            value: `%${stats.average}`,
            icon: BarChart3,
            note: `En yüksek puan: %${stats.highest}`,
          },
        ].map((s) => (
          <div className="card stat-card" key={s.label}>
            <span>
              {s.label}
              <s.icon size={16} />
            </span>
            <strong>{s.value}</strong>
            <small>{s.note}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-columns">
        <div className="card">
          <div className="row spread" style={{ marginBottom: 15 }}>
            <h2 className="card-title" style={{ marginBottom: 0 }}>
              Testlerin
            </h2>
            <Link href="/dashboard/quizzes" className="text-link">
              Tümünü gör <ArrowUpRight size={14} />
            </Link>
          </div>
          {stats.quizzes.length ? (
            stats.quizzes.map((q) => (
              <div className="quiz-row" key={q.id}>
                <span className="quiz-row-icon">
                  {(q.draft as { settings?: { emoji?: string } }).settings?.emoji || "✌️"}
                </span>
                <div>
                  <Link href={`/dashboard/quizzes/${q.id}/edit`}>
                    <h3>{q.title}</h3>
                  </Link>
                  <p>
                    {q._count.attempts} katılım · {formatDate(q.updatedAt)}{" "}
                    <span
                      className={`pill ${q.status === "PUBLISHED" ? "published" : "draft"}`}
                      style={{ marginLeft: 4 }}
                    >
                      {q.status === "PUBLISHED"
                        ? "Yayında"
                        : q.status === "ARCHIVED"
                          ? "Arşiv"
                          : "Taslak"}
                    </span>
                  </p>
                </div>
                <Link
                  className="icon-button"
                  href={`/dashboard/quizzes/${q.id}/analytics`}
                  aria-label={`${q.title} istatistikleri`}
                >
                  <ArrowUpRight size={17} />
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Sparkles size={34} />
              <h2>İlk hikâyenle başlayalım.</h2>
              <p>Bir şablon seç, kendinden birkaç detay ekle. Gerisi sevdiklerine kalsın.</p>
              <Link className="button button-primary button-small" href="/explore">
                Şablonları keşfet
              </Link>
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="card-title">Son haberler</h2>
          {stats.recent.length ? (
            stats.recent.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="mini-avatar">{a.participantNickname[0]}</div>
                <div>
                  <strong>{a.participantNickname} testini çözdü</strong>
                  <p>
                    {a.completedAt ? formatDate(a.completedAt) : ""} ·{" "}
                    <Link href={`/dashboard/quizzes/${a.quiz.id}/analytics`}>
                      {a.quiz.title.slice(0, 28)}
                    </Link>
                  </p>
                </div>
                <span className="activity-score">%{a.score}</span>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Users size={30} />
              <h2 style={{ fontSize: 20 }}>Burası birazdan şenlenir.</h2>
              <p>Testini yayımlayıp paylaşınca arkadaşlarının sonuçlarını burada göreceksin.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
