import { baseUrl, request } from './shared';

export interface Product {
  user_id: string;
  product_id: string;
  app: string;
  app_product: string;
}

export interface ListProductQuery {
  user_id?: string;
  app?: string;
}

export const productApi = {
  list: async (query: ListProductQuery) => {
    let url = `${baseUrl}/products`;
    if (query.user_id) {
      url += `&user_id=${query.user_id}`;
    }
    if (query.app) {
      url += `&app=${query.app}`;
    }
    const response = await request(url, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch product list: ' + (await response.text()));
    }
    return await response.json();
  },
};
