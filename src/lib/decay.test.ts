import { describe, expect, it } from "vitest";
import { applyDecay, initialDecayState, todayKey } from "./decay";

const stats = { knowledge: 100, vitality: 100, charm: 3, craft: 100, nerve: 100 };

describe("applyDecay", () => {
  it("charges nothing within the 3-day grace period", () => {
    expect(applyDecay(stats, initialDecayState("2026-09-01"), "2026-09-04").losses).toEqual({});
  });

  it("charges 5 XP per idle day after the grace period, floored at 0", () => {
    const { losses, stats: next } = applyDecay(stats, initialDecayState("2026-09-01"), "2026-09-05");
    expect(losses).toEqual({ knowledge: 5, vitality: 5, charm: 3, craft: 5, nerve: 5 });
    expect(next.charm).toBe(0);
  });

  it("tracks each stat's last training day separately", () => {
    const state = initialDecayState("2026-09-01");
    state.lastTrained.vitality = "2026-09-05";
    const { losses } = applyDecay(stats, state, "2026-09-10");
    expect(losses.knowledge).toBe(30); // idle since 09-01: days 5-10 charged
    expect(losses.vitality).toBe(10); // idle since 09-05: days 9-10 charged
  });

  it("is idempotent within a day and only charges new days afterwards", () => {
    const first = applyDecay(stats, initialDecayState("2026-09-01"), "2026-09-10");
    expect(applyDecay(first.stats, first.state, "2026-09-10").losses).toEqual({});
    expect(applyDecay(first.stats, first.state, "2026-09-11").losses.knowledge).toBe(5);
  });

  it("counts days across month boundaries", () => {
    const { losses } = applyDecay(stats, initialDecayState("2026-09-29"), "2026-10-03");
    expect(losses.knowledge).toBe(5);
  });
});

describe("todayKey", () => {
  it("formats the local date as YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
