"use client";

import { useEffect, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

import { DesktopNav } from "./desktop-nav";
import { MobileNav } from "./mobile-nav";
import { MobileSheet } from "./mobile-sheet";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <MobileSheet open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <header
        className={cn(
          "sticky top-0 z-30 bg-background/80 backdrop-blur-md transition-all duration-300",
          scrolled
            ? "border-b border-border shadow-sm"
            : "border-b border-transparent",
        )}
      >
        {/* Streamer gradiente — assinatura visual do Convida */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-[hsl(var(--celebrate))]" />

        <div className="container flex h-14 items-center justify-between gap-4">
          <Logo href="/" hideTextOnMobile />
          <DesktopNav />
          <MobileNav onOpen={() => setMobileOpen(true)} />
        </div>
      </header>
    </>
  );
}
