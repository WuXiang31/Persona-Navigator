import { describe, expect, it } from "vitest";
import {
  Chapter,
  XpEvent,
  buildRecap,
  isLastDayOfMonth,
  longestStreak,
  monthKey,
  planRollover,
  pruneLog,
  timeOfDay,
} from "./chapter";
import type { Mask } from "./mask";

const zero = { knowledge: 0, vitality: 0, charm: 0, craft: 0, nerve: 0 };
// Local time, September 2026
const at = (day: number, hour = 10) => new Date(2026, 8, day, hour).getTime();

const mask: Mask = {
  name: "The Product Builder",
  identity: "I ship.",
  focusStats: ["craft", "knowledge"],
  routines: [
    { title: "Ship one commit", description: "", rewardStat: "craft", rewardXp: 50 },
    { title: "Speak up in class", description: "", rewardStat: "nerve", rewardXp: 40 },
  ],
  equippedAt: 0,
};

const mission = (day: number, hour: number, stat: XpEvent["stat"], xp: number, title: string, extra = {}): XpEvent => ({
  t: at(day, hour),
  stat,
  xp,
  kind: "mission",
  title,
  ...extra,
});

describe("month helpers", () => {
  it("formats the local month", () => {
    expect(monthKey(new Date(2026, 8, 30, 23))).toBe("2026-09");
  });

  it("knows the last day of a month", () => {
    expect(isLastDayOfMonth(new Date(2026, 8, 30))).toBe(true);
    expect(isLastDayOfMonth(new Date(2026, 8, 29))).toBe(false);
    expect(isLastDayOfMonth(new Date(2028, 1, 29))).toBe(true);
  });

  it("buckets hours into times of day", () => {
    expect(timeOfDay(5)).toBe("morning");
    expect(timeOfDay(12)).toBe("afternoon");
    expect(timeOfDay(21)).toBe("evening");
    expect(timeOfDay(22)).toBe("night");
    expect(timeOfDay(3)).toBe("night");
  });

  it("finds the longest run of consecutive days, across month ends", () => {
    expect(longestStreak([])).toBe(0);
    expect(longestStreak(["2026-09-01", "2026-09-02", "2026-09-04", "2026-09-05", "2026-09-06"])).toBe(3);
    expect(longestStreak(["2026-09-30", "2026-10-01"])).toBe(2);
  });

  it("keeps three months of events", () => {
    const now = new Date(2026, 10, 15);
    const log = [at(1), new Date(2026, 7, 31).getTime()].map((t) => ({ t, stat: "craft", xp: 5, kind: "quicklog" }) as XpEvent);
    expect(pruneLog(log, now).map((e) => e.t)).toEqual([at(1)]);
  });
});

describe("buildRecap", () => {
  const chapter: Chapter = { month: "2026-09", number: 2, startedOn: "2026-09-01", startStats: { ...zero, craft: 63 } };
  const log: XpEvent[] = [
    mission(1, 21, "craft", 63, "Ship one commit", { routine: true }),
    mission(2, 20, "craft", 63, "Ship one commit", { routine: true, weather: true }),
    mission(3, 9, "knowledge", 50, "Read a paper"),
    mission(5, 19, "craft", 63, "Ship one commit", { routine: true }),
    { t: at(6), stat: "vitality", xp: 15, kind: "quicklog" },
    { t: at(20), stat: "charm", xp: -5, kind: "decay" },
    // Other months are ignored
    { t: new Date(2026, 9, 1).getTime(), stat: "nerve", xp: 40, kind: "mission", title: "Later" },
  ];
  const end = { ...zero, craft: 252, knowledge: 50, vitality: 15 };
  const recap = buildRecap(chapter, end, log, mask);

  it("counts missions, routines and quick logs for the month only", () => {
    expect(recap.missionsCleared).toBe(4);
    expect(recap.fromRoutines).toBe(3);
    expect(recap.quickLogs).toBe(1);
    expect(recap.weatherBoosted).toBe(1);
  });

  it("reports per-stat gains, decay and rank changes", () => {
    const craft = recap.stats.find((s) => s.stat === "craft")!;
    expect(craft).toMatchObject({ start: 63, end: 252, gained: 189, lost: 0, startRank: "Novice", endRank: "Adept" });
    expect(recap.stats.find((s) => s.stat === "charm")!.lost).toBe(5);
    expect(recap.mostImproved).toBe("craft");
  });

  it("finds active days and the longest streak (decay days don't count)", () => {
    expect(recap.activeDays).toBe(5);
    expect(recap.longestStreak).toBe(3);
  });

  it("finds the favorite time of day", () => {
    expect(recap.timeOfDay).toEqual({ morning: 1, afternoon: 0, evening: 3, night: 0 });
    expect(recap.favoriteTime).toBe("evening");
  });

  it("lists repeated missions and routines never done", () => {
    expect(recap.topMissions[0]).toEqual({ title: "Ship one commit", count: 3 });
    expect(recap.untouchedRoutines).toEqual(["Speak up in class"]);
    expect(recap.leastTrained).not.toBe("craft");
  });

  it("closes the chapter on the month's last day and snapshots the mask", () => {
    expect(recap.endedOn).toBe("2026-09-30");
    expect(recap.mask).toEqual({ name: mask.name, identity: mask.identity, focusStats: mask.focusStats });
    expect(recap.seen).toBe(false);
  });

  it("handles a quiet month", () => {
    const quiet = buildRecap(chapter, chapter.startStats, [], null);
    expect(quiet).toMatchObject({ missionsCleared: 0, activeDays: 0, favoriteTime: null, mostImproved: null, mask: null });
  });
});

describe("planRollover", () => {
  const sept: Chapter = { month: "2026-09", number: 1, startedOn: "2026-09-28", startStats: zero };

  it("starts the first chapter on the day chapters first run", () => {
    expect(planRollover(null, zero, [], null, new Date(2026, 8, 28))).toEqual({
      action: "start",
      chapter: { month: "2026-09", number: 1, startedOn: "2026-09-28", startStats: zero },
    });
  });

  it("does nothing within the same month", () => {
    expect(planRollover(sept, zero, [], null, new Date(2026, 8, 30, 23)).action).toBe("none");
  });

  it("closes the month with a recap and opens the next chapter on the 1st", () => {
    const stats = { ...zero, craft: 40 };
    const result = planRollover(sept, stats, [], mask, new Date(2026, 9, 1, 8));
    expect(result.action).toBe("close");
    if (result.action !== "close") return;
    expect(result.recap).toMatchObject({ month: "2026-09", number: 1, startedOn: "2026-09-28" });
    expect(result.chapter).toEqual({ month: "2026-10", number: 2, startedOn: "2026-10-01", startStats: stats });
  });
});
