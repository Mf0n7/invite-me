"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useAuth } from "@/context/auth";

/** Envolve páginas que exigem login. Redireciona para /login se não autenticado. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (sessionExpired) {
        toast.error("Sua sessão expirou. Faça login novamente.");
      }
      router.replace(
        "/login?next=" + encodeURIComponent(window.location.pathname),
      );
    }
  }, [isLoading, isAuthenticated, sessionExpired, router]);

  if (isLoading || !isAuthenticated) return null;

  return <>{children}</>;
}
