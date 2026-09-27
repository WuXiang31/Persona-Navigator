import React from "react";
import { motion } from "framer-motion";
import styles from "./MissionProposals.module.css";
import { Mission } from "@/context/MissionContext";

export type ProposalStatus = "pending" | "accepted" | "dismissed";

export interface MissionProposal extends Omit<Mission, "id" | "status" | "createdAt"> {
  proposalStatus: ProposalStatus;
}

interface MissionProposalsProps {
  proposals: MissionProposal[];
  onAccept: (index: number) => void;
  onDismiss: (index: number) => void;
  onAcceptAll: () => void;
}

export function MissionProposals({ proposals, onAccept, onDismiss, onAcceptAll }: MissionProposalsProps) {
  const pendingCount = proposals.filter((p) => p.proposalStatus === "pending").length;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
    >
      <div className={styles.header}>
        <span className={styles.headerLabel}>MISSION BRIEFING</span>
        {pendingCount > 1 && (
          <button className={styles.acceptAllBtn} onClick={onAcceptAll}>
            ACCEPT ALL ({pendingCount})
          </button>
        )}
      </div>

      {proposals.map((p, i) => (
        <div
          key={i}
          className={`${styles.card} ${p.proposalStatus !== "pending" ? styles[p.proposalStatus] : ""}`}
        >
          <div className={styles.cardTop}>
            <h4 className={styles.title}>{p.title}</h4>
            <div className={styles.rewardBadge}>
              <span className={styles.rewardStat}>{p.rewardStat}</span>
              <span className={styles.rewardXp}>+{p.rewardXp} XP</span>
            </div>
          </div>

          {p.description && <p className={styles.description}>{p.description}</p>}

          <div className={styles.actions}>
            {p.proposalStatus === "pending" ? (
              <>
                <button className={styles.acceptBtn} onClick={() => onAccept(i)}>
                  ACCEPT
                </button>
                <button className={styles.dismissBtn} onClick={() => onDismiss(i)}>
                  PASS
                </button>
              </>
            ) : (
              <span className={styles.stamp}>
                {p.proposalStatus === "accepted" ? "ACCEPTED" : "PASSED"}
              </span>
            )}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
