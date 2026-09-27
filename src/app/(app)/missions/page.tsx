"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { useMissions } from "@/context/MissionContext";
import { MissionCard } from "@/components/MissionCard";
import { NewMissionModal } from "@/components/NewMissionModal";
import { AnimatePresence } from "framer-motion";

export default function MissionsPage() {
  const { missions, addMission, completeMission, uncompleteMission, deleteMission, isLoaded } = useMissions();
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeMissions = missions.filter((m) => m.status === "active");
  const completedMissions = missions.filter((m) => m.status === "completed");

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
          <div className={styles.emptyState}>No active targets. Add one, or tell your navigator your plans in chat.</div>
        ) : (
          <AnimatePresence>
            {activeMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={completeMission}
                onDelete={deleteMission}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>MISSION ARCHIVE</h2>
        {completedMissions.length === 0 ? (
          <div className={styles.emptyState}>No targets neutralized yet.</div>
        ) : (
          <AnimatePresence>
            {completedMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onUndo={uncompleteMission}
                onDelete={deleteMission}
              />
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
