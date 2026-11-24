/** Public API of the ECS system. Other systems import only from here. */
export { createEcsRuntime, createEcsWorld, defineComponent } from "./ecs-system";
export type { EcsRuntime } from "./ecs-system";
export type {
  ComponentType,
  EcsSystem,
  EcsWorld,
  Entity,
  EntityQuery,
} from "./types";
