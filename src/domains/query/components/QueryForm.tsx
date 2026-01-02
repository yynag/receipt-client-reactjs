import { useCallback, useMemo, useState } from 'react';
import { checkCdks } from '../api';
import type { CdkResult } from '../types';
import type { QueryTranslations } from '../translation';

interface Props {
  translation: QueryTranslations;
  onResults: (results: CdkResult[]) => void;
  onProgress?: (progress: number) => void; // 0..1
}

export default function QueryForm({ translation, onResults, onProgress }: Props) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const lines = useMemo(
    () =>
      value
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [value],
  );

  const emitProgress = useCallback(
    (v: number) => {
      setProgress(v);
      onProgress?.(v);
    },
    [onProgress],
  );

  const handleClear = useCallback(() => {
    setValue('');
    setProgress(0);
    onResults([]);
  }, [onResults]);

  const handleQuery = useCallback(async () => {
    if (!lines.length || loading) return;
    setLoading(true);
    emitProgress(0);
    try {
      const batch = await checkCdks(lines);
      onResults(batch);
    } catch {
      const results: CdkResult[] = lines.map((code) => ({ code, status: 'invalid', user: '', app_name: '' }));
      onResults(results);
    } finally {
      emitProgress(1);
      setLoading(false);
    }
  }, [lines, loading, emitProgress, onResults]);

  return (
    <div className="glass-card p-4">
      <div className="text-sm font-semibold text-blue-600 mb-2">{translation.inputs.label}</div>
      <textarea
        className="input-field min-h-28 resize-y"
        placeholder={translation.inputs.placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="text-xs text-gray-500 mt-2">
        {lines.length === 0 ? translation.inputs.hintEmpty : `${lines.length} lines`}
      </div>

      <div className="flex gap-3 mt-3">
        <button className="btn-primary flex-1" onClick={handleQuery} disabled={loading || lines.length === 0}>
          {loading ? translation.progress.querying : translation.buttons.query}
        </button>
        <button className="btn-outline flex-1" onClick={handleClear} disabled={loading}>
          {translation.buttons.clear}
        </button>
      </div>

      {loading || progress > 0 ? (
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded mt-4 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
