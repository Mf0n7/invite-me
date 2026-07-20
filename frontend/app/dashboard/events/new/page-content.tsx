"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { toast } from "sonner";

import { BackButton } from "@/components/shared/back-button";
import { DashboardShell } from "@/components/dashboard/shell";
import { EventForm } from "@/components/events/event-form";
import { apiErrorMessage } from "@/lib/api";
import { useCreateEvent, type EventInput } from "@/hooks/use-events";

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const handleSubmit = async (input: EventInput) => {
    try {
      const created = await createEvent.mutateAsync(input);
      posthog.capture("event_created", {
        event_id: created.uuid,
        allows_companions: input.allow_companions,
        max_companions: input.max_companions,
        has_photo: input.photo instanceof File,
      });
      toast.success("Evento criado!");
      router.push(`/dashboard/events/${created.uuid}/edit`);
    } catch (err) {
      posthog.captureException(err);
      toast.error(apiErrorMessage(err, "Não foi possível criar o evento."));
      throw err;
    }
  };

  return (
    <DashboardShell>
      <BackButton href="/dashboard" />
      <h1 className="mb-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Novo evento
      </h1>
      <div className="max-w-2xl">
        <EventForm onSubmit={handleSubmit} submitLabel="Criar evento" />
      </div>
    </DashboardShell>
  );
}
