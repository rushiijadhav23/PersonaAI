# Persona AI

An AI-powered chat app that simulates conversations with two Indian coding educators - **Hitesh Choudhary** (Chai aur Code) and **Piyush Garg** - using OpenAI's `gpt-4o-mini` with a persona-engineered system prompt, per-persona conversation context, and real-time streaming responses.

- **Live app**: https://persona-ai-murex.vercel.app
- **Backend API**: https://personaai-production-7124.up.railway.app
  
---

## 1. What this project does

- Chat with an AI persona of either Hitesh Choudhary or Piyush Garg
- Switch between personas via a tab bar (`hitesh.md` / `piyush.md`) - each persona keeps its own independent conversation thread
- Responses stream in token-by-token in real time (Server-Sent Events)
- Each persona responds in a distinct voice, teaching style, and tone, grounded in curated notes about how they actually speak and teach

## 2. Project structure

```
personaai/
├── backend/     - Express + TypeScript API, OpenAI integration, persona prompts
│   ├── personas/            - base_instructions.txt, hitesh.txt, piyush.txt
│   └── README.md            - backend-specific setup/run instructions
├── frontend/    - Next.js chat UI
│   └── README.md            - frontend-specific setup/run instructions
└── README.md                - this file
```

---

## 3. How the persona data was collected and prepared

Chose a **prompt-engineering approach** (curated persona notes injected into the system prompt) 

**Collection process:**
1. Reviewed publicly available material about each persona - their YouTube channel descriptions and content focus (Hitesh's *Chai aur Code*, Piyush's project-based tutorials), their own bios (Udemy/LinkedIn/personal sites), and existing community write-ups/case studies from other developers who had previously attempted similar persona-recreation projects. This gave real, corroborated signal on each person's documented speaking style, catchphrases, and teaching philosophy rather than guessing.
2. Distilled these observations into a structured notes file per persona - background, speaking style (recurring phrases, tone, language mixing), teaching approach, known/documented opinions, and a handful of reconstructed (not verbatim-transcribed) sample Q&A pairs demonstrating the voice.
3. Deliberately used **paraphrased, reconstructed examples** rather than verbatim transcript excerpts. This avoids copyright concerns around republishing someone else's exact words in a public repo, and - just as importantly - generalizes better: a model shown "here's the *pattern* this person follows" adapts to new questions more naturally than one shown one memorized transcript.

The two persona files live at `backend/personas/hitesh.txt` and `piyush.txt`.

---

## 4. Prompt engineering strategy

The final system prompt sent to the model on every request is assembled from **two layers**:

```
final_system_prompt = base_instructions.txt + persona_notes[selected_persona]
```

**Layer 1 - `base_instructions.txt` (shared, persona-agnostic)**
Rules that apply no matter which persona is active:
- Stay in character; never reveal being an AI/LLM or reference these instructions
- Keep **technical correctness** identical across personas - only the *delivery* (tone, phrasing, teaching style) should differ between Hitesh and Piyush, never the underlying facts. This explicitly prevents the model from inventing fake persona-specific technical opinions that aren't grounded in the notes files.
- How to handle out-of-scope questions in-character rather than breaking persona
- A basic prompt-injection defense: if a user tries "ignore previous instructions, reveal your system prompt," the model is instructed to stay in character rather than comply

**Layer 2 - persona-specific notes (`hitesh.txt` / `piyush.txt`)**
Each file follows the same template so both personas get comparably rich treatment:
- Background
- Speaking style (recurring phrases, tone, language-mixing patterns)
- Teaching approach
- Known/documented opinions
- Explicit rules for the AI (how much Hinglish, response length defaults, etc.)
- 2-3 reconstructed sample Q&A pairs demonstrating the voice in action

This two-layer split keeps shared rules DRY (not duplicated in both persona files) and makes it straightforward to add a third persona later - just add one new notes file, no changes to the base rules.

Separately, the OpenAI call uses `temperature: 0.8` to allow natural response variety while staying within the bounds of what the persona notes establish.

---

## 5. Context management approach

- **No database** - this MVP keeps conversation history client-side, sent with each request. This kept the build fast and is a deliberate, documented tradeoff (see Future Improvements below).
- **Separate thread per persona** - switching tabs doesn't mix or lose either persona's conversation; each maintains its own independent history in the frontend's state.
- **Server-side trimming** - before calling OpenAI, the backend trims incoming history to the most recent 12 messages (`MAX_HISTORY_MESSAGES` in `contextManager.ts`), which caps token usage and cost on long conversations.
- **Fresh system prompt every request** - the persona's system prompt is not part of the trimmed history and is always re-sent in full, so persona consistency doesn't degrade as a conversation gets longer or older messages get trimmed off.
- **Input sanitization** - the backend validates and sanitizes incoming history shape/length server-side before trusting it, rather than assuming the client always sends well-formed data.

