import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { draftFromTemplate, templateCatalog } from "../../src/features/templates/catalog";
import { quizSchema } from "../../src/lib/validation/quiz";
const db = new PrismaClient();
const email = `e2e-${crypto.randomUUID()}@example.test`;
const password = `T-${crypto.randomUUID()}!`;
const origin = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
let quizId = "",
  quizSlug = "",
  attemptId = "";
test.afterAll(async () => {
  await db.user.deleteMany({ where: { email } });
  await db.$disconnect();
});
test("register → create → publish → share → guest play → results → owner analytics", async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Seni en iyi/ })).toBeVisible();
  await page.goto("/register");
  await page.getByLabel("Sana ne diyelim?").fill("Deniz");
  await page.getByLabel("E-posta adresin", { exact: true }).fill(email);
  await page.getByLabel("Şifren", { exact: true }).fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Hesabımı oluştur" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/quizzes/new?template=arkadaslarin-seni-ne-kadar-taniyor");
  await page.getByLabel("Testinin adı").fill("Deniz hakkında arkadaşlık testi");
  await page.getByRole("button", { name: "Devam et" }).click();
  for (let i = 1; i <= 10; i++)
    await page.getByRole("radio", { name: `${i}. soru A doğru cevap`, exact: true }).check();
  await page.getByRole("button", { name: "Devam et" }).click();
  await page.getByRole("button", { name: "Devam et" }).click();
  await page.getByRole("button", { name: "Önizlemeyi aç" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Kapat", exact: true }).click();
  await page.getByRole("button", { name: "Devam et" }).click();
  await page.getByRole("button", { name: "Testimi yayımla" }).click();
  await expect(page.getByRole("heading", { name: "Hikâyen paylaşılmaya hazır!" })).toBeVisible();
  const shareUrl = await page.getByLabel("Paylaşım bağlantısı").inputValue();
  quizSlug = new URL(shareUrl).pathname.split("/").pop()!;
  quizId = (await db.quiz.findUniqueOrThrow({ where: { slug: quizSlug } })).id;
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Bağlantıyı kopyala" }).click();
  await expect(page.getByText("Bağlantı kopyalandı!")).toBeVisible();
  const guest = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const guestPage = await guest.newPage();
  try {
    await guestPage.goto(shareUrl);
    await expect(
      guestPage.getByRole("heading", { name: "Deniz hakkında arkadaşlık testi" }),
    ).toBeVisible();
    const html = await guestPage.content();
    expect(html).not.toContain('"isCorrect"');
    expect(html).not.toContain('"correctOptionId"');
    await guestPage.getByRole("link", { name: "Meydan okumayı kabul et" }).click();
    await guestPage.getByLabel("Takma adın").fill("Çağrı");
    await guestPage.getByRole("button", { name: "Hadi başlayalım" }).click();
    for (let i = 0; i < 10; i++) {
      const options = guestPage
        .getByRole("group", { name: "Cevap seçenekleri" })
        .getByRole("button");
      await options.nth(i < 8 ? 0 : 1).click();
      if (i === 2) {
        await guestPage.reload();
        await expect(
          guestPage.getByRole("group", { name: "Cevap seçenekleri" }).getByRole("button").first(),
        ).toHaveAttribute("aria-pressed", "true");
      }
      await guestPage
        .getByRole("button", { name: i === 9 ? "Sonucumu gör" : "Sonraki soru", exact: true })
        .click();
    }
    await expect(guestPage).toHaveURL(/\/results\//);
    attemptId = guestPage.url().split("/").pop()!;
    await expect(
      guestPage.getByRole("heading", { name: "Gerçekten iyi tanıyorsun! 💜", exact: true }),
    ).toBeVisible();
    await expect(guestPage.locator(".score-ring")).toHaveText("%80");
    await guestPage.getByRole("link", { name: "Sıralama", exact: true }).click();
    await expect(guestPage.getByText("Çağrı", { exact: true })).toBeVisible();
    await expect(guestPage.getByText("%80", { exact: true })).toBeVisible();
    expect(
      await guestPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const response = await guest.request.post(`/api/v1/attempts/${attemptId}/submit`, {
      headers: { Origin: origin },
      data: { answers: [{ questionId: "ignored-duplicate", optionId: "ignored" }], score: 100 },
    });
    expect(response.ok()).toBe(true);
    expect((await db.quizAttempt.findUniqueOrThrow({ where: { id: attemptId } })).score).toBe(80);
    await page.goto(`/dashboard/quizzes/${quizId}/analytics`);
    await expect(page.getByRole("cell", { name: "Çağrı", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "%80", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Sıralamadan gizle" }).click();
    await expect(page.getByText("Katılım sıralamadan gizlendi.")).toBeVisible();
    await guestPage.reload();
    await expect(guestPage.getByText("Çağrı", { exact: true })).not.toBeVisible();
    const outsider = await browser.newContext();
    try {
      const forbidden = await outsider.request.get(`/quiz/${quizSlug}/results/${attemptId}`);
      expect(await forbidden.text()).toContain("Burada bir test bulamadık.");
      const deniedAttempt = await outsider.request.get(`/api/v1/attempts/${attemptId}`);
      expect(deniedAttempt.status()).toBe(404);
      const edit = await outsider.request.patch(`/api/v1/quizzes/${quizId}`, {
        headers: { Origin: origin },
        data: {},
      });
      expect(edit.status()).toBe(401);
      const csrf = await guest.request.post(`/api/v1/attempts/${attemptId}/submit`, {
        headers: { Origin: "https://evil.example" },
        data: { answers: [] },
      });
      expect(csrf.status()).toBe(403);
    } finally {
      await outsider.close();
    }
    await page.getByRole("button", { name: "Çıkış yap", exact: true }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/login");
    await page.getByLabel("E-posta adresin", { exact: true }).fill(email);
    await page.getByLabel("Şifren", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Giriş yap", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    expect(errors).toEqual([]);
  } finally {
    await guest.close();
  }
});
test("mobile pages fit narrow screens and theme switches", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of ["/", "/explore", "/templates/arkadaslarin-seni-ne-kadar-taniyor", "/login"]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      path,
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Renk temasını değiştir" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Renk temasını değiştir" }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
});
test("API authorization, invalid answers, privacy and account deletion", async ({ playwright }) => {
  const strangerEmail = `e2e-security-${crypto.randomUUID()}@example.test`;
  const unrelatedOwnerId = crypto.randomUUID();
  const stranger = await playwright.request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
  });
  const guest = await playwright.request.newContext({
    baseURL: origin,
    extraHTTPHeaders: { Origin: origin },
  });
  try {
    const signup = await stranger.post("/api/auth/sign-up/email", {
      data: { email: strangerEmail, password, name: "Ece" },
    });
    expect(signup.ok()).toBe(true);
    const starterDraft = quizSchema.parse(draftFromTemplate(templateCatalog[0], "Ece"));
    starterDraft.questions.forEach((q) => {
      q.correctOptionId = q.options[0].id;
    });
    const baseCreated = await stranger.post("/api/v1/quizzes", { data: starterDraft });
    expect(baseCreated.ok()).toBe(true);
    const baseQuiz = await baseCreated.json();
    const basePublished = await stranger.post(`/api/v1/quizzes/${baseQuiz.id}/publish`, {
      data: {},
    });
    expect(basePublished.ok()).toBe(true);
    const quizSlug = (await basePublished.json()).slug as string;
    await db.user.create({
      data: {
        id: unrelatedOwnerId,
        email: `e2e-owner-${unrelatedOwnerId}@example.test`,
        name: "Other owner",
      },
    });
    const unrelatedQuiz = await db.quiz.create({
      data: {
        ownerId: unrelatedOwnerId,
        title: starterDraft.title,
        description: starterDraft.description,
        creatorName: starterDraft.creatorName,
        category: starterDraft.category,
        slug: `authorization-${crypto.randomUUID()}`,
        draft: starterDraft,
      },
    });
    const quizId = unrelatedQuiz.id;
    const forbidden = await stranger.patch(`/api/v1/quizzes/${quizId}`, {
      data: { draft: {}, revision: 0 },
    });
    expect(forbidden.status()).toBe(404);
    const forbiddenPublish = await stranger.post(`/api/v1/quizzes/${quizId}/publish`, { data: {} });
    expect(forbiddenPublish.status()).toBe(404);
    const badNickname = await guest.post("/api/v1/attempts", {
      data: { slug: quizSlug, nickname: "<script>" },
    });
    expect(badNickname.status()).toBe(400);
    const start = await guest.post("/api/v1/attempts", {
      data: { slug: quizSlug, nickname: "TestMisafiri" },
    });
    expect(start.ok()).toBe(true);
    const active = await start.json();
    expect(JSON.stringify(active)).not.toContain("isCorrect");
    const duplicate = Array.from({ length: 10 }, () => ({
      questionId: active.quiz.questions[0].id,
      optionId: active.quiz.questions[0].options[0].id,
    }));
    expect(
      (
        await guest.post(`/api/v1/attempts/${active.attemptId}/submit`, {
          data: { answers: duplicate },
        })
      ).status(),
    ).toBe(400);
    const valid = active.quiz.questions.map((q: { id: string; options: { id: string }[] }) => ({
      questionId: q.id,
      optionId: q.options[0].id,
    }));
    const forged = [...valid];
    forged[0] = { ...forged[0], optionId: active.quiz.questions[1].options[0].id };
    expect(
      (
        await guest.post(`/api/v1/attempts/${active.attemptId}/submit`, {
          data: { answers: forged },
        })
      ).status(),
    ).toBe(400);
    expect(
      (
        await guest.post(`/api/v1/attempts/${active.attemptId}/submit`, {
          data: { answers: valid, score: 0 },
        })
      ).ok(),
    ).toBe(true);
    expect(
      (await db.quizAttempt.findUniqueOrThrow({ where: { id: active.attemptId } })).score,
    ).toBe(100);
    const draft = quizSchema.parse(draftFromTemplate(templateCatalog[0], "Ece"));
    draft.questions.forEach((q) => {
      q.correctOptionId = q.options[0].id;
    });
    draft.settings.showScore = false;
    draft.settings.showAnswers = false;
    draft.settings.maskNicknames = true;
    const created = await stranger.post("/api/v1/quizzes", { data: draft });
    expect(created.ok()).toBe(true);
    const owned = await created.json();
    const published = await stranger.post(`/api/v1/quizzes/${owned.id}/publish`, { data: {} });
    expect(published.ok()).toBe(true);
    const { slug } = await published.json();
    const hiddenStart = await guest.post("/api/v1/attempts", {
      data: { slug, nickname: "GizliSonuç" },
    });
    const hidden = await hiddenStart.json();
    const hiddenAnswers = hidden.quiz.questions.map(
      (q: { id: string; options: { id: string }[] }) => ({
        questionId: q.id,
        optionId: q.options[0].id,
      }),
    );
    await guest.post(`/api/v1/attempts/${hidden.attemptId}/submit`, {
      data: { answers: hiddenAnswers },
    });
    const result = await guest.get(`/quiz/${slug}/results/${hidden.attemptId}`);
    const html = await result.text();
    expect(html).toContain("Cevapların sahibine ulaştı!");
    expect(html).not.toContain("score-ring");
    expect(html).not.toContain("Cevapların hikâyesi.");
    await stranger.post(`/api/v1/quizzes/${owned.id}/archive`, { data: {} });
    expect(
      (await guest.post("/api/v1/attempts", { data: { slug, nickname: "Arşiv" } })).status(),
    ).toBe(404);
    const deleted = await stranger.post("/api/auth/delete-user", { data: { password } });
    expect(deleted.ok()).toBe(true);
    expect(await db.user.count({ where: { email: strangerEmail } })).toBe(0);
    expect(await db.quiz.count({ where: { id: owned.id } })).toBe(0);
    expect(await db.quizAttempt.count({ where: { id: hidden.attemptId } })).toBe(0);
  } finally {
    await db.user.deleteMany({ where: { email: strangerEmail } });
    await db.user.deleteMany({ where: { id: unrelatedOwnerId } });
    await stranger.dispose();
    await guest.dispose();
  }
});
