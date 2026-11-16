import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div>
          <p>Küçük sorular. Daha yakın bağlar.</p>
        </div>
        <div className="footer-links">
          <Link href="/explore">Keşfet</Link>
          <Link href="/privacy">Gizlilik</Link>
          <Link href="/terms">Kullanım koşulları</Link>
        </div>
        <p className="footer-note">
          Biraz merak, bolca sen. 💜
          <br />© {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
