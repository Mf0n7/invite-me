"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/shell";
import { EventForm } from "@/components/events/event-form";
import { apiErrorMessage } from "@/lib/api";
import { useCreateEvent, type EventInput } from "@/lib/events";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const handleSubmit = async (input: EventInput) => {
    try {
      const created = await createEvent.mutateAsync(input);
      toast.success("Evento criado!");
      router.push(`/dashboard/events/${created.uuid}/edit`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar o evento."));
      throw err;
    }
  };

  return (
    <DashboardShell>
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Novo evento</h1>
      <div className="max-w-2xl">
        <EventForm onSubmit={handleSubmit} submitLabel="Criar evento" />
      </div>
    </DashboardShell>
  );
}
