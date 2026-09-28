import { NextResponse } from "next/server";
import { generateJson } from "@/lib/gemini";
import { MAX_TRANSLATE_LENGTH, MAX_TRANSLATE_TEXTS, pairTranslations } from "@/lib/contentTranslation";

export const maxDuration = 60;

const LANGUAGES = { zh: "Simplified Chinese", en: "English" } as const;

const TRANSLATE_PROMPT = (language: string) => `You translate text from a real-life RPG self-improvement app into ${language}.
The items are mask names (a player's chosen title), identity statements written in the first person, and short missions.
Translate each item on its own, keeping its meaning, tone and length. Make it sound natural, like it was written in ${language}:
mask names stay short and evocative, missions stay short and actionable.
Keep product and proper names as they are (e.g. LeetCode, GitHub).
Return exactly one translation per input item, in the same order.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: { translations: { type: "ARRAY", items: { type: "STRING" } } },
  required: ["translations"],
};

// POST { texts, lang } -> { translations }: the player's mask and missions in the new UI language
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const lang = body?.lang === "zh" || body?.lang === "en" ? (body.lang as keyof typeof LANGUAGES) : null;
    const texts: string[] = Array.isArray(body?.texts)
      ? body.texts
          .filter((t: unknown): t is string => typeof t === "string" && !!t.trim())
          .slice(0, MAX_TRANSLATE_TEXTS)
          .map((t: string) => t.slice(0, MAX_TRANSLATE_LENGTH))
      : [];
    if (!lang || texts.length === 0) {
      return NextResponse.json({ error: "texts and lang are required" }, { status: 400 });
    }

    const result = await generateJson({
      system: TRANSLATE_PROMPT(LANGUAGES[lang]),
      contents: [{ role: "user", parts: [{ text: JSON.stringify(texts) }] }],
      schema: RESPONSE_SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 4096,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    const map = pairTranslations(texts, result.data.translations);
    if (!map) {
      console.error("Translation returned a mismatched list:", result.data);
      return NextResponse.json({ error: "Could not translate" }, { status: 502 });
    }
    return NextResponse.json({ translations: texts.map((t) => map.get(t) ?? t) });
  } catch (error) {
    console.error("Translate API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
