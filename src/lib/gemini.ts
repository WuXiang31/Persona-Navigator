import { RETRYABLE_STATUS, fetchWithRetry } from "./retry";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
// Lighter model tried when the main one is still overloaded; set GEMINI_FALLBACK_MODEL=none to disable
const GEMINI_FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL === "none" ? null : process.env.GEMINI_FALLBACK_MODEL || "gemini-flash-lite-latest";

export interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

export type GeminiResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; status: number; error: string };

// Calls Gemini with structured JSON output and returns the parsed object.
// Overloads (503) and rate limits are retried with backoff; with a fallback model, the main
// one gets a single retry so a busy model hands over quickly.
export async function generateJson({
  system,
  contents,
  schema,
  temperature = 0.7,
  maxOutputTokens = 2048,
}: {
  system: string;
  contents: GeminiContent[];
  schema: object;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { ok: false, status: 500, error: "API key not configured" };

  const body = JSON.stringify({
    system_instruction: { parts: { text: system } },
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const attempts = GEMINI_FALLBACK_MODEL
    ? [{ model: GEMINI_MODEL, retries: 1 }, { model: GEMINI_FALLBACK_MODEL, retries: 2 }]
    : [{ model: GEMINI_MODEL, retries: 2 }];
  let response!: Response;
  for (const { model, retries } of attempts) {
    response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body },
      { retries }
    );
    if (response.ok || !RETRYABLE_STATUS.has(response.status)) break;
    console.warn(`Gemini model ${model} still unavailable (${response.status}) after retries`);
  }

  if (!response.ok) {
    console.error("Gemini API Error:", await response.text());
    return { ok: false, status: response.status, error: "Failed to fetch from Gemini" };
  }

  const data = await response.json();
  const rawText: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  try {
    return { ok: true, data: rawText ? JSON.parse(rawText) : {} };
  } catch {
    console.error("Gemini returned non-JSON output:", rawText);
    return { ok: true, data: {} };
  }
}
