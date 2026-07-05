# Persona AI - Backend

Express + TypeScript backend that powers chat with two personas: Hitesh Choudhary and Piyush Garg.

## How it works

- `personas/base_instructions.txt` - shared rules for all personas (stay in character, formatting, safety boundaries).
- `personas/hitesh.txt` / `personas/piyush.txt` - persona-specific style notes, teaching approach, and sample Q&A.
- On server startup, all three files are loaded into memory once (`src/personas/index.ts`).
- On each chat request, the final system prompt = base instructions + the selected persona's notes.
- Conversation history is sent from the frontend on every request (no database in this MVP) and trimmed server-side to the last 12 messages to control token usage (`src/utils/contextManager.ts`).
- Responses are streamed token-by-token to the frontend via Server-Sent Events (SSE).

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and add your OPENAI_API_KEY
```

## Run (development)

```bash
npm run dev
```

Server starts on `http://localhost:8080` (or whatever `PORT` you set in `.env`).

## Run (production build)

```bash
npm run build
npm start
```

## API

### `GET /api/personas`
Returns the list of available persona IDs.

### `POST /api/chat`
Request body:
```json
{
  "persona": "hitesh",
  "message": "Should I learn DSA before web dev?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Response: `text/event-stream`. Each event is a JSON payload:
- `{ "token": "..." }` - a chunk of the response text
- `{ "done": true }` - signals the stream is complete
- `{ "error": "..." }` - signals an error occurred mid-stream

## Adding a new persona

1. Add `personas/<name>.txt` following the same structure as `hitesh.txt`.
2. Register it in `src/personas/index.ts`:
   - Add the id to the `PersonaId` type
   - Add it to `personaNotes`
   - Add it to `isValidPersona`
