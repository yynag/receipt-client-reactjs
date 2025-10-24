import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from './api';
import type {
  CDKInfo,
  RedeemHistoryRecord,
  UserInfo,
  ValidationStatus,
} from './api/types';
import { TokenGuide } from './components/TokenGuide';

type Language = 'zh' | 'en';
type FeedbackKind = 'success' | 'error' | 'warning' | 'info';

const HEADER_PATTERN =
  "data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

const uiText = {
  zh: {
    pageTitle: '兑换 Discord CDK',
    subTitle: '安全、快捷的账号充值服务',
    tokenLabel: '用户 Token',
    tokenPlaceholder: '请输入浏览器中获取到的 Token',
    cdkLabel: '兑换码',
    cdkPlaceholder: '请输入兑换码',
    startRedeem: '验证并兑换',
    tokenGuide: '获取指南',
    viewHistory: '查看兑换记录',
    successTitle: '兑换成功！',
    again: '继续兑换',
    securityNote: '所有数据仅在本地浏览器中用于校验，不会被存储或上传。',
    quickGuideTitle: '快速指南',
    footer: '© 2025 CDK 兑换中心. 保留所有权利。',
    redeeming: '兑换中...',
    historyTitle: '兑换历史记录',
    historyEmpty: '暂无兑换记录',
    warningTitle: '重要提醒',
    warningText: 'Plus 或 Pro 会员未到期会导致兑换失败，请确认订阅状态后再尝试。',
    languageLabel: '语言',
    themeLight: '浅色',
    themeDark: '深色',
  },
  en: {
    pageTitle: 'Redeem Discord CDK',
    subTitle: 'Safe and fast account recharge service',
    tokenLabel: 'Discord Token',
    tokenPlaceholder: 'Enter the token copied from the browser',
    cdkLabel: 'CDK Code',
    cdkPlaceholder: 'Enter the CDK code',
    startRedeem: 'Validate & Redeem',
    tokenGuide: 'Get Guide',
    viewHistory: 'View History',
    successTitle: 'Redeem Successful!',
    again: 'Redeem Another',
    securityNote:
      'All data stays within your browser for verification and is never stored on our servers.',
    quickGuideTitle: 'Quick Guide',
    footer: '© 2025 CDK Redeem Center. All rights reserved.',
    redeeming: 'Redeeming...',
    historyTitle: 'Redeem History',
    historyEmpty: 'No redemption records yet.',
    warningTitle: 'Important Notice',
    warningText:
      'Active Plus or Pro subscription may cause failure. Please double-check your plan status.',
    languageLabel: 'Language',
    themeLight: 'Light',
    themeDark: 'Dark',
  },
} satisfies Record<Language, Record<string, string>>;

const flowSteps: Record<
  Language,
  Array<{
    title: string;
    description: string;
    href?: string;
  }>
> = {
  zh: [
    {
      title: '登录 Discord',
      description: '在浏览器中打开 Discord 并保持登录状态。',
      href: 'https://discord.com/login',
    },
    {
      title: '复制 Token',
      description: '点击“获取指南”按照步骤复制当前账号的 Token。',
      href: 'https://discord.com/channels/@me',
    },
    {
      title: '输入兑换码',
      description: '粘贴兑换码并点击验证，等待系统完成充值。',
    },
  ],
  en: [
    {
      title: 'Sign in to Discord',
      description: 'Open the Discord web client in your browser and stay signed in.',
      href: 'https://discord.com/login',
    },
    {
      title: 'Copy your token',
      description: 'Use the “Get Guide” button and copy your current account token.',
      href: 'https://discord.com/channels/@me',
    },
    {
      title: 'Enter CDK code',
      description: 'Paste the CDK and click validate. The system will handle the rest.',
    },
  ],
};

const planLabel = {
  zh: {
    premium: '高级会员',
    free: '免费用户',
  },
  en: {
    premium: 'Premium Member',
    free: 'Free User',
  },
} satisfies Record<Language, Record<'premium' | 'free', string>>;

const quickGuideSteps = {
  zh: [
    '输入 Discord Token 并点击验证',
    '输入有效的兑换码',
    '点击“验证并兑换”完成充值',
  ],
  en: [
    'Enter the Discord token and validate it',
    'Paste a valid CDK code',
    'Click “Validate & Redeem” to finish',
  ],
} satisfies Record<Language, string[]>;

const historyHeader = {
  zh: {
    token: 'Token',
    cdk: '兑换码',
    time: '时间',
  },
  en: {
    token: 'Token',
    cdk: 'CDK',
    time: 'Time',
  },
} satisfies Record<Language, Record<'token' | 'cdk' | 'time', string>>;

