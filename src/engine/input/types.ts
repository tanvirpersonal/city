/** Supported physical inputs that can drive a named action. */
export type InputBinding =
  | { readonly type: "key"; readonly code: string }
  | { readonly type: "mouseButton"; readonly button: number }
  | { readonly type: "gamepadButton"; readonly button: number; readonly gamepadIndex?: number }
  | {
      readonly type: "gamepadAxis";
      readonly axis: number;
      readonly direction: -1 | 1;
      readonly threshold: number;
      readonly gamepadIndex?: number;
    };

/** Action names mapped to one or more physical bindings. */
export type InputActionMap = Readonly<Record<string, readonly InputBinding[]>>;

/** Optional browser event and gamepad providers, mainly useful for tests. */
export interface InputManagerOptions {
  readonly target?: Window;
  readonly getGamepads?: () => readonly (Gamepad | null)[];
  readonly bindings?: InputActionMap;
}

/** Browser input snapshot and action mapping API. */
export interface InputManager {
  /** Replace or add the bindings for an action. */
  bindAction(action: string, bindings: readonly InputBinding[]): void;
  /** Remove an action and its cached state. */
  unbindAction(action: string): boolean;
  /** Whether an action is currently active. */
  isActionDown(action: string): boolean;
  /** True only on the poll where an action becomes active. */
  wasActionPressed(action: string): boolean;
  /** True only on the poll where an action becomes inactive. */
  wasActionReleased(action: string): boolean;
  /** Combined action intensity in [0, 1]. */
  getActionValue(action: string): number;
  /** Current physical key and mouse-button state. */
  isKeyDown(code: string): boolean;
  isMouseButtonDown(button: number): boolean;
  /** Mouse movement accumulated since the previous input poll. */
  readonly mouseDeltaX: number;
  readonly mouseDeltaY: number;
  /** Poll gamepads and publish action transitions. Called in the engine input phase. */
  poll(): void;
  /** Remove browser listeners and clear state. */
  dispose(): void;
}
