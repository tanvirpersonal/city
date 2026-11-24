/** Typed event map: each string key maps to the payload emitted for that event. */
export type EventMap = object;

/** Subscription handle returned by event listeners. */
export type Unsubscribe = () => void;

/** Public typed event bus contract. */
export interface EventBus<Events extends EventMap> {
  /** Subscribe to an event. The returned function removes this listener. */
  on<K extends keyof Events & string>(event: K, listener: (payload: Events[K]) => void): Unsubscribe;
  /** Subscribe for one delivery, then automatically unsubscribe. */
  once<K extends keyof Events & string>(event: K, listener: (payload: Events[K]) => void): Unsubscribe;
  /** Emit an event to the listeners registered at the start of this delivery. */
  emit<K extends keyof Events & string>(event: K, payload: Events[K]): void;
  /** Remove every listener, or only listeners for the selected event. */
  clear<K extends keyof Events & string>(event?: K): void;
  /** Count listeners for an event, or all listeners when no event is supplied. */
  listenerCount<K extends keyof Events & string>(event?: K): number;
}
