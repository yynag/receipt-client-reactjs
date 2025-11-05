import { useCallback, useMemo, useState, type KeyboardEvent } from "react";
import { HistoryOutlined, RocketOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { redeem, verifyCdk, verifyUser } from "../api";
import type { ConfirmPayload, HistoryRecord, ProductSlug, VerifiedCdk, VerifiedUser } from "../types";
import type { Language, TranslationContent } from "../translation";
import { getProductDefinition } from "../products";

type Status = {
  type: "success" | "error";
  message: string;
};

interface RedeemFormProps {
  product: ProductSlug;
  language: Language;
  translation: TranslationContent;
  onNotify: (payload: ConfirmPayload) => void;
  onAddHistory: (record: HistoryRecord) => void;
  onOpenHistory: () => void;
}

interface ValidateOptions {
  silent?: boolean;
}

const statusText: Record<Language, { success: string; error: string }> = {
  zh: { success: "验证成功", error: "验证失败" },
  en: { success: "Verified", error: "Validation failed" }
};

function fallbackToDisplay(user: VerifiedUser | null): string {
  if (!user) return "-";
  return user.user;
}

function fallbackBuildDetails(user: VerifiedUser, language: Language): string[] {
  const labels = {
    zh: { user: "用户" },
    en: { user: "User" }
  }[language];
  return [`${labels.user}: ${user.user}`];
}

export default function RedeemForm({
  product,
  language,
  translation,
  onNotify,
  onAddHistory,
  onOpenHistory
}: RedeemFormProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [cdkInput, setCdkInput] = useState("");

  const [tokenLoading, setTokenLoading] = useState(false);
  const [cdkLoading, setCdkLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [verifiedCdk, setVerifiedCdk] = useState<VerifiedCdk | null>(null);

  const [validatedTokenValue, setValidatedTokenValue] = useState<string | null>(null);
  const [validatedCdkValue, setValidatedCdkValue] = useState<string | null>(null);

  const [tokenStatus, setTokenStatus] = useState<Status | null>(null);
  const [cdkStatus, setCdkStatus] = useState<Status | null>(null);

  const statusCopy = useMemo(() => statusText[language], [language]);
  const productDef = useMemo(() => getProductDefinition(product), [product]);

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
        const user = await verifyUser(rawToken, product);

        if (!user.verified) {
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

        // Product-specific validation
        const validation = productDef.userFormatter?.validate?.(user);
        if (validation && !validation.ok) {
          const message = validation.messageKey
            ? translation.errors[validation.messageKey]
            : validation.message ?? statusCopy.error;
          setTokenStatus({ type: "error", message });
          onNotify({ type: "error", title: translation.form.step1, message, okText: translation.buttons.confirm });
          return false;
        }

        setVerifiedUser(user);
        setValidatedTokenValue(rawToken);

        setTokenStatus({ type: "success", message: statusCopy.success });

        if (!options.silent) {
          const lines = productDef.userFormatter?.toDetails(user, language) ?? fallbackBuildDetails(user, language);
          const message = lines.length > 0 ? lines.join("\n") : translation.result.noUserDetail;
          onNotify({
            type: "success",
            title: translation.form.step1,
            message,
            okText: translation.buttons.confirm
          });
        }

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setTokenStatus({ type: "error", message: statusCopy.error });
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
    [
      language,
      onNotify,
      product,
      productDef.userFormatter,
      statusCopy.error,
      statusCopy.success,
      tokenInput,
      translation.buttons.confirm,
      translation.errors,
      translation.form.step1,
      translation.result.noUserDetail
    ]
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
        const cdk = await verifyCdk(rawCdk, product);
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
        setValidatedCdkValue(rawCdk.toUpperCase());
        setCdkStatus({ type: "success", message: statusCopy.success });

        if (!options.silent) {
          const cdkMessage = `App: ${cdk.app_name}`;
          onNotify({
            type: "success",
            title: translation.form.step2,
            message: cdkMessage,
            okText: translation.buttons.confirm
          });
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setCdkStatus({ type: "error", message: statusCopy.error });
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
    [
      cdkInput,
      tokenInput,
      handleTokenValidation,
      onNotify,
      product,
      statusCopy.error,
      statusCopy.success,
      translation,
      validatedTokenValue,
      verifiedUser
    ]
  );

  const handleRedeem = useCallback(async () => {
    const rawToken = tokenInput.trim();
    const rawCdk = cdkInput.trim();

    setRedeeming(true);
    try {
      await redeem(rawCdk, rawToken, verifiedCdk?.app_name ?? "", product);

      const userId = verifiedUser
        ? (() => {
            const extra = verifiedUser.extra ?? {};
            for (const k of ["id", "user_id", "uid"]) {
              const v = extra[k];
              if (typeof v === "string" && v.trim()) return v.trim();
            }
            return verifiedUser.user;
          })()
        : undefined;

      const historyRecord: HistoryRecord = {
        id: `${Date.now()}`,
        userId,
        user: productDef.userFormatter?.toDisplay(verifiedUser!) ?? fallbackToDisplay(verifiedUser),
        cdk: rawCdk,
        appName: verifiedCdk?.app_name ?? "unknown",
        redeemedAt: new Date().toISOString()
      };

      onAddHistory(historyRecord);

      const userLines = verifiedUser
        ? productDef.userFormatter?.toDetails(verifiedUser, language) ?? fallbackBuildDetails(verifiedUser, language)
        : [];
      const detailBlock = userLines.length > 0 ? userLines.join("\n") : translation.result.noUserDetail;
      const message = [
        translation.result.successMessage,
        "",
        `${translation.result.currentUserTitle}:`,
        detailBlock
      ].join("\n");

      onNotify({
        type: "success",
        title: translation.result.successTitle,
        message,
        okText: translation.result.again,
        onOk: () => {
          const trimmedToken = tokenInput.trim();
          const trimmedCdk = cdkInput.trim();
          const isMockRedeem = product === "chatgpt" || trimmedToken.includes("mock") || trimmedCdk.includes("mock");

          if (!isMockRedeem) {
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
        title: translation.result.failureTitle,
        message,
        okText: translation.buttons.confirm
      });
    } finally {
      setRedeeming(false);
    }
  }, [
    cdkInput,
    language,
    onAddHistory,
    onNotify,
    product,
    tokenInput,
    translation.buttons.confirm,
    translation.errors.network,
    translation.result.again,
    translation.result.currentUserTitle,
    translation.result.noUserDetail,
    translation.result.successMessage,
    translation.result.successTitle,
    translation.result.failureTitle,
    verifiedCdk,
    verifiedUser,
    productDef
  ]);

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
    return (
      <span className={`font-medium ${colorClass}`}>
        {status.type === "success" ? statusCopy.success : statusCopy.error}
      </span>
    );
  };

  const renderHelperText = (value: string, status: Status | null, loading: boolean) => {
    if (loading) {
      return <Spin size="small" />;
    }
    const statusNode = renderStatus(status);
    if (statusNode) {
      return statusNode;
    }
    if (!value.trim()) {
      return <span>{translation.form.waitingForInput}</span>;
    }
    return null;
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
            {renderHelperText(tokenInput, tokenStatus, tokenLoading)}
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
            {renderHelperText(cdkInput, cdkStatus, cdkLoading)}
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
            onClick={() => {
              void handleRedeem();
            }}
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