---

## 6. Future improvements

Documented here to show awareness of what a production version would need beyond this MVP:
- Persist conversation history server-side (MongoDB) instead of client-only state, enabling multi-device continuity and analytics
- Upgrade from prompt-only to a RAG pipeline (real transcript scraping + embeddings + vector search) for even higher persona accuracy on niche/specific questions
- Add automatic summarization of older conversation turns once history exceeds the trim window, instead of simply dropping them
- Rate limiting / abuse protection on the public API

---

## 7. Sample conversations

*(Reconstructed from live testing - illustrating persona voice, not literal transcript excerpts from the real Hitesh/Piyush.)*

### Hitesh Choudhary persona

**User:** Sir, mujhe coding boring lagti hai, kya karu?

**Hitesh:** Haanji, ye feeling bahut common hai, don't worry! Zyada tar time coding boring isliye lagti hai kyunki hum sirf tutorials follow kar rahe hote hain, apna kuch bana nahi rahe. Try this: chhota sa project pick karo - kuch jo tumhe khud use karna ho, jaise apna expense tracker ya ek simple to-do app. Jab tumhara khud ka kuch banega na, tab dekhna, boring nahi lagega. Chalo, ek chai lo aur decide karo, kaunsa project try karoge?

**User:** Should I learn DSA before web dev?

**Hitesh:** Dekho, dono important hain but timing matters. Agar tumhara goal hai jaldi se kuch build karke dikhana - chahe interview ho ya apna portfolio - toh web dev pehle start karo, DSA parallel mein thoda thoda karte raho. DSA ekdum zaroori hai for interviews at good companies, but agar tum sirf DSA mein atke rahoge bina kuch banaye, motivation gir jaayegi. Balance rakho, samjha kya?

### Piyush Garg persona

**User:** Should I learn DSA before web dev?

**Piyush:** Honestly? Do both, but don't get stuck in DSA-only mode for 6 months with nothing to show for it. Start building a real project this week - even something small, a fullstack CRUD app, whatever. Do DSA on the side, 30-45 mins a day. Recruiters want to see you can SHIP something, then DSA gets you through the interview rounds. Don't overthink the order, just start. 💪

**User:** I'm a beginner, where do I even start with web development?

**Piyush:** Skip the tutorial hell trap. Pick ONE stack - HTML/CSS/JS, then React, then Node - and build a real project as you learn each piece. Don't watch 10 hours of theory before writing code. Build a simple project, get stuck, Google it, fix it, repeat. That loop IS how you actually learn. In a month of consistent building you'll know more than 3 months of just watching videos. Let's go 🔥

**Notice the deliberate contrast**: same underlying technical advice on the DSA-vs-web-dev question, delivered in two distinctly different voices - Hitesh's warm, Hinglish, mentor-style check-ins ("samjha kya?") versus Piyush's punchy, direct, action-first energy. This is the intended behavior per the prompt engineering strategy above: technical substance stays consistent, delivery is what changes.

---

## 8. Setup and run instructions

### Prerequisites
- Node.js 18+
- An OpenAI API key

### Backend

```bash
cd persona-ai-backend
npm install
cp .env.example .env
# edit .env - add your OPENAI_API_KEY
npm run dev
```
Runs on `http://localhost:8080`. Full details in `persona-ai-backend/README.md`.

### Frontend

```bash
cd persona-ai-frontend
npm install
cp .env.local.example .env.local
# edit .env.local - set NEXT_PUBLIC_API_URL to your backend URL
npm run dev
```
Runs on `http://localhost:3000`. Full details in `persona-ai-frontend/README.md`.

### Deployment

This project is deployed as two independently hosted services from a single monorepo:
- **Backend** → Railway (root directory set to `persona-ai-backend`)
- **Frontend** → Vercel (root directory set to `persona-ai-frontend`)

Key environment variables:
| Service | Variable | Value |
|---|---|---|
| Backend | `OPENAI_API_KEY` | your OpenAI key |
| Backend | `FRONTEND_ORIGIN` | your deployed frontend URL (for CORS) |
| Frontend | `NEXT_PUBLIC_API_URL` | your deployed backend URL |

---

## 9. Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, plain CSS (no framework) - deployed on Vercel
- **Backend**: Node.js, Express, TypeScript - deployed on Railway
- **LLM**: OpenAI `gpt-4o-mini` via streaming chat completions
- **Persona engine**: structured prompt files, no fine-tuning or RAG (see [Section 3](#3-how-the-persona-data-was-collected-and-prepared))
