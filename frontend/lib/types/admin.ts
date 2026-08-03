import type { RsvpPerson } from "./rsvp";

export type AdminPlanBreakdown = {
  name: string;
  subscribers: number;
  mrr_cents: number;
};

export type AdminOverview = {
  mrr_cents: number;
  active_subscriptions: number;
  active_users_30d: number;
  new_users_30d: number;
  plan_breakdown: AdminPlanBreakdown[];
};

export type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string;
  plan: string | null;
  status: "ativo" | "inativo";
  date_joined: string;
};

export type AdminEvent = {
  id: number;
  uuid: string;
  title: string;
  starts_at: string;
  address: string;
  owner_name: string;
  owner_email: string;
  confirmations: number;
  total_guests: number;
  gifts_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminEventOwner = {
  id: number;
  full_name: string;
  email: string;
  avatar_url: string;
};

export type AdminInvitation = {
  id: number;
  guest_name: string;
  status: "pending" | "confirmed";
  confirmed_at: string | null;
  created_at: string;
};

export type AdminEventGift = {
  id: number;
  title: string;
  status: "available" | "reserved";
  claimed_by_name: string;
  claimed_at: string | null;
  created_at: string;
};

export type AdminEventPurchase = {
  id: number;
  kind: "capacity" | "gift";
  capacity: number;
  amount_cents: number;
  status: "pending" | "paid" | "failed";
  created_at: string;
};

export type AdminEventDetail = {
  id: number;
  uuid: string;
  title: string;
  description: string;
  photo: string | null;
  address: string;
  location_link: string;
  starts_at: string;
  note: string;
  allow_companions: boolean;
  max_companions: number;
  created_at: string;
  updated_at: string;
  owner: AdminEventOwner;
  confirmations: number;
  total_guests: number;
  attendees: RsvpPerson[];
  invitations: AdminInvitation[];
  gifts: AdminEventGift[];
  purchases: AdminEventPurchase[];
};

export type AdminPayment = {
  id: number;
  user: string;
  plan: string;
  amount_cents: number;
  created_at: string;
};

export type AdminBilling = {
  monthly_revenue_cents: number;
  event_purchases_cents: number;
  recent_payments: AdminPayment[];
};
