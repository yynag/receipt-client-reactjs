import type { DeepPartial } from './types';

export type Language = 'zh' | 'en';

export const supportedLanguages: Language[] = ['zh', 'en'];

export const fallbackLanguage: Language = 'zh';

export type GuideAccent = 'blue' | 'green' | 'yellow' | 'purple' | 'default';

export interface GuideTextSection {
  type: 'text';
  title: string;
  description: string;
  accent?: GuideAccent;
  placeholders?: Record<string, string>;
}

export interface GuideLinkSection {
  type: 'link';
  title: string;
  description: string;
  link: {
    url: string;
    label?: string;
  };
  clickable?: boolean;
  accent?: GuideAccent;
  placeholders?: Record<string, string>;
}

export interface GuideScriptSection {
  type: 'script';
  title: string;
  description?: string;
  script: string;
  copyButton: string;
  successMessage: string;
  failureMessage: string;
  accent?: GuideAccent;
  placeholders?: Record<string, string>;
}

export type GuideSection = GuideTextSection | GuideLinkSection | GuideScriptSection;

export interface TranslationContent {
  common: {
    confirm: string;
    close: string;
    cancel: string;
  };
  pageTitle: string;
  subTitle: string;
  guideTitle: string;
  redeemTitle: string;
  form: {
    step1: string;
    step2: string;
    tokenPlaceholder: string;
    cdkPlaceholder: string;
    securityNote: string;
    waitingForInput: string;
  };
  buttons: {
    startRedeem: string;
    viewHistory: string;
    validate: string;
    confirm: string;
    close: string;
  };
  errors: {
    tokenIsEmpty: string;
    tokenInvalid: string;
    tokenIsPremium: string;
    tokenRequired: string;
    tokenAlreadyRedeemed: string;
    cdkInvalid: string;
    cdkUsed: string;
    cdkRequired: string;
    cdkAlreadyRedeemed: string;
    network: string;
  };
  result: {
    successTitle: string;
    successMessage: string;
    again: string;
    currentUserTitle: string;
    noUserDetail: string;
    failureTitle: string;
  };
  history: {
    title: string;
    empty: string;
    columns: {
      user: string;
      cdk: string;
      time: string;
    };
  };
  footerStatement: string;
  guide: GuideSection[];
}

