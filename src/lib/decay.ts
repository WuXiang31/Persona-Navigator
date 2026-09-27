import type { Stats } from "@/context/ProfileContext";
import { STATS_ORDER, clampStat } from "./progression";

// A stat that hasn't gained XP for more than DECAY_GRACE_DAYS loses DECAY_XP_PER_DAY per extra day
export const DECAY_GRACE_DAYS = 3;
export const DECAY_XP_PER_DAY = 5;

// Local calendar day as "YYYY-MM-DD"
export type DayKey = string;

export interface DecayState {
  // Last day each stat gained XP
  lastTrained: Record<keyof Stats, DayKey>;
  // Decay has been charged for every day up to and including this one
  appliedThrough: DayKey;
}

export function todayKey(now = new Date()): DayKey {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayNumber(key: DayKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export function initialDecayState(today: DayKey): DecayState {
  return {
    lastTrained: Object.fromEntries(STATS_ORDER.map((s) => [s, today])) as Record<keyof Stats, DayKey>,
    appliedThrough: today,
  };
}

// Charges decay for the days since it was last applied. Idempotent within a day.
export function applyDecay(
  stats: Stats,
  state: DecayState,
  today: DayKey
): { stats: Stats; state: DecayState; losses: Partial<Record<keyof Stats, number>> } {
  const todayNum = dayNumber(today);
  const appliedNum = dayNumber(state.appliedThrough);
  const next = { ...stats };
  const losses: Partial<Record<keyof Stats, number>> = {};

  for (const stat of STATS_ORDER) {
    // Days after both the last charge and the grace period that are now due
    const decayStart = Math.max(appliedNum, dayNumber(state.lastTrained[stat] ?? today) + DECAY_GRACE_DAYS);
    const days = Math.max(0, todayNum - decayStart);
    const lost = stats[stat] - clampStat(stats[stat] - days * DECAY_XP_PER_DAY);
    if (lost > 0) {
      next[stat] -= lost;
      losses[stat] = lost;
    }
  }

  return { stats: next, state: { ...state, appliedThrough: today }, losses };
}
