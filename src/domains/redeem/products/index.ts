import type { ProductDefinition } from './types';
import type { ProductSlug } from '../types';
import { chatgptProduct } from './chatgpt';
import { discordProduct } from './discord';

const definitions: Record<ProductSlug, ProductDefinition> = {
  discord: discordProduct,
  chatgpt: chatgptProduct,
};

export const supportedProducts = Object.keys(definitions) as ProductSlug[];

export function getProductDefinition(product: ProductSlug): ProductDefinition {
  return definitions[product];
}

export function resolveProduct(productParam: string | undefined): ProductDefinition | null {
  if (!productParam) {
    return null;
  }
  if (supportedProducts.includes(productParam as ProductSlug)) {
    return definitions[productParam as ProductSlug];
  }
  return null;
}
