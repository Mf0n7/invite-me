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
