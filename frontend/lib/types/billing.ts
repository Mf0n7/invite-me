export type Tier = { capacity: number; event_cents: number; subscription_cents: number };

export type TiersResponse = {
  free_capacity: number;
  currency: string;
  tiers: Tier[];
  gift_addon_cents: number;
};

export type SubscriptionInfo = {
  capacity: number;
  status: string;
  current_period_end: string | null;
  is_active: boolean;
} | null;
