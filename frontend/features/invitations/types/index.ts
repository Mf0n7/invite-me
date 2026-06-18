import type { PublicEvent } from "";

export type Invitation = {
  id: number;
  guest_name: string;
  token: string;
  status: "pending" | "confirmed";
  confirmed_at: string | null;
  created_at: string;
  public_url: string;
};

export type PublicNominal = {
  guest_name: string;
  status: "pending" | "confirmed";
  event: PublicEvent;
};

export type ConfirmInput = { name: string; companion_names: string[] };
