"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth/client";
export function AccountSettings() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  return (
    <div className="stack" style={{ maxWidth: 650 }}>
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const result = await authClient.changePassword({
              currentPassword: current,
              newPassword: next,
              revokeOtherSessions: true,
            });
            if (result.error)
              throw new Error("Şifren güncellenemedi. Mevcut şifreni ve yeni şifreni kontrol et.");
            setCurrent("");
            setNext("");
            toast.success("Şifren güncellendi. Diğer oturumlar kapatıldı.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <h2 className="card-title" style={{ marginBottom: 0 }}>
          Hesabını güvende tut.
        </h2>
        <div className="field">
          <label htmlFor="current-password">Mevcut şifren</label>
          <input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="next-password">Yeni şifren</label>
          <input
            id="next-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={128}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
        </div>
        <Button disabled={busy} type="submit" style={{ justifySelf: "start" }}>
          Şifremi güncelle
        </Button>
      </form>
      <div className="card">
        <h2 className="card-title">Gizlilik, senin kontrolünde.</h2>
        <p className="small muted">
          Her testin görünürlüğünü ve sonuç paylaşımını kendi editöründen ayarlayabilirsin. İsteğe
          bağlı takip araçları kullanmıyoruz. Katılım kayıtları varsayılan olarak 365 gün saklanır.
        </p>
        <div className="row wrap" style={{ marginTop: 20 }}>
          <Link className="text-link" href="/dashboard/quizzes">
            Testlerimi yönet →
          </Link>
          <Link className="text-link" href="/privacy">
            Gizlilik metni →
          </Link>
        </div>
      </div>
      <div className="card" style={{ borderColor: "var(--error)" }}>
        <h2 className="card-title">Vedalaşmak istersen.</h2>
        <p className="small muted">
          Hesabını sildiğinde oluşturduğun tüm testler, sürümler, katılımlar ve oturumlar da
          silinir. Bu işlem geri alınamaz.
        </p>
        <Button
          variant="danger"
          size="small"
          onClick={() => setDeleting(true)}
          style={{ marginTop: 20 }}
        >
          Hesabımı sil
        </Button>
      </div>
      <Modal
        open={deleting}
        onOpenChange={setDeleting}
        title="Hesabın kalıcı olarak silinecek."
        description="Tüm testlerin ve sonuçların da silinir. Devam etmek için şifreni gir."
      >
        <form
          className="stack"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const result = await authClient.deleteUser({ password: confirmPassword });
              if (result.error)
                throw new Error(
                  "Hesap silinemedi. Şifreni kontrol et; gerekirse yeniden giriş yap.",
                );
              toast.success("Hesabın ve ilişkili verilerin silindi.");
              router.push("/");
              router.refresh();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Hesap silinemedi.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="field">
            <label htmlFor="delete-password">Şifren</label>
            <input
              id="delete-password"
              type="password"
              required
              autoComplete="current-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="row" style={{ justifyContent: "end" }}>
            <Button
              variant="secondary"
              type="button"
              disabled={busy}
              onClick={() => setDeleting(false)}
            >
              Vazgeç
            </Button>
            <Button variant="danger" type="submit" disabled={busy}>
              {busy ? "Siliniyor…" : "Kalıcı olarak sil"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
