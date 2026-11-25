import type { ConfigLoader } from "../../config";
import { isHexColor } from "./definition";
import { MATERIAL_CATEGORIES } from "./types";
import type { MaterialCategory } from "./types";

/** Fallback look of one category: a flat tint keeps scenes readable until real textures exist. */
export interface CategoryDefaults {
  readonly tint: string;
  readonly roughness: number;
  readonly metallic: number;
}

/** Values for material fields that neither the material nor its category set. */
export interface MaterialScalarDefaults {
  readonly ao: number;
  readonly normalScale: number;
  readonly uvScale: number;
  readonly emissiveIntensity: number;
}

/** Contents of `assets/data/materials/categories.json`. */
export interface MaterialCategories {
  readonly version: number;
  readonly defaults: MaterialScalarDefaults;
  readonly categories: Readonly<Record<MaterialCategory, CategoryDefaults>>;
}

/** Relative to the config loader base URL (D-013). */
export const MATERIAL_CATEGORIES_PATH = "data/materials/categories.json";

function isUnit(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isPositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isCategoryDefaults(value: unknown): value is CategoryDefaults {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return isHexColor(entry.tint) && isUnit(entry.roughness) && isUnit(entry.metallic);
}

function isScalarDefaults(value: unknown): value is MaterialScalarDefaults {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    isUnit(entry.ao) &&
    typeof entry.normalScale === "number" && Number.isFinite(entry.normalScale) && entry.normalScale >= 0 &&
    isPositive(entry.uvScale) &&
    typeof entry.emissiveIntensity === "number" && Number.isFinite(entry.emissiveIntensity) && entry.emissiveIntensity >= 0
  );
}

/** Runtime type guard; every known category must be present. */
export function isMaterialCategories(value: unknown): value is MaterialCategories {
  if (typeof value !== "object" || value === null) return false;
  const document = value as Record<string, unknown>;
  if (typeof document.version !== "number" || !Number.isInteger(document.version) || document.version < 1) return false;
  if (!isScalarDefaults(document.defaults)) return false;
  const categories = document.categories;
  if (typeof categories !== "object" || categories === null) return false;
  const byName = categories as Record<string, unknown>;
  return MATERIAL_CATEGORIES.every((name) => isCategoryDefaults(byName[name]));
}

export function loadMaterialCategories(config: ConfigLoader): Promise<MaterialCategories> {
  return config.load(MATERIAL_CATEGORIES_PATH, isMaterialCategories);
}
