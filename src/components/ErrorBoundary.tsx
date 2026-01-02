import { Button, Result } from 'antd';
import { useEffect } from 'react';
import { useRouteError } from 'react-router';

interface ErrorWithMessage {
  message?: string;
  toString?: () => string;
}

function isInsertBeforeError(error: unknown) {
  const msg =
    (error as ErrorWithMessage)?.message ||
    (typeof error === 'string' ? error : '') ||
    (error as ErrorWithMessage)?.toString?.() ||
    '';
  return (
    typeof msg === 'string' && (msg.includes('insertBefore') || msg.includes('要插入新节点的节点不是此节点的子节点'))
  );
}

export default function AppErrorBoundary() {
  const error = useRouteError() as ErrorWithMessage;

  useEffect(() => {
    if (isInsertBeforeError(error)) {
      const key = '__app_auto_reload_once__';
      const reloaded = sessionStorage.getItem(key);
      if (!reloaded) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <Result
      status="error"
      title="页面出错了"
      subTitle={
        process.env.NODE_ENV === 'development'
          ? error?.message || String(error)
          : '抱歉，系统出现了一点问题，请尝试刷新页面。'
      }
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          刷新页面
        </Button>
      }
    />
  );
}
