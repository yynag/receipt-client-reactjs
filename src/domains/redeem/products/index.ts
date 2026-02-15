import { chatgptProduct } from './chatgpt';
import { claudeProduct } from './claude';
import { discordProduct } from './discord';
import { grokProduct } from './grok';
import type { ProductDefinition } from './types';

const definitions: Record<string, ProductDefinition> = {
  discord: discordProduct,
  chatgpt: chatgptProduct,
  grok: grokProduct,
  claude: claudeProduct,
};

export const supportedProducts = Object.keys(definitions) as string[];

export function getProductDefinition(product: string): ProductDefinition {
  return definitions[product];
}

export function resolveProduct(productParam: string | undefined): ProductDefinition | null {
  if (!productParam) {
    return null;
  }
  return definitions[productParam];
}
