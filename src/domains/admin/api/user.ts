import { baseUrl, request, setToken } from './shared';

interface User {
  id: string;
  user_id: string;
  token: string;
  role: string;
}

export interface UserDetail {
  user_id: string;
  role: string;
  total_amount: number;
  consumed_amount: number;
}

export interface ListUser {
  id: number;
  CreatedAt: string;
  user_id: string;
  role: 'admin' | 'instock';
  login_at: string;
  device_id: string;
  total_amount: number;
  consumed_amount: number;
}

export interface CreateUserRequest {
  user_id: string;
  password: string;
  role: 'admin' | 'instock';
  amount: number;
}

export interface UserListResponse {
  items: ListUser[];
  total: number;
  current: number;
  page_size: number;
}

export interface UserListParams {
  current: number;
  page_size: number;
  keywords?: string;
  role?: 'admin' | 'instock';
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface UserFilterOptions {
  roles: FilterOption[];
}

export const userApi = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await request(`${baseUrl}/users/public/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed: ' + (await response.text()));
    }
    const user = await response.json();
    if (!user.token) {
      throw new Error('Invalid user token');
    }
    setToken(user.token);
    return user;
  },

  get: async (userId: string): Promise<UserDetail> => {
    const response = await request(`${baseUrl}/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user: ' + (await response.text()));
    }
    return await response.json();
  },

  getFilterOptions: async (): Promise<UserFilterOptions> => {
    return new Promise((resolve) => {
      resolve({
        roles: [
          { value: 'admin', label: 'Admin' },
          { value: 'instock', label: 'Instock' },
        ],
      });
    });
  },

  getList: async (params: UserListParams): Promise<UserListResponse> => {
    let url = `${baseUrl}/users?page=${params.current}&page_size=${params.page_size}`;
    if (params.keywords) {
      url += `&keywords=${encodeURIComponent(params.keywords)}`;
    }
    if (params.role) {
      url += `&role=${params.role}`;
    }
    const response = await request(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user list: ' + (await response.text()));
    }
    return await response.json();
  },

  create: async (data: CreateUserRequest): Promise<void> => {
    const response = await request(`${baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create user: ' + (await response.text()));
    }
    return;
  },

  batchDelete: async (ids: number[]): Promise<void> => {
    const response = await request(`${baseUrl}/users/${ids.join(',')}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete users: ' + (await response.text()));
    }
    return;
  },

  batchDeleteMock: async (ids: string[]): Promise<void> => {
    console.log('Batch deleting users:', ids);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  },

  update: async (id: number, data: Partial<CreateUserRequest>): Promise<void> => {
    const response = await request(`${baseUrl}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update user: ' + (await response.text()));
    }
    return;
  },
};
