import type { Language, TranslationContent } from '../translation';
import type { DeepPartial, PartialRecord, ProductSlug, VerifiedUser } from '../types';

export interface ProductDefinition {
  slug: ProductSlug;
  displayName: string;
  isMock: boolean;
  translationOverrides: PartialRecord<Language, DeepPartial<TranslationContent>>;
  userFormatter?: ProductUserFormatter;
}

export interface ProductUserFormatter {
  toDisplay: (user: VerifiedUser) => string;
  toDetails: (user: VerifiedUser, language: Language) => string[];
  validate?: (
    user: VerifiedUser,
  ) => { ok: true } | { ok: false; messageKey?: keyof TranslationContent['errors']; message?: string };
}
