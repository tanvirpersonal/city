/** A named service map used to retain compile-time service types. */
export type ServiceMap = object;

/** Cleanup handle for a registered service. */
export type ServiceUnsubscribe = () => void;

/** Typed service registry shared by engine systems. */
export interface ServiceRegistry<Services extends ServiceMap> {
  /** Register a service once. Throws when the name is already occupied. */
  register<K extends keyof Services & string>(name: K, service: Services[K]): ServiceUnsubscribe;
  /** Return a service when registered, otherwise undefined. */
  get<K extends keyof Services & string>(name: K): Services[K] | undefined;
  /** Return a registered service or throw an error naming the missing service. */
  require<K extends keyof Services & string>(name: K): Services[K];
  /** Check whether a service is registered. */
  has<K extends keyof Services & string>(name: K): boolean;
  /** Remove a named service. Returns false when it was not registered. */
  unregister<K extends keyof Services & string>(name: K): boolean;
  /** Remove all registered services. */
  clear(): void;
  /** Number of currently registered services. */
  readonly size: number;
}
