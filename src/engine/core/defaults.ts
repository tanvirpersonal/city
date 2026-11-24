import type { CoreConfig } from "./types";

/**
 * Built-in loop settings used until the config system (src/engine/config/)
 * supplies overrides. These are the only place loop numbers are defined.
 */
export const DEFAULT_CORE_CONFIG: Readonly<CoreConfig> = {
  fixedHz: 60,
  maxFrameSeconds: 0.25,
  maxStepsPerFrame: 5,
};

/** Returns a validated copy of the defaults merged with overrides. Throws on nonsense values. */
export function resolveCoreConfig(overrides: Partial<CoreConfig> = {}): CoreConfig {
  const config: CoreConfig = { ...DEFAULT_CORE_CONFIG, ...overrides };
  if (!(config.fixedHz > 0) || !Number.isFinite(config.fixedHz)) {
    throw new Error(`core: fixedHz must be a positive number, got ${config.fixedHz}`);
  }
  if (!(config.maxFrameSeconds > 0) || !Number.isFinite(config.maxFrameSeconds)) {
    throw new Error(`core: maxFrameSeconds must be a positive number, got ${config.maxFrameSeconds}`);
  }
  if (!Number.isInteger(config.maxStepsPerFrame) || config.maxStepsPerFrame < 1) {
    throw new Error(`core: maxStepsPerFrame must be an integer >= 1, got ${config.maxStepsPerFrame}`);
  }
  return config;
}
