"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
export function ModerateButton({
  quizId,
  attemptId,
  hidden,
}: {
  quizId: string;
  attemptId: string;
  hidden: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <button
      disabled={busy}
      className="icon-button"
      aria-label={hidden ? "Sıralamada göster" : "Sıralamadan gizle"}
      onClick={async () => {
        setBusy(true);
        try {
          await api(`quizzes/${quizId}/moderate`, "POST", { attemptId, hidden: !hidden });
          router.refresh();
          toast.success(hidden ? "Katılım sıralamaya eklendi." : "Katılım sıralamadan gizlendi.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Güncellenemedi.");
        } finally {
          setBusy(false);
        }
      }}
    >
      {hidden ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  );
}
