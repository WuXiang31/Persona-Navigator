import type { Stats } from "@/context/ProfileContext";
import type { Mask } from "./mask";
import { STATS_ORDER, getRankName } from "./progression";
import { todayKey } from "./decay";

type Stat = keyof Stats;

// One XP change, kept so a month can be recapped even after missions are deleted
export interface XpEvent {
  t: number; // epoch ms
  stat: Stat;
  xp: number; // applied change; negative for decay
  kind: "mission" | "quicklog" | "decay";
  missionId?: string;
  title?: string;
  routine?: boolean; // the mission came from the mask's routines
  weather?: boolean; // the weather bonus applied
}

// The month being played. A chapter is a calendar month, starting when it is first opened.
export interface Chapter {
  month: MonthKey;
  number: number;
  startedOn: string; // day key; later than the 1st for a player's first chapter
  startStats: Stats;
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface StatLine {
  stat: Stat;
  start: number;
  end: number;
  gained: number; // XP from missions and Quick Log
  lost: number; // XP lost to decay (positive number)
  startRank: string;
  endRank: string;
}

export interface Recap {
  month: MonthKey;
  number: number;
  startedOn: string;
  endedOn: string;
  mask: { name: string; identity: string; focusStats: [Stat, Stat] } | null;
  stats: StatLine[];
  missionsCleared: number;
  fromRoutines: number;
  quickLogs: number;
  activeDays: number;
  longestStreak: number;
  topMissions: { title: string; count: number }[];
  untouchedRoutines: string[];
  mostImproved: Stat | null;
  leastTrained: Stat | null;
  timeOfDay: Record<TimeOfDay, number>;
  favoriteTime: TimeOfDay | null;
  weatherBoosted: number;
  // Written by the navigator the first time the recap is opened
  summary?: string;
  seen: boolean;
}

// Local calendar month as "YYYY-MM"
export type MonthKey = string;

export function monthKey(date = new Date()): MonthKey {
  return todayKey(date).slice(0, 7);
}

export function isLastDayOfMonth(date = new Date()): boolean {
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  return next.getMonth() !== date.getMonth();
}

// Keep this many months of events (the current one plus two before it)
export const LOG_MONTHS = 3;

export function pruneLog(log: XpEvent[], now = new Date()): XpEvent[] {
  const cutoff = new Date(now.getFullYear(), now.getMonth() - (LOG_MONTHS - 1), 1).getTime();
  return log.filter((e) => e.t >= cutoff);
}

export function timeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

// Longest run of consecutive days in a sorted list of distinct day keys
export function longestStreak(days: string[]): number {
  let best = 0;
  let run = 0;
  let prev: number | null = null;
  for (const key of days) {
    const [y, m, d] = key.split("-").map(Number);
    const n = Date.UTC(y, m - 1, d) / 86_400_000;
    run = prev !== null && n === prev + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = n;
  }
  return best;
}

const inMonth = (e: XpEvent, month: MonthKey) => monthKey(new Date(e.t)) === month;

// Last day of `month` as a day key
function lastDayOf(month: MonthKey): string {
  const [y, m] = month.split("-").map(Number);
  return todayKey(new Date(y, m, 0));
}

export function buildRecap(chapter: Chapter, endStats: Stats, log: XpEvent[], mask: Mask | null): Recap {
  const events = log.filter((e) => inMonth(e, chapter.month));
  const missions = events.filter((e) => e.kind === "mission");

  const stats: StatLine[] = STATS_ORDER.map((stat) => {
    const mine = events.filter((e) => e.stat === stat);
    const start = chapter.startStats[stat] ?? 0;
    const end = endStats[stat] ?? 0;
    return {
      stat,
      start,
      end,
      gained: mine.filter((e) => e.xp > 0).reduce((sum, e) => sum + e.xp, 0),
      lost: mine.filter((e) => e.xp < 0).reduce((sum, e) => sum - e.xp, 0),
      startRank: getRankName(start),
      endRank: getRankName(end),
    };
  });

  const days = [...new Set(events.filter((e) => e.kind !== "decay").map((e) => todayKey(new Date(e.t))))].sort();

  const titleCounts = new Map<string, number>();
  for (const e of missions) if (e.title) titleCounts.set(e.title, (titleCounts.get(e.title) ?? 0) + 1);
  const topMissions = [...titleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title, count]) => ({ title, count }));

  const timeOfDayCounts: Record<TimeOfDay, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (const e of missions) timeOfDayCounts[timeOfDay(new Date(e.t).getHours())]++;
  const favoriteTime = missions.length
    ? (Object.entries(timeOfDayCounts).sort((a, b) => b[1] - a[1])[0][0] as TimeOfDay)
    : null;

  const trained = stats.filter((s) => s.gained > 0);
  const byGain = [...stats].sort((a, b) => b.gained - a.gained);
  const missionCount = (stat: Stat) => missions.filter((e) => e.stat === stat).length;

  return {
    month: chapter.month,
    number: chapter.number,
    startedOn: chapter.startedOn,
    endedOn: lastDayOf(chapter.month),
    mask: mask ? { name: mask.name, identity: mask.identity, focusStats: mask.focusStats } : null,
    stats,
    missionsCleared: missions.length,
    fromRoutines: missions.filter((e) => e.routine).length,
    quickLogs: events.filter((e) => e.kind === "quicklog").length,
    activeDays: days.length,
    longestStreak: longestStreak(days),
    topMissions,
    untouchedRoutines: (mask?.routines ?? []).map((r) => r.title).filter((title) => !titleCounts.has(title)),
    mostImproved: trained.length ? byGain[0].stat : null,
    leastTrained: missions.length ? [...STATS_ORDER].sort((a, b) => missionCount(a) - missionCount(b))[0] : null,
    timeOfDay: timeOfDayCounts,
    favoriteTime,
    weatherBoosted: missions.filter((e) => e.weather).length,
    seen: false,
  };
}

export type Rollover =
  // First launch with chapters: start one now, nothing to recap
  | { action: "start"; chapter: Chapter }
  // Same month: keep going
  | { action: "none" }
  // A new month began: close the old chapter with a recap and open the next
  | { action: "close"; recap: Recap; chapter: Chapter };

export function planRollover(
  current: Chapter | null,
  stats: Stats,
  log: XpEvent[],
  mask: Mask | null,
  now = new Date()
): Rollover {
  const month = monthKey(now);
  const today = todayKey(now);
  if (!current) return { action: "start", chapter: { month, number: 1, startedOn: today, startStats: stats } };
  if (current.month === month) return { action: "none" };
  return {
    action: "close",
    recap: buildRecap(current, stats, log, mask),
    chapter: { month, number: current.number + 1, startedOn: `${month}-01`, startStats: stats },
  };
}

// "August 2026"
export function monthLabel(month: MonthKey): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
}

// "Aug 31"
export function dayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en", { month: "short", day: "numeric" });
}
