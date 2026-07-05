"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder: string;
}

export default function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="input-bar">
      <span className="prompt" aria-hidden="true">
        &gt;
      </span>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        aria-label="Message"
      />
      <button onClick={handleSend} disabled={disabled || !value.trim()}>
        Send
      </button>

      <style jsx>{`
        .input-bar {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          padding: 14px 16px;
          background: var(--bg-input);
          border-top: 1px solid var(--border);
        }

        .prompt {
          font-family: var(--font-mono);
          color: var(--text-faint);
          padding-bottom: 9px;
          user-select: none;
        }

        textarea {
          flex: 1;
          resize: none;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 14.5px;
          line-height: 1.5;
          padding: 8px 0;
          max-height: 160px;
        }

        textarea::placeholder {
          color: var(--text-faint);
        }

        textarea:disabled {
          opacity: 0.6;
        }

        button {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 9px 16px;
          font-size: 13.5px;
          font-weight: 500;
          transition: opacity 0.15s ease;
        }

        button:disabled {
          opacity: 0.4;
        }

        button:hover:not(:disabled) {
          border-color: var(--border-strong);
        }
      `}</style>
    </div>
  );
}
