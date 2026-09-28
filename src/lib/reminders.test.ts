import { describe, expect, it } from "vitest";
import { isReminderDue, isValidTimeZone, localParts, playedOn, sanitizeHour } from "./reminders";

const MEL = "Australia/Melbourne"; // UTC+10 in September 2026 (before daylight saving)

describe("time zones", () => {
  it("validates IANA names", () => {
    expect(isValidTimeZone(MEL)).toBe(true);
    expect(isValidTimeZone("Mars/Base")).toBe(false);
    expect(isValidTimeZone(undefined)).toBe(false);
  });

  it("reads the local day and hour", () => {
    // 10:30 UTC = 20:30 in Melbourne
    expect(localParts(new Date("2026-09-28T10:30:00Z"), MEL)).toEqual({ day: "2026-09-28", hour: 20 });
    // 15:00 UTC on the 28th is already the 29th in Melbourne
    expect(localParts(new Date("2026-09-28T15:00:00Z"), MEL)).toEqual({ day: "2026-09-29", hour: 1 });
  });

  it("clamps the reminder hour", () => {
    expect(sanitizeHour("21")).toBe(21);
    expect(sanitizeHour(24)).toBe(20);
    expect(sanitizeHour("x")).toBe(20);
  });
});

describe("isReminderDue", () => {
  const target = { timeZone: MEL, hour: 20, lastSentDay: null };

  it("is due from the chosen hour, within the window", () => {
    expect(isReminderDue(target, new Date("2026-09-28T09:59:00Z")).due).toBe(false); // 19:59
    expect(isReminderDue(target, new Date("2026-09-28T10:00:00Z"))).toEqual({ due: true, day: "2026-09-28" }); // 20:00
    expect(isReminderDue(target, new Date("2026-09-28T12:59:00Z")).due).toBe(true); // 22:59
    expect(isReminderDue(target, new Date("2026-09-28T13:00:00Z")).due).toBe(false); // 23:00
  });

  it("goes out at most once a day", () => {
    expect(isReminderDue({ ...target, lastSentDay: "2026-09-28" }, new Date("2026-09-28T10:30:00Z")).due).toBe(false);
    expect(isReminderDue({ ...target, lastSentDay: "2026-09-27" }, new Date("2026-09-28T10:30:00Z")).due).toBe(true);
  });
});

describe("playedOn", () => {
  const log = JSON.stringify([
    { t: Date.parse("2026-09-28T00:30:00Z"), stat: "craft", xp: 25, kind: "mission" }, // 10:30 on the 28th
    { t: Date.parse("2026-09-28T01:00:00Z"), stat: "charm", xp: -5, kind: "decay" },
  ]);

  it("finds missions completed on the player's local day", () => {
    expect(playedOn(log, MEL, "2026-09-28")).toBe(true);
    expect(playedOn(log, MEL, "2026-09-29")).toBe(false);
  });

  it("ignores decay, missing or corrupt logs", () => {
    const decayOnly = JSON.stringify([{ t: Date.parse("2026-09-28T01:00:00Z"), stat: "charm", xp: -5, kind: "decay" }]);
    expect(playedOn(decayOnly, MEL, "2026-09-28")).toBe(false);
    expect(playedOn(undefined, MEL, "2026-09-28")).toBe(false);
    expect(playedOn("{oops", MEL, "2026-09-28")).toBe(false);
  });
});
