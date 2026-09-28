import { describe, expect, it } from "vitest";
import { isSyncedKey, planHydration } from "./cloudSync";

const server = { persona_role: "athlete", persona_stats: '{"knowledge":10}' };
const local = { persona_role: "scholar", persona_missions: "[]" };

describe("planHydration", () => {
  it("uses the account's cloud data whenever it has any", () => {
    expect(planHydration("u1", server, local, null)).toEqual({ action: "use-server", entries: server });
    expect(planHydration("u1", server, local, "u2")).toEqual({ action: "use-server", entries: server });
  });

  it("imports this browser's progress on first sign-in when it has no owner yet", () => {
    expect(planHydration("u1", {}, local, null)).toEqual({ action: "import-local", entries: local });
  });

  it("imports local data that already belongs to the same user", () => {
    expect(planHydration("u1", {}, local, "u1")).toEqual({ action: "import-local", entries: local });
  });

  it("never hands one account's local data to another", () => {
    expect(planHydration("u1", {}, local, "u2")).toEqual({ action: "start-fresh" });
  });

  it("starts fresh when neither side has data", () => {
    expect(planHydration("u1", {}, {}, null)).toEqual({ action: "start-fresh" });
  });
});

describe("isSyncedKey", () => {
  it("accepts game state keys and rejects everything else", () => {
    expect(isSyncedKey("persona_missions")).toBe(true);
    expect(isSyncedKey("persona_weather")).toBe(false);
    expect(isSyncedKey("persona_owner")).toBe(false);
  });
});
