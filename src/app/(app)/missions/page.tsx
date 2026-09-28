"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { Mission, useMissions } from "@/context/MissionContext";
import { useToast } from "@/context/ToastContext";
import { MissionCard } from "@/components/MissionCard";
import { NewMissionModal } from "@/components/NewMissionModal";
import { WeatherBanner } from "@/components/WeatherBanner";
import { AnimatePresence } from "framer-motion";
import { useWeather } from "@/lib/useWeather";
import { missionXp } from "@/lib/mask";
import { STAT_GLYPHS } from "@/lib/progression";
import { useProfile } from "@/context/ProfileContext";

export default function MissionsPage() {
  const { missions, addMission, completeMission, uncompleteMission, deleteMission, isLoaded } = useMissions();
  const { showToast } = useToast();
  const { condition } = useWeather();
  const { mask } = useProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  if (!isLoaded) return null;

  // Open missions first, cleared ones after
  const ordered = [
    ...missions.filter((m) => m.status === "active"),
    ...missions.filter((m) => m.status === "completed"),
  ];

  const selectedGain = missions
    .filter((m) => selected.includes(m.id) && m.status === "active")
    .reduce((sum, m) => sum + missionXp(m.rewardXp, m.rewardStat, condition, mask), 0);

  const toggleSelectMode = () => {
    setSelectMode((on) => !on);
    setSelected([]);
  };

  const handleToggle = (mission: Mission) => {
    if (selectMode) {
      if (mission.status !== "active") return;
      setSelected((ids) => (ids.includes(mission.id) ? ids.filter((id) => id !== mission.id) : [...ids, mission.id]));
    } else if (mission.status === "active") {
      completeMission(mission.id);
    } else {
      uncompleteMission(mission.id);
    }
  };

  const completeSelected = () => {
    if (selected.length === 0) return;
    selected.forEach((id) => completeMission(id, { quiet: true }));
    showToast(`${selected.length} mission${selected.length > 1 ? "s" : ""} cleared${selectedGain ? ` +${selectedGain} XP` : ""}`);
    setSelected([]);
    setSelectMode(false);
  };

  return (
    <main className={styles.container}>
      <WeatherBanner />

      <div className={styles.titleRow}>
        <h1 className={styles.pageTitle}>Missions</h1>
        <div className={styles.slash} aria-hidden />
        <button
          className={`${styles.selectBtn} ${selectMode ? styles.selectBtnActive : ""}`}
          onClick={toggleSelectMode}
          aria-pressed={selectMode}
          title="Select multiple"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M2 6 L4.5 8.5 L9 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
            <rect x="12" y="5.2" width="10" height="2.6" fill="currentColor" />
            <path d="M2 16 L4.5 18.5 L9 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
            <rect x="12" y="15.2" width="10" height="2.6" fill="currentColor" />
          </svg>
          <span>{selectMode ? "DONE" : "SELECT"}</span>
        </button>
      </div>

      {selectMode && (
        <div className={styles.selectBar}>
          <span className={styles.selectCount}>{selected.length} SELECTED</span>
          {selectedGain > 0 && <span className={styles.selectXp}>+{selectedGain} XP</span>}
          <button className={styles.selectComplete} onClick={completeSelected} disabled={selected.length === 0}>
            COMPLETE
          </button>
        </div>
      )}

      {mask && mask.routines.length > 0 && !selectMode && (
        <section className={styles.routines}>
          <p className={styles.routinesLabel}>{mask.name} · ROUTINES</p>
          <div className={styles.routineRow}>
            {mask.routines.map((routine, i) => {
              const active = missions.some((m) => m.status === "active" && m.title === routine.title);
              return (
                <button
                  key={`${routine.title}-${i}`}
                  className={styles.routineChip}
                  onClick={() => addMission(routine)}
                  disabled={active}
                  title={routine.description || undefined}
                >
                  <span>{active ? "\u2713" : "+"} {routine.title}</span>
                  <span className={styles.routineXp}>
                    {STAT_GLYPHS[routine.rewardStat]} {missionXp(routine.rewardXp, routine.rewardStat, condition, mask)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className={styles.list}>
        <AnimatePresence initial={false}>
          {ordered.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onToggle={handleToggle}
              onDelete={deleteMission}
              selectMode={selectMode}
              selected={selected.includes(mission.id)}
            />
          ))}
        </AnimatePresence>

        {ordered.length === 0 && (
          <p className={styles.emptyState}>No missions yet. Add one, or tell your navigator your plans in chat.</p>
        )}

        <button className={styles.addTile} onClick={() => setIsModalOpen(true)}>
          <span className={styles.addIcon}>+</span>
          <span>ADD NEW MISSION</span>
        </button>

        <p className={styles.footnote}>
          MISSIONS MATCHING TODAY&apos;S WEATHER PAY &times;1.5 XP
          {mask ? <> &middot; YOUR FOCUS STATS PAY &times;1.25</> : null}
        </p>
      </div>

      <NewMissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addMission} />
    </main>
  );
}
