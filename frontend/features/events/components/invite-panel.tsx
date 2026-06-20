"use client";

import { Check, Copy, Lock, RefreshCw, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import { formatBRL, useEventCheckout, useTiers } from "@/lib/billing";
import { useEventLink, useEventRsvps, useRegenerateLink, useRsvpSummary } from "@/lib/events";
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

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.public_url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm("Gerar um novo link? O link anterior deixará de funcionar.")) return;
    try {
      await regenerate.mutateAsync();
      toast.success("Novo link gerado. O anterior foi anulado.");
    } catch (err) {
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
            onClick={handleRegenerate}
            disabled={regenerate.isPending}
          >
            <RefreshCw className={regenerate.isPending ? "animate-spin" : ""} /> Gerar novo link
          </Button>
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

function LockedNotice({ uuid, hidden }: { uuid: string; hidden: number }) {
  const { data: tiers } = useTiers();
  const checkout = useEventCheckout(uuid);
  const [open, setOpen] = useState(false);

  const buy = async (capacity: number) => {
    try {
      await checkout.mutateAsync(capacity);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível iniciar o pagamento."));
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <p className="flex items-center gap-2 text-sm">
        <Lock className="size-4 text-primary" />
        <span>
          <span className="font-medium">+{hidden} confirmado(s) ocultos.</span> Libere uma faixa
          para ver todos os nomes.
        </span>
      </p>
      {!open ? (
        <Button size="sm" className="mt-3" onClick={() => setOpen(true)}>
          Liberar faixa
        </Button>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {tiers?.tiers.map((t) => (
            <Button
              key={t.capacity}
              size="sm"
              variant="outline"
              disabled={checkout.isPending}
              onClick={() => buy(t.capacity)}
            >
              até {t.capacity} · {formatBRL(t.event_cents)}
            </Button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Prefere recorrente? Veja os planos em{" "}
        <a href="/dashboard/billing" className="text-primary hover:underline">
          assinatura
        </a>
        .
      </p>
    </div>
  );
}
