import type { CdkResult } from "../types";

const BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://receipt-api.nitro.xin";
// const BASE_URL = "http://localhost:3000";

interface Item {
  code: string;
  used: boolean;
  user: string;
}

export async function checkCdks(codes: string[]): Promise<CdkResult[]> {
  const response = await fetch(`${BASE_URL}/cdks/public/check-usage/${codes.map(encodeURIComponent).join(",")}`, {
    method: "GET"
  });
  if (!response.ok) {
    throw new Error("Failed to check CDKs: " + (await response.text()));
  }
  const data = await response.json();
  return (data as Array<Item>).map((it) => ({ code: it.code, status: it.used ? "used" : "unused", user: it.user }));
}
