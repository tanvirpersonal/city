/** Built-in renderer defaults. Quality numbers live in `assets/data/quality/*.json`, not here. */

/** Background used when the caller passes no clear color. */
export const DEFAULT_CLEAR_COLOR = "#05070b";

/** Camera used by the renderer's own scene until the ECS camera component exists (Phase 5). */
export const DEFAULT_CAMERA = {
  fovDegrees: 50,
  near: 0.1,
  far: 1000,
  distance: 3,
} as const;

/** Self-test cube: shows that the active backend really draws. */
export const TEST_CUBE = {
  size: 1,
  spinRadiansPerSecond: 0.9,
} as const;
