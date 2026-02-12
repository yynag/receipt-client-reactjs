import type { Language } from '../../translation';
import type { VerifiedUser } from '../../types';
import type { ProductDefinition } from '../types';

export const grokProduct: ProductDefinition = {
  slug: 'grok', // 必须小写，与后端对应到
  displayName: 'Grok',
  isMock: false,
  userFormatter: {
    toDisplay: (user: VerifiedUser) => user.user,
    toDetails: (user: VerifiedUser, language: Language) => {
      const labels = {
        zh: { user: '用户' },
        en: { user: 'User' },
      }[language];
      const messages = [`${labels.user}: ${user.user}`];
      if (user.has_sub) {
        messages.push(
          language == 'zh'
            ? '\n⚠️ 注意：支持给已是会员的用户进行充值，但是到期时间会被覆盖，并不会叠加。'
            : '\n⚠️ Note: Recharging for existing members is supported, but the expiration date will be overwritten and will not be accumulated.',
        );
      }
      return messages;
    },
  },
  translationOverrides: {
    zh: {
      pageTitle: '兑换 Grok CDK',
      guideTitle: '获取 Token 教程',
      form: {
        step1: '输入 CDK',
        step2: '输入 Token',
        tokenPlaceholder: 'eyJ0eXAaOiJKV1QkLCJhbGciOiJIUz...',
        cdkPlaceholder: 'XXXXXXXXXXXXX / XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        securityNote: '所有数据仅在您的浏览器中用于验证，不会被存储在服务器端。',
      },
      guide: [
        {
          type: 'link',
          accent: 'default',
          title: '从 Cookie 中获取 SSO 值',
          description: 'SSO 是兑换服务的必要的参数，请登录网页版 Grok。',
          link: {
            url: `https://grok.com/`,
            label: 'Grok 官网',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'green',
          title: '方案1: 通过我们提供的Token浏览器插件获取',
          description: '我们自己的工具，将为更多App提供便利的途径。',
          link: {
            url: `https://drive.google.com/file/d/1GNj8EvXNPm7Y6kxx1PgRzXdd-vyAsYwV/view?usp=sharing`,
            label: '下载CRX扩展',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'blue',
          title: '方案2: 通过推荐的浏览器插件获取',
          description: '通用已上架的插件更加安全放心。',
          link: {
            url: `https://chromewebstore.google.com/detail/cookie-tool/gfmallmkikahpafdljpnolhgbhgkheja`,
            label: '推荐的 Cookie 扩展',
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'purple',
          title: '输入CDK和Token完成兑换',
          description: '此应用兑换时间较长，请耐心等待。',
        },
      ],
    },
    en: {
      pageTitle: 'Redeem Grok CDK',
      guideTitle: 'Token guide',
      form: {
        step1: 'Enter CDK',
        step2: 'Enter Token',
        tokenPlaceholder: 'eyJ0eXAaOiJKV1QkLCJhbGciOiJIUz.....',
        cdkPlaceholder: 'XXXXXXXXXXXXX / XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        securityNote: 'Data stays within your browser for verification and is never stored on our servers.',
      },
      guide: [
        {
          type: 'link',
          accent: 'default',
          title: 'Get SSO value from cookies',
          description: 'SSO is a required parameter for redemption. Please sign in to Grok on the web.',
          link: {
            url: `https://grok.com/`,
            label: 'Grok official site',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'green',
          title: 'Option 1: Use our Token browser extension',
          description: 'Our own tool will provide a more convenient way for more apps.',
          link: {
            url: `https://47.237.98.89:14494/down/ldwJyQjbHj02.crx`,
            label: 'Download CRX Ext',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'blue',
          title: 'Option 2: Use a recommended browser extension',
          description: 'A general extension from the store is safer and more reliable.',
          link: {
            url: `https://chromewebstore.google.com/detail/cookie-tool/gfmallmkikahpafdljpnolhgbhgkheja`,
            label: 'Recommended Cookie Tool',
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'purple',
          title: 'Enter CDK and Token to redeem',
          description: 'Redemption for this app can take a while—please wait patiently.',
        },
      ],
    },
  },
};
