export interface UserInfo {
  id: string;
  username: string;
  global_name: string | null;
  locale: string;
  premium_type: number;
  email: string;
  verified: boolean;
  phone: string;
}

export interface CDKInfo {
  code: string;
  used: boolean;
  app_id: string;
}
