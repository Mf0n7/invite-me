"use client";

import { Check, Copy, Pencil, Trash2, Upload, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import {
  useCreateInvitation,
  useDeleteInvitation,
  useImportInvitations,
  useInvitations,
  useUpdateInvitation,
} from "@/lib/invitations";
import type { Invitation } from "@/lib/types";

export function NominalInvitesPanel({ uuid }: { uuid: string }) {
  const { data } = useInvitations(uuid);
  const create = useCreateInvitation(uuid);
  const importFile = useImportInvitations(uuid);
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const invitations = data?.results ?? [];

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      await create.mutateAsync(name.trim());
      setName("");
      toast.success("Convite criado.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível criar o convite."));
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await importFile.mutateAsync(file);
      toast.success(`${res.created} convidado(s) importado(s).`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Falha ao importar a planilha."));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Convites nominais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-2">
          <Input
            placeholder="Nome do convidado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd} disabled={create.isPending}>
            <UserPlus /> Adicionar
          </Button>
        </div>

        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xlsm"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={importFile.isPending}
          >
            <Upload /> {importFile.isPending ? "Importando…" : "Importar planilha (.csv / .xlsx)"}
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            A primeira coluna deve conter os nomes. Cabeçalho &quot;nome&quot; é ignorado.
          </p>
        </div>

        {invitations.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {invitations.map((inv) => (
              <InvitationRow key={inv.id} uuid={uuid} invitation={inv} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function InvitationRow({ uuid, invitation }: { uuid: string; invitation: Invitation }) {
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
