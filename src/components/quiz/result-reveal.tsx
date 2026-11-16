"use client";
import { motion, useReducedMotion } from "motion/react";
export function ScoreReveal({ score }: { score: number }) {
  const reduce = useReducedMotion();
  return (
    <>
      <motion.div
        initial={reduce ? false : { scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.1, duration: 0.7 }}
        className="score-ring"
        style={{ background: `conic-gradient(var(--primary) ${score}%,var(--surface-soft) 0)` }}
      >
        <strong>
          <span>%</span>
          {score}
        </strong>
      </motion.div>
      {score >= 80 && !reduce && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 17) % 100}%`,
                background: ["#a283e6", "#eb88a8", "#e8bd72", "#86bca3"][i % 4],
                animationDelay: `${i * 0.04}s`,
                transform: `rotate(${i * 19}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
