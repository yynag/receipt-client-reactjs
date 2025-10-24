export interface CDK {
  id: string;
  createdAt: string;
  code: string;
  used: boolean;
  usedUser?: string;
  stockId?: string;
  uploaderId: string;
  appId: string;
  appProductId: string;
}

export interface CreateCDKRequest {
  appId: string;
  productId: string;
  quantity: number;
}

export interface CDKListResponse {
  items: CDK[];
  total: number;
  current: number;
  pageSize: number;
}

export interface CDKListParams {
  current: number;
  pageSize: number;
  search?: string;
  used?: boolean;
  appId?: string;
  appProductId?: string;
  uploaderId?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterOptions {
  used: FilterOption[];
  appIds: FilterOption[];
  productIds: FilterOption[];
  uploaderIds: FilterOption[];
}

export interface TrendData {
  date: string;
  count: number;
}

export interface TrendResponse {
  monthly: TrendData[];
  weekly: TrendData[];
  daily: TrendData[];
}

export interface StatData {
  name: string;
  value: number;
}

export interface CDKStatResponse {
  total: number;
  used: number;
  unused: number;
  details: StatData[];
}

export interface StockStatResponse {
  total: number;
  shipped: number;
  inStock: number;
  details: StatData[];
}

export const cdkApi = {
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
          uploaderIds: Array.from({ length: 10 }, (_, i) => ({
            value: `admin_${i}`,
            label: `Admin ${i}`
          }))
        });
      }, 200);
    });
  },

  getTrendData: async (userId?: string, dimension?: 'monthly' | 'weekly' | 'daily'): Promise<TrendResponse> => {
    console.log('Fetching trend data for user:', userId, 'dimension:', dimension);
    return new Promise(resolve => {
      setTimeout(() => {
        const generateTrendData = (days: number): TrendData[] => {
          return Array.from({ length: days }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            return {
              date: dimension === 'monthly' ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` :
                   dimension === 'weekly' ? `第${Math.ceil(i / 7)}周` :
                   `${date.getMonth() + 1}-${date.getDate()}`,
              count: Math.floor(Math.random() * 50) + 10
            };
          });
        };

        resolve({
          monthly: generateTrendData(12),
          weekly: generateTrendData(12),
          daily: generateTrendData(30)
        });
      }, 300);
    });
  },

  getCDKStats: async (appId?: string, productId?: string, uploaderId?: string): Promise<CDKStatResponse> => {
    console.log('Fetching CDK stats for app:', appId, 'product:', productId, 'uploader:', uploaderId);
    return new Promise(resolve => {
      setTimeout(() => {
        const total = Math.floor(Math.random() * 1000) + 500;
        const used = Math.floor(total * (Math.random() * 0.5 + 0.3));
        const unused = total - used;
        
        resolve({
          total,
          used,
          unused,
          details: [
            { name: '已使用', value: used },
            { name: '未使用', value: unused }
          ]
        });
      }, 300);
    });
  },

  getStockStats: async (appId?: string, productId?: string): Promise<StockStatResponse> => {
    console.log('Fetching stock stats for app:', appId, 'product:', productId);
    return new Promise(resolve => {
      setTimeout(() => {
        const total = Math.floor(Math.random() * 2000) + 1000;
        const shipped = Math.floor(total * (Math.random() * 0.6 + 0.2));
        const inStock = total - shipped;
        
        resolve({
          total,
          shipped,
          inStock,
          details: [
            { name: '已出库', value: shipped },
            { name: '库存中', value: inStock }
          ]
        });
      }, 300);
    });
  },

  getList: async (params: CDKListParams): Promise<CDKListResponse> => {
    const mockData: CDK[] = Array.from({ length: 100 }, (_, i) => ({
      id: `cdk_${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      code: `CDK-${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      used: Math.random() > 0.7,
      usedUser: Math.random() > 0.7 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
      stockId: Math.random() > 0.7 ? `stock_${Math.floor(Math.random() * 100)}` : undefined,
      uploaderId: `admin_${Math.floor(Math.random() * 10)}`,
      appId: `app_${Math.floor(Math.random() * 10)}`,
      appProductId: `product_${Math.floor(Math.random() * 50)}`
    }));

    let filteredData = mockData;
    
    if (params.search) {
      filteredData = filteredData.filter(
        item =>
          item.code.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.appId.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.appProductId.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    if (params.used !== undefined) {
      filteredData = filteredData.filter(item => item.used === params.used);
    }

    if (params.appId) {
      filteredData = filteredData.filter(item => item.appId === params.appId);
    }

    if (params.appProductId) {
      filteredData = filteredData.filter(item => item.appProductId === params.appProductId);
    }

    if (params.uploaderId) {
      filteredData = filteredData.filter(item => item.uploaderId === params.uploaderId);
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

  create: async (data: CreateCDKRequest): Promise<CDK[]> => {
    const newCDKs: CDK[] = Array.from({ length: data.quantity }, (_, i) => ({
      id: `cdk_${Date.now()}_${i}`,
      createdAt: new Date().toISOString(),
      code: `CDK-${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
      used: false,
      uploaderId: "current_admin",
      appId: data.appId,
      appProductId: data.productId
    }));

    return new Promise(resolve => {
      setTimeout(() => resolve(newCDKs), 500);
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
  }
};