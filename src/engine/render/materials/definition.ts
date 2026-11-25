import { MATERIAL_CATEGORIES } from "./types";
import type { MaterialCategory, MaterialDefinition } from "./types";

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Relative path inside `textures/`, lowercase kebab-case segments only (ASSETS.md: no spaces, no "..", no "%"). */
const TEXTURE_FOLDER = /^textures(\/[a-z0-9]+(-[a-z0-9]+)*)+$/;

export function isMaterialCategory(value: unknown): value is MaterialCategory {
  return typeof value === "string" && (MATERIAL_CATEGORIES as readonly string[]).includes(value);
}

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

function isOptionalNumber(value: unknown, min: number, max: number): boolean {
  return value === undefined || (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max);
}

/** Runtime type guard for the JSON documents in `assets/data/materials/`. */
export function isMaterialDefinition(value: unknown): value is MaterialDefinition {
  if (typeof value !== "object" || value === null) return false;
  const material = value as Record<string, unknown>;

  return (
    typeof material.version === "number" && Number.isInteger(material.version) && material.version >= 1 &&
    typeof material.name === "string" && KEBAB_CASE.test(material.name) &&
    isMaterialCategory(material.category) &&
    (material.textureFolder === undefined ||
      (typeof material.textureFolder === "string" && TEXTURE_FOLDER.test(material.textureFolder))) &&
    (material.albedoColor === undefined || isHexColor(material.albedoColor)) &&
    isOptionalNumber(material.roughness, 0, 1) &&
    isOptionalNumber(material.metallic, 0, 1) &&
    isOptionalNumber(material.ao, 0, 1) &&
    (material.emissiveColor === undefined || isHexColor(material.emissiveColor)) &&
    isOptionalNumber(material.emissiveIntensity, 0, 1000) &&
    isOptionalNumber(material.normalScale, 0, 10) &&
    (material.uvScale === undefined ||
      (typeof material.uvScale === "number" && Number.isFinite(material.uvScale) && material.uvScale > 0))
  );
}
