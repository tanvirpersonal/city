# DECISIONS.md — Decision Log

> Every non-obvious choice is recorded here so no AI re-debates or silently reverses it.
> **To change a decision:** add a new entry that supersedes the old one (do not delete the old one).
> Format: ID, date, decision, reason, status.

| ID | Date | Decision | Reason | Status |
|----|------|----------|--------|--------|
| D-001 | 2026-11-25 | Engine runs in the **browser** (static hosting, GitHub Pages). | Owner works from GitHub + browser; no server or install needed; matches the owner's other projects. | Active |
| D-002 | 2026-11-25 | Language: **TypeScript (strict)**, bundler: **Vite**. | Type safety helps AI sessions avoid breaking each other's work; fast builds. | Active |
| D-003 | 2026-11-25 | Rendering: **Three.js** using its WebGPU renderer where available, **WebGL2 fallback**. | Mature, easy to read, large ecosystem, PBR built in; we add our own post-processing, shadows and streaming on top. | Active |
| D-004 | 2026-11-25 | Physics: **Rapier** (WASM, `@dimforge/rapier3d-compat`). | Fast, deterministic, has vehicle/character controllers and good browser support. | Active |
| D-005 | 2026-11-25 | Game objects use **ECS** (entity-component-system). | Scales to thousands of entities (traffic, pedestrians), keeps systems decoupled and easy to add. | Active |
| D-006 | 2026-11-25 | Engine is **modular**: one folder per system, one public `index.ts` each. | Lets any AI work on one system without reading the rest. | Active |
| D-007 | 2026-11-25 | Dependency direction: `games → editor → engine`. | Engine stays reusable for any game, not just one. | Active |
| D-008 | 2026-11-25 | Assets are **never invented by the AI**; owner pastes them into paths listed in `ASSETS.md`; procedural placeholders fill gaps. | Owner wants control over assets; engine must always run. | Active |
| D-009 | 2026-11-25 | Models in **glTF 2.0 (.glb)**, textures as PBR folders (`albedo/normal/roughness/...`). | Standard, supported everywhere, easy for the owner to source. | Active |
| D-010 | 2026-11-25 | "Unreal-type" means: PBR + dynamic lights + cascaded shadows + HDR + post-processing + good physics. We build our **own implementation** of these techniques; we do not copy proprietary engine code or assets. | Legal safety and an original engine. | Active |
| D-011 | 2026-11-25 | Fixed physics timestep (60 Hz) with render interpolation. | Stable vehicle physics regardless of frame rate. | Active |
| D-012 | 2026-11-25 | Work style: one file per commit, push every file, update `PLAN.md` after each. | Owner has a limited usage plan; sessions end abruptly. | Active |\n| D-013 | 2026-11-25 | Vite serves the repository `assets/` directory as its public directory; source paths stay under `assets/`, and deployed URLs resolve from the copied asset root. | Keeps owner-controlled asset paths while allowing static browser fetches on GitHub Pages without a copy plugin or server. | Active |

## Open questions (resolve by adding a decision above)

- OQ-1: Final choice of animation/IK approach (Three.js built-in vs custom). Decide in Phase 5.
- OQ-2: Worker threads for physics/AI. Decide in Phase 11 after profiling.
- OQ-3: Save format for worlds (JSON only vs JSON + binary chunks). Decide in Phase 4.
