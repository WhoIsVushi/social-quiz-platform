"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Layers, LogOut, Settings, UserRound, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
export function DashboardNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="dashboard-nav">
      <span className="nav-label">SANA ÖZEL</span>
      {[
        { href: "/dashboard", label: "Genel bakış", icon: LayoutDashboard },
        { href: "/dashboard/quizzes", label: "Testlerim", icon: Layers },
        { href: "/dashboard/profile", label: "Profilim", icon: UserRound },
        { href: "/dashboard/settings", label: "Ayarlar", icon: Settings },
        { href: "/explore", label: "İlham al", icon: Sparkles },
      ].map(({ href, label, icon: Icon }) => (
        <Link
          href={href}
          className={
            (href === "/dashboard" ? pathname === href : pathname.startsWith(href)) ? "active" : ""
          }
          key={href}
        >
          <Icon />
          {label}
        </Link>
      ))}
      <button
        onClick={async () => {
          const result = await authClient.signOut();
          if (result.error) {
            toast.error("Çıkış yapılamadı. Tekrar dene.");
            return;
          }
          router.push("/");
          router.refresh();
        }}
      >
        <LogOut />
        Çıkış yap
      </button>
    </aside>
  );
}
