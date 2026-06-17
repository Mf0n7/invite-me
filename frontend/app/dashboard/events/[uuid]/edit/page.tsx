"use client";

import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/dashboard/shell";
import { EventForm } from "@/components/events/event-form";
import { InvitePanel } from "@/components/events/invite-panel";
import { NominalInvitesPanel } from "@/components/events/nominal-invites-panel";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useDeleteEvent, useEvent, useUpdateEvent, type EventInput } from "@/lib/events";

export default function EditEventPage() {
  const params = useParams<{ uuid: string }>();
  const uuid = params.uuid;
  const router = useRouter();

  const { data: event, isLoading, isError } = useEvent(uuid);
  const updateEvent = useUpdateEvent(uuid);
  const deleteEvent = useDeleteEvent();
  const qc = useQueryClient();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "success") {
      toast.success("Pagamento recebido! Liberando a faixa…");
      qc.invalidateQueries({ queryKey: ["events", uuid] });
    } else if (status === "cancel") {
      toast.info("Pagamento cancelado.");
    }
  }, [qc, uuid]);

  const handleSubmit = async (input: EventInput) => {
    try {
      await updateEvent.mutateAsync(input);
      toast.success("Alterações salvas.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível salvar."));
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!confirm("Excluir este evento? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteEvent.mutateAsync(uuid);
      toast.success("Evento excluído.");
      router.push("/dashboard");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir."));
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

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : isError || !event ? (
        <p className="text-destructive">Evento não encontrado.</p>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="font-display text-3xl font-semibold tracking-tight">{event.title}</h1>
            <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
              <Trash2 className="size-4" /> Excluir
            </Button>
          </div>
          <div className="max-w-2xl space-y-8">
            <InvitePanel uuid={uuid} />
            <NominalInvitesPanel uuid={uuid} />
            <EventForm event={event} onSubmit={handleSubmit} submitLabel="Salvar alterações" />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
