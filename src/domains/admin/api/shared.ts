export const baseUrl = "https://api.themoviedb.org/3";

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
      label: item
    };
  });
};

let userToken: string | undefined;

export const setUserToken = (token?: string) => {
  userToken = token;
};

export const request = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
  if (userToken) {
    if (!init) {
      init = {};
    }
    if (!init.headers) {
      init.headers = {};
    }
    (init.headers as Record<string, string>)["Authorization"] = `Bearer ${userToken}`;
  }
  return await fetch(input, init);
};
