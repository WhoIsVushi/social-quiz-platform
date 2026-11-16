import "dotenv/config";
import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import {
  createQuiz,
  saveQuiz,
  publishQuiz,
  startAttempt,
  submitAttempt,
  publicQuiz,
  loadPublished,
  ownedQuiz,
  leaderboard,
} from "@/server/quizzes";
import { draftFromTemplate, templateCatalog } from "@/features/templates/catalog";
import { quizSchema } from "@/lib/validation/quiz";
const owner = crypto.randomUUID(),
  stranger = crypto.randomUUID(),
  guest = crypto.randomUUID();
let id: string, slug: string, attemptId: string;
beforeAll(async () => {
  await db.user.create({
    data: { id: owner, name: "Integration Owner", email: `integration-${owner}@example.test` },
  });
  await db.user.create({
    data: { id: stranger, name: "Stranger", email: `integration-${stranger}@example.test` },
  });
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [owner, stranger] } } });
  await db.$disconnect();
});
describe("real PostgreSQL quiz lifecycle", () => {
  it("creates drafts and denies unrelated owners", async () => {
    const draft = quizSchema.parse(draftFromTemplate(templateCatalog[0], "Deniz"));
    const quiz = await createQuiz(owner, draft);
    id = quiz.id;
    slug = quiz.slug;
    expect(quiz.status).toBe("DRAFT");
    await expect(ownedQuiz(id, stranger)).rejects.toThrow();
    await expect(publishQuiz(id, owner)).rejects.toThrow("doğru cevabı");
  });
  it("publishes an immutable normalized version and strips secrets", async () => {
    const draft = quizSchema.parse((await ownedQuiz(id, owner)).draft);
    draft.questions.forEach((q) => (q.correctOptionId = q.options[0].id));
    await saveQuiz(id, owner, draft, 0);
    await expect(saveQuiz(id, owner, draft, 0)).rejects.toThrow("başka bir sekmede");
    await publishQuiz(id, owner);
    const quiz = await loadPublished(slug);
    expect(quiz).not.toBeNull();
    const payload = publicQuiz(quiz!, quiz!.activeVersion!);
    expect(JSON.stringify(payload)).not.toContain("isCorrect");
    expect(JSON.stringify(payload)).not.toContain("correctOptionId");
    expect(payload.questions).toHaveLength(10);
  });
  it("rejects malformed answers and commits concurrent duplicate submissions once", async () => {
    const start = await startAttempt(slug, "Misafir", guest);
    attemptId = start.attemptId;
    await expect(submitAttempt(attemptId, "wrong", [])).rejects.toThrow();
    await expect(submitAttempt(attemptId, guest, [])).rejects.toThrow();
    const version = await db.quizVersion.findFirstOrThrow({
      where: { quizId: id },
      include: { questions: { orderBy: { position: "asc" }, include: { options: true } } },
    });
    const answers = version.questions.map((q, i) => ({
      questionId: q.id,
      optionId: q.options.find((o) => o.isCorrect === i < 8)!.id,
    }));
    await Promise.all([
      submitAttempt(attemptId, guest, answers),
      submitAttempt(attemptId, guest, answers),
    ]);
    expect(await db.attemptAnswer.count({ where: { attemptId } })).toBe(10);
    expect(await db.quizAttempt.findUnique({ where: { id: attemptId } })).toMatchObject({
      score: 80,
      correctCount: 8,
      status: "COMPLETED",
    });
    const ranks = await leaderboard(slug);
    expect(ranks?.rows[0]).toMatchObject({ nickname: "Misafir", score: 80, rank: 1 });
  });
  it("preserves historical scores across republishes and honors privacy", async () => {
    const old = await db.quizAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    const quiz = await ownedQuiz(id, owner);
    const draft = quizSchema.parse(quiz.draft);
    draft.questions.forEach((q) => (q.correctOptionId = q.options[1].id));
    draft.settings.leaderboard = false;
    draft.settings.allowReplay = false;
    await saveQuiz(id, owner, draft, quiz.revision);
    await publishQuiz(id, owner);
    const after = await db.quizAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    expect(after.score).toBe(80);
    expect(after.quizVersionId).toBe(old.quizVersionId);
    expect((await ownedQuiz(id, owner)).activeVersionId).not.toBe(old.quizVersionId);
    expect(await leaderboard(slug)).toBeNull();
    await expect(startAttempt(slug, "Tekrar", guest)).rejects.toThrow("tekrar");
  });
  it("enforces private visibility and cascading account deletion", async () => {
    const quiz = await ownedQuiz(id, owner);
    const draft = quizSchema.parse(quiz.draft);
    draft.visibility = "PRIVATE";
    await saveQuiz(id, owner, draft, quiz.revision);
    await publishQuiz(id, owner);
    expect(await loadPublished(slug)).toBeNull();
    expect(await loadPublished(slug, owner)).not.toBeNull();
    await expect(startAttempt(slug, "İzinsiz", crypto.randomUUID(), stranger)).rejects.toThrow();
    await db.user.delete({ where: { id: owner } });
    expect(await db.quiz.count({ where: { id } })).toBe(0);
    expect(await db.quizAttempt.count({ where: { id: attemptId } })).toBe(0);
    expect(await db.attemptAnswer.count({ where: { attemptId } })).toBe(0);
  });
});
