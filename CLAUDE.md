# CLAUDE.md

**Stop. Read `AI_RULES.md` first, then `PLAN.md`.** They are the source of truth for this repo.

Quick reminders (full rules are in `AI_RULES.md`):

- Push after **every** file you create or change (`git add <file> && git commit && git push origin main`).
- Work one small step at a time; fix bugs one at a time, pushing each fix.
- Update `PLAN.md` (and `ASSETS.md` if assets are involved) after every file. Never mark `[x]` unless pushed and building.
- Never invent assets. Use procedural placeholders and list needs in `ASSETS.md` with the exact paste path.
- Engine code never imports game code. Use only each system's `index.ts` API.
- Your first task is the first unchecked item in `PLAN.md`.
