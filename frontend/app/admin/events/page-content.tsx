"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { AdminShell } from "@/components/admin/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminEvents } from "@/hooks/use-admin";
import { formatDateTime } from "@/lib/utils";

export default function AdminEventsPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAdminEvents();
  const events = useMemo(() => data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        event.owner_name.toLowerCase().includes(q) ||
        event.owner_email.toLowerCase().includes(q),
    );
  }, [query, events]);

  return (
    <AdminShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {events.length} eventos
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por evento ou dono…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            {events.length === 0
              ? "Nenhum evento cadastrado ainda."
              : "Nenhum evento encontrado para essa busca."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Evento</th>
                  <th className="px-4 py-3 font-medium">Dono</th>
                  <th className="px-4 py-3 font-medium">Data do evento</th>
                  <th className="px-4 py-3 font-medium">Confirmados</th>
                  <th className="px-4 py-3 font-medium">Convidados</th>
                  <th className="px-4 py-3 font-medium">Presentes</th>
                  <th className="px-4 py-3 font-medium">Criado em</th>
                  <th className="px-4 py-3 font-medium">Atualizado em</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/admin/events/${event.uuid}`}
                        className="hover:underline"
                      >
                        {event.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{event.owner_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.owner_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(event.starts_at)}
                    </td>
                    <td className="px-4 py-3">{event.confirmations}</td>
                    <td className="px-4 py-3">{event.total_guests}</td>
                    <td className="px-4 py-3">{event.gifts_count}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(event.created_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDateTime(event.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </AdminShell>
  );
}
