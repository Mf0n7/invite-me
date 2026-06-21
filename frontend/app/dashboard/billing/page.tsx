"use client";

import { Check, ExternalLink, Gift } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { BackButton } from "@/components/shared/back-button";
import { DashboardShell } from "@/components/dashboard/shell";
import { PlanRow } from "@/components/billing/plan-row";
import { PriceCell } from "@/components/billing/price-cell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiErrorMessage } from "@/lib/api";
import { formatBRL } from "@/lib/utils";
import {
  usePortal,
  useSubscription,
  useSubscriptionCheckout,
  useTiers,
} from "@/hooks/use-billing";

export default function BillingPage() {
  const { data: tiers } = useTiers();
  const { data: sub } = useSubscription();
  const subscribe = useSubscriptionCheckout();
  const portal = usePortal();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success")
      toast.success("Assinatura ativada! Pode levar alguns segundos.");
    if (status === "cancel") toast.info("Checkout cancelado.");
  }, []);

  const onSubscribe = async (capacity: number) => {
    try {
      await subscribe.mutateAsync(capacity);
    } catch (err) {
      toast.error(
        apiErrorMessage(err, "Não foi possível iniciar a assinatura."),
      );
    }
  };

  const onManage = async () => {
    try {
      await portal.mutateAsync();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível abrir o portal."));
    }
  };

  return (
    <DashboardShell>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Planos
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Até 20 confirmados é grátis. Acima disso, escolha a melhor forma de
        revelar os nomes.
      </p>

      {/* Assinatura atual */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Sua assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          {sub && sub.is_active ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">
                Ativa:{" "}
                <span className="font-semibold">
                  até {sub.capacity} convidados/mês
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onManage}
                disabled={portal.isPending}
              >
                <ExternalLink /> Gerenciar
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Plano <span className="font-medium text-foreground">grátis</span>{" "}
              (até 20 por evento).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Linha 1 — pagamento avulso por evento */}
      <PlanRow
        title="Pague por evento (avulso)"
        subtitle="Libere os nomes de um único evento. Sem mensalidade."
      >
        {tiers?.tiers.map((t) => (
          <PriceCell
            key={t.capacity}
            capacity={t.capacity}
            price={formatBRL(t.event_cents)}
            per="evento"
          />
        ))}
      </PlanRow>

      {/* Linha 2 — assinatura mensal */}
      <PlanRow
        title="Assinatura mensal"
        subtitle="Vale para eventos ilimitados dentro da faixa, enquanto ativa."
      >
        {tiers?.tiers.map((t) => {
          const current = sub?.is_active && sub.capacity === t.capacity;
          return (
            <button
              key={t.capacity}
              disabled={current || subscribe.isPending}
              onClick={() => onSubscribe(t.capacity)}
              className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-100 ${
                current
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <p className="text-sm font-medium">até {t.capacity}</p>
              <p className="font-display text-lg">
                {formatBRL(t.subscription_cents)}
                <span className="text-xs text-muted-foreground">/mês</span>
              </p>
              <p className="mt-1 text-xs text-primary">
                {current ? (
                  <span className="flex items-center gap-1">
                    <Check className="size-3" /> atual
                  </span>
                ) : (
                  "assinar"
                )}
              </p>
            </button>
          );
        })}
      </PlanRow>

      {/* Linha 3 — lista de presentes avulsa */}
      <PlanRow
        title="Lista de presentes"
        subtitle="Addon avulso por evento. Já incluso para assinantes ativos."
      >
        <div className="flex items-center gap-3 rounded-xl border border-border p-4">
          <Gift className="size-6 text-primary" />
          <div>
            <p className="font-display text-lg">
              {tiers ? formatBRL(tiers.gift_addon_cents) : "—"}
              <span className="text-xs text-muted-foreground"> /evento</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Libere direto na página do evento.
            </p>
          </div>
        </div>
      </PlanRow>
    </DashboardShell>
  );
}

