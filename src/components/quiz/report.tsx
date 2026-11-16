"use client";
import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
export function ReportQuiz({ quizId }: { quizId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    try {
      await api("reports", "POST", { quizId, reason });
      toast.success("Bildirimin kaydedildi. Teşekkür ederiz.");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        className="text-link"
        style={{ color: "var(--muted)", fontSize: 10 }}
        onClick={() => setOpen(true)}
      >
        <Flag size={11} />
        İçeriği bildir
      </button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Bir sorun mu var?"
        description="Uygunsuz test içeriğini veya katılımcı takma adını bildirebilirsin."
      >
        <div className="stack">
          <div className="field">
            <label htmlFor="report-reason">Kısaca anlat</label>
            <textarea
              id="report-reason"
              minLength={10}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sorunu en az 10 karakterle açıklayabilirsin."
            />
          </div>
          <Button disabled={busy || reason.trim().length < 10} onClick={submit}>
            {busy ? "Gönderiliyor…" : "Bildirimi gönder"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
