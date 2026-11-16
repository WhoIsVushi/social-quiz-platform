"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Send, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { nicknameSchema, type PublicQuiz } from "@/lib/validation/quiz";
type Active = { attemptId: string; quiz: PublicQuiz };
type Saved = { version: 1; attemptId: string; answers: Record<string, string>; index: number };
export function Player({ quiz }: { quiz: PublicQuiz }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [active, setActive] = useState<Active | null>(null);
  const [nickname, setNickname] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState("");
  const storageKey = `quiz:play:v1:${quiz.slug}`;
  useEffect(() => {
    let alive = true;
    async function recover() {
      try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return;
        const saved = JSON.parse(stored) as Saved;
        if (saved.version !== 1 || typeof saved.attemptId !== "string") return;
        const recovered = await api<Active & { status: string; nickname: string }>(
          `attempts/${saved.attemptId}`,
          "GET",
        );
        if (!alive) return;
        if (recovered.status === "COMPLETED") {
          localStorage.removeItem(storageKey);
          router.replace(`/quiz/${quiz.slug}/results/${saved.attemptId}`);
          return;
        }
        const valid: Record<string, string> = {};
        for (const q of recovered.quiz.questions) {
          if (q.options.some((o) => o.id === saved.answers?.[q.id]))
            valid[q.id] = saved.answers[q.id];
        }
        setActive(recovered);
        setNickname(recovered.nickname);
        setAnswers(valid);
        setIndex(
          Number.isInteger(saved.index)
            ? Math.max(0, Math.min(saved.index, recovered.quiz.questions.length - 1))
            : 0,
        );
      } catch {
        setError(
          "Önceki katılım yüklenemedi. Bağlantını kontrol edip sayfayı yenileyebilir veya tekrar başlayabilirsin.",
        );
      } finally {
        if (alive) setRestoring(false);
      }
    }
    recover();
    return () => {
      alive = false;
    };
  }, [storageKey, quiz.slug, router]);
  useEffect(() => {
    if (!active) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ version: 1, attemptId: active.attemptId, answers, index } satisfies Saved),
      );
    } catch {
      /* Storage is optional; the server remains authoritative. */
    }
  }, [active, answers, index, storageKey]);
  async function start(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = nicknameSchema.safeParse(nickname);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      const data = await api<Active>("attempts", "POST", {
        slug: quiz.slug,
        nickname: parsed.data,
      });
      setActive(data);
      setIndex(0);
      setAnswers({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test başlatılamadı.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!active) return;
    setBusy(true);
    setError("");
    try {
      const result = await api<{ slug: string; attemptId: string }>(
        `attempts/${active.attemptId}/submit`,
        "POST",
        {
          answers: active.quiz.questions.map((q) => ({
            questionId: q.id,
            optionId: answers[q.id],
          })),
        },
      );
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      router.push(`/quiz/${result.slug}/results/${result.attemptId}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Gönderilemedi. Cevapların bu sayfada korunuyor; tekrar deneyebilirsin.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (restoring)
    return (
      <div className="card stack" role="status">
        <div className="skeleton" style={{ height: 30, width: "60%" }} />
        <div className="skeleton" style={{ height: 200 }} />
        <span className="small muted">Testin hazırlanıyor…</span>
      </div>
    );
  if (!active)
    return (
      <div className="card quiz-landing">
        <div className={`large-emoji tone-${quiz.settings.theme}`}>{quiz.settings.emoji}</div>
        <h1>Önce sana ne diyelim?</h1>
        <p>
          Takma adın sıralamada görünebilir.
          <br />
          Gerçek adını yazmak zorunda değilsin.
        </p>
        <form onSubmit={start} className="stack" style={{ marginTop: 25, textAlign: "left" }}>
          <div className="field">
            <label htmlFor="nickname">Takma adın</label>
            <input
              id="nickname"
              placeholder="Mesela: KahveArkadaşı"
              autoComplete="off"
              value={nickname}
              minLength={2}
              maxLength={24}
              onChange={(e) => setNickname(e.target.value)}
              aria-describedby="nickname-note"
            />
            <span id="nickname-note" className="small muted">
              2–24 karakter. Hesap açmana gerek yok.
            </span>
          </div>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? "Hazırlanıyor…" : "Hadi başlayalım"}
            <ArrowRight size={18} />
          </Button>
        </form>
        <p className="quiz-note">
          <ShieldCheck size={13} style={{ display: "inline", verticalAlign: "middle" }} /> Sadece
          takma adın ve cevapların kaydedilir.
        </p>
      </div>
    );
  const question = active.quiz.questions[index];
  const last = index === active.quiz.questions.length - 1;
  return (
    <>
      <div className="play-top">
        <div className="row spread">
          <span>{active.quiz.creatorName}’i ne kadar tanıyorsun?</span>
          <strong>
            {index + 1} <span className="muted">/ {active.quiz.questions.length}</span>
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={0}
          aria-valuemax={active.quiz.questions.length}
          aria-label="Test ilerlemesi"
        >
          <span style={{ width: `${((index + 1) / active.quiz.questions.length) * 100}%` }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? {} : { opacity: 0, x: -12 }}
          transition={{ duration: 0.15 }}
          className="play-question"
        >
          <span className="question-number">{index + 1}. SORU · BAKALIM BİLECEK MİSİN?</span>
          <h1 tabIndex={-1}>{question.text}</h1>
          <div className="answer-options" role="group" aria-label="Cevap seçenekleri">
            {question.options.map((o, i) => (
              <button
                key={o.id}
                disabled={busy}
                aria-pressed={answers[question.id] === o.id}
                className={`answer-card ${answers[question.id] === o.id ? "selected" : ""}`}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [question.id]: o.id }));
                  setError("");
                }}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                {o.text}
                {answers[question.id] === o.id && <Check size={19} />}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {error && (
        <p className="error-text" role="alert" style={{ marginTop: 20 }}>
          {error}
        </p>
      )}
      <div className="play-controls">
        <Button
          variant="secondary"
          disabled={index === 0 || busy}
          onClick={() => setIndex((i) => i - 1)}
        >
          <ArrowLeft size={17} />
          Geri
        </Button>
        <Button
          disabled={
            !answers[question.id] ||
            busy ||
            (last && Object.keys(answers).length !== active.quiz.questions.length)
          }
          onClick={() => (last ? submit() : setIndex((i) => i + 1))}
        >
          {busy ? "Gönderiliyor…" : last ? "Sonucumu gör" : "Sonraki soru"}
          {last ? <Send size={16} /> : <ArrowRight size={17} />}
        </Button>
      </div>
      <p className="quiz-note">Cevapların bu tarayıcıda korunur. Rahat ol, süre sınırı yok. 💜</p>
    </>
  );
}
