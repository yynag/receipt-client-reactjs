import { useMemo, useState } from 'react';
import type { CdkResult } from '../types';
import type { QueryTranslations } from '../translation';

interface Props {
  translation: QueryTranslations;
  results: CdkResult[];
}

function copy(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

export default function ResultsPanel({ translation, results }: Props) {
  const [tab, setTab] = useState<'all' | 'used' | 'unused'>('all');

  const used = useMemo(() => results.filter((r) => r.status === 'used'), [results]);
  const unused = useMemo(() => results.filter((r) => r.status === 'unused'), [results]);
  const list = tab === 'all' ? results : tab === 'used' ? used : unused;

  const handleCopyAll = async () => {
    const text = results.map((r) => r.code).join('\n');
    if (text) await copy(text);
  };

  const handleCopyUsed = async () => {
    const text = used.map((r) => r.code).join('\n');
    if (text) await copy(text);
  };

  const handleCopyUnused = async () => {
    const text = unused.map((r) => r.code).join('\n');
    if (text) await copy(text);
  };

  return (
    <div className="glass-card p-4 mt-4">
      <div className="mb-3">
        <div className="text-sm font-semibold mb-2">Copy</div>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-outline" onClick={handleCopyAll}>
            {translation.buttons.copyAll}
          </button>
          <button className="btn-outline" onClick={handleCopyUsed}>
            {translation.buttons.copyUsed}
          </button>
          <button className="btn-outline" onClick={handleCopyUnused}>
            {translation.buttons.copyUnused}
          </button>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-3 flex gap-2">
        <button
          className={`px-3 py-2 text-sm ${
            tab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
          onClick={() => setTab('all')}
        >
          {translation.tabs.all}
        </button>
        <button
          className={`px-3 py-2 text-sm ${
            tab === 'used' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
          onClick={() => setTab('used')}
        >
          {translation.tabs.used}
        </button>
        <button
          className={`px-3 py-2 text-sm ${
            tab === 'unused' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
          onClick={() => setTab('unused')}
        >
          {translation.tabs.unused}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <div className="text-lg font-semibold mb-1">{translation.empty.title}</div>
          <div className="text-sm opacity-80">{translation.empty.desc}</div>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden max-h-64 overflow-y-auto">
          {list.map((r) => (
            <div
              key={r.code}
              className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-800 gap-3"
            >
              <div className="font-mono text-sm font-semibold break-all mr-1 min-w-0">{r.code}</div>
              <div
                className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1 text-center"
                title={[r.app_name, r.user, r.redeem_time].filter(Boolean).join(' | ')}
              >
                {[
                  r.app_name && `${r.app_name}`,
                  r.status === 'used' && r.user && r.user,
                  r.status === 'used' && r.redeem_time && `${r.redeem_time}`,
                ]
                  .filter(Boolean)
                  .join(' | ') || ''}
              </div>
              <div className="flex items-center gap-2 ml-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'used'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : r.status === 'unused'
                        ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                  }`}
                >
                  {translation.status[r.status]}
                </span>
                <button className="btn-outline px-2 py-1" onClick={() => copy(r.code)}>
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
