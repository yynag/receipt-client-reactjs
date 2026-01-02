import type { ProductSlug } from '../types';
import { sleep } from '../utils/sleep';

export { sleep } from '../utils/sleep';

const BASE_URL = import.meta.env.DEV ? 'http://localhost:4000' : 'https://receipt-api.nitro.xin';

interface UserResponse {
  user: string;
  verified: boolean;
  has_sub: boolean;
  extra: Record<string, unknown>;
}

interface CdkResponse {
  code: string;
  used: boolean;
  app_name: string;
  app_product_name: string;
}

export async function verifyUser(user: string, cdk: string, product: ProductSlug): Promise<UserResponse> {
  user = user.trim();

  const headers: HeadersInit = {
    'X-Product-ID': product,
  };
  const response = await fetch(`${BASE_URL}/external/public/check-user`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user: user.trim(), cdk: cdk.trim() }),
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return await response.json();
}

export async function verifyCdk(code: string, product: ProductSlug): Promise<CdkResponse> {
  code = code.trim();
  if (code === 'mock_ok') {
    return {
      code: 'mock_ok',
      used: false,
      app_name: 'Mock App',
      app_product_name: 'Mock Product',
    };
  }
  if (code === 'mock_fail') {
    throw new Error('CDK is invalid');
  }

  const headers: HeadersInit = {
    'X-Product-ID': product,
  };

  const response = await fetch(`${BASE_URL}/cdks/public/check`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code: code }),
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return await response.json();
}

export async function createRedeemTask(cdk: string, user: string): Promise<string> {
  cdk = cdk.trim();
  user = user.trim();

  const response = await fetch(`${BASE_URL}/stocks/public/outstock`, {
    method: 'POST',
    body: JSON.stringify({ cdk: cdk, user: user }),
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return await response.text();
}

export interface TaskResult {
  task_id: string;
  cdk: string;
  pending: boolean;
  success: boolean;
  message: string | undefined;
}

export async function queryRedeemTaskOnce(taskId: string): Promise<TaskResult> {
  const response = await fetch(`${BASE_URL}/stocks/public/outstock/${taskId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(((await response.text()) || `HTTP ${response.status}`).trim());
  }

  return await response.json();
}

export async function queryRedeemTask(
  taskId: string,
  options: { intervalMs?: number; signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<TaskResult> {
  const intervalMs = options.intervalMs ?? 1000 * 5;
  const startedAt = Date.now();

  while (true) {
    if (options.signal?.aborted) {
      throw new Error('Aborted');
    }

    if (options.timeoutMs !== undefined && Date.now() - startedAt > options.timeoutMs) {
      throw new Error('Timeout');
    }

    try {
      return await queryRedeemTaskOnce(taskId);
    } catch {
      await sleep(intervalMs, options.signal);
    }
  }
}

export async function pollRedeemTask(
  taskId: string,
  options: { intervalMs?: number; signal?: AbortSignal; timeoutMs?: number } = {},
) {
  const intervalMs = options.intervalMs ?? 1000 * 5;
  const startedAt = Date.now();

  while (true) {
    if (options.signal?.aborted) {
      throw new Error('Aborted');
    }

    if (options.timeoutMs !== undefined && Date.now() - startedAt > options.timeoutMs) {
      throw new Error('Timeout');
    }

    try {
      const result = await queryRedeemTaskOnce(taskId);
      if (!result.pending) {
        return result;
      }
    } catch {
      // ignore network errors and keep polling
    }

    await sleep(intervalMs, options.signal);
  }
}
