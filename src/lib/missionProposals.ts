import type { Stats } from "@/context/ProfileContext";
import { STATS_ORDER } from "./progression";

export const MAX_PROPOSED_MISSIONS = 5;
const MIN_REWARD_XP = 10;
const MAX_REWARD_XP = 100;
const DEFAULT_REWARD_XP = 50;

export interface ProposedMission {
  title: string;
  description: string;
  rewardStat: keyof Stats;
  rewardXp: number;
}

export const isStat = (value: unknown): value is keyof Stats =>
  typeof value === "string" && (STATS_ORDER as readonly string[]).includes(value);

// Keeps only well-formed missions from the model output: valid stat, non-empty title,
// XP rounded to a multiple of 10 within 10-100, at most `limit` missions
export function sanitizeMissions(raw: unknown, limit = MAX_PROPOSED_MISSIONS): ProposedMission[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((m) => m && typeof m.title === "string" && m.title.trim() && isStat(m.rewardStat))
    .slice(0, limit)
    .map((m) => {
      const xp = Number(m.rewardXp);
      const rounded = Number.isFinite(xp) ? Math.round(xp / 10) * 10 : DEFAULT_REWARD_XP;
      return {
        title: m.title.trim(),
        description: typeof m.description === "string" ? m.description.trim() : "",
        rewardStat: m.rewardStat,
        rewardXp: Math.min(MAX_REWARD_XP, Math.max(MIN_REWARD_XP, rounded)),
      };
    });
}
