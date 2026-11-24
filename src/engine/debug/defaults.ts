import type { DebugOverlayOptions } from "./types";

/** Default diagnostic refresh cadence and retained log history. */
export const DEFAULT_DEBUG_OVERLAY_OPTIONS: Required<DebugOverlayOptions> = {
  statsIntervalSeconds: 0.5,
  maxLogEntries: 6,
};
