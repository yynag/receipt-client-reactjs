// export const baseUrl = import.meta.env.DEV ? 'http://localhost:4000' : 'https://receipt-api.nitro.xin';
export const baseUrl = 'https://receipt-api.nitro.xin';

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const buildFilterOptions = (data: string[]) => {
  return data.map((item) => {
    return {
      value: item,
      label: item,
    };
  });
};

export const setToken = (token: string): void => {
  localStorage.setItem('user_token', token);
};

const getToken = (): string | null => {
  return localStorage.getItem('user_token');
};

const removeToken = (): void => {
  localStorage.removeItem('user_token');
};

export const request = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  const token = getToken();
  if (token) {
    if (!init) {
      init = {};
    }
    if (!init.headers) {
      init.headers = {};
    }
    (init.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('token not found.');
  }

  const response = await fetch(input, init);

  if (response.status === 401) {
    removeToken();
  }

  return response;
};
