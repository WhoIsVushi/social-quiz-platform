export const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
export const quizLimits = {
  min: Math.max(5, Number(process.env.MIN_QUIZ_QUESTIONS) || 5),
  max: Math.min(30, Number(process.env.MAX_QUIZ_QUESTIONS) || 30),
};
