import type { Stats } from "@/context/ProfileContext";

export type WeatherCondition = "clear" | "cloudy" | "rainy" | "snowy" | "storm";

export const WEATHER_BOOST = 1.5;

// Each condition boosts one stat (or all of them) by WEATHER_BOOST, per the design handoff
export const WEATHER_INFO: Record<
  WeatherCondition,
  { label: string; bonus: keyof Stats | "all"; bg: string; fg: string }
> = {
  clear: { label: "☀ CLEAR", bonus: "charm", bg: "#E50000", fg: "#fff" },
  rainy: { label: "☂ RAINY", bonus: "knowledge", bg: "#F2F2F2", fg: "#111" },
  cloudy: { label: "☁ CLOUDY", bonus: "craft", bg: "#F2F2F2", fg: "#111" },
  snowy: { label: "❄ SNOWY", bonus: "nerve", bg: "#A8D8FF", fg: "#111" },
  storm: { label: "⚡ STORM", bonus: "all", bg: "#3A1F6E", fg: "#fff" },
};

// Maps WMO weather interpretation codes (as returned by Open-Meteo) to a condition
export function conditionFromWmoCode(code: number): WeatherCondition {
  if (code >= 95) return "storm";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snowy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if (code === 2 || code === 3 || (code >= 45 && code <= 48)) return "cloudy";
  return "clear";
}

export function isBoosted(condition: WeatherCondition | null, stat: keyof Stats): boolean {
  if (!condition) return false;
  const bonus = WEATHER_INFO[condition].bonus;
  return bonus === "all" || bonus === stat;
}

// XP a mission is worth today, after the weather bonus
export function boostedXp(xp: number, condition: WeatherCondition | null, stat: keyof Stats): number {
  return isBoosted(condition, stat) ? Math.round(xp * WEATHER_BOOST) : xp;
}
