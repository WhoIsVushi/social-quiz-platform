import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const days = Math.max(1, Number(process.env.ATTEMPT_RETENTION_DAYS) || 365);
  const now = new Date();
  const result = await db.$transaction([
    db.quizAttempt.deleteMany({
      where: {
        OR: [
          { startedAt: { lt: new Date(Date.now() - days * 86400000) } },
          { status: "STARTED", startedAt: { lt: new Date(Date.now() - 7 * 86400000) } },
        ],
      },
    }),
    db.requestBucket.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.rateLimit.deleteMany({ where: { lastRequest: { lt: BigInt(Date.now() - 86400000) } } }),
    db.report.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 90 * 86400000) } } }),
  ]);
  console.log(
    JSON.stringify({ event: "retention_completed", deleted: result.map((x) => x.count) }),
  );
}
main()
  .catch(() => {
    console.error(JSON.stringify({ event: "retention_failed" }));
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
