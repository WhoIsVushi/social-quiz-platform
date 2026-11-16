"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
export function ProfileForm({
  initialName,
  email,
  initialImage,
}: {
  initialName: string;
  email: string;
  initialImage: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(
    initialImage?.startsWith("emoji:") ? initialImage : "emoji:💜",
  );
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="card stack"
      style={{ maxWidth: 600 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("profile", "PATCH", { name, image });
          toast.success("Profilin güncellendi.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Kaydedilemedi.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="row">
        <div className="profile-avatar">{image.slice(6)}</div>
        <div>
          <h2 className="card-title" style={{ marginBottom: 5 }}>
            Biraz daha sen.
          </h2>
          <p className="small muted">Seni anlatan bir simge seç.</p>
        </div>
      </div>
      <div className="avatar-options">
        {["💜", "🌻", "🪩", "✌️", "🌙", "⚡"].map((emoji) => (
          <button
            type="button"
            key={emoji}
            aria-label={`${emoji} profil simgesi`}
            aria-pressed={image === `emoji:${emoji}`}
            className={image === `emoji:${emoji}` ? "active" : ""}
            onClick={() => setImage(`emoji:${emoji}`)}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="field">
        <label htmlFor="profile-name">Görünecek adın</label>
        <input
          id="profile-name"
          minLength={2}
          maxLength={40}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="profile-email">E-posta adresin</label>
        <input id="profile-email" value={email} readOnly />
        <span className="small muted">E-posta adresin katılımcılarla paylaşılmaz.</span>
      </div>
      <p className="form-note">
        Profilindeki isim değişikliği, daha önce yayımladığın testlerin üzerindeki ismi değiştirmez.
        Onları test editöründen güncelleyebilirsin.
      </p>
      <Button type="submit" disabled={busy} style={{ justifySelf: "start" }}>
        {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
      </Button>
    </form>
  );
}
