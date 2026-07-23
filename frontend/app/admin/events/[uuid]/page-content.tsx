"use client";

import { useParams } from "next/navigation";
import Image from "next/image";

import { AdminShell } from "@/components/admin/shell";
import { BackButton } from "@/components/shared/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminEvent } from "@/hooks/use-admin";
import { cn, formatBRL, formatDateTime } from "@/lib/utils";
import defaultAvatar from "@/app/icon.png";

const invitationStatusLabel: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
};

const giftStatusLabel: Record<string, string> = {
  available: "Disponível",
  reserved: "Reservado",
};

const purchaseStatusLabel: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
};

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
        active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export default function AdminEventDetailPage() {
  const params = useParams<{ uuid: string }>();
  const { data: event, isLoading, isError } = useAdminEvent(params.uuid);

  return (
    <AdminShell>
      <BackButton href="/admin/events" />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : isError || !event ? (
        <p className="text-destructive">Evento não encontrado.</p>
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatDateTime(event.starts_at)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dono do evento</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Image
                  src={event.owner.avatar_url || defaultAvatar}
                  alt={event.owner.full_name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
                <div>
                  <p className="font-medium">
                    {event.owner.full_name || "Não informado"}
                  </p>
                  <p className="text-sm text-muted-foreground">{event.owner.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Endereço: </span>
                  {event.address || "—"}
                </p>
                {event.location_link && (
                  <p>
                    <span className="text-muted-foreground">Localização: </span>
                    <a
                      href={event.location_link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {event.location_link}
                    </a>
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Acompanhantes: </span>
                  {event.allow_companions
                    ? `permitido, até ${event.max_companions}`
                    : "não permitido"}
                </p>
                {event.note && (
                  <p>
                    <span className="text-muted-foreground">Observação: </span>
                    {event.note}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Criado em: </span>
                  {formatDateTime(event.created_at)}
                </p>
                <p>
                  <span className="text-muted-foreground">Atualizado em: </span>
                  {formatDateTime(event.updated_at)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {event.confirmations}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de convidados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  {event.total_guests}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confirmados</CardTitle>
            </CardHeader>
            {event.attendees.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhuma confirmação ainda.
              </CardContent>
            ) : (
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Nome</th>
                      <th className="px-4 py-3 font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.attendees.map((person, i) => (
                      <tr
                        key={`${person.rsvp_id}-${i}`}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">{person.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {person.is_companion
                            ? `Acompanhante de ${person.group_name}`
                            : "Convidado"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Convites nominais</CardTitle>
            </CardHeader>
            {event.invitations.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhum convite nominal cadastrado.
              </CardContent>
            ) : (
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Convidado</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Confirmado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.invitations.map((invitation) => (
                      <tr
                        key={invitation.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {invitation.guest_name}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            active={invitation.status === "confirmed"}
                            label={invitationStatusLabel[invitation.status]}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {invitation.confirmed_at
                            ? formatDateTime(invitation.confirmed_at)
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de presentes</CardTitle>
            </CardHeader>
            {event.gifts.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhum presente cadastrado.
              </CardContent>
            ) : (
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Presente</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Reservado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.gifts.map((gift) => (
                      <tr key={gift.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-3 font-medium">{gift.title}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            active={gift.status === "reserved"}
                            label={giftStatusLabel[gift.status]}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {gift.claimed_by_name || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compras</CardTitle>
            </CardHeader>
            {event.purchases.length === 0 ? (
              <CardContent className="py-16 text-center text-sm text-muted-foreground">
                Nenhuma compra registrada.
              </CardContent>
            ) : (
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Tipo</th>
                      <th className="px-4 py-3 font-medium">Capacidade</th>
                      <th className="px-4 py-3 font-medium">Valor</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.purchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3 font-medium">
                          {purchase.kind === "gift" ? "Lista de presentes" : "Capacidade"}
                        </td>
                        <td className="px-4 py-3">{purchase.capacity || "—"}</td>
                        <td className="px-4 py-3">{formatBRL(purchase.amount_cents)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            active={purchase.status === "paid"}
                            label={purchaseStatusLabel[purchase.status]}
                          />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDateTime(purchase.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </AdminShell>
  );
}
