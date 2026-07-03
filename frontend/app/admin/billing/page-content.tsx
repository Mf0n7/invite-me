"use client";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminBilling } from "@/hooks/use-admin";
import { formatBRL, formatDateTime } from "@/lib/utils";

export default function AdminBillingPage() {
  const { data, isLoading } = useAdminBilling();
  const recentPayments = data?.recent_payments ?? [];

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

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assinaturas (mês atual)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {formatBRL(data?.monthly_revenue_cents ?? 0)}
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
                  {formatBRL(data?.event_purchases_cents ?? 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Pagamentos recentes</CardTitle>
            </CardHeader>
            {recentPayments.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhum pagamento registrado ainda.
              </CardContent>
            ) : (
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
                    {recentPayments.map((p) => (
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
            )}
          </Card>
        </>
      )}
    </AdminShell>
  );
}
