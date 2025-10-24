import { useCallback, useState, type KeyboardEvent } from "react";
import { HistoryOutlined, RocketOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { redeemCdk, verifyCdk, verifyToken } from "../api";
import type { CdkInfo, DiscordUser } from "../api";
import type { ConfirmPayload, HistoryRecord } from "../types";
import type { TranslationContent } from "../translation";

type Status = {
  type: "success" | "error";
  message: string;
};

interface RedeemFormProps {
  translation: TranslationContent;
  onNotify: (payload: ConfirmPayload) => void;
  onAddHistory: (record: HistoryRecord) => void;
  onOpenHistory: () => void;
}

interface ValidateOptions {
  silent?: boolean;
}

export default function RedeemForm({ translation, onNotify, onAddHistory, onOpenHistory }: RedeemFormProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [cdkInput, setCdkInput] = useState("");

  const [tokenLoading, setTokenLoading] = useState(false);
  const [cdkLoading, setCdkLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const [verifiedUser, setVerifiedUser] = useState<DiscordUser | null>(null);
  const [verifiedCdk, setVerifiedCdk] = useState<CdkInfo | null>(null);

  const [validatedTokenValue, setValidatedTokenValue] = useState<string | null>(null);
  const [validatedCdkValue, setValidatedCdkValue] = useState<string | null>(null);

  const [tokenStatus, setTokenStatus] = useState<Status | null>(null);
  const [cdkStatus, setCdkStatus] = useState<Status | null>(null);

  const resetCdkValidation = () => {
    setVerifiedCdk(null);
    setValidatedCdkValue(null);
    setCdkStatus(null);
  };

  const handleTokenValidation = useCallback(
    async (options: ValidateOptions = {}) => {
      const rawToken = tokenInput.trim();
      if (!rawToken) {
        const message = translation.errors.tokenInvalid;
        setTokenStatus({ type: "error", message });
        onNotify({
          type: "error",
          title: translation.form.step1,
          message,
          okText: translation.buttons.confirm
        });
        return false;
      }

      setTokenLoading(true);
      resetCdkValidation();
      setTokenStatus(null);

      try {
        const user = await verifyToken(rawToken);
        if ((user.premium_type ?? 0) > 0) {
          const message = translation.errors.tokenIsPremium;
          setTokenStatus({ type: "error", message });
          onNotify({
            type: "error",
            title: translation.form.step1,
            message,
            okText: translation.buttons.confirm
          });
          return false;
        }

        setVerifiedUser(user);
        setValidatedTokenValue(rawToken);

        setTokenStatus({ type: "success", message: "验证成功" });

        if (!options.silent) {
          const userMessage = [
            `用户名: ${user.global_name || user.username}`,
            `邮箱：${user.email ?? "N/A"}`,
            `手机号码：${user.phone ?? "N/A"}`
          ].join("\n");
          onNotify({
            type: "success",
            title: "Token验证成功",
            message: userMessage,
            okText: translation.buttons.confirm
          });
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setTokenStatus({ type: "error", message });
        onNotify({
          type: "error",
          title: translation.form.step1,
          message,
          okText: translation.buttons.confirm
        });
        return false;
      } finally {
        setTokenLoading(false);
      }
    },
    [tokenInput, translation, onNotify]
  );

  const handleCdkValidation = useCallback(
    async (options: ValidateOptions = {}) => {
      const rawToken = tokenInput.trim();
      if (!rawToken) {
        const message = translation.errors.tokenRequired;
        setCdkStatus({ type: "error", message });
        onNotify({
          type: "error",
          title: translation.form.step2,
          message,
          okText: translation.buttons.confirm
        });
        return false;
      }

      if (!verifiedUser || validatedTokenValue !== rawToken) {
        const result = await handleTokenValidation({ silent: true });
        if (!result) {
          return false;
        }
      }

      const rawCdk = cdkInput.trim();
      if (!rawCdk) {
        const message = translation.errors.cdkRequired;
        setCdkStatus({ type: "error", message });
        onNotify({
          type: "error",
          title: translation.form.step2,
          message,
          okText: translation.buttons.confirm
        });
        return false;
      }

      setCdkLoading(true);
      setCdkStatus(null);

      try {
        const cdk = await verifyCdk(rawCdk);
        if (cdk.used) {
          const message = translation.errors.cdkUsed;
          setCdkStatus({ type: "error", message });
          onNotify({
            type: "error",
            title: translation.form.step2,
            message,
            okText: translation.buttons.confirm
          });
          return false;
        }

        setVerifiedCdk(cdk);
        setValidatedCdkValue(rawCdk);
        setCdkStatus({ type: "success", message: "验证成功" });

        if (!options.silent) {
          const cdkMessage = `AppID: ${cdk.app_id}`;
          onNotify({
            type: "success",
            title: "CDK验证成功",
            message: cdkMessage,
            okText: translation.buttons.confirm
          });
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setCdkStatus({ type: "error", message });
        onNotify({
          type: "error",
          title: translation.form.step2,
          message,
          okText: translation.buttons.confirm
        });
        return false;
      } finally {
        setCdkLoading(false);
      }
    },
    [translation, onNotify, validatedTokenValue, tokenInput, verifiedUser, handleTokenValidation, cdkInput]
  );

  const handleRedeem = useCallback(async () => {
    const rawToken = tokenInput.trim();
    const rawCdk = cdkInput.trim();

    // 直接发起兑换请求，后台会校验CDK和Token
    setRedeeming(true);
    try {
      const result = await redeemCdk({ cdk: rawCdk, user: rawToken });
      if (result !== true) {
        throw new Error(translation.errors.network);
      }

      const record: HistoryRecord = {
        id: `${Date.now()}`,
        userId: verifiedUser?.id || "unknown",
        token: rawToken,
        cdk: rawCdk,
        appId: verifiedCdk?.app_id || "unknown",
        redeemedAt: new Date().toISOString()
      };
      onAddHistory(record);

      onNotify({
        type: "success",
        title: translation.result.successTitle,
        message: "兑换成功！",
        okText: translation.result.again,
        onOk: () => {
          const isMock = tokenInput.trim().includes("mock") || cdkInput.trim().includes("mock");
          if (!isMock) {
            setTokenInput("");
            setCdkInput("");
          }
          setVerifiedUser(null);
          setVerifiedCdk(null);
          setValidatedTokenValue(null);
          setValidatedCdkValue(null);
          setTokenStatus(null);
          setCdkStatus(null);
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : translation.errors.network;
      onNotify({
        type: "error",
        title: "兑换失败",
        message,
        okText: translation.buttons.confirm
      });
    } finally {
      setRedeeming(false);
    }
  }, [tokenInput, cdkInput, verifiedUser, verifiedCdk, translation, onNotify, onAddHistory]);

  const handleTokenKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleTokenValidation();
    }
  };

  const handleCdkKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleCdkValidation();
    }
  };

  const renderStatus = (status: Status | null) => {
    if (!status) {
      return null;
    }
    const colorClass = status.type === "success" ? "text-emerald-400" : "text-red-400";
    const message = status.type === "success" ? "验证成功" : "验证失败";
    return <span className={`font-medium ${colorClass}`}>{message}</span>;
  };

  const tokenInputClass = ["input-field", "mt-2"];
  if (tokenStatus?.type === "success") {
    tokenInputClass.push("success");
  } else if (tokenStatus?.type === "error") {
    tokenInputClass.push("error");
  }

  const cdkInputClass = ["input-field", "mt-2"];
  if (cdkStatus?.type === "success") {
    cdkInputClass.push("success");
  } else if (cdkStatus?.type === "error") {
    cdkInputClass.push("error");
  }

  return (
    <div className="glass-card p-6 h-full">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <RocketOutlined />
        {translation.redeemTitle}
      </h2>

      <form className="space-y-6">
        <div>
          <div className="step-indicator">
            <div className="step-number">1</div>
            <label className="font-medium">{translation.form.step1}</label>
          </div>
          <input
            value={tokenInput}
            onChange={(event) => {
              const value = event.target.value;
              setTokenInput(value);
              if (validatedTokenValue && value.trim() !== validatedTokenValue) {
                setValidatedTokenValue(null);
                setVerifiedUser(null);
                setTokenStatus(null);
                resetCdkValidation();
              }
            }}
            onKeyDown={handleTokenKeyDown}
            placeholder={translation.form.tokenPlaceholder}
            className={tokenInputClass.join(" ")}
          />
          <div className="mt-2 text-sm text-subtle flex items-center gap-2 min-h-6">
            {tokenLoading ? <Spin size="small" /> : renderStatus(tokenStatus)}
          </div>
        </div>

        <div>
          <div className="step-indicator">
            <div className="step-number">2</div>
            <label className="font-medium">{translation.form.step2}</label>
          </div>
          <input
            value={cdkInput}
            onChange={(event) => {
              const value = event.target.value;
              setCdkInput(value);
              if (validatedCdkValue && value.trim().toUpperCase() !== validatedCdkValue) {
                setValidatedCdkValue(null);
                setVerifiedCdk(null);
                setCdkStatus(null);
              }
            }}
            onKeyDown={handleCdkKeyDown}
            placeholder={translation.form.cdkPlaceholder}
            className={cdkInputClass.join(" ")}
          />
          <div className="mt-2 text-sm text-subtle flex items-center gap-2 min-h-6">
            {cdkLoading ? <Spin size="small" /> : renderStatus(cdkStatus)}
          </div>
        </div>

        <div
          className="text-xs opacity-75 border-t pt-4 flex items-start gap-2"
          style={{ borderColor: "var(--border-color)" }}
        >
          <span className="text-subtle">{translation.form.securityNote}</span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <button
            type="button"
            className="btn-primary"
            onClick={handleRedeem}
            disabled={redeeming || !verifiedUser || !verifiedCdk}
          >
            {redeeming ? <Spin size="small" /> : <RocketOutlined />}
            <span>{translation.buttons.startRedeem}</span>
          </button>

          <button type="button" className="btn-outline flex items-center gap-2" onClick={onOpenHistory}>
            <HistoryOutlined />
            <span>{translation.buttons.viewHistory}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
