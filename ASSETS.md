# ASSETS.md — Assets Needed, Where To Paste Them, Status

> **For the owner:** paste each file at the exact path in the table. The engine picks it up
> automatically — no code change needed. Until a file exists, the engine uses a procedural placeholder.
>
> **For the AI:** keep this file up to date. When you need a new asset, add a row (status `[ ]`) and push.
> Never invent or download assets yourself. When the owner confirms a file is pasted, verify it
> exists (`ls`) and mark it `[x]`. Never mark `[x]` for a file that is not in the repo.

Status markers: `[ ]` needed, not provided · `[x]` provided and in repo · `[~]` provided but wrong/partial (note why) · `[-]` not needed anymore

Placeholders: every asset below has a built-in procedural fallback, so **nothing blocks development**.
Provide assets in priority order (P0 first).

---

## 1. Rules for all assets

- **Free-to-use only.** Good CC0 sources: ambientCG, Poly Haven (textures, HDRIs, models), Kenney (models).
  Write the license/source in the "Source / license" column.
- **Keep files small.** GitHub limit is 100 MB per file; we target **under 5 MB per texture**, under 25 MB per model.
- **Textures must tile** (seamless) unless marked "decal" or "single".
- **Power-of-two sizes** (512, 1024, 2048). Use **1024** by default, **2048** only for hero surfaces.
- **Models:** `.glb` (binary glTF 2.0), Y-up, 1 unit = 1 meter, origin at the bottom center, forward = -Z.
- **Audio:** `.ogg` (Vorbis), mono for 3D sounds, stereo for music.
- **Never** use ripped assets from commercial games (GTA, etc.).

## 2. PBR texture set convention

Each material is a **folder** containing these files (only `albedo` is mandatory):

```
assets/textures/<category>/<material-name>/
  albedo.jpg       (base color, sRGB)            REQUIRED
  normal.png       (OpenGL-style normal, +Y up)  recommended
  roughness.jpg    (grayscale)                   recommended
  metallic.jpg     (grayscale, only for metals)  optional
  ao.jpg           (ambient occlusion)           optional
  height.jpg       (displacement, grayscale)     optional
  emissive.jpg     (glow, e.g. lit windows)      optional
```

Example: `assets/textures/roads/asphalt-01/albedo.jpg`

If you only have one image, paste it as `albedo.jpg` and the engine generates the rest.

---

## 3. Textures (P0 = needed for the first playable demo)

| Status | Pri | Asset | Folder to paste into | Size | Source / license |
|:--:|:--:|-------|----------------------|------|------------------|
| [ ] | P0 | Asphalt, clean | `assets/textures/roads/asphalt-01/` | 2048 | |
| [ ] | P0 | Asphalt, worn/cracked | `assets/textures/roads/asphalt-worn/` | 1024 | |
| [ ] | P0 | Concrete sidewalk | `assets/textures/roads/sidewalk-01/` | 1024 | |
| [ ] | P0 | Curb / concrete block | `assets/textures/roads/curb-01/` | 1024 | |
| [ ] | P0 | Concrete wall | `assets/textures/buildings/concrete-01/` | 1024 | |
| [ ] | P0 | Brick wall | `assets/textures/buildings/brick-01/` | 1024 | |
| [ ] | P0 | Plaster / painted wall | `assets/textures/buildings/plaster-01/` | 1024 | |
| [ ] | P0 | Glass curtain-wall facade (office tower) | `assets/textures/buildings/glass-facade-01/` | 2048 | |
| [ ] | P0 | Window facade with lit windows (night) | `assets/textures/buildings/windows-01/` | 2048 | |
| [ ] | P0 | Roof (tar / tile) | `assets/textures/buildings/roof-01/` | 1024 | |
| [ ] | P0 | Grass | `assets/textures/terrain/grass-01/` | 1024 | |
| [ ] | P0 | Dirt | `assets/textures/terrain/dirt-01/` | 1024 | |
| [ ] | P0 | Sand | `assets/textures/terrain/sand-01/` | 1024 | |
| [ ] | P0 | Rock / cliff | `assets/textures/terrain/rock-01/` | 1024 | |
| [ ] | P0 | Painted metal | `assets/textures/props/metal-painted-01/` | 1024 | |
| [ ] | P0 | Rusty metal | `assets/textures/props/metal-rust-01/` | 1024 | |
| [ ] | P1 | Gravel | `assets/textures/terrain/gravel-01/` | 1024 | |
| [ ] | P1 | Snow | `assets/textures/terrain/snow-01/` | 1024 | |
| [ ] | P1 | Wood planks | `assets/textures/props/wood-01/` | 1024 | |
| [ ] | P1 | Tire rubber | `assets/textures/vehicles/rubber-01/` | 512 | |
| [ ] | P1 | Interior floor (tile) | `assets/textures/interiors/floor-tile-01/` | 1024 | |
| [ ] | P1 | Interior floor (wood) | `assets/textures/interiors/floor-wood-01/` | 1024 | |
| [ ] | P1 | Interior wall paper | `assets/textures/interiors/wall-01/` | 1024 | |
| [ ] | P1 | Fabric / leather (seats) | `assets/textures/vehicles/fabric-01/` | 512 | |
| [ ] | P2 | Water normal map (2 tiling waves) | `assets/textures/water/waves-normal-01.png` | 1024 | |
| [ ] | P2 | Foam | `assets/textures/water/foam-01.png` | 512 | |

### Decals and single textures

