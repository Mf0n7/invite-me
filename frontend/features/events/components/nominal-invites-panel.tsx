"use client";

import { Upload, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import {
  useCreateInvitation,
  useImportInvitations,
  useInvitations,
} from "@/hooks/use-invitations";
import { InvitationRow } from "@/features/events/components/invitation-row";

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

