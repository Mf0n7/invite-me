"use client";

import { useState } from "react";
import { CalendarHeart, CreditCard, LogOut, User, Menu, X } from "lucide-react";
import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { RequireAuth } from "@/components/auth/require-auth";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

const NAV = [
  {
    href: "/dashboard",
    label: "Meus eventos",
    icon: CalendarHeart,
    exact: true,
  },
  {
    href: "/dashboard/billing",
    label: "Planos",
    icon: CreditCard,
    exact: false,
  },
  { href: "/dashboard/profile", label: "Perfil", icon: User, exact: false },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <RequireAuth>
      <div className="min-h-screen">
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
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <span className="font-display text-2xl font-semibold text-primary">
                  Convida
                </span>
              </Link>
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
              {NAV.map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                    isActive(href, exact)
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center justify-between border-t border-border p-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut className="size-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
          <div className="container flex h-14 items-center justify-between gap-2">
            <Link href="/dashboard">
              <h1 className="font-display text-2xl font-semibold text-primary md:text-3xl">
                Convida
              </h1>
            </Link>
            <div className="flex items-center gap-1">
              <span className="hidden md:inline-flex">
                <ThemeToggle />
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                className="hidden md:inline-flex"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut />
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
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors",
                  isActive(href, exact)
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="container py-6 sm:py-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
