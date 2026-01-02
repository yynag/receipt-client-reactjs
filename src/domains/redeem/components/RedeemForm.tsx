import { RocketOutlined } from '@ant-design/icons';
import { Button, Spin } from 'antd';
import { useMemo } from 'react';
import { useRedeemFlow, type FieldStatus } from '../hooks/useRedeemFlow';
import type { Language, TranslationContent } from '../translation';
import type { ConfirmPayload, ProductSlug } from '../types';

const statusText: Record<Language, { success: string; error: string }> = {
  zh: { success: '验证成功', error: '验证失败' },
  en: { success: 'Verified', error: 'Validation failed' },
};

interface RedeemFormProps {
  product: ProductSlug;
  language: Language;
  translation: TranslationContent;
  onNotify: (payload: ConfirmPayload) => void;
}

export default function RedeemForm({ product, language, translation, onNotify }: RedeemFormProps) {
  const flow = useRedeemFlow({ product, language, translation, onNotify });
  const statusCopy = useMemo(() => statusText[language], [language]);

  const renderStatus = (status: FieldStatus | null) => {
    if (!status) {
      return null;
    }
    const colorClass = status.type === 'success' ? 'text-emerald-400' : 'text-red-400';
    return (
      <span className={`font-medium ${colorClass}`}>
        {status.type === 'success' ? statusCopy.success : statusCopy.error}
      </span>
    );
  };

  const renderHelperText = (status: FieldStatus | null, loading: boolean) => {
    if (loading) {
      return <Spin size="small" />;
    }
    const statusNode = renderStatus(status);
    if (statusNode) {
      return statusNode;
    }
    return <span>{translation.form.waitingForInput}</span>;
  };

  const tokenInputClass = ['input-field'];
  if (flow.tokenStatus?.type === 'success') {
    tokenInputClass.push('success');
  } else if (flow.tokenStatus?.type === 'error') {
    tokenInputClass.push('error');
  }

  const cdkInputClass = ['input-field'];
  if (flow.cdkStatus?.type === 'success') {
    cdkInputClass.push('success');
  } else if (flow.cdkStatus?.type === 'error') {
    cdkInputClass.push('error');
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <RocketOutlined />
        {translation.redeemTitle}
      </h2>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <div className="step-indicator">
            <div className="step-number">1</div>
            <label className="font-medium">{translation.form.step1}</label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              value={flow.cdkInput}
              onChange={(event) => {
                const value = event.target.value;
                flow.setCdkInput(value);
                if (flow.validatedCdkValue && value.trim().toUpperCase() !== flow.validatedCdkValue) {
                  flow.resetCdkValidation();
                  flow.resetTokenValidation();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  flow.runAntiShaking(() => {
                    void flow.validateCdk();
                  });
                }
              }}
              placeholder={translation.form.cdkPlaceholder}
              className={cdkInputClass.join(' ')}
            />
            <Button
              variant="link"
              color="primary"
              htmlType="button"
              disabled={flow.cdkLoading}
              style={{ paddingLeft: '5px' }}
              onClick={() =>
                flow.runAntiShaking(() => {
                  void flow.validateCdk();
                })
              }
            >
              <span>{translation.buttons.validate}</span>
            </Button>
          </div>
          <div className="mt-2 text-sm text-subtle flex items-center gap-2 min-h-6">
            {renderHelperText(flow.cdkStatus, flow.cdkLoading)}
          </div>
        </div>

        <div>
          <div className="step-indicator">
            <div className="step-number">2</div>
            <label className="font-medium">{translation.form.step2}</label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              value={flow.tokenInput}
              onChange={(event) => {
                const value = event.target.value;
                flow.setTokenInput(value);
                if (flow.validatedTokenValue && value.trim() !== flow.validatedTokenValue) {
                  flow.resetTokenValidation();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  flow.runAntiShaking(() => {
                    void flow.validateToken();
                  });
                }
              }}
              placeholder={translation.form.tokenPlaceholder}
              className={tokenInputClass.join(' ')}
            />
            <Button
              variant="link"
              color="primary"
              htmlType="button"
              disabled={flow.tokenLoading}
              style={{ paddingLeft: '5px' }}
              onClick={() =>
                flow.runAntiShaking(() => {
                  void flow.validateToken();
                })
              }
            >
              <span>{translation.buttons.validate}</span>
            </Button>
          </div>
          <div className="mt-2 text-sm text-subtle flex items-center gap-2 min-h-6">
            {renderHelperText(flow.tokenStatus, flow.tokenLoading)}
          </div>
        </div>

        {/* <div
          className="text-xs opacity-75 border-t pt-4 flex items-start gap-2"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <span className="text-subtle">{translation.form.securityNote}</span>
        </div> */}

        <div className="flex items-center justify-start flex-wrap gap-4 pt-2">
          <Button
            type="primary"
            htmlType="button"
            onClick={() => {
              void flow.redeem();
            }}
            size="large"
            loading={flow.redeeming}
            disabled={flow.redeeming || !flow.verifiedUser || !flow.verifiedCdk}
          >
            <span>{translation.buttons.startRedeem}</span>
          </Button>
          <p className="text-subtle">{flow.taskId}</p>
        </div>
      </form>
    </div>
  );
}
