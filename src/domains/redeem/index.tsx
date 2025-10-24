import { useEffect, useMemo, useState } from "react";
import { MoonOutlined, SunOutlined, TranslationOutlined } from "@ant-design/icons";
import RedeemForm from "./components/RedeemForm";
import { TokenGuide } from "./components/TokenGuide";
import HistoryModal from "./components/HistoryModal";
import ConfirmModal from "./components/ConfirmModal";
import type { ConfirmPayload, HistoryRecord, ThemePreference } from "./types";
import type { Language } from "./translation";
import { fallbackLanguage, getTranslation, supportedLanguages } from "./translation";
import "./styles.css";

const LANGUAGE_STORAGE_KEY = "redeem_language";
const THEME_STORAGE_KEY = "redeem_theme";
const HISTORY_STORAGE_KEY = "redeem_history";

const isBrowser = typeof window !== "undefined";

function readStoredLanguage(): Language {
  if (!isBrowser) {
    return fallbackLanguage;
  }
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
  return stored && supportedLanguages.includes(stored) ? stored : fallbackLanguage;
}

function readStoredHistory(): HistoryRecord[] {
  if (!isBrowser) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as HistoryRecord[];
    }
  } catch (error) {
    console.warn("[redeem] Failed to parse history", error);
  }
  return [];
}

function getDeviceTheme(): ThemePreference {
  if (!isBrowser) {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function RedeemPage() {
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage());
  const [history, setHistory] = useState<HistoryRecord[]>(() => readStoredHistory());
  const [confirmPayload, setConfirmPayload] = useState<ConfirmPayload | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hasManualTheme, setHasManualTheme] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemePreference>(() => {
    return getDeviceTheme();
  });

  const translation = useMemo(() => getTranslation(language), [language]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const deviceTheme = getDeviceTheme();
    setTheme(deviceTheme);
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", syncTheme);
    return () => media.removeEventListener("change", syncTheme);
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    if (hasManualTheme) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [theme, hasManualTheme]);

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === "zh" ? "en" : "zh"));
  };

  const handleToggleTheme = () => {
    setHasManualTheme(true);
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleNotify = (payload: ConfirmPayload) => {
    setConfirmPayload(payload);
  };

  const handleCloseConfirm = () => {
    setConfirmPayload(null);
  };

  const handleAddHistory = (record: HistoryRecord) => {
    setHistory((prev) => [...prev, record]);
  };

  return (
    <div className="redeem-page">
      <header className="glass-card max-w-5xl w-full mx-auto p-4 mt-4 mb-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{translation.pageTitle}</h1>
            <p className="text-sm text-subtle">{translation.subTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="language-toggle" onClick={handleToggleLanguage}>
              <TranslationOutlined />
              <span>{language === "zh" ? "EN" : "中文"}</span>
            </button>
            <button type="button" className="theme-toggle" onClick={handleToggleTheme}>
              {theme === "dark" ? <SunOutlined /> : <MoonOutlined />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto p-4 glass-card">
        <div className="flex flex-wrap lg:flex-nowrap gap-6">
          <div className="w-full lg:w-1/3">
            <TokenGuide
              title={translation.guideTitle}
              guide={translation.guide}
              messages={translation.messages}
              onNotify={handleNotify}
              okText={translation.buttons.confirm}
            />
          </div>
          <div className="w-full lg:w-2/3">
            <RedeemForm
              translation={translation}
              onNotify={handleNotify}
              onAddHistory={handleAddHistory}
              onOpenHistory={() => setHistoryOpen(true)}
            />
          </div>
        </div>
      </main>

      <footer className="glass-card max-w-5xl w-full mx-auto p-4 mt-2 text-center text-sm opacity-75">
        {translation.footerStatement}
      </footer>

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        records={history}
        title={translation.history.title}
        emptyText={translation.history.empty}
        columnLabels={translation.history.columns}
      />

      <ConfirmModal
        open={Boolean(confirmPayload)}
        type={confirmPayload?.type ?? "info"}
        title={confirmPayload?.title ?? ""}
        message={confirmPayload?.message ?? ""}
        description={confirmPayload?.description}
        okText={confirmPayload?.okText ?? translation.buttons.close}
        onClose={handleCloseConfirm}
        onOk={confirmPayload?.onOk}
      />
    </div>
  );
}
