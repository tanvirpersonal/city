import type { Engine } from "../core";
import type {
  ComponentType,
  EcsSystem,
  EcsWorld,
  Entity,
  EntityQuery,
} from "./types";

type ComponentStore = Map<Entity, unknown>;

/** Create a unique, typed component key. Use one key per component definition. */
export function defineComponent<T>(name: string): ComponentType<T> {
  if (name.trim().length === 0) throw new Error("ecs: component name cannot be empty");
  return Symbol(name) as ComponentType<T>;
}

class World implements EcsWorld {
  private nextEntity = 1;
  private readonly alive = new Set<Entity>();
  private readonly stores = new Map<ComponentType<unknown>, ComponentStore>();

  createEntity(): Entity {
    if (!Number.isSafeInteger(this.nextEntity)) {
      throw new Error("ecs: entity ID space exhausted");
    }
    const entity = this.nextEntity;
    this.nextEntity += 1;
    this.alive.add(entity);
    return entity;
  }

  destroyEntity(entity: Entity): void {
    this.assertAlive(entity);
    this.alive.delete(entity);
    for (const store of this.stores.values()) store.delete(entity);
  }

  isAlive(entity: Entity): boolean {
    return this.alive.has(entity);
  }

  addComponent<T>(entity: Entity, type: ComponentType<T>, value: T): void {
    this.assertAlive(entity);
    const store = this.getOrCreateStore(type);
    if (store.has(entity)) throw new Error(`ecs: entity ${entity} already has this component`);
    store.set(entity, value);
  }

  setComponent<T>(entity: Entity, type: ComponentType<T>, value: T): void {
    this.assertAlive(entity);
    this.getOrCreateStore(type).set(entity, value);
  }

  getComponent<T>(entity: Entity, type: ComponentType<T>): T | undefined {
    this.assertAlive(entity);
    return this.stores.get(type)?.get(entity) as T | undefined;
  }

  hasComponent<T>(entity: Entity, type: ComponentType<T>): boolean {
    this.assertAlive(entity);
    return this.stores.get(type)?.has(entity) ?? false;
  }

  removeComponent<T>(entity: Entity, type: ComponentType<T>): boolean {
    this.assertAlive(entity);
    return this.stores.get(type)?.delete(entity) ?? false;
  }

  query(...types: ComponentType<unknown>[]): EntityQuery {
    const requiredStores: ComponentStore[] = [];
    for (const type of types) {
      requiredStores.push(this.getOrCreateStore(type));
    }

    let baseStore: ComponentStore | undefined;
    for (const store of requiredStores) {
      if (baseStore === undefined || store.size < baseStore.size) baseStore = store;
    }

    return {
      forEach: (visitor): void => {
        if (requiredStores.length === 0) {
          for (const entity of this.alive) visitor(entity);
          return;
        }
        if (baseStore === undefined) return;

        for (const entity of baseStore.keys()) {
          if (!this.alive.has(entity)) continue;
          let matches = true;
          for (const store of requiredStores) {
            if (!store.has(entity)) {
              matches = false;
              break;
            }
          }
          if (matches) visitor(entity);
        }
      },
      count: (): number => {
        let total = 0;
        if (requiredStores.length === 0) return this.alive.size;
        if (baseStore === undefined) return total;
        for (const entity of baseStore.keys()) {
          if (!this.alive.has(entity)) continue;
          let matches = true;
          for (const store of requiredStores) {
            if (!store.has(entity)) {
              matches = false;
              break;
            }
          }
          if (matches) total += 1;
        }
        return total;
      },
    };
  }

  private getOrCreateStore<T>(type: ComponentType<T>): ComponentStore {
    let store = this.stores.get(type);
    if (store === undefined) {
      store = new Map<Entity, unknown>();
      this.stores.set(type, store);
    }
    return store;
  }

  private assertAlive(entity: Entity): void {
    if (!this.alive.has(entity)) throw new Error(`ecs: entity ${entity} is not alive`);
  }
}


/** Create an isolated ECS world with its own entity and component storage. */
export function createEcsWorld(): EcsWorld {
  return new World();
}

export interface EcsRuntime {
  readonly world: EcsWorld;
  /** Register a system in the matching core phase. Returns an unregister function. */
  addSystem(system: EcsSystem): () => void;
  /** Unregister all systems owned by this runtime. The world remains usable. */
  dispose(): void;
}

/**
 * Connect an ECS world to the core engine's phase loop.
 * Systems run in registration order within each phase.
 */
export function createEcsRuntime(engine: Engine, world: EcsWorld = createEcsWorld()): EcsRuntime {
  const systems = new Map<string, () => void>();

  return {
    world,
    addSystem(system): () => void {
      if (systems.has(system.name)) throw new Error(`ecs: system "${system.name}" is already registered`);
      const unregister = engine.on(system.phase, (context) => system.update(world, context));
      systems.set(system.name, unregister);
      return () => {
        // Ignore late or repeated calls once this registration was removed or replaced.
        if (systems.get(system.name) !== unregister) return;
        unregister();
        systems.delete(system.name);
      };
    },
    dispose(): void {
      for (const unregister of systems.values()) unregister();
      systems.clear();
    },
  };
}
