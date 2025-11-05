import type { ProductDefinition } from "../types";
import type { VerifiedUser } from "../../types";
import type { Language } from "../../translation";

const loginUrl = "https://chatgpt.com/";
const sessionUrl = "https://chatgpt.com/api/auth/session";

export const chatgptProduct: ProductDefinition = {
  slug: "chatgpt",
  displayName: "ChatGPT",
  isMock: true,
  userFormatter: {
    toDisplay: (user: VerifiedUser) => user.user,
    toDetails: (user: VerifiedUser, language: Language) => {
      const labels = {
        zh: { user: "用户" },
        en: { user: "User" }
      }[language];
      return [`${labels.user}: ${user.user}`];
    }
  },
  translationOverrides: {
    zh: {
      pageTitle: "兑换 ChatGPT CDK",
      guideTitle: "获取账号Access Token",
      form: {
        step1: "输入账号密钥（Access Token）",
        step2: "输入 CDK 卡密",
        tokenPlaceholder: "粘贴在 ChatGPT 中获取到的 Access Token",
        cdkPlaceholder: "输入 CDK 卡密",
        securityNote: "Access Token 仅用于本地验证，不会上传到服务器。"
      },
      guide: [
        {
          type: "link",
          accent: "blue",
          title: "步骤1：登录 ChatGPT",
          description: "打开并登录 ChatGPT",
          link: {
            url: loginUrl,
            label: "打开 ChatGPT"
          },
          clickable: true
        },
        {
          type: "link",
          accent: "green",
          title: "步骤2：获取账号密钥（Access Token）",
          description: "打开并复制 accessToken 字段",
          link: {
            url: sessionUrl,
            label: "打开 token 页面"
          },
          clickable: true
        },
        {
          type: "text",
          accent: "purple",
          title: "步骤3：输入 CDK 卡密并完成充值",
          description: "充值过程可能漫长，请耐心等待！"
        }
      ]
    },
    en: {
      pageTitle: "Redeem ChatGPT CDK",
      guideTitle: "Get access token",
      form: {
        step1: "Enter access token",
        step2: "Enter CDK code",
        tokenPlaceholder: "Paste the access token from ChatGPT",
        cdkPlaceholder: "Enter the CDK code",
        securityNote: "Access tokens only stay in your browser for verification."
      },
      guide: [
        {
          type: "link",
          accent: "blue",
          title: "Step 1: Sign in to ChatGPT",
          description: "Open and sign in to ChatGPT",
          link: {
            url: loginUrl,
            label: "Open ChatGPT"
          },
          clickable: true
        },
        {
          type: "link",
          accent: "green",
          title: "Step 2: Get Access Token",
          description: "Open and copy the accessToken field",
          link: {
            url: sessionUrl,
            label: "Open token page"
          },
          clickable: true
        },
        {
          type: "text",
          accent: "purple",
          title: "Step 3: Enter CDK and finish redeem",
          description: "Recharge may take longer than expected, please wait patiently!"
        }
      ]
    }
  }
};
