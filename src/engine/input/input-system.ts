import type { InputBinding, InputManager, InputManagerOptions } from "./types";

class BrowserInputManager implements InputManager {
  private readonly target: Window;
  private readonly getGamepads: () => ArrayLike<Gamepad | null>;
  private readonly actionBindings = new Map<string, readonly InputBinding[]>();
  private readonly currentValues = new Map<string, number>();
  private readonly previousValues = new Map<string, number>();
  private readonly pressedActions = new Set<string>();
  private readonly releasedActions = new Set<string>();
  private readonly keysDown = new Set<string>();
  private readonly mouseButtonsDown = new Set<number>();
  private pendingMouseX = 0;
  private pendingMouseY = 0;
  private frameMouseX = 0;
  private frameMouseY = 0;
  private gamepads: ArrayLike<Gamepad | null> = [];
  private disposed = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keysDown.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keysDown.delete(event.code);
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    this.mouseButtonsDown.add(event.button);
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    this.mouseButtonsDown.delete(event.button);
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    this.pendingMouseX += event.movementX;
    this.pendingMouseY += event.movementY;
  };

  private readonly onBlur = (): void => {
    this.keysDown.clear();
    this.mouseButtonsDown.clear();
    this.pendingMouseX = 0;
    this.pendingMouseY = 0;
    this.frameMouseX = 0;
    this.frameMouseY = 0;
    this.currentValues.clear();
    this.previousValues.clear();
    this.pressedActions.clear();
    this.releasedActions.clear();
  };

  constructor(options: InputManagerOptions = {}) {
    this.target = options.target ?? window;
    this.getGamepads = options.getGamepads ?? (() => {
      if (typeof navigator === "undefined" || navigator.getGamepads === undefined) return [];
      return navigator.getGamepads();
    });
    if (options.bindings !== undefined) {
      for (const [action, bindings] of Object.entries(options.bindings)) this.bindAction(action, bindings);
    }

    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
    this.target.addEventListener("mousedown", this.onMouseDown);
    this.target.addEventListener("mouseup", this.onMouseUp);
    this.target.addEventListener("mousemove", this.onMouseMove);
    this.target.addEventListener("blur", this.onBlur);
  }

  get mouseDeltaX(): number {
    return this.frameMouseX;
  }

  get mouseDeltaY(): number {
    return this.frameMouseY;
  }

  bindAction(action: string, bindings: readonly InputBinding[]): void {
    const name = action.trim();
    if (name.length === 0) throw new Error("input: action name cannot be empty");
    for (const binding of bindings) this.validateBinding(binding);
    this.actionBindings.set(name, bindings.slice());
    this.currentValues.set(name, 0);
    this.previousValues.set(name, 0);
    this.pressedActions.delete(name);
    this.releasedActions.delete(name);
  }

  unbindAction(action: string): boolean {
    this.currentValues.delete(action);
    this.previousValues.delete(action);
    this.pressedActions.delete(action);
    this.releasedActions.delete(action);
    return this.actionBindings.delete(action);
  }

  isActionDown(action: string): boolean {
    return this.getActionValue(action) > 0;
  }

  wasActionPressed(action: string): boolean {
    return this.pressedActions.has(action);
  }

  wasActionReleased(action: string): boolean {
    return this.releasedActions.has(action);
  }

  getActionValue(action: string): number {
    return this.currentValues.get(action) ?? 0;
  }

  isKeyDown(code: string): boolean {
    return this.keysDown.has(code);
  }

  isMouseButtonDown(button: number): boolean {
    return this.mouseButtonsDown.has(button);
  }

  poll(): void {
    if (this.disposed) return;
    try {
      this.gamepads = this.getGamepads();
    } catch {
      this.gamepads = [];
    }

    this.frameMouseX += this.pendingMouseX;
    this.frameMouseY += this.pendingMouseY;
    this.pendingMouseX = 0;
    this.pendingMouseY = 0;

    for (const [action, bindings] of this.actionBindings) {
      const previous = this.currentValues.get(action) ?? 0;
      this.previousValues.set(action, previous);
      let value = 0;
      for (const binding of bindings) {
        value = Math.max(value, this.readBinding(binding));
      }
      const next = Math.min(value, 1);
      if (previous <= 0 && next > 0) this.pressedActions.add(action);
      if (previous > 0 && next <= 0) this.releasedActions.add(action);
      this.currentValues.set(action, next);
    }
  }

  endFrame(): void {
    this.pressedActions.clear();
    this.releasedActions.clear();
    this.frameMouseX = 0;
    this.frameMouseY = 0;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
    this.target.removeEventListener("mousedown", this.onMouseDown);
    this.target.removeEventListener("mouseup", this.onMouseUp);
    this.target.removeEventListener("mousemove", this.onMouseMove);
    this.target.removeEventListener("blur", this.onBlur);
    this.actionBindings.clear();
    this.currentValues.clear();
    this.previousValues.clear();
    this.pressedActions.clear();
    this.releasedActions.clear();
    this.keysDown.clear();
    this.mouseButtonsDown.clear();
    this.gamepads = [];
  }

  private readBinding(binding: InputBinding): number {
    switch (binding.type) {
      case "key":
        return this.keysDown.has(binding.code) ? 1 : 0;
      case "mouseButton":
        return this.mouseButtonsDown.has(binding.button) ? 1 : 0;
      case "gamepadButton":
        return this.readGamepadButton(binding.button, binding.gamepadIndex);
      case "gamepadAxis":
        return this.readGamepadAxis(binding);
    }
  }

  private readGamepadButton(buttonIndex: number, gamepadIndex?: number): number {
    if (gamepadIndex !== undefined) {
      const button = this.gamepads[gamepadIndex]?.buttons[buttonIndex];
      return button === undefined ? 0 : button.value;
    }
    let value = 0;
    for (let index = 0; index < this.gamepads.length; index++) {
      const button = this.gamepads[index]?.buttons[buttonIndex];
      if (button !== undefined) value = Math.max(value, button.value);
    }
    return value;
  }

  private readGamepadAxis(binding: Extract<InputBinding, { type: "gamepadAxis" }>): number {
    let value = 0;
    const start = binding.gamepadIndex ?? 0;
    const end = binding.gamepadIndex === undefined ? this.gamepads.length : start + 1;
    for (let index = start; index < end; index++) {
      const axis = this.gamepads[index]?.axes[binding.axis];
      if (axis === undefined) continue;
      const directed = Math.max(0, axis * binding.direction);
      const normalized = Math.max(0, (directed - binding.threshold) / (1 - binding.threshold));
      value = Math.max(value, normalized);
    }
    return value;
  }

  private validateBinding(binding: InputBinding): void {
    if (binding.type === "key" && binding.code.trim().length === 0) {
      throw new Error("input: key binding requires a KeyboardEvent.code");
    }
    if (binding.type === "mouseButton" && (!Number.isInteger(binding.button) || binding.button < 0)) {
      throw new Error("input: mouse button must be a non-negative integer");
    }
    if (binding.type === "gamepadButton" && (!Number.isInteger(binding.button) || binding.button < 0)) {
      throw new Error("input: gamepad button must be a non-negative integer");
    }
    if (binding.type === "gamepadAxis") {
      if (!Number.isInteger(binding.axis) || binding.axis < 0) {
        throw new Error("input: gamepad axis must be a non-negative integer");
      }
      if (!Number.isFinite(binding.threshold) || binding.threshold < 0 || binding.threshold >= 1) {
        throw new Error("input: gamepad axis threshold must be in [0, 1)");
      }
    }
    if (
      "gamepadIndex" in binding &&
      binding.gamepadIndex !== undefined &&
      (!Number.isInteger(binding.gamepadIndex) || binding.gamepadIndex < 0)
    ) {
      throw new Error("input: gamepad index must be a non-negative integer");
    }
  }
}

/** Create a keyboard, mouse, and gamepad input manager with named action bindings. */
export function createInputManager(options: InputManagerOptions = {}): InputManager {
  return new BrowserInputManager(options);
}
