/** Runtime validator for JSON configuration data. */
export type ConfigValidator<T> = (value: unknown) => value is T;

/** Configuration loader options. */
export interface ConfigLoaderOptions {
  /** Base URL of the published asset root; paths passed to load() start with "data/" (D-013). Defaults to ".". */
  readonly baseUrl?: string;
  /** Injectable fetch implementation for tests or custom hosts. */
  readonly fetcher?: typeof fetch;
}

/** Loads, validates, caches, and invalidates JSON configuration documents. */
export interface ConfigLoader {
  /** Load a JSON document and validate it before exposing the typed value. */
  load<T>(path: string, validate: ConfigValidator<T>): Promise<T>;
  /** Clear one cached document or the entire in-memory cache. */
  clear(path?: string): void;
  /** Number of documents currently cached or loading. */
  readonly size: number;
}
