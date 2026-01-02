import { baseUrl, buildFilterOptions, request } from './shared';

export interface ListStock {
  id: number;
  created_at: string;
  updated_at: string;
  app_id: string;
  device_id: string;
  product_id: string;
  used: boolean;
  user_id?: string;
  receipt_created_at: string;
  receipt_used_at: string;
}

export interface Stock {
  ID: number;
  CreatedAt: string;
  updatedAt: string;
  app_id: string;
  device_id: string;
  product_id: string;
  used: boolean;
  user_id?: string;
  raw_data?: string;
  used_data?: string;
}

export interface CreateStockRequest {
  app_id: string;
  device_id: string;
  product_id: string;
  raw_data: Record<string, unknown>;
}

export interface StockListResponse {
  items: ListStock[];
  total: number;
  current: number;
  page_size: number;
}

export interface StockListParams {
  page: number;
  page_size: number;

  id?: number;
  cdk?: string;
  start_date?: string;
  end_date?: string;
  app_id?: string;
  product_id?: string;
  used?: number; // 0: false, 1: true
  user_id?: string;
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

export interface StockStatResponse {
  used: number;
  unused: number;
}

export interface AppProductStockStatItem {
  app_id: string;
  product_id: string;
  used: number;
  unused: number;
  user_id?: string;
}

export interface FilterOptionResponse {
  users: string[];
  app_ids: string[];
  product_ids: string[];
}

export const stockApi = {
  getFilterOptions: async (): Promise<FilterOptions> => {
    const response = await request(`${baseUrl}/stocks/ui/table-filter-data`, {
      method: 'GET',
    });
    const data: FilterOptionResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to request filter options: ${await response.text()}`);
    }
    return {
      used: [
        { value: 'true', label: '已使用' },
        { value: 'false', label: '未使用' },
      ],
      app_ids: buildFilterOptions(data.app_ids),
      product_ids: buildFilterOptions(data.product_ids),
      user_ids: buildFilterOptions(data.users),
    };
  },

  getFilterOptionsMock: async (): Promise<FilterOptions> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          used: [
            { value: 'true', label: '已使用' },
            { value: 'false', label: '未使用' },
          ],
          app_ids: Array.from({ length: 10 }, (_, i) => ({
            value: `app_${i}`,
            label: `App ${i}`,
          })),
          product_ids: Array.from({ length: 50 }, (_, i) => ({
            value: `product_${i}`,
            label: `Product ${i}`,
          })),
          user_ids: Array.from({ length: 1000 }, (_, i) => ({
            value: `user_${i}`,
            label: `User ${i}`,
          })),
        });
      }, 200);
    });
  },

  getList: async (params: StockListParams): Promise<StockListResponse> => {
    let url = `${baseUrl}/stocks?page=${params.page}&page_size=${params.page_size}`;
    if (params.id) {
      url += `&id=${params.id}`;
    }
    if (params.cdk) {
      url += `&cdk=${params.cdk}`;
    }
    if (params.used) {
      url += `&used=${params.used}`;
    }
    if (params.app_id) {
      url += `&app_id=${params.app_id}`;
    }
    if (params.product_id) {
      url += `&product_id=${params.product_id}`;
    }
    if (params.user_id) {
      url += `&user_id=${params.user_id}`;
    }
    if (params.start_date) {
      url += `&start_date=${params.start_date}`;
    }
    if (params.end_date) {
      url += `&end_date=${params.end_date}`;
    }
    const response = await request(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to request CDK list: ${await response.text()}`);
    }
    return await response.json();
  },

  getStockStats: async (app_id?: string, product_id?: string, user_id?: string): Promise<StockStatResponse> => {
    let url = `${baseUrl}/stocks/stats/total?a=b`;
    if (app_id) {
      url += `&app_id=${encodeURIComponent(app_id)}`;
    }
    if (product_id) {
      url += `&product_id=${encodeURIComponent(product_id)}`;
    }
    if (user_id) {
      url += `&user_id=${encodeURIComponent(user_id)}`;
    }
    const response = await request(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to request stock stats' + (await response.text()));
    }
    return await response.json();
  },

  getStockStatsMock: async (app_id?: string, product_id?: string): Promise<StockStatResponse> => {
    console.log('requesting stock stats for app:', app_id, 'product:', product_id);
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = Math.floor(Math.random() * 2000) + 1000;
        const shipped = Math.floor(total * (Math.random() * 0.6 + 0.2));
        const inStock = total - shipped;

        resolve({
          unused: inStock,
          used: shipped,
        });
      }, 300);
    });
  },

  // Grouped by App-Product statistics for stacked bar chart
  getStockAppProductStats: async (
    app_id?: string,
    product_id?: string,
    user_id?: string,
  ): Promise<AppProductStockStatItem[]> => {
    let url = `${baseUrl}/stocks/stats/used?a=b`;
    if (app_id) {
      url += `&app_id=${encodeURIComponent(app_id)}`;
    }
    if (product_id) {
      url += `&product_id=${encodeURIComponent(product_id)}`;
    }
    if (user_id) {
      url += `&user_id=${encodeURIComponent(user_id)}`;
    }
    const response = await request(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to request stock app-product stats' + (await response.text()));
    }
    return await response.json();
  },

  batchDelete: async (ids: number[]): Promise<void> => {
    const url = `${baseUrl}/stocks/${ids.join(',')}`;
    const response = await request(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete stocks: ${await response.text()}`);
    }
    return;
  },

  batchDeleteMock: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  },

  importFromLiNiuJson: async (s: string): Promise<void> => {
    const response = await request(`${baseUrl}/external/public/in-stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: s,
    });
    if (!response.ok) {
      throw new Error(`Failed to import stocks: ${await response.text()}`);
    }
    return;
  },

  getStockDetail: async (id: number): Promise<Stock> => {
    const response = await request(`${baseUrl}/stocks/${id}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to get stock detail: ${await response.text()}`);
    }
    return await response.json();
  },
};
