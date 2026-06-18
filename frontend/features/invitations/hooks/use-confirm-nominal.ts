import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "./api";
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
