"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/auth";
import { LenisProvider } from "@/context/lenis";
import { ApiError } from "@/lib/api";

/**
 * Nunca insistir em erro do cliente (4xx) — e muito menos em 429: repetir uma
 * requisição barrada pelo rate limit só empurra o IP mais fundo no bloqueio.
 * Erro de rede/5xx segue com 1 retentativa.
 */
function retryPolicy(failureCount: number, error: unknown) {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
  return failureCount < 1;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={(resolvedTheme as "light" | "dark") ?? "system"}
      position="top-center"
      richColors
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: retryPolicy, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  );
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={client}>
        <LenisProvider>
          <AuthProvider>{children}</AuthProvider>
        </LenisProvider>
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
