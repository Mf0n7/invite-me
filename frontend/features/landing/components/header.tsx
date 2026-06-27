"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          mobileOpen ? "visible" : "invisible pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <Logo href="/" onClick={() => setMobileOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
            >
              <X />
            </Button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-4">
            {NAV.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2 border-t border-border p-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                Entrar
              </Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/register" onClick={() => setMobileOpen(false)}>
                Criar conta
              </Link>
            </Button>
            <div className="flex justify-center pt-1">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-2">
          <Logo href="/" />

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex">
              <ThemeToggle />
            </span>
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              Entrar
            </Link>
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/register">Criar conta</Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Menu"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="container hidden gap-1 overflow-x-auto pb-2 md:flex">
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
    </>
  );
}
