# RENDERING.md — Graphics Plan (Unreal-type look)

> Decisions behind this plan: D-003 (Three.js, WebGPU first, WebGL2 fallback), D-010 (own implementation of the techniques).
> Code lives in `src/engine/render/` (see `docs/STRUCTURE.md`). Roadmap items are in `PLAN.md` Phase 2.

## 1. What "Unreal-type" means here

A consistent physically based look, not a feature checklist:

1. **PBR everywhere** — every surface uses albedo / normal / roughness / metallic / AO / emissive.
2. **HDR pipeline** — render in linear HDR, tone map once at the end.
3. **Dynamic light** — one sun/moon, many point/spot lights, image-based lighting from a sky.
4. **Real shadows** — cascaded shadow maps for the sun, cheap shadows for a few important lights.
5. **Post-processing** — bloom, SSAO, SSR, anti-aliasing, color grading, optional DOF and motion blur.
6. **Atmosphere** — day/night cycle, fog, weather, wet surfaces.

## 2. Renderer wrapper

- `render/index.ts` exposes `createRenderer(canvas, quality)`; nothing outside `render/` imports `three` directly
  except the asset loaders in `assets/` (which return render-ready objects through the render API).
- Try the WebGPU backend first; fall back to WebGL2 automatically. Log which backend is active.
- Features that cannot run on the fallback are skipped by quality preset, never by crashing.
- The renderer reads transforms from ECS `Transform` + `Renderable` components and draws with an
  interpolation factor `alpha` (see `docs/ARCHITECTURE.md` §3).

## 3. Materials

- One PBR material type, defined by JSON in `assets/data/materials/<name>.json` (types in `render/materials/types.ts`, validator in `definition.ts`). Materials are fetched by name from the material library (`createMaterialLibrary`, registered as the `materials` service).
- `assets/data/materials/categories.json` holds the per-category fallback tint, roughness and metallic, plus global defaults for AO, normal scale, UV scale and emissive intensity. Unset material fields use the category value, then the global default.
- Texture sets follow the folder convention in `ASSETS.md` §2 (only `albedo` required) and load through the asset manager.
- A missing map is skipped and the flat value gives the same look as a default map (flat normal, roughness from the category (0.8 for `generic`), no metal, AO 1). When a map exists it drives that property; the height map is not used yet.
- A missing `albedo` means the whole set is skipped after one warning, and the material falls back to a flat color tinted by its category so scenes stay readable.
- A material whose JSON is missing or invalid becomes a flat `generic` placeholder with one warning; the library never throws for a single material.
- Texture compression: KTX2/Basis where available, otherwise JPG/PNG as pasted.

## 4. Lighting and shadows

| Feature | Plan |
|---------|------|
| Sun / moon | One directional light driven by time of day |
| Local lights | Point and spot lights, culled and capped per quality preset |
| IBL | HDRI from `assets/hdri/`, prefiltered once; procedural sky if the file is missing |
| Sun shadows | Cascaded shadow maps (CSM), 3–4 cascades, texel snapping to avoid shimmer |
| Local shadows | Only the nearest few lights cast shadows |
| Contact detail | SSAO plus baked AO maps from materials |

## 5. Sky, time of day and weather

- Sky: analytic atmosphere (own implementation), sun disc, stars at night, tileable cloud layer.
- Time of day drives sun direction, light color/intensity, ambient, fog color and exposure.
- Weather presets are JSON (`assets/data/weather/`): clear, overcast, rain, fog, storm.
- Rain: GPU particles plus a wetness uniform that darkens albedo, lowers roughness and adds puddle reflection.
- Lightning: short emissive flash of the sun/ambient lights, no extra geometry.

## 6. Post-processing stack

Order matters; each pass is its own file in `render/post/` and can be switched off:

1. SSAO
2. SSR (reflections on wet roads and glass)
3. Volumetric light shafts / fog
4. Bloom
5. Depth of field (optional, cinematics)
6. Motion blur (optional)
7. Anti-aliasing (TAA on high, FXAA on low)
8. Tone mapping (ACES-style curve) + color grading
9. Vignette / film grain (optional, off by default)

## 7. Performance rules (a city is mostly repeated objects)

- **Instancing** for repeated meshes (lamps, signs, trees, traffic cones, parked cars).
- **Batching** of static chunk geometry: merge per material per chunk when a chunk loads.
- **LOD**: 3 levels per mesh where possible, distance driven by the quality preset; far buildings fall back to simple boxes.
- **Culling**: frustum culling per chunk and per object; occlusion culling later (Phase 11) if profiling asks for it.
- **Pooling**: particles, decals and temporary meshes come from pools; no per-frame allocations in hot loops (AI_RULES §4.9).
- **Draw budget**: keep a debug counter for draw calls, triangles and texture memory in the `debug` overlay.

## 8. Decals and particles

- Decals (bullet holes, skid marks, blood, grime) use projected quads from a ring buffer; oldest are recycled.
- Particles (smoke, fire, sparks, dust) are GPU-instanced sprites from `assets/textures/particles/`; procedural dots if missing.

## 9. Quality presets

Presets live in `assets/data/quality/*.json`; the renderer reads them and nothing else decides quality.

| Setting | Low | Medium | High | Ultra |
|---------|-----|--------|------|-------|
| Render scale | 0.75 | 1.0 | 1.0 | 1.0 |
| Shadow cascades / map size | 2 / 1024 | 3 / 2048 | 4 / 2048 | 4 / 4096 |
| SSAO / SSR | off / off | on / off | on / on | on / on |
| Anti-aliasing | FXAA | FXAA | TAA | TAA |
| Max shadow-casting local lights | 0 | 2 | 4 | 8 |
| View distance (chunks) | 3 | 5 | 7 | 9 |
| DOF / motion blur | off | off | optional | optional |

These numbers are starting points; tune them when real profiling exists and record changes in `docs/DECISIONS.md`.

## 10. Open questions

- Own post-processing passes vs the `postprocessing` library: default is own passes (see `docs/TECH_STACK.md`); revisit only if a pass costs too much time to build.
- Whether SSR needs a planar-reflection fallback on WebGL2.
