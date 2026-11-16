"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
export function HomePreview() {
  const [selected, setSelected] = useState<number | null>(null);
  const reduce = useReducedMotion();
  return (
    <div className="hero-visual" aria-label="Etkileşimli örnek soru">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="floating-symbol symbol-flower">✳</div>
      <div className="floating-symbol symbol-spark">✦</div>
      <motion.div
        className="floating-note"
        animate={reduce ? {} : { y: [0, -7, 0], rotate: [-7, -5, -7] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <span>💜</span> Dostluk seviyesi: <strong>çok iyi!</strong>
      </motion.div>
      <motion.div
        className="preview-back"
        animate={reduce ? {} : { rotate: [9, 11, 9] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <div className="preview-card">
        <div className="preview-top">
          <span className="mini-avatar">D</span>
          <div>
            <strong>Deniz’i ne kadar tanıyorsun?</strong>
            <span>Örnek test · Sadece denemek için</span>
          </div>
          <span className="preview-counter">
            01<span>/10</span>
          </span>
        </div>
        <div className="progress-track">
          <span style={{ width: selected === null ? "10%" : "20%" }} />
        </div>
        <div className="preview-question">
          <span className="question-emoji">☕</span>
          <h2>
            Benim için mükemmel bir
            <br />
            pazar günü nasıl başlar?
          </h2>
          <p>Beni tanıyorsan, bunu biliyorsun. 👀</p>
        </div>
        <div className="preview-options">
          {[
            "Kahve ve uzun bir sohbet",
            "Biraz daha uyuyarak",
            "Yeni bir yer keşfederek",
            "Güzel bir kahvaltıyla",
          ].map((text, i) => (
            <button
              className={`preview-option ${selected === i ? "selected" : ""}`}
              onClick={() => setSelected(i)}
              key={text}
            >
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              {text}
              {selected === i && <Check size={18} />}
            </button>
          ))}
        </div>
        <div className="preview-bottom">
          <span>
            <Sparkles size={13} /> Her cevap bir keşif.
          </span>
          <button
            className="preview-next"
            aria-label="Örnek soruyu sıfırla"
            onClick={() => setSelected(null)}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <div className="floating-result">
        <span>🏆</span>
        <div>
          <strong>{selected === null ? "Sıra sende!" : "Güzel seçim!"}</strong>
          <span>
            {selected === null
              ? "Bakalım kim seni ezbere biliyor?"
              : "Kendi testinde doğru cevabı sen seç."}
          </span>
        </div>
      </div>
      <span className="handwritten">Bence bunu biliyorsun! ↗</span>
    </div>
  );
}
