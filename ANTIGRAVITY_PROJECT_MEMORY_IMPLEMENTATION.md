# Antigravity Implementation Brief: Project Memory and Safe GitHub Workflow

**Purpose:** Use this document as the implementation specification for organizing the AI-agent memory system in existing local projects and preparing a reusable template for future projects.

**Authority:** Follow the user's direct instructions in the current conversation first. This document records the agreed design. If an important choice is unclear or an operation could risk existing work, stop that specific operation and report the issue rather than guessing.

---

## 1. Critical permission boundary

The user authorizes you to inspect and update files in the local/downloaded workspace as necessary to implement this system.

**This permission does not authorize changes to GitHub or any other remote repository.**

### Allowed in the local workspace

- Inspect current project folders, repository roots, project documentation, existing agent instructions, and Git status.
- Create and maintain the `Context Mem/` folder and its agreed memory files in each confirmed project.
- Carefully consolidate useful existing project/agent context into the new structure without losing important information.
- Prepare a reusable local starter-template folder for future projects, outside the project repositories where practical.
- Edit local memory/documentation files, verify facts against available files and code, and run appropriate non-destructive checks.
- Report exactly what changed locally and what has not been done.

### Not allowed without a separate explicit instruction and final confirmation

- Push or otherwise write anything to GitHub or another remote.
- Create, delete, rename, or modify remote repositories, including the proposed template repository.
- Commit, pull, fetch, merge, rebase, reset, switch branches, clean, or run another Git operation that changes repository history, branch/worktree state, or remote state unless the user has specifically requested the relevant synchronization workflow. Never use force-push or destructive history rewriting.
- Overwrite or discard existing local changes, resolve a consequential conflict by guessing, or delete existing project files that may contain user work.

The user may explicitly tell you to clone/download a supplied repository at project setup. That instruction authorizes that requested download. Do not interpret it as blanket permission for later updates or pushes.

**Default rule: local preparation may proceed; remote synchronization does not happen automatically.** When the user requests a sync, inspect the local and remote state safely, prepare a review summary, and ask for final confirmation before any operation that writes to the remote.

---

## 2. Desired architecture

Each project has its own GitHub repository and independent local project memory. Every file used as AI-agent memory or project-specific agent guidance must live inside a folder named exactly:

`Context Mem/`

Do not create a root-level `AGENTS.md`, a duplicate root master file, or scattered agent-memory files elsewhere in a project. Do not reorganize source code to accommodate memory.

### Standard per-project structure

```text
project-root/
├── Context Mem/
│   ├── MASTER.md
│   ├── LOGBOOK.md
│   ├── REFERENCE.md
│   └── TODO.md
├── ... existing project source and documentation ...
└── README.md (if the project already has one; ordinary project documentation)
```

The four files above are the default. Do not create additional files unless a real, documented need justifies them. Keep agent-specific operating rules in `Context Mem/REFERENCE.md` rather than scattering them across the repository. An ordinary project `README.md` is not an agent-memory file and may remain in the project root.

If a root `AGENTS.md` or other old agent-memory document already exists, read and preserve its useful content. Consolidate agent-specific rules into `Context Mem/REFERENCE.md`. Remove a disallowed root agent-memory file only when you can verify it contains no unrelated project configuration or user information that would be lost. If its purpose is mixed or uncertain, do not delete it silently; explain the exception and ask the user how to handle it. Do not leave duplicate master files.

### Responsibilities of each file

#### `Context Mem/MASTER.md` — first file to read

A short dashboard plus the latest work checkpoint. Keep it compact, current, and sufficient for a safe restart. It should normally include:

1. Project purpose and a brief description.
2. Current status, explicitly distinguishing verified facts from assumptions or unknowns.
3. Last meaningful task and what was actually completed.
4. Relevant files, commands, tests, and their observed results when applicable.
5. Latest checkpoint: current state, unfinished work, blockers, and concrete next step(s).
6. A compact repository/workspace tracking snapshot: repository URL (without embedded credentials), local workspace path, active branch when verified, current commit when verified, workspace first cloned or initially recorded/reused time when known, last successful remote update, and last successful remote upload.
7. Sync status: not requested, awaiting confirmation, completed, failed, or not verified, as appropriate.

Do not let `MASTER.md` become the full history. Link or point to the relevant section of `LOGBOOK.md` when useful. Do not claim a task, test, clone, pull, push, or sync succeeded unless there is evidence that it did.

#### `Context Mem/LOGBOOK.md` — permanent chronological history

Keep a chronological record of meaningful work and recovery events, including:

