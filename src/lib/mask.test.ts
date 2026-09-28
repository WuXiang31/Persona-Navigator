import { describe, expect, it } from "vitest";
import {
  FOCUS_BOOST,
  MAX_ROUTINES,
  Mask,
  describeProfile,
  isFocusStat,
  legacyMask,
  missionXp,
  sanitizeFocusStats,
  sanitizeMask,
  sanitizeProfile,
  writingLanguage,
} from "./mask";

const mask: Mask = {
  name: "The Code Wanderer",
  identity: "I build things and still go outside.",
  focusStats: ["craft", "charm"],
  routines: [],
  equippedAt: 0,
};

describe("missionXp", () => {
  it("pays the base XP with no bonus", () => {
    expect(missionXp(40, "vitality", null, mask)).toBe(40);
    expect(missionXp(40, "craft", null, null)).toBe(40);
  });

  it("boosts the mask's focus stats by FOCUS_BOOST", () => {
    expect(FOCUS_BOOST).toBe(1.25);
    expect(missionXp(40, "craft", null, mask)).toBe(50);
    expect(missionXp(20, "charm", null, mask)).toBe(25);
  });

  it("multiplies the weather and focus bonuses", () => {
    // cloudy boosts craft x1.5, focus x1.25
    expect(missionXp(40, "craft", "cloudy", mask)).toBe(75);
    // storm boosts every stat; vitality is not a focus stat
    expect(missionXp(40, "vitality", "storm", mask)).toBe(60);
  });

  it("rounds to whole XP", () => {
    expect(missionXp(10, "craft", null, mask)).toBe(13);
  });
});

describe("isFocusStat", () => {
  it("is false without a mask", () => {
    expect(isFocusStat(null, "craft")).toBe(false);
    expect(isFocusStat(mask, "craft")).toBe(true);
    expect(isFocusStat(mask, "nerve")).toBe(false);
  });
});

describe("sanitizeFocusStats", () => {
  it("keeps two distinct valid stats and fills gaps", () => {
    expect(sanitizeFocusStats(["craft", "charm"])).toEqual(["craft", "charm"]);
    expect(sanitizeFocusStats(["craft", "craft", "magic"])).toEqual(["craft", "knowledge"]);
    expect(sanitizeFocusStats(undefined)).toEqual(["knowledge", "vitality"]);
  });
});

describe("sanitizeMask", () => {
  it("rejects output without a name", () => {
    expect(sanitizeMask(null)).toBeNull();
    expect(sanitizeMask({ name: "  ", routines: [] })).toBeNull();
  });

  it("trims text, caps routines and cleans each routine", () => {
    const routines = Array.from({ length: 14 }, (_, i) => ({
      title: `Task ${i}`,
      description: "",
      rewardStat: i === 0 ? "magic" : "craft",
      rewardXp: 33,
    }));
    const result = sanitizeMask(
      { name: `  ${"N".repeat(60)} `, identity: " I ship. ", focusStats: ["craft", "nerve"], routines },
      123
    )!;
    expect(result.name).toHaveLength(40);
    expect(result.identity).toBe("I ship.");
    expect(result.focusStats).toEqual(["craft", "nerve"]);
    expect(result.routines).toHaveLength(MAX_ROUTINES);
    expect(result.routines[0]).toEqual({ title: "Task 1", description: "", rewardStat: "craft", rewardXp: 30 });
    expect(result.equippedAt).toBe(123);
  });
});

describe("sanitizeProfile", () => {
  it("requires a known age range and occupation", () => {
    expect(sanitizeProfile({ ageRange: "18-22" })).toBeNull();
    expect(sanitizeProfile({ ageRange: "99", occupation: "student" })).toBeNull();
  });

  it("trims free text and drops empty situations", () => {
    expect(
      sanitizeProfile({
        ageRange: "18-22",
        occupation: "student",
        occupationDetail: " CS ",
        situations: ["coursework", " ", 4, " finals soon "],
        aspiration: " ship things ",
      })
    ).toEqual({
      ageRange: "18-22",
      occupation: "student",
      occupationDetail: "CS",
      situations: ["coursework", "finals soon"],
      aspiration: "ship things",
    });
  });
});

describe("describeProfile", () => {
  it("turns option ids into readable labels", () => {
    const text = describeProfile({
      ageRange: "18-22",
      occupation: "student",
      occupationDetail: "Computer Science",
      situations: ["coursework", "finals soon"],
      aspiration: "ship things",
    });
    expect(text).toContain("Occupation: Student (Computer Science)");
    expect(text).toContain("Buried in assignments and exams; finals soon");
    expect(text).toContain("Wants to become: ship things");
  });
});

describe("legacyMask", () => {
  it("maps the original roles to preset focus stats", () => {
    expect(legacyMask("athlete")?.focusStats).toEqual(["vitality", "nerve"]);
    expect(legacyMask("athlete")?.routines).toEqual([]);
    expect(legacyMask(null)).toBeNull();
    expect(legacyMask("unknown")).toBeNull();
  });
});

describe("writingLanguage", () => {
  it("detects CJK scripts in the player's own words", () => {
    expect(writingLanguage(["计算机专业大三", undefined])).toBe("Simplified Chinese");
    expect(writingLanguage(["情報工学の学生"])).toBe("Japanese");
    expect(writingLanguage(["컴퓨터 공학"])).toBe("Korean");
    expect(writingLanguage(["3rd-year CS"])).toMatch(/English if unclear/);
    // No telling text: the UI language decides
    expect(writingLanguage(["", undefined], "zh")).toBe("Simplified Chinese");
    expect(writingLanguage(["3rd-year CS"], "en")).toMatch(/English if unclear/);
  });
});
