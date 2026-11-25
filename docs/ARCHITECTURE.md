# ARCHITECTURE.md — How the Engine Fits Together

> Read this before touching more than one system. Folder layout is in `docs/STRUCTURE.md`.

## 1. Layers

```
┌──────────────────────────────────────────┐
│ games/   (a specific game: missions, map)│   depends on ↓
├──────────────────────────────────────────┤
│ editor/  (in-engine tools, play/stop)    │   depends on ↓
├──────────────────────────────────────────┤
│ engine/  (reusable systems, no game code)│   depends on nothing above
└──────────────────────────────────────────┘
```

Rules: `games → editor → engine`. The engine never imports the editor or a game.
Systems inside the engine import each other **only through the other system's `index.ts`**.

## 2. Engine systems (each a folder in `src/engine/`)

| System | Responsibility |
|--------|----------------|
| `core` | Bootstrap, game loop, time, lifecycle |
| `ecs` | Entities, components, systems, queries |
| `events` | Typed event bus |
| `services` | Service registry (lookup of systems by name) |
| `config` | Data-driven configuration loader |
| `assets` | Loading, caching, placeholder fallback |
| `input` | Keyboard, mouse, gamepad, touch, action mapping |
| `render` | Renderer, materials, lights, shadows, post-processing, particles |
| `physics` | World, bodies, character controller, vehicles, ragdoll |
| `world` | Chunk streaming, terrain, roads, buildings, water |
| `anim` | Skeletal animation, state machines, IK |
| `ai` | Navigation, traffic, pedestrians, police |
| `gameplay` | Weapons, health, wanted level, missions, inventory |
| `audio` | 3D audio, mixing |
| `ui` | HUD and menus |
| `debug` | Stats, overlays, console |

## 3. The game loop

Fixed-timestep simulation with interpolated rendering:

```
each frame:
  accumulate real time
  while accumulator >= FIXED_DT (1/60 s):
      input.poll()
      ecs.runSystems("fixedUpdate", FIXED_DT)   // AI, gameplay, physics step
      physics.step(FIXED_DT)
      physics.syncToEcs()
      accumulator -= FIXED_DT
  alpha = accumulator / FIXED_DT
  ecs.runSystems("update", dt)                  // animation, camera, audio
  render.draw(alpha)                            // interpolated transforms
```

System phases (run in this order): `input → fixedUpdate → physics → update → lateUpdate → render`.
Every system declares its phase and optional ordering (`runAfter`, `runBefore`).

## 4. ECS

- **Entity:** an integer id.
- **Component:** plain data, no behavior (`Transform`, `RigidBody`, `Vehicle`, `Health`, `Renderable`, ...).
- **System:** a function that runs each phase over entities with a given set of components.
- Components are registered in `src/engine/ecs/components/`. Each has a `type`, a default factory,
  and a serializer (needed by the editor and save/load).
- No behavior inside components. No system holds per-entity state outside components.

## 5. Communication between systems

Use exactly one of these, in this order of preference:

1. **Components** — write data to a component; the other system reads it next phase.
2. **Events** — `events.emit("vehicle:crashed", payload)` for one-off notifications. Each game/runtime defines its own event-map type and supplies it to `createEventBus<EventMap>()`; the reusable typed contract is in `src/engine/events/`.
3. **Services** — use `services.get("physics")` for optional lookup or `services.require("physics")` for a required dependency. The typed registry in `src/engine/services/` rejects duplicate names and supports explicit unregister/clear.

Never use globals, `window` properties, or reach into another system's internal files.

## 6. Data-driven design

- Vehicle handling, weapons, materials, missions, weather presets live in JSON under `assets/data/`.
- Systems load config through `config.load("data/vehicles/sedan.json", validator)` (paths are relative to the published asset root, so they start with `data/`); the loader deduplicates in-flight requests, caches validated results, and supports explicit cache invalidation.
- Each JSON consumer supplies a type guard / validator. Invalid JSON or a shape mismatch fails with a path-specific error before data reaches the system.
- Runtime engine settings are stored under `assets/data/engine/`; Vite publishes the repository `assets/` directory at the static site root.

## 6b. Placeholders and graceful failure

- `assets.load(key, path, loader, placeholder)` caches in-flight and completed loads. If a loader fails, the manager warns once per asset key and invokes the caller-provided placeholder factory.
- If the placeholder factory itself fails, that error is surfaced to the caller; normal missing assets should degrade gracefully when a valid fallback is supplied.
- In development, errors show in the on-screen overlay; the Phase 1 debug panel also records global errors, unhandled rejections, and bounded diagnostic logs.

## 7. Serialization

Scenes, worlds, prefabs and saves use the same component serializers:

```
Scene file = { version, entities: [ { id, name, components: { Transform: {...}, ... } } ] }
```

Always include a `version` field and a migration function when the format changes.

## 8. Threading (later)

Phase 1–10 run on the main thread. Phase 11 may move physics, AI and chunk generation to workers.
To keep that possible: systems exchange plain data (no class instances across boundaries) and
heavy work is expressed as pure functions of input data.

## 9. Editor vs runtime

The editor runs *on top of* the same engine. "Play" snapshots the scene, runs the game systems,
and "Stop" restores the snapshot. Editor-only code never ships in an exported game build.
