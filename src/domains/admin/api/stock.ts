export interface Stock {
  id: string;
  createdAt: string;
  updatedAt: string;
  appId: string;
  deviceId: string;
  productId: string;
  used: boolean;
  userId?: string;
  rawData: Record<string, unknown>;
}

export interface CreateStockRequest {
  appId: string;
  deviceId: string;
  productId: string;
  rawData: Record<string, unknown>;
}

export interface StockListResponse {
  items: Stock[];
  total: number;
  current: number;
  pageSize: number;
}

export interface StockListParams {
  current: number;
  pageSize: number;
  search?: string;
  startTime?: string;
  endTime?: string;
  appId?: string;
  productId?: string;
  used?: boolean;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  used: FilterOption[];
  appIds: FilterOption[];
  productIds: FilterOption[];
  deviceIds: FilterOption[];
}

export const stockApi = {
  getFilterOptions: async (): Promise<FilterOptions> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          used: [
            { value: 'true', label: '已使用' },
            { value: 'false', label: '未使用' }
          ],
          appIds: Array.from({ length: 10 }, (_, i) => ({
            value: `app_${i}`,
            label: `App ${i}`
          })),
          productIds: Array.from({ length: 50 }, (_, i) => ({
            value: `product_${i}`,
            label: `Product ${i}`
          })),
          deviceIds: Array.from({ length: 20 }, (_, i) => ({
            value: `device_${i}`,
            label: `Device ${i}`
          }))
        });
      }, 200);
    });
  },

  getList: async (params: StockListParams): Promise<StockListResponse> => {
    const mockData: Stock[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `stock_${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      updatedAt: new Date(Date.now() - i * 1800000).toISOString(),
      appId: `app_${Math.floor(Math.random() * 10)}`,
      deviceId: `device_${Math.floor(Math.random() * 20)}`,
      productId: `product_${Math.floor(Math.random() * 50)}`,
      used: Math.random() > 0.8,
      userId: Math.random() > 0.8 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
      rawData: {
        version: "1.0.0",
        metadata: {
          source: "api",
          batch: Math.floor(Math.random() * 100)
        }
      }
    }));

    let filteredData = mockData;
    
    if (params.search) {
      filteredData = filteredData.filter(
        item =>
          item.id.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.appId.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.productId.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.deviceId.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    if (params.startTime) {
      const startTime = new Date(params.startTime).getTime();
      filteredData = filteredData.filter(item => 
        new Date(item.createdAt).getTime() >= startTime
      );
    }

    if (params.endTime) {
      const endTime = new Date(params.endTime).getTime();
      filteredData = filteredData.filter(item => 
        new Date(item.createdAt).getTime() <= endTime
      );
    }

    if (params.used !== undefined) {
      filteredData = filteredData.filter(item => item.used === params.used);
    }

    if (params.appId) {
      filteredData = filteredData.filter(item => item.appId === params.appId);
    }

    if (params.productId) {
      filteredData = filteredData.filter(item => item.productId === params.productId);
    }

    const startIndex = (params.current - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      items: paginatedData,
      total: filteredData.length,
      current: params.current,
      pageSize: params.pageSize
    };
  },

  create: async (data: CreateStockRequest): Promise<Stock[]> => {
    const newStocks: Stock[] = Array.from({ length: 1 }, (_, i) => ({
      id: `stock_${Date.now()}_${i}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appId: data.appId,
      deviceId: data.deviceId,
      productId: data.productId,
      used: false,
      rawData: data.rawData
    }));

    return new Promise(resolve => {
      setTimeout(() => resolve(newStocks), 500);
    });
  },

  delete: async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 300);
    });
  },

  batchDelete: async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 500);
    });
  },

  importFromJson: async (jsonData: unknown[]): Promise<{ success: number; failed: number }> => {
    console.log('导入数据:', jsonData);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: jsonData.length,
          failed: 0
        });
      }, 1000);
    });
  }
};