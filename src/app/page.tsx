"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/context/ProfileContext";
import styles from "./page.module.css";

export default function WelcomeScreen() {
  const router = useRouter();
  const { mask, isLoaded } = useProfile();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  // Signed-in players who already wear a mask (or an original role) skip onboarding and go straight to Status
  const isReturning = isSignedIn && mask;
  useEffect(() => {
    if (isLoaded && authLoaded && isReturning) router.replace("/home");
  }, [isLoaded, authLoaded, isReturning, router]);

  // Render nothing until we know whether to redirect, so the welcome screen never flashes
  if (!isLoaded || !authLoaded || isReturning) return null;

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
        // New visitors create an account first; signed-in players without a mask go awaken one
        onClick={() => router.push(isSignedIn ? "/awakening" : "/sign-up")}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.4 }}
      >
        BEGIN
      </motion.button>

      {!isSignedIn && (
        <Link href="/sign-in" className={styles.login}>
          ALREADY A PLAYER? LOG IN
        </Link>
      )}

      <p className={styles.footer}>TAKE IT ONE DAY AT A TIME</p>
    </main>
  );
}
