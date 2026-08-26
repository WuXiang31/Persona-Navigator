"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useMissions } from "@/context/MissionContext";
import { useProfile } from "@/context/ProfileContext";
import { MissionCard } from "@/components/MissionCard";
import { NewMissionModal } from "@/components/NewMissionModal";
import { AnimatePresence } from "framer-motion";

export default function MissionsPage() {
  const { missions, addMission, completeMission, deleteMission, isLoaded } = useMissions();
  const { addXp } = useProfile();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeMissions = missions.filter((m) => m.status === "active");
  const completedMissions = missions.filter((m) => m.status === "completed");

  const handleComplete = (id: string) => {
    const mission = missions.find((m) => m.id === id);
    if (mission) {
      completeMission(id);
      addXp(mission.rewardStat, mission.rewardXp);
    }
  };

  if (!isLoaded) return null; // Or a loading spinner

  return (
    <main className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>MISSIONS</h1>
        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          + NEW MISSION
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>ACTIVE TARGETS</h2>
        {activeMissions.length === 0 ? (
          <div className={styles.emptyState}>No active targets. Time to rest?</div>
        ) : (
          <AnimatePresence>
            {activeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={handleComplete}
                onDelete={deleteMission}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>COMPLETED</h2>
        {completedMissions.length === 0 ? (
          <div className={styles.emptyState}>No targets neutralized yet.</div>
        ) : (
          <AnimatePresence>
            {completedMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} onDelete={deleteMission} />
            ))}
          </AnimatePresence>
        )}
      </div>

      <NewMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addMission}
      />
    </main>
  );
}
