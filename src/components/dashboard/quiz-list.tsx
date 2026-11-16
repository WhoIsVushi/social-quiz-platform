"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Archive, BarChart3, Copy, Pencil, Search, Share2, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Share } from "@/components/share";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
type QuizItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  emoji: string;
  count: number;
  updatedAt: string;
};
export function QuizList({ quizzes, baseUrl }: { quizzes: QuizItem[]; baseUrl: string }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [share, setShare] = useState<QuizItem | null>(null);
  const [deleting, setDeleting] = useState<QuizItem | null>(null);
  const [busy, setBusy] = useState(false);
  const items = quizzes.filter(
    (q) =>
      (status === "all" || q.status === status) &&
      q.title.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")),
  );
  async function action(q: QuizItem, type: string) {
    setBusy(true);
    try {
      const result = await api<{ id?: string }>(
        `quizzes/${q.id}${type === "delete" ? "" : `/${type}`}`,
        type === "delete" ? "DELETE" : "POST",
        {},
      );
      toast.success(
        type === "delete"
          ? "Test silindi."
          : type === "archive"
            ? "Test arşivlendi."
            : "Kopya hazır.",
      );
      setDeleting(null);
      if (type === "duplicate" && result.id) router.push(`/dashboard/quizzes/${result.id}/edit`);
      else router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "İşlem tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="explore-tools">
        <div className="search-bar">
          <Search size={18} />
          <input
            aria-label="Testlerinde ara"
            placeholder="Testlerinde ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          {[
            { id: "all", label: "Tümü" },
            { id: "PUBLISHED", label: "Yayında" },
            { id: "DRAFT", label: "Taslak" },
            { id: "ARCHIVED", label: "Arşiv" },
          ].map((s) => (
            <button
              className={`filter-chip ${status === s.id ? "active" : ""}`}
              aria-pressed={status === s.id}
              key={s.id}
              onClick={() => setStatus(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="quiz-management">
        {items.length ? (
          items.map((q) => (
            <article className="card manage-card" key={q.id}>
              <span className="quiz-row-icon">{q.emoji}</span>
              <div className="manage-info">
                <h2>
                  <Link href={`/dashboard/quizzes/${q.id}/edit`}>{q.title}</Link>
                </h2>
                <p>
                  <span className={`pill ${q.status === "PUBLISHED" ? "published" : "draft"}`}>
                    {q.status === "PUBLISHED"
                      ? "Yayında"
                      : q.status === "ARCHIVED"
                        ? "Arşiv"
                        : "Taslak"}
                  </span>{" "}
                  · {q.count} katılım · {formatDate(q.updatedAt)}
                </p>
              </div>
              <div className="manage-actions">
                <Link
                  className="icon-button"
                  href={`/dashboard/quizzes/${q.id}/edit`}
                  aria-label="Testi düzenle"
                >
                  <Pencil size={16} />
                </Link>
                <Link
                  className="icon-button"
                  href={`/dashboard/quizzes/${q.id}/analytics`}
                  aria-label="İstatistikleri gör"
                >
                  <BarChart3 size={16} />
                </Link>
                {q.status === "PUBLISHED" && (
                  <button
                    className="icon-button"
                    aria-label="Testi paylaş"
                    onClick={() => setShare(q)}
                  >
                    <Share2 size={16} />
                  </button>
                )}
                <button
                  className="icon-button"
                  disabled={busy}
                  aria-label="Testi çoğalt"
                  onClick={() => action(q, "duplicate")}
                >
                  <Copy size={16} />
                </button>
                {q.status !== "ARCHIVED" && (
                  <button
                    className="icon-button"
                    disabled={busy}
                    aria-label="Testi arşivle"
                    onClick={() => action(q, "archive")}
                  >
                    <Archive size={16} />
                  </button>
                )}
                <button
                  className="icon-button"
                  disabled={busy}
                  aria-label="Testi sil"
                  onClick={() => setDeleting(q)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="card empty-state">
            <Layers size={34} />
            <h2>{quizzes.length ? "Bir eşleşme bulamadık." : "Henüz bir testin yok."}</h2>
            <p>
              {quizzes.length
                ? "Başka bir arama ya da filtre deneyebilirsin."
                : "İlk testini oluşturup arkadaşlarına küçük bir sürpriz yap."}
            </p>
            <Link href="/dashboard/quizzes/new" className="button button-primary">
              Test oluştur
            </Link>
          </div>
        )}
      </div>
      <Modal
        open={!!share}
        onOpenChange={() => setShare(null)}
        title="Bir link, bir sürü merak."
        description="Bağlantıyı sevdiklerine gönder."
      >
        {share && <Share url={`${baseUrl}/quiz/${share.slug}`} qr />}
      </Modal>
      <Modal
        open={!!deleting}
        onOpenChange={() => setDeleting(null)}
        title="Bu testi silmek istiyor musun?"
        description="Testin, tüm sürümleri ve katılımcı sonuçları kalıcı olarak silinir. Bu işlem geri alınamaz."
      >
        <div className="row" style={{ justifyContent: "end" }}>
          <Button variant="secondary" disabled={busy} onClick={() => setDeleting(null)}>
            Vazgeç
          </Button>
          <Button
            variant="danger"
            disabled={busy}
            onClick={() => deleting && action(deleting, "delete")}
          >
            {busy ? "Siliniyor…" : "Evet, testi sil"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
