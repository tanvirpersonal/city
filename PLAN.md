# PLAN.md — Master Roadmap & Live Progress

> **AI: work on the FIRST unchecked item. Update this file after every file you push.**
> Markers: `[ ]` not started · `[~]` in progress (note what is left) · `[x]` done+pushed+builds · `[!]` blocked
> If this file and the file system disagree, trust the file system and fix this file.

**Current phase:** Phase 2 — Rendering (started 2026-11-26; Phase 1 foundation complete, 11/11 verified)
**Last updated by:** Claude, 2026-11-25
**Overall progress:** 24 / 96 items verified (25%), none in progress — Phase 0: 13/13 · Phase 1: 11/11 · Phases 2–11: 0/72

**Open notes for the owner / next AI:**
- `package-lock.json` is committed and verified (`npm ci` + `npm run build` pass on a fresh clone), so the deploy workflow uses `npm ci`.
- Vite copies the repository `assets/` directory to the deployed site root (`publicDir: "assets"`); runtime fetch paths are relative to that copied root, while owners continue placing source files under `assets/`.
- GitHub Pages deployment is confirmed: workflow run #17 completed successfully, including `npm ci`, `npm run build`, artifact upload, and Pages deploy.
- The typed Event Bus is verified by workflow run #26: `npm ci` and `npm run build` passed after the complete event system and public API were committed.
- All remaining Phase 1 systems are integrated into `src/main.ts`; run #89 passed `npm ci`, `npm run build`, artifact upload, and Pages deployment. A reported browser `Illegal invocation` in the config loader was fixed by binding native fetch to `globalThis`; run #93 then passed build and deployment.
- `docs/ARCHITECTURE.md` was updated to match the shipped typed Event Bus, Service Registry, validated Config Loader, Asset Manager fallback contract, and diagnostics overlay.
- **Phase 1 audit (2026-11-25, in progress):** bugs found in the Phase 1 code are fixed one per commit (`fix:` commits on `main` after `c92a9e8`). Planned order: demo cube pitch snap (done in this commit) · event bus stale unsubscribe after `clear()` · core phase dispatch skipping a handler after an unsubscribe · ECS stale system unregister handle · ECS query base store chosen once · config/asset default base URL vs D-013 · `%2e` path hardening · input blur dropping release edges · docs (`DECISIONS.md` literal `\n`, README status, STRUCTURE markers) · JSON `version` fields · page restore from the back/forward cache. The next AI should check `git log` and finish any item that has no commit yet.

---

## Phase 0 — Planning files (no engine code yet)

- [x] `AI_RULES.md` — mandatory AI rules
- [x] `CLAUDE.md` — pointer to rules
- [x] `README.md` — overview and repo map
- [x] `PLAN.md` — this file
- [x] `ASSETS.md` — assets needed, paste paths, status
- [x] `docs/DECISIONS.md` — decision log (tech stack choice recorded here)
- [x] `docs/TECH_STACK.md` — libraries and reasons
- [x] `docs/ARCHITECTURE.md` — layers, ECS, event bus, service registry, game loop
- [x] `docs/STRUCTURE.md` — folder layout and naming
- [x] `docs/RENDERING.md` — Unreal-type graphics plan
- [x] `docs/PHYSICS.md` — physics plan
- [x] `docs/OPEN_WORLD.md` — streaming, roads, traffic, pedestrians, missions
- [x] `docs/EDITOR.md` — in-engine editor plan

## Phase 1 — Foundation

