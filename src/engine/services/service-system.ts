import type { ServiceMap, ServiceRegistry, ServiceUnsubscribe } from "./types";

interface ServiceEntry {
  readonly service: unknown;
  readonly token: symbol;
}

class Registry<Services extends ServiceMap> implements ServiceRegistry<Services> {
  private readonly services = new Map<string, ServiceEntry>();

  get size(): number {
    return this.services.size;
  }

  register<K extends keyof Services & string>(name: K, service: Services[K]): ServiceUnsubscribe {
    if (name.trim().length === 0) throw new Error("services: service name cannot be empty");
    if (this.services.has(name)) throw new Error(`services: "${name}" is already registered`);

    const token = Symbol(name);
    this.services.set(name, { service, token });
    let active = true;
    return (): void => {
      if (!active) return;
      active = false;
      // Do not remove a newer registration if this handle is called late.
      if (this.services.get(name)?.token === token) this.services.delete(name);
    };
  }

  get<K extends keyof Services & string>(name: K): Services[K] | undefined {
    return this.services.get(name)?.service as Services[K] | undefined;
  }

  require<K extends keyof Services & string>(name: K): Services[K] {
    const service = this.get(name);
    if (service === undefined) throw new Error(`services: required service "${name}" is not registered`);
    return service;
  }

  has<K extends keyof Services & string>(name: K): boolean {
    return this.services.has(name);
  }

  unregister<K extends keyof Services & string>(name: K): boolean {
    return this.services.delete(name);
  }

  clear(): void {
    this.services.clear();
  }
}

/** Create an isolated registry with strongly typed service names and values. */
export function createServiceRegistry<Services extends ServiceMap>(): ServiceRegistry<Services> {
  return new Registry<Services>();
}
