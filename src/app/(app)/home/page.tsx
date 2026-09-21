"use client";

import React, { useState } from "react";
import { useProfile, Stats } from "@/context/ProfileContext";
import { CaseFileCard } from "@/components/CaseFileCard";
import { RadarChart } from "@/components/RadarChart";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";
import { useMissions } from "@/context/MissionContext";
import { MissionCard } from "@/components/MissionCard";
import { NewMissionModal } from "@/components/NewMissionModal";

const STATS_ORDER = ["knowledge", "charm", "nerve", "craft", "vitality"] as const;

export default function Home() {
  const { role, stats, addXp, isLoaded } = useProfile();
  const { missions, addMission, completeMission, deleteMission, isLoaded: missionsLoaded } = useMissions();

  const [selectedStat, setSelectedStat] = useState<keyof Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!isLoaded || !missionsLoaded) return null;

  const handleQuickLog = () => {
    // Add 15 XP to a random stat for demonstration
    const randomStat = STATS_ORDER[Math.floor(Math.random() * STATS_ORDER.length)];
    addXp(randomStat, 15);
  };

  const handleStatClick = (stat: keyof Stats) => {
    setSelectedStat(prev => prev === stat ? null : stat);
  };

  const activeMissions = missions.filter(m => m.status === "active");
  const filteredMissions = selectedStat 
    ? activeMissions.filter(m => m.rewardStat === selectedStat)
    : activeMissions;

  const handleComplete = (id: string) => {
    const mission = missions.find((m) => m.id === id);
    if (mission) {
      completeMission(id);
      addXp(mission.rewardStat, mission.rewardXp);
    }
  };

  return (
    <main className={styles.container}>
      {/* Red Header Panel */}
      <div className={`${styles.header} halftone-bg`}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          STATUS
        </motion.h1>

        <motion.div
          className={styles.speechBubbleWrapper}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className={styles.speechBubble}>
            Looking sharp! Your {role ? role.toUpperCase() : "PERSONA"} mask is resonating with your actions. Keep pushing those limits!
          </div>
        </motion.div>
      </div>

      {/* Case File & Radar Chart */}
      <div className={styles.mainContent}>
        <CaseFileCard>
          <RadarChart selectedStat={selectedStat} onStatClick={handleStatClick} />
        </CaseFileCard>
      </div>

      {/* Stat Chips Overview */}
      <div className={styles.statChips}>
        {STATS_ORDER.map((statKey, index) => (
          <motion.div
            key={statKey}
            className={`${styles.chip} skew-container`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            style={selectedStat === statKey ? { borderColor: '#fff', boxShadow: '0 0 10px #fff' } : {}}
            onClick={() => handleStatClick(statKey)}
          >
            <span className="unskew-content">
              {statKey.substring(0, 3)}: {stats[statKey]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Active Missions Section */}
      <div className={styles.missionsSection}>
        <div className={styles.missionsHeader}>
          <h2 className={styles.sectionTitle}>
            ACTIVE TARGETS {selectedStat ? `(${selectedStat.toUpperCase()})` : ""}
          </h2>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            + ADD
          </button>
        </div>
        
        {filteredMissions.length === 0 ? (
          <div className={styles.emptyState}>No targets found.</div>
        ) : (
          <AnimatePresence>
            {filteredMissions.map((mission) => (
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

      {/* Action Section */}
      <div className={styles.actionSection}>
        <motion.button
          className={styles.quickLogButton}
          onClick={handleQuickLog}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", delay: 0.8 }}
        >
          <span className="unskew-content">QUICK LOG</span>
        </motion.button>
      </div>

      <NewMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addMission}
      />
    </main>
  );
}
