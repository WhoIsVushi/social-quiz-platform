import { ImageResponse } from "next/og";
export const alt = "Seni en iyi kim tanıyor?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#f6f0ff",
        padding: 90,
        fontFamily: "sans-serif",
        color: "#211d32",
      }}
    >
      <div style={{ fontSize: 88, lineHeight: 1.1, fontWeight: 700, display: "flex" }}>
        Seni en iyi
      </div>
      <div
        style={{
          fontSize: 88,
          lineHeight: 1.1,
          fontWeight: 700,
          display: "flex",
          color: "#7444df",
        }}
      >
        kim tanıyor?
      </div>
      <div style={{ fontSize: 24, display: "flex", marginTop: 35, color: "#767182" }}>
        Küçük sorular. Daha yakın bağlar.
      </div>
    </div>,
    size,
  );
}
