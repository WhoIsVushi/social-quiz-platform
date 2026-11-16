import { z } from "zod";
export const optionSchema = z.object({
  id: z.string().min(1).max(100),
  text: z.string().trim().min(1, "Cevap boş olamaz.").max(160),
});
export const questionSchema = z
  .object({
    id: z.string().min(1).max(100),
    text: z.string().trim().min(3, "Sorunu biraz daha açık yaz.").max(300),
    options: z.array(optionSchema).min(2).max(6),
    correctOptionId: z.string().nullable(),
    explanation: z.string().max(500).default(""),
  })
  .superRefine((q, ctx) => {
    if (new Set(q.options.map((o) => o.id)).size !== q.options.length)
      ctx.addIssue({ code: "custom", message: "Cevap kimlikleri benzersiz olmalı." });
    if (q.correctOptionId !== null && !q.options.some((o) => o.id === q.correctOptionId))
      ctx.addIssue({ code: "custom", message: "Geçerli bir doğru cevap seç." });
  });
export const settingsSchema = z.object({
  theme: z.enum(["violet", "pink", "mint", "peach"]).default("violet"),
  emoji: z.string().max(12).default("✌️"),
  shuffle: z.boolean().default(false),
  showScore: z.boolean().default(true),
  showAnswers: z.boolean().default(true),
  leaderboard: z.boolean().default(true),
  allowReplay: z.boolean().default(true),
  maskNicknames: z.boolean().default(false),
});
export const quizSchema = z
  .object({
    title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı.").max(100),
    description: z.string().trim().max(500).default(""),
    creatorName: z.string().trim().min(2, "İsmini yaz.").max(40),
    category: z.enum(["friends", "relationships", "family", "fun"]),
    visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]).default("UNLISTED"),
    settings: settingsSchema,
    questions: z.array(questionSchema).max(30),
  })
  .superRefine((q, ctx) => {
    const ids = q.questions.flatMap((x) => [x.id, ...x.options.map((o) => o.id)]);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "Soru ve cevap kimlikleri benzersiz olmalı." });
  });
export type QuizDraft = z.infer<typeof quizSchema>;
export type QuizSettings = z.infer<typeof settingsSchema>;
export type PublicQuestion = { id: string; text: string; options: { id: string; text: string }[] };
export type PublicQuiz = {
  id: string;
  slug: string;
  title: string;
  description: string;
  creatorName: string;
  category: string;
  settings: QuizSettings;
  questions: PublicQuestion[];
};
export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "Takma ad en az 2 karakter olmalı.")
  .max(24, "Takma ad en fazla 24 karakter olabilir.")
  .regex(/^[\p{L}\p{N} _.'-]+$/u, "Takma adında harf, rakam ve boşluk kullanabilirsin.");
export const submissionSchema = z.object({
  answers: z
    .array(z.object({ questionId: z.string().max(100), optionId: z.string().max(100) }))
    .min(1)
    .max(30),
});
export function validatePublish(draft: QuizDraft, min = 5, max = 30) {
  const data = quizSchema.parse(draft);
  if (data.questions.length < min || data.questions.length > max)
    throw new Error(`Testin ${min}–${max} soru içermeli.`);
  if (data.questions.some((q) => !q.correctOptionId))
    throw new Error("Her soru için doğru cevabı seç.");
  return data;
}
