import { db } from "@/lib/db";
import { Explore } from "@/components/explore";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Şablonları keşfet",
  description:
    "Arkadaşlık, ilişki, aile ve eğlence testleri. Sana en uygun şablonu seç, kendi sorularınla kişiselleştir.",
  alternates: { canonical: "/explore" },
};
export default async function Page() {
  const templates = await db.quizTemplate.findMany({
    orderBy: [{ isFeatured: "desc" }, { id: "asc" }],
    select: { slug: true, name: true, description: true, category: true, emoji: true, color: true },
  });
  return (
    <section className="container page-section">
      <span className="eyebrow plain">BİR TEST, BİNLERCE HİKÂYE</span>
      <h1 className="page-title" style={{ marginTop: 15 }}>
        Küçük bir ilhamla başla.
      </h1>
      <p className="page-subtitle">
        Arkadaşın, sevgilin, ailen… Her bağa özel bir başlangıç var.
        <br />
        Soruları ve cevapları istediğin gibi değiştir.
      </p>
      <Explore templates={templates} />
    </section>
  );
}
