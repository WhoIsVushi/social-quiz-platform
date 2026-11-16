"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Eye,
  GripVertical,
  Plus,
  Rocket,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { api } from "@/lib/api";
import { categories } from "@/lib/utils";
import { quizSchema, validatePublish, type QuizDraft } from "@/lib/validation/quiz";
import { Modal } from "@/components/ui/dialog";
import { QuizPreview } from "./preview";
const steps = ["Detaylar", "Sorular", "Kişiselleştir", "Önizleme", "Yayımla"];
export function Builder({
  initial,
  quizId,
  initialRevision = 0,
  limits,
}: {
  initial: QuizDraft;
  quizId?: string;
  initialRevision?: number;
  limits: { min: number; max: number };
}) {
  const [draft, setDraft] = useState(initial);
  const [step, setStep] = useState(0);
  const [id, setId] = useState(quizId);
  const [revision, setRevision] = useState(initialRevision);
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState("");
  const [dragged, setDragged] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  function update(patch: Partial<QuizDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
    setError("");
  }
  function question(index: number, patch: Partial<QuizDraft["questions"][number]>) {
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }));
  }
  function addQuestion() {
    if (draft.questions.length >= limits.max) return;
    update({
      questions: [
        ...draft.questions,
        {
          id: crypto.randomUUID(),
          text: "",
          correctOptionId: null,
          explanation: "",
          options: Array.from({ length: 4 }, () => ({ id: crypto.randomUUID(), text: "" })),
        },
      ],
    });
  }
  function move(from: number, to: number) {
    if (to < 0 || to >= draft.questions.length) return;
    const qs = [...draft.questions];
    const [q] = qs.splice(from, 1);
    qs.splice(to, 0, q);
    update({ questions: qs });
  }
  function duplicate(index: number) {
    const q = draft.questions[index];
    const options = q.options.map((o) => ({ ...o, id: crypto.randomUUID() }));
    update({
      questions: [
        ...draft.questions.slice(0, index + 1),
        {
          ...q,
          id: crypto.randomUUID(),
          options,
          correctOptionId: q.correctOptionId
            ? options[q.options.findIndex((o) => o.id === q.correctOptionId)].id
            : null,
        },
        ...draft.questions.slice(index + 1),
      ],
    });
  }
  async function save() {
    const parsed = quizSchema.safeParse(draft);
    if (!parsed.success) throw new Error(parsed.error.issues[0].message);
    if (id) {
      const result = await api<{ revision: number }>(`quizzes/${id}`, "PATCH", { draft, revision });
      setRevision(result.revision);
      return id;
    }
    const result = await api<{ id: string; revision: number }>("quizzes", "POST", draft);
    setId(result.id);
    setRevision(result.revision);
    window.history.replaceState(null, "", `/dashboard/quizzes/${result.id}/edit`);
    return result.id;
  }
  async function saveClick() {
    setBusy(true);
    setError("");
    try {
      await save();
      toast.success("Taslağın kaydedildi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    setBusy(true);
    setError("");
    try {
      validatePublish(draft, limits.min, limits.max);
      const savedId = await save();
      const result = await api<{ slug: string; revision: number }>(
        `quizzes/${savedId}/publish`,
        "POST",
        {},
      );
      setRevision(result.revision);
      setPublished(`${window.location.origin}/quiz/${result.slug}`);
      toast.success("Testin yayında! 🎉");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yayımlanamadı.");
    } finally {
      setBusy(false);
    }
  }
  function next() {
    setError("");
    if (
      step === 0 &&
      (!draft.title.trim() || draft.title.trim().length < 5 || draft.creatorName.trim().length < 2)
    ) {
      setError("Başlık en az 5, ismin en az 2 karakter olmalı.");
      return;
    }
    if (step === 1) {
      try {
        validatePublish(draft, limits.min, limits.max);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Soruları kontrol et.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 4));
  }
  if (published)
    return (
      <div className="card publish-success">
        <span>🎉</span>
        <h2>Hikâyen paylaşılmaya hazır!</h2>
        <p>Şimdi bağlantıyı sevdiklerine gönder. Bakalım seni en iyi kim tanıyor?</p>
        <div style={{ maxWidth: 450, margin: "auto" }}>
          <Share url={published} qr />
          <div className="row wrap" style={{ justifyContent: "center", marginTop: 25 }}>
            <Link
              href={published.replace(window.location.origin, "")}
              className="button button-primary"
            >
              Testi aç <ArrowRight size={17} />
            </Link>
            <Link href="/dashboard/quizzes" className="button button-secondary">
              Testlerime dön
            </Link>
          </div>
        </div>
      </div>
    );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow plain">BİRAZ SEN, BİRAZ MERAK</span>
          <h1 className="page-title" style={{ marginTop: 10 }}>
            {quizId ? "Testine son dokunuşlar." : "Senin hikâyen, senin soruların."}
          </h1>
        </div>
        <Button variant="secondary" size="small" disabled={busy} onClick={saveClick}>
          <Save size={15} />
          Taslağı kaydet
        </Button>
      </div>
      <div className="builder-steps" aria-label="Test oluşturma adımları">
        {steps.map((s, i) => (
          <button
            type="button"
            key={s}
            onClick={() => setStep(i)}
            className={`builder-step ${i === step ? "active" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i < step ? <Check size={15} /> : i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      {step === 0 && (
        <div className="card stack">
          <h2 className="card-title" style={{ marginBottom: 0 }}>
            Önce seni tanıyalım.
          </h2>
          <div className="builder-grid">
            <div className="field span-two">
              <label htmlFor="quiz-title">Testinin adı</label>
              <input
                id="quiz-title"
                maxLength={100}
                placeholder="Beni ne kadar iyi tanıyorsun?"
                value={draft.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div className="field span-two">
              <label htmlFor="quiz-description">Küçük bir davet (isteğe bağlı)</label>
              <textarea
                id="quiz-description"
                maxLength={500}
                placeholder="Cevapları biliyorsan gerçek bir dostsun! 💜"
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="creator-name">Görünecek ismin</label>
              <input
                id="creator-name"
                maxLength={40}
                value={draft.creatorName}
                onChange={(e) => update({ creatorName: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="category">Kategori</label>
              <select
                id="category"
                value={draft.category}
                onChange={(e) => update({ category: e.target.value as QuizDraft["category"] })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field span-two">
              <label htmlFor="visibility">Kimler görebilir?</label>
              <select
                id="visibility"
                value={draft.visibility}
                onChange={(e) => update({ visibility: e.target.value as QuizDraft["visibility"] })}
              >
                <option value="UNLISTED">Bağlantıya sahip olanlar</option>
                <option value="PUBLIC">Herkes — arama motorlarında görünebilir</option>
                <option value="PRIVATE">Yalnızca ben</option>
              </select>
            </div>
          </div>
          <p className="form-note">
            Sevdiklerin testini hesap açmadan çözebilir. E-posta adresin ve hesap bilgilerin testte
            görünmez.
          </p>
        </div>
      )}
      {step === 1 && (
        <>
          <div className="row spread wrap" style={{ marginBottom: 20 }}>
            <div>
              <h2 className="card-title" style={{ marginBottom: 6 }}>
                Seni sen yapan detaylar.
              </h2>
              <p className="small muted">
                {limits.min}–{limits.max} soru ekle. Her sorunun doğru cevabını işaretle.
              </p>
            </div>
            <span className="pill">
              {draft.questions.length} / {limits.max} soru
            </span>
          </div>
          {draft.questions.map((q, i) => (
            <article
              className="builder-question"
              key={q.id}
              draggable={dragged === i}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged !== null) move(dragged, i);
                setDragged(null);
              }}
              onDragEnd={() => setDragged(null)}
            >
              <div className="question-toolbar">
                <div className="row">
                  <span
                    draggable
                    onDragStart={() => setDragged(i)}
                    aria-hidden="true"
                    style={{ cursor: "grab" }}
                  >
                    <GripVertical size={16} className="muted" />
                  </span>
                  <strong>{i + 1}. soru</strong>
                  {q.correctOptionId && (
                    <span className="pill published">
                      <Check size={10} />
                      Doğru cevap seçildi
                    </span>
                  )}
                </div>
                <div className="row" style={{ gap: 0 }}>
                  <button
                    className="icon-button"
                    aria-label={`${i + 1}. soruyu yukarı taşı`}
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${i + 1}. soruyu aşağı taşı`}
                    disabled={i === draft.questions.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${i + 1}. soruyu çoğalt`}
                    disabled={draft.questions.length >= limits.max}
                    onClick={() => duplicate(i)}
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`${i + 1}. soruyu sil`}
                    onClick={() =>
                      update({ questions: draft.questions.filter((_, idx) => idx !== i) })
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="field">
                <label htmlFor={`q-${q.id}`}>Sorun</label>
                <input
                  id={`q-${q.id}`}
                  maxLength={300}
                  placeholder="En sevdiğim yemek hangisi?"
                  value={q.text}
                  onChange={(e) => question(i, { text: e.target.value })}
                />
              </div>
              <fieldset style={{ border: 0, padding: 0, marginTop: 13 }}>
                <legend className="small muted">
                  Cevap seçenekleri · Doğru olanı soldan işaretle
                </legend>
                {q.options.map((o, j) => (
                  <div
                    className={`answer-edit ${q.correctOptionId === o.id ? "correct" : ""}`}
                    key={o.id}
                  >
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      aria-label={`${i + 1}. soru ${String.fromCharCode(65 + j)} doğru cevap`}
                      checked={q.correctOptionId === o.id}
                      onChange={() => question(i, { correctOptionId: o.id })}
                    />
                    <input
                      aria-label={`${i + 1}. soru ${String.fromCharCode(65 + j)} seçeneği`}
                      maxLength={160}
                      placeholder={`${String.fromCharCode(65 + j)} seçeneği`}
                      value={o.text}
                      onChange={(e) =>
                        question(i, {
                          options: q.options.map((opt) =>
                            opt.id === o.id ? { ...opt, text: e.target.value } : opt,
                          ),
                        })
                      }
                    />
                    <button
                      className="icon-button"
                      aria-label={`${String.fromCharCode(65 + j)} seçeneğini sil`}
                      disabled={q.options.length <= 2}
                      onClick={() =>
                        question(i, {
                          options: q.options.filter((opt) => opt.id !== o.id),
                          correctOptionId: q.correctOptionId === o.id ? null : q.correctOptionId,
                        })
                      }
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </fieldset>
              <div className="row spread wrap" style={{ marginTop: 12 }}>
                <button
                  className="text-link"
                  disabled={q.options.length >= 6}
                  onClick={() =>
                    question(i, { options: [...q.options, { id: crypto.randomUUID(), text: "" }] })
                  }
                >
                  <Plus size={13} /> Seçenek ekle
                </button>
                <span className="small muted">{q.options.length}/6 seçenek</span>
              </div>
              <div className="field" style={{ marginTop: 16 }}>
                <label htmlFor={`explanation-${q.id}`}>Cevabın hikâyesi (isteğe bağlı)</label>
                <input
                  id={`explanation-${q.id}`}
                  maxLength={500}
                  placeholder="Sonuç ekranında gösterilecek küçük bir not…"
                  value={q.explanation}
                  onChange={(e) => question(i, { explanation: e.target.value })}
                />
              </div>
            </article>
          ))}
          <Button
            variant="secondary"
            className="full-width"
            disabled={draft.questions.length >= limits.max}
            onClick={addQuestion}
          >
            <Plus size={18} />
            Bir soru daha ekle
          </Button>
        </>
      )}
      {step === 2 && (
        <div className="card stack">
          <div>
            <h2 className="card-title">Testine kendi rengini kat.</h2>
            <span className="field-label">Renk teması</span>
            <div className="theme-options">
              {(["violet", "pink", "mint", "peach"] as const).map((c) => (
                <button
                  className={`theme-choice tone-${c} ${draft.settings.theme === c ? "active" : ""}`}
                  key={c}
                  aria-label={`${c} renk teması`}
                  aria-pressed={draft.settings.theme === c}
                  onClick={() => update({ settings: { ...draft.settings, theme: c } })}
                >
                  {draft.settings.theme === c ? "✓" : "✳"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="field-label">Kapak simgesi</span>
            <div className="theme-options">
              {["✌️", "💌", "🏡", "⚡", "🪩", "🫶"].map((emoji) => (
                <button
                  className={`theme-choice tone-violet ${draft.settings.emoji === emoji ? "active" : ""}`}
                  aria-label={`${emoji} kapak simgesi`}
                  key={emoji}
                  onClick={() => update({ settings: { ...draft.settings, emoji } })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <hr className="divider" />
          {(
            [
              {
                key: "shuffle",
                label: "Soruları karıştır",
                description: "Her katılımcı için farklı bir soru sırası.",
              },
              {
                key: "showScore",
                label: "Katılımcıya puanını göster",
                description: "Kapatırsan cevap incelemesi ve herkese açık sıralama da gizlenir.",
              },
              {
                key: "showAnswers",
                label: "Test sonunda doğru cevapları göster",
                description: "Katılımcılar tamamladığında cevapların hikâyesini de görebilir.",
              },
              {
                key: "leaderboard",
                label: "Sıralamayı göster",
                description: "Tatlı bir rekabete yer aç.",
              },
              {
                key: "allowReplay",
                label: "Yeniden çözmeye izin ver",
                description:
                  "Kapalıysa aynı tarayıcıdan tek katılım. Bu ayar kimlik doğrulaması değildir.",
              },
              {
                key: "maskNicknames",
                label: "Sıralamadaki takma adları maskele",
                description: "Yalnızca ilk harf görünür.",
              },
            ] as const
          ).map((s) => (
            <label className="check-row" key={s.key}>
              <input
                type="checkbox"
                checked={draft.settings[s.key]}
                onChange={(e) =>
                  update({ settings: { ...draft.settings, [s.key]: e.target.checked } })
                }
              />
              <span>
                {s.label}
                <small>{s.description}</small>
              </span>
            </label>
          ))}
        </div>
      )}
      {step === 3 && (
        <div className="card" style={{ textAlign: "center", padding: "40px 25px" }}>
          <Eye size={35} style={{ margin: "0 auto 20px", color: "var(--primary)" }} />
          <h2 style={{ fontSize: 25 }}>Bir de arkadaşının gözünden bak.</h2>
          <p style={{ margin: "15px auto 25px", fontSize: 13, maxWidth: 430 }}>
            Önizleme, gerçek bir katılım oluşturmaz. Soruları dene, son dokunuşlarını yap.
          </p>
          <Button variant="secondary" onClick={() => setPreview(true)}>
            <Eye size={17} />
            Önizlemeyi aç
          </Button>
        </div>
      )}
      {step === 4 && (
        <div className="card" style={{ textAlign: "center", padding: "40px 25px" }}>
          <Rocket size={40} style={{ margin: "0 auto 20px", color: "var(--primary)" }} />
          <h2 style={{ fontSize: 27 }}>Hazırsan, sahne senin.</h2>
          <p style={{ margin: "15px auto 25px", fontSize: 13, maxWidth: 440 }}>
            <strong>{draft.title}</strong>
            <br />
            {draft.questions.length} soru ·{" "}
            {draft.visibility === "PRIVATE"
              ? "Yalnızca sen görebilirsin"
              : "Arkadaşların için hazır"}
          </p>
          <p className="form-note" style={{ maxWidth: 480, margin: "0 auto 25px" }}>
            Yayımladıktan sonra düzenleyebilirsin. Önceki katılımların sonuçları yayımlandığı
            sürümle korunur.
          </p>
          <Button disabled={busy} onClick={publish}>
            <Rocket size={17} />
            {busy ? "Yayımlanıyor…" : "Testimi yayımla"}
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="error-text" style={{ marginTop: 20 }}>
          {error}
        </p>
      )}
      <div className="builder-bottom">
        <Button variant="ghost" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft size={16} />
          Geri
        </Button>
        {step < 4 && (
          <Button disabled={busy} onClick={next}>
            Devam et <ArrowRight size={16} />
          </Button>
        )}
      </div>
      <p className="small muted" style={{ textAlign: "center", marginTop: 20 }}>
        Taslağını kaydetmeden sayfadan ayrılırsan son değişikliklerin kaybolur.
      </p>
      <Modal
        open={preview}
        onOpenChange={setPreview}
        title="Arkadaşının gözünden"
        description="Bu bir önizleme. Gerçek katılım ve puan kaydı oluşturmaz."
      >
        <QuizPreview draft={draft} />
      </Modal>
    </>
  );
}
