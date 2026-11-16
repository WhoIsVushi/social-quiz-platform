"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "Arial", padding: 40, textAlign: "center" }}>
        <h1>Bir sorun oluştu.</h1>
        <p>Sayfayı tekrar yüklemeyi deneyebilirsin.</p>
        <button onClick={reset}>Tekrar dene</button>
      </body>
    </html>
  );
}
