"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useEventCheckout, useTiers } from "@/hooks/use-billing";
import { formatBRL } from "@/lib/utils";

export function LockedNotice({ uuid, hidden }: { uuid: string; hidden: number }) {
  const { data: tiers } = useTiers();
  const checkout = useEventCheckout(uuid);
  const [open, setOpen] = useState(false);

  const buy = async (capacity: number) => {
    try {
      await checkout.mutateAsync(capacity);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível iniciar o pagamento."));
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm">
        <Lock className="size-4 text-primary" />
        <span>
          <span className="font-medium">+{hidden} confirmado(s) ocultos.</span> Libere uma faixa
          para ver todos os nomes.
        </span>
      </p>
      {!open ? (
        <Button size="sm" className="mt-3" onClick={() => setOpen(true)}>
          Liberar faixa
        </Button>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {tiers?.tiers.map((t) => (
            <Button
              key={t.capacity}
              size="sm"
              variant="outline"
              disabled={checkout.isPending}
              onClick={() => buy(t.capacity)}
            >
              até {t.capacity} · {formatBRL(t.event_cents)}
            </Button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Prefere recorrente? Veja os planos em{" "}
        <a href="/dashboard/billing" className="text-primary hover:underline">
          assinatura
        </a>
        .
      </p>
    </div>
  );
}
