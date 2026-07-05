import { ChatMessage, PersonaId } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface StreamChatArgs {
  persona: PersonaId;
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Converts our client-side ChatMessage[] into the plain {role, content}[]
 * shape the backend expects (no ids/streaming flags sent over the wire).
 */
export function toApiHistory(
  messages: ChatMessage[]
): { role: "user" | "assistant"; content: string }[] {
  return messages
    .filter((m) => !m.isError)
    .map((m) => ({ role: m.role, content: m.content }));
}

/**
 * Calls the backend's streaming chat endpoint and parses the
 * Server-Sent Events response, invoking callbacks as chunks arrive.
 */
export async function streamChat({
  persona,
  message,
  history,
  onToken,
  onDone,
  onError,
}: StreamChatArgs): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, message, history }),
    });
  } catch {
    onError("Couldn't reach the server. Is the backend running?");
    return;
  }

  if (!response.ok || !response.body) {
    onError(`Server responded with an error (${response.status}).`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by a blank line ("\n\n")
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      const line = rawEvent.trim();
      if (!line.startsWith("data:")) continue;

      const jsonStr = line.slice("data:".length).trim();
      if (!jsonStr) continue;

      try {
        const payload = JSON.parse(jsonStr);
        if (payload.token) onToken(payload.token as string);
        if (payload.error) onError(payload.error as string);
        if (payload.done) {
          finished = true;
          onDone();
        }
      } catch {
        // Ignore malformed partial chunks; the buffer logic above
        // should prevent this in practice.
      }
    }
  }

  // Fallback in case the stream closed without an explicit {done:true}
  if (!finished) onDone();
}
