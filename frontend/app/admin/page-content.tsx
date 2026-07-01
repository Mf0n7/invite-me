"use client";

import { CalendarPlus, CreditCard, TrendingUp, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/utils";

// TODO: substituir por chamada real quando o endpoint `/admin/overview/` existir no backend.
const OVERVIEW = {
  mrr_cents: 486_000,
  active_subscriptions: 132,
  active_users_30d: 918,
  new_users_30d: 74,
};

const PLAN_BREAKDOWN = [
  { name: "Básico", subscribers: 58, mrr_cents: 116_000 },
  { name: "Plus", subscribers: 51, mrr_cents: 204_000 },
  { name: "Premium", subscribers: 23, mrr_cents: 166_000 },
];

const STATS = [
  { label: "Receita recorrente (MRR)", value: formatBRL(OVERVIEW.mrr_cents), icon: TrendingUp },
  { label: "Assinantes ativos", value: OVERVIEW.active_subscriptions, icon: CreditCard },
  { label: "Usuários ativos (30d)", value: OVERVIEW.active_users_30d, icon: Users },
  { label: "Novos usuários (30d)", value: OVERVIEW.new_users_30d, icon: CalendarPlus },
];

export default function AdminOverviewPage() {
  const maxPlanRevenue = Math.max(...PLAN_BREAKDOWN.map((p) => p.mrr_cents));

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Visão geral
        </h1>
        <p className="text-sm text-muted-foreground">
          Métricas do negócio — faturamento e uso da plataforma.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Faturamento por plano</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {PLAN_BREAKDOWN.map((plan) => (
            <div key={plan.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{plan.name}</span>
                <span className="text-muted-foreground">
                  {plan.subscribers} assinantes · {formatBRL(plan.mrr_cents)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${(plan.mrr_cents / maxPlanRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
