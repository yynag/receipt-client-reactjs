import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button as AntButton, Input, Modal, Table } from 'antd';
import { Controller } from 'react-hook-form';
import {
  ArrowRight,
  Languages,
  Moon,
  Sun,
  Gift,
  History,
  KeyRound,
  Ticket,
  Sparkles,
} from 'lucide-react';
import { CheckCircleTwoTone, CloseCircleTwoTone, LoadingOutlined } from '@ant-design/icons';
import { useRedeem } from '../hooks/useRedeem';
import { useI18n } from '@/common/hooks/useI18n';
import { TokenGuideSteps } from '../components/TokenGuideSteps';
import type { Language } from '@/common/types/common';
import { DEFAULT_LANGUAGE, STORAGE_KEYS } from '@/common/utils/constants';
import { storage } from '@/common/utils/storage';
import { useTheme } from '@/common/hooks/useTheme';
import type { ColumnsType } from 'antd/es/table';

type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'premium';

interface RedeemHistoryRecord {
  key: string;
  token: string;
  cdk: string;
  time: string;
}

const detectPreferredLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const preferred =
    window.navigator.languages?.[0] ?? window.navigator.language ?? DEFAULT_LANGUAGE;
  const normalized = preferred.toLowerCase();

  if (normalized.startsWith('zh')) return 'zh';
  return 'en';
};

const statusIcon = (status: ValidationStatus) => {
  switch (status) {
    case 'loading':
      return <LoadingOutlined spin className="text-blue-500" />;
    case 'valid':
      return <CheckCircleTwoTone twoToneColor="#22c55e" />;
    case 'invalid':
      return <CloseCircleTwoTone twoToneColor="#ef4444" />;
    default:
      return null;
  }
};

const statusToValidation = (status: ValidationStatus) => {
  if (status === 'invalid') return 'error' as const;
  if (status === 'loading') return 'warning' as const;
  return undefined;
};

interface FieldProps {
  extra?: ReactNode;
  label: ReactNode;
  placeholder: string;
  status: ValidationStatus;
  message: string | null;
  onBlur: () => Promise<void | boolean>;
  controlName: 'token' | 'cdk';
  control: ReturnType<typeof useRedeem>['form']['control'];
  errors: ReturnType<typeof useRedeem>['form']['formState']['errors'];
}

