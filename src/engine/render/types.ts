/** Shared types for the render system. Design: docs/RENDERING.md (decisions D-003, D-010). */

/** Graphics backend in use. WebGPU is tried first; WebGL2 is the automatic fallback (D-003). */
export type RenderBackend = "webgpu" | "webgl2";

export const QUALITY_NAMES = ["low", "medium", "high", "ultra"] as const;

export type QualityName = (typeof QUALITY_NAMES)[number];

export type AntiAliasingMode = "fxaa" | "taa";

/**
 * One quality level, loaded from `assets/data/quality/<name>.json`.
 * The renderer reads these values and nothing else decides quality (docs/RENDERING.md §9).
 */
export interface QualityPreset {
  /** JSON schema version of the preset file. */
  readonly version: number;
  readonly name: QualityName;
  /** Multiplier on the canvas pixel size, in (0, 1]. */
  readonly renderScale: number;
  /** Number of sun shadow cascades. */
  readonly shadowCascades: number;
  /** Shadow map edge length in texels (power of two). */
  readonly shadowMapSize: number;
  readonly ssao: boolean;
  readonly ssr: boolean;
  readonly antiAliasing: AntiAliasingMode;
  /** Most local (point/spot) lights allowed to cast shadows. */
  readonly maxShadowLocalLights: number;
  /** How many chunks around the camera stay loaded. */
  readonly viewDistanceChunks: number;
  readonly depthOfField: boolean;
  readonly motionBlur: boolean;
}

/** Per-frame numbers shown in the debug overlay (docs/RENDERING.md §7 draw budget). */
export interface RenderStats {
  readonly drawCalls: number;
  readonly triangles: number;
}

export interface RendererOptions {
  readonly canvas: HTMLCanvasElement;
  readonly quality: QualityPreset;
  /** Skip the WebGPU attempt and go straight to WebGL2. */
  readonly forceWebGL2?: boolean;
  /** CSS color of the empty background. Defaults to DEFAULT_CLEAR_COLOR. */
  readonly clearColor?: string;
  /** Draw a spinning self-test cube so a blank scene still proves the backend works. */
  readonly showTestCube?: boolean;
  /** Receives one-line warnings such as "WebGPU unavailable, using WebGL2". */
  readonly onWarning?: (message: string, reason?: unknown) => void;
}

/** Public renderer handle returned by createRenderer(). */
export interface Renderer {
  /** Backend that is actually active. */
  readonly backend: RenderBackend;
  /** Preset that is currently applied. */
  readonly quality: QualityPreset;
  /** Draw calls and triangles of the last rendered frame. */
  readonly stats: RenderStats;
  /** Apply another quality preset without recreating the renderer. */
  setQuality(preset: QualityPreset): void;
  /** Set the CSS-pixel size of the drawing surface; the preset's render scale is applied on top. */
  resize(width: number, height: number, pixelRatio: number): void;
  /** Draw one frame. `alpha` is the fixed-step interpolation factor in [0, 1). */
  render(alpha: number): void;
  /** Release GPU resources. The renderer cannot be used afterwards. */
  dispose(): void;
}
