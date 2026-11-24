# PHYSICS.md — Physics Plan

> Decisions behind this plan: D-004 (Rapier WASM), D-005 (ECS), D-011 (fixed 60 Hz step with render interpolation).
> Code lives in `src/engine/physics/`. Roadmap items are in `PLAN.md` Phase 3 (vehicles also in Phase 6).

## 1. Principles

1. **Fixed timestep.** Physics always steps at `FIXED_DT = 1/60 s`. Rendering interpolates between the last two states (see `docs/ARCHITECTURE.md` §3).
2. **Physics is a wrapper, not a leak.** Only `physics/index.ts` knows about Rapier. Other systems use our own types (`RigidBody`, `Collider`, `RayHit`).
3. **ECS is the source of truth for gameplay, physics for motion.** After each step, `physics.syncToEcs()` writes body transforms into `Transform` components. Gameplay code writes forces/velocities through components, never by touching Rapier bodies.
4. **Data-driven.** Masses, friction, suspension and engine curves live in JSON under `assets/data/physics/` and `assets/data/vehicles/`. No magic numbers in logic.
5. **Deterministic where possible.** Same inputs and same step count give the same result (helps debugging and replays).

## 2. World and bodies

- One physics world per loaded game; gravity, step rate and solver iterations come from `assets/data/physics/world.json`.
- Body types: `static` (buildings, roads), `dynamic` (props, cars, debris), `kinematic` (moving platforms, doors).
- Colliders: box, sphere, capsule, convex hull, trimesh (static only), heightfield (terrain).
- Physics materials (friction, restitution, density) are named presets in `assets/data/physics/materials.json` and referenced by name (`asphalt`, `grass`, `metal`, `glass`, `wood`).
- Collision groups: `world`, `vehicle`, `character`, `prop`, `trigger`, `debris`. The group matrix is data, not code.

## 3. Queries and events

- Raycast, shape cast, overlap tests through `physics.raycast(...)`, `physics.castShape(...)`, `physics.overlap(...)`.
- Trigger volumes (mission zones, shop doors) emit `trigger:enter` / `trigger:exit`.
- Collisions above an impulse threshold emit `physics:impact` with point, normal and impulse (used for sounds, damage, particles).
- All event names are typed in `src/engine/events/event-map.ts`.

## 4. Character controller

- Capsule with Rapier's kinematic character controller: slopes, stairs (auto-step), ground snapping, jumping, sliding off steep slopes.
- Movement intent comes from a component (`CharacterIntent`); the controller system turns it into motion each fixed step.
- States (grounded, airborne, swimming, in-vehicle) are components; animation reads them (Phase 5).

## 5. Ragdoll

- Built from the character skeleton: capsule/box colliders per bone group joined by limited joints.
- Activated by death, big impacts, or being hit by a vehicle; the animated pose seeds the initial ragdoll pose.
- After a timeout the ragdoll goes to sleep; far-away ragdolls are removed by the population manager.
- Joint limits and masses come from `assets/data/physics/ragdoll.json`.

## 6. Vehicle physics

Use Rapier's raycast vehicle controller as the base and add our own tyre and drivetrain model on top.

**Chassis:** one dynamic rigid body with a box/hull collider, centre of mass lowered (data-driven) for stability.

**Suspension (per wheel):** raycast downward from the mount point; spring-damper force with rest length, stiffness, damping, travel limits and anti-roll bar coupling.

**Tyres:** longitudinal and lateral grip from a slip-based curve (simplified Pacejka-style, our own implementation); grip scaled by surface material and wetness. Handbrake locks rear wheels; drift emerges from lateral slip, not from a scripted state.

**Drivetrain:**

- Engine torque curve (RPM → torque), idle and redline RPM.
- Gearbox with ratios, final drive, shift time, automatic shifting logic (manual optional).
- Drive layout: FWD / RWD / AWD with a torque split.
- Brakes with front/rear bias, optional ABS, and steering with speed-sensitive angle limit.

**Aids (toggle per vehicle):** traction control, stability control, simple downforce.

**Other vehicle types:** motorbike (two wheels, lean and counter-steer via a stabilising torque), truck (higher mass, trailer joint optional), bicycle (simplified). Each is a JSON handling model reading the same component set.

A vehicle file looks like (illustrative, final schema lives in `physics/vehicles/types.ts`):

```json
{
  "version": 1,
  "mass": 1400,
  "centerOfMass": [0, -0.35, 0.1],
  "wheels": [{ "node": "wheel_fl", "radius": 0.34, "suspension": { "rest": 0.3, "stiffness": 35000, "damping": 4500 }, "steer": true, "drive": false }],
  "engine": { "idleRpm": 900, "redlineRpm": 6800, "torqueCurve": [[1000, 180], [4000, 320], [6500, 260]] },
  "gearbox": { "ratios": [3.6, 2.2, 1.5, 1.1, 0.9], "final": 3.7, "shiftTime": 0.25 }
}
```

Wheel node names (`wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr`) match the conventions in `ASSETS.md`.

**Damage (Phase 6):** impact impulse → deformation of body mesh vertices, detached parts, smoke and fire stages; damage never changes the physics collider shape in the first version.

## 7. Destruction-ready props

- Lamp posts, fences, bins, signs and benches start as static/sleeping dynamic bodies with a break threshold.
- When the threshold is exceeded they swap to dynamic bodies or a simple pre-fractured set of pieces; no runtime mesh fracturing in the first version.
- Debris is pooled and capped per quality preset.

## 8. Performance rules

- Sleeping bodies stay asleep; only bodies near the player are active (chunk streaming creates/destroys bodies with the chunk).
- Static world geometry uses merged colliders per chunk (trimesh/heightfield), never one collider per brick.
- Traffic and pedestrians far from the player run as simplified kinematic agents without full rigid-body simulation.
- No allocations in the step loop: reuse vectors, reuse query result objects.
- Heavy work stays expressible as pure functions of plain data so it can move to a worker in Phase 11 (OQ-2).

## 9. Debug draw

Toggleable overlay in the `debug` system: colliders, contact points and normals, raycasts, suspension rays, centre of mass, sleeping state, and a per-frame physics time readout.

## 10. Tuning files

| File | Purpose |
|------|---------|
| `assets/data/physics/world.json` | Gravity, step rate, solver iterations |
| `assets/data/physics/materials.json` | Friction/restitution/density presets |
| `assets/data/physics/ragdoll.json` | Bone groups, masses, joint limits |
| `assets/data/vehicles/<name>.json` | Per-vehicle handling |

## 11. Open questions

- Whether Rapier's vehicle controller is flexible enough, or the suspension and tyres should be a fully custom constraint solver (decide while building Phase 3 vehicles; record in `docs/DECISIONS.md`).
- Worker-thread physics (OQ-2, Phase 11).
