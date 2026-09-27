"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile, Stats } from "@/context/ProfileContext";
import { Mission, useMissions } from "@/context/MissionContext";
import { CaseFileCard } from "@/components/CaseFileCard";
import { RadarChart } from "@/components/RadarChart";
import { MissionCard } from "@/components/MissionCard";
import { QuickLogModal } from "@/components/QuickLogModal";
import { COMPANION_INITIAL, statusLine } from "@/lib/companion";
import { STATS_ORDER, STAT_SHORT, getRankColor, getRankIndex } from "@/lib/progression";
import styles from "./page.module.css";

export default function Home() {
  const { stats, isLoaded } = useProfile();
  const { missions, completeMission, uncompleteMission, deleteMission } = useMissions();

  const [selectedStat, setSelectedStat] = useState<keyof Stats | null>(null);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  if (!isLoaded) return null;

  const handleStatClick = (stat: keyof Stats) => {
    setSelectedStat((prev) => (prev === stat ? null : stat));
  };

  const handleToggle = (mission: Mission) =>
    mission.status === "active" ? completeMission(mission.id) : uncompleteMission(mission.id);

  const activeMissions = missions.filter((m) => m.status === "active");
  const shownMissions = selectedStat ? activeMissions.filter((m) => m.rewardStat === selectedStat) : activeMissions;

  return (
    <main className={styles.container}>
      {/* Red halftone header: companion avatar, their one-liner, STATUS */}
      <header className={`${styles.header} halftone-bg`}>
        <div className={styles.companionRow}>
          <div className={styles.avatar} aria-hidden>
            {COMPANION_INITIAL}
          </div>
          <Link href="/chat" className={styles.bubble}>
            {statusLine(stats, missions)}
          </Link>
        </div>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Status
        </motion.h1>
      </header>

      <div className={styles.mainContent}>
        <CaseFileCard>
          <div className={styles.caseHeader}>
            <span className={styles.caseTitle}>Case file</span>
            <span className={styles.caseStamp}>CONFIDENTIAL</span>
          </div>
          <RadarChart selectedStat={selectedStat} onStatClick={handleStatClick} />
        </CaseFileCard>
      </div>

      <div className={styles.statChips}>
        {STATS_ORDER.map((stat) => (
          <button
            key={stat}
            className={`${styles.chip} ${selectedStat === stat ? styles.chipSelected : ""}`}
            onClick={() => handleStatClick(stat)}
            aria-pressed={selectedStat === stat}
          >
            <span className={styles.chipShort}>{STAT_SHORT[stat]}</span>
            <span style={{ color: getRankColor(stats[stat]) }}>RANK {getRankIndex(stats[stat]) + 1}</span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.quickLogButton} onClick={() => setIsQuickLogOpen(true)}>
          QUICK LOG
        </button>
        <Link href="/missions" className={styles.missionsButton}>
          MISSIONS
        </Link>
      </div>

      {activeMissions.length > 0 && (
        <section className={styles.missionsSection}>
          <h2 className={styles.sectionTitle}>
            Active targets {selectedStat && <span className={styles.filterTag}>{selectedStat}</span>}
          </h2>
          {shownMissions.length === 0 ? (
            <p className={styles.emptyState}>No active {selectedStat} missions.</p>
          ) : (
            <AnimatePresence initial={false}>
              {shownMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} onToggle={handleToggle} onDelete={deleteMission} />
              ))}
            </AnimatePresence>
          )}
        </section>
      )}

      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
    </main>
  );
}
