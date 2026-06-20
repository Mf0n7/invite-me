"use client";

import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/auth";

// Tipagem mínima do Google Identity Services (code client).
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: "popup" | "redirect";
            callback: (resp: { code?: string; error?: string }) => void;
          }) => { requestCode: () => void };
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function GoogleButton({ onSuccess }: { onSuccess?: () => void }) {
  const { loginWithGoogle } = useAuth();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (!CLIENT_ID) {
      toast.error("Google SSO ainda não configurado (defina NEXT_PUBLIC_GOOGLE_CLIENT_ID).");
      return;
    }
    if (!window.google) {
      toast.error("Não foi possível carregar o Google. Tente novamente.");
      return;
    }
    const client = window.google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: async (resp) => {
        if (resp.error || !resp.code) {
          toast.error("Login com Google cancelado.");
          return;
        }
        setLoading(true);
        try {
          await loginWithGoogle(resp.code);
          onSuccess?.();
        } catch (err) {
          toast.error(apiErrorMessage(err, "Falha ao entrar com Google."));
        } finally {
          setLoading(false);
        }
      },
    });
    client.requestCode();
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={() => setReady(true)}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleClick}
        disabled={loading || !ready}
      >
        <GoogleIcon />
        {loading ? "Entrando…" : "Entrar com Google"}
      </Button>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-8.9 20-20 0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C41 36 44 30.6 44 24c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}
