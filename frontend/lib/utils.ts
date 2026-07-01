import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export { formatDateTime } from "./utils/format"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** ISO (com tz) -> valor de <input type="datetime-local"> no fuso local. */
export function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - off).toISOString().slice(0, 16);
}

/** Valor de datetime-local (local) -> ISO com offset. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}
