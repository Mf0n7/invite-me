"use client";

import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export function Header() {
  return (
    <header className="absolute right-4 top-4 flex items-center gap-3">
      <Link
        href="/login"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Entrar
      </Link>
      <ThemeToggle />
    </header>
  );
}
