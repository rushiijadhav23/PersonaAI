"use client";

import { useEffect, useRef } from "react";
import { ChatMessage, PersonaMeta } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: ChatMessage[];
  persona: PersonaMeta;
}

export default function ChatWindow({ messages, persona }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="window">
      {messages.length === 0 ? (
        <div className="empty">
          <p className="empty__title">{persona.tagline}</p>
          <p className="empty__hint">
            Ask {persona.displayName.split(" ")[0]} anything about code, career, or
            what to build next.
          </p>
        </div>
      ) : (
        <div className="list">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} persona={persona} />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <style jsx>{`
        .window {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 6px;
        }

        .empty__title {
          font-family: var(--font-mono);
          color: var(--text-muted);
          font-size: 15px;
          margin: 0;
        }

        .empty__hint {
          color: var(--text-faint);
          font-size: 13.5px;
          margin: 0;
          max-width: 320px;
        }
      `}</style>
    </div>
  );
}
