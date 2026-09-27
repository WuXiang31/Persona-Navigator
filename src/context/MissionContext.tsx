"use client";

import React, { createContext, useContext } from "react";
import { Stats, useProfile } from "./ProfileContext";
import { createLocalStore, useIsClient, useLocalStore } from "@/lib/localStore";
import { boostedXp } from "@/lib/weather";
import { getWeatherCondition } from "@/lib/useWeather";

export type MissionStatus = "active" | "completed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardStat: keyof Stats;
  rewardXp: number;
  status: MissionStatus;
  createdAt: number;
  // XP actually granted on completion (includes the weather bonus, capped at the stat maximum)
  awardedXp?: number;
}

interface MissionContextType {
  missions: Mission[];
  addMission: (mission: Omit<Mission, "id" | "status" | "createdAt">) => void;
  // Marks a mission done and grants its XP, boosted by today's weather
  completeMission: (id: string, options?: { quiet?: boolean }) => void;
  // Reopens a completed mission and takes back the XP it granted
  uncompleteMission: (id: string) => void;
  deleteMission: (id: string) => void;
  isLoaded: boolean;
}

const missionsStore = createLocalStore<Mission[]>("persona_missions", []);

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const missions = useLocalStore(missionsStore);
  const isLoaded = useIsClient();
  const { addXp } = useProfile();

  const addMission = (missionData: Omit<Mission, "id" | "status" | "createdAt">) => {
    const newMission: Mission = {
      ...missionData,
      id: Math.random().toString(36).substring(2, 9),
      status: "active",
      createdAt: Date.now(),
    };
    missionsStore.set((prev) => [newMission, ...prev]);
  };

  const completeMission = (id: string, options?: { quiet?: boolean }) => {
    const mission = missionsStore.get().find((m) => m.id === id);
    if (!mission || mission.status === "completed") return;

    const xp = boostedXp(mission.rewardXp, getWeatherCondition(), mission.rewardStat);
    const awardedXp = addXp(mission.rewardStat, xp, options);
    missionsStore.set((prev) => prev.map((m) => (m.id === id ? { ...m, status: "completed", awardedXp } : m)));
  };

  const uncompleteMission = (id: string) => {
    const mission = missionsStore.get().find((m) => m.id === id);
    if (!mission || mission.status === "active") return;

    addXp(mission.rewardStat, -(mission.awardedXp ?? mission.rewardXp));
    missionsStore.set((prev) => prev.map((m) => (m.id === id ? { ...m, status: "active", awardedXp: undefined } : m)));
  };

  const deleteMission = (id: string) => {
    missionsStore.set((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <MissionContext.Provider
      value={{ missions, addMission, completeMission, uncompleteMission, deleteMission, isLoaded }}
    >
      {children}
    </MissionContext.Provider>
  );
}

export function useMissions() {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error("useMissions must be used within a MissionProvider");
  }
  return context;
}
