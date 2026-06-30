"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Field } from "@/components/shared/field";
import { FieldError } from "@/components/shared/field-error";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { type EventInput } from "@/hooks/use-events";
import { cn, isoToLocalInput, localInputToIso } from "@/lib/utils";
import { eventSchema, type EventFormValues } from "@/lib/schemas";
import type { EventItem } from "@/lib/types";

function parseStartsAt(val: string): { date: Date | undefined; time: string } {
  if (!val) return { date: undefined, time: "" };
  const [datePart, timePart] = val.split("T");
  const parsed = parse(datePart, "yyyy-MM-dd", new Date());
  return {
    date: isNaN(parsed.getTime()) ? undefined : parsed,
    time: timePart ?? "",
  };
}

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
  const [calendarOpen, setCalendarOpen] = useState(false);

  const initialStartsAt = event ? isoToLocalInput(event.starts_at) : "";
  const { date: initialDate, time: initialTime } = parseStartsAt(initialStartsAt);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description,
          address: event.address,
          location_link: event.location_link,
          starts_at: initialStartsAt,
          note: event.note,
          allow_companions: event.allow_companions,
          max_companions: event.max_companions,
        }
      : { allow_companions: false, max_companions: 0 },
  });

  const allowCompanions = watch("allow_companions");

  function buildStartsAt(date: Date | undefined, time: string): string {
    if (!date || !time) return "";
    return `${format(date, "yyyy-MM-dd")}T${time}`;
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    setCalendarOpen(false);
    setValue("starts_at", buildStartsAt(date, selectedTime), { shouldValidate: true });
  }

  function handleTimeChange(time: string) {
    setSelectedTime(time);
    setValue("starts_at", buildStartsAt(selectedDate, time), { shouldValidate: true });
  }

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
        <Input
          {...register("title")}
          autoFocus
          placeholder="Ex.: Aniversário da Ana"
        />
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

        <Field label="Data e horário" error={errors.starts_at?.message} required>
          <input type="hidden" {...register("starts_at")} />
          <div className="flex gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={{ before: new Date() }}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="w-32"
            />
          </div>
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
