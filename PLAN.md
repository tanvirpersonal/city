# PLAN.md — Master Roadmap & Live Progress

> **AI: work on the FIRST unchecked item. Update this file after every file you push.**
> Markers: `[ ]` not started · `[~]` in progress (note what is left) · `[x]` done+pushed+builds · `[!]` blocked
> If this file and the file system disagree, trust the file system and fix this file.

**Current phase:** Phase 1 — Foundation (1 of 11 items done, 1 in progress; next: `src/engine/core/` once the deploy workflow is confirmed)
**Last updated by:** Claude, 2026-11-25
**Overall progress:** 14 / 96 items done (~15%), 1 in progress — Phase 0: 13/13 · Phase 1: 1/11 · Phases 2–11: 0/72

**Open notes for the owner / next AI:**
- `package-lock.json` is committed and verified (`npm ci` + `npm run build` pass on a fresh clone), so the deploy workflow uses `npm ci`.
- `src/main.ts` is a minimal placeholder so the build passes; the engine bootstrap replaces it in the `core/` item.
- **Owner action needed for deploy:** in the GitHub repo go to Settings → Pages → Source and choose **GitHub Actions**. Then check the Actions tab for a green "Deploy to GitHub Pages" run. The AI cannot see Actions runs, so this has not been confirmed.

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
- [~] GitHub Pages deploy workflow (`.github/workflows/deploy.yml`) — pushed, valid YAML, same `npm ci` + `npm run build` steps verified locally. Left: owner sets Pages source to GitHub Actions and confirms the first run is green, then mark `[x]`.
- [ ] `src/engine/core/` — engine bootstrap, fixed-timestep game loop, time
- [ ] `src/engine/ecs/` — entities, components, systems, queries
- [ ] `src/engine/events/` — typed event bus
- [ ] `src/engine/services/` — service registry
- [ ] `src/engine/config/` — config loader (JSON data-driven)
- [ ] `src/engine/assets/` — asset manager with placeholder fallback
- [ ] `src/engine/input/` — keyboard, mouse, gamepad, action mapping
- [ ] `src/engine/debug/` — stats overlay, error overlay, console
- [ ] Hello-engine demo scene: spinning cube, FPS counter

## Phase 2 — Rendering (Unreal-type look)

- [ ] Renderer wrapper (WebGPU first, WebGL2 fallback) in `src/engine/render/`
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
