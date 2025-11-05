import { useMemo } from "react";
import { BookOutlined, CopyOutlined } from "@ant-design/icons";
import type { ConfirmPayload } from "../types";
import type { TranslationContent } from "../translation";
import { formatMessage } from "../translation";

interface TokenGuideProps {
  title: string;
  guide: TranslationContent["guide"];
  messages: TranslationContent["messages"];
  onNotify: (payload: ConfirmPayload) => void;
  okText: string;
}

export function TokenGuide({ title, guide, messages, onNotify, okText }: TokenGuideProps) {
  const decodedScript = useMemo(() => decodeURIComponent(guide.script), [guide.script]);
  const loginUrl = "http://www.cdk.com/login";
  const loginDescriptionParts = guide.steps.login.description.split(loginUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(decodedScript);
      onNotify({
        type: "success",
        title,
        message: messages.scriptCopied,
        okText,
      });
    } catch (error) {
      console.error(error);
      onNotify({
        type: "error",
        title,
        message: messages.scriptCopyFailed,
        description: (
          <pre className="token-display mt-3">
            <code>{decodedScript}</code>
          </pre>
        ),
        okText,
      });
    }
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center gap-2 mb-4">
        <BookOutlined />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <div className="space-y-5 text-sm">
        <div className="border-l-4 border-blue-500 pl-4">
          <h3 className="font-medium mb-2">{guide.steps.create.title}</h3>
          <p className="opacity-80">
            {formatMessage(guide.steps.create.description, { bookmark: guide.bookmark })}
          </p>
        </div>

        <div className="border-l-4 border-green-500 pl-4">
          <h3 className="font-medium mb-2">{guide.steps.script.title}</h3>
          <div className="token-display">{decodedScript}</div>
          <button type="button" className="btn-primary btn-small mt-3" onClick={handleCopy}>
            <CopyOutlined />
            {guide.copyCodeButton}
          </button>
        </div>

        <div className="border-l-4 border-yellow-500 pl-4">
          <h3 className="font-medium mb-2">{guide.steps.login.title}</h3>
          <p className="opacity-80">
            {loginDescriptionParts.map((part, index) => (
              <span key={index}>
                {part}
                {index < loginDescriptionParts.length - 1 && (
                  <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="link-accent">
                    {loginUrl}
                  </a>
                )}
              </span>
            ))}
          </p>
        </div>

        <div className="border-l-4 border-purple-500 pl-4">
          <h3 className="font-medium mb-2">{guide.steps.run.title}</h3>
          <p className="opacity-80">
            {formatMessage(guide.steps.run.description, { bookmark: guide.bookmark })}
          </p>
        </div>
      </div>
    </div>
  );
}
