"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useToast } from "./ToastContext";
import { clampStat, getRankIndex, getRankName } from "@/lib/progression";

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
  // Applies an XP change (negative to undo), clamped to 0-500; returns the change actually applied
  addXp: (stat: keyof Stats, xp: number) => number;
  isLoaded: boolean;
}

const defaultStats: Stats = {
  knowledge: 0,
  vitality: 0,
  charm: 0,
  craft: 0,
  nerve: 0,
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<RoleType>(null);
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [isLoaded, setIsLoaded] = useState(false);
  // Latest stats, readable synchronously so addXp can report the applied delta
  const statsRef = useRef<Stats>(defaultStats);
  const { showToast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("persona_role") as RoleType;
    const savedStats = localStorage.getItem("persona_stats");
    
    if (savedRole) setRoleState(savedRole);
    if (savedStats) {
      statsRef.current = JSON.parse(savedStats);
      setStats(statsRef.current);
    }
    
    setIsLoaded(true);
  }, []);

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("persona_role", newRole);
    } else {
      localStorage.removeItem("persona_role");
    }
  };

  const addXp = (stat: keyof Stats, xp: number) => {
    const prev = statsRef.current;
    const nextValue = clampStat(prev[stat] + xp);
    const applied = nextValue - prev[stat];
    if (applied === 0) return 0;

    const updated = { ...prev, [stat]: nextValue };
    statsRef.current = updated;
    setStats(updated);
    localStorage.setItem("persona_stats", JSON.stringify(updated));

    showToast(`${applied > 0 ? "+" : ""}${applied} ${stat}`, "xp");
    if (getRankIndex(nextValue) > getRankIndex(prev[stat])) {
      showToast(`Rank up! ${stat} → ${getRankName(nextValue)}`, "rank", 900);
    }
    return applied;
  };

  return (
    <ProfileContext.Provider value={{ role, stats, setRole, addXp, isLoaded }}>
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