const baseTranslations: Record<Language, TranslationContent> = {
  zh: {
    common: {
      confirm: '确认',
      close: '关闭',
      cancel: '取消',
    },
    pageTitle: '兑换 CDK',
    subTitle: '安全极速的账号储值服务',
    guideTitle: '获取账号密钥指南',
    redeemTitle: 'CDK 兑换',
    form: {
      step1: '输入账号密钥（Access Token）',
      step2: '输入 CDK 卡密',
      tokenPlaceholder: '粘贴浏览器中获取到的 Access Token',
      cdkPlaceholder: '输入 CDK 卡密',
      securityNote: '所有数据仅在您的浏览器中用于验证，我们不会存储。',
      waitingForInput: '输入完请点击验证按钮。',
    },
    buttons: {
      startRedeem: '开始充值',
      viewHistory: '查看兑换记录',
      validate: '验证',
      confirm: '知道了',
      close: '关闭',
    },
    errors: {
      tokenIsEmpty: '请输入账号密钥',
      tokenInvalid: '账号密钥不满足充值要求',
      tokenIsPremium: '当前账户已经是高级会员，无法再次兑换',
      tokenRequired: '请先验证账号密钥',
      tokenAlreadyRedeemed: '该账户已完成兑换，无法重复兑换',
      cdkInvalid: 'CDK 无效，请重新输入',
      cdkUsed: '该 CDK 已被使用，无法再次兑换',
      cdkRequired: '请输入 CDK 卡密',
      cdkAlreadyRedeemed: '该 CDK 已在本地记录中使用，不能重复提交',
      network: '网络异常，请稍后重试',
    },
    result: {
      successTitle: '充值成功',
      successMessage: '兑换成功！',
      again: '继续兑换',
      currentUserTitle: '当前用户信息',
      noUserDetail: '未获取到用户详情',
      failureTitle: '兑换失败',
    },
    history: {
      title: '兑换记录',
      empty: '暂无兑换记录',
      columns: {
        user: '用户',
        cdk: 'CDK',
        time: '兑换时间',
      },
    },
    footerStatement: '© 2025 官方代理储值系统. 保留所有权利. 使用本服务即表示您同意我们的服务条款和隐私政策。',
    guide: [],
  },
  en: {
    common: {
      confirm: 'Confirm',
      close: 'Close',
      cancel: 'Cancel',
    },
    pageTitle: 'Redeem CDK',
    subTitle: 'Safe and fast account recharge service',
    guideTitle: 'Access token guide',
    redeemTitle: 'CDK redeem',
    form: {
      step1: 'Enter access token',
      step2: 'Enter CDK',
      tokenPlaceholder: 'Paste the access token retrieved from the browser',
      cdkPlaceholder: 'Enter the CDK code',
      securityNote: 'Data stays within your browser for verification and is never stored on our servers.',
      waitingForInput: 'Input and then click check button.',
    },
    buttons: {
      startRedeem: 'Start recharge',
      viewHistory: 'View redeem history',
      validate: 'Check',
      confirm: 'Got it',
      close: 'Close',
    },
    errors: {
      tokenIsEmpty: 'Access token is empty.',
      tokenInvalid: 'Access token does not meet the requirements for recharge',
      tokenIsPremium: "Can't redeem, user is already a premium member",
      tokenRequired: 'Please validate the access token first',
      tokenAlreadyRedeemed: 'This account has already redeemed, cannot redeem again',
      cdkInvalid: 'Invalid CDK, please try again',
      cdkUsed: 'This CDK has already been used',
      cdkRequired: 'Please enter the CDK code',
      cdkAlreadyRedeemed: 'This CDK exists in local records and cannot be reused',
      network: 'Network error, please try again later',
    },
    result: {
      successTitle: 'Recharge successful',
      successMessage: 'Redeem succeeded!',
      again: 'Redeem another',
      currentUserTitle: 'Current user',
      noUserDetail: 'No user detail available',
      failureTitle: 'Redeem failed',
    },
    history: {
      title: 'Redeem history',
      empty: 'No redemption records yet.',
      columns: {
        user: 'User',
        cdk: 'CDK',
        time: 'Redeemed at',
      },
    },
    footerStatement:
      '© 2025 Official Agent stored-value system. All rights reserved. By using this service, you agree to our terms of service and privacy policy.',
    guide: [],
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) {
    return base;
  }

  const result = Array.isArray(base) ? [...(base as unknown[])] : { ...(base as Record<string, unknown>) };

  const target = result as Record<keyof T, unknown>;
  const source = base as Record<keyof T, unknown>;
  const overrideSource = override as Record<keyof T, unknown>;

  (Object.keys(overrideSource) as Array<keyof T>).forEach((key) => {
    const baseValue = source[key];
    const overrideValue = overrideSource[key];

    if (overrideValue === undefined) {
      return;
    }

    if (Array.isArray(baseValue) && Array.isArray(overrideValue)) {
      target[key] = overrideValue;
      return;
    }

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      target[key] = deepMerge(
        JSON.parse(JSON.stringify(baseValue)) as typeof baseValue,
        overrideValue as DeepPartial<typeof baseValue>,
      );
      return;
    }

    target[key] = overrideValue;
  });

  return result as T;
}

export function getTranslation(language: Language, override?: DeepPartial<TranslationContent>): TranslationContent {
  const base = baseTranslations[language] ?? baseTranslations[fallbackLanguage];
  const clonedBase = JSON.parse(JSON.stringify(base)) as TranslationContent;
  return deepMerge(clonedBase, override);
}

export function formatMessage(template: string, values: Record<string, string | number> = {}): string {
  return Object.keys(values).reduce((acc, key) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    return acc.replace(pattern, String(values[key]));
  }, template);
}
