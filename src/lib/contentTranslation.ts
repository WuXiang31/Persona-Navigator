import type { Mission } from "@/context/MissionContext";
import type { Lang } from "./messages";
import type { Mask } from "./mask";

// Limits on one translation request, well above a full mask plus a day's missions
export const MAX_TRANSLATE_TEXTS = 60;
export const MAX_TRANSLATE_LENGTH = 300;

const CJK = /[぀-ヿ㐀-鿿가-힯]/;

// Chinese UI wants text with Chinese characters; English UI wants text without them
export function needsTranslation(text: string, lang: Lang): boolean {
  if (!text.trim()) return false;
  return lang === "zh" ? !CJK.test(text) : CJK.test(text);
}

// Player-facing text written by the AI or the player that is not yet in `lang`:
// the personal mask and today's active missions
export function collectTexts(mask: Mask | null, missions: Mission[], lang: Lang): string[] {
  const texts = [
    mask?.name,
    mask?.identity,
    ...(mask?.routines ?? []).flatMap((r) => [r.title, r.description]),
    ...missions.filter((m) => m.status === "active").flatMap((m) => [m.title, m.description]),
  ];
  const wanted = texts.filter((t): t is string => !!t && needsTranslation(t, lang));
  return [...new Set(wanted)].slice(0, MAX_TRANSLATE_TEXTS);
}

const swap = (text: string, map: Map<string, string>) => map.get(text) ?? text;

export function translateMask(mask: Mask, map: Map<string, string>): Mask {
  return {
    ...mask,
    name: swap(mask.name, map),
    identity: swap(mask.identity, map),
    routines: mask.routines.map((r) => ({ ...r, title: swap(r.title, map), description: swap(r.description, map) })),
  };
}

export function translateMission(mission: Mission, map: Map<string, string>): Mission {
  if (mission.status !== "active") return mission;
  return { ...mission, title: swap(mission.title, map), description: swap(mission.description, map) };
}

// Pairs the model's output with the originals; null unless it returned one string per input
export function pairTranslations(originals: string[], raw: unknown): Map<string, string> | null {
  if (!Array.isArray(raw) || raw.length !== originals.length) return null;
  if (!raw.every((t) => typeof t === "string")) return null;
  const map = new Map<string, string>();
  originals.forEach((original, i) => {
    const translated = (raw[i] as string).trim();
    if (translated) map.set(original, translated.slice(0, MAX_TRANSLATE_LENGTH));
  });
  return map;
}

// What the last translation did, so switching back restores the exact originals without the AI
export interface ContentLangState {
  lang: Lang;
  // translated text -> the original it replaced
  originals: Record<string, string>;
}

// Splits texts into those a previous translation can restore and those that need the AI
export function restorable(texts: string[], state: ContentLangState | null): { known: Map<string, string>; missing: string[] } {
  const known = new Map<string, string>();
  const missing: string[] = [];
  for (const text of texts) {
    const original = state?.originals[text];
    if (original !== undefined) known.set(text, original);
    else missing.push(text);
  }
  return { known, missing };
}

// The state after applying `map` (original -> translated) for `lang`
export function nextContentLangState(lang: Lang, map: Map<string, string>): ContentLangState {
  const originals: Record<string, string> = {};
  map.forEach((translated, original) => {
    originals[translated] = original;
  });
  return { lang, originals };
}
