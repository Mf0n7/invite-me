"use client";

import { Check, Copy, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api";
import { useDeleteInvitation, useUpdateInvitation } from "@/hooks/use-invitations";
import type { Invitation } from "@/lib/types";

export function InvitationRow({ uuid, invitation }: { uuid: string; invitation: Invitation }) {
  const update = useUpdateInvitation(uuid);
  const remove = useDeleteInvitation(uuid);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(invitation.public_url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const rename = async () => {
    const novo = prompt("Novo nome:", invitation.guest_name);
    if (!novo || novo.trim() === invitation.guest_name) return;
    try {
      await update.mutateAsync({ id: invitation.id, guest_name: novo.trim() });
      toast.success("Nome atualizado.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível renomear."));
    }
  };

  const del = async () => {
    if (!confirm(`Excluir o convite de ${invitation.guest_name}?`)) return;
    try {
      await remove.mutateAsync(invitation.id);
      toast.success("Convite excluído.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir."));
    }
  };

  const confirmed = invitation.status === "confirmed";

  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <span className="flex-1 truncate text-sm">{invitation.guest_name}</span>
      <span
        className={
          confirmed
            ? "rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary"
            : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        }
      >
        {confirmed ? "Confirmado" : "Pendente"}
      </span>
      <Button type="button" variant="ghost" size="icon" onClick={copy} title="Copiar link">
        {copied ? <Check className="text-primary" /> : <Copy />}
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={rename} title="Renomear">
        <Pencil />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={del}
        title="Excluir"
        className="text-destructive"
      >
        <Trash2 />
      </Button>
    </li>
  );
}
