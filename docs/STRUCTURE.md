# STRUCTURE.md — Folder Layout and Naming

> If you add, move, or rename a folder, update this file in the same commit (see `AI_RULES.md` §8).
> Folders marked *(planned)* do not exist yet; they are created in the phase noted in `PLAN.md`.

```
city/
├── AI_RULES.md              mandatory AI rules (read first)
├── CLAUDE.md                pointer to AI_RULES.md
├── README.md                overview
├── PLAN.md                  roadmap + live checklist
├── ASSETS.md                asset wishlist, paste paths, status
├── docs/                    design docs (this folder)
│
├── package.json             (planned, Phase 1)
├── tsconfig.json            (planned, Phase 1) strict mode
├── vite.config.ts           (planned, Phase 1)
├── index.html               (planned, Phase 1) entry page
├── .github/workflows/       (planned, Phase 1) GitHub Pages deploy
│
├── src/
│   ├── engine/              reusable engine — NEVER imports editor/ or games/
│   │   ├── core/            bootstrap, game loop, time
│   │   ├── ecs/             entities, components, systems
│   │   │   └── components/  one file per component type
│   │   ├── events/          typed event bus
│   │   ├── services/        service registry
│   │   ├── config/          config loader and defaults
│   │   ├── assets/          asset manager + placeholder generators
│   │   ├── input/           input devices and action mapping
│   │   ├── render/          renderer, materials, lights, shadows, post, particles
│   │   │   ├── materials/
│   │   │   ├── lighting/
│   │   │   ├── post/        post-processing passes
│   │   │   └── sky/         sky, weather, day/night
│   │   ├── physics/         world, bodies, character, vehicles, ragdoll
│   │   ├── world/           streaming, terrain, roads, buildings, water
│   │   ├── anim/            skeletal animation, state machines, IK
│   │   ├── ai/              navigation, traffic, pedestrians, police
│   │   ├── gameplay/        weapons, health, wanted, missions, inventory
│   │   ├── audio/           3D audio
│   │   ├── ui/              HUD and menus
│   │   └── debug/           overlays and console
│   │
│   ├── editor/              in-engine editor (imports engine only)
│   │   ├── shell/           layout, panels, play/stop
│   │   ├── panels/          hierarchy, inspector, asset browser, console
│   │   ├── tools/           gizmos, terrain/road painting
│   │   └── commands/        undo/redo command objects
│   │
│   ├── games/               specific games (import editor/engine)
│   │   └── sample-city/     first game that proves the engine
│   │
│   └── main.ts              entry point (picks editor or game mode)
│
├── assets/                  files the OWNER pastes (see ASSETS.md)
│   ├── textures/            PBR folders by category (roads, buildings, terrain, props, ...)
│   ├── hdri/                sky HDRIs
│   ├── models/              .glb (characters, vehicles, props, buildings, weapons)
│   ├── audio/               .ogg (vehicles, characters, weapons, ambience, music)
│   └── data/                JSON written by the AI (physics, vehicles, materials, missions)
│
└── tests/                   (planned, Phase 11)
```

## Every system folder contains

| File | Purpose |
|------|---------|
| `index.ts` | Public API. The ONLY file other systems may import |
| `types.ts` | Shared types for this system |
| `<name>-system.ts` | The logic |
| other small files | Helpers, one concern per file, under ~300 lines |

Import example (allowed): `import { createPhysicsWorld } from "../physics";`
Import example (forbidden): `import { step } from "../physics/internal/stepper";`

## Naming

- Files and folders: `kebab-case` (`vehicle-system.ts`, `road-network.ts`).
- Classes/types/interfaces: `PascalCase`. Functions/variables: `camelCase`. Constants: `UPPER_SNAKE`.
- Component types are nouns (`Transform`, `Health`). Systems end with `System` (`VehicleSystem`).
- Events are `domain:action` strings (`vehicle:crashed`, `player:died`).
- JSON data files: `kebab-case.json`, with a `version` field.
- Asset paths always lowercase with hyphens; no spaces.

## Path aliases (set up in Phase 1)

`@engine/*` → `src/engine/*`, `@editor/*` → `src/editor/*`, `@games/*` → `src/games/*`.
Aliases must only point at a system's `index.ts` when used across systems.

## Git hygiene

- `.gitignore` must exclude `node_modules/`, `dist/`, `.DS_Store`, `*.log`, `.env`.
- Do not commit files larger than 25 MB. Compress textures/models instead.
