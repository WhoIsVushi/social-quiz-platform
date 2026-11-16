import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { privateHash, rateLimit } from "@/lib/security";
const handlers = toNextJsHandler(auth);
export const GET = handlers.GET;
export async function POST(request: Request) {
  try {
    // A global ceiling also protects deployments without a trusted client-IP header.
    const path = new URL(request.url).pathname;
    if (path.includes("sign-in") || path.includes("sign-up") || path.includes("password-reset")) {
      await rateLimit(`auth-global:${path}`, 100, 60);
      if (process.env.TRUST_PROXY === "true")
        await rateLimit(
          `auth-ip:${request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"}`,
          15,
          60,
        );
      const body = (await request
        .clone()
        .json()
        .catch(() => null)) as { email?: unknown } | null;
      if (typeof body?.email === "string")
        await rateLimit(`auth-email:${privateHash(body.email.toLowerCase())}`, 8, 60);
    }
    if (path.endsWith("request-password-reset") && !process.env.RESEND_API_KEY)
      return Response.json({ message: "E-posta hizmeti henüz yapılandırılmadı." }, { status: 503 });
    return await handlers.POST(request);
  } catch (error) {
    const limited = error instanceof Error && error.message.includes("Biraz hızlı");
    console.error(
      JSON.stringify({
        event: "auth_request_failed",
        code: limited ? "rate_limit" : "auth_failure",
      }),
    );
    return Response.json(
      {
        message: limited
          ? "Çok fazla deneme yaptın. Biraz sonra tekrar dene."
          : "İşlem tamamlanamadı. Lütfen tekrar dene.",
      },
      { status: limited ? 429 : 503 },
    );
  }
}
