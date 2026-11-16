import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { templateCatalog } from "../src/features/templates/catalog";
const db = new PrismaClient();
async function main() {
  for (const template of templateCatalog)
    await db.quizTemplate.upsert({
      where: { slug: template.slug },
      create: { ...template, content: template.content as Prisma.InputJsonValue },
      update: { ...template, content: template.content as Prisma.InputJsonValue },
    });
  console.log(
    `Seeded ${templateCatalog.length} Turkish templates. No user accounts or fabricated attempts created.`,
  );
}
main()
  .catch(() => {
    console.error("Template seed failed");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
