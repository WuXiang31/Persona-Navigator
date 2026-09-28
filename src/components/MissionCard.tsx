import React from "react";
import { motion } from "framer-motion";
import styles from "./MissionCard.module.css";
import { Mission } from "@/context/MissionContext";
import { useWeather } from "@/lib/useWeather";
import { isBoosted } from "@/lib/weather";
import { isFocusStat, missionXp } from "@/lib/mask";
import { useProfile } from "@/context/ProfileContext";
import { useT } from "@/lib/i18n";
import { STAT_GLYPHS } from "@/lib/progression";

interface MissionCardProps {
  mission: Mission;
  // Tapping the card completes an active mission or reopens a completed one
  onToggle: (mission: Mission) => void;
  onDelete?: (id: string) => void;
  // Multi-select mode: tapping selects instead of completing
  selectMode?: boolean;
  selected?: boolean;
}

export function MissionCard({ mission, onToggle, onDelete, selectMode = false, selected = false }: MissionCardProps) {
  const { condition } = useWeather();
  const { mask } = useProfile();
  const t = useT();
  const done = mission.status === "completed";
  const boosted = isBoosted(condition, mission.rewardStat) || isFocusStat(mask, mission.rewardStat);
  const xp = done ? mission.awardedXp ?? mission.rewardXp : missionXp(mission.rewardXp, mission.rewardStat, condition, mask);

  const checked = selectMode ? selected : done;
  const stateClass = selectMode
    ? selected
      ? styles.selected
      : ""
    : done
      ? styles.done
      : boosted
        ? styles.boosted
        : "";

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(mission);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={`${styles.card} ${stateClass} ${selectMode ? styles.selecting : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={checked}
      onClick={() => onToggle(mission)}
      onKeyDown={handleKey}
    >
      <div className={styles.topRow}>
        <span className={styles.checkbox} aria-hidden>
          {checked ? "\u2713" : ""}
        </span>
        <span className={styles.title}>{mission.title}</span>
        {onDelete && !selectMode && (
          <button
            className={styles.deleteBtn}
            aria-label={t.card.delete(mission.title)}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(mission.id);
            }}
          >
            {"\u00D7"}
          </button>
        )}
      </div>

      {mission.description && <p className={styles.description}>{mission.description}</p>}

      <div className={styles.metaRow}>
        <span className={styles.glyph}>{STAT_GLYPHS[mission.rewardStat]}</span>
        <span className={styles.statName}>{t.stat[mission.rewardStat]}</span>
        <span className={`${styles.xp} ${boosted ? styles.xpBoosted : ""}`}>
          {done ? t.card.earned : ""}+{xp} XP{boosted && !done ? " \u26A1" : ""}
        </span>
      </div>

      {done && !selectMode && <span className={styles.stamp}>{t.card.complete}</span>}
    </motion.div>
  );
}
