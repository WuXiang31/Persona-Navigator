"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  addXp: (stat: keyof Stats, xp: number) => void;
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

  // Load from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("persona_role") as RoleType;
    const savedStats = localStorage.getItem("persona_stats");
    
    if (savedRole) setRoleState(savedRole);
    if (savedStats) setStats(JSON.parse(savedStats));
    
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
    setStats((prev) => {
      const updated = {
        ...prev,
        [stat]: Math.min(500, prev[stat] + xp),
      };
      localStorage.setItem("persona_stats", JSON.stringify(updated));
      return updated;
    });
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
