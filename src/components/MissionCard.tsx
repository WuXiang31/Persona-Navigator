import React from "react";
import { motion } from "framer-motion";
import styles from "./MissionCard.module.css";
import { Mission } from "@/context/MissionContext";

interface MissionCardProps {
  mission: Mission;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MissionCard({ mission, onComplete, onDelete }: MissionCardProps) {
  const isCompleted = mission.status === "completed";

  return (
    <motion.div
      className={`${styles.cardWrapper} ${isCompleted ? styles.completed : ""}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Background elements for P5 styling */}
      <div className={styles.bgShadow} />
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <h3 className={styles.title}>{mission.title}</h3>
          <div className={styles.rewardBadge}>
            <span className={styles.rewardStat}>{mission.rewardStat}</span>
            <span className={styles.rewardXp}>+{mission.rewardXp} XP</span>
          </div>
        </div>
        
        {mission.description && (
          <p className={styles.description}>{mission.description}</p>
        )}

        <div className={styles.actions}>
          {!isCompleted && onComplete && (
            <button
              className={styles.completeBtn}
              onClick={() => onComplete(mission.id)}
            >
              TAKE HEART
            </button>
          )}
          {onDelete && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(mission.id)}
            >
              DROP
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
