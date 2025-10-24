import type { UserInfo, CDKInfo } from './types';

const baseURL = !import.meta.env.PROD ? 'https://receipt-api.nitro.xin' : 'http://localhost:3000';

export const api = {
  validateToken: async (token: string): Promise<UserInfo> => {
    const response = await fetch(`${baseURL}/external/public/discord-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  },

  validateCDK: async (cdk: string): Promise<CDKInfo> => {
    const response = await fetch(`${baseURL}/cdks/public/${cdk}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return response.json();
  },

  redeemCDK: async (token: string, cdk: string): Promise<boolean> => {
    const response = await fetch(`${baseURL}/stocks/public/outstock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cdk, user: token }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return true;
  },
};