"use client";

import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";

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
      toast.error(
        "Google SSO ainda não configurado (defina NEXT_PUBLIC_GOOGLE_CLIENT_ID).",
      );
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
        <FcGoogle />
        {loading ? "Entrando…" : "Entrar com Google"}
      </Button>
    </>
  );
}
