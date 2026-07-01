"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Gift, LinkIcon, Pencil, Trash2, Users } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { BackButton } from "@/components/shared/back-button";
import { DashboardShell } from "@/components/dashboard/shell";
import { EventForm } from "@/components/events/event-form";
import { GiftPanel } from "@/components/events/gift-panel";
import { InvitePanel } from "@/components/events/invite-panel";
import { NominalInvitesPanel } from "@/components/events/nominal-invites-panel";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useDeleteEvent, useEvent, useUpdateEvent, type EventInput } from "@/hooks/use-events";

const SECTIONS = [
  { id: "convite", label: "Link", icon: LinkIcon },
  { id: "nominais", label: "Convites nominais", icon: Users },
  { id: "presentes", label: "Lista de presentes", icon: Gift },
  { id: "dados", label: "Dados do evento", icon: Pencil },
];

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
      toast.success("Pagamento recebido! Liberando o acesso…");
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
      <BackButton href="/dashboard" />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando…</p>
      ) : isError || !event ? (
        <p className="text-destructive">Evento não encontrado.</p>
      ) : (
        <>
          <div className="mb-5 flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {event.title}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="shrink-0 text-destructive"
            >
              <Trash2 className="size-4" /> <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>

          <nav className="sticky top-[6.5rem] z-20 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-border bg-background/80 px-4 pb-2 backdrop-blur sm:top-[6.75rem]">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" /> {label}
              </a>
            ))}
          </nav>

          <div className="max-w-2xl space-y-8">
            <section id="convite" className="scroll-mt-40">
              <InvitePanel uuid={uuid} />
            </section>
            <section id="nominais" className="scroll-mt-40">
              <NominalInvitesPanel uuid={uuid} />
            </section>
            <section id="presentes" className="scroll-mt-40">
              <GiftPanel uuid={uuid} />
            </section>
            <section id="dados" className="scroll-mt-40">
              <EventForm event={event} onSubmit={handleSubmit} submitLabel="Salvar alterações" />
            </section>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
