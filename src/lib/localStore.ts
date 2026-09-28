import { useSyncExternalStore } from "react";

// Hooks for the cloud sync layer: hear about every local write, and re-notify stores
// after their keys were rewritten underneath them (e.g. hydrated from the server)
const writeListeners = new Set<(key: string) => void>();
const storeNotifiers = new Map<string, () => void>();

export function onStoreWrite(listener: (key: string) => void): () => void {
  writeListeners.add(listener);
  return () => writeListeners.delete(listener);
}

export function refreshStores() {
  storeNotifiers.forEach((notify) => notify());
}

// A value in localStorage (JSON-encoded by default) that components can subscribe to with useSyncExternalStore.
// Reads are synchronous, so callers always act on the latest saved value.
export function createLocalStore<T>(
  key: string,
  fallback: T,
  codec: { parse: (raw: string) => T; stringify: (value: T) => string } = JSON
) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null = null;
  let cachedValue: T = fallback;

  const get = (): T => {
    const raw = localStorage.getItem(key);
    // Return the same reference while the stored JSON is unchanged
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? fallback : codec.parse(raw);
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  };

  const set = (update: T | ((prev: T) => T)) => {
    const next = typeof update === "function" ? (update as (prev: T) => T)(get()) : update;
    if (next === null || next === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, codec.stringify(next));
    }
    listeners.forEach((l) => l());
    writeListeners.forEach((l) => l(key));
  };
  storeNotifiers.set(key, () => listeners.forEach((l) => l()));

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    // Also pick up changes made in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return { get, set, subscribe, fallback };
}

type LocalStore<T> = ReturnType<typeof createLocalStore<T>>;

export function useLocalStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

const noopSubscribe = () => () => {};

// False during server render and hydration, true once running on the client
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
