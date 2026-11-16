import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function privateHash(value: string) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export async function guestIdentity(create = false) {
  const jar = await cookies();
  let token = jar.get("guest")?.value;
  if (!token || !/^[-\w]{43}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString("base64url");
    jar.set("guest", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return privateHash(token);
}
export async function rateLimit(key: string, max: number, seconds: number) {
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const hashedKey = privateHash(`${key}:${bucket}`);
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "RequestBucket" ("key", "count", "expiresAt") VALUES (${hashedKey},1,${new Date((bucket + 2) * seconds * 1000)}) ON CONFLICT ("key") DO UPDATE SET "count"="RequestBucket"."count"+1 RETURNING "count"`;
  if (rows[0].count > max)
    throw new AppError("Biraz hızlı gidiyoruz. Lütfen daha sonra tekrar dene.", 429);
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000").origin;
  if (origin !== expected) throw new AppError("Bu isteğe izin verilmiyor.", 403);
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new AppError("Geçersiz istek biçimi.", 415);
}
export async function readJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new AppError("İstek boş.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 100_000) {
      await reader.cancel();
      throw new AppError("İstek çok büyük.", 413);
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new AppError("Geçersiz istek.");
  }
}
