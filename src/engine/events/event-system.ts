import type { EventBus, EventMap, Unsubscribe } from "./types";

type Listener = (payload: unknown) => void;

/** Small synchronous event bus with typed payloads and mutation-safe delivery. */
class TypedEventBus<Events extends EventMap> implements EventBus<Events> {
  private readonly listeners = new Map<string, Set<Listener>>();

  on<K extends keyof Events & string>(event: K, listener: (payload: Events[K]) => void): Unsubscribe {
    const bucket = this.getOrCreateBucket(event);
    const typedListener = listener as unknown as Listener;
    bucket.add(typedListener);
    let active = true;

    return (): void => {
      if (!active) return;
      active = false;
      bucket.delete(typedListener);
      if (bucket.size === 0) this.listeners.delete(event);
    };
  }

  once<K extends keyof Events & string>(event: K, listener: (payload: Events[K]) => void): Unsubscribe {
    let unsubscribe: Unsubscribe = () => undefined;
    unsubscribe = this.on(event, (payload) => {
      unsubscribe();
      listener(payload);
    });
    return unsubscribe;
  }

  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void {
    const bucket = this.listeners.get(event);
    if (bucket === undefined || bucket.size === 0) return;

    // Snapshot delivery: listeners added mid-dispatch wait until the next emit.
    // Membership checks ensure listeners removed mid-dispatch are skipped.
    const delivery = Array.from(bucket);
    for (const listener of delivery) {
      if (bucket.has(listener)) listener(payload);
    }
  }

  clear<K extends keyof Events & string>(event?: K): void {
    if (event === undefined) {
      this.listeners.clear();
      return;
    }
    this.listeners.delete(event);
  }

  listenerCount<K extends keyof Events & string>(event?: K): number {
    if (event !== undefined) return this.listeners.get(event)?.size ?? 0;
    let total = 0;
    for (const bucket of this.listeners.values()) total += bucket.size;
    return total;
  }

  private getOrCreateBucket(event: string): Set<Listener> {
    let bucket = this.listeners.get(event);
    if (bucket === undefined) {
      bucket = new Set<Listener>();
      this.listeners.set(event, bucket);
    }
    return bucket;
  }
}

/** Create an isolated event bus whose event names and payloads are inferred from Events. */
export function createEventBus<Events extends EventMap>(): EventBus<Events> {
  return new TypedEventBus<Events>();
}
