"use client";

import { Gift } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useTiers } from "@/hooks/use-billing";
import { useGiftCheckout } from "@/hooks/use-gifts";
import { formatBRL } from "@/lib/utils";

export function GiftCta({ uuid }: { uuid: string }) {
  const { data: tiers } = useTiers();
  const checkout = useGiftCheckout(uuid);
  const price = tiers?.gift_addon_cents ? formatBRL(tiers.gift_addon_cents) : "";

  const buy = async () => {
    try {
      await checkout.mutateAsync();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível iniciar o pagamento."));
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
      <Gift className="mx-auto size-8 text-primary" />
      <p className="mt-2 font-medium">Adicione uma lista de presentes</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Seus convidados reservam o que vão presentear — sem repetição.
      </p>
      <Button className="mt-4" onClick={buy} disabled={checkout.isPending}>
        Liberar {price && `por ${price}`}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Já incluso para assinantes — veja em{" "}
        <a href="/dashboard/billing" className="text-primary hover:underline">
          Planos
        </a>
        .
      </p>
    </div>
  );
}
