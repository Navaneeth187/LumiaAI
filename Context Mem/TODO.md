# Project Task Backlog - Lumina AI

**Last Updated:** 2026-10-24 14:15:00 +05:30

---

## 1. High Priority (Immediate Next Steps)

*No blocking work active. Awaiting user-directed task assignments.*

- [ ] **Task Onboarding / Assignment**
  - *Context:* Memory baseline established and validated.
  - *Action:* Receive specific task instructions from the user (e.g., feature enhancement, UI tuning, or testing).
  - *Acceptance Criteria:* Work executed according to user specifications while maintaining `Context Mem/`.

---

## 2. Medium Priority (Backlog & Optimizations)

- [ ] **Vite Client Chunk Splitting Optimization**
  - *Context:* `npm run build` issued a warning that `dist/assets/index-BtHN571h.js` exceeds 500 kB (858 kB raw / 261 kB gzip).
  - *Action:* Introduce dynamic `import()` for lazy-loading larger components (`Breathing.tsx`, `Dashboard.tsx`, `Settings.tsx`) or configure `manualChunks` in `vite.config.ts`.
  - *Acceptance Criteria:* Client JS chunks remain under 500 kB threshold without impacting runtime page transitions.

- [ ] **Automated Unit & Integration Test Suite**
  - *Context:* The project currently relies on TypeScript checking (`tsc --noEmit`) and Vite compilation for validation; no unit test runner (e.g. Vitest) is installed.
  - *Action:* Add lightweight testing setup for API routes and utility functions (e.g., metric normalizer and crisis detection logic).
  - *Acceptance Criteria:* `npm test` runs automated assertions cleanly.

---

## 3. Low Priority / Future Enhancements

- [ ] **Data Export / Backup Feature**
  - *Description:* Allow users to export their encrypted chat history or SQLite metrics to JSON format from the Settings interface.
- [ ] **Offline LLM or Local Fallback Model**
  - *Description:* Explore integrating local quantized model support via WebLLM or Ollama for fully offline reflection when Gemini API is unreachable.

---

## 4. Completed Tasks Archive

- [x] **Project Memory System Initialization** (2026-10-24)
  - Established standardized `Context Mem/` architecture (`MASTER.md`, `LOGBOOK.md`, `REFERENCE.md`, `TODO.md`) adhering to `ANTIGRAVITY_PROJECT_MEMORY_IMPLEMENTATION.md`.
  - Verified codebase typecheck (`npm run lint` - 0 errors) and client production build (`npm run build` - successful).
  - Inspected and preserved existing documentation (`README.md`, `metadata.json`) without restructuring source code.
