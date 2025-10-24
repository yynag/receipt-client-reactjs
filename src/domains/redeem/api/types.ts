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

export type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'premium';

export interface RedeemHistoryRecord {
  key: string;
  token: string;
  cdk: string;
  time: string;
}