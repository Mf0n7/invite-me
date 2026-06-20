"use client";

import { CalendarHeart, CreditCard, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { RequireAuth } from "@/components/auth/require-auth";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Meus eventos", icon: CalendarHeart, exact: true },
  { href: "/dashboard/billing", label: "Planos", icon: CreditCard, exact: false },
  { href: "/dashboard/profile", label: "Perfil", icon: User, exact: false },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <RequireAuth>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
          <div className="container flex h-14 items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="font-display text-lg font-semibold text-primary sm:text-xl"
            >
              Convida
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sair"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                <LogOut />
              </Button>
            </div>
          </div>

          <nav className="container flex gap-1 overflow-x-auto pb-2">
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
