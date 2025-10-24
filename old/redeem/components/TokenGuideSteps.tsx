import { useCallback, useMemo } from 'react';
import { Button, Steps, Typography, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useI18n } from '@/common/hooks/useI18n';

const { Paragraph } = Typography;

export const TokenGuideSteps = () => {
  const { t, currentLanguage } = useI18n();
  const bookmark = t('redeem.guide.bookmark');
  const scriptCode = t('redeem.guide.script');

  const createDescription = t('redeem.guide.steps.create.description', { bookmark });
  const runDescription = t('redeem.guide.steps.run.description', { bookmark });
  const loginDescription = t('redeem.guide.steps.login.description');
  const copyButtonLabel =
    t('redeem.guide.copyCodeButton') || (currentLanguage === 'zh' ? '复制代码' : 'Copy code');
  const copySuccessMessage = t('redeem.guide.copySuccess');
  const copyErrorMessage = t('redeem.guide.copyError');
  const createTitle = t('redeem.guide.steps.create.title');
  const scriptTitle = t('redeem.guide.steps.script.title');
  const loginTitle = t('redeem.guide.steps.login.title');
  const runTitle = t('redeem.guide.steps.run.title');

  const [loginPrefix, loginSuffix] = useMemo(() => {
    const parts = loginDescription.split('http://www.cdk.com/login');
    return [parts[0] ?? '', parts[1] ?? ''];
  }, [loginDescription]);

  const handleCopyScript = useCallback(async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(scriptCode);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      message.success(copySuccessMessage);
    } catch {
      message.error(copyErrorMessage);
    }
  }, [copyErrorMessage, copySuccessMessage, scriptCode]);

  const items = useMemo(
    () =>
      [
        {
          key: 'create',
          title: (
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {createTitle}
            </span>
          ),
          description: (
            <Paragraph className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {createDescription}
            </Paragraph>
          ),
        },
        {
          key: 'script',
          title: (
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
              {scriptTitle}
              <Button
                size="small"
                type="primary"
                icon={<CopyOutlined />}
                className="flex items-center gap-1 border-transparent bg-blue-500 text-white shadow-sm transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
                onClick={() => void handleCopyScript()}
              >
                {copyButtonLabel}
              </Button>
            </span>
          ),
          description: (
            <Paragraph
              code
              className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {scriptCode}
            </Paragraph>
          ),
        },
        {
          key: 'login',
          title: (
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {loginTitle}
            </span>
          ),
          description: (
            <Paragraph className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {loginPrefix}
              <a
                href="https://discord.com/channels/@me"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              >
                https://discord.com/channels/@me
              </a>
              {loginSuffix}
            </Paragraph>
          ),
        },
        {
          key: 'run',
          title: (
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {runTitle}
            </span>
          ),
          description: (
            <Paragraph className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {runDescription}
            </Paragraph>
          ),
        },
      ].map((item, index) => ({
        ...item,
        icon: (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white shadow">
            {index + 1}
          </span>
        ),
      })),
    [
      copyButtonLabel,
      createDescription,
      createTitle,
      handleCopyScript,
      loginPrefix,
      loginTitle,
      loginSuffix,
      runDescription,
      runTitle,
      scriptCode,
      scriptTitle,
    ],
  );

  return (
    <div className="rounded-2xl bg-white p-2 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
      <Steps direction="vertical" current={0} items={items} className="token-guide-steps" />
    </div>
  );
};
