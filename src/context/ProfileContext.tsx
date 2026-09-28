"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useToast } from "./ToastContext";
import { clampStat, getRankIndex, getRankName } from "@/lib/progression";
import { createLocalStore, useIsClient, useLocalStore } from "@/lib/localStore";
import { DecayState, applyDecay, initialDecayState, todayKey } from "@/lib/decay";
import { Mask, PlayerProfile, legacyMask } from "@/lib/mask";

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
  // Applies an XP change (negative to undo), clamped to 0-500; returns the change actually applied.
  // `quiet` skips the per-change toast (rank-ups still show)
  addXp: (stat: keyof Stats, xp: number, options?: { quiet?: boolean }) => number;
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

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const role = useLocalStore(roleStore);
  const stats = useLocalStore(statsStore);
  const profile = useLocalStore(profileStore);
  const personalMask = useLocalStore(maskStore);
  const mask = personalMask ?? legacyMask(role);
  const isLoaded = useIsClient();
  const { showToast } = useToast();

  // Stats left untrained past the grace period lose XP; charged once per day on load
  useEffect(() => {
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
      showToast(`Getting rusty: ${lost.map(([stat, xp]) => `${stat} -${xp}`).join(", ")}`, "info", 1200);
    }
  }, [showToast]);

  const addXp = (stat: keyof Stats, xp: number, { quiet = false }: { quiet?: boolean } = {}) => {
    const prev = statsStore.get();
    const nextValue = clampStat(prev[stat] + xp);
    const applied = nextValue - prev[stat];
    if (applied === 0) return 0;

    statsStore.set({ ...prev, [stat]: nextValue });
    if (applied > 0) {
      const today = todayKey();
      decayStore.set((state) => {
        const current = state ?? initialDecayState(today);
        return { ...current, lastTrained: { ...current.lastTrained, [stat]: today } };
      });
    }

    if (!quiet) showToast(`${applied > 0 ? "+" : ""}${applied} XP ${stat}`, "xp");
    if (getRankIndex(nextValue) > getRankIndex(prev[stat])) {
      showToast(`Rank up! ${stat} → ${getRankName(nextValue)}`, "rank", 900);
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
        addXp,
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
