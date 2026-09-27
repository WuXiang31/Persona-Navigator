// Statuses worth retrying: rate limits and transient server errors (e.g. Gemini's 503 "high demand")
export const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export interface RetryOptions {
  // Extra attempts after the first one
  retries?: number;
  // Delay before the first retry; doubles on each later retry
  baseDelayMs?: number;
  // Upper bound for any single wait, including a server-sent Retry-After
  maxDelayMs?: number;
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function retryDelay(res: Response | null, attempt: number, baseDelayMs: number, maxDelayMs: number) {
  const retryAfter = Number(res?.headers.get("retry-after"));
  const ms = retryAfter > 0 ? retryAfter * 1000 : baseDelayMs * 2 ** attempt;
  return Math.min(ms, maxDelayMs);
}

// fetch that retries network errors and retryable statuses with exponential backoff.
// Returns the last response (possibly still an error status) once retries run out.
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  { retries = 2, baseDelayMs = 800, maxDelayMs = 4000, fetchFn = fetch, sleep = defaultSleep }: RetryOptions = {}
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    let res: Response | null = null;
    try {
      res = await fetchFn(url, init);
    } catch (error) {
      if (attempt >= retries) throw error;
    }

    if (res && (res.ok || !RETRYABLE_STATUS.has(res.status) || attempt >= retries)) {
      return res;
    }
    await sleep(retryDelay(res, attempt, baseDelayMs, maxDelayMs));
  }
}
