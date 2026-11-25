import {
  BoxGeometry,
  Color,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
} from "three/webgpu";
import { DEFAULT_CAMERA, DEFAULT_CLEAR_COLOR, TEST_CUBE } from "./defaults";
import type { QualityPreset, RenderBackend, Renderer, RendererOptions, RenderStats } from "./types";

/** WebGPURenderer picks WebGPU or its WebGL2 fallback backend during init(); read which one won. */
function detectBackend(renderer: WebGPURenderer): RenderBackend {
  const backend: object = renderer.backend;
  return "isWebGPUBackend" in backend && backend.isWebGPUBackend === true ? "webgpu" : "webgl2";
}

/**
 * Create the renderer for a canvas. Tries WebGPU first and falls back to WebGL2 automatically
 * (D-003); the active backend is reported through `onWarning` when it is the fallback.
 * Rejects when neither backend can start.
 */
export async function createRenderer(options: RendererOptions): Promise<Renderer> {
  const { canvas, onWarning } = options;
  const gpu = new WebGPURenderer({
    canvas,
    // Hardware MSAA stands in until the FXAA/TAA passes exist (PLAN.md Phase 2, post-processing).
    antialias: true,
    forceWebGL: options.forceWebGL2 === true,
  });
  await gpu.init();

  const backend = detectBackend(gpu);
  if (backend === "webgl2" && options.forceWebGL2 !== true) {
    onWarning?.("Render: WebGPU is unavailable, using the WebGL2 fallback.");
  }

  const scene = new Scene();
  scene.background = new Color(options.clearColor ?? DEFAULT_CLEAR_COLOR);
  const camera = new PerspectiveCamera(DEFAULT_CAMERA.fovDegrees, 1, DEFAULT_CAMERA.near, DEFAULT_CAMERA.far);
  camera.position.set(0, 0, DEFAULT_CAMERA.distance);

  let testCube: Mesh | undefined;
  if (options.showTestCube === true) {
    testCube = new Mesh(
      new BoxGeometry(TEST_CUBE.size, TEST_CUBE.size, TEST_CUBE.size),
      new MeshNormalMaterial(),
    );
    scene.add(testCube);
  }

  let quality: QualityPreset = options.quality;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let lastTimeMs = performance.now();
  let disposed = false;
  // One object reused every frame: no per-frame allocation (AI_RULES §4.9).
  const stats = { drawCalls: 0, triangles: 0 };

  const applySize = (): void => {
    gpu.setPixelRatio(pixelRatio * quality.renderScale);
    gpu.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  return {
    backend,
    get quality(): QualityPreset {
      return quality;
    },
    get stats(): RenderStats {
      return stats;
    },
    setQuality(preset: QualityPreset): void {
      quality = preset;
      applySize();
    },
    resize(nextWidth: number, nextHeight: number, nextPixelRatio: number): void {
      width = Math.max(nextWidth, 1);
      height = Math.max(nextHeight, 1);
      pixelRatio = Math.max(nextPixelRatio, 1);
      applySize();
    },
    // `_alpha` is the fixed-step interpolation factor; it is used once ECS Transform
    // components are drawn (PLAN.md Phase 2, instancing). The self-test cube spins on wall time.
    render(_alpha: number): void {
      if (disposed) return;
      const nowMs = performance.now();
      if (testCube !== undefined) {
        testCube.rotation.y += ((nowMs - lastTimeMs) / 1000) * TEST_CUBE.spinRadiansPerSecond;
        testCube.rotation.x = testCube.rotation.y * 0.5;
      }
      lastTimeMs = nowMs;
      gpu.render(scene, camera);
      stats.drawCalls = gpu.info.render.drawCalls;
      stats.triangles = gpu.info.render.triangles;
    },
    dispose(): void {
      if (disposed) return;
      disposed = true;
      if (testCube !== undefined) {
        testCube.geometry.dispose();
        (testCube.material as MeshNormalMaterial).dispose();
      }
      void gpu.dispose();
    },
  };
}
