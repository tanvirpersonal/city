/** Public API of the service registry. Other systems import only from here. */
export { createServiceRegistry } from "./service-system";
export type { ServiceMap, ServiceRegistry, ServiceUnsubscribe } from "./types";
