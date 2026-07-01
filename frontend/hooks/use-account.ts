"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export type ProfileInput = Pick<User, "full_name" | "display_name" | "avatar_url">;

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ProfileInput>) =>
      apiFetch<User>("/auth/user/", { method: "PATCH", body: input }),
    onSuccess: (updated) => qc.setQueryData(["auth-user"], updated),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () =>
      apiFetch<void>("/auth/user/", { method: "DELETE" }),
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<{ detail: string }>("/auth/password/reset/", {
        method: "POST",
        anonymous: true,
        body: { email },
      }),
  });
}

export type ResetConfirmInput = {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
};

export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: (input: ResetConfirmInput) =>
      apiFetch<{ detail: string }>("/auth/password/reset/confirm/", {
        method: "POST",
        anonymous: true,
        body: input,
      }),
  });
}
