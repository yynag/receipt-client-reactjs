import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { redeemAPI } from '../services/api';
import type { CDKInfo, UserInfo } from '../services/types';
import { showSuccessNotification, showErrorNotification } from '../services/notifications';
import { i18n } from '@/common/i18n/config';

type ValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'premium';

export const useRedeem = () => {
  const form = useForm({
    defaultValues: {
      token: '',
      cdk: '',
    },
  });

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [cdkInfo, setCdkInfo] = useState<CDKInfo | null>(null);
  const [redeemResult, setRedeemResult] = useState<boolean | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<ValidationStatus>('idle');
  const [cdkStatus, setCdkStatus] = useState<ValidationStatus>('idle');

  const lastValidatedToken = useRef<string | null>(null);
  const lastValidatedCDK = useRef<string | null>(null);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'token') {
        setTokenStatus('idle');
        setUserInfo(null);
        lastValidatedToken.current = null;
        setCdkStatus('idle');
        setCdkInfo(null);
        lastValidatedCDK.current = null;
        if (!value.token) {
          form.clearErrors('token');
        }
      }
      if (name === 'cdk') {
        setCdkStatus('idle');
        setCdkInfo(null);
        lastValidatedCDK.current = null;
        if (!value.cdk) {
          form.clearErrors('cdk');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const validateToken = useCallback(async (): Promise<boolean> => {
    const rawToken = form.getValues('token');
    const token = rawToken?.trim() ?? '';

    if (!token) {
      const message = i18n.t('redeem.errors.tokenRequired');
      form.setError('token', { type: 'manual', message });
      setTokenStatus('invalid');
      setUserInfo(null);
      lastValidatedToken.current = null;
      return false;
    }

    if (token === lastValidatedToken.current && tokenStatus === 'valid') {
      return true;
    }

    setTokenStatus('loading');
    form.clearErrors('token');

    try {
      const info = await redeemAPI.validateToken(token);
      setUserInfo(info);
      setTokenStatus(info.premium_type > 0 ? 'premium' : 'valid');
      lastValidatedToken.current = token;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token validation failed';
      form.setError('token', { type: 'manual', message });
      setTokenStatus('invalid');
      setUserInfo(null);
      lastValidatedToken.current = null;
      return false;
    }
  }, [form, tokenStatus]);

  const validateCDK = useCallback(async (): Promise<boolean> => {
    const rawCdk = form.getValues('cdk');
    const cdk = rawCdk?.trim() ?? '';

    if (!cdk) {
      const message = i18n.t('redeem.errors.cdkRequired');
      form.setError('cdk', { type: 'manual', message });
      setCdkStatus('invalid');
      setCdkInfo(null);
      lastValidatedCDK.current = null;
      return false;
    }

    if (tokenStatus !== 'valid') {
      return false;
    }

    if (cdk === lastValidatedCDK.current && cdkStatus === 'valid') {
      return true;
    }

    setCdkStatus('loading');
    form.clearErrors('cdk');

    try {
      const info = await redeemAPI.validateCDK(cdk);
      setCdkInfo(info);
      setCdkStatus(info.used ? 'invalid' : 'valid');
      lastValidatedCDK.current = cdk;
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CDK validation failed';
      form.setError('cdk', { type: 'manual', message });
      setCdkStatus('invalid');
      setCdkInfo(null);
      lastValidatedCDK.current = null;
      return false;
    }
  }, [form, cdkStatus, tokenStatus]);

  const handleRedeem = useCallback(async () => {
    const tokenValid = await validateToken();
    if (!tokenValid) {
      return;
    }

    const cdkValid = await validateCDK();
    if (!cdkValid) {
      return;
    }

    const values = form.getValues();

    try {
      setRedeeming(true);
      const result = await redeemAPI.redeemCDK(values.token.trim(), values.cdk.trim());
      setRedeemResult(result);
      showSuccessNotification(
        i18n.t('redeem.success', '兑换成功'),
        i18n.t('redeem.success_title', '操作成功'),
      );
      form.reset({ token: '', cdk: '' });
      setUserInfo(null);
      setCdkInfo(null);
      setTokenStatus('idle');
      setCdkStatus('idle');
      lastValidatedToken.current = null;
      lastValidatedCDK.current = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Redeem failed';
      await showErrorNotification(message, i18n.t('redeem.error_title', '兑换失败'), true);
    } finally {
      setRedeeming(false);
    }
  }, [form, validateToken, validateCDK]);

  const resetRedeemFlow = () => {
    setUserInfo(null);
    setCdkInfo(null);
    setRedeemResult(null);
    setTokenStatus('idle');
    setCdkStatus('idle');
    lastValidatedToken.current = null;
    lastValidatedCDK.current = null;
    form.reset({ token: '', cdk: '' });
  };

  return {
    form,
    userInfo,
    cdkInfo,
    redeemResult,
    redeeming,
    tokenStatus,
    cdkStatus,
    validateToken,
    validateCDK,
    handleRedeem,
    resetRedeemFlow,
  };
};
