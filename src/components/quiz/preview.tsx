"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizDraft } from "@/lib/validation/quiz";
export function QuizPreview({ draft }: { draft: QuizDraft }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const q = draft.questions[index];
  if (!q) return <p className="form-note">Önizleme için önce soru ekle.</p>;
  return (
    <div className="stack">
      <div className="small muted">
        {index + 1} / {draft.questions.length} soru
      </div>
      <h3 style={{ fontSize: 20 }}>{q.text || "Sorun burada görünecek."}</h3>
      <div className="answer-options">
        {q.options.map((o, i) => (
          <button
            key={o.id}
            className={`answer-card ${selected === o.id ? "selected" : ""}`}
            onClick={() => setSelected(o.id)}
          >
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            {o.text || "Cevap seçeneği"}
          </button>
        ))}
      </div>
      <Button
        disabled={!selected}
        onClick={() => {
          setIndex((index + 1) % draft.questions.length);
          setSelected("");
        }}
      >
        {index === draft.questions.length - 1 ? "Başa dön" : "Sonraki soru"}
      </Button>
    </div>
  );
}
