import { resolveCoreConfig } from "./defaults";
import { createGameLoop, createPhaseTable } from "./game-loop";
import type { CoreConfig, Engine, EngineState, FrameScheduler, Phase, PhaseHandler } from "./types";

/** Scheduler backed by requestAnimationFrame and performance.now(). */
export function createBrowserScheduler(): FrameScheduler {
  return {
    now: () => performance.now(),
    request: (callback) => requestAnimationFrame(callback),
    cancel: (handle) => cancelAnimationFrame(handle),
  };
}

/**
 * Create the engine bootstrap: lifecycle plus phase hooks. Other systems
 * (ecs, physics, render...) register their work with engine.on(phase, fn);
 * core never imports them (AI_RULES §4.2).
 */
export function createEngine(
  overrides: Partial<CoreConfig> = {},
  scheduler: FrameScheduler = createBrowserScheduler(),
): Engine {
  const config = resolveCoreConfig(overrides);
  const phases = createPhaseTable();
  const loop = createGameLoop(config, phases, scheduler);
  let state: EngineState = "created";

  return {
    get state(): EngineState {
      return state;
    },
    on(phase: Phase, handler: PhaseHandler): () => void {
      if (state === "disposed") throw new Error("core: cannot register handlers on a disposed engine");
      phases[phase].push(handler);
      return () => {
        const list = phases[phase];
        const index = list.indexOf(handler);
        if (index !== -1) list.splice(index, 1);
      };
    },
    start(): void {
      if (state === "disposed") throw new Error("core: cannot start a disposed engine");
      loop.start();
      state = "running";
    },
    stop(): void {
      if (state !== "running") return;
      loop.stop();
      state = "stopped";
    },
    dispose(): void {
      if (state === "disposed") return;
      loop.stop();
      for (const list of Object.values(phases)) list.length = 0;
      state = "disposed";
    },
  };
}
