"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useLang, useT } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { useProfile, Stats } from "@/context/ProfileContext";
import { CaseFileCard } from "@/components/CaseFileCard";
import { RadarChart } from "@/components/RadarChart";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";
import { Mission, useMissions } from "@/context/MissionContext";
import { MissionCard } from "@/components/MissionCard";
import { NewMissionModal } from "@/components/NewMissionModal";
import { QuickLogModal } from "@/components/QuickLogModal";
import { WeatherBanner } from "@/components/WeatherBanner";
import { STATS_ORDER, getRankColor, getRankIndex } from "@/lib/progression";
import { Chapter, Recap, isLastDayOfMonth } from "@/lib/chapter";

export default function Home() {
  const { mask, hasPersonalMask, stats, chapter, recaps, isLoaded } = useProfile();
  const t = useT();
  const lang = useLang();
  const { missions, addMission, completeMission, uncompleteMission, deleteMission, isLoaded: missionsLoaded } = useMissions();

  const [selectedStat, setSelectedStat] = useState<keyof Stats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  if (!isLoaded || !missionsLoaded) return null;

  const handleStatClick = (stat: keyof Stats) => {
    setSelectedStat(prev => prev === stat ? null : stat);
  };

  const handleToggle = (mission: Mission) =>
    mission.status === "active" ? completeMission(mission.id) : uncompleteMission(mission.id);

  const activeMissions = missions.filter(m => m.status === "active");
  const filteredMissions = selectedStat 
    ? activeMissions.filter(m => m.rewardStat === selectedStat)
    : activeMissions;

  return (
    <main className={styles.container}>
      {/* Red Header Panel */}
      <div className={`${styles.header} halftone-bg`}>
        <div className={styles.account}>
          <LangToggle />
          <UserButton />
        </div>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t.home.title}
        </motion.h1>

        <motion.div
          className={styles.speechBubbleWrapper}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className={styles.speechBubble}>
            {mask ? (
              <>
                <span className={styles.maskName}>{mask.name}</span>
                {mask.identity}
              </>
            ) : (
              t.home.noMask
            )}
            <Link href="/awakening" className={styles.changeMask}>
              {hasPersonalMask ? t.home.changeMask : t.home.awakenMask}
            </Link>
          </div>
        </motion.div>

        <ChapterLine chapter={chapter} latestRecap={recaps[0]} />
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
            style={{
              borderLeftColor: getRankColor(stats[statKey]),
              ...(selectedStat === statKey ? { borderColor: '#fff', boxShadow: '0 0 10px #fff' } : {}),
            }}
            onClick={() => handleStatClick(statKey)}
          >
            <span className="unskew-content">
              {lang === "zh" ? t.stat[statKey] : statKey.substring(0, 3)} · R{getRankIndex(stats[statKey]) + 1}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Active Missions Section */}
      <div className={styles.missionsSection}>
        <WeatherBanner />
        <div className={styles.missionsHeader}>
          <h2 className={styles.sectionTitle}>
            {t.home.activeTargets} {selectedStat ? `(${t.stat[selectedStat]})` : ""}
          </h2>
          <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
            {t.home.add}
          </button>
        </div>
        
        {filteredMissions.length === 0 ? (
          <div className={styles.emptyState}>{t.home.noTargets}</div>
        ) : (
          <AnimatePresence>
            {filteredMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onToggle={handleToggle}
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
          onClick={() => setIsQuickLogOpen(true)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", delay: 0.8 }}
        >
          <span className="unskew-content">{t.home.quickLog}</span>
        </motion.button>
      </div>

      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />

      <NewMissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addMission}
      />
    </main>
  );
}

// Chapter progress, or a banner for a recap the player hasn't opened yet
function ChapterLine({ chapter, latestRecap }: { chapter: Chapter | null; latestRecap?: Recap }) {
  const t = useT();
  if (latestRecap && !latestRecap.seen) {
    return (
      <Link href={`/recap/${latestRecap.month}`} className={styles.recapBanner}>
        {t.home.chapterClear(latestRecap.number)}
      </Link>
    );
  }
  if (!chapter) return null;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return (
    <p className={styles.chapterLine}>
      {t.home.chapterDay(chapter.number, now.getDate(), daysInMonth)}
      {isLastDayOfMonth(now) && <strong>{t.home.endsTonight}</strong>}
      <Link href="/chapters" className={styles.pastRecap}>
        {t.home.allChapters}
      </Link>
    </p>
  );
}
