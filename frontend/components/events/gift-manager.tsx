"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import { useCreateGift, useDeleteGift, useGifts } from "@/hooks/use-gifts";

export function GiftManager({ uuid }: { uuid: string }) {
  const { data } = useGifts(uuid);
  const create = useCreateGift(uuid);
  const remove = useDeleteGift(uuid);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const items = data?.items ?? [];

  const add = async () => {
    if (!title.trim()) return;
    try {
      await create.mutateAsync({ title: title.trim(), url: url.trim() || undefined });
      setTitle("");
      setUrl("");
      toast.success("Presente adicionado.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível adicionar."));
    }
  };

  const del = async (id: number) => {
    if (!confirm("Excluir este presente?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Presente excluído.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível excluir."));
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Input placeholder="Nome do presente" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex gap-2">
          <Input
            placeholder="Link da loja (opcional)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={add} disabled={create.isPending}>
            <Plus /> Adicionar
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {items.map((g) => {
            const reserved = g.status === "reserved";
            return (
              <li key={g.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <div className="flex-1">
                  <span className={reserved ? "text-muted-foreground line-through" : "font-medium"}>
                    {g.title}
                  </span>
                  {reserved && (
                    <span className="ml-2 text-xs text-primary">
                      reservado por {g.claimed_by_name}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => del(g.id)}
                  className="text-destructive"
                  title="Excluir"
                >
                  <Trash2 />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
