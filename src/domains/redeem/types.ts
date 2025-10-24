import type { ReactNode } from "react";
import type { ConfirmStatus } from "./components/ConfirmModal";

export type ThemePreference = "light" | "dark";

export interface HistoryRecord {
  id: string;
  userId: string;
  token: string;
  cdk: string;
  appId: string;
  redeemedAt: string;
}

export interface ConfirmPayload {
  type: ConfirmStatus;
  title: string;
  message: string;
  okText: string;
  description?: ReactNode;
  onOk?: () => void;
}
