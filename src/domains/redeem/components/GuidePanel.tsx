import { BookOutlined, CopyOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { formatMessage, type GuideSection } from '../translation';
import type { ConfirmPayload } from '../types';

const accentBorderClass: Record<string, string> = {
  blue: 'border-blue-500',
  green: 'border-green-500',
  yellow: 'border-yellow-500',
  purple: 'border-purple-500',
  default: 'border-slate-500',
};

interface GuidePanelProps {
  title: string;
  sections: GuideSection[];
  onNotify: (payload: ConfirmPayload) => void;
  okText: string;
}

export default function GuidePanel({ title, sections, onNotify, okText }: GuidePanelProps) {
  const handleCopy = useCallback(
    async (scriptSection: Extract<GuideSection, { type: 'script' }>) => {
      try {
        await navigator.clipboard.writeText(scriptSection.script);
        onNotify({
          type: 'success',
          title,
          message: scriptSection.successMessage,
          okText,
        });
      } catch (error) {
        console.error(error);
        onNotify({
          type: 'error',
          title,
          message: scriptSection.failureMessage,
          description: (
            <pre className="token-display mt-3">
              <code>{scriptSection.script}</code>
            </pre>
          ),
          okText,
        });
      }
    },
    [okText, onNotify, title],
  );

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <BookOutlined />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="space-y-5 text-sm">
        {sections.map((section, index) => {
          const accentClass = accentBorderClass[section.accent ?? 'default'] ?? accentBorderClass.default;

          if (section.type === 'script') {
            const description = section.description
              ? formatMessage(section.description, section.placeholders ?? {})
              : null;

            return (
              <div key={`guide-script-${index}`} className={`border-l-4 ${accentClass} pl-4`}>
                <h3 className="font-medium mb-2">{section.title}</h3>
                {description ? <p className="opacity-80 mb-2">{description}</p> : null}
                <div className="token-display">{section.script}</div>
                <button
                  type="button"
                  className="btn-primary btn-small mt-3"
                  onClick={() => {
                    void handleCopy(section);
                  }}
                >
                  <CopyOutlined />
                  {section.copyButton}
                </button>
              </div>
            );
          }

          if (section.type === 'link') {
            const description = formatMessage(section.description, section.placeholders ?? {});
            const label = section.link.label ?? section.link.url;
            const isDisabled = section.clickable === false;

            return (
              <div key={`guide-link-${index}`} className={`border-l-4 ${accentClass} pl-4`}>
                <h3 className="font-medium mb-2">{section.title}</h3>
                <p className="opacity-80 mb-2">{description}</p>
                <button
                  type="button"
                  className={`btn-blue btn-small${isDisabled ? ' is-disabled' : ''}`}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) {
                      return;
                    }
                    window.open(section.link.url, '_blank', 'noopener,noreferrer');
                  }}
                >
                  {label}
                </button>
              </div>
            );
          }

          const description = formatMessage(section.description, section.placeholders ?? {});

          return (
            <div key={`guide-text-${index}`} className={`border-l-4 ${accentClass} pl-4`}>
              <h3 className="font-medium mb-2">{section.title}</h3>
              <p className="opacity-80">{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
