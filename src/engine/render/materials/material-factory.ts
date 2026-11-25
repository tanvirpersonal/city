import { MeshStandardMaterial } from "three/webgpu";
import type { MaterialCategories } from "./categories";
import type { MaterialDefinition } from "./types";

/** Glow color meaning "no emission". */
const NO_EMISSION = "#000000";

/** Every number and color of a material after the material, its category and the global defaults are merged. */
export interface ResolvedMaterialParams {
  readonly name: string;
  readonly color: string;
  readonly roughness: number;
  readonly metallic: number;
  readonly ao: number;
  readonly emissiveColor: string;
  readonly emissiveIntensity: number;
  readonly normalScale: number;
  readonly uvScale: number;
}

/** Fill every unset field: material value first, then category value, then global default. */
export function resolveMaterialParams(
  definition: MaterialDefinition,
  categories: MaterialCategories,
): ResolvedMaterialParams {
  const category = categories.categories[definition.category];
  const defaults = categories.defaults;
  return {
    name: definition.name,
    color: definition.albedoColor ?? category.tint,
    roughness: definition.roughness ?? category.roughness,
    metallic: definition.metallic ?? category.metallic,
    ao: definition.ao ?? defaults.ao,
    emissiveColor: definition.emissiveColor ?? NO_EMISSION,
    emissiveIntensity: definition.emissiveIntensity ?? defaults.emissiveIntensity,
    normalScale: definition.normalScale ?? defaults.normalScale,
    uvScale: definition.uvScale ?? defaults.uvScale,
  };
}

/**
 * Build a PBR material from flat values only (no texture maps). This is the always-available
 * placeholder look from docs/RENDERING.md §3: the category tint, default roughness, no metal.
 */
export function createFlatPbrMaterial(params: ResolvedMaterialParams): MeshStandardMaterial {
  return new MeshStandardMaterial({
    name: params.name,
    color: params.color,
    roughness: params.roughness,
    metalness: params.metallic,
    emissive: params.emissiveColor,
    emissiveIntensity: params.emissiveIntensity,
  });
}
