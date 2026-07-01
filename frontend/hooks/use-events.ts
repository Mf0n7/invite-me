"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { EventItem, EventLink, Paginated, RsvpList, RsvpSummary } from "@/lib/types";

export type EventInput = {
  title: string;
  description?: string;
  address: string;
  location_link?: string;
  starts_at: string;
  note?: string;
  allow_companions: boolean;
  max_companions: number;
  photo?: File | null;
};

const KEY = "events";

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
