"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, CheckCircle2, MapPin, PartyPopper } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { FieldError } from "@/components/auth/auth-shell";
import { GiftSection } from "@/components/public/gift-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiErrorMessage } from "@/lib/api";
import { useConfirmRsvp, usePublicEvent } from "@/lib/public";
import { confirmSchema, type ConfirmValues } from "@/lib/schemas";
import { formatDateTime } from "@/lib/utils";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { data: event, isLoading, isError } = usePublicEvent(token);
  const confirm = useConfirmRsvp(token);
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { name: "", companions: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "companions" });

  const setCompanionCount = (n: number) => {
    const current = fields.length;
    if (n > current) for (let i = current; i < n; i++) append({ name: "" });
    else for (let i = current; i > n; i--) remove(i - 1);
  };

  const onSubmit = async (values: ConfirmValues) => {
    try {
      const res = await confirm.mutateAsync({
        name: values.name,
        companion_names: values.companions.map((c) => c.name),
      });
      setConfirmedName(res.name);
    } catch (err) {
      setFormError(apiErrorMessage(err, "Não foi possível confirmar. Tente novamente."));
    }
  };

  if (isLoading) {
    return <Centered>Carregando convite…</Centered>;
  }
  if (isError || !event) {
    return (
      <Centered>
        <p className="font-display text-2xl">Convite indisponível</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Este link pode ter expirado ou sido substituído por um novo.
        </p>
      </Centered>
    );
  }

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center py-12">
      <Card className="w-full max-w-lg overflow-hidden">
        {event.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.photo} alt={event.title} className="h-48 w-full object-cover" />
        )}
        <CardHeader>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
            <PartyPopper className="size-4" /> Você está convidado
          </p>
          <CardTitle className="text-3xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {event.description && (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          )}

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              {formatDateTime(event.starts_at)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {event.address}
            </p>
            {event.location_link && (
              <a
                href={event.location_link}
                target="_blank"
                rel="noreferrer"
                className="inline-block pl-6 text-primary hover:underline"
              >
                Ver no mapa
              </a>
            )}
          </div>

          {event.note && (
            <p className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
              {event.note}
            </p>
          )}

          <hr className="border-border" />

          {confirmedName ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="size-12 text-primary" />
              <p className="mt-3 font-display text-xl">Presença confirmada!</p>
              <p className="text-sm text-muted-foreground">
                Até lá, {confirmedName}. 🎉
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" {...register("name")} placeholder="Como você se chama?" />
                <FieldError message={errors.name?.message} />
              </div>

              {event.allow_companions && event.max_companions > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="companions_count">Acompanhantes</Label>
                  <select
                    id="companions_count"
                    value={fields.length}
                    onChange={(e) => setCompanionCount(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {Array.from({ length: event.max_companions + 1 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0 ? "Vou sozinho(a)" : `+${i} acompanhante${i > 1 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>

                  {fields.map((field, i) => (
                    <div key={field.id} className="space-y-1">
                      <Input
                        placeholder={`Nome do acompanhante ${i + 1}`}
                        {...register(`companions.${i}.name` as const)}
                      />
                      <FieldError message={errors.companions?.[i]?.name?.message} />
                    </div>
                  ))}
                </div>
              )}

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Confirmando…" : "Confirmar presença"}
              </Button>
            </form>
          )}

          <GiftSection token={token} />
        </CardContent>
      </Card>
      <p className="mt-6 text-xs text-muted-foreground/70">
        Powered by <span className="font-display text-primary">Convida</span>
      </p>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="container flex min-h-screen flex-col items-center justify-center text-center">
      {children}
    </main>
  );
}
