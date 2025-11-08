import type { ProductSlug } from "../types";

const BASE_URL = import.meta.env.DEV ? "http://localhost:3000" : "https://receipt-api.nitro.xin";

interface UserResponse {
  user: string;
  verified: boolean;
  extra: Record<string, unknown>;
}

interface CdkResponse {
  code: string;
  used: boolean;
  app_name: string;
  app_product_name: string;
}

export async function verifyUser(user: string, product: ProductSlug): Promise<UserResponse> {
  user = user.trim();
  if (user === "mock_ok") {
    return {
      user: "mock_user",
      verified: true,
      extra: {
        global_name: "Mock User",
        email: "mock@example.com",
        phone: "+1234567890",
        locale: "en-US"
      }
    };
  }
  if (user === "mock_fail") {
    throw new Error("User is invalid");
  }

  const headers: HeadersInit = {
    "X-Product-ID": product
  };

  const response = await fetch(`${BASE_URL}/external/public/check-user`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user: user.trim() })
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return await response.json();
}

export async function verifyCdk(code: string, product: ProductSlug): Promise<CdkResponse> {
  code = code.trim();
  if (code === "mock_ok") {
    return {
      code: "mock_ok",
      used: false,
      app_name: "Mock App",
      app_product_name: "Mock Product"
    };
  }
  if (code === "mock_fail") {
    throw new Error("CDK is invalid");
  }

  const headers: HeadersInit = {
    "X-Product-ID": product
  };

  const response = await fetch(`${BASE_URL}/cdks/public/check`, {
    method: "POST",
    headers,
    body: JSON.stringify({ code: code })
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return await response.json();
}

export async function redeem(cdk: string, user: string, product: ProductSlug): Promise<boolean> {
  cdk = cdk.trim();
  user = user.trim();

  if (cdk === "mock_ok" && user === "mock_ok") {
    return true;
  }
  if (cdk === "mock_fail" || user === "mock_fail") {
    throw new Error("兑换失败：请稍后重试");
  }

  const headers: HeadersInit = {
    "X-Product-ID": product
  };

  const response = await fetch(`${BASE_URL}/stocks/public/outstock`, {
    method: "POST",
    headers,
    body: JSON.stringify({ cdk: cdk, user: user })
  });

  if (!response.ok) {
    const errorText = (await response.text()) || `HTTP ${response.status}`;
    throw new Error(errorText.trim());
  }

  return true;
}
