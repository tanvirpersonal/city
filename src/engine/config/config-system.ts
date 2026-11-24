import type { ConfigLoader, ConfigLoaderOptions, ConfigValidator } from "./types";

class JsonConfigLoader implements ConfigLoader {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;
  private readonly cache = new Map<string, Promise<unknown>>();

  constructor(options: ConfigLoaderOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "assets/data").replace(/\/+$/, "");
    // Native browser fetch must be invoked with the global object as its receiver.
    this.fetcher = (options.fetcher ?? globalThis.fetch).bind(globalThis);
  }

  get size(): number {
    return this.cache.size;
  }

  load<T>(path: string, validate: ConfigValidator<T>): Promise<T> {
    const safePath = this.validatePath(path);
    const cached = this.cache.get(safePath);
    if (cached !== undefined) return cached as Promise<T>;

    const pending = this.fetchAndValidate(safePath, validate);
    this.cache.set(safePath, pending);
    // Failed requests are not cached permanently; callers can retry after fixing a missing file.
    void pending.catch(() => {
      if (this.cache.get(safePath) === pending) this.cache.delete(safePath);
    });
    return pending;
  }

  clear(path?: string): void {
    if (path === undefined) {
      this.cache.clear();
      return;
    }
    this.cache.delete(this.validatePath(path));
  }

  private async fetchAndValidate<T>(path: string, validate: ConfigValidator<T>): Promise<T> {
    const url = `${this.baseUrl}/${path}`;
    let response: Response;
    try {
      response = await this.fetcher(url);
    } catch (error) {
      throw new Error(`config: failed to fetch "${path}" from ${url}`, { cause: error });
    }
    if (!response.ok) {
      throw new Error(`config: request for "${path}" failed with HTTP ${response.status}`);
    }

    let value: unknown;
    try {
      value = await response.json();
    } catch (error) {
      throw new Error(`config: "${path}" is not valid JSON`, { cause: error });
    }
    if (!validate(value)) throw new Error(`config: "${path}" did not match its expected shape`);
    return value;
  }

  private validatePath(path: string): string {
    const normalized = path.trim().replace(/^\/+/, "");
    if (
      normalized.length === 0 ||
      normalized.split("/").some((part) => part === ".." || part === "." || part.length === 0) ||
      normalized.includes("\\") ||
      normalized.includes("?") ||
      normalized.includes("#") ||
      normalized.includes("://")
    ) {
      throw new Error(`config: invalid relative path "${path}"`);
    }
    return normalized;
  }
}

/** Create a browser-friendly JSON loader with in-flight request deduplication and validation. */
export function createConfigLoader(options: ConfigLoaderOptions = {}): ConfigLoader {
  return new JsonConfigLoader(options);
}
