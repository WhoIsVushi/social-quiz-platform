import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
async function sendMail(to: string, subject: string, url: string) {
  if (!process.env.RESEND_API_KEY) throw new Error("Email provider is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      text: `${subject}\n\nBu işlemi sen başlattıysan bağlantıyı aç:\n${url}\n\nBu isteği sen yapmadıysan bu e-postayı yok sayabilirsin.`,
    }),
  });
  if (!response.ok) throw new Error("Email delivery failed");
}
export const auth = betterAuth({
  appName: "",
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(db, { provider: "postgresql" }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.name.trim().length < 2 || user.name.length > 40 || user.email.length > 254)
            throw new APIError("BAD_REQUEST", { message: "Hesap bilgilerini kontrol et." });
          return { data: { ...user, name: user.name.trim(), image: null } };
        },
      },
    },
    session: {
      create: {
        before: async (session) => ({ data: { ...session, ipAddress: null, userAgent: null } }),
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(user.email, "Şifreni yenile", url);
    },
  },
  emailVerification: {
    sendOnSignUp: process.env.REQUIRE_EMAIL_VERIFICATION === "true",
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail(user.email, "E-posta adresini doğrula", url);
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 14, updateAge: 60 * 60 * 24, storeSessionInDatabase: true },
  user: { deleteUser: { enabled: true } },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: { disableIpTracking: true },
    defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 50,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 3 },
      "/request-password-reset": { window: 60, max: 3 },
    },
  },
});
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
