# TECH_STACK.md — Libraries and Why

> Rule: do not add a dependency without adding it here with the reason (see `AI_RULES.md` §4.8).
> Decisions behind these choices are in `docs/DECISIONS.md`.

## Core

| Package | Purpose | Why |
|---------|---------|-----|
| `typescript` (strict) | Language | Type safety across many AI sessions |
| `vite` | Dev server and bundler | Fast, simple static output for GitHub Pages |
| `three` | Rendering (WebGPU renderer + WebGL2 fallback) | PBR, scene graph, loaders, huge ecosystem |
| `@dimforge/rapier3d-compat` | Physics (WASM) | Fast rigid bodies, colliders, character and vehicle controllers |

## Planned (add when the phase starts)

| Package | Phase | Purpose |
|---------|-------|---------|
| `bitecs` or own minimal ECS | 1 | Entity-component-system. Prefer our own small ECS in `src/engine/ecs/` unless profiling says otherwise |
| `postprocessing` or own passes | 2 | Bloom, SSAO, TAA, color grading. Prefer own passes for full control |
| `meshoptimizer` (via Three.js addons) | 2 | Mesh compression |
| KTX2 / Basis loader (Three.js addons) | 2 | GPU-compressed textures |
| `howler` or Web Audio API directly | 8 | 3D audio. Prefer raw Web Audio to avoid a dependency |
| `vitest` | 11 | Unit tests |
| `eslint` + `prettier` | 1 | Consistent style |

## Not used (and why)

- **Babylon.js / PlayCanvas** — would replace our own engine layer; we want our own structure.
- **Cannon.js / Ammo.js** — slower or heavier than Rapier.
- **React / Vue for the editor** — keep the editor in plain TypeScript + DOM to avoid framework lock-in
  (revisit in Phase 9 if the UI becomes too large; record the decision in `DECISIONS.md`).

## Browser support targets

- Primary: current Chrome/Edge (WebGPU).
- Fallback: current Firefox/Safari (WebGL2).
- Mobile: Phase 11, touch controls + lower quality preset.

## Build and scripts (will exist after Phase 1 setup)

```
npm install        install dependencies
npm run dev        dev server with hot reload
npm run build      type-check + production build (must pass before marking [x])
npm run preview    serve the production build locally
```

## Deployment

GitHub Pages through `.github/workflows/deploy.yml` (Phase 1). The `dist/` folder is never committed.
