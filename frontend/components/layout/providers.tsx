"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { useState } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "@/lib/auth/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
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
        <AuthProvider>{children}</AuthProvider>
        <Toaster theme="dark" position="top-center" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
