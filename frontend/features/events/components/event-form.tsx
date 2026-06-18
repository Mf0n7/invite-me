"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { FieldError } from "@/features/auth/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  isoToLocalInput,
  localInputToIso,
  type EventInput,
} from "@/lib/events";
import { eventSchema, type EventFormValues } from "@/lib/schemas";
import type { EventItem } from "@/lib/types";

export function EventForm({
  event,
  onSubmit,
  submitLabel,
}: {
  event?: EventItem;
  onSubmit: (input: EventInput) => Promise<void>;
  submitLabel: string;
}) {
  const [photo, setPhoto] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          address: event.address,
          location_link: event.location_link,
          starts_at: isoToLocalInput(event.starts_at),
          note: event.note,
          allow_companions: event.allow_companions,
          max_companions: event.max_companions,
        }
      : { allow_companions: false, max_companions: 0 },
  });

  const allowCompanions = watch("allow_companions");

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      title: values.title,
      description: values.description || "",
      address: values.address,
      location_link: values.location_link || "",
      starts_at: localInputToIso(values.starts_at),
      note: values.note || "",
      allow_companions: values.allow_companions,
      max_companions: values.allow_companions ? values.max_companions : 0,
      photo,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Título" error={errors.title?.message} required>
        <Input {...register("title")} placeholder="Ex.: Aniversário da Ana" />
      </Field>

      <Field label="Descrição" error={errors.description?.message}>
        <Textarea
          {...register("description")}
          placeholder="Conte do que se trata (opcional)"
        />
      </Field>

      <Field label="Foto" error={undefined}>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
        {event?.photo && !photo && (
          <p className="text-xs text-muted-foreground">
            Já existe uma foto. Envie outra para trocar.
          </p>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Endereço" error={errors.address?.message} required>
          <Input {...register("address")} placeholder="Rua, número, bairro" />
        </Field>
        <Field
          label="Data e horário"
          error={errors.starts_at?.message}
          required
        >
          <Input type="datetime-local" {...register("starts_at")} />
        </Field>
      </div>

      <Field label="Link da localização" error={errors.location_link?.message}>
        <Input
          {...register("location_link")}
          placeholder="https://maps.google.com/… (opcional)"
        />
      </Field>

      <Field label="Observação" error={errors.note?.message}>
        <Textarea
          {...register("note")}
          placeholder="Traje, recados, estacionamento… (opcional)"
        />
      </Field>

      <div className="rounded-lg border border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allow_companions">Permitir acompanhantes</Label>
            <p className="text-xs text-muted-foreground">
              Convidados podem levar mais pessoas.
            </p>
          </div>
          <Controller
            control={control}
            name="allow_companions"
            render={({ field }) => (
              <Switch
                id="allow_companions"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {allowCompanions && (
          <div className="mt-4">
            <Label htmlFor="max_companions">
              Máximo de acompanhantes por convidado
            </Label>
            <Input
              id="max_companions"
              type="number"
              min={1}
              max={20}
              className="mt-1.5 w-32"
              {...register("max_companions")}
            />
            <FieldError message={errors.max_companions?.message} />
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-primary">*</span>}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
