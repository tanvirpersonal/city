import type {
  AssetLoader,
  AssetManager,
  AssetManagerOptions,
  AssetPlaceholder,
} from "./types";

interface AssetRecord {
  readonly path: string;
  readonly promise: Promise<unknown>;
}

class BrowserAssetManager implements AssetManager {
  private readonly baseUrl: string;
  private readonly onWarning: NonNullable<AssetManagerOptions["onWarning"]>;
  private readonly cache = new Map<string, AssetRecord>();
  private readonly warned = new Set<string>();

  constructor(options: AssetManagerOptions = {}) {
    this.baseUrl = (options.baseUrl ?? ".").replace(/\/+$/, "");
    this.onWarning = options.onWarning ?? ((message, reason) => console.warn(message, reason));
  }

  get size(): number {
    return this.cache.size;
  }

  load<T>(
    key: string,
    path: string,
    loader: AssetLoader<T>,
    placeholder: AssetPlaceholder<T>,
  ): Promise<T> {
    const safeKey = key.trim();
    if (safeKey.length === 0) throw new Error("assets: asset key cannot be empty");
    const safePath = this.validatePath(path);
    const cached = this.cache.get(safeKey);
    if (cached !== undefined) {
      if (cached.path !== safePath) {
        throw new Error(`assets: key "${safeKey}" is already assigned to "${cached.path}"`);
      }
      return cached.promise as Promise<T>;
    }

    const url = `${this.baseUrl}/${safePath}`;
    const pending = this.loadWithFallback(safeKey, safePath, url, loader, placeholder);
    const record: AssetRecord = { path: safePath, promise: pending };
    this.cache.set(safeKey, record);
    void pending.catch(() => {
      if (this.cache.get(safeKey) === record) this.cache.delete(safeKey);
    });
    return pending;
  }

  clear(key?: string): void {
    if (key === undefined) {
      this.cache.clear();
      return;
    }
    this.cache.delete(key);
  }

  private async loadWithFallback<T>(
    key: string,
    path: string,
    url: string,
    loader: AssetLoader<T>,
    placeholder: AssetPlaceholder<T>,
  ): Promise<T> {
    try {
      return await loader(url);
    } catch (reason) {
      if (!this.warned.has(key)) {
        this.warned.add(key);
        this.onWarning(`assets: could not load "${path}", using a placeholder`, reason);
      }
      return placeholder(path, reason);
    }
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
      throw new Error(`assets: invalid relative path "${path}"`);
    }
    return normalized;
  }
}

/** Create a browser asset manager with deduplicated loads and graceful placeholder fallback. */
export function createAssetManager(options: AssetManagerOptions = {}): AssetManager {
  return new BrowserAssetManager(options);
}
