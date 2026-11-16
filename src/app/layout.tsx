import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { appUrl } from "@/lib/config";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Seni en iyi kim tanıyor?", template: "%s" },
  description:
    "Kendi arkadaşlık testini oluştur, sevdiklerinle paylaş. Seni en iyi kimin tanıdığını birlikte keşfedin.",
  openGraph: {
    locale: "tr_TR",
    type: "website",
    title: "Seni en iyi kim tanıyor?",
    description: "Küçük sorular, daha yakın bağlar.",
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Providers>
          <a href="#main" className="skip-link">
            İçeriğe geç
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
