import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Şifreni yenile", robots: { index: false, follow: false } };
export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="reset" />
    </Suspense>
  );
}
