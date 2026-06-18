export type User = {
  id: number;
  email: string;
  full_name: string;
  display_name: string;
  avatar_url: string;
  date_joined: string;
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
