"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/context/ProfileContext";
import { useT } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import styles from "./page.module.css";

export default function WelcomeScreen() {
  const router = useRouter();
  const { mask, isLoaded } = useProfile();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const t = useT();

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
      <LangToggle className={styles.lang} />

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className={styles.kicker}>{t.welcome.kicker}</p>
        <h1 className={styles.title}>
          Persona
          <br />
          Navi&shy;gator
        </h1>
        <p className={styles.tagWhite}>{t.welcome.tagWhite}</p>
        <p className={styles.tagRed}>{t.welcome.tagRed}</p>
      </motion.div>

      <motion.button
        className={styles.begin}
        // New visitors create an account first; signed-in players without a mask go awaken one
        onClick={() => router.push(isSignedIn ? "/awakening" : "/sign-up")}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", delay: 0.4 }}
      >
        {t.welcome.begin}
      </motion.button>

      {!isSignedIn && (
        <Link href="/sign-in" className={styles.login}>
          {t.welcome.login}
        </Link>
      )}

      <p className={styles.footer}>{t.welcome.footer}</p>
    </main>
  );
}
