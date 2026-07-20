"use client";

import { Check, Copy, RefreshCw, Users } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import { useEventLink, useEventRsvps, useRegenerateLink, useRsvpSummary } from "@/hooks/use-events";
import { LockedNotice } from "@/components/events/locked-notice";
import type { RsvpPerson } from "@/lib/types";

type PersonGroup = { rsvpId: number; guest: string | null; companions: string[] };

/** Agrupa pessoas (já achatadas e em ordem) por confirmação, preservando a sequência. */
function groupPeople(people: RsvpPerson[]): PersonGroup[] {
  const groups: PersonGroup[] = [];
  for (const p of people) {
    let g = groups[groups.length - 1];
    if (!g || g.rsvpId !== p.rsvp_id) {
      g = { rsvpId: p.rsvp_id, guest: null, companions: [] };
      groups.push(g);
    }
    if (p.is_companion) g.companions.push(p.name);
    else g.guest = p.name;
  }
  return groups;
}

export function InvitePanel({ uuid }: { uuid: string }) {
  const { data: link, isLoading } = useEventLink(uuid);
  const { data: summary } = useRsvpSummary(uuid);
  const { data: rsvps } = useEventRsvps(uuid);
  const regenerate = useRegenerateLink(uuid);
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.public_url);
    posthog.capture("invite_link_copied", { event_id: uuid });
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    try {
      await regenerate.mutateAsync();
      toast.success("Novo link gerado. O anterior foi anulado.");
    } catch (err) {
      posthog.captureException(err);
      toast.error(apiErrorMessage(err, "Não foi possível regenerar o link."));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Convite & confirmações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4 rounded-lg border border-border bg-background/40 p-4">
          <Users className="size-8 text-primary" />
          <div>
            <p className="text-3xl font-semibold leading-none">{summary?.total_guests ?? 0}</p>
            <p className="text-sm text-muted-foreground">
              pessoas confirmadas · {summary?.confirmations ?? 0} convidado(s)
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Link de convite</p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={isLoading ? "Carregando…" : (link?.public_url ?? "")}
              className="font-mono text-xs"
            />
            <Button type="button" variant="outline" size="icon" onClick={copy} disabled={!link}>
              {copied ? <Check className="text-primary" /> : <Copy />}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-muted-foreground"
            onClick={() => setConfirmOpen(true)}
            disabled={regenerate.isPending}
          >
            <RefreshCw className={regenerate.isPending ? "animate-spin" : ""} /> Gerar novo link
          </Button>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Gerar novo link"
            description="O link anterior deixará de funcionar."
            confirmLabel="Gerar novo link"
            destructive={false}
            onConfirm={handleRegenerate}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Confirmados</p>
          {!rsvps || rsvps.total_confirmations === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ninguém confirmou ainda. Compartilhe o link acima.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {groupPeople(rsvps.revealed_people).map((g, gi) => (
                  <li key={`${g.rsvpId}-${gi}`} className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{g.guest ?? g.companions[0]}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        convidado
                      </span>
                    </div>
                    {g.companions.map((c, ci) => (
                      <div key={ci} className="mt-1 flex items-center gap-2 pl-4 text-muted-foreground">
                        <span className="text-xs">↳</span>
                        <span>{c}</span>
                        <span className="text-xs">acompanhante</span>
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
              {rsvps.is_limited && <LockedNotice uuid={uuid} hidden={rsvps.hidden_count} />}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

