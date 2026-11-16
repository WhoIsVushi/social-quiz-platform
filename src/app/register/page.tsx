import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
export const metadata = { title: "Aramıza katıl", robots: { index: false, follow: false } };
export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
