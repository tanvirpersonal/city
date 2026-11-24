# AI RULES — READ THIS FIRST, EVERY SESSION

This repo is a **game engine for open-world games like GTA** (RAGE-style: huge streamed city,
vehicles, pedestrians, traffic, missions) with **Unreal-Engine-type graphics and physics**,
but with an **easy, readable structure**. Games are built *inside* the engine, using its editor.

Any AI (Claude or other) working here MUST follow every rule below. No exceptions.
The human owner works on a limited usage plan. Sessions get cut off without warning.
**The repo itself is the memory.** If it is not written in the repo, the next AI does not know it.

---

## 0. Session start checklist (do this before anything else)

1. Read this file fully.
2. Read `PLAN.md` — find the first unchecked item. That is your task.
3. Read `ASSETS.md` — see which assets the owner has / has not provided.
4. Read the one doc in `docs/` that matches your task (e.g. `docs/PHYSICS.md` for physics work).
5. Run `ls -R` (skip `node_modules`) and **trust the file system over the checklist** if they disagree,
   then fix the checklist.
6. Do NOT start a different task than the first unchecked item unless the owner says so.

## 1. Push rules (most important)

1. **Push after EVERY file you create or change.** One file (or one tight logical change) = one commit = one push.
   Never batch up work. A usage limit can hit at any moment and unpushed work is lost.
2. Commit command pattern:
   `git add <file> && git commit -m "<type>: <short message>" && git push origin main`
3. Commit message types: `plan:`, `docs:`, `feat:`, `fix:`, `refactor:`, `assets:`, `chore:`.
4. If a push fails, fix it and push again before doing anything else. Never move on with unpushed work.
5. Never force-push. Never rewrite history. Never delete the owner's files.
6. Work on `main` unless the owner asks for a branch.

## 2. Small-step rules

1. Do **one small thing at a time**: change a little, commit, push, then continue.
2. Fix bugs **one at a time**: fix → push → next bug.
3. Prefer many small files (under ~300 lines) over one giant file. Split early.
4. Do not start big refactors. Do not rewrite working code "to make it nicer".
5. If a task is too big for the remaining session, split it into smaller items in `PLAN.md`
   and push that split before starting.

## 3. Keep the tracking files up to date (mandatory)

After every file you create or finish:

1. Update `PLAN.md`: change `[ ]` to `[x]` for the item and, if useful, add the file path.
   Use `[~]` for in-progress / partial. Add a one-line note on what is left.
2. Update `ASSETS.md` if you used, need, or no longer need an asset.
3. Update `docs/*.md` if you changed a design decision. Docs must always match the code.
4. Push these tracking updates in the same commit as the work, or immediately after.

Status markers used everywhere:

| Marker | Meaning |
|--------|---------|
| `[ ]`  | not started |
| `[~]`  | in progress / partially done (say what is left) |
| `[x]`  | done, pushed, and working |
| `[!]`  | blocked (say why, and who must act) |

Never mark `[x]` for something that is not pushed or does not run.

## 3b. Definition of done

An item is `[x]` only if: the code exists on `main`, it builds (`npm run build`), it has no
TypeScript errors, it is wired into the engine (not an orphan file), and `PLAN.md` says so.

## 4. Architecture rules (do not break these)

1. **TypeScript only**, strict mode. No `any` unless commented with the reason.
2. The engine is **modular**: each system lives in its own folder under `src/engine/<system>/`
   and exposes a small public API through that folder's `index.ts`. Other systems import ONLY from
   that `index.ts`, never from deep internal files.
3. Engine code (`src/engine/`) never imports game code (`src/games/`). Dependency direction:
   `games → editor → engine`. The engine never imports the editor.
4. Use **ECS (entity-component-system)** for game objects. Do not create ad-hoc global state.
   Systems communicate through components, the event bus, or the service registry — not by
   reaching into each other.
5. All tunable numbers live in data/config files (`src/engine/config/` or JSON in `assets/data/`),
   never as magic numbers buried in logic.
6. Everything must work **in the browser** (static hosting, GitHub Pages). No server required.
7. Public APIs get a short doc comment. Complex algorithms get a link/name of the technique used.
8. Do not add a new dependency without writing it in `docs/TECH_STACK.md` with the reason.
9. Performance is a feature: no per-frame allocations in hot loops, use object pools, use
   instancing for repeated meshes. See `docs/RENDERING.md`.

## 5. Asset rules

1. The AI **never invents or downloads random assets**. Assets are listed in `ASSETS.md` with an exact
   target path. The owner pastes files into those paths.
2. Until a real asset exists, use a **procedural placeholder** (generated geometry / generated
   texture / flat color material) so the engine still runs. Placeholders must be swappable by just
   dropping the real file at the documented path — **no code change** needed.
3. Asset loading always goes through the asset manager (`src/engine/assets/`). If a file is
   missing, fall back to the placeholder and log one warning. Never crash.
4. Only use assets the owner has the right to use. Note the license in `ASSETS.md`.
5. When you need a new asset, **add a row to `ASSETS.md`** (name, type, size/format, exact path,
   priority, status) and push it. Tell the owner in your reply.

## 6. Code style

1. Names: `PascalCase` classes/types, `camelCase` functions/variables, `UPPER_SNAKE` constants,
   `kebab-case` file names.
2. No dead code, no commented-out blocks, no `TODO` without an item in `PLAN.md`.
3. Prefer plain functions and small classes. No clever metaprogramming.
4. Every system must have: `index.ts` (API), `<name>-system.ts` (logic), `types.ts` (types).
5. Errors: fail loudly in development (`console.error` + overlay), degrade gracefully in release.

## 7. Communication rules for the AI

1. At the end of each reply tell the owner, briefly: what was done, what was pushed, what is next,
   and any assets needed.
2. Never claim something works unless you ran it (`npm run build` at minimum).
3. If you are unsure about a design choice, check `docs/DECISIONS.md` first. If it is not there,
   choose the simplest option, and **record the decision there** (date, choice, reason).
4. If the owner's request conflicts with these rules, follow the owner, then update these rules
   and `docs/DECISIONS.md` so the next AI knows.
5. Never leave the repo in a broken state. If the build breaks, fixing it is the next task.

## 8. Things that are forbidden

- Do not copy code or assets from Rockstar/RAGE, Unreal, or any proprietary engine. We build our
  own implementation of the *techniques*. Original names, original code.
- Do not commit `node_modules/`, build output (`dist/`), secrets, or huge binaries over 25 MB
  (use compressed formats, see `ASSETS.md`).
- Do not rename or move folders without updating `docs/STRUCTURE.md` and every import in the same commit.
- Do not skip `PLAN.md` updates "to save time".

---

*If these rules are changed, change them here, push, and note it in `docs/DECISIONS.md`.*
