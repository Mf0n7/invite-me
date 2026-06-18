"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";
import type { EventItem, EventLink, Paginated, RsvpList, RsvpSummary } from "./types";

export type EventInput = {
  title: string;
  description?: string;
  address: string;
  location_link?: string;
  starts_at: string; // ISO
  note?: string;
  allow_companions: boolean;
  max_companions: number;
  photo?: File | null;
};

const KEY = "events";

/** Monta JSON ou FormData (quando há foto a enviar). */
function buildBody(input: EventInput): unknown {
  const { photo, ...rest } = input;
  if (photo instanceof File) {
    const fd = new FormData();
    Object.entries(rest).forEach(([k, v]) => fd.append(k, String(v)));
    fd.append("photo", photo);
    return fd;
  }
  return rest;
}

export function useEvents() {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => apiFetch<Paginated<EventItem>>("/events/"),
  });
}

export function useEvent(uuid: string | undefined) {
  return useQuery({
    queryKey: [KEY, uuid],
    queryFn: () => apiFetch<EventItem>(`/events/${uuid}/`),
    enabled: !!uuid,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EventInput) =>
      apiFetch<EventItem>("/events/", { method: "POST", body: buildBody(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateEvent(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EventInput) =>
      apiFetch<EventItem>(`/events/${uuid}/`, { method: "PATCH", body: buildBody(input) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: [KEY, uuid] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uuid: string) => apiFetch<void>(`/events/${uuid}/`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

// ---- Link público de convite + resumo de confirmações ----

export function useEventLink(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, "link"],
    queryFn: () => apiFetch<EventLink>(`/events/${uuid}/link/`),
    enabled: !!uuid,
  });
}

export function useRegenerateLink(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<EventLink>(`/events/${uuid}/link/`, { method: "POST" }),
    onSuccess: (data) => qc.setQueryData([KEY, uuid, "link"], data),
  });
}

export function useRsvpSummary(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, "summary"],
    queryFn: () => apiFetch<RsvpSummary>(`/events/${uuid}/rsvps/summary/`),
    enabled: !!uuid,
  });
}

export function useEventRsvps(uuid: string) {
  return useQuery({
    queryKey: [KEY, uuid, "rsvps"],
    queryFn: () => apiFetch<RsvpList>(`/events/${uuid}/rsvps/`),
    enabled: !!uuid,
  });
}

/** ISO (com tz) -> valor de <input type="datetime-local"> no fuso local. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** Valor de datetime-local (local) -> ISO com offset. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
