"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/auth";

/** Envolve páginas restritas a superusuários. Redireciona para /dashboard se o usuário não for staff. */
export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    } else if (!user?.is_staff) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user?.is_staff) return null;

  return <>{children}</>;
}
