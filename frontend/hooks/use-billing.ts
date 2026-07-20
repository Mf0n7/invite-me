"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import posthog from "posthog-js";

import { apiFetch } from "@/lib/api";
import type { SubscriptionInfo, TiersResponse } from "@/lib/types";

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

export function useEventCheckout(uuid: string) {
  return useMutation({
    mutationFn: (capacity: number) =>
      apiFetch<{ checkout_url: string }>(`/billing/events/${uuid}/checkout/`, {
        method: "POST",
        body: { capacity },
      }),
    onSuccess: (data, capacity) => {
      posthog.capture("checkout_started", {
        checkout_type: "event",
        event_id: uuid,
        capacity,
      });
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
    onSuccess: (data, capacity) => {
      posthog.capture("checkout_started", {
        checkout_type: "subscription",
        capacity,
      });
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
