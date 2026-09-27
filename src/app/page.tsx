"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <main className={styles.welcome}>
      <div className={styles.stripes} aria-hidden />
      <div className={styles.dots} aria-hidden />

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className={styles.kicker}>WELCOME TO THE THRESHOLD</p>
        <h1 className={styles.title}>
          Persona
          <br />
          Navi&shy;gator
        </h1>
        <p className={styles.tagWhite}>YOUR REAL LIFE IS THE DUNGEON.</p>
        <p className={styles.tagRed}>TIME TO CLEAR IT.</p>
      </motion.div>

      <motion.button
        className={styles.begin}
        onClick={() => router.push("/role-select")}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.4 }}
      >
        BEGIN
      </motion.button>

      <p className={styles.footer}>TAKE IT ONE DAY AT A TIME</p>
    </main>
  );
}
