import type { ReactNode } from 'react';
import type { ConfirmStatus } from './components/ConfirmModal';

export type ThemePreference = 'light' | 'dark';

export type ProductSlug = 'discord' | 'chatgpt';

export interface ConfirmPayload {
  type: ConfirmStatus;
  title: string;
  message: string;
  okText: string;
  description?: ReactNode;
  onOk?: () => void;
}

export interface VerifiedUser {
  user: string;
  has_sub: boolean;
  verified: boolean;
  extra: Record<string, unknown>;
}

export interface VerifiedCdk {
  code: string;
  used: boolean;
  app_name: string;
  app_product_name: string;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<unknown> ? T[P] : T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
};

export type PartialRecord<K extends PropertyKey, V> = {
  [P in K]?: V;
};
