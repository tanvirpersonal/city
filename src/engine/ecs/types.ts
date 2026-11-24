import type { FrameContext, Phase } from "../core";

/** Opaque component key that keeps each component's data type attached to it. */
export type ComponentType<T> = symbol & {
  readonly __componentData?: T;
};

/** Numeric entity handle. Entity IDs are never reused during a world's lifetime. */
export type Entity = number;

/** A reusable query that visits matching entities without creating a result array. */
export interface EntityQuery {
  /** Visit each currently matching entity. Do not create matching entities inside the callback. */
  forEach(visitor: (entity: Entity) => void): void;
  /** Return the number of entities that currently match. */
  count(): number;
}

/** Public operations exposed by an ECS world. */
export interface EcsWorld {
  /** Create an empty entity. */
  createEntity(): Entity;
  /** Destroy an entity and remove all of its components. */
  destroyEntity(entity: Entity): void;
  /** Check whether an entity is alive in this world. */
  isAlive(entity: Entity): boolean;
  /** Attach a component; throws if the entity is dead or already has this component. */
  addComponent<T>(entity: Entity, type: ComponentType<T>, value: T): void;
  /** Add or replace a component on an alive entity. */
  setComponent<T>(entity: Entity, type: ComponentType<T>, value: T): void;
  /** Read a component, or undefined when the entity does not have it. */
  getComponent<T>(entity: Entity, type: ComponentType<T>): T | undefined;
  /** Check whether an entity has a component. */
  hasComponent<T>(entity: Entity, type: ComponentType<T>): boolean;
  /** Remove a component. Returns false when it was not present. */
  removeComponent<T>(entity: Entity, type: ComponentType<T>): boolean;
  /** Build a reusable AND-query for the supplied component types. */
  query(...types: ComponentType<unknown>[]): EntityQuery;
}

/** A system runs once in its selected engine phase. */
export interface EcsSystem {
  readonly name: string;
  readonly phase: Phase;
  /** Called by the engine loop; implementations should avoid per-frame allocations. */
  update(world: EcsWorld, context: FrameContext): void;
}
