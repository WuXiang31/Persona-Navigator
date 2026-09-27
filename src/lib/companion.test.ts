import { describe, expect, it } from "vitest";
import { statusLine } from "./companion";

const stats = { knowledge: 180, vitality: 240, charm: 120, craft: 300, nerve: 90 };

describe("statusLine", () => {
  it("calls out the weakest stat", () => {
    expect(statusLine(stats, [{ status: "active" }])).toContain("NERVE");
  });

  it("picks the first stat in display order on a tie", () => {
    const zero = { knowledge: 0, vitality: 0, charm: 0, craft: 0, nerve: 0 };
    expect(statusLine(zero, [])).toContain("KNOWLEDGE");
  });

  it("praises a full clear", () => {
    expect(statusLine(stats, [{ status: "completed" }, { status: "completed" }])).toMatch(/Full clear/);
  });

  it("does not treat an empty mission list as a full clear", () => {
    expect(statusLine(stats, [])).toContain("NERVE");
  });
});