- Memory-system initialization and the sources used to establish the initial state.
- Meaningful task/session summaries, material changes, decisions, and why a decision was made.
- Test/verification commands and actual outcomes, including failures.
- Incomplete or interrupted work, recovery information, and safe resume steps.
- Clone/download or workspace-reuse events when known.
- Successful and failed remote update/sync attempts, relevant branch and commit references, conflicts, and final outcomes.

Use local date/time with an explicit UTC offset, preferably `YYYY-MM-DD HH:MM:SS ±HH:MM`. Detect the applicable local timezone/offset rather than assuming UTC. Keep the history permanently; do not delete old entries merely to shorten the file. Avoid logging every trivial edit: record meaningful milestones and events that help future agents understand or recover the work.

Do not fabricate past history or timestamps. If an older event was not recorded or cannot be verified, say so. The initial entry should identify this as a baseline/initialization point and note that earlier history is only included where supported by existing records.

#### `Context Mem/REFERENCE.md` — durable knowledge and operating rules

Keep stable, essential facts here, such as:

- Purpose, architecture, important modules, paths, and relationships.
- Project rules, constraints, conventions, known pitfalls, and authoritative documentation.
- Useful setup, build, test, and validation commands, only after checking them where feasible.
- Rules for all AI coding agents working in the project.
- How to interpret memory and how to record verified changes.

Do not copy secrets, passwords, API keys, access tokens, private keys, or secret values from `.env` or configuration files into memory. Do not include credentials in repository URLs. Link to the existence/location of a secret when necessary without copying its value.

#### `Context Mem/TODO.md` — pending and next work

Track actionable tasks, blockers, dependencies, and prioritized next steps. Mark an item complete only when there is evidence it is complete. Remove a completed item from the active list only after preserving meaningful context in `LOGBOOK.md`; do not let TODO become a duplicate long-form work history.

---

## 3. Audit and organize existing local projects

Work on the projects that are clearly identifiable in the user-provided Antigravity workspace. Be careful not to treat every folder as an independent project.

1. Inspect the workspace root and identify project roots using reliable markers such as Git repository roots, existing project documentation, and project manifests. Avoid dependency/build folders such as `node_modules`, virtual environments, cache folders, and generated output.
2. Treat a single repository/monorepo as one project unless existing documentation clearly shows that its parts are independently managed projects. Do not create nested `Context Mem/` folders just because a repository contains multiple apps or packages.
3. Before changing a project, inspect its current Git status and existing memory/instruction/documentation files. Do not overwrite dirty work or overwrite existing files without comparing their content.
4. Reuse a valid existing `Context Mem/` structure if present. Update it in place; do not create a second set of memory files.
5. Read relevant existing project and agent documentation. Consolidate useful knowledge into the standard files while preserving important decisions, constraints, and known issues. Do not blindly dump all source files into memory.
6. Create any missing standard files. Populate them only with facts supported by the source files, code, command results, or explicit user statements. Label assumptions and unknowns.
7. Keep code and unrelated project files untouched unless a specific change is required to implement the memory system and is safe under this brief.
8. If a directory's status as a project is materially ambiguous, do not restructure it by guesswork. Continue with clearly identified projects and list the ambiguous path and reason in the final report.
9. Do not initiate a remote sync just because you inspect Git status or discover new local memory files.

### Initial logbook baseline

For each project, add a dated initialization entry describing what memory files were created or updated, which sources were inspected, and what could or could not be verified. Do not invent work history from before initialization. Existing changelogs, commits, and docs may be cited as sources but must not be represented as firsthand session records.

---

## 4. Reusable template for new projects

The user chose a dedicated reusable starter-template repository for common structure and rules, while keeping every project's memory independent.

Because this brief does **not** authorize GitHub changes, prepare a **local-only template folder** outside existing project repositories when there is an unambiguous safe location. Give it a clear name such as `AI Project Memory Template`. If the workspace root is itself a project repository or there is no safe non-project location, do not accidentally place the template in the wrong project; report the recommended local location instead.

The local template should contain starter copies of the four files under `Context Mem/`. Use clear placeholders and short instructions; do not include details, task history, TODOs, URLs, or secrets from a real project. Keep shared general agent rules in template `Context Mem/REFERENCE.md`.

The template should explain that, when creating a new project:

1. Copy the starter `Context Mem/` folder into the new project repository.
2. Replace placeholders with that project's verified facts.
3. Start a new independent `LOGBOOK.md`; never import another project's private history.
4. Populate `MASTER.md`, `REFERENCE.md`, and `TODO.md` from the new project's actual content and the user's instructions.
5. Keep all agent memory inside `Context Mem/` and follow the local-only/confirmation-based sync rules.

Do not initialize or modify a remote template repository, create one on GitHub, or push the template. Report the local template path and explain that making it a GitHub repository is a separate future action requiring the user's explicit authorization and confirmation.

---

## 5. Routine agent startup and task workflow

