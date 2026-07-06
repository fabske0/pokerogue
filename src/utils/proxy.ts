/**
 * Utility type that represents a proxy object with an additional `__isProxy` property.
 */
export type ProxyObject<T extends object> = T & {
  readonly __isProxy: true;
};

/**
 * Creates a proxy object that exposes a `__isProxy` property.
 * @param target - The target object to proxy
 * @param handler - The proxy handler
 * @returns A proxy object with the `__isProxy` property
 * @remarks this function should be preferred over directly calling `new Proxy()`
 */
export function createProxy<T extends object>(target: T, handler: ProxyHandler<T>): ProxyObject<T> {
  const wrappedHandler: ProxyHandler<T> = {
    ...handler,
    get(currentTarget, prop, receiver) {
      if (prop === "__isProxy") {
        return true;
      }

      if (handler.get) {
        return handler.get(currentTarget, prop, receiver);
      }

      return Reflect.get(currentTarget, prop, receiver);
    },
  };

  return new Proxy(target, wrappedHandler) as ProxyObject<T>;
}
