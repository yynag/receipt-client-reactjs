import type { Resource } from 'i18next';

export const i18nResources: Resource = {
  en: {
    common: {
      app: {
        title: 'Receipt Sniffing Console',
        description: 'Modern multi-module CDK management experience',
      },
      nav: {
        home: 'Home',
        redeem: 'Discord Redeem Center',
        admin: 'Admin Console',
        utils: 'Developer Tools',
      },
      actions: {
        enter: 'Enter',
      },
      auth: {
        signIn: 'Sign In',
        signOut: 'Sign Out',
      },
      locale: {
        en: 'English',
        zh: '中文',
      },
      redeem: {
        pageTitle: 'Redeem Discord CDK',
        subTitle: 'Safe and fast account recharge service',
        preferences: {
          language: {
            zhLabel: 'Switch to Chinese',
            enLabel: 'Switch to English',
          },
          theme: {
            lightLabel: 'Use light theme',
            darkLabel: 'Use dark theme',
          },
        },
        form: {
          tokenLabel: 'User Token',
          tokenPlaceholder: 'Paste the token retrieved from the browser',
          cdkLabel: 'CDK code',
          cdkPlaceholder: 'Enter the CDK code',
          securityNote:
            'Data stays within your browser for verification and is never stored on our servers.',
        },
        buttons: {
          startRedeem: 'Start recharge',
          tokenGuide: 'Token guide',
          viewHistory: 'View redeem history',
        },
        messages: {
          tokenValidated: 'Verified: {{name}} => {{email}} => {{phone}}',
          cdkValidated: 'CDK verified!',
        },
        errors: {
          tokenInvalid: 'Invalid token, maybe incorrect',
          tokenIsPremium: "Can't redeem, User is already a premium member",
          tokenRequired: 'Please validate the token first',
          cdkInvalid: 'Invalid CDK, please try again',
          cdkRequired: 'Please enter the CDK code',
        },
        result: {
          successTitle: 'Recharge successful',
          again: 'Redeem another',
        },
        guide: {
          copyCodeButton: 'Copy code',
          steps: {
            create: {
              title: 'Create bookmark',
              description: 'Create a browser bookmark named {{bookmark}} (customizable).',
            },
            script: {
              title: 'Bookmark script',
            },
            login: {
              title: 'Login',
              description: 'Log in at http://www.cdk.com/login.',
            },
            run: {
              title: 'Run bookmark',
              description: 'After login, execute the bookmark {{bookmark}} to copy the token.',
            },
          },
          bookmark: 'AAAA',
          script: `javascript:(function()%7B(() %3D> %7Bvar I %3D document.createElement("iframe")%3Bdocument.body.appendChild(I)%3Bprompt("Here is your token. Keep it secret%3A"%2C I.contentWindow.localStorage.token.replace(%2F"%2Fg%2C ""))%3B%7D)()%7D)();`,
        },
        quickGuide: {
          title: 'CDK redemption tips',
          steps: {
            one: 'Use "Token guide" to retrieve your user token, then paste it above.',
            two: 'Enter the CDK exactly as shown so the system can validate it automatically.',
            three: 'Confirm the exchange and wait briefly for the recharge to finish.',
          },
          stepLabel: 'STEP {{index}}',
        },
        history: {
          title: 'Redeem history',
          empty: 'No redemption records yet.',
          columns: {
            token: 'User token',
            cdk: 'CDK',
            time: 'Redeemed at',
          },
        },
        footerStatement:
          '© 2025 Official Agent stored-value system. All rights reserved. By using this service, you agree to our terms of service and privacy policy.',
      },
      admin: {
        nav: {
          dashboard: 'Overview',
          cdk: 'CDK Management',
          stock: 'Stock Management',
        },
      },
    },
  },
  zh: {
    common: {
      app: {
        title: '核销中心控制台',
        description: '现代化的多模块CDK管理体验',
      },
      nav: {
        home: '首页',
        redeem: 'Discord兑换页面',
        admin: '管理后台',
        utils: '工具面板',
      },
      actions: {
        enter: '进入',
      },
      auth: {
        signIn: '登录',
        signOut: '退出登录',
      },
      locale: {
        en: 'English',
        zh: '中文',
      },
      redeem: {
        pageTitle: '兑换 Discord CDK',
        subTitle: '安全、快捷的账号充值服务',
        preferences: {
          language: {
            zhLabel: '切换为中文界面',
            enLabel: '切换为英文界面',
          },
          theme: {
            lightLabel: '切换为明亮模式',
            darkLabel: '切换为深色模式',
          },
        },
        form: {
          tokenLabel: '用户Token',
          tokenPlaceholder: '请输入浏览器中获取到的Token',
          cdkLabel: '兑换码',
          cdkPlaceholder: '请输入兑换码',
          securityNote: '所有数据仅在本地浏览器中用于校验，不会被存储或上传。',
        },
        buttons: {
          startRedeem: '开始充值',
          tokenGuide: '获取Token教程',
          viewHistory: '查看兑换记录',
        },
        messages: {
          tokenValidated: '已验证用户：{{name}} => {{email}} => {{phone}}',
          cdkValidated: '兑换码已验证',
        },
        errors: {
          tokenInvalid: 'Token无效，可能不正确',
          tokenIsPremium: '不能兑换，用户为高级用户',
          tokenRequired: '请先验证Token',
          cdkInvalid: '兑换码无效，请重试',
          cdkRequired: '请输入兑换码',
        },
        result: {
          successTitle: '充值成功',
          again: '继续充值',
        },
        guide: {
          copyCodeButton: '复制代码',
          steps: {
            create: {
              title: '创建书签',
              description: '打开浏览器书签管理，创建名称为 {{bookmark}}（可自定义）的书签。',
            },
            script: {
              title: '填写脚本',
            },
            login: {
              title: '登录网站',
              description: '在浏览器打开并登录 http://www.cdk.com/login',
            },
            run: {
              title: '执行脚本',
              description:
                '登录成功后，在地址栏输入书签名称 {{bookmark}} 并回车，即可弹出Token提示框。',
            },
          },
          bookmark: 'AAAA',
          script: `javascript:(function()%7B(() %3D> %7Bvar I %3D document.createElement("iframe")%3Bdocument.body.appendChild(I)%3Bprompt("Here is your token. Keep it secret%3A"%2C I.contentWindow.localStorage.token.replace(%2F"%2Fg%2C ""))%3B%7D)()%7D)();`,
        },
        quickGuide: {
          title: '兑换指南',
          steps: {
            one: '根据“获取Token教程”获取用户Token，并填写到上方输入框。',
            two: '输入兑换CDK，系统会自动完成校验并提示状态。',
            three: '点击开始兑换按钮，耐心等待充值到账提示。',
          },
          stepLabel: '步骤 {{index}}',
        },
        history: {
          title: '兑换记录',
          empty: '暂无兑换记录',
          columns: {
            token: '用户Token',
            cdk: 'CDK',
            time: '兑换时间',
          },
        },
        footerStatement:
          '© 2025 官方代理储值系统. 保留所有权利.使用本服务即表示您同意我们的服务条款和隐私政策',
      },
      admin: {
        nav: {
          dashboard: '运营概览',
          cdk: 'CDK管理',
          stock: '库存管理',
        },
      },
    },
  },
};
