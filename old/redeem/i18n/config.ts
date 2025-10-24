import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, STORAGE_KEYS, SUPPORTED_LANGUAGES } from '@/common/utils/constants';
import { i18nResources } from './resources';

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: i18nResources,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      nonExplicitSupportedLngs: true,
      load: 'currentOnly',
      interpolation: {
        escapeValue: false,
      },
      defaultNS: 'common',
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: STORAGE_KEYS.language,
      },
    });
}

export { i18n };
