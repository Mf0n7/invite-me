import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./api";
import type { PublicNominal } from "./types";

export function usePublicNominal(token: string) {
  return useQuery({
    queryKey: ["public-nominal", token],
    queryFn: () =>
      apiFetch<PublicNominal>(`/nominal/${token}/`, { anonymous: true }),
    enabled: !!token,
    retry: false,
  });
}
