"use client";

import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "./api";

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
