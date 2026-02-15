import type { Language } from '../../translation';
import type { VerifiedUser } from '../../types';
import type { ProductDefinition } from '../types';

export const claudeProduct: ProductDefinition = {
  slug: 'claude', // 必须小写，与后端对应到
  displayName: 'Claude',
  isMock: true,
  userFormatter: {
    toDisplay: (user: VerifiedUser) => user.user,
    toDetails: (user: VerifiedUser, language: Language) => {
      const labels = {
        zh: { user: '用户' },
        en: { user: 'User' },
      }[language];
      return [`${labels.user}: ${user.user}`];
    },
  },
  translationOverrides: {
    zh: {
      pageTitle: '兑换 Claude CDK',
      guideTitle: '操作指南',
      form: {
        step1: '输入 CDK 卡密',
        step2: '输入账号 Token 信息',
        tokenPlaceholder: 'sk-ant-sid02-gpv-62wxTgeyItdXQFdA1Q.....',
        cdkPlaceholder: 'XXXXXXXXXXXXX / XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
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
          type: 'text',
          accent: 'yellow',
          title: '步骤2：获取账号 Token 信息',
          description: 'Token从Cookie中来',
        },
        {
          type: 'text',
          accent: 'green',
          title: '步骤3：验证成功后，点击充值按钮完成充值',
          description: '充值过程可能漫长，请耐心等待！',
        },
      ],
    },
    en: {
      pageTitle: 'Redeem Claude CDK',
      guideTitle: 'How to redeem',
      form: {
        step1: 'Enter your CDK',
        step2: 'Enter AuthSession details',
        tokenPlaceholder: 'sk-ant-sid02-gpv-62wxTgeyItdXQFdA1Q.....',
        cdkPlaceholder: 'XXXXXXXXXXXXX / XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
        securityNote: 'User info is only used locally for validation and never uploaded.',
      },
      guide: [
        {
          type: 'text',
          accent: 'green',
          title: 'Step 1: Enter your CDK and verify',
          description: 'Make sure the CDK is valid and matches the correct product.',
        },
        {
          type: 'text',
          accent: 'yellow',
          title: 'Step 2: Get your account token details',
          description: 'The token is obtained from your browser cookies.',
        },
        {
          type: 'text',
          accent: 'green',
          title: 'Step 3: After verification, click the recharge button to complete the recharge',
          description: 'The recharge process may take a while. Please be patient!',
        },
      ],
    },
  },
};
