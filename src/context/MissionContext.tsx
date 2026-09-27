"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Stats, useProfile } from "./ProfileContext";

export type MissionStatus = "active" | "completed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardStat: keyof Stats;
  rewardXp: number;
  status: MissionStatus;
  createdAt: number;
  // XP actually granted on completion (less than rewardXp if the stat hit the cap)
  awardedXp?: number;
}

interface MissionContextType {
  missions: Mission[];
  addMission: (mission: Omit<Mission, "id" | "status" | "createdAt">) => void;
  // Marks a mission done and grants its XP
  completeMission: (id: string) => void;
  // Reopens a completed mission and takes back the XP it granted
  uncompleteMission: (id: string) => void;
  deleteMission: (id: string) => void;
  isLoaded: boolean;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Latest missions, readable synchronously so a double click can't grant XP twice
  const missionsRef = useRef<Mission[]>([]);
  const { addXp } = useProfile();

  // Load from localStorage on mount
  useEffect(() => {
    const savedMissions = localStorage.getItem("persona_missions");
    if (savedMissions) {
      missionsRef.current = JSON.parse(savedMissions);
      setMissions(missionsRef.current);
    }
    setIsLoaded(true);
  }, []);

  const save = (updated: Mission[]) => {
    missionsRef.current = updated;
    setMissions(updated);
    localStorage.setItem("persona_missions", JSON.stringify(updated));
  };

  const addMission = (missionData: Omit<Mission, "id" | "status" | "createdAt">) => {
    const newMission: Mission = {
      ...missionData,
      id: Math.random().toString(36).substring(2, 9),
      status: "active",
      createdAt: Date.now(),
    };
    save([newMission, ...missionsRef.current]);
  };

  const completeMission = (id: string) => {
    const mission = missionsRef.current.find((m) => m.id === id);
    if (!mission || mission.status === "completed") return;

    const awardedXp = addXp(mission.rewardStat, mission.rewardXp);
    save(missionsRef.current.map((m) => (m.id === id ? { ...m, status: "completed", awardedXp } : m)));
  };

  const uncompleteMission = (id: string) => {
    const mission = missionsRef.current.find((m) => m.id === id);
    if (!mission || mission.status === "active") return;

    addXp(mission.rewardStat, -(mission.awardedXp ?? mission.rewardXp));
    save(missionsRef.current.map((m) => (m.id === id ? { ...m, status: "active", awardedXp: undefined } : m)));
  };

  const deleteMission = (id: string) => {
    save(missionsRef.current.filter((m) => m.id !== id));
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
