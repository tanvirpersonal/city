import type { CoreConfig } from "../core";

/** Settings consumed during engine startup. */
export interface RuntimeConfig {
  readonly core: CoreConfig;
}

/** Relative to the config loader's configured baseUrl. */
export const RUNTIME_CONFIG_PATH = "data/engine/runtime.json";

/** Runtime type guard for the public engine configuration document. */
export function isRuntimeConfig(value: unknown): value is RuntimeConfig {
  if (typeof value !== "object" || value === null || !("core" in value)) return false;
  const core = value.core;
  if (typeof core !== "object" || core === null) return false;
  if (!("fixedHz" in core) || !("maxFrameSeconds" in core) || !("maxStepsPerFrame" in core)) return false;

  return (
    typeof core.fixedHz === "number" &&
    Number.isFinite(core.fixedHz) &&
    core.fixedHz > 0 &&
    typeof core.maxFrameSeconds === "number" &&
    Number.isFinite(core.maxFrameSeconds) &&
    core.maxFrameSeconds > 0 &&
    typeof core.maxStepsPerFrame === "number" &&
    Number.isInteger(core.maxStepsPerFrame) &&
    core.maxStepsPerFrame >= 1
  );
}
