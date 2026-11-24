/** Shared types for the core system. See docs/ARCHITECTURE.md §3 for the loop design. */

/**
 * Phases run in this order each frame. input, fixedUpdate and physics run
 * zero or more times per frame (fixed timestep); the others run once.
 */
export const PHASES = ["input", "fixedUpdate", "physics", "update", "lateUpdate", "render"] as const;

export type Phase = (typeof PHASES)[number];

/** Phases that run inside the fixed-timestep loop. */
export type FixedPhase = "input" | "fixedUpdate" | "physics";

/**
 * Data handed to every phase handler. The same object is reused every call
 * (no per-frame allocation), so handlers must not keep a reference to it.
 */
export interface FrameContext {
  /** Seconds covered by this call: FIXED_DT for fixed phases, frame time otherwise. */
  dt: number;
  /** Render interpolation factor in [0, 1). Only meaningful in non-fixed phases. */
  alpha: number;
  /** Seconds of simulated (fixed-step) time since start. */
  simTime: number;
  /** Fixed steps executed since start. */
  fixedStep: number;
  /** Frames rendered since start. */
  frame: number;
}

export type PhaseHandler = (ctx: FrameContext) => void;

/** Tunable loop numbers. Defaults live in defaults.ts; the config loader can override them later. */
export interface CoreConfig {
  /** Fixed simulation rate in Hz (D-011: 60). */
  fixedHz: number;
  /** Longest real frame time accepted, in seconds. Longer frames are clamped (tab was hidden, debugger, etc.). */
  maxFrameSeconds: number;
  /** Safety cap on fixed steps per frame so a slow frame cannot spiral. */
  maxStepsPerFrame: number;
}

/** Where frames come from. Injected so the loop can run in a browser or a test. */
export interface FrameScheduler {
  /** Current time in milliseconds. */
  now(): number;
  /** Ask for one callback on the next frame; returns a handle for cancel(). */
  request(callback: (nowMs: number) => void): number;
  cancel(handle: number): void;
}

export type EngineState = "created" | "running" | "stopped" | "disposed";

/** Public engine handle returned by createEngine(). */
export interface Engine {
  readonly state: EngineState;
  /** Register a handler for a phase. Returns an unsubscribe function. */
  on(phase: Phase, handler: PhaseHandler): () => void;
  /** Start the loop. Safe to call again after stop(). */
  start(): void;
  /** Pause the loop. Handlers stay registered. */
  stop(): void;
  /** Stop and drop all handlers. The engine cannot be restarted. */
  dispose(): void;
}
