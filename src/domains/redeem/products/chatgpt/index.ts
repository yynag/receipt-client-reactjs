import type { Language } from '../../translation';
import type { VerifiedUser } from '../../types';
import type { ProductDefinition } from '../types';

const loginUrl = 'https://chatgpt.com/';
const sessionUrl = 'https://chatgpt.com/api/auth/session';

export const chatgptProduct: ProductDefinition = {
  slug: 'chatgpt',
  displayName: 'ChatGPT',
  isMock: true,
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
      pageTitle: '兑换 ChatGPT CDK',
      guideTitle: '操作指南',
      form: {
        step1: '输入 CDK 卡密',
        step2: '输入账号 AuthSession 信息',
        tokenPlaceholder: '输入复制的数据',
        cdkPlaceholder: '输入 CDK 卡密',
        securityNote: '用户信息仅用于本地验证，不会上传到服务器。',
      },
      guide: [
        {
          type: 'text',
          accent: 'green',
          title: '步骤1：输入CDK 并 验证',
          description: '确保 CDK 有效且是正确的商品',
        },
        {
          type: 'link',
          accent: 'blue',
          title: '步骤2：登录 ChatGPT',
          description: '打开并登录 ChatGPT',
          link: {
            url: loginUrl,
            label: '打开 ChatGPT',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'yellow',
          title: '步骤3：获取账号 AuthSession 信息',
          description: '打开网页并复制完整的JSON数据，点击校验。',
          link: {
            url: sessionUrl,
            label: '打开 AuthSession 页面',
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'green',
          title: '步骤4：验证成功后，点击充值按钮完成充值',
          description: '充值过程可能漫长，请耐心等待！',
        },
      ],
    },
    en: {
      pageTitle: 'Redeem ChatGPT CDK',
      guideTitle: 'How to redeem',
      form: {
        step1: 'Enter your CDK',
        step2: 'Enter AuthSession details',
        tokenPlaceholder: 'Paste the copied data',
        cdkPlaceholder: 'Enter your CDK code',
        securityNote: 'User info is only used locally for validation and never uploaded.',
      },
      guide: [
        {
          type: 'text',
          accent: 'green',
          title: 'Step 1: Enter and verify your CDK',
          description: 'Make sure the CDK is valid and matches the product.',
        },
        {
          type: 'link',
          accent: 'blue',
          title: 'Step 2: Sign in to ChatGPT',
          description: 'Open ChatGPT and sign in.',
          link: {
            url: loginUrl,
            label: 'Open ChatGPT',
          },
          clickable: true,
        },
        {
          type: 'link',
          accent: 'yellow',
          title: 'Step 3: Get AuthSession data',
          description: 'Open the page, copy the full JSON, then click validate.',
          link: {
            url: sessionUrl,
            label: 'Open AuthSession page',
          },
          clickable: true,
        },
        {
          type: 'text',
          accent: 'green',
          title: 'Step 4: After validation, click Recharge to finish',
          description: 'The recharge can take a while—please wait patiently.',
        },
      ],
    },
  },
};
