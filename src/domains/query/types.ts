export type Language = 'zh' | 'en';

export type ThemePreference = 'light' | 'dark';

export type CdkStatus = 'used' | 'unused' | 'invalid';

export interface CdkResult {
  code: string;
  status: CdkStatus;
  user: string;
  app_name: string;
  redeem_time?: string;
}
