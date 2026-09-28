"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";
import { STAT_GLYPHS } from "@/lib/progression";
import { Recap, buildRecap, dayLabel, monthLabel } from "@/lib/chapter";
import styles from "./page.module.css";

export default function ChaptersPage() {
  const { chapter, recaps, log, stats, mask, isLoaded } = useProfile();
  if (!isLoaded) return null;

  // The chapter in progress, summarized so far with the same rules as a finished recap
  const current = chapter ? buildRecap(chapter, stats, log, mask) : null;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <main className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.pageTitle}>Chapters</h1>
        <div className={styles.slash} aria-hidden />
      </div>

      {chapter && current && (
        <section className={styles.current}>
          <p className={styles.currentKicker}>
            CHAPTER {chapter.number} &middot; IN PROGRESS
          </p>
          <h2 className={styles.currentTitle}>{monthLabel(chapter.month)}</h2>
          <p className={styles.currentMeta}>
            DAY {now.getDate()}/{daysInMonth}
            {mask && <> &middot; {mask.name}</>}
          </p>
          <div className={styles.currentStats}>
            <Stat value={current.missionsCleared} label={mask ? "votes so far" : "missions"} />
            <Stat value={current.activeDays} label="active days" />
            <Stat value={current.longestStreak} label="best streak" />
          </div>
          <p className={styles.currentNote}>The recap unlocks the first time you open the app next month.</p>
        </section>
      )}

      <h2 className={styles.sectionTitle}>FINISHED</h2>
      {recaps.length === 0 ? (
        <p className={styles.empty}>
          No finished chapters yet. When this month ends, its recap will wait for you here.
        </p>
      ) : (
        <ul className={styles.list}>
          {recaps.map((recap, i) => (
            <motion.li
              key={recap.month}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RecapCard recap={recap} />
            </motion.li>
          ))}
        </ul>
      )}
    </main>
  );
}

function RecapCard({ recap }: { recap: Recap }) {
  const rankUps = recap.stats.filter((s) => s.endRank !== s.startRank).length;
  return (
    <Link href={`/recap/${recap.month}`} className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardNumber}>CH.{recap.number}</span>
        <span className={styles.cardMonth}>{monthLabel(recap.month)}</span>
        {!recap.seen && <span className={styles.newTag}>NEW</span>}
      </div>
      <p className={styles.cardMask}>
        {recap.mask?.name ?? "No mask"} &middot; {dayLabel(recap.startedOn)} – {dayLabel(recap.endedOn)}
      </p>
      <div className={styles.cardStats}>
        <span>
          <strong>{recap.missionsCleared}</strong> {recap.mask ? "votes" : "missions"}
        </span>
        <span>
          <strong>{recap.longestStreak}</strong>-day streak
        </span>
        {recap.mostImproved && (
          <span>
            {STAT_GLYPHS[recap.mostImproved]} <strong>{recap.mostImproved}</strong>
          </span>
        )}
        {rankUps > 0 && (
          <span className={styles.rankUps}>
            {rankUps} rank-up{rankUps > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {recap.summary && <p className={styles.cardQuote}>{recap.summary}</p>}
    </Link>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}
