import { baseUrl, buildFilterOptions, request } from "./shared";

export interface FilterOptionResponse {
  users: string[];
  app_ids: string[];
  product_ids: string[];
}

export interface CDK {
  ID: number;
  CreatedAt: string;
  code: string;
  used: boolean;
  used_user?: string;
  stock_id?: string;
  user_id: string;
  app_id: string;
  app_product_id: string;
}

export interface CreateCDKRequest {
  app_id: string;
  product_id: string;
  amount: number;
}

export interface CDKListResponse {
  items: CDK[];
  total: number;
  current: number;
  page_size: number;
}

export interface CDKListParams {
  page: number;
  page_size: number;
  used?: boolean;
  user_id?: string;
  app_id?: string;
  app_product_id?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  used: FilterOption[];
  app_ids: FilterOption[];
  product_ids: FilterOption[];
  user_ids: FilterOption[];
}

export interface TrendData {
  date: string;
  count: number;
}

export interface StatData {
  name: string;
  value: number;
}

export interface CDKStatResponse {
  used: number;
  unused: number;
}

export interface FilterOptionResponse {
  users: string[];
  app_ids: string[];
  product_ids: string[];
}

export const cdkApi = {
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await request(`${baseUrl}/cdks/ui/table-filter-data`, {
      method: "GET"
    });
    const data: FilterOptionResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to request filter options: ${await response.text()}`);
    }
    return {
      used: [
        { value: "true", label: "已使用" },
        { value: "false", label: "未使用" }
      ],
      app_ids: buildFilterOptions(data.app_ids),
      product_ids: buildFilterOptions(data.product_ids),
      user_ids: buildFilterOptions(data.users)
    };
  },

  getFilterOptionsMock: async (): Promise<FilterOptions> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          used: [
            { value: "true", label: "已使用" },
            { value: "false", label: "未使用" }
          ],
          app_ids: Array.from({ length: 10 }, (_, i) => ({
            value: `app_${i}`,
            label: `App ${i}`
          })),
          product_ids: Array.from({ length: 50 }, (_, i) => ({
            value: `product_${i}`,
            label: `Product ${i}`
          })),
          user_ids: Array.from({ length: 10 }, (_, i) => ({
            value: `admin_${i}`,
            label: `Admin ${i}`
          }))
        });
      }, 200);
    });
  },

  getTrendData: async (
    dimension: "year" | "month" | "today",
    userId?: string,
    appId?: string,
    productId?: string
  ): Promise<number[]> => {
    let url = `${baseUrl}/cdks/stats/amount?a=b`;
    if (dimension) {
      url += `&view=${encodeURIComponent(dimension)}`;
    }
    if (userId) {
      url += `&user_id=${encodeURIComponent(userId)}`;
    }
    if (appId) {
      url += `&app_id=${encodeURIComponent(appId)}`;
    }
    if (productId) {
      url += `&product_id=${encodeURIComponent(productId)}`;
    }
    const response = await request(url, {
      method: "GET"
    });
    if (!response.ok) {
      throw new Error(`Failed to request trend data: ${await response.text()}`);
    }
    return await response.json();
  },

  getTrendDataMock: async (
    dimension?: "year" | "month" | "today",
    userId?: string,
    appId?: string,
    productId?: string
  ): Promise<number[]> => {
    console.log(
      "requesting trend data for user:",
      userId,
      "appId:",
      appId,
      "productId:",
      productId,
      "dimension:",
      dimension
    );
    return new Promise((resolve) => {
      setTimeout(() => {
        let count = 0;
        switch (dimension) {
          case "month":
            count = 30;
            break;
          case "today":
            count = 24;
            break;
          case "year":
            count = 12;
            break;
          default:
            break;
        }
        resolve(Array.from({ length: count }, () => Math.floor(Math.random() * 100) + 10));
      }, 300);
    });
  },

  getCDKStats: async (appId?: string, productId?: string, userId?: string): Promise<CDKStatResponse> => {
    let url = `${baseUrl}/cdks/stats/total?a=b`;
    if (appId) {
      url += `&app_id=${encodeURIComponent(appId)}`;
    }
    if (productId) {
      url += `&product_id=${encodeURIComponent(productId)}`;
    }
    if (userId) {
      url += `&user_id=${encodeURIComponent(userId)}`;
    }
    const response = await request(url, {
      method: "GET"
    });
    if (!response.ok) {
      throw new Error(`Failed to request CDK stats: ${await response.text()}`);
    }
    return await response.json();
  },

  getCDKStatsMock: async (appId?: string, productId?: string, userId?: string): Promise<CDKStatResponse> => {
    console.log("requesting CDK stats for app:", appId, "product:", productId, "uploader:", userId);
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = Math.floor(Math.random() * 1000) + 500;
        const used = Math.floor(total * (Math.random() * 0.5 + 0.3));
        const unused = total - used;

        resolve({
          used,
          unused
        });
      }, 300);
    });
  },

  getList: async (params: CDKListParams): Promise<CDKListResponse> => {
    let url = `${baseUrl}/cdks?page=${params.page}&page_size=${params.page_size}`;
    if (params.used !== undefined) {
      url += `&used=${params.used}`;
    }
    if (params.app_id) {
      url += `&app_id=${encodeURIComponent(params.app_id)}`;
    }
    if (params.app_product_id) {
      url += `&product_id=${encodeURIComponent(params.app_product_id)}`;
    }
    if (params.user_id) {
      url += `&user_id=${encodeURIComponent(params.user_id)}`;
    }
    const response = await request(url, {
      method: "GET"
    });
    if (!response.ok) {
      throw new Error(`Failed to request CDK list: ${await response.text()}`);
    }
    return await response.json();
  },

  getListMock: async (params: CDKListParams): Promise<CDKListResponse> => {
    const mockData: CDK[] = Array.from({ length: 100 }, (_, i) => ({
      ID: i,
      CreatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      code: `CDK-${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      used: Math.random() > 0.7,
      used_user: Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
      stock_id: Math.random() > 0.7 ? `stock_${Math.floor(Math.random() * 100)}` : undefined,
      user_id: `admin_${Math.floor(Math.random() * 10)}`,
      app_id: `app_${Math.floor(Math.random() * 10)}`,
      app_product_id: `product_${Math.floor(Math.random() * 50)}`
    }));

    let filteredData = mockData;

    if (params.used !== undefined) {
      filteredData = filteredData.filter((item) => item.used === params.used);
    }

    if (params.app_id) {
      filteredData = filteredData.filter((item) => item.app_id === params.app_id);
    }

    if (params.app_product_id) {
      filteredData = filteredData.filter((item) => item.app_product_id === params.app_product_id);
    }

    if (params.user_id) {
      filteredData = filteredData.filter((item) => item.user_id === params.user_id);
    }

    const startIndex = (params.page - 1) * params.page_size;
    const endIndex = startIndex + params.page_size;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      items: paginatedData,
      total: filteredData.length,
      current: params.page,
      page_size: params.page_size
    };
  },

  create: async (data: CreateCDKRequest): Promise<string[]> => {
    const response = await request(`${baseUrl}/cdks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Failed to create CDK: ${await response.text()}`);
    }
    return await response.json();
  },

  createMock: async (data: CreateCDKRequest): Promise<string[]> => {
    const newCDKs: string[] = Array.from(
      { length: data.amount },
      () => `CDK-${Math.random().toString(36).substr(2, 16).toUpperCase()}`
    );

    return new Promise((resolve) => {
      setTimeout(() => resolve(newCDKs), 500);
    });
  },

  batchDelete: async (codes: string[]): Promise<void> => {
    const response = await request(`${baseUrl}/cdks`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ codes })
    });
    if (!response.ok) {
      throw new Error(`Failed to delete CDKs: ${await response.text()}`);
    }
    return;
  },

  batchDeleteMock: async (codes: string[]): Promise<void> => {
    console.log("Deleting CDKs:", codes);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }
};
