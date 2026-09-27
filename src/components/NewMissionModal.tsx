import React, { useState } from "react";
import styles from "./NewMissionModal.module.css";
import { OverlayPanel } from "./OverlayPanel";
import { Mission } from "@/context/MissionContext";
import { Stats } from "@/context/ProfileContext";
import { STATS_ORDER, STAT_GLYPHS } from "@/lib/progression";

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mission: Omit<Mission, "id" | "status" | "createdAt">) => void;
}

const DEFAULT_STAT: keyof Stats = "knowledge";
const DEFAULT_XP = 25;

export function NewMissionModal({ isOpen, onClose, onSave }: NewMissionModalProps) {
  const [title, setTitle] = useState("");
  const [rewardStat, setRewardStat] = useState<keyof Stats>(DEFAULT_STAT);
  const [rewardXp, setRewardXp] = useState(DEFAULT_XP);

  const close = () => {
    setTitle("");
    setRewardStat(DEFAULT_STAT);
    setRewardXp(DEFAULT_XP);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: "", rewardStat, rewardXp });
    close();
  };

  return (
    <OverlayPanel isOpen={isOpen} onClose={close} title="New mission" subtitle="NAME IT. PICK A STAT. SET REWARD.">
      <form onSubmit={handleSubmit}>
        <input
          className={styles.nameInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="MISSION NAME..."
          aria-label="Mission name"
          autoFocus
        />

        <div className={styles.label}>TARGET STAT</div>
        <div className={styles.statPicks} role="radiogroup" aria-label="Target stat">
          {STATS_ORDER.map((stat) => (
            <button
              key={stat}
              type="button"
              role="radio"
              aria-checked={rewardStat === stat}
              className={`${styles.statPick} ${rewardStat === stat ? styles.statPickActive : ""}`}
              onClick={() => setRewardStat(stat)}
            >
              <span>{STAT_GLYPHS[stat]}</span>
              <span>{stat}</span>
            </button>
          ))}
        </div>

        <label className={styles.label} htmlFor="new-mission-xp">
          XP REWARD &mdash; {rewardXp}
        </label>
        <input
          id="new-mission-xp"
          className={styles.slider}
          type="range"
          min={10}
          max={60}
          step={5}
          value={rewardXp}
          onChange={(e) => setRewardXp(Number(e.target.value))}
        />

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={close}>
            CANCEL
          </button>
          <button type="submit" className={styles.submitBtn} disabled={!title.trim()}>
            ADD MISSION
          </button>
        </div>
      </form>
    </OverlayPanel>
  );
}
