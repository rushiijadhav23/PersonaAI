# Persona AI - Frontend

Next.js chat interface for talking to Hitesh Choudhary / Piyush Garg AI personas.

## Design

The UI is styled like a minimal code editor: a tab bar at the top switches between
personas (`hitesh.md` / `piyush.md`), echoing how you'd switch files in an editor.
Each persona has a distinct accent color (warm amber for Hitesh, teal for Piyush)
used on their message rail and name label, so it's visually obvious who's "talking"
even mid-scroll.

Each persona keeps its own independent conversation thread client-side - switching
tabs doesn't lose either conversation's history.

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't running on localhost:8080
```

## Run (development)

```bash
npm run dev
```

Visit `http://localhost:3000`. Make sure the backend (`persona-ai-backend`) is
running first - see its own README for setup.

## Run (production build)

```bash
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx       - root HTML shell, metadata
  page.tsx          - renders <ChatApp />
  globals.css       - design tokens (colors, fonts) + resets
components/
  ChatApp.tsx       - state management: active persona, per-persona threads, streaming
  PersonaTabs.tsx    - the tab-bar persona switcher
  ChatWindow.tsx     - scrollable message list
  MessageBubble.tsx  - individual message rendering
  ChatInput.tsx      - message input + send
lib/
  types.ts           - shared types + persona metadata (display name, accent color, etc.)
  api.ts              - streamChat(): calls backend /api/chat and parses the SSE stream
```

## Adding a new persona (frontend side)

1. Add the persona to `PERSONAS` in `lib/types.ts` (id, display name, tab label, accent CSS var).
2. Add the matching accent color variable in `app/globals.css` (e.g. `--accent-newperson`).
3. Make sure the backend has a matching `.txt` persona file registered (see backend README).
