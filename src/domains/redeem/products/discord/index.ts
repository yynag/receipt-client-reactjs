import type { Language } from '../../translation';
import type { VerifiedUser } from '../../types';
import type { ProductDefinition } from '../types';

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function pick(extra: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = readString(extra[key]);
    if (v) return v;
  }
  return null;
}

function toDisplay(user: VerifiedUser): string {
  const extra = user.extra ?? {};
  return pick(extra, ['global_name', 'name', 'username']) ?? user.user;
}

function toDetails(user: VerifiedUser, language: Language): string[] {
  const labels = {
    zh: { user: '用户' },
    en: { user: 'User' },
  }[language];

  const keyTranslations: Record<string, string> =
    language === 'zh'
      ? {
          global_name: '用户名',
          name: '名称',
          username: '用户名',
          email: '邮箱',
          phone: '手机号码',
          locale: '语言',
          id: '用户 ID',
          user_id: '用户 ID',
          uid: '用户 ID',
          premium_type: '会员等级',
        }
      : {
          global_name: 'Username',
          name: 'Name',
          username: 'Username',
          email: 'Email',
          phone: 'Phone',
          locale: 'Locale',
          id: 'User ID',
          user_id: 'User ID',
          uid: 'User ID',
          premium_type: 'Premium type',
        };

  const extra = user.extra ?? {};
  const lines: string[] = [];

  // Always show the base user field
  const display = toDisplay(user);
  lines.push(`${labels.user}: ${display}`);

  // Render all extra fields generically with translated keys (value unchanged)
  for (const [rawKey, value] of Object.entries(extra)) {
    // Skip undefined or null
    if (value === undefined || value === null) continue;
    const label = keyTranslations[rawKey] ?? rawKey;
    lines.push(`${label}: ${String(value)}`);
  }

  return lines;
}

function validate(user: VerifiedUser): { ok: true } | { ok: false; messageKey?: 'tokenIsPremium' } {
  const raw = user.extra?.['premium_type'];
  const premiumType = typeof raw === 'number' ? raw : 0;
  if (premiumType > 0) {
    return { ok: false, messageKey: 'tokenIsPremium' };
  }
  return { ok: true };
}

const bookmarkName = 'AAAA';
const loginUrl = 'https://discord.com/';
const bookmarkScript =
  'javascript:(function(){(() => {var I = document.createElement("iframe");document.body.appendChild(I);prompt("Here is your token. Keep it secret:", I.contentWindow.localStorage.token.replace(/"/g, ""));})();})();';

export const discordProduct: ProductDefinition = {
  slug: 'discord',
  displayName: 'Discord',
  isMock: false,
  userFormatter: {
    toDisplay,
    toDetails,
    validate,
  },
  translationOverrides: {
    zh: {
      pageTitle: '兑换 Discord CDK',
      guideTitle: '获取 Token 教程',
      form: {
        step1: '输入 CDK',
        step2: '输入 Token',
        tokenPlaceholder: '粘贴浏览器中获取到的 Token',
        cdkPlaceholder: '输入 CDK 兑换码',
        securityNote: '所有数据仅在您的浏览器中用于验证，不会被存储在服务器端。',
      },
      guide: [
        {
          type: 'text',
          accent: 'blue',
          title: '创建收藏夹',
          description: '在浏览器中新建一个名为 {{bookmark}}（可自定义）的书签。',
          placeholders: { bookmark: bookmarkName },
        },
        {
          type: 'script',
          accent: 'green',
          title: '书签脚本',
          script: bookmarkScript,
          copyButton: '复制脚本',
          successMessage: '脚本已复制到剪贴板，前往浏览器执行。',
          failureMessage: '复制失败，请手动复制脚本。',
        },
        {
          type: 'link',
          accent: 'yellow',
          title: '登录网站',
          description: '访问 {{url}} 并完成登录。',
          placeholders: { url: loginUrl },
          link: {
            url: loginUrl,
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'purple',
          title: '执行书签',
          description: '登录完成后，点击书签 {{bookmark}}，将在弹窗中复制 Token。',
          placeholders: { bookmark: bookmarkName },
        },
      ],
    },
    en: {
      pageTitle: 'Redeem Discord CDK',
      guideTitle: 'Token guide',
      form: {
        step1: 'Enter CDK',
        step2: 'Enter Token',
        tokenPlaceholder: 'Paste the token retrieved from the browser',
        cdkPlaceholder: 'Enter the CDK code',
        securityNote: 'Data stays within your browser for verification and is never stored on our servers.',
      },
      guide: [
        {
          type: 'text',
          accent: 'blue',
          title: 'Create bookmark',
          description: 'Create a browser bookmark named {{bookmark}} (customizable).',
          placeholders: { bookmark: bookmarkName },
        },
        {
          type: 'script',
          accent: 'green',
          title: 'Bookmark script',
          script: bookmarkScript,
          copyButton: 'Copy code',
          successMessage: 'Script copied to clipboard. Switch to your browser to run it.',
          failureMessage: 'Copy failed, please copy the script manually.',
        },
        {
          type: 'link',
          accent: 'yellow',
          title: 'Login',
          description: 'Visit {{url}} and complete the login.',
          placeholders: { url: loginUrl },
          link: {
            url: loginUrl,
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'purple',
          title: 'Run bookmark',
          description: 'After login, execute the bookmark {{bookmark}} to copy the token.',
          placeholders: { bookmark: bookmarkName },
        },
      ],
    },
  },
};
