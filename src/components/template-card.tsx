import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { categoryName } from "@/lib/utils";
export type TemplateCardData = {
  slug: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
};
export function TemplateCard({
  template,
  index = 0,
}: {
  template: TemplateCardData;
  index?: number;
}) {
  return (
    <Link className="template-card" href={`/templates/${template.slug}`}>
      <div className={`template-art tone-${template.color}`}>
        <span className="art-circle circle-one" />
        <span className="art-circle circle-two" />
        <span className="art-spark">✳</span>
        <span className="template-emoji">{template.emoji}</span>
        <span className="art-caption">
          {["BİZİM HİKÂYEMİZ", "SEN + BEN", "İYİ Kİ VARSIN", "BİRAZ EĞLENELİM"][index % 4]}
        </span>
        <span className="card-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
      <div className="template-body">
        <span className={`category-label text-${template.color}`}>
          {categoryName(template.category)}
        </span>
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        <span className="template-meta">
          <Layers size={14} /> 10 soru <span>·</span> Tamamen sana özel
        </span>
      </div>
    </Link>
  );
}
