import type { ConfigLoader } from "../config";
import { QUALITY_NAMES } from "./types";
import type { QualityName, QualityPreset } from "./types";

/** Preset used when the player or config does not pick one. */
export const DEFAULT_QUALITY: QualityName = "medium";

/** Path of a preset file, relative to the config loader's base URL (D-013). */
export function qualityPresetPath(name: QualityName): string {
  return `data/quality/${name}.json`;
}

function isQualityName(value: unknown): value is QualityName {
  return typeof value === "string" && (QUALITY_NAMES as readonly string[]).includes(value);
}

function isPowerOfTwo(value: number): boolean {
  return Number.isInteger(value) && value > 0 && (value & (value - 1)) === 0;
}

/** Runtime type guard for the JSON documents in `assets/data/quality/`. */
export function isQualityPreset(value: unknown): value is QualityPreset {
  if (typeof value !== "object" || value === null) return false;
  const preset = value as Record<string, unknown>;
  const { renderScale, shadowCascades, shadowMapSize, maxShadowLocalLights, viewDistanceChunks } = preset;

  return (
    typeof preset.version === "number" && Number.isInteger(preset.version) && preset.version >= 1 &&
    isQualityName(preset.name) &&
    typeof renderScale === "number" && Number.isFinite(renderScale) && renderScale > 0 && renderScale <= 1 &&
    typeof shadowCascades === "number" && Number.isInteger(shadowCascades) && shadowCascades >= 1 && shadowCascades <= 4 &&
    typeof shadowMapSize === "number" && isPowerOfTwo(shadowMapSize) && shadowMapSize >= 256 &&
    typeof preset.ssao === "boolean" &&
    typeof preset.ssr === "boolean" &&
    (preset.antiAliasing === "fxaa" || preset.antiAliasing === "taa") &&
    typeof maxShadowLocalLights === "number" && Number.isInteger(maxShadowLocalLights) && maxShadowLocalLights >= 0 &&
    typeof viewDistanceChunks === "number" && Number.isInteger(viewDistanceChunks) && viewDistanceChunks >= 1 &&
    typeof preset.depthOfField === "boolean" &&
    typeof preset.motionBlur === "boolean"
  );
}

/** Load and validate one preset; rejects when the file's `name` does not match the requested name. */
export async function loadQualityPreset(config: ConfigLoader, name: QualityName): Promise<QualityPreset> {
  const preset = await config.load(qualityPresetPath(name), isQualityPreset);
  if (preset.name !== name) {
    throw new Error(`quality preset "${name}": file declares name "${preset.name}"`);
  }
  return preset;
}
