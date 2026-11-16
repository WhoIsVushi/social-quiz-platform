import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container page-section">
      <div className="empty-state">
        <div style={{ fontSize: 65, marginBottom: 20 }}>🔎</div>
        <h1 className="page-title">Burada bir test bulamadık.</h1>
        <p>Bağlantı değişmiş, test kaldırılmış veya yalnızca sahibine açık olabilir.</p>
        <Link href="/" className="button button-primary">
          Ana sayfaya dön
        </Link>
      </div>
    </div>
  );
}
