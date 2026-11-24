import type { Engine } from "@engine/core";
import type { InputManager } from "@engine/input";

/** Data-driven visual settings for the first browser demo scene. */
export interface HelloSceneConfig {
  readonly cubeScale: number;
  readonly cameraDistance: number;
  readonly focalLength: number;
  readonly rotationSpeed: number;
  readonly verticalRotationFactor: number;
  readonly backgroundColor: string;
  readonly edgeColor: string;
  readonly accentColor: string;
}

/** Relative to the config loader base URL. */
export const HELLO_SCENE_CONFIG_PATH = "demo/hello-engine.json";

/** Validate the JSON settings before they reach the render loop. */
export function isHelloSceneConfig(value: unknown): value is HelloSceneConfig {
  if (typeof value !== "object" || value === null) return false;
  if (
    !("cubeScale" in value) ||
    !("cameraDistance" in value) ||
    !("focalLength" in value) ||
    !("rotationSpeed" in value) ||
    !("verticalRotationFactor" in value) ||
    !("backgroundColor" in value) ||
    !("edgeColor" in value) ||
    !("accentColor" in value)
  ) return false;

  return (
    typeof value.cubeScale === "number" && Number.isFinite(value.cubeScale) && value.cubeScale > 0 &&
    typeof value.cameraDistance === "number" && Number.isFinite(value.cameraDistance) &&
      value.cameraDistance > value.cubeScale * 2 &&
    typeof value.focalLength === "number" && Number.isFinite(value.focalLength) && value.focalLength > 0 &&
    typeof value.rotationSpeed === "number" && Number.isFinite(value.rotationSpeed) && value.rotationSpeed >= 0 &&
    typeof value.verticalRotationFactor === "number" && Number.isFinite(value.verticalRotationFactor) &&
    typeof value.backgroundColor === "string" &&
    typeof value.edgeColor === "string" &&
    typeof value.accentColor === "string"
  );
}

const CUBE_VERTICES = new Float32Array([
  -1, -1, -1,
   1, -1, -1,
   1,  1, -1,
  -1,  1, -1,
  -1, -1,  1,
   1, -1,  1,
   1,  1,  1,
  -1,  1,  1,
]);

const CUBE_EDGES = new Uint8Array([
  0, 1, 1, 2, 2, 3, 3, 0,
  4, 5, 5, 6, 6, 7, 7, 4,
  0, 4, 1, 5, 2, 6, 3, 7,
]);

/** Attach the rotating cube scene to the engine's render phase. */
export function createHelloEngineScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  input: InputManager,
  config: HelloSceneConfig,
): () => void {
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("hello scene: 2D canvas context is unavailable");

  const projected = new Float32Array(CUBE_VERTICES.length / 3 * 2);
  let viewWidth = 1;
  let viewHeight = 1;
  let pixelRatio = 1;
  let rotation = 0;
  let spinning = true;

  const resize = (): void => {
    const bounds = canvas.getBoundingClientRect();
    viewWidth = Math.max(bounds.width, 1);
    viewHeight = Math.max(bounds.height, 1);
    pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(viewWidth * pixelRatio);
    canvas.height = Math.round(viewHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const draw = (deltaSeconds: number): void => {
    if (input.wasActionPressed("toggle-spin")) spinning = !spinning;
    if (spinning) rotation = (rotation + deltaSeconds * config.rotationSpeed) % (Math.PI * 2);

    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, viewWidth, viewHeight);

    const cosY = Math.cos(rotation);
    const sinY = Math.sin(rotation);
    const pitch = rotation * config.verticalRotationFactor;
    const cosX = Math.cos(pitch);
    const sinX = Math.sin(pitch);
    const centerX = viewWidth * 0.5;
    const centerY = viewHeight * 0.54;

    for (let vertex = 0; vertex < CUBE_VERTICES.length / 3; vertex++) {
      const offset = vertex * 3;
      const x = CUBE_VERTICES[offset] ?? 0;
      const y = CUBE_VERTICES[offset + 1] ?? 0;
      const z = CUBE_VERTICES[offset + 2] ?? 0;
      const rotatedX = x * cosY - z * sinY;
      const rotatedZ = x * sinY + z * cosY;
      const rotatedY = y * cosX - rotatedZ * sinX;
      const finalZ = y * sinX + rotatedZ * cosX;
      const depth = config.cameraDistance - finalZ * config.cubeScale;
      const perspective = config.focalLength / depth;
      projected[vertex * 2] = centerX + rotatedX * config.cubeScale * perspective;
      projected[vertex * 2 + 1] = centerY - rotatedY * config.cubeScale * perspective;
    }

    context.lineWidth = 2;
    context.strokeStyle = config.edgeColor;
    context.beginPath();
    for (let edge = 0; edge < CUBE_EDGES.length; edge += 2) {
      const start = CUBE_EDGES[edge] ?? 0;
      const end = CUBE_EDGES[edge + 1] ?? 0;
      context.moveTo(projected[start * 2] ?? 0, projected[start * 2 + 1] ?? 0);
      context.lineTo(projected[end * 2] ?? 0, projected[end * 2 + 1] ?? 0);
    }
    context.stroke();

    context.fillStyle = config.accentColor;
    for (let vertex = 0; vertex < CUBE_VERTICES.length / 3; vertex++) {
      context.beginPath();
      context.arc(projected[vertex * 2] ?? 0, projected[vertex * 2 + 1] ?? 0, 3, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "#e6edf5";
    context.font = "600 15px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("CITY ENGINE", 28, 38);
    context.fillStyle = "#8b9aac";
    context.font = "12px ui-monospace, SFMono-Regular, Consolas, monospace";
    context.fillText("PHASE 1  /  HELLO SCENE", 28, 58);
    context.fillText(spinning ? "SPACE  ·  PAUSE ROTATION" : "SPACE  ·  RESUME ROTATION", 28, viewHeight - 28);
  };

  resize();
  window.addEventListener("resize", resize);
  const removeRenderHook = engine.on("render", (frame) => draw(frame.dt));
  return (): void => {
    removeRenderHook();
    window.removeEventListener("resize", resize);
  };
}
