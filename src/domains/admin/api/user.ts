import { baseUrl, sleep } from "./shared";

export class UserApi {
  static async login(username: string, password: string): Promise<User> {
    const response = await fetch(`${baseUrl}/users/public/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      throw new Error("Login failed: " + (await response.text()));
    }
    const data: User = await response.json();
    return data;
  }
}

export class UserApiMock {
  static async login(username: string, password: string): Promise<User> {
    console.log("Mock login", username, password);
    await sleep(1000);
    return {
      id: "1",
      name: username,
      role: "admin"
    };
  }
}

interface User {
  id: string;
  name: string;
  role: string;
}

export interface AdminUser {
  id: string;
  createdAt: string;
  user_id: string;
  role: "admin" | "stock";
}

export interface CreateUserRequest {
  user_id: string;
  role: "admin" | "stock";
}

export interface UserListResponse {
  items: AdminUser[];
  total: number;
  current: number;
  pageSize: number;
}

export interface UserListParams {
  current: number;
  pageSize: number;
  search?: string;
  role?: "admin" | "stock";
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface UserFilterOptions {
  roles: FilterOption[];
}

export const userApi = {
  getFilterOptions: async (): Promise<UserFilterOptions> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          roles: [
            { value: 'admin', label: '管理员' },
            { value: 'stock', label: '库存管理' }
          ]
        });
      }, 200);
    });
  },

  getList: async (params: UserListParams): Promise<UserListResponse> => {
    const mockData: AdminUser[] = Array.from({ length: 100 }, (_, i) => ({
      id: `user_${i + 1}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      user_id: i % 3 === 0 ? `admin${Math.floor(Math.random() * 100)}@example.com` : 
                i % 3 === 1 ? `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}` :
                `user${Math.floor(Math.random() * 1000)}@company.com`,
      role: Math.random() > 0.7 ? "admin" : "stock"
    }));

    let filteredData = mockData;
    
    if (params.search) {
      filteredData = filteredData.filter(
        item =>
          item.user_id.toLowerCase().includes(params.search!.toLowerCase()) ||
          item.id.toLowerCase().includes(params.search!.toLowerCase())
      );
    }

    if (params.role) {
      filteredData = filteredData.filter(item => item.role === params.role);
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

  create: async (data: CreateUserRequest): Promise<AdminUser> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id: `user_${Date.now()}`,
          createdAt: new Date().toISOString(),
          user_id: data.user_id,
          role: data.role
        });
      }, 500);
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

  update: async (id: string, data: Partial<CreateUserRequest>): Promise<AdminUser> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          id,
          createdAt: new Date().toISOString(),
          user_id: data.user_id || '',
          role: data.role || 'stock'
        });
      }, 500);
    });
  }
};
