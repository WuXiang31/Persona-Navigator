import React from "react";
import styles from "./QuickLogModal.module.css";
import { OverlayPanel } from "./OverlayPanel";
import { useProfile, Stats } from "@/context/ProfileContext";
import { QUICK_LOG_XP, STATS_ORDER, STAT_GLYPHS } from "@/lib/progression";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { addXp } = useProfile();

  const handleLog = (stat: keyof Stats) => {
    addXp(stat, QUICK_LOG_XP, { event: { kind: "quicklog" } });
    onClose();
  };

  return (
    <OverlayPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Quick log"
      subtitle={`TAP WHAT YOU DID. +${QUICK_LOG_XP} XP EACH.`}
    >
      <div className={styles.list}>
        {STATS_ORDER.map((stat) => (
          <button key={stat} className={styles.row} onClick={() => handleLog(stat)}>
            <span className={styles.glyph}>{STAT_GLYPHS[stat]}</span>
            <span className={styles.name}>{stat}</span>
            <span className={styles.xp}>+{QUICK_LOG_XP}</span>
          </button>
        ))}
      </div>
    </OverlayPanel>
  );
}
