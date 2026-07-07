"use client";

import { Shield } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/shell";
import { Card, CardContent } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";
import { PlanRow } from "@/components/billing/plan-row";
import { PriceCell } from "@/components/billing/price-cell";
import { CurrentSubscription } from "@/features/billing/components/current-subscription";
import { SubscriptionTierButton } from "@/features/billing/components/subscription-tier-button";
import { GiftAddonCard } from "@/features/billing/components/gift-addon-card";
import { useBillingPage } from "@/features/billing/hooks/use-billing-page";
import { useCheckoutToast } from "@/features/billing/hooks/use-checkout-toast";
import { useAuth } from "@/context/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  const { tiers, sub, onSubscribe, onManage, isSubscribing, isOpeningPortal } =
    useBillingPage();
  const { user } = useAuth();

  useCheckoutToast();

  if (user?.is_staff) {
    return (
      <DashboardShell>
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardContent className="pt-6">
            <Shield className="mx-auto mb-4 h-10 w-10 text-primary" />
            <p className="text-xl font-semibold">
              Você é admin da plataforma e pode usar à vontade!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              0 custo e serviço ilimitado.
            </p>
            <Button asChild className="mt-6">
              <Link href="/dashboard">Ir para eventos</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight sm:text-3xl">
        Planos
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Até 20 confirmados é grátis. Acima disso, escolha a melhor forma de
        revelar os nomes.
      </p>

      <CurrentSubscription
        sub={sub}
        onManage={onManage}
        isLoading={isOpeningPortal}
      />

      <PlanRow
        title="Pague por evento (avulso)"
        subtitle="Libere os nomes de um único evento. Sem mensalidade."
      >
        {tiers?.tiers.map((t) => (
          <PriceCell
            key={t.capacity}
            capacity={t.capacity}
            price={formatBRL(t.subscription_cents)}
            per="evento"
          />
        ))}
      </PlanRow>

      <PlanRow
        title="Assinatura mensal"
        subtitle="Vale para eventos ilimitados dentro da faixa, enquanto ativa."
      >
        {tiers?.tiers.map((t) => (
          <SubscriptionTierButton
            key={t.capacity}
            tier={t}
            sub={sub}
            onSubscribe={onSubscribe}
            isPending={isSubscribing}
          />
        ))}
      </PlanRow>

      <PlanRow
        title="Lista de presentes"
        subtitle="Addon avulso por evento. Já incluso para assinantes ativos."
      >
        <GiftAddonCard priceCents={tiers?.gift_addon_cents} />
      </PlanRow>
    </DashboardShell>
  );
}
