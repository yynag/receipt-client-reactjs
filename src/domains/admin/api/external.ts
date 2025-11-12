import { baseUrl, request } from "./shared";

export const externalApi = {
  importFromFM: async (raw: string): Promise<void> => {
    const response = await request(`${baseUrl}/external/in-stock/fm`, {
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
