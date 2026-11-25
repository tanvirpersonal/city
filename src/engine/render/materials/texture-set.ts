import { NoColorSpace, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three/webgpu";
import type { Texture } from "three/webgpu";
import type { AssetManager } from "../../assets";
import { TEXTURE_SLOTS } from "./types";
import type { TextureSlot } from "./types";

/** The maps that were found in a texture folder. A missing map is simply absent. */
export type TextureSet = Readonly<Partial<Record<TextureSlot, Texture>>>;

/** File name of each slot inside a texture folder (ASSETS.md §2). */
export const TEXTURE_FILES: Readonly<Record<TextureSlot, string>> = {
  albedo: "albedo.jpg",
  normal: "normal.png",
  roughness: "roughness.jpg",
  metallic: "metallic.jpg",
  ao: "ao.jpg",
  height: "height.jpg",
  emissive: "emissive.jpg",
};

/** Slots holding color data; every other map is linear data. */
const SRGB_SLOTS: readonly TextureSlot[] = ["albedo", "emissive"];

const textureLoader = new TextureLoader();

/** Load one map through the asset manager; resolves to null (with one warning) when the file is missing. */
function loadSlot(assets: AssetManager, folder: string, slot: TextureSlot): Promise<Texture | null> {
  const path = `${folder}/${TEXTURE_FILES[slot]}`;
  return assets.load<Texture | null>(
    path,
    path,
    async (url) => {
      const texture = await textureLoader.loadAsync(url);
      texture.colorSpace = SRGB_SLOTS.includes(slot) ? SRGBColorSpace : NoColorSpace;
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      return texture;
    },
    () => null,
  );
}

/**
 * Load a PBR texture folder. Only `albedo` is required (ASSETS.md §2): when it is missing the
 * whole set is treated as absent after a single warning, so an owner who has not pasted textures
 * yet does not get one warning per map. The caller then falls back to flat material values,
 * which give the same result as the default maps (flat normal, no metal, full AO).
 */
export async function loadTextureSet(assets: AssetManager, folder: string): Promise<TextureSet> {
  const albedo = await loadSlot(assets, folder, "albedo");
  if (albedo === null) return {};

  const optional = TEXTURE_SLOTS.filter((slot) => slot !== "albedo");
  const loaded = await Promise.all(optional.map((slot) => loadSlot(assets, folder, slot)));
  const maps: Partial<Record<TextureSlot, Texture>> = { albedo };
  optional.forEach((slot, index) => {
    const texture = loaded[index];
    if (texture !== null && texture !== undefined) maps[slot] = texture;
  });
  return maps;
}
