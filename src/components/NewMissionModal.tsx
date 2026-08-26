import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NewMissionModal.module.css";
import { Mission } from "@/context/MissionContext";
import { Stats } from "@/context/ProfileContext";

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mission: Omit<Mission, "id" | "status" | "createdAt">) => void;
}

export function NewMissionModal({ isOpen, onClose, onSave }: NewMissionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardStat, setRewardStat] = useState<keyof Stats>("knowledge");
  const [rewardXp, setRewardXp] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      title,
      description,
      rewardStat,
      rewardXp,
    });
    
    // Reset and close
    setTitle("");
    setDescription("");
    setRewardStat("knowledge");
    setRewardXp(50);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div
            className={styles.modalContent}
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={styles.modalBg} />
            <form className={styles.formContainer} onSubmit={handleSubmit}>
              <h2 className={styles.header}>CALL TO ACTION</h2>
              
              <div className={styles.inputGroup}>
                <label>TARGET (Title)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Study for finals"
                  autoFocus
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>INTEL (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                />
              </div>
              
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>STAT REWARD</label>
                  <select
                    value={rewardStat}
                    onChange={(e) => setRewardStat(e.target.value as keyof Stats)}
                  >
                    <option value="knowledge">Knowledge</option>
                    <option value="vitality">Vitality</option>
                    <option value="charm">Charm</option>
                    <option value="craft">Craft</option>
                    <option value="nerve">Nerve</option>
                  </select>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>XP (+)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="10"
                    value={rewardXp}
                    onChange={(e) => setRewardXp(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className={styles.actions}>
                <button type="button" className={styles.cancelBtn} onClick={onClose}>
                  CANCEL
                </button>
                <button type="submit" className={styles.submitBtn}>
                  CONFIRM
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
