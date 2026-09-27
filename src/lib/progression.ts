import type { Stats } from "@/context/ProfileContext";

export const MAX_STAT = 500;
export const XP_PER_RANK = 100;
export const QUICK_LOG_XP = 15;

// Order around the radar chart and in stat lists
export const STATS_ORDER = ["knowledge", "charm", "nerve", "craft", "vitality"] as const satisfies readonly (keyof Stats)[];

// Display glyph and 3-letter code per stat, from the design handoff
export const STAT_GLYPHS: Record<keyof Stats, string> = {
  knowledge: "\u25C6",
  vitality: "\u25B2",
  charm: "\u2605",
  craft: "\u2B22",
  nerve: "\u26A1",
};
export const STAT_SHORT: Record<keyof Stats, string> = {
  knowledge: "KNW",
  vitality: "VIT",
  charm: "CHM",
  craft: "CRF",
  nerve: "NRV",
};

export const RANK_NAMES = ["Novice", "Apprentice", "Adept", "Expert", "Master"] as const;
export const RANK_COLORS = ["#888888", "#55AAFF", "#55FF55", "#FF8800", "#FFD700"] as const;

// 0-based rank index: 0-99 XP = Novice ... 400+ = Master
export function getRankIndex(xp: number): number {
  return Math.min(RANK_NAMES.length - 1, Math.floor(xp / XP_PER_RANK));
}

export function getRankName(xp: number): string {
  return RANK_NAMES[getRankIndex(xp)];
}

export function getRankColor(xp: number): string {
  return RANK_COLORS[getRankIndex(xp)];
}

export function clampStat(xp: number): number {
  return Math.max(0, Math.min(MAX_STAT, xp));
}
