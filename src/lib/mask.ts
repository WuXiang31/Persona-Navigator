import type { Stats } from "@/context/ProfileContext";
import { STATS_ORDER } from "./progression";
import { ProposedMission, isStat, sanitizeMissions } from "./missionProposals";
import { WEATHER_BOOST, WeatherCondition, isBoosted } from "./weather";

type Stat = keyof Stats;

// Awakening questionnaire options. `id`s are stored; labels are what the player sees.
export const AGE_RANGES = [
  { id: "under-18", label: "Under 18" },
  { id: "18-22", label: "18-22" },
  { id: "23-29", label: "23-29" },
  { id: "30-39", label: "30-39" },
  { id: "40-plus", label: "40+" },
] as const;

export const OCCUPATIONS = [
  { id: "student", label: "Student" },
  { id: "working", label: "Working" },
  { id: "between", label: "Job hunting / in between" },
  { id: "other", label: "Something else" },
] as const;

export const SITUATIONS = [
  { id: "coursework", label: "Buried in assignments and exams" },
  { id: "job-hunt", label: "Hunting for an internship or job" },
  { id: "inactive", label: "Not moving my body enough" },
  { id: "isolated", label: "Not talking to people much" },
  { id: "side-project", label: "Want to build my own project" },
  { id: "sleep", label: "Messy sleep and routine" },
  { id: "stress", label: "Stressed or burnt out" },
  { id: "screen-time", label: "Too much time on my phone" },
] as const;

export type AgeRange = (typeof AGE_RANGES)[number]["id"];
export type Occupation = (typeof OCCUPATIONS)[number]["id"];

export interface PlayerProfile {
  ageRange: AgeRange;
  occupation: Occupation;
  // Free text, e.g. "3rd-year Computer Science"
  occupationDetail: string;
  // SITUATIONS ids plus anything the player typed
  situations: string[];
  // "Who do you want to become?"
  aspiration: string;
}

export interface Mask {
  name: string;
  // First-person identity statement: every completed mission is a vote for it
  identity: string;
  focusStats: [Stat, Stat];
  // Repeatable missions tailored to the player, added to today's list from the Missions screen
  routines: ProposedMission[];
  equippedAt: number;
}

// Missions for a mask's focus stats pay this much more XP
export const FOCUS_BOOST = 1.25;
export const MAX_ROUTINES = 10;
export const MAX_NAME_LENGTH = 40;
export const MAX_IDENTITY_LENGTH = 160;
export const MAX_TEXT_LENGTH = 200;

export function isFocusStat(mask: Mask | null, stat: Stat): boolean {
  return !!mask && mask.focusStats.includes(stat);
}

// XP a mission pays today: the weather bonus and the mask's focus bonus multiply
export function missionXp(xp: number, stat: Stat, condition: WeatherCondition | null, mask: Mask | null): number {
  const weather = isBoosted(condition, stat) ? WEATHER_BOOST : 1;
  const focus = isFocusStat(mask, stat) ? FOCUS_BOOST : 1;
  return Math.round(xp * weather * focus);
}

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// Two distinct valid stats, filling gaps from `fallback`
export function sanitizeFocusStats(raw: unknown, fallback: [Stat, Stat] = ["knowledge", "vitality"]): [Stat, Stat] {
  const picked = (Array.isArray(raw) ? raw : []).filter(isStat);
  const unique = [...new Set([...picked, ...fallback, ...STATS_ORDER])];
  return [unique[0], unique[1]];
}

// Shapes model output (or client input) into a Mask the game can trust
export function sanitizeMask(raw: unknown, equippedAt = Date.now()): Mask | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const name = text(m.name, MAX_NAME_LENGTH);
  if (!name) return null;
  return {
    name,
    identity: text(m.identity, MAX_IDENTITY_LENGTH),
    focusStats: sanitizeFocusStats(m.focusStats),
    routines: sanitizeMissions(m.routines, MAX_ROUTINES),
    equippedAt,
  };
}

// Validates questionnaire answers sent to the server
export function sanitizeProfile(raw: unknown): PlayerProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const ageRange = AGE_RANGES.find((a) => a.id === p.ageRange)?.id;
  const occupation = OCCUPATIONS.find((o) => o.id === p.occupation)?.id;
  if (!ageRange || !occupation) return null;
  return {
    ageRange,
    occupation,
    occupationDetail: text(p.occupationDetail, MAX_TEXT_LENGTH),
    situations: (Array.isArray(p.situations) ? p.situations : [])
      .map((s) => text(s, MAX_TEXT_LENGTH))
      .filter(Boolean)
      .slice(0, 12),
    aspiration: text(p.aspiration, MAX_TEXT_LENGTH),
  };
}

// Readable profile summary for prompts: ids become their labels
export function describeProfile(profile: PlayerProfile): string {
  const label = (list: readonly { id: string; label: string }[], id: string) =>
    list.find((o) => o.id === id)?.label ?? id;
  return [
    `Age: ${label(AGE_RANGES, profile.ageRange)}`,
    `Occupation: ${label(OCCUPATIONS, profile.occupation)}${profile.occupationDetail ? ` (${profile.occupationDetail})` : ""}`,
    profile.situations.length
      ? `Current situation: ${profile.situations.map((s) => label(SITUATIONS, s)).join("; ")}`
      : "",
    profile.aspiration ? `Wants to become: ${profile.aspiration}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

// Players who picked one of the original five roles keep its focus until they awaken a personal mask
const LEGACY_ROLES: Record<string, { name: string; identity: string; focusStats: [Stat, Stat] }> = {
  scholar: { name: "The Scholar", identity: "I seek to uncover the truth of the world.", focusStats: ["knowledge", "craft"] },
  professional: { name: "The Professional", identity: "I navigate the world with precision.", focusStats: ["craft", "charm"] },
  creative: { name: "The Creative", identity: "I shape hearts through my vision.", focusStats: ["charm", "knowledge"] },
  athlete: { name: "The Athlete", identity: "I push the limits of what is possible.", focusStats: ["vitality", "nerve"] },
  explorer: { name: "The Explorer", identity: "I dive fearlessly into the unknown.", focusStats: ["nerve", "craft"] },
};

export function legacyMask(role: string | null): Mask | null {
  const preset = role ? LEGACY_ROLES[role] : undefined;
  return preset ? { ...preset, routines: [], equippedAt: 0 } : null;
}

// The language to write in, judged from the player's own words. Models tend to drift back to
// English (or the persona's language), so a detected language is stated explicitly.
// With no telling text, the app's UI language (`uiLang`) decides.
export function writingLanguage(texts: (string | undefined)[], uiLang?: unknown): string {
  const joined = texts.filter(Boolean).join(" ");
  if (/[぀-ヿ]/.test(joined)) return "Japanese";
  if (/[가-힯]/.test(joined)) return "Korean";
  if (/[一-鿿]/.test(joined)) return "Simplified Chinese";
  if (uiLang === "zh") return "Simplified Chinese";
  return "the language of the player's answers (English if unclear)";
}

export function profileTexts(profile: PlayerProfile | null): string[] {
  return profile ? [profile.occupationDetail, profile.aspiration, ...profile.situations] : [];
}
