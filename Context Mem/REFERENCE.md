# Project Reference & AI Agent Rules - Lumina AI

**Project:** Lumina AI (`lumina`)  
**Target Environment:** Node.js (v18+) / React 19 / Express 4 / SQLite

---

## 1. Project Purpose & Architecture

### High-Level Purpose
Lumina AI is an interactive, local-first mental wellness platform designed to help individuals reflect on their mental health, observe cognitive distortions, track emotional metrics over time, practice breathing exercises, and receive thoughtful AI-guided reflections while keeping their data strictly private in a local database.

### System Architecture
```text
lumina/
├── Context Mem/                  <- AI Agent memory (MASTER.md, LOGBOOK.md, REFERENCE.md, TODO.md)
├── dist/                         <- Vite production build assets (client HTML, JS, CSS)
├── src/                          <- Frontend React application
│   ├── components/               <- UI views and feature modules
│   │   ├── Breathing.tsx         <- Interactive 4-7-8 breathing circle & grounding exercises
│   │   ├── Chat.tsx              <- Therapist-inspired chat dialogue interface & message streams
│   │   ├── Dashboard.tsx         <- Emotional analytics, distortion distributions, weekly insights
│   │   ├── Onboarding.tsx        <- First-time user welcome and profile configuration
│   │   ├── Profile.tsx           <- User identity and summary details
│   │   └── Settings.tsx          <- Local privacy options, data wipe, and application configuration
│   ├── App.tsx                   <- Application layout, navigation bar, and state orchestration
│   ├── index.css                 <- Global styles and Tailwind v4 setup
│   └── main.tsx                  <- React DOM client mount
├── index.html                    <- HTML document template
├── lumina.db                     <- SQLite local database
├── server.ts                     <- Express backend, SQLite queries/migrations, Gemini API proxy
├── vite.config.ts                <- Vite 6 configuration with React and Tailwind plugins
├── tsconfig.json                 <- TypeScript compiler configuration
├── package.json                  <- Project dependencies and npm scripts
└── README.md                     <- Comprehensive project overview and documentation
```

### Backend & API Design (`server.ts`)
- **API Routes**:
  - `GET /api/user` & `POST /api/user/onboard`: User profile retrieval and onboarding completion.
  - `GET /api/dashboard`: Aggregates 7-day emotional trends, top emotions, and cognitive distortions from SQLite `messages`.
  - `GET /api/dashboard/insight`: Asynchronously calls Gemini with 7-day user trends to synthesize a 3-sentence pattern observation.
  - `GET /api/chat/sessions` & `POST /api/chat/session`: Chat session history listing and session creation.
  - `GET /api/chat/history`: Retrieves chronological messages for the active or requested session ID.
  - `POST /api/chat/generate`: Securely routes user prompt through Gemini API with structured JSON output schema (response text, emotion, mood score, stress level, crisis flag, strategy, cognitive distortion, therapeutic focus, trigger), saves both user and AI messages to SQLite, and updates emotional metrics.
  - `DELETE /api/user/data`: Wipes `messages` and `sessions` tables upon user request in Settings.
- **Model Fallback Chain**:
  Tries models in order for resilience:
  1. `process.env.GEMINI_CHAT_MODEL` (defaults to `gemini-2.5-flash`)
  2. `gemini-2.5-flash-lite`
  3. `gemini-2.0-flash`
  4. `gemini-2.0-flash-lite`
  5. `gemini-flash-latest`
  6. `gemini-1.5-flash`

---

## 2. Hard Invariants & Project Constraints

1. **Secrets & Security:**
   - NEVER commit or log secrets, passwords, or API keys (`GEMINI_API_KEY`) into memory files or repository documentation.
   - Reference secrets strictly via their environment variable name (`process.env.GEMINI_API_KEY`).
   - `.env` and `.env.local` are explicitly ignored by `.gitignore` and must never be tracked.
2. **Local Data Privacy:**
   - User chat histories, session logs, and personal health metrics reside inside local SQLite (`lumina.db`).
   - External network traffic is limited strictly to Google Gemini API calls via the backend proxy.
3. **No Scattered Memory:**
   - All AI agent memory must reside exclusively inside `Context Mem/`. Do not create a root `AGENTS.md` or loose memory notes elsewhere.
4. **Preserve Project Files:**
   - Do not reorganize source code or delete project documentation (`README.md`, `metadata.json`) to accommodate agent memory.

---

## 3. Verified Development & Testing Commands

*The following commands have been directly tested and verified on this machine:*

- **Typecheck Codebase:**
  ```bash
  npm run lint
  # Runs: tsc --noEmit (Verified 0 errors)
  ```
- **Build Client Bundle:**
  ```bash
  npm run build
  # Runs: vite build (Verified exit 0, outputs to dist/)
  ```
- **Start Development Server:**
  ```bash
  npm run dev
  # Runs: tsx server.ts (Express with Vite middleware on port 3000)
  ```
- **Start Production Server:**
  ```bash
  npm start
  # Runs: tsx server.ts (Serves static files from dist/ on port 3000)
  ```

---

## 4. Universal AI Coding Agent Operating Rules

All AI coding agents working on this project must strictly adhere to the following principles:

### Critical Permission Boundary
- **Allowed in Local Workspace:** Inspect files, edit source code, run non-destructive tests and builds, create/update `Context Mem/` files, and prepare local deliverables.
- **Strictly Prohibited Without Explicit User Confirmation:**
  - Pushing or writing to GitHub or any remote repository.
  - Creating, modifying, or deleting remote repositories, remotes, or branches.
  - Executing mutating Git commands (`commit`, `push`, `pull`, `rebase`, `reset`, `branch -d`).
  - Silently discarding uncommitted changes or resolving merge conflicts by guesswork.

### Routine Startup Workflow
1. Read `Context Mem/MASTER.md` first to grasp the active status and latest checkpoint.
2. Read `Context Mem/REFERENCE.md` and `Context Mem/TODO.md`. Consult `Context Mem/LOGBOOK.md` for historical context when needed.
3. Verify notes against actual project files and Git state before making assumptions.

### Post-Task Memory Maintenance
1. After every meaningful completed task, update `Context Mem/MASTER.md`.
2. Append a permanent dated record to `Context Mem/LOGBOOK.md` (`YYYY-MM-DD HH:MM:SS ±HH:MM`).
3. Update `Context Mem/TODO.md` to reflect completed items and newly identified tasks.
4. Leave a clear recovery checkpoint at session end or interruption.

---

## 5. Safe Git Synchronization Workflow

When the user explicitly requests synchronization to a remote repository:
1. Inspect local changes with non-destructive commands (`git status`, `git diff`).
2. Verify test outcomes and compilation cleanly (`npm run lint`, `npm run build`).
3. Present a clear summary of files to be committed, tests run, and the target remote repository/branch.
4. **Ask the user for explicit confirmation before executing `git commit` or `git push`.**
5. Never use `--force` or destructive history rewriting.
6. Record the sync outcome in `Context Mem/LOGBOOK.md` and update `Context Mem/MASTER.md`.
