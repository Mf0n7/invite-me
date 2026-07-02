"use client";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL, formatDateTime } from "@/lib/utils";

// TODO: substituir por chamada real quando o endpoint `/admin/billing/` existir no backend.
const MONTHLY_REVENUE = 486_000;
const EVENT_PURCHASES_CENTS = 92_000;

const RECENT_PAYMENTS = [
  { id: 1, user: "Ana Souza", plan: "Premium", amount_cents: 3200, created_at: "2026-06-28T14:00:00Z" },
  { id: 2, user: "Bruno Lima", plan: "Plus", amount_cents: 4000, created_at: "2026-06-27T09:30:00Z" },
  { id: 3, user: "Carla Dias", plan: "Básico", amount_cents: 2000, created_at: "2026-06-26T18:15:00Z" },
  { id: 4, user: "Elaine Rocha", plan: "Premium", amount_cents: 3200, created_at: "2026-06-25T11:45:00Z" },
];

export default function AdminBillingPage() {
  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Faturamento
        </h1>
        <p className="text-sm text-muted-foreground">
          Receita de assinaturas e compras avulsas de eventos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assinaturas (mês atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatBRL(MONTHLY_REVENUE)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compras avulsas de eventos (mês atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold tracking-tight">
              {formatBRL(EVENT_PURCHASES_CENTS)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Pagamentos recentes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PAYMENTS.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{p.user}</td>
                  <td className="px-4 py-3">{p.plan}</td>
                  <td className="px-4 py-3">{formatBRL(p.amount_cents)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(p.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
