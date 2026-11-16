import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, Layers } from "lucide-react";
import { db } from "@/lib/db";
import { categoryName } from "@/lib/utils";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const t = await db.quizTemplate.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  return {
    title: t?.name || "Şablon bulunamadı",
    description: t?.description,
    alternates: { canonical: `/templates/${slug}` },
  };
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const template = await db.quizTemplate.findUnique({ where: { slug } });
  if (!template) notFound();
  const questions = template.content as { text: string; options: string[] }[];
  return (
    <section className="container page-section">
      <div className="breadcrumb">
        <Link href="/explore">Şablonlar</Link>
        <ChevronRight size={13} />
        <span>{categoryName(template.category)}</span>
      </div>
      <div className="template-detail">
        <div className={`template-art tone-${template.color}`}>
          <span className="art-circle circle-one" />
          <span className="art-circle circle-two" />
          <span className="art-spark">✳</span>
          <span className="template-emoji">{template.emoji}</span>
          <span className="art-caption">HER CEVAPTA BİRAZ SEN</span>
        </div>
        <div className="template-info">
          <span className={`category-label text-${template.color}`}>
            {categoryName(template.category)} şablonu
          </span>
          <h1 className="page-title">{template.name}</h1>
          <p>{template.description}</p>
          <div className="row small muted" style={{ marginBottom: 25 }}>
            <Layers size={16} />
            {questions.length} soru <span>·</span>
            <Clock size={16} /> 2–3 dakika
          </div>
          <Link
            href={`/dashboard/quizzes/new?template=${template.slug}`}
            className="button button-primary"
          >
            Bu şablonla başla <ArrowRight size={18} />
          </Link>
          <p className="small muted" style={{ marginTop: 16 }}>
            Tüm sorular düzenlenebilir. Doğru cevapları sen seçersin.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: 820, margin: "45px auto 0" }}>
        <h2 style={{ fontSize: 23 }}>Sorulara bir göz at.</h2>
        <p className="small muted" style={{ marginTop: 10 }}>
          Bir başlangıç noktası. Gerisi senin hikâyen.
        </p>
        <ol className="question-list" style={{ padding: 0 }}>
          {questions.map((q) => (
            <li key={q.text}>{q.text}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
