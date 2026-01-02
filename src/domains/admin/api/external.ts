import { baseUrl, request } from './shared';

export type ImportFromRawStatus = 'success' | 'duplicate';

export const externalApi = {
  /**
   * @param raw 需要注入country
   * @returns
   */
  importFromRaw: async (raw: string): Promise<ImportFromRawStatus> => {
    if (!raw.includes('country')) {
      throw new Error('country not found.');
    }
    const response = await request(`${baseUrl}/external/in-stock/raw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: raw,
    });
    if (response.status === 304) {
      return 'duplicate';
    }
    if (!response.ok) {
      throw new Error(`Failed to import stocks: ${await response.text()}`);
    }
    return 'success';
  },

  importFromRaws: async (dateType: string, raws: string[]): Promise<void> => {
    const body = JSON.stringify(raws);
    const response = await request(`${baseUrl}/external/in-stock/raws`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Data-Type': dateType,
      },
      body: body,
    });
    if (!response.ok) {
      throw new Error(`Import error: ${await response.text()}`);
    }
    return;
  },
};
