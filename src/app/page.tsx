"use client";

import { motion } from "framer-motion";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function WelcomeScreen() {
  const router = useRouter();

  const handleBegin = () => {
    router.push("/role-select");
  };

  return (
    <main className={`${styles.welcomeContainer} diagonal-stripe-velvet`}>
      {/* Halftone Overlay */}
      <div className={`${styles.halftoneOverlay} halftone-bg`} />

      <div className={styles.content}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className={styles.kicker}>WELCOME TO THE THRESHOLD</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
        >
          <h1 className={styles.mainTitle}>
            PERSONA
            <br />
            NAVIGATOR
          </h1>
        </motion.div>

        <motion.div 
          className={styles.tagsContainer}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className={`${styles.tagWhite} skew-container`}>
            <span className="unskew-content">REAL-LIFE</span>
          </div>
          <div className={`${styles.tagRed} skew-container`}>
            <span className="unskew-content">RPG TRACKER</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className={styles.buttonWrapper}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2, type: "spring" }}
      >
        <button className={`${styles.beginButton} skew-container`} onClick={handleBegin}>
          <span className="unskew-content">BEGIN</span>
        </button>
      </motion.div>
    </main>
  );
}
