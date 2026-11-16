import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { AppError, checkOrigin, guestIdentity, rateLimit, readJson } from "@/lib/security";
import { nicknameSchema, submissionSchema, quizSchema } from "@/lib/validation/quiz";
import {
  createQuiz,
  ownedQuiz,
  publishQuiz,
  recoverAttempt,
  saveQuiz,
  startAttempt,
  submitAttempt,
} from "@/server/quizzes";
import { Prisma } from "@prisma/client";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  try {
    const { path } = await context.params;
    if (path.length > 4 || path.some((p) => !/^[-a-zA-Z0-9_]{1,150}$/.test(p)))
      throw new AppError("Geçersiz adres.", 404);
    if (request.method !== "GET") checkOrigin(request);
    const session = await getSession();
    const [resource, id, action] = path;
    if (resource === "attempts") {
      const guest = await guestIdentity(request.method === "POST");
      if (!guest) throw new AppError("Katılım bulunamadı.", 404);
      if (request.method === "GET" && id) {
        const result = await recoverAttempt(id, guest);
        const quiz = await db.quiz.findUnique({
          where: { slug: result.quiz.slug },
          select: { visibility: true, ownerId: true },
        });
        if (quiz?.visibility === "PRIVATE" && quiz.ownerId !== session?.user.id)
          throw new AppError("Katılım bulunamadı.", 404);
        return Response.json(result);
      }
      await rateLimit(`attempt:${guest}`, 40, 3600);
      await rateLimit("attempt-global", 3000, 60);
      if (request.method === "POST" && !id) {
        const data = z
          .object({ slug: z.string().max(150), nickname: nicknameSchema })
          .parse(await readJson(request));
        await rateLimit(`quiz-attempt:${data.slug}`, 500, 60);
        return Response.json(
          await startAttempt(data.slug, data.nickname, guest, session?.user.id),
          { status: 201 },
        );
      }
      if (request.method === "POST" && id && action === "submit") {
        const data = submissionSchema.parse(await readJson(request));
        return Response.json(await submitAttempt(id, guest, data.answers, session?.user.id));
      }
    }
    if (resource === "reports" && request.method === "POST") {
      const guest = await guestIdentity(true);
      await rateLimit(`report:${guest}`, 5, 3600);
      await rateLimit("report-global", 100, 3600);
      const data = z
        .object({ quizId: z.string().max(100), reason: z.string().trim().min(10).max(500) })
        .parse(await readJson(request));
      const quiz = await db.quiz.findFirst({
        where: { id: data.quizId, status: "PUBLISHED", visibility: { not: "PRIVATE" } },
        select: { id: true },
      });
      if (!quiz) throw new AppError("Test bulunamadı.", 404);
      await db.report.create({ data });
      return Response.json({ ok: true });
    }
    if (!session) throw new AppError("Devam etmek için giriş yap.", 401);
    const ownerId = session.user.id;
    if (resource === "quizzes") {
      if (request.method === "POST" && !id) {
        await rateLimit(`create:${ownerId}`, 20, 3600);
        const quiz = await createQuiz(ownerId, await readJson(request));
        return Response.json({ id: quiz.id, revision: quiz.revision }, { status: 201 });
      }
      if (!id) throw new AppError("Test bulunamadı.", 404);
      const quiz = await ownedQuiz(id, ownerId);
      if (request.method === "GET") return Response.json(quiz);
      if (request.method === "DELETE") {
        await db.quiz.delete({ where: { id, ownerId } });
        return Response.json({ ok: true });
      }
      if (request.method === "PATCH") {
        const data = z
          .object({ draft: quizSchema, revision: z.number().int().nonnegative() })
          .parse(await readJson(request));
        return Response.json(await saveQuiz(id, ownerId, data.draft, data.revision));
      }
      if (request.method === "POST" && action === "publish") {
        await rateLimit(`publish:${ownerId}`, 30, 3600);
        return Response.json(await publishQuiz(id, ownerId));
      }
      if (request.method === "POST" && action === "archive") {
        await db.quiz.update({
          where: { id, ownerId },
          data: { status: "ARCHIVED", revision: { increment: 1 } },
        });
        return Response.json({ ok: true });
      }
      if (request.method === "POST" && action === "duplicate") {
        await rateLimit(`create:${ownerId}`, 20, 3600);
        const draft = quizSchema.parse(quiz.draft);
        draft.title = `${draft.title.slice(0, 85)} (kopya)`;
        const copy = await createQuiz(ownerId, draft);
        return Response.json({ id: copy.id });
      }
      if (request.method === "POST" && action === "moderate") {
        const data = z
          .object({ attemptId: z.string().max(100), hidden: z.boolean() })
          .parse(await readJson(request));
        await db.quizAttempt.updateMany({
          where: { id: data.attemptId, quizId: id },
          data: { hidden: data.hidden },
        });
        return Response.json({ ok: true });
      }
    }
    if (resource === "profile" && request.method === "PATCH") {
      const data = z
        .object({
          name: z.string().trim().min(2).max(40),
          image: z
            .string()
            .regex(/^emoji:(💜|🌻|🪩|✌️|🌙|⚡)$/)
            .nullable(),
        })
        .parse(await readJson(request));
      await db.user.update({ where: { id: ownerId }, data });
      return Response.json({ ok: true });
    }
    throw new AppError("İşlem bulunamadı.", 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return Response.json(
        { message: error.issues[0]?.message || "Alanları kontrol et." },
        { status: 400 },
      );
    if (error instanceof AppError)
      return Response.json(
        { message: error.message },
        {
          status: error.status,
          headers: error.status === 429 ? { "Retry-After": "60" } : undefined,
        },
      );
    if (
      error instanceof Error &&
      /^Testin |^Her soru |^Tüm sorulara |^Geçersiz soru/.test(error.message)
    )
      return Response.json({ message: error.message }, { status: 400 });
    const requestId = crypto.randomUUID();
    console.error(
      JSON.stringify({
        event: "api_error",
        requestId,
        code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : "internal",
      }),
    );
    return Response.json(
      { message: "İşlem tamamlanamadı. Lütfen biraz sonra tekrar dene.", requestId },
      { status: 500 },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
