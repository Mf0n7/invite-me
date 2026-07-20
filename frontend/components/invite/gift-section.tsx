"use client";

import { Gift } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useClaimGift, usePublicGifts } from "@/hooks/use-gifts";

export function GiftSection({ token }: { token: string }) {
  const { data: gifts } = usePublicGifts(token);
  const claim = useClaimGift(token);
  const [pendingId, setPendingId] = useState<number | null>(null);

  if (!gifts || gifts.length === 0) return null;

  const onClaim = async (id: number) => {
    const name = prompt("Seu nome (para o anfitrião saber quem vai presentear):");
    if (!name || !name.trim()) return;
    setPendingId(id);
    try {
      await claim.mutateAsync({ id, name: name.trim() });
      posthog.capture("gift_claimed", { gift_id: id });
      toast.success("Presente reservado! Obrigado 🎁");
    } catch (err) {
      posthog.captureException(err);
      toast.error(apiErrorMessage(err, "Não foi possível reservar."));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <p className="flex items-center gap-2 text-sm font-medium">
        <Gift className="size-4 text-primary" /> Lista de presentes
      </p>
      <ul className="space-y-2">
        {gifts.map((g) => (
          <li
            key={g.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2"
          >
            <div className="flex-1">
              <p className={g.is_available ? "text-sm font-medium" : "text-sm text-muted-foreground line-through"}>
                {g.title}
              </p>
              {g.description && (
                <p className="text-xs text-muted-foreground">{g.description}</p>
              )}
              {g.url && g.is_available && (
                <a
                  href={g.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Ver na loja
                </a>
              )}
            </div>
            {g.is_available ? (
              <Button
                size="sm"
                variant="outline"
                disabled={claim.isPending && pendingId === g.id}
                onClick={() => onClaim(g.id)}
              >
                Vou presentear
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Reservado</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
