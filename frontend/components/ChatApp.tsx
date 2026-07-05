"use client";

import { useState } from "react";
import { ChatMessage, PersonaId, getPersonaMeta } from "@/lib/types";
import { streamChat, toApiHistory } from "@/lib/api";
import PersonaTabs from "./PersonaTabs";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

type Threads = Record<PersonaId, ChatMessage[]>;

function makeId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function ChatApp() {
  const [activePersona, setActivePersona] = useState<PersonaId>("hitesh");
  const [threads, setThreads] = useState<Threads>({ hitesh: [], piyush: [] });
  const [isStreaming, setIsStreaming] = useState(false);

  const persona = getPersonaMeta(activePersona);
  const messages = threads[activePersona];

  function updateThread(personaId: PersonaId, updater: (msgs: ChatMessage[]) => ChatMessage[]) {
    setThreads((prev) => ({ ...prev, [personaId]: updater(prev[personaId]) }));
  }

  async function handleSend(text: string) {
    if (isStreaming) return;

    const personaId = activePersona;
    const historySnapshot = toApiHistory(threads[personaId]);

    const userMessage: ChatMessage = { id: makeId(), role: "user", content: text };
    const assistantId = makeId();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    updateThread(personaId, (msgs) => [...msgs, userMessage, assistantMessage]);
    setIsStreaming(true);

    await streamChat({
      persona: personaId,
      message: text,
      history: historySnapshot,
      onToken: (token) => {
        updateThread(personaId, (msgs) =>
          msgs.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m))
        );
      },
      onDone: () => {
        updateThread(personaId, (msgs) =>
          msgs.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))
        );
        setIsStreaming(false);
      },
      onError: (error) => {
        updateThread(personaId, (msgs) =>
          msgs.map((m) => {
            if (m.id !== assistantId) return m;
            // If some content already streamed in successfully, keep it and
            // just append a short inline note rather than wiping the answer.
            const hasPartialContent = m.content.trim().length > 0;
            return {
              ...m,
              content: hasPartialContent
                ? `${m.content}\n\n⚠️ ${error}`
                : error,
              streaming: false,
              isError: !hasPartialContent,
            };
          })
        );
        setIsStreaming(false);
      },
    });
  }

  return (
    <div className="shell">
      <div className="editor">
        <div className="titlebar">
          <span className="titlebar__label">persona-ai — chat</span>
        </div>

        <PersonaTabs
          activePersona={activePersona}
          onSwitch={setActivePersona}
          disabled={isStreaming}
        />

        <ChatWindow messages={messages} persona={persona} />

        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={
            isStreaming
              ? `${persona.displayName.split(" ")[0]} is typing…`
              : `Message ${persona.displayName.split(" ")[0]}…`
          }
        />
      </div>

      <style jsx>{`
        .shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .editor {
          width: 100%;
          max-width: 720px;
          height: 78vh;
          min-height: 480px;
          background: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .titlebar {
          padding: 10px 16px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
        }

        .titlebar__label {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-faint);
        }
      `}</style>
    </div>
  );
}
