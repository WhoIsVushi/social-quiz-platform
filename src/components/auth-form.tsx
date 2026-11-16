"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, LockKeyhole, Sparkles, Mail } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
const schema = z.object({
  name: z.string().max(40).optional(),
  email: z.email("Geçerli bir e-posta adresi yaz.").max(254),
  password: z.string().min(10, "Şifren en az 10 karakter olmalı.").max(128),
});
type Fields = z.infer<typeof schema>;
export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const titles = {
    login: "Tekrar merhaba!",
    register: "Hikâyen burada başlıyor.",
    forgot: "Şifreni mi unuttun?",
    reset: "Yeni bir başlangıç.",
  };
  const descriptions = {
    login: "Kaldığın yerden devam et. Arkadaşların seni bekliyor.",
    register: "Kendi testini oluştur, sevdiklerine meydan oku.",
    forgot: "E-posta adresini yaz, şifreni yenilemen için bir bağlantı gönderelim.",
    reset: "Hesabın için güçlü, yeni bir şifre belirle.",
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "register" && !event.currentTarget.reportValidity()) return;
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const values = form.getValues();
      if (mode === "forgot") {
        if (!z.email().safeParse(values.email).success)
          throw new Error("Geçerli bir e-posta adresi yaz.");
        const result = await authClient.requestPasswordReset({
          email: values.email,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (result.error) {
          if (result.error.status === 503)
            throw new Error(
              "E-posta hizmeti henüz yapılandırılmadı. Lütfen daha sonra tekrar dene.",
            );
          throw new Error("İşlem tamamlanamadı. Biraz sonra tekrar dene.");
        }
        setSuccess("Bu adrese bağlı bir hesap varsa yenileme bağlantısını gönderdik.");
        return;
      }
      if (mode === "reset") {
        if (values.password.length < 10 || values.password.length > 128)
          throw new Error("Şifren 10–128 karakter olmalı.");
        const token = params.get("token");
        if (!token) throw new Error("Bu bağlantı geçersiz. Yeni bir yenileme bağlantısı iste.");
        const result = await authClient.resetPassword({ newPassword: values.password, token });
        if (result.error)
          throw new Error("Bağlantının süresi dolmuş veya kullanılmış. Yeni bir bağlantı iste.");
        setSuccess("Şifren güncellendi. Yeni şifrenle giriş yapabilirsin.");
        return;
      }
      if (!(await form.trigger())) return;
      if (mode === "register" && (!values.name || values.name.trim().length < 2))
        throw new Error("Görünecek adın en az 2 karakter olmalı.");
      const result =
        mode === "register"
          ? await authClient.signUp.email({
              name: values.name!.trim(),
              email: values.email,
              password: values.password,
            })
          : await authClient.signIn.email({ email: values.email, password: values.password });
      if (result.error)
        throw new Error(
          mode === "login"
            ? "Giriş yapılamadı. Bilgilerini ve varsa e-posta doğrulamanı kontrol et."
            : "Kayıt tamamlanamadı. Bilgilerini kontrol et veya giriş yapmayı dene.",
        );
      if (mode === "register" && !result.data?.token) {
        setSuccess(
          "Hesabın oluşturuldu. Devam etmek için e-posta adresine gelen doğrulama bağlantısını aç.",
        );
        return;
      }
      const next = params.get("next");
      router.push(next?.startsWith("/dashboard") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir sorun oluştu.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-shell">
      <div className="card">
        <div className="auth-icon">
          {mode === "register" ? <Sparkles /> : mode === "forgot" ? <Mail /> : <LockKeyhole />}
        </div>
        <h1>{titles[mode]}</h1>
        <p className="page-subtitle">{descriptions[mode]}</p>
        <form onSubmit={submit} className="stack" noValidate>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Sana ne diyelim?</label>
              <input
                id="name"
                autoComplete="nickname"
                maxLength={40}
                placeholder="Görünecek adın"
                {...form.register("name")}
              />
            </div>
          )}
          {mode !== "reset" && (
            <div className="field">
              <label htmlFor="email">E-posta adresin</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="sen@ornek.com"
                {...form.register("email")}
                aria-invalid={!!form.formState.errors.email}
              />
              {form.formState.errors.email && (
                <span className="field-error">{form.formState.errors.email.message}</span>
              )}
            </div>
          )}
          {mode !== "forgot" && (
            <div className="field">
              <label htmlFor="password">{mode === "reset" ? "Yeni şifren" : "Şifren"}</label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="En az 10 karakter"
                maxLength={128}
                {...form.register("password")}
                aria-invalid={!!form.formState.errors.password}
              />
              {form.formState.errors.password && (
                <span className="field-error">{form.formState.errors.password.message}</span>
              )}
              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="text-link small"
                  style={{ justifySelf: "end" }}
                >
                  Şifremi unuttum
                </Link>
              )}
            </div>
          )}
          {mode === "register" && (
            <label className="check-row">
              <input
                type="checkbox"
                required
                aria-label="Kullanım koşullarını ve gizlilik metnini okudum"
                onChange={(e) => e.currentTarget.setCustomValidity("")}
              />
              <span className="small">
                <Link className="text-link" href="/terms">
                  Kullanım koşullarını
                </Link>{" "}
                ve{" "}
                <Link className="text-link" href="/privacy">
                  gizlilik metnini
                </Link>{" "}
                okudum.
              </span>
            </label>
          )}
          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="success-note" role="status">
              {success}
            </p>
          )}
          <Button type="submit" disabled={busy} className="full-width">
            {busy
              ? "Bir saniye…"
              : mode === "register"
                ? "Hesabımı oluştur"
                : mode === "forgot"
                  ? "Yenileme bağlantısı gönder"
                  : mode === "reset"
                    ? "Şifremi güncelle"
                    : "Giriş yap"}
            <ArrowRight size={17} />
          </Button>
        </form>
        {mode === "register" && (
          <p className="small muted" style={{ marginTop: 17 }}>
            Yalnızca bir arkadaşının testini çözeceksen hesap açmana gerek yok.
          </p>
        )}
      </div>
      <p className="auth-bottom">
        {mode === "register" ? (
          <>
            Zaten hesabın var mı? <Link href="/login">Giriş yap</Link>
          </>
        ) : mode === "login" ? (
          <>
            Henüz tanışmadık mı? <Link href="/register">Ücretsiz katıl</Link>
          </>
        ) : (
          <Link href="/login">Giriş sayfasına dön</Link>
        )}
      </p>
    </div>
  );
}
