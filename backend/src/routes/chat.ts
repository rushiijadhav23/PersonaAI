import { Router, Request, Response } from "express";
import { getSystemPrompt, isValidPersona, getAvailablePersonas } from "../personas";
import { sanitizeHistory, trimHistory } from "../utils/contextManager";
import { streamPersonaResponse } from "../services/openai";

const router = Router();

// GET /api/personas - lets the frontend know which personas exist
router.get("/personas", (_req: Request, res: Response) => {
  res.json({ personas: getAvailablePersonas() });
});

// POST /api/chat - streams a persona response via Server-Sent Events (SSE)
router.post("/chat", async (req: Request, res: Response) => {
  const { persona, message, history } = req.body ?? {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "message is required" });
  }

  if (typeof persona !== "string" || !isValidPersona(persona)) {
    return res.status(400).json({
      error: `persona must be one of: ${getAvailablePersonas().join(", ")}`,
    });
  }

  const cleanHistory = trimHistory(sanitizeHistory(history));
  const systemPrompt = getSystemPrompt(persona);

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    await streamPersonaResponse(systemPrompt, cleanHistory, message, (token) => {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Error streaming persona response:", err);
    // If headers already sent (streaming started), emit an error event instead of a JSON error response
    res.write(`data: ${JSON.stringify({ error: "Something went wrong generating the response." })}\n\n`);
    res.end();
  }
});

export default router;
