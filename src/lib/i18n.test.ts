import { describe, expect, it } from "vitest";
import { MESSAGES } from "./i18n";
import { AGE_RANGES, OCCUPATIONS, SITUATIONS } from "./mask";
import { RANK_NAMES } from "./progression";

// Every leaf path in a message tree, e.g. "home.title" or "awakening.ages.18-22"
function paths(node: unknown, prefix = ""): string[] {
  if (node && typeof node === "object" && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, value]) => paths(value, prefix ? `${prefix}.${key}` : key));
  }
  return [prefix];
}

describe("translations", () => {
  it("zh has exactly the same keys as en", () => {
    expect(paths(MESSAGES.zh).sort()).toEqual(paths(MESSAGES.en).sort());
  });

  it("covers every questionnaire option and rank", () => {
    for (const lang of ["en", "zh"] as const) {
      const t = MESSAGES[lang];
      expect(AGE_RANGES.every((a) => t.awakening.ages[a.id])).toBe(true);
      expect(OCCUPATIONS.every((o) => t.awakening.occupations[o.id])).toBe(true);
      expect(SITUATIONS.every((s) => t.awakening.situations[s.id])).toBe(true);
      expect(t.rank).toHaveLength(RANK_NAMES.length);
    }
  });

  it("keeps function messages callable with the same arity", () => {
    const en = MESSAGES.en.chat.welcome;
    const zh = MESSAGES.zh.chat.welcome;
    expect(zh.length).toBe(en.length);
    expect(zh("Vesper", null)).toContain("Vesper");
  });
});
