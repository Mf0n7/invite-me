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
