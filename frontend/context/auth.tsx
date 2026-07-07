"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch, tokenStore } from "@/lib/api";
import type { AuthTokens, RegisterPayload, User } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const USER_KEY = ["auth-user"] as const;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setToken(tokenStore.access);
    setReady(true);
  }, []);

  const userQuery = useQuery({
    queryKey: USER_KEY,
    queryFn: () => apiFetch<User>("/auth/user/"),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const applyTokens = useCallback(
    (data: AuthTokens) => {
      tokenStore.set(data.access, data.refresh);
      setToken(data.access);
      if (data.user) qc.setQueryData(USER_KEY, data.user);
      else qc.invalidateQueries({ queryKey: USER_KEY });
    },
    [qc],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<AuthTokens>("/auth/login/", {
        method: "POST",
        anonymous: true,
        body: { email, password },
      });
      applyTokens(data);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await apiFetch<AuthTokens>("/auth/registration/", {
        method: "POST",
        anonymous: true,
        body: payload,
      });
      applyTokens(data);
    },
    [applyTokens],
  );

  const loginWithGoogle = useCallback(
    async (code: string) => {
      const data = await apiFetch<AuthTokens>("/auth/google/", {
        method: "POST",
        anonymous: true,
        body: { code },
      });
      applyTokens(data);
    },
    [applyTokens],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    qc.removeQueries({ queryKey: USER_KEY });
  }, [qc]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userQuery.data ?? null,
      isLoading: !ready || (!!token && userQuery.isLoading),
      isAuthenticated: !!userQuery.data,
      sessionExpired: !!token && userQuery.isError,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [
      ready,
      token,
      userQuery.data,
      userQuery.isLoading,
      userQuery.isError,
      login,
      register,
      loginWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
