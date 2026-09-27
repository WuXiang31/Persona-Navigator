import { describe, expect, it } from "vitest";
import { clampStat, getRankIndex, getRankName } from "./progression";

describe("ranks", () => {
  it.each([
    [0, 0, "Novice"],
    [99, 0, "Novice"],
    [100, 1, "Apprentice"],
    [250, 2, "Adept"],
    [399, 3, "Expert"],
    [400, 4, "Master"],
    [500, 4, "Master"],
  ])("%i XP is rank %i (%s)", (xp, index, name) => {
    expect(getRankIndex(xp)).toBe(index);
    expect(getRankName(xp)).toBe(name);
  });
});

describe("clampStat", () => {
  it("keeps stats within 0-500", () => {
    expect(clampStat(-20)).toBe(0);
    expect(clampStat(250)).toBe(250);
    expect(clampStat(640)).toBe(500);
  });
});
