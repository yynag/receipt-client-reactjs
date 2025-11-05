const BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://receipt-api.nitro.xin";

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  locale?: string;
  premium_type?: number;
  email?: string;
  verified?: boolean;
  phone?: string;
}

export interface CdkInfo {
  code: string;
  used: boolean;
  app_id: string;
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options;

  console.log(`==>1 [API] ${method} ${BASE_URL}${path}`, body);

  // Handle mock test accounts
  if (method === "POST" && path === "/external/public/discord-user") {
    const token = (body as { token: string })?.token;
    if (token === "mock_ok") {
      return {
        id: "123456789",
        username: "test_user",
        global_name: "Test User",
        locale: "en-US",
        premium_type: 0,
        email: "test@example.com",
        verified: true,
        phone: "+1234567890"
      } as T;
    } else if (token === "mock_fail") {
      throw new Error("Token验证失败：自定义错误信息");
    }
  }

  if (method === "GET" && path.startsWith("/cdks/public/")) {
    const cdk = decodeURIComponent(path.replace("/cdks/public/", ""));
    if (cdk === "mock_ok") {
      return {
        code: "mock_ok",
        used: false,
        app_id: "test_app_123"
      } as T;
    } else if (cdk === "mock_fail") {
      throw new Error("CDK无效：自定义错误信息");
    }
  }

  if (method === "POST" && path === "/stocks/public/outstock") {
    const payload = body as { cdk: string; user: string };
    if (payload.cdk === "mock_ok" && payload.user === "mock_ok") {
      const random = Math.floor(Math.random() * 2);
      if (random === 0) {
        // First attempt - success
        return true as T;
      } else {
        // Second attempt - fail
        throw new Error("兑换失败：自定义错误信息");
      }
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function verifyToken(token: string): Promise<DiscordUser> {
  return request<DiscordUser>("/external/public/discord-user", {
    method: "POST",
    body: { token }
  });
}

export async function verifyCdk(cdk: string): Promise<CdkInfo> {
  return request<CdkInfo>(`/cdks/public/${encodeURIComponent(cdk)}`);
}

export async function redeemCdk(payload: { cdk: string; user: string }): Promise<boolean> {
  return request<boolean>("/stocks/public/outstock", {
    method: "POST",
    body: payload
  });
}
