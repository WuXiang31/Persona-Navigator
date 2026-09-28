/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalStore, onStoreWrite, refreshStores } from "./localStore";

beforeEach(() => localStorage.clear());

describe("createLocalStore", () => {
  it("returns the fallback until something is saved", () => {
    const store = createLocalStore("k", { n: 0 });
    expect(store.get()).toEqual({ n: 0 });
    store.set({ n: 1 });
    expect(store.get()).toEqual({ n: 1 });
    expect(JSON.parse(localStorage.getItem("k")!)).toEqual({ n: 1 });
  });

  it("returns a stable reference while the stored value is unchanged", () => {
    const store = createLocalStore("k", [] as number[]);
    store.set([1, 2]);
    expect(store.get()).toBe(store.get());
  });

  it("applies functional updates to the latest value", () => {
    const store = createLocalStore("k", 0);
    store.set((n) => n + 1);
    store.set((n) => n + 1);
    expect(store.get()).toBe(2);
  });

  it("notifies subscribers and stops after unsubscribe", () => {
    const store = createLocalStore("k", 0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set(1);
    unsubscribe();
    store.set(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("falls back on corrupt JSON and removes the key when set to null", () => {
    localStorage.setItem("k", "{not json");
    const store = createLocalStore<string[] | null>("k", null);
    expect(store.get()).toBeNull();
    store.set(["a"]);
    store.set(null);
    expect(localStorage.getItem("k")).toBeNull();
  });

  it("supports a custom codec for raw string values", () => {
    localStorage.setItem("role", "scholar");
    const store = createLocalStore<string | null>("role", null, {
      parse: (raw) => raw,
      stringify: (v) => v ?? "",
    });
    expect(store.get()).toBe("scholar");
  });

  it("reports every write to onStoreWrite listeners", () => {
    const store = createLocalStore("k", 0);
    const listener = vi.fn();
    const unsubscribe = onStoreWrite(listener);
    store.set(1);
    store.set(null as unknown as number);
    unsubscribe();
    store.set(2);
    expect(listener.mock.calls).toEqual([["k"], ["k"]]);
  });

  it("refreshStores re-notifies subscribers after localStorage is rewritten directly", () => {
    const store = createLocalStore("k", 0);
    const listener = vi.fn();
    store.subscribe(listener);
    localStorage.setItem("k", "5");
    refreshStores();
    expect(listener).toHaveBeenCalled();
    expect(store.get()).toBe(5);
  });
});
