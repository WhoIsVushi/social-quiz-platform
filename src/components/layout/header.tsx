"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="home-link" href="/">
          Ana sayfa
        </Link>
        <nav className={open ? "main-nav open" : "main-nav"} aria-label="Ana menü">
          <Link
            href="/explore"
            className={pathname === "/explore" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            Şablonları keşfet
          </Link>
          <Link href="/#nasil-calisir" onClick={() => setOpen(false)}>
            Nasıl çalışır?
          </Link>
          {session && (
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              Panelim
            </Link>
          )}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Renk temasını değiştir"
          >
            <Sun size={18} className="dark-only" />
            <Moon size={18} className="light-only" />
          </button>
          <Link className="login-link" href={session ? "/dashboard" : "/login"}>
            {session ? session.user.name.split(" ")[0] : "Giriş yap"}
          </Link>
          <Link
            className="button button-primary button-small header-cta"
            href="/dashboard/quizzes/new"
          >
            Testini oluştur <ArrowUpRight size={17} />
          </Link>
          <button
            className="icon-button mobile-toggle"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
