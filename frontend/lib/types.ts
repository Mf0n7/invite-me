export type User = {
  id: number;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  date_joined: string;
  is_staff?: boolean;
};

export type AuthTokens = {
  access: string;
  refresh: string;
  user?: User;
};

export type RegisterPayload = {
  email: string;
  password1: string;
  password2: string;
  full_name?: string;
};

export type EventItem = {
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
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type EventLink = {
  token: string;
  is_active: boolean;
  created_at: string;
  public_url: string;
};

export type RsvpSummary = {
  confirmations: number;
  total_guests: number;
};

export type RsvpRow = {
  id: number;
  name: string;
  companion_names: string[];
  companions_count: number;
  total_people: number;
  created_at: string;
};

export type RsvpPerson = {
  rsvp_id: number;
  name: string;
  is_companion: boolean;
  group_name: string;
};

export type RsvpList = {
  total_confirmations: number;
  total_guests: number;
  name_capacity: number;
  revealed_people: RsvpPerson[];
  hidden_count: number;
  is_limited: boolean;
};

export type Tier = { capacity: number; event_cents: number; subscription_cents: number };

export type TiersResponse = {
  free_capacity: number;
  currency: string;
  tiers: Tier[];
  gift_addon_cents: number;
};

export type GiftItem = {
  id: number;
  title: string;
  description: string;
  url: string;
  status: "available" | "reserved";
  claimed_by_name: string;
  claimed_at: string | null;
  created_at: string;
};

export type GiftListResponse = {
  entitled: boolean;
  items: GiftItem[];
};

export type PublicGift = {
  id: number;
  title: string;
  description: string;
  url: string;
  status: "available" | "reserved";
  is_available: boolean;
};

export type SubscriptionInfo = {
  capacity: number;
  status: string;
  current_period_end: string | null;
  is_active: boolean;
} | null;

export type Invitation = {
  id: number;
  guest_name: string;
  token: string;
  status: "pending" | "confirmed";
  confirmed_at: string | null;
  created_at: string;
  public_url: string;
};

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

export type PublicEvent = {
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
};
