/** Public API of the core system. Other code imports only from here. */
export { createEngine, createBrowserScheduler } from "./core-system";
export { DEFAULT_CORE_CONFIG } from "./defaults";
export { PHASES } from "./types";
export type {
  CoreConfig,
  Engine,
  EngineState,
  FixedPhase,
  FrameContext,
  FrameScheduler,
  Phase,
  PhaseHandler,
} from "./types";
