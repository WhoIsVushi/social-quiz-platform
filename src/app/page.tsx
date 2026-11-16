import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Link2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Heart,
} from "lucide-react";
import { HomePreview } from "@/components/home-preview";
import { TemplateCard } from "@/components/template-card";
import { templateCatalog } from "@/features/templates/catalog";
export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> Arkadaşlık, küçük detaylarda saklı.
          </div>
          <h1>
            Seni en iyi
            <br />
            <span className="hero-highlight">
              kim tanıyor<span className="question-mark">?</span>
              <svg viewBox="0 0 420 20" aria-hidden="true">
                <path d="M6 13 Q170 -4 410 9" />
              </svg>
            </span>
          </h1>
          <p className="hero-description">
            En sevdiğin şarkı, vazgeçemediğin kahve, o unutulmaz anı…{" "}
            <strong>Sana özel bir test oluştur.</strong> Sevdiklerine gönder, cevaplara birlikte
            şaşırın.
          </p>
          <div className="hero-buttons">
            <Link href="/dashboard/quizzes/new" className="button button-primary">
              Testini oluştur <ArrowUpRight size={20} />
            </Link>
            <Link href="#nasil-calisir" className="button button-secondary">
              <span className="play-small">▶</span> Nasıl çalışır?
            </Link>
          </div>
          <div className="hero-checks">
            <span>
              <Check />
              Ücretsiz başla
            </span>
            <span>
              <Check />2 dakikada hazır
            </span>
            <span>
              <Check />
              Katılmak için üyelik yok
            </span>
          </div>
          <div className="hero-community">
            <div className="avatar-stack">
              <span>👩🏻</span>
              <span>👨🏽</span>
              <span>👩🏼</span>
              <span>🧑🏾</span>
            </div>
            <div>
              <span className="tiny-stars">✦ ✦ ✦ ✦ ✦</span>
              <p>
                En güzel rekabet, <strong>sevdiklerinle.</strong>
              </p>
            </div>
          </div>
        </div>
        <HomePreview />
      </section>
      <div className="connection-strip">
        <div className="container">
          <span>
            Küçük bir testten
            <br />
            <strong>çok daha fazlası.</strong>
          </span>
          <p>
            <Heart /> Daha yakın arkadaşlıklar
          </p>
          <span className="strip-star">✳</span>
          <p>
            <Sparkles /> Yeni keşfedilen detaylar
          </p>
          <span className="strip-star">✳</span>
          <p>
            <ShieldCheck /> Sadece eğlence, sıfır baskı
          </p>
        </div>
      </div>
      <section className="section container" id="sablonlar">
        <div className="section-heading">
          <div>
            <div className="eyebrow plain">HER BAĞIN BİR HİKÂYESİ VAR</div>
            <h2>
              Kiminle başlayacaksın?<span className="heading-spark">✳</span>
            </h2>
            <p>İlhamını seç, sorulara kendi rengini kat.</p>
          </div>
          <Link href="/explore" className="text-link">
            Tüm şablonları keşfet <ArrowRight size={18} />
          </Link>
        </div>
        <div className="template-grid">
          {templateCatalog
            .filter((t) => t.isFeatured)
            .map((template, i) => (
              <TemplateCard template={template} index={i} key={template.slug} />
            ))}
        </div>
        <p className="subtle-note">
          Cevap anahtarını sen oluşturursun. Çünkü seni en iyi yine sen bilirsin. 💜
        </p>
      </section>
      <section className="how-section" id="nasil-calisir">
        <div className="container">
          <div className="center-heading">
            <div className="eyebrow plain">AZICIK MERAK YETER</div>
            <h2>Üç küçük adım. Bir sürü “nasıl bildin?”</h2>
            <p>Uzun formlar yok. Karmaşık kurallar yok. Sadece sen ve sevdiklerin.</p>
          </div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                icon: WandSparkles,
                title: "Biraz kendinden bahset",
                text: "Bir şablon seç ya da sıfırdan başla. Sorularını yaz, doğru cevaplarını işaretle.",
                color: "violet",
              },
              {
                n: "02",
                icon: Link2,
                title: "Gruba bir link bırak",
                text: "Testinin bağlantısını arkadaşlarına gönder. Katılmak için hesap açmalarına gerek yok.",
                color: "pink",
              },
              {
                n: "03",
                icon: Heart,
                title: "Cevapları birlikte keşfedin",
                text: "Sonuçları gör, sıralamaya göz at. Belki de en iyi arkadaşının sana bir kahve borcu vardır.",
                color: "mint",
              },
            ].map(({ n, icon: Icon, title, text, color }) => (
              <article className="step-card" key={n}>
                <div className={`step-icon tone-${color}`}>
                  <Icon size={27} />
                </div>
                <span className="step-number">{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="container">
        <div className="bottom-cta">
          <span className="cta-doodle">✳</span>
          <div>
            <span className="eyebrow plain">İLK SORU SENDEN.</span>
            <h2>
              “Beni ne kadar tanıyorsun?”
              <br />
              demeye hazır mısın?
            </h2>
            <p>Bir test oluştur. Birini gülümset. Yeni bir şey keşfet.</p>
          </div>
          <Link href="/dashboard/quizzes/new" className="button button-dark">
            Hadi, testini oluştur <ArrowUpRight size={20} />
          </Link>
          <span className="cta-heart">♡</span>
        </div>
      </section>
    </>
  );
}
