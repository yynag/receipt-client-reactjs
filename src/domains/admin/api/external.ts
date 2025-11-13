import { baseUrl, request } from "./shared";

export const externalApi = {
  /**
   * @param raw 需要注入country
   * @returns
   */
  importFromRaw: async (raw: string): Promise<void> => {
    if (!raw.includes("country")) {
      throw new Error("country not found.");
    }
    const response = await request(`${baseUrl}/external/in-stock/raw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: raw
    });
    if (!response.ok) {
      throw new Error(`Failed to import stocks: ${await response.text()}`);
    }
    return;
  }
};
