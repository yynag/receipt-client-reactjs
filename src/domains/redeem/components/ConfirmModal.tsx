import { CheckCircleTwoTone, CloseCircleTwoTone, InfoCircleTwoTone } from '@ant-design/icons';
import { Modal } from 'antd';
import type { ReactNode } from 'react';

export type ConfirmStatus = 'success' | 'error' | 'info';

export interface ConfirmModalProps {
  open: boolean;
  type: ConfirmStatus;
  title: string;
  message: string;
  description?: ReactNode;
  okText?: string;
  onClose: () => void;
  onOk?: () => void;
}

const statusIconMap: Record<ConfirmStatus, ReactNode> = {
  success: <CheckCircleTwoTone twoToneColor="#10b981" style={{ fontSize: 48 }} />,
  error: <CloseCircleTwoTone twoToneColor="#ef4444" style={{ fontSize: 48 }} />,
  info: <InfoCircleTwoTone twoToneColor="#3b82f6" style={{ fontSize: 48 }} />,
};

export default function ConfirmModal({
  open,
  type,
  title,
  message,
  description,
  okText,
  onClose,
  onOk,
}: ConfirmModalProps) {
  const actionText = okText ?? 'OK';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      footer={null}
      closable={false}
      rootClassName="redeem-confirm-modal-root"
      wrapClassName="redeem-confirm-modal-wrap"
      className="redeem-confirm-modal"
    >
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div>{statusIconMap[type]}</div>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--redeem-text-primary)' }}>
          {title}
        </h3>
        <p className="text-sm text-subtle whitespace-pre-line">{message}</p>
        {description ? <div className="text-sm text-subtle">{description}</div> : null}
        <button
          type="button"
          onClick={() => {
            onOk?.();
            onClose();
          }}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600 focus:outline-none"
        >
          {actionText}
        </button>
      </div>
    </Modal>
  );
}