- [x] Project setup: `package.json`, `package-lock.json`, `tsconfig.json` (strict), `vite.config.ts`, `index.html`, `.gitignore` (+ placeholder `src/main.ts`; `npm ci` and `npm run build` verified on a fresh clone)
- [x] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) — verified by successful workflow run #17; build, artifact upload, and Pages deploy all completed.
- [x] `src/engine/core/` — engine bootstrap, fixed-timestep game loop, time (`createEngine()`, phase hooks via `engine.on(phase, fn)`, 60 Hz fixed step with spiral cap; `npm run build` passes; loop behavior checked with a throwaway test, real tests come in Phase 11)
- [x] `src/engine/ecs/` — `types.ts` and `ecs-system.ts` provide typed component keys, entity/component storage, live smallest-store AND queries (including queries created before components exist), and registration into core engine phases; `index.ts` exposes the public API. Verified by GitHub Actions run #17: `npm ci`, `npm run build`, Pages artifact upload, and deployment all succeeded.
- [x] `src/engine/events/` — typed event-map and bus contract; subscribe, once, emit, clear, listener counts, and mutation-safe snapshot delivery; public API exported from `index.ts`. Verified by successful GitHub Actions run #26 (`npm ci` + `npm run build`).
- [x] `src/engine/services/` — typed service-map and registry; duplicate-safe registration, get/require/has/unregister/clear, and identity-safe cleanup handles; public API exported and registered in `src/main.ts`. Verified by run #88 (`npm ci` + `npm run build`).
- [x] `src/engine/config/` — validated JSON loader with safe relative paths, in-flight deduplication, retry after failures, and cache invalidation; startup binds native browser `fetch` to `globalThis` to avoid `Illegal invocation`. Verified after the fix by successful run #93 (`npm ci`, `npm run build`, Pages artifact upload, and deploy).
- [x] `src/engine/assets/` — generic cached asset manager with safe paths, deduplicated loads, one-time missing-asset warnings, placeholder fallback, and cache invalidation; public API is registered in the runtime service registry. Verified by run #88 (`npm ci` + `npm run build`).
- [x] `src/engine/input/` — keyboard, mouse, and gamepad bindings with action maps and press/release transitions; manager is polled from the engine `input` phase, and Space is bound to the demo spin toggle. Transient presses/releases and mouse deltas accumulate across multiple fixed steps using reusable sets; the main bootstrap clears them after render consumers. Verified by run #88 (`npm ci` + `npm run build`).
- [x] `src/engine/debug/` — DOM stats/error/log overlay with FPS and frame-time sampling, global error/rejection reporting, and bounded log history; created by the browser bootstrap and registered as a service. Verified by run #88 (`npm ci` + `npm run build`).
- [x] Hello-engine demo scene — data-driven canvas cube renderer loaded from `assets/data/demo/hello-engine.json`; integrated into the engine `render` phase with Space pause/resume and the diagnostics FPS overlay. Verified by run #88 (`npm ci` + `npm run build`).

## Phase 2 — Rendering (Unreal-type look)

- [~] Renderer wrapper (WebGPU first, WebGL2 fallback) in `src/engine/render/` — split into small steps (2026-11-26); mark the parent `[x]` only when 2e is done:
  - [x] 2a Add the `three` dependency (`package.json` + `package-lock.json`) and note the install in `docs/TECH_STACK.md` — `three` 0.187 + `@types/three` 0.187 (dev); `npm run build` passes
  - [x] 2b `render/types.ts` (backend, quality preset, renderer API types) — plus the `render/index.ts` type exports; the folder is not imported by `main.ts` until 2e
  - [x] 2c Quality preset JSON: `assets/data/quality/{low,medium,high,ultra}.json` (values from `docs/RENDERING.md` §9; DOF and motion blur are `false` in every preset until those passes exist) + `render/quality.ts` validator and loader
  - [x] 2d `render/render-system.ts` + `render/index.ts`: backend selection with fallback log, resize, frame render with `alpha`, draw/triangle stats, dispose — type-checks; not yet imported by `main.ts` (that is 2e), so it is not yet run in a browser
  - [x] 2e Wire into `src/main.ts` (engine `render` phase, `renderer` service, backend + quality logged to the debug overlay) — the renderer draws a spinning self-test cube on its own inset canvas (bottom-right) so the Phase 1 demo keeps running; `npm run build` passes; docs needed no change. Not yet checked in a real browser: confirm on the deployed Pages site that the inset cube spins and the log says which backend is active
  - [ ] 2f Debug overlay shows draw calls and triangles from `renderer.stats` (needs a small stats hook in `src/engine/debug/`)
- [ ] PBR material system (albedo, normal, roughness, metal, AO, emissive)
- [ ] Procedural placeholder textures
- [ ] Lighting: sun/moon directional, point/spot lights, image-based lighting (HDR sky)
- [ ] Cascaded shadow maps
- [ ] Day/night cycle and sky (atmosphere, sun, stars, clouds)
- [ ] Post-processing stack: tone mapping, bloom, SSAO, SSR, TAA/FXAA, color grading, DOF, motion blur
- [ ] Fog and volumetric light shafts
- [ ] Weather: rain, wet-surface shader, wind, lightning
- [ ] Instancing and batching for repeated meshes
- [ ] LOD system and frustum/occlusion culling
- [ ] Decals (bullet holes, skid marks, blood)
- [ ] Particle system (smoke, fire, sparks, dust)
- [ ] Quality presets (low / medium / high / ultra)

