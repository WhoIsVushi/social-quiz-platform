"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container page-section">
      <div className="empty-state">
        <div style={{ fontSize: 55, marginBottom: 20 }}>☁️</div>
        <h1 className="page-title">Küçük bir aksilik oldu.</h1>
        <p>Şu anda bu sayfayı yükleyemedik. Lütfen biraz sonra tekrar dene.</p>
        <Button onClick={reset}>Tekrar dene</Button>
      </div>
    </div>
  );
}
