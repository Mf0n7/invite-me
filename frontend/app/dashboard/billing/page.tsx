"use client";

import { Check, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiErrorMessage } from "@/lib/api";
import {
  formatBRL,
  usePortal,
  useSubscription,
  useSubscriptionCheckout,
  useTiers,
} from "@/lib/billing";

export default function BillingPage() {
  const { data: tiers } = useTiers();
  const { data: sub } = useSubscription();
  const subscribe = useSubscriptionCheckout();
  const portal = usePortal();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success") toast.success("Assinatura ativada! Pode levar alguns segundos.");
    if (status === "cancel") toast.info("Checkout cancelado.");
  }, []);

  const onSubscribe = async (capacity: number) => {
    try {
      await subscribe.mutateAsync(capacity);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível iniciar a assinatura."));
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
      <h1 className="mb-1 font-display text-3xl font-semibold tracking-tight">Planos</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Eventos com até 20 confirmados são grátis. Para revelar mais nomes, assine uma faixa
        (mensal, vale para todos os seus eventos) ou pague avulso direto no evento.
      </p>

      <Card className="mb-8 max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Sua assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          {sub && sub.is_active ? (
            <div className="space-y-3">
              <p className="text-sm">
                Plano ativo: <span className="font-semibold">até {sub.capacity} convidados/mês</span>
              </p>
              <Button variant="outline" size="sm" onClick={onManage} disabled={portal.isPending}>
                <ExternalLink /> Gerenciar assinatura
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Você está no plano <span className="font-medium text-foreground">grátis</span> (até 20
              convidados por evento).
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiers?.tiers.map((t) => {
          const current = sub?.is_active && sub.capacity === t.capacity;
          return (
            <Card key={t.capacity} className={current ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle className="text-lg">Até {t.capacity} convidados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-display text-2xl">
                  {formatBRL(t.amount_cents)}
                  <span className="text-sm text-muted-foreground">/mês</span>
                </p>
                <Button
                  className="w-full"
                  variant={current ? "secondary" : "default"}
                  disabled={current || subscribe.isPending}
                  onClick={() => onSubscribe(t.capacity)}
                >
                  {current ? (
                    <>
                      <Check /> Plano atual
                    </>
                  ) : (
                    "Assinar"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardShell>
  );
}