## Phase 3 — Physics

- [ ] Physics wrapper in `src/engine/physics/` (Rapier WASM)
- [ ] Rigid bodies, colliders, materials (friction/restitution)
- [ ] Fixed-step sync with rendering and interpolation
- [ ] Raycasts, shape casts, trigger volumes, collision events
- [ ] Character controller (capsule, slopes, stairs, jumping)
- [ ] Ragdoll
- [ ] Vehicle physics: suspension, tires, engine/gearbox, drift, handbrake (see `docs/PHYSICS.md`)
- [ ] Destruction-ready props (breakable, knockable: lamp posts, fences, bins)
- [ ] Physics debug draw
- [ ] Physics config tuning files in `assets/data/physics/`

## Phase 4 — World & Streaming

- [ ] World grid and chunk streaming (load/unload by camera distance)
- [ ] Terrain (heightmap, splat-map painting)
- [ ] Road network graph (nodes, lanes, intersections)
- [ ] Procedural road mesh generation
- [ ] Building system (modular facades, procedural city blocks)
- [ ] Interior streaming (enterable buildings)
- [ ] Water (ocean/river shader, buoyancy)
- [ ] Props scattering (trees, lamps, signs, bins)
- [ ] World save/load format (JSON + binary chunks)

## Phase 5 — Characters & Animation

- [ ] Skeletal animation (GLB), animation state machine, blending
- [ ] Player character (walk, run, sprint, jump, climb, cover, swim)
- [ ] Third-person camera (collision-aware) and aim camera
- [ ] Enter/exit vehicle
- [ ] Inverse kinematics (feet, look-at, aim)

## Phase 6 — Vehicles

- [ ] Vehicle definition format (JSON: mass, engine, wheels, handling)
- [ ] Car, motorbike, truck, bicycle handling models
- [ ] Damage model (deformation, broken parts, smoke, fire)
- [ ] Lights, indicators, horn, radio hooks
- [ ] Vehicle camera system

## Phase 7 — AI & Simulation

- [ ] Navigation (pedestrian navmesh/sidewalk graph)
- [ ] Traffic AI (lane following, intersections, lights, overtaking, avoidance)
- [ ] Pedestrian crowd AI (walk, flee, react, idle activities)
- [ ] Wanted/police system
- [ ] NPC combat AI
- [ ] Population density manager (spawn/despawn around player)

## Phase 8 — Gameplay Systems

- [ ] Weapons (hitscan + projectile), ammo, recoil, hit reactions
- [ ] Health, damage, death/respawn
- [ ] Inventory, money, phone/menu UI
- [ ] Mission/script system (data-driven, objectives, triggers, cutscene hooks)
- [ ] Save/load game state
- [ ] Audio: 3D sound, engine sounds, ambience, music/radio
- [ ] HUD (minimap, wanted stars, health, weapon wheel)

## Phase 9 — In-Engine Editor (see `docs/EDITOR.md`)

- [ ] Editor shell: dockable panels, viewport, play/stop toggle
- [ ] Scene hierarchy and inspector
- [ ] Transform gizmos (move/rotate/scale), snapping, undo/redo
- [ ] Asset browser with drag-drop
- [ ] Terrain and road painting tools
- [ ] Material editor
- [ ] Mission/script editor
- [ ] Prefab system
- [ ] Project save/load and export to a playable build

## Phase 10 — First Game (proves the engine)

- [ ] Sample city map built *in the editor*
- [ ] Sample missions (drive, chase, shoot)
- [ ] Playable demo published on GitHub Pages

## Phase 11 — Polish

- [ ] Performance pass (profiling, pooling, worker threads)
- [ ] Mobile/touch controls
- [ ] Tests for core systems
- [ ] Public documentation and API reference

---

## How a new AI should work (summary)

1. Read `AI_RULES.md`.
2. Take the first unchecked item above.
3. Read the matching `docs/*.md`.
4. Do it in small steps; commit + push after every file.
5. Update this checklist and `ASSETS.md`.
6. Tell the owner what was done and which assets are needed.
