# City Engine

A browser-based **open-world game engine** for building GTA-style games (RAGE-like: streamed city,
vehicles, pedestrians, traffic, missions) with **Unreal-type graphics and physics** — but with a
simple, readable structure. Games are built *inside* the engine with its own editor.

> **AI agents: read [`AI_RULES.md`](AI_RULES.md) first, then [`PLAN.md`](PLAN.md).**

## Goals

- Unreal-style look: PBR materials, dynamic lighting and shadows, post-processing, weather, day/night.
- Real physics: rigid bodies, vehicles with suspension, ragdolls, destruction-ready.
- Open-world features built in: chunk streaming, road network, traffic, pedestrians, interiors, missions.
- Easy structure: modular systems, ECS, data-driven config, small files.
- In-engine editor: place objects, paint terrain/roads, edit materials, script missions, hit Play.
- Runs in the browser on static hosting (GitHub Pages). No server needed.

## Repo map

| Path | What it is |
|------|-----------|
| `AI_RULES.md` | Mandatory rules for any AI working here |
| `PLAN.md` | Master roadmap and live progress checklist |
| `ASSETS.md` | Textures/models/audio needed, where to paste them, status |
| `docs/ARCHITECTURE.md` | How the engine is layered and how systems talk |
| `docs/TECH_STACK.md` | Chosen libraries and why |
| `docs/STRUCTURE.md` | Folder layout and file naming |
| `docs/RENDERING.md` | Graphics plan (Unreal-type look) |
| `docs/PHYSICS.md` | Physics plan (world, vehicles, ragdoll) |
| `docs/OPEN_WORLD.md` | GTA-specific systems (streaming, traffic, AI, missions) |
| `docs/EDITOR.md` | The in-engine editor |
| `docs/DECISIONS.md` | Decision log |

## Status

See the checkboxes in [`PLAN.md`](PLAN.md). Currently in **Phase 0: planning**.
