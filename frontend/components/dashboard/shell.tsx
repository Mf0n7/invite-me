"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <RequireAuth>
      <div className="min-h-screen">
        <header className="border-b border-border">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/dashboard" className="font-display text-xl font-semibold text-primary">
              O Penetra
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/billing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Planos
              </Link>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user?.display_name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </div>
    </RequireAuth>
  );
}
