import { useEffect, useMemo, useState } from 'react';
import type { Language, ThemePreference, CdkResult } from './types';
import { fallbackLanguage, getTranslation, supportedLanguages } from './translation';
import QueryForm from './components/QueryForm';
import ResultsPanel from './components/ResultsPanel';
import './styles.css';

const isBrowser = typeof window !== 'undefined';

function detectDeviceLanguage(): Language {
  if (!isBrowser) return fallbackLanguage;
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('zh') ? 'zh' : 'en';
}

function detectDeviceTheme(): ThemePreference {
  if (!isBrowser) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const LANGUAGE_KEY = 'query_language';
const THEME_KEY = 'query_theme';

export default function QueryPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (!isBrowser) return fallbackLanguage;
    const stored = window.localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (stored && supportedLanguages.includes(stored)) return stored;
    return detectDeviceLanguage();
  });

  const [{ theme, manual }, setTheme] = useState<{ theme: ThemePreference; manual: boolean }>(() => {
    if (!isBrowser) return { theme: 'light', manual: false };
    return { theme: detectDeviceTheme(), manual: false };
  });

  const t = useMemo(() => getTranslation(language), [language]);
  const [results, setResults] = useState<CdkResult[]>([]);
  const total = results.length;
  const used = results.filter((r) => r.status === 'used').length;
  const unused = results.filter((r) => r.status === 'unused').length;

  useEffect(() => {
    document.title = t.title;
  }, [t.title]);

  useEffect(() => {
    if (!isBrowser) return;
    window.localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!isBrowser) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (e: MediaQueryListEvent) => {
      if (!manual) setTheme({ theme: e.matches ? 'dark' : 'light', manual: false });
    };
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [manual]);

  useEffect(() => {
    if (!isBrowser) return;
    if (manual) window.localStorage.setItem(THEME_KEY, theme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme, manual]);

  const toggleLanguage = () => setLanguage((p) => (p === 'zh' ? 'en' : 'zh'));
  const toggleTheme = () => setTheme((p) => ({ theme: p.theme === 'dark' ? 'light' : 'dark', manual: true }));

  return (
    <div className="query-page">
      <header className="max-w-5xl w-full mx-auto mt-4 p-4">
        <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
            <p className="text-sm opacity-70">{t.subTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="btn-outline" onClick={toggleLanguage}>
              {language === 'zh' ? 'EN' : '中文'}
            </button>
            <button type="button" className="btn-outline" onClick={toggleTheme}>
              {theme === 'dark' ? '🌞' : '🌜'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-4">
        <QueryForm translation={t} onResults={setResults} />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-sm opacity-70">{t.stats.total}</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold">{used}</div>
            <div className="text-sm opacity-70">{t.stats.used}</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl font-bold">{unused}</div>
            <div className="text-sm opacity-70">{t.stats.unused}</div>
          </div>
        </div>

        <ResultsPanel translation={t} results={results} />
      </main>
    </div>
  );
}
