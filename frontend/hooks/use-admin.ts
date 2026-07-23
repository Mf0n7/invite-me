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

export function useAdminOverview() {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => apiFetch<AdminOverview>("/admin/overview/"),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiFetch<AdminUser[]>("/admin/users/"),
  });
}

export function useAdminBilling() {
  return useQuery({
    queryKey: ["admin-billing"],
    queryFn: () => apiFetch<AdminBilling>("/admin/billing/"),
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: () => apiFetch<AdminEvent[]>("/admin/events/"),
  });
}

export function useAdminEvent(uuid: string | undefined) {
  return useQuery({
    queryKey: ["admin-events", uuid],
    queryFn: () => apiFetch<AdminEventDetail>(`/admin/events/${uuid}/`),
    enabled: !!uuid,
  });
}
