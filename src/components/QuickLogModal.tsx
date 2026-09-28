import React from "react";
import styles from "./QuickLogModal.module.css";
import { OverlayPanel } from "./OverlayPanel";
import { useProfile, Stats } from "@/context/ProfileContext";
import { QUICK_LOG_XP, STATS_ORDER, STAT_GLYPHS } from "@/lib/progression";
import { useT } from "@/lib/i18n";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { addXp } = useProfile();
  const t = useT();

  const handleLog = (stat: keyof Stats) => {
    addXp(stat, QUICK_LOG_XP, { event: { kind: "quicklog" } });
    onClose();
  };

  return (
    <OverlayPanel
      isOpen={isOpen}
      onClose={onClose}
      title={t.quickLog.title}
      subtitle={t.quickLog.subtitle(QUICK_LOG_XP)}
    >
      <div className={styles.list}>
        {STATS_ORDER.map((stat) => (
          <button key={stat} className={styles.row} onClick={() => handleLog(stat)}>
            <span className={styles.glyph}>{STAT_GLYPHS[stat]}</span>
            <span className={styles.name}>{t.stat[stat]}</span>
            <span className={styles.xp}>+{QUICK_LOG_XP}</span>
          </button>
        ))}
      </div>
    </OverlayPanel>
  );
}
