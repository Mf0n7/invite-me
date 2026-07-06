"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLenis } from "@/context/lenis";
import { cn } from "@/lib/utils";

import { NAV, AUTH } from "./nav-links";

export function MobileSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const lenis = useLenis();

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:hidden transition-all duration-300",
        open ? "visible" : "invisible pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Logo href="/" onClick={onClose} />
          <div className="flex justify-center pt-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar menu"
              onClick={onClose}
            >
              <X />
            </Button>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                onClose();
                lenis?.scrollTo(href, { offset: -56 });
              }}
              className="rounded-xl px-4 py-3 text-2xl font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-border p-4">
          <Button asChild variant="outline" className="w-full">
            <Link href={AUTH.login.href} onClick={onClose}>
              {AUTH.login.label}
            </Link>
          </Button>
          <Button asChild className="w-full">
            <Link href={AUTH.register.href} onClick={onClose}>
              {AUTH.register.label}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
