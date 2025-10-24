import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the notifications module before importing
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

// Mock the i18n module
vi.mock('@/common/i18n/config', () => ({
  i18n: {
    t: vi.fn((key: string, fallback?: string) => fallback || key),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Mock document.execCommand
Object.assign(document, {
  execCommand: vi.fn(() => true),
});

import {
  showMacOSNotification,
  showSuccessNotification,
  showErrorNotification,
} from '../services/notifications';
import { notifications } from '@mantine/notifications';

describe('Notification Service', () => {
  const mockShow = vi.mocked(notifications.show);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show a success notification', async () => {
    await showSuccessNotification('Test success message');

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test success message',
        color: 'green',
        autoClose: 4000,
        position: 'top-right',
        styles: expect.objectContaining({
          root: expect.objectContaining({
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
          }),
        }),
      }),
    );
  });

  it('should show an error notification with clipboard copy', async () => {
    await showErrorNotification('Test error message', 'Error Title', true);

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Error Title',
        message: expect.stringContaining('Test error message'),
        color: 'red',
      }),
    );
  });

  it('should show a macOS-styled notification with custom options', async () => {
    await showMacOSNotification({
      title: 'Custom Title',
      message: 'Custom message',
      type: 'warning',
      duration: 6000,
      copyToClipboard: false,
    });

    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Custom Title',
        message: 'Custom message',
        color: 'yellow',
        autoClose: 6000,
        styles: expect.objectContaining({
          root: expect.objectContaining({
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
          }),
        }),
      }),
    );
  });
});
