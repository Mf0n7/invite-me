import { env } from "@/config/env";
import { tokenStore } from "./token-store";
import { refreshAccessToken } from "./token-store";
import { ApiError } from "./errors";

/**
 * Cliente HTTP da API do O Penetra.
 * Anexa o access token (JWT) e tenta refresh transparente em 401.
 * Em Server Components, passe o token explicitamente via `opts.token`.
 */

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
  /** Rota pública (não envia/renova token) */
  anonymous?: boolean;
};

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { body, token, anonymous, headers, ...rest } = opts;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  const buildHeaders = (access: string | null): HeadersInit => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(access && !anonymous ? { Authorization: `Bearer ${access}` } : {}),
    ...headers,
  });

  const access = token ?? (anonymous ? null : tokenStore.access);

  const doFetch = (acc: string | null) =>
    fetch(`${env.API_URL}${path}`, {
      ...rest,
      headers: buildHeaders(acc),
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });

  let res = await doFetch(access);

  // Refresh transparente uma vez em 401 (apenas no client).
  if (
    res.status === 401 &&
    !anonymous &&
    !token &&
    typeof window !== "undefined"
  ) {
    const newAccess = await refreshAccessToken();
    if (newAccess) res = await doFetch(newAccess);
  }

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* corpo vazio */
    }
    throw new ApiError(res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
