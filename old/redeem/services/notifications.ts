import { notification } from 'antd';
import { i18n } from '@/common/i18n/config';

const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

// Convenience methods
export const showSuccessNotification = (message: string, title?: string) => {
  notification.success({
    message: title || i18n.t('redeem.success_title', 'Success'),
    description: message,
    duration: 5,
  });
};

export const showErrorNotification = async (
  message: string,
  title?: string,
  saveToClipboard = true,
) => {
  if (saveToClipboard) {
    const copied = await copyToClipboard(message);
    if (copied) {
      message = `${message}. ${i18n.t('notification.copied_to_clipboard', 'Error has copied to clipboard.')}`;
    }
  }
  notification.error({
    message: title || 'Error',
    description: message,
    duration: 5,
    pauseOnHover: true,
  });
};

export const showWarningNotification = (message: string, title?: string) => {
  notification.warning({
    message: title || 'Warning',
    description: message,
    duration: 5,
    pauseOnHover: true,
  });
};

export const showInfoNotification = (message: string, title?: string) => {
  notification.info({
    message: title || 'Info',
    description: message,
    duration: 5,
    pauseOnHover: true,
  });
};
