"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type {
  AdminBilling,
  AdminEvent,
  AdminEventDetail,
  AdminOverview,
  AdminUser,
} from "@/lib/types";

// O `signal` vem do TanStack Query: quando o componente desmonta (troca de
// página) ou a query é invalidada, a requisição em voo é abortada de verdade,
// liberando o worker do backend em vez de deixá-lo terminar à toa.
export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: ({ signal }) => apiFetch<AdminOverview>("/admin/overview/", { signal }),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: ({ signal }) => apiFetch<AdminUser[]>("/admin/users/", { signal }),
  });
}

export function useAdminBilling() {
  return useQuery({
    queryKey: ["admin-billing"],
    queryFn: ({ signal }) => apiFetch<AdminBilling>("/admin/billing/", { signal }),
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: ({ signal }) => apiFetch<AdminEvent[]>("/admin/events/", { signal }),
  });
}

export function useAdminEvent(uuid: string | undefined) {
  return useQuery({
    queryKey: ["admin-events", uuid],
    queryFn: ({ signal }) => apiFetch<AdminEventDetail>(`/admin/events/${uuid}/`, { signal }),
    enabled: !!uuid,
  });
}
