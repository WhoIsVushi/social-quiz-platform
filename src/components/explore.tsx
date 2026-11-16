"use client";
import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { TemplateCard, type TemplateCardData } from "./template-card";
import { categories } from "@/lib/utils";
export function Explore({ templates }: { templates: TemplateCardData[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const filtered = templates.filter(
    (t) =>
      (category === "all" || t.category === category) &&
      `${t.name} ${t.description}`.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")),
  );
  return (
    <>
      <div className="explore-tools">
        <div className="search-bar">
          <Search size={18} />
          <input
            aria-label="Şablon ara"
            placeholder="Biraz ilham ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filters">
          <button
            className={`filter-chip ${category === "all" ? "active" : ""}`}
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
          >
            Tümü
          </button>
          {categories.map((c) => (
            <button
              className={`filter-chip ${category === c.id ? "active" : ""}`}
              key={c.id}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>
      <p className="small muted" style={{ marginBottom: 18 }} aria-live="polite">
        {filtered.length} şablon · Cevaplar tamamen sana özel
      </p>
      {filtered.length ? (
        <div className="template-grid">
          {filtered.map((t, i) => (
            <TemplateCard template={t} index={i} key={t.slug} />
          ))}
        </div>
      ) : (
        <div className="empty-state card">
          <Sparkles size={35} />
          <h2>Henüz bir eşleşme yok.</h2>
          <p>Başka bir kelime dene ya da tüm kategorilere göz at.</p>
          <button
            className="text-link"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Filtreleri temizle
          </button>
        </div>
      )}
    </>
  );
}
