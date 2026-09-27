import { describe, expect, it } from "vitest";
import { boostedXp, conditionFromWmoCode, isBoosted } from "./weather";

describe("conditionFromWmoCode", () => {
  it.each([
    [0, "clear"],
    [1, "clear"],
    [2, "cloudy"],
    [3, "cloudy"],
    [45, "cloudy"],
    [48, "cloudy"],
    [51, "rainy"],
    [67, "rainy"],
    [80, "rainy"],
    [82, "rainy"],
    [71, "snowy"],
    [77, "snowy"],
    [85, "snowy"],
    [86, "snowy"],
    [95, "storm"],
    [99, "storm"],
  ] as const)("code %i -> %s", (code, condition) => {
    expect(conditionFromWmoCode(code)).toBe(condition);
  });
});

describe("weather bonus", () => {
  it("boosts only the matching stat", () => {
    expect(isBoosted("rainy", "knowledge")).toBe(true);
    expect(isBoosted("rainy", "charm")).toBe(false);
    expect(boostedXp(50, "rainy", "knowledge")).toBe(75);
    expect(boostedXp(50, "rainy", "vitality")).toBe(50);
  });

  it("boosts every stat during a storm", () => {
    expect(boostedXp(30, "storm", "nerve")).toBe(45);
    expect(boostedXp(30, "storm", "charm")).toBe(45);
  });

  it("rounds boosted XP", () => {
    expect(boostedXp(15, "clear", "charm")).toBe(23);
  });

  it("gives no bonus when the weather is unknown", () => {
    expect(isBoosted(null, "knowledge")).toBe(false);
    expect(boostedXp(50, null, "knowledge")).toBe(50);
  });
});
