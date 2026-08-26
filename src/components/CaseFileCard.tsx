"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./CaseFileCard.module.css";

export function CaseFileCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className={styles.cardWrapper}
      initial={{ opacity: 0, y: 30, rotate: -4 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }} // The inner card already has rotate: -2deg
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className={styles.shadow} />
      <div className={styles.card}>{children}</div>
    </motion.div>
  );
}
