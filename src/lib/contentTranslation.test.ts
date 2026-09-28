import { describe, expect, it } from "vitest";
import type { Mission } from "@/context/MissionContext";
import type { Mask } from "./mask";
import {
  collectTexts,
  needsTranslation,
  nextContentLangState,
  pairTranslations,
  restorable,
  translateMask,
  translateMission,
} from "./contentTranslation";

const mask: Mask = {
  name: "The Silicon Architect",
  identity: "I am becoming a disciplined engineer.",
  focusStats: ["knowledge", "craft"],
  routines: [{ title: "Solve one LeetCode problem", description: "", rewardStat: "craft", rewardXp: 20 }],
  equippedAt: 0,
};

const mission = (title: string, status: Mission["status"] = "active"): Mission => ({
  id: title,
  title,
  description: "Review one core concept",
  rewardStat: "knowledge",
  rewardXp: 50,
  status,
  createdAt: 0,
});

describe("needsTranslation", () => {
  it("wants Chinese characters in Chinese and none in English", () => {
    expect(needsTranslation("Study algorithms", "zh")).toBe(true);
    expect(needsTranslation("学习算法", "zh")).toBe(false);
    expect(needsTranslation("刷一道 LeetCode", "zh")).toBe(false);
    expect(needsTranslation("学习算法", "en")).toBe(true);
    expect(needsTranslation("Study algorithms", "en")).toBe(false);
    expect(needsTranslation("  ", "zh")).toBe(false);
  });
});

describe("collectTexts", () => {
  it("gathers the mask and active missions not yet in the language, once each", () => {
    const missions = [mission("Study DSA"), mission("Study DSA"), mission("Old task", "completed"), mission("跑步")];
    expect(collectTexts(mask, missions, "zh")).toEqual([
      "The Silicon Architect",
      "I am becoming a disciplined engineer.",
      "Solve one LeetCode problem",
      "Study DSA",
      "Review one core concept",
    ]);
    expect(collectTexts(null, [], "zh")).toEqual([]);
  });
});

describe("applying translations", () => {
  const map = new Map([
    ["The Silicon Architect", "硅之建筑师"],
    ["Study DSA", "学习数据结构与算法"],
  ]);

  it("swaps translated texts and keeps the rest", () => {
    const translated = translateMask(mask, map);
    expect(translated.name).toBe("硅之建筑师");
    expect(translated.identity).toBe(mask.identity);
    expect(translated.focusStats).toEqual(mask.focusStats);
    expect(translateMission(mission("Study DSA"), map).title).toBe("学习数据结构与算法");
  });

  it("leaves completed missions as they were", () => {
    expect(translateMission(mission("Study DSA", "completed"), map).title).toBe("Study DSA");
  });
});

describe("pairTranslations", () => {
  it("pairs one output per input", () => {
    expect(pairTranslations(["a", "b"], ["甲", " 乙 "])).toEqual(new Map([["a", "甲"], ["b", "乙"]]));
  });

  it("rejects mismatched or malformed output", () => {
    expect(pairTranslations(["a", "b"], ["甲"])).toBeNull();
    expect(pairTranslations(["a"], [1])).toBeNull();
    expect(pairTranslations(["a"], undefined)).toBeNull();
  });

  it("keeps the original when a translation is blank", () => {
    expect(pairTranslations(["a"], [""])).toEqual(new Map());
  });
});

describe("switching back", () => {
  it("restores the originals a translation replaced and sends only new text to the AI", () => {
    const state = nextContentLangState("zh", new Map([["The Silicon Architect", "硅谷架构师"]]));
    expect(state).toEqual({ lang: "zh", originals: { 硅谷架构师: "The Silicon Architect" } });

    const { known, missing } = restorable(["硅谷架构师", "跑步 3 公里"], state);
    expect(known).toEqual(new Map([["硅谷架构师", "The Silicon Architect"]]));
    expect(missing).toEqual(["跑步 3 公里"]);
    expect(restorable(["跑步"], null)).toEqual({ known: new Map(), missing: ["跑步"] });
  });
});
