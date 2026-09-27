import { describe, expect, it } from "vitest";
import { sanitizeMissions } from "./missionProposals";

describe("sanitizeMissions", () => {
  it("returns an empty list for non-array input", () => {
    expect(sanitizeMissions(undefined)).toEqual([]);
    expect(sanitizeMissions({ title: "x" })).toEqual([]);
  });

  it("drops missions with an unknown stat or empty title", () => {
    const result = sanitizeMissions([
      { title: "Read", description: "", rewardStat: "knowledge", rewardXp: 40 },
      { title: "Fly", description: "", rewardStat: "magic", rewardXp: 40 },
      { title: "  ", description: "", rewardStat: "charm", rewardXp: 40 },
    ]);
    expect(result.map((m) => m.title)).toEqual(["Read"]);
  });

  it("rounds XP to a multiple of 10 within 10-100", () => {
    const xp = (rewardXp: unknown) =>
      sanitizeMissions([{ title: "t", description: "", rewardStat: "craft", rewardXp }])[0].rewardXp;
    expect(xp(44)).toBe(40);
    expect(xp(3)).toBe(10);
    expect(xp(250)).toBe(100);
    expect(xp("not a number")).toBe(50);
  });

  it("trims text and keeps at most 5 missions", () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      title: ` Task ${i} `,
      description: " detail ",
      rewardStat: "nerve",
      rewardXp: 20,
    }));
    const result = sanitizeMissions(many);
    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ title: "Task 0", description: "detail", rewardStat: "nerve", rewardXp: 20 });
  });
});
