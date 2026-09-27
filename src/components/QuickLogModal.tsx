import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./QuickLogModal.module.css";
import { useProfile, Stats } from "@/context/ProfileContext";
import { MAX_STAT, QUICK_LOG_XP, STATS_ORDER, getRankColor, getRankName } from "@/lib/progression";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickLogModal({ isOpen, onClose }: QuickLogModalProps) {
  const { stats, addXp } = useProfile();

  const handleLog = (stat: keyof Stats) => {
    addXp(stat, QUICK_LOG_XP);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalBg} />
            <div className={styles.panel}>
              <h2 className={styles.header}>QUICK LOG</h2>
              <p className={styles.subtitle}>What did you work on? +{QUICK_LOG_XP} XP</p>

              {STATS_ORDER.map((stat) => (
                <button key={stat} className={styles.statRow} onClick={() => handleLog(stat)}>
                  <span className={styles.statName}>{stat}</span>
                  <span className={styles.rank} style={{ color: getRankColor(stats[stat]) }}>
                    {getRankName(stats[stat])}
                  </span>
                  <span className={styles.barTrack}>
                    <span
                      className={styles.barFill}
                      style={{ width: `${(stats[stat] / MAX_STAT) * 100}%`, background: getRankColor(stats[stat]) }}
                    />
                  </span>
                  <span className={styles.xp}>{stats[stat]}</span>
                </button>
              ))}

              <button className={styles.cancelBtn} onClick={onClose}>
                CANCEL
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
