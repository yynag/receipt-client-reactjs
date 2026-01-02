import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { queryRedeemTaskOnce } from '../api';
import type { Language } from '../translation';
import type { ConfirmPayload } from '../types';

type Status = {
  type: 'success' | 'error' | 'info';
  label: string;
};

const i18n: Record<Language, { title: string; placeholder: string; button: string; waiting: string }> = {
  zh: {
    title: '查询任务',
    placeholder: '请输入任务ID',
    button: '查询',
    waiting: '等待输入',
  },
  en: {
    title: 'Query Task',
    placeholder: 'Enter task ID',
    button: 'Query',
    waiting: 'Waiting for input',
  },
};

export interface QueryTaskPanelProps {
  language: Language;
  onNotify: (payload: ConfirmPayload) => void;
  okText: string;
}

export default function QueryTaskPanel({ language, onNotify, okText }: QueryTaskPanelProps) {
  const t = useMemo(() => i18n[language], [language]);
  const [taskIdInput, setTaskIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  const handleQuery = useCallback(async () => {
    const taskId = taskIdInput.trim();
    if (!taskId) {
      const message = language === 'zh' ? '请输入任务ID' : 'Please enter a task ID';
      setStatus({ type: 'error', label: message });
      onNotify({ type: 'error', title: t.title, message, okText });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const result = await queryRedeemTaskOnce(taskId);
      if (result.pending) {
        const message =
          language === 'zh'
            ? `任务仍在处理中\nTask ID: ${result.task_id}\nCDK: ${result.cdk}`
            : `Task is still pending\nTask ID: ${result.task_id}\nCDK: ${result.cdk}`;
        setStatus({ type: 'info', label: language === 'zh' ? '任务处理中' : 'Pending' });
        onNotify({ type: 'info', title: t.title, message, okText });
        return;
      }

      if (!result.success) {
        const message = result.message ?? (language === 'zh' ? '任务执行失败' : 'Task failed');
        setStatus({ type: 'error', label: language === 'zh' ? '查询失败' : 'Failed' });
        onNotify({ type: 'error', title: t.title, message, okText });
        return;
      }

      const message =
        language === 'zh'
          ? `任务执行成功\nTask ID: ${result.task_id}\nCDK: ${result.cdk}`
          : `Task succeeded\nTask ID: ${result.task_id}\nCDK: ${result.cdk}`;
      setStatus({ type: 'success', label: language === 'zh' ? '查询成功' : 'Success' });
      onNotify({ type: 'success', title: t.title, message, okText });
    } catch (error) {
      const message = error instanceof Error ? error.message : language === 'zh' ? '网络错误' : 'Network error';
      setStatus({ type: 'error', label: language === 'zh' ? '网络错误' : 'Network error' });
      onNotify({ type: 'error', title: t.title, message, okText });
    } finally {
      setLoading(false);
    }
  }, [t.title, language, okText, onNotify, taskIdInput]);

  const inputClass = ['input-field'];
  if (status?.type === 'success') {
    inputClass.push('success');
  } else if (status?.type === 'error') {
    inputClass.push('error');
  }

  return (
    <div className="glass-card p-6 mt-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <SearchOutlined />
        {t.title}
      </h2>

      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="flex items-center gap-2">
          <input
            value={taskIdInput}
            onChange={(event) => {
              setTaskIdInput(event.target.value);
              setStatus(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleQuery();
              }
            }}
            placeholder={t.placeholder}
            className={inputClass.join(' ')}
          />
          <Button
            variant="link"
            color="primary"
            htmlType="button"
            disabled={loading}
            style={{ paddingLeft: '5px' }}
            onClick={() => {
              void handleQuery();
            }}
          >
            <span>{t.button}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
