import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Giriş yap", robots: { index: false, follow: false } };
export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
