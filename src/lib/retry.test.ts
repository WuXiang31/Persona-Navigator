import { describe, expect, it, vi } from "vitest";
import { fetchWithRetry } from "./retry";

const respond = (status: number, headers: Record<string, string> = {}) =>
  new Response(status === 200 ? "{}" : "error", { status, headers });

function setup(...results: (number | Error)[]) {
  const fetchFn = vi.fn(async () => {
    const next = results.shift()!;
    if (next instanceof Error) throw next;
    return respond(next);
  });
  const sleep = vi.fn(async () => {});
  return { fetchFn: fetchFn as unknown as typeof fetch, calls: fetchFn, sleep };
}

describe("fetchWithRetry", () => {
  it("returns immediately on success", async () => {
    const { fetchFn, calls, sleep } = setup(200);
    const res = await fetchWithRetry("u", {}, { fetchFn, sleep });
    expect(res.status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries 503s with exponential backoff until success", async () => {
    const { fetchFn, calls, sleep } = setup(503, 503, 200);
    const res = await fetchWithRetry("u", {}, { fetchFn, sleep, baseDelayMs: 100 });
    expect(res.status).toBe(200);
    expect(calls).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls).toEqual([[100], [200]]);
  });

  it("returns the last error response once retries run out", async () => {
    const { fetchFn, calls, sleep } = setup(503, 503, 503);
    const res = await fetchWithRetry("u", {}, { fetchFn, sleep, retries: 2 });
    expect(res.status).toBe(503);
    expect(calls).toHaveBeenCalledTimes(3);
  });

  it("does not retry client errors", async () => {
    const { fetchFn, calls, sleep } = setup(400);
    const res = await fetchWithRetry("u", {}, { fetchFn, sleep });
    expect(res.status).toBe(400);
    expect(calls).toHaveBeenCalledTimes(1);
  });

  it("retries network errors and rethrows the last one", async () => {
    const { fetchFn, calls, sleep } = setup(new Error("offline"), new Error("offline"));
    await expect(fetchWithRetry("u", {}, { fetchFn, sleep, retries: 1 })).rejects.toThrow("offline");
    expect(calls).toHaveBeenCalledTimes(2);
  });

  it("honors Retry-After, capped at maxDelayMs", async () => {
    const results = [respond(429, { "retry-after": "2" }), respond(429, { "retry-after": "30" }), respond(200)];
    const fetchFn = vi.fn(async () => results.shift()!) as unknown as typeof fetch;
    const sleep = vi.fn(async () => {});
    await fetchWithRetry("u", {}, { fetchFn, sleep, maxDelayMs: 4000 });
    expect(sleep.mock.calls).toEqual([[2000], [4000]]);
  });
});