| Status | Pri | Asset | Path | Size | Notes |
|:--:|:--:|-------|------|------|-------|
| [ ] | P0 | Road markings atlas (lane lines, arrows, crosswalk, stop line) | `assets/textures/decals/road-markings.png` | 2048 | Transparent PNG atlas |
| [ ] | P1 | Bullet holes (concrete/metal/glass) | `assets/textures/decals/bullet-holes.png` | 1024 | Transparent atlas |
| [ ] | P1 | Tire skid marks | `assets/textures/decals/skid.png` | 512 | Transparent, tileable along length |
| [ ] | P1 | Blood splats | `assets/textures/decals/blood.png` | 1024 | Transparent atlas (optional; can be skipped) |
| [ ] | P1 | Dirt / grime overlay (for buildings) | `assets/textures/decals/grime.png` | 1024 | Grayscale mask |
| [ ] | P2 | Billboards / posters / shop signs | `assets/textures/signs/` | 1024 each | Any number of images |
| [ ] | P2 | License plate font texture | `assets/textures/vehicles/plate.png` | 512 | |
| [ ] | P2 | Particle sprites (smoke, fire, spark, dust) | `assets/textures/particles/` | 256–512 | `smoke.png`, `fire.png`, `spark.png`, `dust.png` |

## 4. Sky / lighting (HDRI)

| Status | Pri | Asset | Path | Size | Notes |
|:--:|:--:|-------|------|------|-------|
| [ ] | P0 | Clear day sky HDRI | `assets/hdri/day-clear.hdr` | 2k | Poly Haven works well |
| [ ] | P1 | Sunset HDRI | `assets/hdri/sunset.hdr` | 2k | |
| [ ] | P1 | Night HDRI | `assets/hdri/night.hdr` | 2k | |
| [ ] | P1 | Overcast HDRI | `assets/hdri/overcast.hdr` | 2k | |
| [ ] | P2 | Cloud noise texture | `assets/textures/sky/clouds.png` | 1024 | Tileable grayscale |

## 5. 3D models (.glb) — all optional, the engine builds placeholder boxes/cylinders without them

| Status | Pri | Asset | Path | Notes |
|:--:|:--:|-------|------|-------|
| [ ] | P0 | Player character, rigged + animations (idle, walk, run, jump) | `assets/models/characters/player.glb` | Humanoid skeleton |
| [ ] | P0 | Sedan car (body + 4 separate wheels) | `assets/models/vehicles/sedan.glb` | Wheels as separate nodes named `wheel_fl`, `wheel_fr`, `wheel_rl`, `wheel_rr` |
| [ ] | P1 | Sports car | `assets/models/vehicles/sports.glb` | Same wheel node names |
| [ ] | P1 | Pickup / truck | `assets/models/vehicles/truck.glb` | Same wheel node names |
| [ ] | P1 | Police car | `assets/models/vehicles/police.glb` | Same wheel node names |
| [ ] | P1 | Motorbike | `assets/models/vehicles/bike.glb` | Nodes `wheel_f`, `wheel_r` |
| [ ] | P1 | Pedestrian variants (5–10) | `assets/models/characters/ped-01.glb` … | Same skeleton as player |
| [ ] | P1 | Street props: lamp post, traffic light, sign, bin, bench, hydrant | `assets/models/props/` | One file each |
| [ ] | P2 | Trees (3 types) | `assets/models/props/tree-01.glb` … | With leaf alpha |
| [ ] | P2 | Building modules (windows, doors, storefronts) | `assets/models/buildings/` | |
| [ ] | P2 | Weapons (pistol, rifle, shotgun) | `assets/models/weapons/` | |

## 6. Audio (.ogg)

| Status | Pri | Asset | Path | Notes |
|:--:|:--:|-------|------|-------|
| [ ] | P1 | Engine loop (idle, mid, high rev) | `assets/audio/vehicles/engine-{idle,mid,high}.ogg` | Seamless loops |
| [ ] | P1 | Tire screech, crash, horn | `assets/audio/vehicles/{screech,crash,horn}.ogg` | |
| [ ] | P1 | Footsteps (concrete, grass) | `assets/audio/characters/step-{concrete,grass}.ogg` | |
| [ ] | P1 | Gunshot, reload, impact | `assets/audio/weapons/` | |
| [ ] | P1 | City ambience loop, wind, rain | `assets/audio/ambience/{city,wind,rain}.ogg` | Stereo loops |
| [ ] | P2 | Music / radio tracks | `assets/audio/music/` | Only tracks you have rights to |

## 7. Data files (the AI writes these, not the owner)

Config and definition JSON live in `assets/data/` and are written by the AI as systems get built:
`assets/data/physics/`, `assets/data/vehicles/`, `assets/data/materials/`, `assets/data/missions/`.
Track them in `PLAN.md`, not here.

---

## 8. What to send first (shortest useful list)

If you only paste a few things, paste these 8 first — they make the first demo look good:

1. `assets/textures/roads/asphalt-01/`
2. `assets/textures/roads/sidewalk-01/`
3. `assets/textures/buildings/concrete-01/`
4. `assets/textures/buildings/windows-01/`
5. `assets/textures/terrain/grass-01/`
6. `assets/textures/decals/road-markings.png`
7. `assets/hdri/day-clear.hdr`
8. `assets/models/vehicles/sedan.glb`

## 9. Change log

- 2026-11-25 — File created with the full asset wishlist. Nothing provided yet.
