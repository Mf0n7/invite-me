export type Tier = { capacity: number; amount_cents: number };

export type TiersResponse = {
  free_capacity: number;
  currency: string;
  tiers: Tier[];
};

export type SubscriptionInfo = {
  capacity: number;
  status: string;
  current_period_end: string | null;
  is_active: boolean;
} | null;
