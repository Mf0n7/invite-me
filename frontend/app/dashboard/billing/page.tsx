"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { formatBRL } from "@/lib/utils";
import { PlanRow } from "@/components/billing/plan-row";
import { PriceCell } from "@/components/billing/price-cell";
import { CurrentSubscription } from "@/features/billing/components/current-subscription";
import { SubscriptionTierButton } from "@/features/billing/components/subscription-tier-button";
import { GiftAddonCard } from "@/features/billing/components/gift-addon-card";
import { useBillingPage } from "@/features/billing/hooks/use-billing-page";
import { useCheckoutToast } from "@/features/billing/hooks/use-checkout-toast";

export default function BillingPage() {
  const { tiers, sub, onSubscribe, onManage, isSubscribing, isOpeningPortal } =
    useBillingPage();

  useCheckoutToast();

  return (
    <DashboardShell>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
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
