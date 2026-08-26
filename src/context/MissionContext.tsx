"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Stats } from "./ProfileContext";

export type MissionStatus = "active" | "completed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  rewardStat: keyof Stats;
  rewardXp: number;
  status: MissionStatus;
  createdAt: number;
}

interface MissionContextType {
  missions: Mission[];
  addMission: (mission: Omit<Mission, "id" | "status" | "createdAt">) => void;
  completeMission: (id: string) => void;
  deleteMission: (id: string) => void;
  isLoaded: boolean;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: React.ReactNode }) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMissions = localStorage.getItem("persona_missions");
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions));
    }
    setIsLoaded(true);
  }, []);

  const addMission = (missionData: Omit<Mission, "id" | "status" | "createdAt">) => {
    setMissions((prev) => {
      const newMission: Mission = {
        ...missionData,
        id: Math.random().toString(36).substring(2, 9),
        status: "active",
        createdAt: Date.now(),
      };
      const updated = [newMission, ...prev];
      localStorage.setItem("persona_missions", JSON.stringify(updated));
      return updated;
    });
  };

  const completeMission = (id: string) => {
    setMissions((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status: "completed" as MissionStatus } : m));
      localStorage.setItem("persona_missions", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMission = (id: string) => {
    setMissions((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      localStorage.setItem("persona_missions", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <MissionContext.Provider
      value={{ missions, addMission, completeMission, deleteMission, isLoaded }}
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