const formatters = {
  zh: {
    tokenValidated: (info: UserInfo) =>
      `已验证用户：${info.username}(${info.global_name ?? '*'}) => ${info.email} => ${info.phone}`,
    quickStepLabel: (index: number) => `步骤 ${index}`,
  },
  en: {
    tokenValidated: (info: UserInfo) =>
      `User verified: ${info.username}(${info.global_name ?? '*'}) => ${info.email} => ${info.phone}`,
    quickStepLabel: (index: number) => `Step ${index}`,
  },
} satisfies Record<
  Language,
  {
    tokenValidated: (info: UserInfo) => string;
    quickStepLabel: (index: number) => string;
  }
>;

const languageButtons: Array<{ key: Language; label: string }> = [
  { key: 'zh', label: '简体' },
  { key: 'en', label: 'EN' },
];

const feedbackStyles: Record<FeedbackKind, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200',
  error:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200',
  info:
    'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200',
};

const statusIndicator = (status: ValidationStatus) => {
  if (status === 'loading') {
    return (
      <svg
        className="h-5 w-5 animate-spin text-indigo-500"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    );
  }

  if (status === 'valid') {
    return (
      <svg
        className="h-5 w-5 text-emerald-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  if (status === 'invalid' || status === 'premium') {
    return (
      <svg
        className="h-5 w-5 text-rose-500"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.707-10.707a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293a1 1 0 10-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return null;
};

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ open, title, onClose, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8 backdrop-blur">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/50 bg-white/95 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex items-center justify-between border-b border-indigo-100/60 px-6 py-4 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-200"
          >
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
};

const RedeemPage = () => {
  const [language, setLanguage] = useState<Language>('zh');
  const [darkMode, setDarkMode] = useState(false);
  const [token, setToken] = useState('');
  const [cdk, setCdk] = useState('');
  const [tokenStatus, setTokenStatus] = useState<ValidationStatus>('idle');
  const [cdkStatus, setCdkStatus] = useState<ValidationStatus>('idle');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cdkInfo, setCdkInfo] = useState<CDKInfo | null>(null);
  const [redeemResult, setRedeemResult] = useState<boolean | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [feedback, setFeedback] = useState<{ type: FeedbackKind; message: string } | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [redeemHistory, setRedeemHistory] = useState<RedeemHistoryRecord[]>([]);

  const lastValidatedToken = useRef<string | null>(null);
  const lastValidatedCDK = useRef<string | null>(null);
  const lastSubmissionRef = useRef<{ token: string; cdk: string } | null>(null);

  const copy = uiText[language];
  const formatter = formatters[language];
  const steps = flowSteps[language];
  const quickSteps = quickGuideSteps[language];
  const historyTitles = historyHeader[language];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => setDarkMode(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!redeemResult || !lastSubmissionRef.current) return;
    const { token: submittedToken, cdk: submittedCdk } = lastSubmissionRef.current;
    const issuedAt = new Date();

    setRedeemHistory((prev) => [
      {
        key: `${issuedAt.getTime()}`,
        token: `${submittedToken.slice(0, 12)}...`,
        cdk: submittedCdk,
        time: issuedAt.toLocaleString(),
      },
      ...prev,
    ]);

    lastSubmissionRef.current = null;
  }, [redeemResult]);

  const showFeedback = useCallback((type: FeedbackKind, message: string) => {
    setFeedback({ type, message });
  }, []);

  const handleTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
    setTokenStatus('idle');
    setUserInfo(null);
    lastValidatedToken.current = null;
    setCdkStatus('idle');
    setCdkInfo(null);
    lastValidatedCDK.current = null;
  };

  const handleCdkChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCdk(event.target.value);
    setCdkStatus('idle');
    setCdkInfo(null);
    lastValidatedCDK.current = null;
  };

  const validateToken = useCallback(async (): Promise<boolean> => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      showFeedback('warning', copy.tokenPlaceholder);
      setTokenStatus('invalid');
      setUserInfo(null);
      lastValidatedToken.current = null;
      return false;
    }

    if (trimmedToken === lastValidatedToken.current && tokenStatus === 'valid') {
      return true;
    }

    setTokenStatus('loading');

    try {
      const info = await api.validateToken(trimmedToken);
      setUserInfo(info);

      if (info.premium_type > 0) {
        setTokenStatus('premium');
        showFeedback('warning', planLabel[language].premium);
        return false;
      }

      lastValidatedToken.current = trimmedToken;
      setTokenStatus('valid');
      showFeedback('success', formatter.tokenValidated(info));
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : language === 'zh'
            ? 'Token 无法验证，请稍后再试'
            : 'Token validation failed, please retry.';
      setTokenStatus('invalid');
      setUserInfo(null);
      lastValidatedToken.current = null;
      showFeedback('error', message);
      return false;
    }
  }, [copy.tokenPlaceholder, formatter, language, planLabel, showFeedback, token, tokenStatus]);

  const validateCDK = useCallback(async (): Promise<boolean> => {
    const trimmedCdk = cdk.trim();
    if (!trimmedCdk) {
      showFeedback('warning', copy.cdkPlaceholder);
      setCdkStatus('invalid');
      setCdkInfo(null);
      lastValidatedCDK.current = null;
      return false;
    }

    if (tokenStatus !== 'valid') {
      showFeedback(
        'warning',
        language === 'zh' ? '请先验证 Token' : 'Please validate the token first',
      );
      return false;
    }

    if (trimmedCdk === lastValidatedCDK.current && cdkStatus === 'valid') {
      return true;
    }

    setCdkStatus('loading');

    try {
      const info = await api.validateCDK(trimmedCdk);
      if (info.used) {
        setCdkStatus('invalid');
        showFeedback(
          'error',
          language === 'zh' ? '兑换码已被使用' : 'CDK has already been redeemed.',
        );
        return false;
      }
      setCdkInfo(info);
      setCdkStatus('valid');
      lastValidatedCDK.current = trimmedCdk;
      showFeedback(
        'success',
        language === 'zh' ? '兑换码已验证' : 'CDK verified successfully.',
      );
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : language === 'zh'
            ? '兑换码无效，请检查后再试'
            : 'Invalid CDK, please check and retry.';
      setCdkStatus('invalid');
      setCdkInfo(null);
      lastValidatedCDK.current = null;
      showFeedback('error', message);
      return false;
    }
  }, [cdk, cdkStatus, copy.cdkPlaceholder, language, showFeedback, tokenStatus]);

  const handleRedeem = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const tokenValid = await validateToken();
      if (!tokenValid) return;

      const cdkValid = await validateCDK();
      if (!cdkValid) return;

      try {
        setRedeeming(true);
        const result = await api.redeemCDK(token.trim(), cdk.trim());
        if (result) {
          setRedeemResult(true);
          lastSubmissionRef.current = { token: token.trim(), cdk: cdk.trim() };
          showFeedback('success', copy.successTitle);
        } else {
          setRedeemResult(false);
          showFeedback(
            'error',
            language === 'zh' ? '兑换失败，请重试' : 'Redeem failed, please try again.',
          );
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : language === 'zh'
              ? '兑换失败，请稍后再试'
              : 'Redeem request failed, try again later.';
        showFeedback('error', message);
      } finally {
        setRedeeming(false);
      }
    },
    [cdk, copy.successTitle, language, showFeedback, token, validateCDK, validateToken],
  );

  const resetRedeemFlow = useCallback(() => {
    setUserInfo(null);
    setCdkInfo(null);
    setRedeemResult(null);
    setTokenStatus('idle');
    setCdkStatus('idle');
    lastValidatedToken.current = null;
    lastValidatedCDK.current = null;
    setToken('');
    setCdk('');
  }, []);

  const tokenMessage = useMemo(() => {
    if (tokenStatus === 'valid' && userInfo) {
      return formatter.tokenValidated(userInfo);
    }
    if (tokenStatus === 'invalid') {
      return language === 'zh'
        ? 'Token 无效，请检查后重试。'
        : 'Invalid token, please check and retry.';
    }
    if (tokenStatus === 'premium') {
      return language === 'zh'
        ? '当前账号已是高级会员，无法继续兑换。'
        : 'This account is already premium and cannot be redeemed.';
    }
    return null;
  }, [formatter, language, tokenStatus, userInfo]);

  const cdkMessage = useMemo(() => {
    if (cdkStatus === 'valid' && cdkInfo) {
      return language === 'zh' ? '兑换码正常，可以使用。' : 'CDK is valid and ready to use.';
    }
    if (cdkStatus === 'invalid') {
      return language === 'zh'
        ? '兑换码无效或已使用。'
        : 'Invalid CDK or already used.';
    }
    return null;
  }, [cdkInfo, cdkStatus, language]);

  const canRedeem =
    tokenStatus === 'valid' && cdkStatus === 'valid' && !redeeming && token && cdk;

  const subscriptionLabel =
    userInfo && userInfo.premium_type > 0
      ? planLabel[language].premium
      : planLabel[language].free;

  const onTokenBlur = useCallback(() => {
    if (token.trim()) {
      void validateToken();
    }
  }, [token, validateToken]);

  const onCdkBlur = useCallback(async () => {
    if (!cdk.trim()) return;
    const ok = await validateToken();
    if (ok) {
      await validateCDK();
    }
  }, [cdk, validateCDK, validateToken]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-slate-100 px-4 py-8 text-slate-700 transition-colors duration-500 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white/80 shadow-[0_22px_45px_rgba(15,23,42,0.12)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <header className="relative overflow-hidden rounded-t-[28px] bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white md:px-10 md:py-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: `url("${HEADER_PATTERN}")` }}
            />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-lg md:h-16 md:w-16">
                  🎟️
                </div>
                <div>
                  <h1 className="text-2xl font-semibold md:text-3xl">{copy.pageTitle}</h1>
                  <p className="text-sm text-white/85 md:text-base">{copy.subTitle}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {languageButtons.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setLanguage(item.key)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      language === item.key
                        ? 'border-white bg-white/20 text-white shadow-lg shadow-indigo-900/40 backdrop-blur'
                        : 'border-white/30 bg-white/10 text-white/75 hover:bg-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/20"
                >
                  {darkMode ? `🌙 ${copy.themeDark}` : `☀️ ${copy.themeLight}`}
                </button>
              </div>
            </div>
          </header>

          <main className="space-y-8 px-6 py-8 md:px-10 md:py-12">
            {feedback && (
              <div
                className={`relative rounded-2xl border px-4 py-3 text-sm shadow-sm ${feedbackStyles[feedback.type]}`}
              >
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="absolute right-3 top-3 rounded-full bg-white/40 px-2 text-xs font-semibold text-slate-500 transition hover:bg-white/70 dark:bg-slate-800/60 dark:text-slate-200"
                >
                  ×
                </button>
                <p className="pr-6 leading-relaxed">{feedback.message}</p>
              </div>
            )}

            <section className="space-y-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-300">
                  {language === 'zh' ? '兑换流程' : 'Redeem Flow'}
                </h2>
                <span className="text-xs uppercase tracking-[0.25em] text-indigo-400 dark:text-indigo-300/70">
                  {language === 'zh' ? '流程指南' : 'How it works'}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {steps.map((step, index) => (
                  <a
                    key={step.title}
                    href={step.href}
                    target={step.href ? '_blank' : undefined}
                    rel={step.href ? 'noreferrer' : undefined}
                    className="group relative block overflow-hidden rounded-2xl border border-indigo-100 bg-white/85 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/85"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70 transition group-hover:opacity-100" />
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-200">
                      {index + 1}
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                      {step.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300">
                  <span className="text-lg">📧</span>
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    {language === 'zh' ? '邮箱账号' : 'Email'}
                  </span>
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {userInfo?.email || '—'}
                </div>
                {userInfo?.phone && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{userInfo.phone}</p>
                )}
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-300">
                  <span className="text-lg">💎</span>
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    {language === 'zh' ? '订阅状态' : 'Subscription'}
                  </span>
                </div>
                <div className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {subscriptionLabel}
                </div>
                {userInfo?.global_name && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                    {userInfo.global_name}
                  </p>
                )}
              </div>
            </section>

            {redeemResult ? (
              <section className="flex justify-center">
                <div className="w-full max-w-xl rounded-[26px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-10 text-center shadow-[0_18px_38px_rgba(16,185,129,0.2)] dark:border-emerald-500/40 dark:from-emerald-500/20 dark:via-slate-900 dark:to-emerald-500/10">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl text-emerald-500 shadow-inner dark:bg-emerald-500/20 dark:text-emerald-200">
                    ✅
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-800 dark:text-slate-100">
                    {copy.successTitle}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    {language === 'zh'
                      ? '兑换已完成，记录已保存至历史列表。'
                      : 'Redeem completed. The record has been saved to history.'}
                  </p>
                  <button
                    type="button"
                    onClick={resetRedeemFlow}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                  >
                    {copy.again}
                  </button>
                </div>
              </section>
            ) : (
              <form className="grid gap-6" onSubmit={handleRedeem}>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <span className="text-lg text-indigo-500">🔑</span>
                        {copy.tokenLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTutorialOpen(true)}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:bg-indigo-500/20"
                      >
                        {copy.tokenGuide}
                      </button>
                    </div>
                    <div
                      className={`flex items-center gap-3 rounded-2xl border-2 bg-white/90 px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:border-indigo-400/60 dark:focus-within:ring-indigo-500/20 ${
                        tokenStatus === 'invalid' || tokenStatus === 'premium'
                          ? 'border-rose-300 dark:border-rose-500/60'
                          : tokenStatus === 'valid'
                            ? 'border-emerald-300 dark:border-emerald-500/60'
                            : 'border-indigo-100'
                      }`}
                    >
                      <input
                        value={token}
                        onChange={handleTokenChange}
                        onBlur={onTokenBlur}
                        onKeyUp={(event) => {
                          if (event.key === 'Enter') {
                            void validateToken();
                          }
                        }}
                        placeholder={copy.tokenPlaceholder}
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
                        autoComplete="off"
                      />
                      {statusIndicator(tokenStatus)}
                    </div>
                    {tokenMessage && (
                      <p
                        className={`text-xs font-medium ${
                          tokenStatus === 'invalid' || tokenStatus === 'premium'
                            ? 'text-rose-500 dark:text-rose-300'
                            : 'text-emerald-600 dark:text-emerald-300'
                        }`}
                      >
                        {tokenMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <span className="text-lg text-indigo-500">🎁</span>
                      {copy.cdkLabel}
                    </span>
                    <div
                      className={`flex items-center gap-3 rounded-2xl border-2 bg-white/90 px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:border-indigo-400/60 dark:focus-within:ring-indigo-500/20 ${
                        cdkStatus === 'invalid'
                          ? 'border-rose-300 dark:border-rose-500/60'
                          : cdkStatus === 'valid'
                            ? 'border-emerald-300 dark:border-emerald-500/60'
                            : 'border-indigo-100'
                      }`}
                    >
                      <input
                        value={cdk}
                        onChange={handleCdkChange}
                        onBlur={() => void onCdkBlur()}
                        onKeyUp={(event) => {
                          if (event.key === 'Enter') {
                            void handleRedeem();
                          }
                        }}
                        placeholder={copy.cdkPlaceholder}
                        className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
                        autoComplete="off"
                      />
                      {statusIndicator(cdkStatus)}
                    </div>
                    {cdkMessage && (
                      <p
                        className={`text-xs font-medium ${
                          cdkStatus === 'invalid'
                            ? 'text-rose-500 dark:text-rose-300'
                            : 'text-emerald-600 dark:text-emerald-300'
                        }`}
                      >
                        {cdkMessage}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-5 py-4 text-sm text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-base">⚠️</span>
                      {copy.warningTitle}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-amber-700/90 dark:text-amber-200/80">
                      {copy.warningText}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!canRedeem}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-base font-semibold text-white shadow-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
                  >
                    <span className="absolute inset-0 translate-x-[-80%] bg-white/20 opacity-0 transition duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                    <span className="relative">{redeeming ? copy.redeeming : copy.startRedeem}</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setHistoryOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                    >
                      📜 {copy.viewHistory}
                    </button>
                  </div>

                  <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                    {copy.securityNote}
                  </p>
                </div>
              </form>
            )}

            <section className="rounded-3xl border border-indigo-100 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
              <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                {copy.quickGuideTitle}
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {quickSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex flex-col rounded-2xl border border-indigo-100 bg-white/90 px-4 py-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400 dark:text-indigo-300">
                      {formatter.quickStepLabel(index + 1)}
                    </span>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-200">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <footer className="rounded-b-[28px] border-t border-indigo-100 bg-slate-50/80 px-6 py-5 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400 md:px-10">
            {copy.footer}
          </footer>
        </div>
      </div>

      <Modal open={tutorialOpen} onClose={() => setTutorialOpen(false)} title={copy.tokenGuide}>
        <TokenGuide
          language={language}
          onCopyFeedback={(type, message) => {
            showFeedback(type, message);
          }}
        />
      </Modal>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title={copy.historyTitle}>
        {redeemHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-6 py-10 text-center text-sm text-indigo-500 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200">
            {copy.historyEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-indigo-500 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-indigo-200">
              <span>{historyTitles.token}</span>
              <span>{historyTitles.cdk}</span>
              <span>{historyTitles.time}</span>
            </div>
            {redeemHistory.map((record) => (
              <div
                key={record.key}
                className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 text-sm text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {historyTitles.token}
                  </span>
                  <span className="mt-1 break-all font-medium text-slate-700 dark:text-slate-100">
                    {record.token}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {historyTitles.cdk}
                  </span>
                  <span className="mt-1 break-all font-medium text-slate-700 dark:text-slate-100">
                    {record.cdk}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {historyTitles.time}
                  </span>
                  <span className="mt-1 font-medium text-slate-700 dark:text-slate-100">
                    {record.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RedeemPage;
