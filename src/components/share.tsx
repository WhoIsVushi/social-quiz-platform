"use client";
import { useEffect, useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import QRCode from "qrcode";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "./ui/button";
export function Share({
  url,
  text = "Benim hakkımda ne kadar şey biliyorsun? 😎 Testimi çöz ve kaç puan aldığını gör!",
  qr = false,
}: {
  url: string;
  text?: string;
  qr?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [image, setImage] = useState("");
  useEffect(() => {
    if (qr)
      QRCode.toDataURL(url, { width: 220, margin: 2, color: { dark: "#37204f", light: "#ffffff" } })
        .then(setImage)
        .catch(() => toast.error("QR kod oluşturulamadı."));
  }, [url, qr]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Bağlantı kopyalandı!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Kopyalanamadı. Bağlantıyı aşağıdaki alandan seçebilirsin.");
    }
  }
  async function nativeShare() {
    try {
      if (navigator.share) await navigator.share({ title: "Seni en iyi kim tanıyor?", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Paylaşım metni kopyalandı!");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        toast.error("Paylaşım tamamlanamadı.");
    }
  }
  return (
    <div className="stack">
      <div className="row">
        <input
          aria-label="Paylaşım bağlantısı"
          value={url}
          readOnly
          onFocus={(e) => e.target.select()}
        />
        <Button onClick={copy} aria-label="Bağlantıyı kopyala">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </Button>
      </div>
      <div className="share-links">
        <Button variant="secondary" size="small" onClick={nativeShare}>
          <Share2 size={15} />
          Paylaş
        </Button>
        <a
          className="button button-secondary button-small"
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <a
          className="button button-secondary button-small"
          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
      </div>
      {image && (
        <div style={{ textAlign: "center" }}>
          <Image
            unoptimized
            src={image}
            width={180}
            height={180}
            alt="Test bağlantısının QR kodu"
            style={{ margin: "0 auto", borderRadius: 12 }}
          />
          <a href={image} download="test-qr.png" className="text-link" style={{ marginTop: 10 }}>
            <Download size={14} /> QR kodunu indir
          </a>
        </div>
      )}
    </div>
  );
}