const RedeemInputField = ({
  label,
  placeholder,
  status,
  message,
  onBlur,
  controlName,
  control,
  errors,
  extra,
}: FieldProps) => (
  <div className="space-y-3 dark:[&_.ant-input-affix-wrapper]:border-slate-700 dark:[&_.ant-input-affix-wrapper]:bg-slate-900/80 dark:[&_.ant-input-affix-wrapper]:text-slate-100 dark:[&_.ant-input-affix-wrapper-status-error]:!bg-slate-900/80 dark:[&_.ant-input-affix-wrapper-status-warning]:!bg-slate-900/80 dark:[&_.ant-input-affix-wrapper]:hover:bg-slate-900 dark:[&_.ant-input-affix-wrapper]:focus-within:!bg-slate-900">
    <div className="flex items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {extra}
    </div>
    <Controller
      name={controlName}
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          size="large"
          className="h-12 rounded-xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-blue-500 focus:bg-white focus:shadow focus:shadow-blue-500/10 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:!bg-slate-900 dark:focus:shadow-blue-400/10"
          placeholder={placeholder}
          status={statusToValidation(status)}
          suffix={statusIcon(status)}
          onBlur={() => {
            field.onBlur();
            // 只在有值的时候才验证
            if (field.value?.trim()) {
              void onBlur();
            }
          }}
          onPressEnter={() => {
            if (field.value?.trim()) {
              void onBlur();
            }
          }}
        />
      )}
    />
    {message ? (
      <div className="flex items-center gap-2">
        {status === 'valid' && (
          <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === 'invalid' ||
          (status === 'premium' && (
            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        <span
          className={`text-sm font-medium ${status === 'invalid' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
        >
          {message}
        </span>
      </div>
    ) : errors[controlName]?.message ? (
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          {errors[controlName]?.message}
        </span>
      </div>
    ) : null}
  </div>
);

export const RedeemPage = () => {
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { mode, setMode, resolvedTheme } = useTheme();
  const {
    form,
    userInfo,
    cdkInfo,
    redeemResult,
    redeeming,
    tokenStatus,
    cdkStatus,
    validateToken,
    validateCDK,
    handleRedeem,
    resetRedeemFlow,
  } = useRedeem();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [themeSelection, setThemeSelection] = useState<'light' | 'dark'>(() =>
    resolvedTheme === 'dark' ? 'dark' : 'light',
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [redeemHistory, setRedeemHistory] = useState<RedeemHistoryRecord[]>([]);
  const lastSubmissionRef = useRef<{ token: string; cdk: string } | null>(null);

  useEffect(() => {
    if (mode === 'system') {
      setThemeSelection(resolvedTheme === 'dark' ? 'dark' : 'light');
    } else {
      setThemeSelection(mode);
    }
  }, [mode, resolvedTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedLanguage = storage.get<Language>(STORAGE_KEYS.language);
    if (storedLanguage) {
      storage.set(STORAGE_KEYS.language, storedLanguage);
      return;
    }
    const preferred = detectPreferredLanguage();
    if (preferred !== currentLanguage) {
      void changeLanguage(preferred);
    }
  }, [changeLanguage, currentLanguage]);

  useEffect(() => {
    if (redeemResult && lastSubmissionRef.current) {
      const { token, cdk } = lastSubmissionRef.current;
      const issuedAt = new Date();
      const formatted = issuedAt.toLocaleString();
      setRedeemHistory((prev) => [
        {
          key: `${issuedAt.getTime()}`,
          token,
          cdk,
          time: formatted,
        },
        ...prev,
      ]);
      lastSubmissionRef.current = null;
    }
  }, [redeemResult]);

  const tokenMessage = useMemo(() => {
    if (tokenStatus === 'valid' && userInfo) {
      return t('redeem.messages.tokenValidated', {
        name: `${userInfo.username}(${userInfo.global_name ?? '*'})`,
        email: userInfo.email,
        phone: userInfo.phone,
      });
    }
    if (tokenStatus === 'invalid') {
      return form.formState.errors.token?.message ?? t('redeem.errors.tokenInvalid');
    }
    if (tokenStatus === 'premium') {
      return t('redeem.errors.tokenIsPremium');
    }
    return null;
  }, [form.formState.errors.token?.message, tokenStatus, t, userInfo]);

  const cdkMessage = useMemo(() => {
    if (cdkStatus === 'valid' && cdkInfo) {
      return t('redeem.messages.cdkValidated');
    }
    if (cdkStatus === 'invalid') {
      return form.formState.errors.cdk?.message ?? t('redeem.errors.cdkInvalid');
    }
    return null;
  }, [cdkInfo, cdkStatus, form.formState.errors.cdk?.message, t]);

  const canRedeem = tokenStatus === 'valid' && cdkStatus === 'valid';

  const handleRedeemWithTracking = useCallback(async () => {
    const values = form.getValues();
    lastSubmissionRef.current = {
      token: values.token?.trim() ?? '',
      cdk: values.cdk?.trim() ?? '',
    };
    await handleRedeem();
  }, [form, handleRedeem]);

  const handleAgain = useCallback(() => {
    lastSubmissionRef.current = null;
    resetRedeemFlow();
  }, [resetRedeemFlow]);

  const handleLanguageToggle = useCallback(async () => {
    const nextLanguage: Language = currentLanguage === 'zh' ? 'en' : 'zh';
    await changeLanguage(nextLanguage);
  }, [changeLanguage, currentLanguage]);

  const handleThemeToggle = useCallback(() => {
    const nextTheme = themeSelection === 'dark' ? 'light' : 'dark';
    setThemeSelection(nextTheme);
    setMode(nextTheme);
  }, [setMode, themeSelection]);

  const tokenField = (
    <RedeemInputField
      label={
        <>
          <KeyRound size={16} className="text-blue-500 dark:text-blue-300" aria-hidden="true" />
          <span>{t('redeem.form.tokenLabel')}</span>
        </>
      }
      placeholder={t('redeem.form.tokenPlaceholder')}
      status={tokenStatus}
      message={tokenMessage}
      onBlur={validateToken}
      controlName="token"
      control={form.control}
      errors={form.formState.errors}
      extra={
        <AntButton
          type="link"
          icon={
            <Sparkles size={16} className="text-blue-500 dark:text-blue-300" aria-hidden="true" />
          }
          className="flex items-center gap-1 px-0 text-sm font-medium"
          onClick={() => setTutorialOpen(true)}
        >
          {t('redeem.buttons.tokenGuide')}
        </AntButton>
      }
    />
  );

  const cdkField = (
    <RedeemInputField
      label={
        <>
          <Ticket size={16} className="text-violet-500 dark:text-violet-300" aria-hidden="true" />
          <span>{t('redeem.form.cdkLabel')}</span>
        </>
      }
      placeholder={t('redeem.form.cdkPlaceholder')}
      status={cdkStatus}
      message={cdkMessage}
      onBlur={async () => {
        const ok = await validateToken();
        if (!ok) {
          form.setError('token', { type: 'manual', message: t('redeem.errors.tokenRequired') });
          return;
        }
        await validateCDK();
      }}
      controlName="cdk"
      control={form.control}
      errors={form.formState.errors}
    />
  );

  const modalRootClassName =
    'redeem-modal [&_.ant-modal-content]:rounded-2xl dark:[&_.ant-modal-content]:bg-slate-900 dark:[&_.ant-modal-content]:border dark:[&_.ant-modal-content]:border-slate-700 dark:[&_.ant-modal-content]:text-slate-100 dark:[&_.ant-modal-header]:bg-slate-900 dark:[&_.ant-modal-header]:border-slate-700 dark:[&_.ant-modal-title]:text-slate-100 dark:[&_.ant-modal-close-x]:text-slate-300 dark:[&_.ant-modal-close-x]:hover:text-white dark:[&_.ant-modal-body]:bg-slate-900 dark:[&_.ant-table]:bg-slate-900 dark:[&_.ant-table]:text-slate-200 dark:[&_.ant-table-thead>tr>th]:bg-slate-900 dark:[&_.ant-table-thead>tr>th]:text-slate-300 dark:[&_.ant-table-tbody>tr>td]:text-slate-200 dark:[&_.ant-table-tbody>tr]:!bg-slate-900 dark:[&_.ant-table-tbody>tr:hover>td]:!bg-slate-800';

  const redeemButton = (
    <AntButton
      type="primary"
      shape="round"
      size="large"
      block
      className="h-12 rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 active:translate-y-px disabled:opacity-60 disabled:shadow-none"
      onClick={() => void handleRedeemWithTracking()}
      loading={redeeming}
      disabled={!canRedeem}
      icon={<ArrowRight size={18} />}
      iconPosition="end"
    >
      {t('redeem.buttons.startRedeem')}
    </AntButton>
  );

  const guideModal = (
    <Modal
      open={tutorialOpen}
      title={t('redeem.buttons.tokenGuide')}
      onCancel={() => setTutorialOpen(false)}
      footer={null}
      centered
      width={560}
      rootClassName={modalRootClassName}
    >
      <TokenGuideSteps />
    </Modal>
  );

  const historyColumns = useMemo<ColumnsType<RedeemHistoryRecord>>(
    () => [
      {
        title: t('redeem.history.columns.token'),
        dataIndex: 'token',
        key: 'token',
        ellipsis: true,
      },
      {
        title: t('redeem.history.columns.cdk'),
        dataIndex: 'cdk',
        key: 'cdk',
        ellipsis: true,
      },
      {
        title: t('redeem.history.columns.time'),
        dataIndex: 'time',
        key: 'time',
        width: 180,
      },
    ],
    [t],
  );

  const historyModal = (
    <Modal
      open={historyOpen}
      title={t('redeem.history.title')}
      onCancel={() => setHistoryOpen(false)}
      footer={null}
      centered
      width={640}
      rootClassName={modalRootClassName}
    >
      <Table<RedeemHistoryRecord>
        size="small"
        rowKey="key"
        dataSource={redeemHistory}
        columns={historyColumns}
        pagination={redeemHistory.length > 6 ? { pageSize: 6 } : false}
        locale={{ emptyText: t('redeem.history.empty') }}
      />
    </Modal>
  );

  const languageToggleLabel =
    currentLanguage === 'zh'
      ? t('redeem.preferences.language.enLabel')
      : t('redeem.preferences.language.zhLabel');

  const themeToggleLabel =
    themeSelection === 'dark'
      ? t('redeem.preferences.theme.lightLabel')
      : t('redeem.preferences.theme.darkLabel');

  const quickGuide = useMemo(
    () => [
      {
        id: '1',
        text: t('redeem.quickGuide.steps.one'),
      },
      {
        id: '2',
        text: t('redeem.quickGuide.steps.two'),
      },
      {
        id: '3',
        text: t('redeem.quickGuide.steps.three'),
      },
    ],
    [t],
  );

  const quickGuideSection = redeemResult ? null : (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">
          {t('redeem.quickGuide.title')}
        </h3>
        <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          3 STEPS
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {quickGuide.map((item, index) => (
          <div
            key={item.id}
            className="group flex h-full flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500">
                {t('redeem.quickGuide.stepLabel', { index: index + 1 })}
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const footerStatement = t('redeem.footerStatement');

  const formPanel = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <div className="space-y-5">
        <div className="space-y-5">
          {tokenField}
          {cdkField}
        </div>

        <div className="space-y-3">
          {redeemButton}
          <div className="flex justify-center">
            <AntButton
              type="link"
              icon={<History size={16} />}
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-0 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {t('redeem.buttons.viewHistory')}
            </AntButton>
          </div>
          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400">
            {t('redeem.form.securityNote')}
          </div>
        </div>
      </div>
    </div>
  );

  const successPanel = (
    <div className="rounded-2xl border border-emerald-300/60 bg-white p-8 text-center shadow-lg shadow-emerald-200/30 dark:border-emerald-500/50 dark:bg-slate-900 dark:shadow-emerald-900/25">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-300/40">
        <Gift size={38} strokeWidth={2} />
      </div>
      <div className="mt-6 space-y-3">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {t('redeem.result.successTitle')}
        </h2>
      </div>
      <AntButton
        type="primary"
        shape="round"
        size="large"
        className="mt-8 h-11 rounded-xl bg-emerald-500 px-8 text-sm font-semibold text-white shadow-lg shadow-emerald-400/40 transition hover:bg-emerald-600 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
        onClick={handleAgain}
      >
        {t('redeem.result.again')}
      </AntButton>
    </div>
  );

  const mainPanel = redeemResult ? successPanel : formPanel;

  const unifiedPanel = (
    <section className="relative mx-auto w-full max-w-4xl flex flex-col gap-3 p-3 overflow-hidden">
      <header className="flex flex-col gap-4 rounded-2xl border border-sky-400/50 bg-blue-600 p-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-white dark:text-slate-100">
              {t('redeem.pageTitle')}
            </span>
            <span className="text-[11px] text-white/80 dark:text-slate-300">
              {t('redeem.subTitle')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => void handleLanguageToggle()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-sm transition hover:border-white/60 hover:bg-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-600"
            aria-label={languageToggleLabel}
          >
            <Languages size={18} strokeWidth={2} />
            <span className="sr-only">{languageToggleLabel}</span>
          </button>
          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-sm transition hover:border-white/60 hover:bg-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-600"
            aria-label={themeToggleLabel}
          >
            {themeSelection === 'dark' ? (
              <Sun size={18} strokeWidth={2} />
            ) : (
              <Moon size={18} strokeWidth={2} />
            )}
            <span className="sr-only">{themeToggleLabel}</span>
          </button>
        </div>
      </header>

      {quickGuideSection}
      {mainPanel}

      <footer className="flex items-center justify-center flex-col h-22 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-inner dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        {footerStatement}
      </footer>
    </section>
  );

  return (
    <div className="relative flex min-h-screen flex-col justify-center bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 sm:px-5 lg:px-8">
      {unifiedPanel}
      {guideModal}
      {historyModal}
    </div>
  );
};
