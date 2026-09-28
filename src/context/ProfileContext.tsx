"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useToast } from "./ToastContext";
import { clampStat, getRankIndex } from "@/lib/progression";
import { translateMask } from "@/lib/contentTranslation";
import { createLocalStore, useIsClient, useLocalStore } from "@/lib/localStore";
import { DecayState, applyDecay, initialDecayState, todayKey } from "@/lib/decay";
import { Mask, PlayerProfile, legacyMask } from "@/lib/mask";
import { Chapter, Recap, XpEvent, planRollover, pruneLog } from "@/lib/chapter";
import { messages } from "@/lib/i18n";

export type RoleType = "scholar" | "professional" | "creative" | "athlete" | "explorer" | null;

export interface Stats {
  knowledge: number;
  vitality: number;
  charm: number;
  craft: number;
  nerve: number;
}

interface ProfileContextType {
  role: RoleType;
  stats: Stats;
  setRole: (role: RoleType) => void;
  // Awakening answers, or null before the questionnaire
  profile: PlayerProfile | null;
  setProfile: (profile: PlayerProfile) => void;
  // The equipped mask: the player's personal one, else a preset from their original role
  mask: Mask | null;
  // True once the player has awakened a personal mask (not just a legacy role preset)
  hasPersonalMask: boolean;
  equipMask: (mask: Mask) => void;
  // Swaps the personal mask's texts for their translations (original -> translated)
  translateMask: (map: Map<string, string>) => void;
  // Applies an XP change (negative to undo), clamped to 0-500; returns the change actually applied.
  // `quiet` skips the per-change toast (rank-ups still show)
  // `event` records the change in the XP log that chapter recaps are built from
  addXp: (stat: keyof Stats, xp: number, options?: { quiet?: boolean; event?: XpEventMeta }) => number;
  // Removes a completed mission's entry from the XP log when it is undone
  unlogMission: (missionId: string) => void;
  // The month being played, and recaps of finished months (newest first)
  chapter: Chapter | null;
  recaps: Recap[];
  // XP changes of the last few months, for chapter statistics
  log: XpEvent[];
  updateRecap: (month: string, changes: Partial<Recap>) => void;
  isLoaded: boolean;
}

const defaultStats: Stats = {
  knowledge: 0,
  vitality: 0,
  charm: 0,
  craft: 0,
  nerve: 0,
};

// The role is saved as a bare string rather than JSON
const roleStore = createLocalStore<RoleType>("persona_role", null, {
  parse: (raw) => raw as RoleType,
  stringify: (role) => role ?? "",
});
const statsStore = createLocalStore<Stats>("persona_stats", defaultStats);
const decayStore = createLocalStore<DecayState | null>("persona_decay", null);
const profileStore = createLocalStore<PlayerProfile | null>("persona_profile", null);
const maskStore = createLocalStore<Mask | null>("persona_mask", null);
const logStore = createLocalStore<XpEvent[]>("persona_log", []);
const chapterStore = createLocalStore<Chapter | null>("persona_chapter", null);
const recapsStore = createLocalStore<Recap[]>("persona_recaps", []);

// Recaps older than this many months are dropped
const MAX_RECAPS = 24;

export type XpEventMeta = Omit<XpEvent, "t" | "stat" | "xp">;

function logEvents(events: XpEvent[]) {
  if (events.length > 0) logStore.set((log) => pruneLog([...log, ...events]));
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const role = useLocalStore(roleStore);
  const stats = useLocalStore(statsStore);
  const profile = useLocalStore(profileStore);
  const personalMask = useLocalStore(maskStore);
  const chapter = useLocalStore(chapterStore);
  const recaps = useLocalStore(recapsStore);
  const log = useLocalStore(logStore);
  const mask = personalMask ?? legacyMask(role);
  const isLoaded = useIsClient();
  const { showToast } = useToast();

  useEffect(() => {
    // A new month closes the previous chapter with a recap. This runs before decay,
    // so the closing chapter ends with the stats the player left it with.
    const rollover = planRollover(
      chapterStore.get(),
      statsStore.get(),
      logStore.get(),
      maskStore.get() ?? legacyMask(roleStore.get())
    );
    if (rollover.action !== "none") chapterStore.set(rollover.chapter);
    if (rollover.action === "close") {
      recapsStore.set((list) => [rollover.recap, ...list].slice(0, MAX_RECAPS));
    }

    // Stats left untrained past the grace period lose XP; charged once per day on load
    const today = todayKey();
    const { stats: decayed, state, losses } = applyDecay(
      statsStore.get(),
      decayStore.get() ?? initialDecayState(today),
      today
    );
    decayStore.set(state);

    const lost = Object.entries(losses);
    if (lost.length > 0) {
      statsStore.set(decayed);
      const t = Date.now();
      logEvents(lost.map(([stat, xp]) => ({ t, stat: stat as keyof Stats, xp: -xp, kind: "decay" })));
      const copy = messages();
      showToast(copy.toast.rusty(lost.map(([stat, xp]) => `${copy.stat[stat as keyof Stats]} -${xp}`).join(", ")), "info", 1200);
    }
  }, [showToast]);

  const addXp = (
    stat: keyof Stats,
    xp: number,
    { quiet = false, event }: { quiet?: boolean; event?: XpEventMeta } = {}
  ) => {
    const prev = statsStore.get();
    const nextValue = clampStat(prev[stat] + xp);
    const applied = nextValue - prev[stat];
    if (applied === 0) return 0;

    statsStore.set({ ...prev, [stat]: nextValue });
    if (event) logEvents([{ ...event, t: Date.now(), stat, xp: applied }]);
    if (applied > 0) {
      const today = todayKey();
      decayStore.set((state) => {
        const current = state ?? initialDecayState(today);
        return { ...current, lastTrained: { ...current.lastTrained, [stat]: today } };
      });
    }

    const t = messages();
    if (!quiet) showToast(t.toast.xp(applied, t.stat[stat]), "xp");
    if (getRankIndex(nextValue) > getRankIndex(prev[stat])) {
      showToast(t.toast.rankUp(t.stat[stat], t.rank[getRankIndex(nextValue)]), "rank", 900);
    }
    return applied;
  };

  return (
    <ProfileContext.Provider
      value={{
        role,
        stats,
        setRole: roleStore.set,
        profile,
        setProfile: profileStore.set,
        mask,
        hasPersonalMask: personalMask !== null,
        equipMask: maskStore.set,
        translateMask: (map) => maskStore.set((m) => (m ? translateMask(m, map) : m)),
        addXp,
        unlogMission: (missionId) => logStore.set((log) => log.filter((e) => e.missionId !== missionId)),
        chapter,
        recaps,
        log,
        updateRecap: (month, changes) =>
          recapsStore.set((list) => list.map((r) => (r.month === month ? { ...r, ...changes } : r))),
        isLoaded,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
