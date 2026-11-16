export default function Loading() {
  return (
    <div className="container page-section" role="status">
      <span className="sr-only">Yükleniyor</span>
      <div className="skeleton" style={{ height: 36, width: "55%", marginBottom: 25 }} />
      <div className="loading-grid">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    </div>
  );
}
