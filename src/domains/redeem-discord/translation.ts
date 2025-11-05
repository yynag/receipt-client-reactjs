export type Language = "zh" | "en";

export const translations: Record<Language, {
  pageTitle: string;
  subTitle: string;
  guideTitle: string;
  redeemTitle: string;
  preferences: {
    language: {
      zhLabel: string;
      enLabel: string;
    };
    theme: {
      lightLabel: string;
      darkLabel: string;
    };
  };
  form: {
    step1: string;
    step2: string;
    tokenPlaceholder: string;
    cdkPlaceholder: string;
    securityNote: string;
  };
  buttons: {
    startRedeem: string;
    tokenGuide: string;
    viewHistory: string;
    confirm: string;
    close: string;
  };
  messages: {
    tokenValidated: string;
    cdkValidated: string;
    scriptCopied: string;
    scriptCopyFailed: string;
  };
  errors: {
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
    again: string;
  };
  guide: {
    copyCodeButton: string;
    steps: {
      create: {
        title: string;
        description: string;
      };
      script: {
        title: string;
      };
      login: {
        title: string;
        description: string;
      };
      run: {
        title: string;
        description: string;
      };
    };
    bookmark: string;
    script: string;
  };
  history: {
    title: string;
    empty: string;
    columns: {
      token: string;
      cdk: string;
      time: string;
    };
  };
  footerStatement: string;
}> = {
  zh: {
    pageTitle: "兑换 Discord CDK",
    subTitle: "安全极速的账号储值服务",
    guideTitle: "获取 Token 教程",
    redeemTitle: "CDK 兑换",
    preferences: {
      language: {
        zhLabel: "切换为中文",
        enLabel: "切换为英文",
      },
      theme: {
        lightLabel: "切换为浅色模式",
        darkLabel: "切换为深色模式",
      },
    },
    form: {
      step1: "输入 Token",
      step2: "输入 CDK",
      tokenPlaceholder: "粘贴浏览器中获取到的 Token",
      cdkPlaceholder: "输入 CDK 兑换码",
      securityNote: "所有数据仅在您的浏览器中用于验证，不会被存储在服务器端。",
    },
    buttons: {
      startRedeem: "开始充值",
      tokenGuide: "Token 获取教程",
      viewHistory: "查看兑换记录",
      confirm: "知道了",
      close: "关闭",
    },
    messages: {
      tokenValidated: "验证成功：{{name}} => {{email}} => {{phone}}",
      cdkValidated: "CDK 验证通过！App ID：{{appId}}",
      scriptCopied: "脚本已复制到剪贴板，前往浏览器执行。",
      scriptCopyFailed: "复制失败，请手动复制脚本。",
    },
    errors: {
      tokenInvalid: "Token 无效或填写错误，请重试",
      tokenIsPremium: "当前账户已经是高级会员，无法再次兑换",
      tokenRequired: "请先验证 Token",
      tokenAlreadyRedeemed: "该账户已完成兑换，无法重复兑换",
      cdkInvalid: "CDK 无效，请重新输入",
      cdkUsed: "该 CDK 已被使用，无法再次兑换",
      cdkRequired: "请输入 CDK 兑换码",
      cdkAlreadyRedeemed: "该 CDK 已在本地记录中使用，不能重复提交",
      network: "网络异常，请稍后重试",
    },
    result: {
      successTitle: "充值成功",
      again: "继续兑换",
    },
    guide: {
      copyCodeButton: "复制脚本",
      steps: {
        create: {
          title: "创建收藏夹",
          description: "在浏览器中新建一个名为 {{bookmark}}（可自定义）的书签。",
        },
        script: {
          title: "书签脚本",
        },
        login: {
          title: "登录网站",
          description: "访问 http://www.cdk.com/login 并完成登录。",
        },
        run: {
          title: "执行书签",
          description: "登录完成后，点击书签 {{bookmark}}，将在弹窗中复制 Token。",
        },
      },
      bookmark: "AAAA",
      script: "javascript:(function()%7B(() %3D> %7Bvar I %3D document.createElement(\"iframe\")%3Bdocument.body.appendChild(I)%3Bprompt(\"Here is your token. Keep it secret%3A\"%2C I.contentWindow.localStorage.token.replace(%2F\"%2Fg%2C \"\"))%3B%7D)()%7D)();",
    },
    history: {
      title: "兑换记录",
      empty: "暂无兑换记录",
      columns: {
        token: "用户 Token",
        cdk: "CDK",
        time: "兑换时间",
      },
    },
    footerStatement: "© 2025 官方代理储值系统. 保留所有权利. 使用本服务即表示您同意我们的服务条款和隐私政策。",
  },
  en: {
    pageTitle: "Redeem Discord CDK",
    subTitle: "Safe and fast account recharge service",
    guideTitle: "Token guide",
    redeemTitle: "CDK redeem",
    preferences: {
      language: {
        zhLabel: "Switch to Chinese",
        enLabel: "Switch to English",
      },
      theme: {
        lightLabel: "Use light theme",
        darkLabel: "Use dark theme",
      },
    },
    form: {
      step1: "Enter Token",
      step2: "Enter CDK",
      tokenPlaceholder: "Paste the token retrieved from the browser",
      cdkPlaceholder: "Enter the CDK code",
      securityNote: "Data stays within your browser for verification and is never stored on our servers.",
    },
    buttons: {
      startRedeem: "Start recharge",
      tokenGuide: "Token guide",
      viewHistory: "View redeem history",
      confirm: "Got it",
      close: "Close",
    },
    messages: {
      tokenValidated: "Verified: {{name}} => {{email}} => {{phone}}",
      cdkValidated: "CDK verified! App ID: {{appId}}",
      scriptCopied: "Script copied to clipboard. Switch to your browser to run it.",
      scriptCopyFailed: "Copy failed, please copy the script manually.",
    },
    errors: {
      tokenInvalid: "Invalid token, maybe incorrect",
      tokenIsPremium: "Can't redeem, user is already a premium member",
      tokenRequired: "Please validate the token first",
      tokenAlreadyRedeemed: "This account has already redeemed, cannot redeem again",
      cdkInvalid: "Invalid CDK, please try again",
      cdkUsed: "This CDK has already been used",
      cdkRequired: "Please enter the CDK code",
      cdkAlreadyRedeemed: "This CDK exists in local records and cannot be reused",
      network: "Network error, please try again later",
    },
    result: {
      successTitle: "Recharge successful",
      again: "Redeem another",
    },
    guide: {
      copyCodeButton: "Copy code",
      steps: {
        create: {
          title: "Create bookmark",
          description: "Create a browser bookmark named {{bookmark}} (customizable).",
        },
        script: {
          title: "Bookmark script",
        },
        login: {
          title: "Login",
          description: "Log in at http://www.cdk.com/login.",
        },
        run: {
          title: "Run bookmark",
          description: "After login, execute the bookmark {{bookmark}} to copy the token.",
        },
      },
      bookmark: "AAAA",
      script: "javascript:(function()%7B(() %3D> %7Bvar I %3D document.createElement(\"iframe\")%3Bdocument.body.appendChild(I)%3Bprompt(\"Here is your token. Keep it secret%3A\"%2C I.contentWindow.localStorage.token.replace(%2F\"%2Fg%2C \"\"))%3B%7D)()%7D)();",
    },
    history: {
      title: "Redeem history",
      empty: "No redemption records yet.",
      columns: {
        token: "User token",
        cdk: "CDK",
        time: "Redeemed at",
      },
    },
    footerStatement: "© 2025 Official Agent stored-value system. All rights reserved. By using this service, you agree to our terms of service and privacy policy.",
  },
};

export const supportedLanguages: Language[] = ["zh", "en"];

export const fallbackLanguage: Language = "zh";

export type TranslationContent = typeof translations.zh;

export function getTranslation(language: Language): TranslationContent {
  return translations[language] ?? translations[fallbackLanguage];
}

export function formatMessage(template: string, values: Record<string, string | number> = {}): string {
  return Object.keys(values).reduce((acc, key) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    return acc.replace(pattern, String(values[key]));
  }, template);
}
