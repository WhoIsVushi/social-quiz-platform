import { describe, it, expect } from "vitest";
import { scoreAnswers, compareRank, publicNickname } from "@/features/quiz/scoring";
import { nicknameSchema, quizSchema, validatePublish } from "@/lib/validation/quiz";
import { templateCatalog, draftFromTemplate } from "@/features/templates/catalog";
import { slugify, resultMessage } from "@/lib/utils";
const questions = Array.from({ length: 3 }, (_, i) => ({
  id: `q${i}`,
  options: [
    { id: `a${i}`, isCorrect: true },
    { id: `b${i}`, isCorrect: false },
  ],
}));
describe("authoritative scoring", () => {
  it("rounds percentages deterministically", () => {
    expect(
      scoreAnswers(
        questions,
        questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id })),
      ),
    ).toMatchObject({ score: 100, correctCount: 3 });
    expect(
      scoreAnswers(
        questions,
        questions.map((q, i) => ({ questionId: q.id, optionId: q.options[i === 0 ? 0 : 1].id })),
      ),
    ).toMatchObject({ score: 33, correctCount: 1 });
  });
  it("rejects missing, duplicate, foreign questions and mismatched options", () => {
    const valid = questions.map((q) => ({ questionId: q.id, optionId: q.options[0].id }));
    expect(() => scoreAnswers(questions, valid.slice(1))).toThrow();
    expect(() => scoreAnswers(questions, [valid[0], valid[0], valid[2]])).toThrow();
    expect(() =>
      scoreAnswers(questions, [{ questionId: "unknown", optionId: "a0" }, ...valid.slice(1)]),
    ).toThrow();
    expect(() =>
      scoreAnswers(questions, [{ questionId: "q0", optionId: "a1" }, ...valid.slice(1)]),
    ).toThrow();
    expect(() => scoreAnswers([], [])).toThrow();
  });
});
describe("quiz integrity", () => {
  function draft() {
    return quizSchema.parse(draftFromTemplate(templateCatalog[0], "Deniz"));
  }
  it("templates never presume a correct answer", () => {
    for (const t of templateCatalog)
      expect(draftFromTemplate(t, "Deniz").questions.every((q) => q.correctOptionId === null)).toBe(
        true,
      );
    expect(() => validatePublish(draft())).toThrow("doğru cevabı");
  });
  it("requires configured question bounds", () => {
    const d = draft();
    d.questions = d.questions.map((q) => ({ ...q, correctOptionId: q.options[0].id }));
    expect(validatePublish(d).questions).toHaveLength(10);
    expect(() => validatePublish({ ...d, questions: d.questions.slice(0, 4) })).toThrow();
  });
  it("rejects duplicate identifiers and foreign correct answers", () => {
    const d = draft();
    d.questions[1].id = d.questions[0].id;
    expect(quizSchema.safeParse(d).success).toBe(false);
    const second = draft();
    second.questions[0].correctOptionId = "foreign";
    expect(quizSchema.safeParse(second).success).toBe(false);
  });
  it("retains the explicit editor ordering", () => {
    const d = draft();
    d.questions.reverse();
    expect(quizSchema.parse(d).questions.map((q) => q.id)).toEqual(d.questions.map((q) => q.id));
  });
  it("accepts Turkish nicknames and rejects oversized and unsafe input", () => {
    expect(nicknameSchema.safeParse("Çağrı Şen").success).toBe(true);
    expect(nicknameSchema.safeParse("<script>").success).toBe(false);
    expect(nicknameSchema.safeParse("a".repeat(25)).success).toBe(false);
  });
});
describe("sharing and ranking", () => {
  it("creates URL-safe Turkish slugs", () => {
    expect(slugify("Çağrı’yı İyi Tanıyor musun? 🎉")).toBe("cagri-yi-iyi-taniyor-musun");
    expect(slugify("🎉")).toBe("test");
  });
  it("uses score, correct count, completion time, then deterministic ID", () => {
    const a = { id: "a", score: 80, correctCount: 8, completedAt: new Date(1000) };
    expect(compareRank(a, { ...a, score: 60 })).toBeLessThan(0);
    expect(compareRank(a, { ...a, correctCount: 7 })).toBeLessThan(0);
    expect(compareRank(a, { ...a, completedAt: new Date(2000) })).toBeLessThan(0);
    expect(compareRank(a, { ...a, id: "b" })).toBeLessThan(0);
  });
  it("masks names and maps all score boundaries", () => {
    expect(publicNickname("Çağrı", true)).toBe("Ç••••");
    expect(publicNickname("Çağrı", false)).toBe("Çağrı");
    expect(resultMessage(20)).toContain("tanışmanız");
    expect(resultMessage(21)).toContain("Fena");
    expect(resultMessage(100)).toContain("ezbere");
  });
});
