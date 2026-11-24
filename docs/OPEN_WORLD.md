# OPEN_WORLD.md — Streaming, Roads, Traffic, Pedestrians, Missions

> The GTA-style systems. Code lives in `src/engine/world/`, `ai/` and `gameplay/` (see `docs/STRUCTURE.md`).
> Roadmap items: `PLAN.md` Phases 4, 7 and 8. Open question OQ-3 (world save format) is decided in Phase 4.

## 1. World grid and chunk streaming

- The world is a grid of square **chunks** (default 128 m, set in `assets/data/world/world.json`).
- Each chunk owns: terrain tile, road mesh, building meshes, props, colliders, nav data, and its list of spawn points.
- A chunk has states: `unloaded → loading → active → unloading`. Only the streaming system changes state.
- The streamer keeps chunks within the view distance of the camera **active**, loads one ring ahead, and unloads one ring behind (hysteresis avoids thrashing at the edge).
- Loading is time-sliced: at most a few ms of chunk work per frame; heavy generation is written as pure functions so it can move to a worker later (see `docs/ARCHITECTURE.md` §8).
- Chunk creation and destruction also creates and destroys its physics bodies (see `docs/PHYSICS.md` §8).
- View distance comes from the quality preset (`docs/RENDERING.md` §9).
- Distant scenery uses simplified far-LOD chunks (boxes and flat terrain) so the horizon is never empty.

## 2. Terrain

- Heightmap per chunk with splat-map weights for materials (grass, dirt, sand, rock, ...).
- Roads flatten the terrain under them; the road system writes a height/blend mask the terrain reads.
- Edge heights match between neighbouring chunks to avoid cracks.

## 3. Road network

A graph, stored as data and used by rendering, traffic and navigation:

- **Node:** position, type (`junction`, `endpoint`, `curve`).
- **Edge (road segment):** from/to node, spline, lane count per direction, lane width, speed limit, sidewalk widths, surface material.
- **Lane:** one-way path derived from the edge; links to the lanes it connects to at the next junction.
- **Junction:** list of allowed turns, signal groups or stop/yield rules.

The mesh generator builds road surface, markings (decals from `assets/textures/decals/road-markings.png`), curbs and sidewalks from this graph. Roads are edited in the editor (`docs/EDITOR.md`) and saved as part of the world.

## 4. Buildings and interiors

- **Procedural blocks:** a city block is a polygon between roads; buildings are generated from modular facade pieces (ground floor, repeated floors, roof) using materials from `ASSETS.md`.
- Hand-placed buildings (`.glb`) can replace generated ones by id.
- **Interiors:** enterable buildings stream their interior as a separate cell when the player nears the door; exterior is simplified while inside. Interior cells have their own lighting and nav data.

## 5. Water and props

- Water: ocean/river surface shader, buoyancy forces applied to bodies below the water plane.
- Props: lamps, signs, bins, benches, trees scattered by rules (along sidewalks, in parks) and by hand; static props are instanced per chunk.

## 6. World save format (resolves OQ-3 when Phase 4 starts)

Proposed default, to be confirmed in `docs/DECISIONS.md` when implemented:

- `world.json` — version, chunk size, road graph, prefab placements, global settings (JSON, human-readable, diff-friendly).
- Per-chunk binary files for dense data (heightmap, splat map), referenced from `world.json`.
- Every file has a `version` field plus a migration function (see `docs/ARCHITECTURE.md` §7).

## 7. Navigation

- **Vehicles** follow lanes of the road graph.
- **Pedestrians** use a sidewalk/crossing graph generated from the same road data, plus a navmesh for open areas (parks, plazas, interiors).
- Nav data is generated per chunk and stored with it; it is created and destroyed with the chunk.

## 8. Traffic AI

- Each AI vehicle is an ECS entity with `Vehicle`, `TrafficAgent` and `RigidBody` components. The agent holds: current lane, target speed, route, and state.
- Behaviors: follow lane, keep following distance, stop at lights/stop lines, give way at junctions, change lane to overtake, avoid obstacles using raycasts, recover when stuck.
- Traffic lights: junction signal groups on timers, data-driven.
- Routing: A* over the lane graph; random destinations for ambient traffic, explicit routes for missions.
- Cars far from the player use a cheap kinematic simulation along the lane; they switch to full physics when they come near.

## 9. Pedestrian AI

- Pedestrians are ECS entities with `Pedestrian` (state, destination, personality) and a character controller.
- States: walk, idle (sit, phone, talk), cross at crossings, flee, panic, react to being hit, ragdoll (see `docs/PHYSICS.md` §5).
- They react to events (`physics:impact`, gunshots, `vehicle:crashed`) through the event bus, not by polling other systems.
- Crowd avoidance with simple local steering; no per-pedestrian pathfinding every frame.

## 10. Population manager

- Targets desired counts of vehicles and pedestrians per area from density maps (data) and the time of day.
- Spawns just outside the player's view and at the edge of the active area; despawns far away or behind the player.
- Objects come from pools; models and outfits are picked from the lists in `ASSETS.md` (placeholders if missing).

## 11. Police and wanted level

- Wanted level 0–5, raised by crime events (`player:crime`) and lowered by staying out of sight for a timer.
- Police response (cars, officers) scales with the level; units are normal traffic/pedestrian agents with a different goal.
- Search area, line-of-sight checks and cooldowns are in `assets/data/gameplay/wanted.json`.

## 12. NPC combat

- Simple state machine: idle, take cover, shoot, flank, flee, surrender.
- Uses the same weapon system as the player (`gameplay`); no special-case damage rules.

## 13. Missions and scripting

Missions are **data** first, code second:

- A mission is JSON in `assets/data/missions/<name>.json`: `version`, title, `objectives[]`, `triggers[]`, `actors[]` (spawns), `onFail`, `onComplete`, rewards.
- Objective types (initial set): `goTo`, `getInVehicle`, `drive`, `chase`, `eliminate`, `collect`, `wait`, `custom`.
- A small state machine runs the mission; each state can spawn/despawn entities, show messages, set waypoints and start cutscene hooks.
- Triggers use physics trigger volumes and emit/consume events (`trigger:enter`, `mission:objective-complete`).
- Custom logic is a small typed TypeScript function registered by name in `src/games/<game>/`, so the engine never imports game code (AI_RULES §4.3).
- Mission progress is saved with the game state (Phase 8).

## 14. HUD and map

- Minimap and full map render from road graph data, not screenshots.
- HUD elements (health, wanted stars, weapon wheel, mission text) are UI-system components bound to events and components.

## 15. Performance rules

- Everything that spawns uses pools.
- Per-frame budgets for streaming, AI and spawning are fixed in config and shown in the debug overlay.
- AI updates are spread across frames (e.g. 1/4 of agents per fixed step) except for agents the player is directly interacting with.

## 16. Open questions

- Navmesh generation: own implementation vs a library (record in `docs/TECH_STACK.md` if one is added).
- How far interiors share lighting data with the exterior.
