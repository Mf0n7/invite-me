"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "./api";
import type { PublicEvent } from "./types";

export function usePublicEvent(token: string) {
  return useQuery({
    queryKey: ["public-event", token],
    queryFn: () =>
      apiFetch<PublicEvent>(`/invite/${token}/`, { anonymous: true }),
    enabled: !!token,
    retry: false,
  });
}
