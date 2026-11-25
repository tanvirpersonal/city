import { Color, MeshStandardMaterial } from "three/webgpu";
import type { Texture } from "three/webgpu";
import type { MaterialCategories } from "./categories";
import type { TextureSet } from "./texture-set";
import type { MaterialDefinition, TextureSlot } from "./types";

/** Glow color meaning "no emission". */
const NO_EMISSION = "#000000";

/** Multiplier color that leaves a texture map unchanged. */
const WHITE = "#ffffff";

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

/** Per-material copy of a shared map so each material can set its own UV repeat. */
function bindMap(textures: TextureSet, slot: TextureSlot, uvScale: number): Texture | null {
  const source = textures[slot];
  if (source === undefined) return null;
  const texture = source.clone();
  texture.repeat.set(uvScale, uvScale);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Build a PBR material and attach every map that exists in the texture set. With a map present
 * the map drives that property (a roughness map replaces the roughness number, and so on);
 * without one the flat value from `params` is used. The height map is not used yet.
 */
export function createPbrMaterial(params: ResolvedMaterialParams, textures: TextureSet): MeshStandardMaterial {
  const material = createFlatPbrMaterial(params);

  const albedo = bindMap(textures, "albedo", params.uvScale);
  if (albedo !== null) {
    material.map = albedo;
    material.color = new Color(WHITE);
  }

  const normal = bindMap(textures, "normal", params.uvScale);
  if (normal !== null) {
    material.normalMap = normal;
    material.normalScale.set(params.normalScale, params.normalScale);
  }

  const roughness = bindMap(textures, "roughness", params.uvScale);
  if (roughness !== null) {
    material.roughnessMap = roughness;
    material.roughness = 1;
  }

  const metallic = bindMap(textures, "metallic", params.uvScale);
  if (metallic !== null) {
    material.metalnessMap = metallic;
    material.metalness = 1;
  }

  const ao = bindMap(textures, "ao", params.uvScale);
  if (ao !== null) {
    material.aoMap = ao;
    material.aoMapIntensity = params.ao;
  }

  const emissive = bindMap(textures, "emissive", params.uvScale);
  if (emissive !== null) {
    material.emissiveMap = emissive;
    material.emissive = new Color(WHITE);
  }

  return material;
}
