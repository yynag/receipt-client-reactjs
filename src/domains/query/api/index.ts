import type { CdkResult } from "../types";

// API placeholder. Implement your backend integration here.
// Batch query endpoint: accept a list of codes and return their statuses.
export async function checkCdks(codes: string[]): Promise<CdkResult[]> {
  // TODO: implement actual API call to your backend
  // Expected: return statuses aligned to input order
  console.log(codes);
  return Promise.reject(new Error("Not implemented"));
}
