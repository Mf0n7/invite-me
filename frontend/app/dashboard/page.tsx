"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Plus } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEvents } from "@/lib/events";
import { formatDateTime } from "@/lib/utils/index";

export default function DashboardPage() {
  const { data, isLoading } = useEvents();
  const events = data?.results ?? [];

  return (
    <DashboardShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Seus eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            Crie e gerencie suas comemorações.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus /> Criar evento
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : events.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <Link key={ev.uuid} href={`/dashboard/events/${ev.uuid}/edit`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="text-xl">{ev.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    {formatDateTime(ev.starts_at)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span className="line-clamp-1">{ev.address}</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <CardContent className="pt-6">
        <p className="font-display text-xl">Nenhum evento ainda</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Que tal criar o primeiro? Leva menos de um minuto.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/events/new">
            <Plus /> Criar evento
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
