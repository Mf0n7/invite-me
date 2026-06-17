"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "./api";
import type { Invitation, Paginated } from "./types";

const key = (uuid: string) => ["events", uuid, "invitations"];

export function useInvitations(uuid: string) {
  return useQuery({
    queryKey: key(uuid),
    queryFn: () => apiFetch<Paginated<Invitation>>(`/events/${uuid}/invitations/`),
    enabled: !!uuid,
  });
}

export function useCreateInvitation(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guest_name: string) =>
      apiFetch<Invitation>(`/events/${uuid}/invitations/`, {
        method: "POST",
        body: { guest_name },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useUpdateInvitation(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, guest_name }: { id: number; guest_name: string }) =>
      apiFetch<Invitation>(`/invitations/${id}/`, { method: "PATCH", body: { guest_name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useDeleteInvitation(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch<void>(`/invitations/${id}/`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}

export function useImportInvitations(uuid: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return apiFetch<{ created: number; names: string[] }>(
        `/events/${uuid}/invitations/import/`,
        { method: "POST", body: fd },
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key(uuid) }),
  });
}
