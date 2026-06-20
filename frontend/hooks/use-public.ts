"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { PublicEvent } from "@/lib/types";

export type PublicNominal = {
  guest_name: string;
  status: "pending" | "confirmed";
  event: PublicEvent;
};

export function usePublicEvent(token: string) {
  return useQuery({
    queryKey: ["public-event", token],
    queryFn: () => apiFetch<PublicEvent>(`/invite/${token}/`, { anonymous: true }),
    enabled: !!token,
    retry: false,
  });
}

export type ConfirmInput = { name: string; companion_names: string[] };

export function useConfirmRsvp(token: string) {
  return useMutation({
    mutationFn: (input: ConfirmInput) =>
      apiFetch<{ detail: string; name: string }>(`/invite/${token}/confirm/`, {
        method: "POST",
        anonymous: true,
        body: input,
      }),
  });
}

export function usePublicNominal(token: string) {
  return useQuery({
    queryKey: ["public-nominal", token],
    queryFn: () => apiFetch<PublicNominal>(`/nominal/${token}/`, { anonymous: true }),
    enabled: !!token,
    retry: false,
  });
}

export function useConfirmNominal(token: string) {
  return useMutation({
    mutationFn: (companion_names: string[]) =>
      apiFetch<{ detail: string; name: string }>(`/nominal/${token}/confirm/`, {
        method: "POST",
        anonymous: true,
        body: { companion_names },
      }),
  });
}
