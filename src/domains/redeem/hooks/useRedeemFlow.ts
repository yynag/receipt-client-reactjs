import { useCallback, useMemo, useState } from 'react';
import { createRedeemTask, pollRedeemTask, verifyCdk, verifyUser } from '../api';
import { getProductDefinition } from '../products';
import type { Language, TranslationContent } from '../translation';
import type { ConfirmPayload, ProductSlug, VerifiedCdk, VerifiedUser } from '../types';

export type FieldStatus = {
  type: 'success' | 'error';
  message: string;
};

interface ValidateOptions {
  silent?: boolean;
}

const statusText: Record<Language, { success: string; error: string }> = {
  zh: { success: '验证成功', error: '验证失败' },
  en: { success: 'Verified', error: 'Validation failed' },
};

function fallbackBuildDetails(user: VerifiedUser, language: Language): string[] {
  const labels = {
    zh: { user: '用户' },
    en: { user: 'User' },
  }[language];
  return [`${labels.user}: ${user.user}`];
}

export function useRedeemFlow(args: {
  product: ProductSlug;
  language: Language;
  translation: TranslationContent;
  onNotify: (payload: ConfirmPayload) => void;
}) {
  const { product, language, translation, onNotify } = args;

  const [tokenInput, setTokenInput] = useState('');
  const [cdkInput, setCdkInput] = useState('');

  const [tokenLoading, setTokenLoading] = useState(false);
  const [cdkLoading, setCdkLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);

  const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
  const [verifiedCdk, setVerifiedCdk] = useState<VerifiedCdk | null>(null);

  const [validatedTokenValue, setValidatedTokenValue] = useState<string | null>(null);
  const [validatedCdkValue, setValidatedCdkValue] = useState<string | null>(null);

  const [tokenStatus, setTokenStatus] = useState<FieldStatus | null>(null);
  const [cdkStatus, setCdkStatus] = useState<FieldStatus | null>(null);

  const statusCopy = useMemo(() => statusText[language], [language]);
  const productDef = useMemo(() => getProductDefinition(product), [product]);

  const [validated, setValidated] = useState(false);
  const [taskId, setTaskId] = useState(''); // xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

  const resetTokenValidation = useCallback(() => {
    setVerifiedUser(null);
    setValidatedTokenValue(null);
    setTokenStatus(null);
  }, []);

  const resetCdkValidation = useCallback(() => {
    setVerifiedCdk(null);
    setValidatedCdkValue(null);
    setCdkStatus(null);
  }, []);

  const validateCdk = useCallback(
    async (options: ValidateOptions = {}) => {
      const rawCdk = cdkInput.trim();
      if (!rawCdk) {
        const message = translation.errors.cdkRequired;
        setCdkStatus({ type: 'error', message });
        onNotify({
          type: 'error',
          title: translation.form.step2,
          message,
          okText: translation.buttons.confirm,
        });
        return false;
      }

      setCdkLoading(true);
      resetTokenValidation();
      setCdkStatus(null);

      try {
        const cdk = await verifyCdk(rawCdk, product);
        if (cdk.used) {
          const message = translation.errors.cdkUsed;
          setCdkStatus({ type: 'error', message });
          onNotify({
            type: 'error',
            title: translation.form.step2,
            message,
            okText: translation.buttons.confirm,
          });
          return false;
        }

        setVerifiedCdk(cdk);
        setValidatedCdkValue(rawCdk.toUpperCase());
        setCdkStatus({ type: 'success', message: statusCopy.success });

        if (!options.silent) {
          const cdkMessage = `App: ${cdk.app_name}\nProduct: ${cdk.app_product_name}`;
          onNotify({
            type: 'success',
            title: translation.form.step2,
            message: cdkMessage,
            okText: translation.buttons.confirm,
          });
        }
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setCdkStatus({ type: 'error', message: statusCopy.error });
        onNotify({
          type: 'error',
          title: translation.form.step1,
          message,
          okText: translation.buttons.confirm,
        });
        return false;
      } finally {
        setCdkLoading(false);
      }
    },
    [
      cdkInput,
      onNotify,
      product,
      resetTokenValidation,
      statusCopy.error,
      statusCopy.success,
      translation.buttons.confirm,
      translation.errors.cdkRequired,
      translation.errors.cdkUsed,
      translation.errors.network,
      translation.form.step1,
      translation.form.step2,
    ],
  );

  const validateToken = useCallback(
    async (options: ValidateOptions = {}) => {
      const rawCdk = cdkInput.trim();
      if (!rawCdk) {
        const message = translation.errors.cdkRequired;
        setTokenStatus({ type: 'error', message });
        onNotify({
          type: 'error',
          title: translation.form.step1,
          message,
          okText: translation.buttons.confirm,
        });
        return false;
      }

      if (!verifiedCdk || validatedCdkValue !== rawCdk) {
        const result = await validateCdk({ silent: true });
        if (!result) {
          return false;
        }
      }

      const rawToken = tokenInput.trim();
      if (!rawToken) {
        const message = translation.errors.tokenInvalid;
        setTokenStatus({ type: 'error', message });
        onNotify({
          type: 'error',
          title: translation.form.step2,
          message,
          okText: translation.buttons.confirm,
        });
        return false;
      }

      setTokenLoading(true);
      setTokenStatus(null);

      try {
        const user = await verifyUser(rawToken, validatedCdkValue!, product);

        if (!user.verified) {
          const message = translation.errors.tokenInvalid;
          setTokenStatus({ type: 'error', message });
          onNotify({
            type: 'error',
            title: translation.form.step1,
            message,
            okText: translation.buttons.confirm,
          });
          return false;
        }

        const validation = productDef.userFormatter?.validate?.(user);
        if (validation && !validation.ok) {
          const message = validation.messageKey
            ? translation.errors[validation.messageKey]
            : (validation.message ?? statusCopy.error);
          setTokenStatus({ type: 'error', message });
          onNotify({ type: 'error', title: translation.form.step1, message, okText: translation.buttons.confirm });
          return false;
        }

        setVerifiedUser(user);
        setValidatedTokenValue(rawToken);
        setTokenStatus({ type: 'success', message: statusCopy.success });

        if (!options.silent) {
          const lines = productDef.userFormatter?.toDetails(user, language) ?? fallbackBuildDetails(user, language);
          const message = lines.length > 0 ? lines.join('\n') : translation.result.noUserDetail;
          onNotify({
            type: 'success',
            title: translation.form.step1,
            message,
            okText: translation.buttons.confirm,
          });
        }

        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : translation.errors.network;
        setTokenStatus({ type: 'error', message: statusCopy.error });
        onNotify({
          type: 'error',
          title: translation.form.step1,
          message,
          okText: translation.buttons.confirm,
        });
        return false;
      } finally {
        setTokenLoading(false);
      }
    },
    [
      cdkInput,
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
      translation.form.step2,
      translation.result.noUserDetail,
      validateCdk,
      validatedCdkValue,
      verifiedCdk,
    ],
  );

  const redeem = useCallback(async () => {
    const rawToken = tokenInput.trim();
    const rawCdk = cdkInput.trim();

    setRedeeming(true);
    try {
      const task = await createRedeemTask(rawCdk, rawToken);
      setTaskId(task);

      const result = await pollRedeemTask(task);
      if (!result.success) {
        throw new Error(result.message ?? 'Unknown error');
      }

      const userLines = verifiedUser
        ? (productDef.userFormatter?.toDetails(verifiedUser, language) ?? fallbackBuildDetails(verifiedUser, language))
        : [];
      const detailBlock = userLines.length > 0 ? userLines.join('\n') : translation.result.noUserDetail;
      const message = [
        translation.result.successMessage,
        '',
        `${translation.result.currentUserTitle}:`,
        detailBlock,
      ].join('\n');

      onNotify({
        type: 'success',
        title: translation.result.successTitle,
        message,
        okText: translation.result.again,
        onOk: () => {
          const trimmedToken = tokenInput.trim();
          const trimmedCdk = cdkInput.trim();
          const isMockRedeem = productDef.isMock || trimmedToken.includes('mock') || trimmedCdk.includes('mock');

          if (!isMockRedeem) {
            setTokenInput('');
            setCdkInput('');
          }

          setVerifiedUser(null);
          setVerifiedCdk(null);
          setValidatedTokenValue(null);
          setValidatedCdkValue(null);
          setTokenStatus(null);
          setCdkStatus(null);
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : translation.errors.network;
      onNotify({
        type: 'error',
        title: translation.result.failureTitle,
        message,
        okText: translation.buttons.confirm,
      });
    } finally {
      setRedeeming(false);
      setTaskId('');
    }
  }, [
    cdkInput,
    language,
    onNotify,
    productDef,
    tokenInput,
    translation.buttons.confirm,
    translation.errors.network,
    translation.result.again,
    translation.result.currentUserTitle,
    translation.result.noUserDetail,
    translation.result.successMessage,
    translation.result.successTitle,
    translation.result.failureTitle,
    verifiedUser,
  ]);

  const runAntiShaking = useCallback(
    (cb: () => void) => {
      if (validated) return;
      setValidated(true);
      cb();
      globalThis.setTimeout(() => setValidated(false), 1000);
    },
    [validated],
  );

  return {
    productDef,

    tokenInput,
    setTokenInput,
    cdkInput,
    setCdkInput,

    tokenLoading,
    cdkLoading,
    redeeming,

    verifiedUser,
    verifiedCdk,
    validatedTokenValue,
    setValidatedTokenValue,
    validatedCdkValue,
    setValidatedCdkValue,

    tokenStatus,
    setTokenStatus,
    cdkStatus,
    setCdkStatus,

    taskId,

    resetTokenValidation,
    resetCdkValidation,
    validateCdk,
    validateToken,
    redeem,
    runAntiShaking,
  };
}
