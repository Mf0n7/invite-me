"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth";

/** Envolve páginas restritas a superusuários. Redireciona para /dashboard se o usuário não for staff. */
export function RequireStaff({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      if (sessionExpired) {
        toast.error("Sua sessão expirou. Faça login novamente.");
      }
      router.replace("/login?next=" + encodeURIComponent(window.location.pathname));
    } else if (!user?.is_staff) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, sessionExpired, user, router]);

  if (isLoading || !isAuthenticated || !user?.is_staff) return null;

  return <>{children}</>;
}
