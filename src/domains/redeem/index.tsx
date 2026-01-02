import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { ConfigProvider, theme as themeAntd } from 'antd';
import enUS from 'antd/locale/en_US';
import zhCN from 'antd/locale/zh_CN';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import ConfirmModal from './components/ConfirmModal';
import GuidePanel from './components/GuidePanel';
import QueryTaskPanel from './components/QueryTaskPanel';
import RedeemForm from './components/RedeemForm';
import { resolveProduct, supportedProducts } from './products';
import type { ProductDefinition } from './products/types';
import './styles.css';
import type { Language } from './translation';
import { fallbackLanguage, getTranslation, supportedLanguages } from './translation';
import type { ConfirmPayload, ThemePreference } from './types';

const LEGACY_STORAGE_KEYS = ['redeem_history', 'redeem_language', 'redeem_theme'];

const isBrowser = typeof window !== 'undefined';

function readStoredLanguage(key: string): Language {
  if (!isBrowser) {
    return fallbackLanguage;
  }
  const stored = window.localStorage.getItem(key) as Language | null;
  return stored && supportedLanguages.includes(stored) ? stored : fallbackLanguage;
}

function getDeviceTheme(): ThemePreference {
  if (!isBrowser) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function readStoredTheme(_key: string): { theme: ThemePreference; manual: boolean } {
  // Always follow the device theme on load for redeem pages
  if (!isBrowser) {
    return { theme: 'light', manual: false };
  }
  return { theme: getDeviceTheme(), manual: false };
}

function ProductNotFound({ product }: { product?: string }) {
  return (
    <div className="redeem-page">
      <div className="glass-card max-w-3xl w-full mx-auto p-6 mt-10 text-center space-y-4">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-base">{product ? `Product "${product}" is not available.` : 'Product not specified.'}</p>
        <p className="text-sm text-subtle">Available products: {supportedProducts.join(', ')}</p>
      </div>
    </div>
  );
}

function RedeemProductView({ definition }: { definition: ProductDefinition }) {
  const { slug, translationOverrides } = definition;

  const storagePrefix = `redeem_${slug}`;
  const languageStorageKey = `${storagePrefix}_language`;
  const historyStorageKey = `${storagePrefix}_history`;
  const themeStorageKey = `${storagePrefix}_theme`;

  const [language, setLanguage] = useState<Language>(() => readStoredLanguage(languageStorageKey));
  const [{ theme, manual }, setThemeState] = useState<{ theme: ThemePreference; manual: boolean }>(() =>
    readStoredTheme(themeStorageKey),
  );
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(null);

  useEffect(() => {
    setLanguage(readStoredLanguage(languageStorageKey));
    setThemeState(readStoredTheme(themeStorageKey));
  }, [historyStorageKey, languageStorageKey, themeStorageKey]);

  const t = useMemo(() => getTranslation(language, translationOverrides[language]), [language, translationOverrides]);

  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const rootElement = document.getElementById('root') as HTMLElement | null;

    const previousHtmlOverflowY = htmlElement.style.overflowY;
    const previousBodyOverflowY = bodyElement.style.overflowY;
    const previousRootOverflowY = rootElement?.style.overflowY ?? '';
    const previousHtmlHeight = htmlElement.style.height;
    const previousBodyHeight = bodyElement.style.height;
    const previousRootHeight = rootElement?.style.height ?? '';

    htmlElement.style.overflowY = 'auto';
    bodyElement.style.overflowY = 'auto';
    if (rootElement) {
      rootElement.style.overflowY = 'auto';
    }

    htmlElement.style.height = 'auto';
    bodyElement.style.height = 'auto';
    if (rootElement) {
      rootElement.style.height = 'auto';
    }

    return () => {
      htmlElement.style.overflowY = previousHtmlOverflowY;
      bodyElement.style.overflowY = previousBodyOverflowY;
      if (rootElement) {
        rootElement.style.overflowY = previousRootOverflowY;
      }

      htmlElement.style.height = previousHtmlHeight;
      bodyElement.style.height = previousBodyHeight;
      if (rootElement) {
        rootElement.style.height = previousRootHeight;
      }
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    window.localStorage.setItem(languageStorageKey, language);
  }, [language, languageStorageKey]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    window.localStorage.setItem(historyStorageKey, JSON.stringify(history));
  }, [history, historyStorageKey]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [manual, theme, themeStorageKey]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const syncTheme = (event: MediaQueryListEvent) => {
      if (!manual) {
        setThemeState({ theme: event.matches ? 'dark' : 'light', manual: false });
      }
    };
    media.addEventListener('change', syncTheme);
    return () => media.removeEventListener('change', syncTheme);
  }, [manual]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'zh' ? 'en' : 'zh'));
  };

  const handleToggleTheme = () => {
    setThemeState((prev) => ({
      theme: prev.theme === 'dark' ? 'light' : 'dark',
      manual: true,
    }));
  };

  const handleNotify = (payload: ConfirmPayload) => {
    setConfirmPayload(payload);
  };

  const handleCloseConfirm = () => {
    setConfirmPayload(null);
  };

  return (
    <ConfigProvider
      locale={language == 'zh' ? zhCN : enUS}
      theme={{
        algorithm: theme === 'dark' ? themeAntd.darkAlgorithm : themeAntd.defaultAlgorithm,
      }}
    >
      <div className="redeem-page">
        <header className="glass-card max-w-5xl w-full mx-auto p-4 mt-6 mb-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t.pageTitle}</h1>
              <p className="text-sm text-subtle">{t.subTitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="language-toggle" onClick={handleToggleLanguage}>
                <span>{language === 'zh' ? '中' : 'EN'}</span>
              </button>
              <button type="button" className="theme-toggle" onClick={handleToggleTheme}>
                {theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl w-full mx-auto p-4 glass-card">
          <div className="flex flex-wrap lg:flex-nowrap gap-6">
            <div className="w-full lg:w-1/3">
              <GuidePanel title={t.guideTitle} sections={t.guide} onNotify={handleNotify} okText={t.buttons.confirm} />
            </div>
            <div className="w-full lg:w-2/3 flex flex-col h-full">
              <RedeemForm product={slug} language={language} translation={t} onNotify={handleNotify} />
              <QueryTaskPanel language={language} onNotify={handleNotify} okText={t.buttons.confirm} />
            </div>
          </div>
        </main>

        <footer className="glass-card max-w-5xl w-full mx-auto p-4 mt-2 text-center text-sm opacity-75">
          {t.footerStatement}
        </footer>

        <ConfirmModal
          open={Boolean(confirmPayload)}
          type={confirmPayload?.type ?? 'info'}
          title={confirmPayload?.title ?? ''}
          message={confirmPayload?.message ?? ''}
          description={confirmPayload?.description}
          okText={confirmPayload?.okText ?? t.buttons.close}
          onClose={handleCloseConfirm}
          onOk={confirmPayload?.onOk}
        />
      </div>
    </ConfigProvider>
  );
}

export default function RedeemPage() {
  const params = useParams<{ product?: string }>();
  const productDefinition = resolveProduct(params.product);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    LEGACY_STORAGE_KEYS.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  }, []);

  if (!productDefinition) {
    return <ProductNotFound product={params.product} />;
  }

  return <RedeemProductView definition={productDefinition} />;
}
