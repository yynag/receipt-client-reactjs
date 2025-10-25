import { baseUrl, sleep, request } from "./shared";

interface User {
  id: string;
  user_id: string;
  token: string;
  role: string;
}

export interface ListUser {
  ID: number;
  CreatedAt: string;
  user_id: string;
  role: "admin" | "stock";
  login_at: string;
  device_id: string;
}

export interface CreateUserRequest {
  user_id: string;
  password: string;
  role: "admin" | "stock";
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
  role?: "admin" | "stock";
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface UserFilterOptions {
  roles: FilterOption[];
}

const setToken = (token: string): void => {
  localStorage.setItem("user_token", token);
};

export const userApi = {
  login: async (username: string, password: string): Promise<User> => {
    const response = await request(`${baseUrl}/users/public/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
      throw new Error("Login failed: " + (await response.text()));
    }
    const user = await response.json();
    if (!user.token) {
      throw new Error("Invalid user token");
    }
    setToken(user.token);
    return user;
  },

  loginMock: async (username: string, password: string): Promise<User> => {
    console.log("Mock login", username, password);
    await sleep(1000);
    return {
      id: "1",
      user_id: username,
      role: "admin",
      token: "mock-token"
    };
  },

  getFilterOptions: async (): Promise<UserFilterOptions> => {
    return new Promise((resolve) => {
      resolve({
        roles: [
          { value: "admin", label: "管理员" },
          { value: "stock", label: "库存管理" }
        ]
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
      method: "GET"
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user list: " + (await response.text()));
    }
    return await response.json();
  },

  getListMock: async (params: UserListParams): Promise<UserListResponse> => {
    const mockData: ListUser[] = Array.from({ length: 100 }, (_, i) => ({
      ID: i,
      CreatedAt: new Date(Date.now() - i * 3600000).toISOString(),
      user_id:
        i % 3 === 0
          ? `admin${Math.floor(Math.random() * 100)}@example.com`
          : i % 3 === 1
          ? `138${String(Math.floor(Math.random() * 100000000)).padStart(8, "0")}`
          : `user${Math.floor(Math.random() * 1000)}@company.com`,
      role: Math.random() > 0.7 ? "admin" : "stock",
      login_at: new Date(Date.now() - i * 60000).toISOString(),
      device_id: `device_${Math.floor(Math.random() * 1000)}`
    }));

    let filteredData = mockData;

    if (params.keywords) {
      filteredData = filteredData.filter((item) => item.user_id.toLowerCase().includes(params.keywords!.toLowerCase()));
    }

    if (params.role) {
      filteredData = filteredData.filter((item) => item.role === params.role);
    }

    const startIndex = (params.current - 1) * params.page_size;
    const endIndex = startIndex + params.page_size;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      items: paginatedData,
      total: filteredData.length,
      current: params.current,
      page_size: params.page_size
    };
  },

  create: async (data: CreateUserRequest): Promise<void> => {
    const response = await request(`${baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("Failed to create user: " + (await response.text()));
    }
    return;
  },

  createMock: async (data: CreateUserRequest): Promise<void> => {
    console.log("Creating user:", data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },

  batchDelete: async (ids: number[]): Promise<void> => {
    const response = await request(`${baseUrl}/users/${ids.join(",")}`);
    if (!response.ok) {
      throw new Error("Failed to delete users: " + (await response.text()));
    }
    return;
  },

  batchDeleteMock: async (ids: string[]): Promise<void> => {
    console.log("Batch deleting users:", ids);
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  },

  update: async (id: number, data: Partial<CreateUserRequest>): Promise<void> => {
    const response = await request(`${baseUrl}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error("Failed to update user: " + (await response.text()));
    }
    return;
  },

  updateMock: async (id: string, data: Partial<CreateUserRequest>): Promise<void> => {
    console.log("Updating user:", id, data);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }
};
