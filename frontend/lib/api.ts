/**
 * Cliente HTTP da API do Convida.
 * Anexa o access token (JWT) e tenta refresh transparente em 401.
 * Em Server Components, passe o token explicitamente via `opts.token`.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const ACCESS_KEY = "op_access";
const REFRESH_KEY = "op_refresh";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`API ${status}`);
    this.status = status;
    this.data = data;
  }
}

/** Extrai uma mensagem legível de um erro da API (DRF devolve dict de campos ou {detail}). */
export function apiErrorMessage(err: unknown, fallback = "Algo deu errado. Tente novamente."): string {
  if (err instanceof ApiError && err.data && typeof err.data === "object") {
    const data = err.data as Record<string, unknown>;
    if (typeof data.detail === "string") return data.detail;
    const first = Object.values(data)[0];
    if (Array.isArray(first) && typeof first[0] === "string") return first[0];
    if (typeof first === "string") return first;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
  /** Rota pública (não envia/renova token) */
  anonymous?: boolean;
};

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) {
    tokenStore.clear();
    return null;
  }
  const data = (await res.json()) as { access: string; refresh?: string };
  tokenStore.set(data.access, data.refresh);
  return data.access;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { body, token, anonymous, headers, ...rest } = opts;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const buildHeaders = (access: string | null): HeadersInit => ({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(access && !anonymous ? { Authorization: `Bearer ${access}` } : {}),
    ...headers,
  });

  const access = token ?? (anonymous ? null : tokenStore.access);

  const doFetch = (acc: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: buildHeaders(acc),
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
    });

  let res = await doFetch(access);

  // Refresh transparente uma vez em 401 (apenas no client).
  if (res.status === 401 && !anonymous && !token && typeof window !== "undefined") {
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