When the user provides a repository URL and asks you to clone/download or prepare a project:

1. Follow the user's explicit download instruction. If a local copy already exists, check its status and reuse it safely instead of cloning over it.
2. If the target directory has uncommitted changes or a conflict that could be lost, preserve them and stop any risky replacement/update operation.
3. Read `Context Mem/MASTER.md` first. Then read `REFERENCE.md` and `TODO.md`; consult relevant portions of `LOGBOOK.md` for recent history, decisions, or recovery details.
4. Compare the notes against the actual project files and Git state. Treat stale notes as clues to verify, not unquestionable truth.
5. Understand the project sufficiently to give a brief readiness report: purpose, current state, relevant modules, tests/verification known, outstanding work, blockers, and sync status.
6. When the user says only to understand the project and get ready, make no unrelated code changes. Do not start a task the user has not assigned. If memory setup itself was explicitly requested, make only the required local memory changes.

When given an actual task:

1. Make the needed project changes while respecting existing conventions and scope.
2. Verify with suitable checks/tests where feasible. Record exact results and avoid claiming tests passed if they were not run or did not pass.
3. After every meaningful completed task, update `MASTER.md`; record the meaningful event in `LOGBOOK.md`; update `TODO.md` when pending work changes; update `REFERENCE.md` only when durable knowledge/rules change.
4. At session end or interruption, create a recovery-quality checkpoint, even when work is incomplete. Include changes made, what remains, the last known verification, risks/blockers, and exact safe next steps.
5. Before finishing, check that memory is consistent with actual code and Git state. If it cannot be checked, clearly label the uncertainty.

Do not make a memory entry that implies code is finished when it is only partially implemented, or that implies a test passed when it failed or was not run.

---

## 6. Exact synchronization workflow

The user controls when syncing happens. No scheduled or automatic GitHub sync.

A request such as “confirm today’s changes and sync to my repo” or “confirm changes and sync in my repo” starts a review process; it does not remove the final safety check.

1. Inspect local status and identify all relevant modified/untracked files, including project files and `Context Mem/`.
2. Check branch and commit state. Check for remote changes only as part of the explicitly requested sync process, using the safest non-destructive method available.
3. Review relevant code changes, memory updates, test/verification results, and conflict risks.
4. If merging or resolving conflicts would require a consequential guess, stop and ask. Never force-push, silently discard edits, or rewrite history to make the sync pass.
5. Present a clear summary of what would be synchronized, checks run and results, known failures/risks, branch/commit information, and whether the sync is safe to proceed.
6. Ask the user for explicit final confirmation before writing to GitHub. If confirmation is not given, leave the changes local and report that they were not pushed.
7. Only after confirmation, perform the requested safe synchronization operation. Verify its actual outcome. Record the timestamp and UTC offset, remote/repository identification, branch, relevant commit reference, and success/failure in `LOGBOOK.md`; update the sync snapshot in `MASTER.md`.
8. If the operation fails or cannot be verified, say so plainly and record it as failed/not verified, never successful.

Do not automatically run `git add`, `git commit`, `git push`, `git pull`, or another mutating or remote-contact operation outside the requested workflow. Never use `--force` or equivalent to overwrite remote history.

---

## 7. Memory accuracy and conflict policy

When project memory, code, test results, and Git state disagree:

- Verify against the strongest available evidence.
- Prefer verified current project evidence over stale status notes.
- Correct current status in `MASTER.md` and pending work in `TODO.md` as appropriate.
- Preserve historical entries in `LOGBOOK.md`; append a correction/context note instead of silently rewriting history.
- Mark facts as verified, assumed, unknown, or not tested where the distinction matters.
- Ask the user before consequential choices that cannot be safely resolved from available evidence.
- Never represent an inference as a fact, or a planned operation as a completed operation.

Keep documentation compact but complete enough to safely resume work. Avoid duplicated information, speculative architecture, long copies of source code, and unnecessary documentation files.

---

## 8. Required final report after the implementation pass

After organizing all clearly identified existing projects and preparing the local template where safe, provide a report in plain language. Include:

1. The projects identified and the local path for each.
2. For each project, which `Context Mem/` files were created or updated.
3. Existing memory/instruction files that were consolidated, retained as exceptions, or left untouched, and why.
4. Verification performed and results; clearly note what was not tested or could not be verified.
5. The local template folder path, or why it could not safely be placed.
6. Any ambiguous folders or unresolved conflicts requiring the user's decision.
7. An explicit remote status: **No GitHub repository was changed and nothing was pushed** during this local preparation pass.
8. A short next-step guide for using the setup with Antigravity and other agents.

Do not say the setup is fully complete for every project if any projects were skipped or left unresolved. Give a truthful, project-by-project status.
