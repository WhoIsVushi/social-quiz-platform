export type ScoringQuestion = { id: string; options: { id: string; isCorrect: boolean }[] };
export function scoreAnswers(
  questions: ScoringQuestion[],
  answers: { questionId: string; optionId: string }[],
) {
  if (
    !questions.length ||
    answers.length !== questions.length ||
    new Set(answers.map((a) => a.questionId)).size !== questions.length
  )
    throw new Error("Tüm sorulara birer cevap vermelisin.");
  const rows = answers.map((a) => {
    const question = questions.find((q) => q.id === a.questionId);
    const option = question?.options.find((o) => o.id === a.optionId);
    if (!question || !option) throw new Error("Geçersiz soru veya cevap.");
    return { questionId: question.id, selectedOptionId: option.id, isCorrect: option.isCorrect };
  });
  const correctCount = rows.filter((r) => r.isCorrect).length;
  return {
    score: Math.round((correctCount / questions.length) * 100),
    correctCount,
    totalQuestions: questions.length,
    answers: rows,
  };
}
export const leaderboardOrder = [
  { score: "desc" },
  { correctCount: "desc" },
  { completedAt: "asc" },
  { id: "asc" },
] as const;
export function compareRank(
  a: { score: number; correctCount: number; completedAt: Date; id: string },
  b: typeof a,
) {
  return (
    b.score - a.score ||
    b.correctCount - a.correctCount ||
    a.completedAt.getTime() - b.completedAt.getTime() ||
    a.id.localeCompare(b.id)
  );
}
export function publicNickname(name: string, mask: boolean) {
  return mask
    ? `${Array.from(name)[0]}${"•".repeat(Math.min(Array.from(name).length - 1, 8))}`
    : name;
}
