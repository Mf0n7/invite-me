"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "./api";
import type { SubscriptionInfo, TiersResponse } from "./types";

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function useTiers() {
  return useQuery({
    queryKey: ["billing-tiers"],
    queryFn: () => apiFetch<TiersResponse>("/billing/tiers/", { anonymous: true }),
    staleTime: Infinity,
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ["billing-subscription"],
    queryFn: () => apiFetch<SubscriptionInfo>("/billing/subscription/"),
  });
}

/** Checkout avulso por evento — retorna e redireciona para a URL do Stripe. */
export function useEventCheckout(uuid: string) {
  return useMutation({
    mutationFn: (capacity: number) =>
      apiFetch<{ checkout_url: string }>(`/billing/events/${uuid}/checkout/`, {
        method: "POST",
        body: { capacity },
      }),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });
}

export function useSubscriptionCheckout() {
  return useMutation({
    mutationFn: (capacity: number) =>
      apiFetch<{ checkout_url: string }>("/billing/subscription/checkout/", {
        method: "POST",
        body: { capacity },
      }),
    onSuccess: (data) => {
      window.location.href = data.checkout_url;
    },
  });
}

export function usePortal() {
  return useMutation({
    mutationFn: () => apiFetch<{ portal_url: string }>("/billing/portal/", { method: "POST" }),
    onSuccess: (data) => {
      window.location.href = data.portal_url;
    },
  });
}
