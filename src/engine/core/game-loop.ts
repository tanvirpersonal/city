import type { CoreConfig, FrameContext, FrameScheduler, Phase, PhaseHandler } from "./types";

/** Handlers for each phase, in registration order. */
export type PhaseTable = Record<Phase, PhaseHandler[]>;

export interface GameLoop {
  /** True between start() and stop(). */
  readonly running: boolean;
  start(): void;
  stop(): void;
  /**
   * Advance the simulation by one real frame of `frameSeconds`.
   * Exposed so tests and tools can drive the loop without a scheduler.
   */
  advance(frameSeconds: number): void;
}

export function createPhaseTable(): PhaseTable {
  return { input: [], fixedUpdate: [], physics: [], update: [], lateUpdate: [], render: [] };
}

function run(handlers: PhaseHandler[], ctx: FrameContext): void {
  // Index loop on purpose: no iterator allocation in the hot path.
  for (let i = 0; i < handlers.length; i++) {
    const handler = handlers[i];
    if (handler === undefined) continue;
    handler(ctx);
    // A handler that unsubscribed itself (or an earlier one) shifted the list left:
    // step back so the handler that moved into this slot is not skipped.
    if (handlers[i] !== handler) i--;
  }
}

/**
 * Fixed-timestep loop with interpolated rendering (docs/ARCHITECTURE.md §3):
 * accumulate real time, run input/fixedUpdate/physics in FIXED_DT slices,
 * then run update/lateUpdate/render once with alpha = leftover / FIXED_DT.
 */
export function createGameLoop(config: CoreConfig, phases: PhaseTable, scheduler: FrameScheduler): GameLoop {
  const fixedDt = 1 / config.fixedHz;
  const ctx: FrameContext = { dt: fixedDt, alpha: 0, simTime: 0, fixedStep: 0, frame: 0 };
  let accumulator = 0;
  let running = false;
  let handle = -1;
  let lastMs = 0;

  function advance(frameSeconds: number): void {
    const frame = Math.min(Math.max(frameSeconds, 0), config.maxFrameSeconds);
    accumulator += frame;

    let steps = 0;
    while (accumulator >= fixedDt && steps < config.maxStepsPerFrame) {
      ctx.dt = fixedDt;
      ctx.alpha = 0;
      run(phases.input, ctx);
      run(phases.fixedUpdate, ctx);
      run(phases.physics, ctx);
      ctx.fixedStep++;
      ctx.simTime += fixedDt;
      accumulator -= fixedDt;
      steps++;
    }
    // Hit the step cap: drop the backlog instead of chasing it forever.
    if (steps === config.maxStepsPerFrame && accumulator >= fixedDt) {
      accumulator = 0;
    }

    ctx.dt = frame;
    ctx.alpha = accumulator / fixedDt;
    run(phases.update, ctx);
    run(phases.lateUpdate, ctx);
    run(phases.render, ctx);
    ctx.frame++;
  }

  function tick(nowMs: number): void {
    if (!running) return;
    // Schedule first so an error in a handler does not silently kill the loop in release builds.
    handle = scheduler.request(tick);
    const seconds = (nowMs - lastMs) / 1000;
    lastMs = nowMs;
    advance(seconds);
  }

  return {
    get running(): boolean {
      return running;
    },
    start(): void {
      if (running) return;
      running = true;
      lastMs = scheduler.now();
      handle = scheduler.request(tick);
    },
    stop(): void {
      if (!running) return;
      running = false;
      scheduler.cancel(handle);
    },
    advance,
  };
}
