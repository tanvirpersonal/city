import type { Engine } from "../core";

/** Debug overlay configuration. */
export interface DebugOverlayOptions {
  /** Seconds between visible stats refreshes. */
  readonly statsIntervalSeconds?: number;
  /** Maximum number of log lines retained in the panel. */
  readonly maxLogEntries?: number;
}

/** Small in-browser diagnostics panel with frame stats, errors, and logs. */
export interface DebugOverlay {
  /** Root element owned by the overlay. */
  readonly element: HTMLElement;
  /** Show an error in the on-screen error panel and add it to the log. */
  reportError(error: unknown): void;
  /** Clear the current visible error. */
  clearError(): void;
  /** Append a safe text-only diagnostic message. */
  log(message: string, level?: "info" | "warn" | "error"): void;
  /** Remove engine hooks, browser listeners, and DOM nodes. */
  dispose(): void;
}

/** Create an engine-connected diagnostics overlay inside the supplied host element. */
export function createDebugOverlay(
  engine: Engine,
  host: HTMLElement,
  options?: DebugOverlayOptions,
): DebugOverlay;
