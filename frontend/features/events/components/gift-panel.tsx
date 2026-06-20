"use client";

import { Gift, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiErrorMessage } from "@/lib/api";
import { formatBRL, useTiers } from "@/lib/billing";
import { useCreateGift, useDeleteGift, useGiftCheckout, useGifts } from "@/lib/gifts";

export function GiftPanel({ uuid }: { uuid: string }) {
  const { data } = useGifts(uuid);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Lista de presentes</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.entitled ? <GiftManager uuid={uuid} /> : <GiftCta uuid={uuid} />}
      </CardContent>
    </Card>
  );
}

function GiftCta({ uuid }: { uuid: string }) {
  const { data: tiers } = useTiers();
  const checkout = useGiftCheckout(uuid);
  const price = tiers?.gift_addon_cents ? formatBRL(tiers.gift_addon_cents) : "";

  const buy = async () => {
    try {
      await checkout.mutateAsync();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Não foi possível iniciar o pagamento."));
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-5 text-center">
      <Gift className="mx-auto size-8 text-primary" />
      <p className="mt-2 font-medium">Adicione uma lista de presentes</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Seus convidados reservam o que vão presentear — sem repetição.
      </p>
      <Button className="mt-4" onClick={buy} disabled={checkout.isPending}>
        Liberar {price && `por ${price}`}
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">
        Já incluso para assinantes — veja em{" "}
        <a href="/dashboard/billing" className="text-primary hover:underline">
          Planos
        </a>
        .
      </p>
    </div>
  );
}

function GiftManager({ uuid }: { uuid: string }) {
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
