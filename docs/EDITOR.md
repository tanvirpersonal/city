# EDITOR.md — The In-Engine Editor

> Games are built *inside* the engine with this editor. Code lives in `src/editor/` (see `docs/STRUCTURE.md`).
> Dependency rule: `editor → engine` only. The engine never imports the editor (AI_RULES §4.3).
> Roadmap items: `PLAN.md` Phase 9. Editor-only code never ships in an exported game build (`docs/ARCHITECTURE.md` §9).

## 1. Goals

1. Place objects, paint terrain and roads, edit materials, script missions, press **Play**.
2. Same engine, same components, same serializers as the runtime — no separate "editor world".
3. Plain TypeScript + DOM (no UI framework), per `docs/TECH_STACK.md`. Revisit only if the UI grows too large and record it in `docs/DECISIONS.md`.
4. Static hosting only: projects are saved to files the user downloads/uploads or to browser storage; no server.

## 2. Layout

```
+------------------------------------------------------------+
| Menu bar: File  Edit  View  World  Play/Stop               |
+------------+-----------------------------+-----------------+
| Hierarchy  |        Viewport             | Inspector       |
| (entities) |  (3D scene + gizmos)        | (components)    |
+------------+-----------------------------+-----------------+
| Asset browser | Console | Mission editor | Material editor  |
+------------------------------------------------------------+
```

Panels are dockable and their layout is saved per user. Each panel is one file in `src/editor/panels/` implementing a small `Panel` interface (`id`, `title`, `mount(el)`, `unmount()`).

## 3. Editor shell and play mode

- The shell (`src/editor/shell/`) owns layout, menus, shortcuts and the play/stop toggle.
- **Play** snapshots the scene (using the component serializers), switches to the game systems, and runs the normal game loop. **Stop** restores the snapshot, so nothing done while playing leaks into the project.
- Editor-only systems (gizmos, selection, grid) run in the editor phase only and are removed in play mode and in exported builds.
- A free-fly editor camera is separate from the game camera.

## 4. Scene hierarchy and inspector

- Hierarchy lists entities (with names and parent/child links), supports search, rename, reorder, duplicate, delete, show/hide, lock.
- Inspector is generated from component definitions: each component type registers a field schema (number, vector, color, enum, asset reference, boolean). Adding a new component to the engine automatically gives it an inspector UI.
- Asset-reference fields accept drag-and-drop from the asset browser.
- Multi-select edits common fields on all selected entities.

## 5. Gizmos, snapping and undo/redo

- Move / rotate / scale gizmos in local or world space.
- Snapping: grid, angle, vertex, and surface snapping (place onto terrain/road via a physics raycast).
- **Every edit is a command object** in `src/editor/commands/` with `do()` and `undo()`; a history stack gives undo/redo. No panel modifies the scene without going through a command.
- Commands can be merged (e.g. a drag becomes one command, not one per frame).

## 6. Asset browser

- Mirrors the `assets/` folder layout from `ASSETS.md`; shows thumbnails for textures, models, audio.
- Shows each asset's status: real file present vs procedural placeholder in use, so the owner can see what is missing.
- Drag an asset into the viewport or an inspector field to use it.
- Import flow: in a static-hosted editor the user adds files by picking them from disk; the editor stores them in the project and tells the user the repo path to place them at for the real build.

## 7. World tools

- **Terrain:** raise/lower/smooth/flatten brushes with size and strength; splat-map paint brush per material.
- **Roads:** click to place nodes, drag to bend splines, set lanes/width/speed/surface, create junctions with automatic turn lanes and traffic-light groups (road graph in `docs/OPEN_WORLD.md` §3).
- **Buildings / blocks:** draw a block polygon, pick a facade style and height range, regenerate procedurally; swap to a hand-made model per building.
- **Scatter:** paint props (trees, lamps, bins) with density and random rotation/scale.
- **Spawn and population:** place spawn points and paint density maps for traffic and pedestrians.
- All tools edit the same data the runtime streams, one chunk at a time, and mark affected chunks dirty for rebuild.

## 8. Material editor

- Edits the PBR material JSON from `assets/data/materials/` with live preview on a sphere/plane and in the scene.
- Fields: texture slots (albedo, normal, roughness, metallic, AO, emissive), tiling, tint, roughness/metal multipliers.
- Missing textures show the placeholder, never an error.

## 9. Mission / script editor

- Visual list/graph editor for the mission JSON described in `docs/OPEN_WORLD.md` §13: objectives, triggers, actors, fail/complete rules.
- Triggers and waypoints are placed in the viewport by clicking.
- A "test from here" button starts the mission in play mode at a chosen objective.
- Custom logic hooks are referenced by name; the editor lists registered hooks but does not edit game code.

## 10. Prefabs

- A prefab is a saved group of entities with its components (same format as a scene file).
- Instances keep a link to the prefab; changing the prefab updates instances, with per-instance overrides stored as a small diff.
- Typical prefabs: a shop, a gas station, a parked-car cluster, a mission set-piece.

## 11. Project save/load and export

- Project = `project.json` (version, settings, list of worlds/scenes/missions) + the world and data files already described. Every file has a `version` and migration.
- Save/load through downloads and file pickers, plus an autosave to browser storage (IndexedDB) with a recovery prompt after a crash.
- **Export:** produces a playable build without editor code, with only the assets the project references; output is static files ready for GitHub Pages.

## 12. Debug tools in the editor

- Toggles for physics debug draw, nav/road graph overlay, chunk borders, light/shadow debug, and the stats overlay from the `debug` system.
- Console panel shows engine logs and errors; errors from the engine overlay also appear here.

## 13. Build order inside Phase 9

1. Shell + viewport + play/stop
2. Hierarchy + inspector
3. Gizmos + snapping + undo/redo
4. Asset browser
5. Terrain and road tools
6. Material editor
7. Mission editor
8. Prefabs
9. Project save/load + export

Each step is a small deliverable that works on its own (AI_RULES §2).

## 14. Open questions

- Whether a UI framework becomes worthwhile once Phase 9 is underway (D-entry needed if so).
- Where large projects are stored for users without a repo (browser storage limits vs file downloads).
