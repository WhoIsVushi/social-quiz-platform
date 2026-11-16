import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Builder } from "@/components/quiz/builder";
import { draftFromTemplate } from "@/features/templates/catalog";
import { quizSchema, settingsSchema } from "@/lib/validation/quiz";
import { quizLimits } from "@/lib/config";
import { z } from "zod";
export const metadata = { title: "Yeni test oluştur" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const session = await requireSession();
  const { template: slug } = await searchParams;
  const template = slug ? await db.quizTemplate.findUnique({ where: { slug } }) : null;
  const source = template
    ? {
        name: template.name,
        category: z.enum(["friends", "relationships", "family", "fun"]).parse(template.category),
        color: settingsSchema.shape.theme.parse(template.color),
        emoji: template.emoji,
        content: z
          .array(z.object({ text: z.string(), options: z.array(z.string()) }))
          .parse(template.content),
      }
    : null;
  const draft = source
    ? draftFromTemplate(source, session.user.name)
    : {
        title: `${session.user.name}’i ne kadar tanıyorsun?`,
        description: "Bakalım beni ne kadar iyi tanıyorsun? ✨",
        creatorName: session.user.name,
        category: "friends",
        visibility: "UNLISTED",
        settings: {
          theme: "violet",
          emoji: "✌️",
          shuffle: false,
          showScore: true,
          showAnswers: true,
          leaderboard: true,
          allowReplay: true,
          maskNicknames: false,
        },
        questions: [],
      };
  return (
    <div className="builder-shell">
      <Builder initial={quizSchema.parse(draft)} limits={quizLimits} />
    </div>
  );
}
