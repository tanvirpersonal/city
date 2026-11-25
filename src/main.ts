import { DEFAULT_CORE_CONFIG, createEngine } from "@engine/core";
import type { Engine } from "@engine/core";
import { createEcsRuntime } from "@engine/ecs";
import { createEventBus } from "@engine/events";
import type { EventBus } from "@engine/events";
import { createServiceRegistry } from "@engine/services";
import type { ServiceMap } from "@engine/services";
import { createConfigLoader, isRuntimeConfig, RUNTIME_CONFIG_PATH } from "@engine/config";
import type { ConfigLoader } from "@engine/config";
import { createAssetManager } from "@engine/assets";
import type { AssetManager } from "@engine/assets";
import { createInputManager } from "@engine/input";
import type { InputManager } from "@engine/input";
import { createDebugOverlay } from "@engine/debug";
import type { DebugOverlay } from "@engine/debug";
import { createRenderer, DEFAULT_QUALITY, loadQualityPreset } from "@engine/render";
import type { Renderer } from "@engine/render";
import {
  createHelloEngineScene,
  HELLO_SCENE_CONFIG_PATH,
  isHelloSceneConfig,
} from "@games/sample-city";
import type { HelloSceneConfig } from "@games/sample-city";

type RuntimeEvents = {
  "engine:ready": { readonly configLoaded: boolean };
  "engine:error": { readonly error: unknown };
};

interface RuntimeServices extends ServiceMap {
  engine: Engine;
  ecs: ReturnType<typeof createEcsRuntime>;
  events: EventBus<RuntimeEvents>;
  config: ConfigLoader;
  assets: AssetManager;
  input: InputManager;
  debug: DebugOverlay;
  renderer: Renderer;
}

/**
 * Create the renderer on its own inset canvas (a self-test cube) and drive it from the engine
 * `render` phase. Failure is reported and skipped so the Phase 1 demo keeps running.
 */
async function mountRenderer(
  engine: Engine,
  root: HTMLElement,
  config: ConfigLoader,
  clearColor: string,
  debug: DebugOverlay,
): Promise<{ readonly renderer: Renderer | undefined; dispose(): void }> {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "Renderer self-test");
  Object.assign(canvas.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    zIndex: "900",
    width: "min(320px, calc(100vw - 24px))",
    height: "200px",
    border: "1px solid #35404c",
    borderRadius: "8px",
  });
  root.append(canvas);

  try {
    const quality = await loadQualityPreset(config, DEFAULT_QUALITY);
    const renderer = await createRenderer({
      canvas,
      quality,
      clearColor,
      showTestCube: true,
      onWarning: (message) => debug.log(message, "warn"),
    });
    const resize = (): void => {
      const bounds = canvas.getBoundingClientRect();
      renderer.resize(bounds.width, bounds.height, window.devicePixelRatio || 1);
    };
    resize();
    window.addEventListener("resize", resize);
    const removeRenderHook = engine.on("render", (frame) => renderer.render(frame.alpha));
    debug.setExtraStats(
      () => `${renderer.backend} · ${renderer.quality.name} · ${renderer.stats.drawCalls} draws · ${renderer.stats.triangles} tris`,
    );
    debug.log(`Renderer online: ${renderer.backend}, quality ${renderer.quality.name}.`);
    return {
      renderer,
      dispose: (): void => {
        debug.setExtraStats(undefined);
        removeRenderHook();
        window.removeEventListener("resize", resize);
        renderer.dispose();
        canvas.remove();
      },
    };
  } catch (error) {
    canvas.remove();
    debug.reportError(error);
    debug.log("Renderer unavailable; continuing without the 3D self-test.", "warn");
    return { renderer: undefined, dispose: (): void => undefined };
  }
}

/** Bootstrap the browser demo and register each Phase 1 system as a shared service. */
async function bootstrap(root: HTMLElement): Promise<void> {
  const config = createConfigLoader({ baseUrl: "." });
  let configError: unknown;
  const runtimeConfig = await config.load(RUNTIME_CONFIG_PATH, isRuntimeConfig).catch((error: unknown) => {
    configError = error;
    return { core: { ...DEFAULT_CORE_CONFIG } };
  });
  const sceneConfig: HelloSceneConfig = await config.load(HELLO_SCENE_CONFIG_PATH, isHelloSceneConfig);

  const engine = createEngine(runtimeConfig.core);
  const ecs = createEcsRuntime(engine);
  const events = createEventBus<RuntimeEvents>();
  const services = createServiceRegistry<RuntimeServices>();
  const assets = createAssetManager({
    baseUrl: ".",
    onWarning: (message, reason) => console.warn(message, reason),
  });
  const input = createInputManager({
    bindings: {
      "toggle-spin": [{ type: "key", code: "Space" }],
    },
  });

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-label", "Rotating 3D wireframe cube demo");
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
  });
  root.replaceChildren(canvas);

  const debug = createDebugOverlay(engine, root);
  const disposeScene = createHelloEngineScene(engine, canvas, input, sceneConfig);
  const removeInputPhase = engine.on("input", () => input.poll());
  // Registered after the demo scene so transient input survives every render consumer.
  const clearInputFrame = engine.on("render", () => input.endFrame());
  events.on("engine:error", ({ error }) => debug.reportError(error));
  const rendering = await mountRenderer(engine, root, config, sceneConfig.backgroundColor, debug);

  services.register("engine", engine);
  services.register("ecs", ecs);
  services.register("events", events);
  services.register("config", config);
  services.register("assets", assets);
  services.register("input", input);
  services.register("debug", debug);
  if (rendering.renderer !== undefined) services.register("renderer", rendering.renderer);

  if (configError !== undefined) {
    debug.reportError(configError);
    debug.log("Using the built-in core loop defaults until the config file is available.", "warn");
  }

  engine.start();
  events.emit("engine:ready", { configLoaded: configError === undefined });
  debug.log("Core, ECS, events, services, config, assets, input, and debug are online.");

  window.addEventListener("pagehide", () => {
    disposeScene();
    rendering.dispose();
    removeInputPhase();
    clearInputFrame();
    input.dispose();
    debug.dispose();
    ecs.dispose();
    engine.dispose();
    services.clear();
  }, { once: true });
}

const root = document.getElementById("app");
if (root === null) {
  throw new Error("City Engine: #app element not found in index.html");
}

void bootstrap(root).catch((error: unknown) => {
  console.error("City Engine failed to start:", error);
  root.replaceChildren(document.createTextNode("City Engine failed to start. See the browser console for details."));
});
