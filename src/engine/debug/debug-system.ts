import type { Engine } from "../core";
import { DEFAULT_DEBUG_OVERLAY_OPTIONS } from "./defaults";
import type { DebugOverlay, DebugOverlayOptions } from "./types";

class BrowserDebugOverlay implements DebugOverlay {
  readonly element: HTMLElement;
  private readonly stats: HTMLElement;
  private readonly errorPanel: HTMLElement;
  private readonly logPanel: HTMLElement;
  private readonly maxLogEntries: number;
  private readonly statsIntervalSeconds: number;
  private readonly removePhaseHook: () => void;
  private elapsed = 0;
  private frameCount = 0;
  private disposed = false;

  private readonly onWindowError = (event: ErrorEvent): void => {
    this.reportError(event.error ?? event.message);
  };

  private readonly onUnhandledRejection = (event: PromiseRejectionEvent): void => {
    this.reportError(event.reason);
  };

  constructor(engine: Engine, host: HTMLElement, options: DebugOverlayOptions = {}) {
    this.statsIntervalSeconds = options.statsIntervalSeconds ?? DEFAULT_DEBUG_OVERLAY_OPTIONS.statsIntervalSeconds;
    this.maxLogEntries = options.maxLogEntries ?? DEFAULT_DEBUG_OVERLAY_OPTIONS.maxLogEntries;
    if (!Number.isFinite(this.statsIntervalSeconds) || this.statsIntervalSeconds <= 0) {
      throw new Error("debug: statsIntervalSeconds must be positive");
    }
    if (!Number.isInteger(this.maxLogEntries) || this.maxLogEntries < 1) {
      throw new Error("debug: maxLogEntries must be an integer >= 1");
    }

    this.element = document.createElement("section");
    this.element.setAttribute("aria-label", "Engine diagnostics");
    Object.assign(this.element.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      zIndex: "1000",
      width: "min(320px, calc(100vw - 24px))",
      boxSizing: "border-box",
      padding: "12px",
      border: "1px solid #35404c",
      borderRadius: "8px",
      background: "rgba(10, 14, 20, 0.92)",
      color: "#e7edf4",
      font: "12px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace",
      pointerEvents: "none",
      backdropFilter: "blur(8px)",
    });

    const title = document.createElement("div");
    title.textContent = "CITY ENGINE / DEBUG";
    title.style.fontWeight = "700";
    title.style.letterSpacing = "0.08em";
    title.style.marginBottom = "8px";

    this.stats = document.createElement("div");
    this.stats.textContent = "Waiting for frame data…";
    this.stats.style.color = "#90cdf4";

    this.errorPanel = document.createElement("div");
    this.errorPanel.hidden = true;
    this.errorPanel.setAttribute("role", "alert");
    Object.assign(this.errorPanel.style, {
      marginTop: "8px",
      padding: "8px",
      borderRadius: "5px",
      color: "#fecaca",
      background: "rgba(127, 29, 29, 0.35)",
      whiteSpace: "pre-wrap",
      overflowWrap: "anywhere",
    });

    this.logPanel = document.createElement("div");
    Object.assign(this.logPanel.style, {
      display: "grid",
      gap: "3px",
      maxHeight: "140px",
      overflow: "hidden",
      marginTop: "8px",
      color: "#aab6c4",
    });

    this.element.append(title, this.stats, this.errorPanel, this.logPanel);
    host.append(this.element);

    this.removePhaseHook = engine.on("lateUpdate", (context) => this.updateStats(context.dt));
    window.addEventListener("error", this.onWindowError);
    window.addEventListener("unhandledrejection", this.onUnhandledRejection);
  }

  reportError(error: unknown): void {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    this.errorPanel.textContent = message;
    this.errorPanel.hidden = false;
    this.log(message, "error");
  }

  clearError(): void {
    this.errorPanel.textContent = "";
    this.errorPanel.hidden = true;
  }

  log(message: string, level: "info" | "warn" | "error" = "info"): void {
    const entry = document.createElement("div");
    entry.textContent = message;
    entry.dataset.level = level;
    entry.style.color = level === "error" ? "#fca5a5" : level === "warn" ? "#fcd34d" : "#aab6c4";
    entry.style.overflowWrap = "anywhere";
    this.logPanel.append(entry);
    while (this.logPanel.childElementCount > this.maxLogEntries) {
      this.logPanel.firstElementChild?.remove();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.removePhaseHook();
    window.removeEventListener("error", this.onWindowError);
    window.removeEventListener("unhandledrejection", this.onUnhandledRejection);
    this.element.remove();
  }

  private updateStats(frameSeconds: number): void {
    if (this.disposed) return;
    this.elapsed += Math.max(frameSeconds, 0);
    this.frameCount += 1;
    if (this.elapsed < this.statsIntervalSeconds || this.elapsed === 0) return;

    const fps = this.frameCount / this.elapsed;
    const frameMilliseconds = (this.elapsed / this.frameCount) * 1000;
    this.stats.textContent = `${fps.toFixed(0)} FPS  ·  ${frameMilliseconds.toFixed(1)} ms/frame`;
    this.elapsed = 0;
    this.frameCount = 0;
  }
}

/** Create a DOM diagnostics panel connected to engine frame updates and window errors. */
export function createDebugOverlay(
  engine: Engine,
  host: HTMLElement,
  options: DebugOverlayOptions = {},
): DebugOverlay {
  return new BrowserDebugOverlay(engine, host, options);
}
