import OpenAI from "openai";
import { ChatMessage } from "../utils/contextManager";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Streams a chat completion from OpenAI.
 * onToken is called for each text chunk as it arrives.
 * Returns the full assembled response text once streaming completes.
 */
export async function streamPersonaResponse(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  onToken: (token: string) => void
): Promise<string> {
  const stream = await client.chat.completions.create({
    model: MODEL,
    stream: true,
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
  });

  let fullText = "";

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content || "";
    if (token) {
      fullText += token;
      onToken(token);
    }
  }

  return fullText;
}
