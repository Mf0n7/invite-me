"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { GiftItem, GiftListResponse, PublicGift } from "@/lib/types";

const key = (uuid: string) => ["events", uuid, "gifts"];

export type GiftInput = { title: string; description?: string; url?: string };

export function useGifts(uuid: string) {
  return useQuery({
    queryKey: key(uuid),
    queryFn: () => apiFetch<GiftListResponse>(`/events/${uuid}/gifts/`),
    enabled: !!uuid,
  });
}

export function useCreateGift(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GiftInput) =>
      apiFetch<GiftItem>(`/events/${uuid}/gifts/`, { method: "POST", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useUpdateGift(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: GiftInput & { id: number }) =>
      apiFetch<GiftItem>(`/gifts/${id}/`, { method: "PATCH", body: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useDeleteGift(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/gifts/${id}/`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useGiftCheckout(uuid: string) {
  return useMutation({
    mutationFn: () =>
      apiFetch<{ checkout_url: string }>(`/billing/events/${uuid}/gift-checkout/`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });
}

export function usePublicGifts(token: string) {
  return useQuery({
    queryKey: ["public-gifts", token],
    queryFn: () => apiFetch<PublicGift[]>(`/public/${token}/gifts/`, { anonymous: true }),
    enabled: !!token,
  });
}

export function useClaimGift(token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiFetch<{ detail: string }>(`/public/${token}/gifts/${id}/claim/`, {
        method: "POST",
        anonymous: true,
        body: { name },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["public-gifts", token] }),
  });
}
