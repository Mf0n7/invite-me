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
export function apiErrorMessage(
  err: unknown,
  fallback = "Algo deu errado. Tente novamente.",
): string {
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
