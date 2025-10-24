import type { CDKInfo, UserInfo } from './types';
import { MOCK_NETWORK_DELAY } from '@/common/utils/constants';
import { showSuccessNotification } from './notifications';
import { i18n } from '@/common/i18n/config';

export interface RedeemAPI {
  validateToken(token: string): Promise<UserInfo>;
  validateCDK(cdk: string): Promise<CDKInfo>;
  redeemCDK(token: string, cdk: string): Promise<boolean>;
}

const mockUserInfo: UserInfo = {
  id: 'user-id',
  username: 'username',
  global_name: 'global name',
  locale: 'en',
  premium_type: 1,
  email: 'email@email.com',
  verified: true,
  phone: 'phone',
};

const mockCDKInfo: CDKInfo = {
  code: 'JN8BHNSK08NK',
  used: false,
  app_id: 'app-id',
};

const baseURL = !import.meta.env.PROD ? 'https://receipt-api.nitro.xin' : 'http://localhost:3000';

export const redeemAPI: RedeemAPI = {
  validateToken: async function (token: string): Promise<UserInfo> {
    try {
      const response = await fetch(`${baseURL}/external/public/discord-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} | ${await response.text()}`);
      }
      const data = (await response.json()) as UserInfo;
      return data;
    } catch (error) {
      throw error as Error;
    }
  },
  validateCDK: async function (cdk: string): Promise<CDKInfo> {
    try {
      const response = await fetch(`${baseURL}/cdks/public/${cdk}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} | ${await response.text()}`);
      }
      const data = (await response.json()) as CDKInfo;
      return data;
    } catch (error) {
      throw error as Error;
    }
  },
  redeemCDK: async function (token: string, cdk: string): Promise<boolean> {
    try {
      const response = await fetch(`${baseURL}/stocks/public/outstock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cdk,
          user: token,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status} | ${await response.text()}`);
      }
      return true;
    } catch (error) {
      throw error as Error;
    }
  },
};

// TODO: 替换 mockRedeemAPI 为真实后端接口实现
export const mockRedeemAPI: RedeemAPI = {
  async validateToken(token: string) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY));
    if (!token) {
      throw new Error('Token is empty.');
    }
    showSuccessNotification(
      i18n.t('redeem.token_validated', 'Token验证成功'),
      i18n.t('redeem.validation_success', '验证成功'),
    );
    return { ...mockUserInfo, id: `user-${token.slice(0, 4)}` };
  },
  async validateCDK(cdk: string) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY));
    if (!cdk) {
      throw new Error('CDK is empty.');
    }
    showSuccessNotification(
      i18n.t('redeem.cdk_validated', 'CDK验证成功'),
      i18n.t('redeem.validation_success', '验证成功'),
    );
    return mockCDKInfo;
  },
  async redeemCDK(token: string, cdk: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY));
    if (!token || !cdk) {
      throw new Error('Token and CDK are required');
    }
    showSuccessNotification(
      i18n.t('redeem.redeem_success', '兑换成功'),
      i18n.t('redeem.operation_success', '操作成功'),
    );
    return true;
  },
};
