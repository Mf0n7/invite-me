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

export type EventLink = {
  token: string;
  is_active: boolean;
  created_at: string;
  public_url: string;
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
