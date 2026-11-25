import type { MeshStandardMaterial } from "three/webgpu";

/** Types for the PBR material system. Design: docs/RENDERING.md §3, texture folders: ASSETS.md §2. */

/** The material object the renderer draws with. Other systems pass it around without touching its internals. */
export type RenderMaterial = MeshStandardMaterial;

/** Folder categories under `assets/textures/` plus "generic" for materials without a folder. */
export const MATERIAL_CATEGORIES = [
  "roads",
  "buildings",
  "terrain",
  "props",
  "vehicles",
  "interiors",
  "water",
  "generic",
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

/** Files of a texture set folder. Only `albedo` is required (ASSETS.md §2). */
export const TEXTURE_SLOTS = ["albedo", "normal", "roughness", "metallic", "ao", "height", "emissive"] as const;

export type TextureSlot = (typeof TEXTURE_SLOTS)[number];

/**
 * One material, loaded from `assets/data/materials/<name>.json`.
 * Scalars are the values used when the matching texture map is missing; when a map exists it drives that property.
 * Unset optional numbers fall back to the category defaults in `categories.json`.
 */
export interface MaterialDefinition {
  /** JSON schema version of the material file. */
  readonly version: number;
  /** kebab-case name; must match the JSON file name and the texture folder name. */
  readonly name: string;
  readonly category: MaterialCategory;
  /** Texture folder relative to the asset root, e.g. "textures/roads/asphalt-01". Omit for a flat material. */
  readonly textureFolder?: string;
  /** Flat base color (#rrggbb) used when there is no albedo texture. Defaults to the category tint. */
  readonly albedoColor?: string;
  readonly roughness?: number;
  readonly metallic?: number;
  /** Ambient-occlusion strength in [0, 1]. */
  readonly ao?: number;
  /** Glow color (#rrggbb); black means no glow. */
  readonly emissiveColor?: string;
  readonly emissiveIntensity?: number;
  /** Strength of the normal map. */
  readonly normalScale?: number;
  /** How many times the texture repeats per UV unit. */
  readonly uvScale?: number;
}
