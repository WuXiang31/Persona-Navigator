"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";
import { STAT_GLYPHS } from "@/lib/progression";
import { Recap, buildRecap, dayLabel, monthLabel } from "@/lib/chapter";
import { Messages, useLang, useT } from "@/lib/i18n";
import styles from "./page.module.css";

export default function ChaptersPage() {
  const { chapter, recaps, log, stats, mask, isLoaded } = useProfile();
  const t = useT();
  const lang = useLang();
  if (!isLoaded) return null;

  // The chapter in progress, summarized so far with the same rules as a finished recap
  const current = chapter ? buildRecap(chapter, stats, log, mask) : null;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <main className={styles.container}>
      <div className={styles.titleRow}>
        <h1 className={styles.pageTitle}>{t.chapters.title}</h1>
        <div className={styles.slash} aria-hidden />
      </div>

      {chapter && current && (
        <section className={styles.current}>
          <p className={styles.currentKicker}>
            {t.chapters.inProgress(chapter.number)}
          </p>
          <h2 className={styles.currentTitle}>{monthLabel(chapter.month, lang)}</h2>
          <p className={styles.currentMeta}>
            {t.chapters.day(now.getDate(), daysInMonth)}
            {mask && <> &middot; {mask.name}</>}
          </p>
          <div className={styles.currentStats}>
            <Stat value={current.missionsCleared} label={mask ? t.chapters.votesSoFar : t.chapters.missions} />
            <Stat value={current.activeDays} label={t.chapters.activeDays} />
            <Stat value={current.longestStreak} label={t.chapters.bestStreak} />
          </div>
          <p className={styles.currentNote}>{t.chapters.unlockNote}</p>
        </section>
      )}

      <h2 className={styles.sectionTitle}>{t.chapters.finished}</h2>
      {recaps.length === 0 ? (
        <p className={styles.empty}>
          {t.chapters.empty}
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
              <RecapCard recap={recap} t={t} lang={lang} />
            </motion.li>
          ))}
        </ul>
      )}
    </main>
  );
}

function RecapCard({ recap, t, lang }: { recap: Recap; t: Messages; lang: "en" | "zh" }) {
  const rankUps = recap.stats.filter((s) => s.endRank !== s.startRank).length;
  return (
    <Link href={`/recap/${recap.month}`} className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardNumber}>CH.{recap.number}</span>
        <span className={styles.cardMonth}>{monthLabel(recap.month, lang)}</span>
        {!recap.seen && <span className={styles.newTag}>{t.chapters.newTag}</span>}
      </div>
      <p className={styles.cardMask}>
        {recap.mask?.name ?? t.chapters.noMask} &middot; {dayLabel(recap.startedOn, lang)} – {dayLabel(recap.endedOn, lang)}
      </p>
      <div className={styles.cardStats}>
        <span>
          <strong>{recap.missionsCleared}</strong> {recap.mask ? t.chapters.votes : t.chapters.missions}
        </span>
        <span>
          {t.chapters.streak(recap.longestStreak)}
        </span>
        {recap.mostImproved && (
          <span>
            {STAT_GLYPHS[recap.mostImproved]} <strong>{t.stat[recap.mostImproved]}</strong>
          </span>
        )}
        {rankUps > 0 && (
          <span className={styles.rankUps}>
            {t.chapters.rankUps(rankUps)}
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
