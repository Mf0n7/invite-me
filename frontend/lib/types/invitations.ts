export type Invitation = {
  id: number;
  guest_name: string;
  token: string;
  status: "pending" | "confirmed";
  confirmed_at: string | null;
  created_at: string;
  public_url: string;
};
