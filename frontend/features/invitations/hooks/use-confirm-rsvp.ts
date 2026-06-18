import { apiFetch } from "lib/api";
import type { ConfirmInput } from "lib/types";
import { useMutation } from "@tanstack/react-query";

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
