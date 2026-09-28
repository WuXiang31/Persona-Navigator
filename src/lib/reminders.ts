import type { XpEvent } from "./chapter";

export const DEFAULT_REMINDER_HOUR = 20;
// A reminder still goes out this many hours after the chosen hour, covering cron delays (±59 min on Hobby)
export const REMINDER_WINDOW_HOURS = 3;

export interface ReminderTarget {
  timeZone: string;
  hour: number;
  lastSentDay: string | null;
}

export function isValidTimeZone(timeZone: unknown): timeZone is string {
  if (typeof timeZone !== "string" || !timeZone) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function sanitizeHour(hour: unknown): number {
  const n = Math.round(Number(hour));
  return Number.isFinite(n) && n >= 0 && n <= 23 ? n : DEFAULT_REMINDER_HOUR;
}

// The local calendar day ("YYYY-MM-DD") and hour of `now` in `timeZone`
export function localParts(now: Date, timeZone: string): { day: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value])
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

// Due once the local clock passes the chosen hour, within the window, and not yet handled today
export function isReminderDue(target: ReminderTarget, now: Date): { due: boolean; day: string } {
  const { day, hour } = localParts(now, target.timeZone);
  const due = hour >= target.hour && hour < target.hour + REMINDER_WINDOW_HOURS && target.lastSentDay !== day;
  return { due, day };
}

// Whether the XP log (the raw `persona_log` value) has a mission completed on the player's local `day`
export function playedOn(rawLog: string | undefined, timeZone: string, day: string): boolean {
  if (!rawLog) return false;
  let log: XpEvent[];
  try {
    log = JSON.parse(rawLog);
  } catch {
    return false;
  }
  return Array.isArray(log) && log.some((e) => e?.kind === "mission" && localParts(new Date(e.t), timeZone).day === day);
}
