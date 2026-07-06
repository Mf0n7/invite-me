"use client";

import { CalendarPlus, CreditCard, TrendingUp, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOverview } from "@/hooks/use-admin";
import { formatBRL } from "@/lib/utils";

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview();
  const planBreakdown = data?.plan_breakdown ?? [];
  const maxPlanRevenue = Math.max(1, ...planBreakdown.map((p) => p.mrr_cents));

  const stats = data
    ? [
        { label: "Receita recorrente (MRR)", value: formatBRL(data.mrr_cents), icon: TrendingUp },
        { label: "Assinantes ativos", value: data.active_subscriptions, icon: CreditCard },
        { label: "Usuários ativos (30d)", value: data.active_users_30d, icon: Users },
        { label: "Novos usuários (30d)", value: data.new_users_30d, icon: CalendarPlus },
      ]
    : [];

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Visão geral
        </h1>
        <p className="text-sm text-muted-foreground">
          Métricas do negócio — faturamento e uso da plataforma.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
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
            {planBreakdown.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhuma assinatura ativa ainda.
              </CardContent>
            ) : (
              <CardContent className="space-y-4">
                {planBreakdown.map((plan) => (
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
            )}
          </Card>
        </>
      )}
    </AdminShell>
  );
}
