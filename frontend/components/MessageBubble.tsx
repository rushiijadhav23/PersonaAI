"use client";

import { ChatMessage, PersonaMeta } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  persona: PersonaMeta;
}

export default function MessageBubble({ message, persona }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`row ${isUser ? "row--user" : "row--assistant"}`}>
      {!isUser && (
        <div
          className="rail"
          style={{ background: `var(${persona.accentVar})` }}
          aria-hidden="true"
        />
      )}

      <div className={`bubble ${isUser ? "bubble--user" : "bubble--assistant"} ${message.isError ? "bubble--error" : ""}`}>
        {!isUser && (
          <div
            className="sender"
            style={{ color: `var(${persona.accentVar})` }}
          >
            {persona.displayName}
          </div>
        )}
        <div className="content">
          {message.content}
          {message.streaming && <span className="cursor" aria-hidden="true" />}
        </div>
      </div>

      <style jsx>{`
        .row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          max-width: 78%;
        }

        .row--user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .row--assistant {
          align-self: flex-start;
        }

        .rail {
          width: 3px;
          border-radius: 2px;
          align-self: stretch;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .bubble {
          padding: 12px 14px;
          border-radius: var(--radius-md);
          font-size: 14.5px;
          line-height: 1.55;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .bubble--user {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        .bubble--assistant {
          background: var(--bg-panel);
          border: 1px solid var(--border);
        }

        .bubble--error {
          border-color: var(--danger);
          color: var(--danger);
        }

        .sender {
          font-family: var(--font-mono);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .cursor {
          display: inline-block;
          width: 7px;
          height: 14px;
          margin-left: 2px;
          background: var(--text-muted);
          vertical-align: middle;
          animation: blink 1s step-start infinite;
        }

        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
