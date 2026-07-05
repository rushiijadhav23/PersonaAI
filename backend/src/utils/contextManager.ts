export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Max number of prior messages (user+assistant combined) we send back to the model.
// System prompt is always sent separately and never counts against this window.
const MAX_HISTORY_MESSAGES = 12;

/**
 * Trims conversation history to the most recent N messages so we don't
 * blow up token usage / cost on long conversations. The persona system
 * prompt is re-injected fresh on every request (handled in the route),
 * so persona consistency doesn't depend on this trimmed history.
 */
export function trimHistory(history: ChatMessage[]): ChatMessage[] {
  if (history.length <= MAX_HISTORY_MESSAGES) {
    return history;
  }
  return history.slice(history.length - MAX_HISTORY_MESSAGES);
}

/**
 * Basic validation/sanitization of incoming history from the client.
 * Frontend keeps the source of truth for chat history (no DB in this MVP),
 * so we defensively validate shape before trusting it.
 */
export function sanitizeHistory(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(
      (item): item is ChatMessage =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.trim().length > 0
    )
    .map((item) => ({ role: item.role, content: item.content.slice(0, 4000) })); // guard against giant payloads
}
