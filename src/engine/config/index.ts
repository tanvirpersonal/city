/** Public API of the validated JSON configuration system. */
export { createConfigLoader } from "./config-system";
export { isRuntimeConfig, RUNTIME_CONFIG_PATH } from "./engine-config";
export type { RuntimeConfig } from "./engine-config";
export type { ConfigLoader, ConfigLoaderOptions, ConfigValidator } from "./types";
