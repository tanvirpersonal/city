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
  /**
   * Show one extra text line under the FPS line, refreshed with the stats interval.
   * Pass undefined to remove it. Used by the renderer for draw calls and triangles.
   */
  setExtraStats(provider: (() => string) | undefined): void;
  /** Append a safe text-only diagnostic message. */
  log(message: string, level?: "info" | "warn" | "error"): void;
  /** Remove engine hooks, browser listeners, and DOM nodes. */
  dispose(): void;
}

