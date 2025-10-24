import type { FC } from 'react';

type Language = 'zh' | 'en';
type FeedbackType = 'success' | 'error';

interface TokenGuideProps {
  language: Language;
  onCopyFeedback?: (type: FeedbackType, message: string) => void;
}

const SCRIPT_CODE =
  'javascript:(function(){(() => {var I = document.createElement("iframe");document.body.appendChild(I);prompt("Here is your token. Keep it secret:", I.contentWindow.localStorage.token.replace(/"/g, ""));})();})();';

const translations: Record<
  Language,
  {
    guideTitle: string;
    copyCode: string;
    copySuccess: string;
    copyError: string;
    createTitle: string;
    createDesc: string;
    scriptTitle: string;
    scriptDesc: string;
    loginTitle: string;
    loginDesc: string;
    runTitle: string;
    runDesc: string;
    discordLink: string;
  }
> = {
  zh: {
    guideTitle: '获取 Discord Token 指南',
    copyCode: '复制代码',
    copySuccess: '代码已复制到剪贴板',
    copyError: '复制失败，请手动复制',
    createTitle: '创建书签',
    createDesc: '在浏览器中创建一个新书签，命名为“获取 Discord Token”（名称可自定义）。',
    scriptTitle: '粘贴脚本',
    scriptDesc: '将以下脚本粘贴到书签的 URL 输入框，然后保存。',
    loginTitle: '登录 Discord',
    loginDesc: '打开浏览器访问 Discord 网页端并登录你的账号。',
    runTitle: '执行书签',
    runDesc:
      '登录成功后在 Discord 页面点击书签，浏览器会弹出 Token，复制即可使用。',
    discordLink: 'https://discord.com/channels/@me',
  },
  en: {
    guideTitle: 'Get Discord Token Guide',
    copyCode: 'Copy Code',
    copySuccess: 'Code copied to clipboard',
    copyError: 'Copy failed, please copy manually',
    createTitle: 'Create Bookmark',
    createDesc:
      'Create a new bookmark in your browser and name it “Get Discord Token” (any label works).',
    scriptTitle: 'Paste Script',
    scriptDesc: 'Paste the script below into the bookmark URL field and save it.',
    loginTitle: 'Sign in to Discord',
    loginDesc: 'Open the Discord web client in your browser and sign in.',
    runTitle: 'Run Bookmark',
    runDesc:
      'With Discord open, click the bookmark. A prompt will show your token—copy it and keep it safe.',
    discordLink: 'https://discord.com/channels/@me',
  },
};

export const TokenGuide: FC<TokenGuideProps> = ({ language, onCopyFeedback }) => {
  const t = translations[language];

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(SCRIPT_CODE);
      onCopyFeedback?.('success', t.copySuccess);
    } catch {
      onCopyFeedback?.('error', t.copyError);
    }
  };

  const steps = [
    {
      title: t.createTitle,
      description: t.createDesc,
      body: null,
    },
    {
      title: t.scriptTitle,
      description: t.scriptDesc,
      body: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            📋 {t.copyCode}
          </button>
          <pre className="max-h-48 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] leading-relaxed text-slate-700 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {SCRIPT_CODE}
          </pre>
        </div>
      ),
    },
    {
      title: t.loginTitle,
      description: t.loginDesc,
      body: (
        <a
          className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
          href={t.discordLink}
          target="_blank"
          rel="noreferrer"
        >
          🌐 {t.discordLink}
        </a>
      ),
    },
    {
      title: t.runTitle,
      description: t.runDesc,
      body: null,
    },
  ];

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="group relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/90 px-5 py-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/80"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-70 transition group-hover:opacity-100" />
          <div className="flex items-start gap-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-semibold text-indigo-600 shadow-sm dark:bg-indigo-500/20 dark:text-indigo-200">
              {index + 1}
            </span>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {step.title}
              </h4>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-300">
                {step.description}
              </p>
              {step.body}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
