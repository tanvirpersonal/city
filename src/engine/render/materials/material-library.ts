import type { AssetManager } from "../../assets";
import type { ConfigLoader } from "../../config";
import { loadMaterialCategories } from "./categories";
import type { MaterialCategories } from "./categories";
import { isMaterialDefinition, isMaterialName } from "./definition";
import { createFlatPbrMaterial, createPbrMaterial, resolveMaterialParams } from "./material-factory";
import { loadTextureSet } from "./texture-set";
import type { RenderMaterial } from "./types";

export interface MaterialLibraryOptions {
  readonly config: ConfigLoader;
  readonly assets: AssetManager;
  /** Receives one line when a material had to fall back to a flat placeholder. */
  readonly onWarning?: (message: string, reason?: unknown) => void;
}

/** Loads materials by name from `assets/data/materials/<name>.json` and caches them. */
export interface MaterialLibrary {
  /** Get a material by name. Never rejects: an unknown or broken material becomes a flat placeholder. */
  get(name: string): Promise<RenderMaterial>;
  /** Number of materials created so far. */
  readonly size: number;
  /** Dispose every material and its texture copies. The library cannot be used afterwards. */
  dispose(): void;
}

const MAP_KEYS = ["map", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "emissiveMap"] as const;

function disposeMaterial(material: RenderMaterial): void {
  for (const key of MAP_KEYS) material[key]?.dispose();
  material.dispose();
}

/**
 * Create a material library. Rejects when `categories.json` cannot be loaded, because no
 * placeholder look exists without it; individual materials never reject.
 */
export async function createMaterialLibrary(options: MaterialLibraryOptions): Promise<MaterialLibrary> {
  const { config, assets, onWarning } = options;
  const categories: MaterialCategories = await loadMaterialCategories(config);
  const cache = new Map<string, Promise<RenderMaterial>>();
  let disposed = false;

  const create = async (name: string): Promise<RenderMaterial> => {
    try {
      if (!isMaterialName(name)) throw new Error(`invalid material name "${name}"`);
      const definition = await config.load(`data/materials/${name}.json`, isMaterialDefinition);
      if (definition.name !== name) throw new Error(`file declares name "${definition.name}"`);
      const textures = definition.textureFolder === undefined
        ? {}
        : await loadTextureSet(assets, definition.textureFolder);
      return createPbrMaterial(resolveMaterialParams(definition, categories), textures);
    } catch (reason) {
      onWarning?.(`materials: "${name}" is unavailable, using a flat placeholder`, reason);
      return createFlatPbrMaterial(resolveMaterialParams({ version: 1, name, category: "generic" }, categories));
    }
  };

  return {
    get(name: string): Promise<RenderMaterial> {
      if (disposed) return Promise.reject(new Error("materials: the library is disposed"));
      const cached = cache.get(name);
      if (cached !== undefined) return cached;
      const created = create(name);
      cache.set(name, created);
      return created;
    },
    get size(): number {
      return cache.size;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      for (const pending of cache.values()) void pending.then(disposeMaterial);
      cache.clear();
    },
  };
}
