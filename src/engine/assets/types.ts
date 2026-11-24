/** Loads one asset type from a URL. */
export type AssetLoader<T> = (url: string) => Promise<T>;

/** Creates a safe fallback when an asset cannot be loaded. */
export type AssetPlaceholder<T> = (path: string, reason: unknown) => T | Promise<T>;

/** Warning sink used for one-time missing-asset messages. */
export type AssetWarningHandler = (message: string, reason: unknown) => void;

export interface AssetManagerOptions {
  /** Relative asset root, normally "assets/". */
  readonly baseUrl?: string;
  /** Receives one warning per failed asset key. */
  readonly onWarning?: AssetWarningHandler;
}

/** Shared asset loading and fallback interface. */
export interface AssetManager {
  /** Load and cache an asset; a placeholder is returned when its loader fails. */
  load<T>(key: string, path: string, loader: AssetLoader<T>, placeholder: AssetPlaceholder<T>): Promise<T>;
  /** Clear one cached asset or the complete cache. */
  clear(key?: string): void;
  /** Number of cached or in-flight assets. */
  readonly size: number;
}
