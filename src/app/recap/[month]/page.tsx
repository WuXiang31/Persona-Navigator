"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";
import { MAX_STAT, RANK_NAMES, STAT_GLYPHS } from "@/lib/progression";
import { Messages, currentLang, useLang, useT } from "@/lib/i18n";
import { COMPANION_NAME } from "@/lib/companion";
import { Recap, TimeOfDay, dayLabel, monthLabel } from "@/lib/chapter";
import styles from "./page.module.css";

const TIMES: TimeOfDay[] = ["morning", "afternoon", "evening", "night"];

export default function RecapPage() {
  const { month } = useParams<{ month: string }>();
  const router = useRouter();
  const { recaps, updateRecap, profile, isLoaded } = useProfile();
  const recap = recaps.find((r) => r.month === month);

  const t = useT();
  const lang = useLang();
  // Ranks are stored by their English name; show them in the current language
  const rank = (name: string) => t.rank[RANK_NAMES.indexOf(name as (typeof RANK_NAMES)[number])] ?? name;
  const [summaryFailed, setSummaryFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const requested = useRef(false);

  // Opening a recap marks it seen, and asks the navigator for closing words the first time
  useEffect(() => {
    if (!recap) return;
    if (!recap.seen) updateRecap(recap.month, { seen: true });
    if (recap.summary || requested.current) return;
    requested.current = true;
    fetch("/api/recap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recap, profile, lang: currentLang() }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ summary }: { summary: string }) => updateRecap(recap.month, { summary }))
      .catch(() => setSummaryFailed(true));
  }, [recap, profile, updateRecap, attempt]);

  if (!isLoaded) return null;
  if (!recap) {
    return (
      <main className={styles.container}>
        <p className={styles.kicker}>{t.recap.missing}</p>
        <button className={styles.primary} onClick={() => router.push("/home")}>
          {t.recap.backToStatus}
        </button>
      </main>
    );
  }

  const retrySummary = () => {
    requested.current = false;
    setSummaryFailed(false);
    setAttempt((n) => n + 1);
  };

  return (
    <main className={styles.container}>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <p className={styles.kicker}>{t.recap.clear(recap.number)}</p>
        <h1 className={styles.title}>{monthLabel(recap.month, lang)}</h1>
        <p className={styles.dates}>
          {dayLabel(recap.startedOn, lang)} – {dayLabel(recap.endedOn, lang)}
          <Link href="/chapters" className={styles.allChapters}>
            {t.recap.allChapters}
          </Link>
        </p>
      </motion.div>

      {recap.mask && (
        <div className={styles.maskCard}>
          <span className={styles.maskName}>{recap.mask.name}</span>
          <p className={styles.identity}>&ldquo;{recap.mask.identity}&rdquo;</p>
        </div>
      )}

      <Votes recap={recap} t={t} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.recap.growth}</h2>
        {recap.stats.map((s, i) => {
          const focus = recap.mask?.focusStats.includes(s.stat);
          return (
            <div key={s.stat} className={styles.statLine}>
              <div className={styles.statHead}>
                <span className={styles.statName}>
                  {STAT_GLYPHS[s.stat]} {t.stat[s.stat]}
                  {focus && <span className={styles.focusTag}>{t.recap.focus}</span>}
                </span>
                <span className={styles.statGain}>+{s.gained}</span>
              </div>
              <div className={styles.bar}>
                <span className={styles.barStart} style={{ width: `${(s.start / MAX_STAT) * 100}%` }} />
                <motion.span
                  className={styles.barGain}
                  initial={{ width: 0 }}
                  animate={{ width: `${(Math.max(0, s.end - s.start) / MAX_STAT) * 100}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                />
              </div>
              <p className={styles.statMeta}>
                {s.start} → {s.end} XP
                {s.lost > 0 && t.recap.rust(s.lost)}
                {s.endRank !== s.startRank ? (
                  <span className={styles.rankUp}>
                    {" "}
                    · {rank(s.startRank)} → {rank(s.endRank)}
                  </span>
                ) : (
                  <> · {rank(s.endRank)}</>
                )}
              </p>
            </div>
          );
        })}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t.recap.highlights}</h2>
        <div className={styles.tiles}>
          <Tile label={t.recap.mostImproved} value={recap.mostImproved ? t.stat[recap.mostImproved] : "–"} />
          <Tile label={t.recap.longestStreak} value={t.recap.days(recap.longestStreak)} />
          <Tile label={t.recap.activeDays} value={String(recap.activeDays)} />
          <Tile label={t.recap.weatherBoosts} value={String(recap.weatherBoosted)} />
        </div>

        {recap.favoriteTime && (
          <div className={styles.timeBlock}>
            <p className={styles.timeLabel}>
              {t.recap.showedUp(t.timeOfDay[recap.favoriteTime])}
            </p>
            {TIMES.map((time) => {
              const count = recap.timeOfDay[time];
              const pct = recap.missionsCleared ? (count / recap.missionsCleared) * 100 : 0;
              return (
                <div key={time} className={styles.timeRow}>
                  <span>{t.timeOfDay[time]}</span>
                  <span className={styles.timeBar}>
                    <span
                      className={time === recap.favoriteTime ? styles.timeFillTop : styles.timeFill}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className={styles.timeCount}>{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {recap.topMissions.length > 0 && (
          <>
            <p className={styles.listLabel}>{t.recap.keptComingBack}</p>
            <ul className={styles.list}>
              {recap.topMissions.map((m) => (
                <li key={m.title}>
                  <span>{m.title}</span>
                  <span className={styles.count}>&times;{m.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {recap.untouchedRoutines.length > 0 && (
          <>
            <p className={styles.listLabel}>{t.recap.waiting}</p>
            <ul className={`${styles.list} ${styles.muted}`}>
              {recap.untouchedRoutines.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={styles.words}>
        <h2 className={styles.wordsTitle}>{t.recap.words(COMPANION_NAME)}</h2>
        {recap.summary ? (
          <motion.p className={styles.summary} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {recap.summary}
          </motion.p>
        ) : summaryFailed ? (
          <button className={styles.retry} onClick={retrySummary}>
            {t.recap.retry(COMPANION_NAME)}
          </button>
        ) : (
          <p className={styles.writing}>{t.recap.writing(COMPANION_NAME)}</p>
        )}
      </section>

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={() => router.push("/awakening")}>
          {t.recap.reawaken}
        </button>
        <button className={styles.primary} onClick={() => router.push("/home")}>
          {t.recap.nextChapter}
        </button>
      </div>
    </main>
  );
}

function Votes({ recap, t }: { recap: Recap; t: Messages }) {
  return (
    <div className={styles.votes}>
      <motion.span
        className={styles.votesNumber}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
      >
        {recap.missionsCleared}
      </motion.span>
      <span className={styles.votesLabel}>
        {recap.mask ? t.recap.votes : t.recap.missions}
        {recap.fromRoutines > 0 && <em>{t.recap.fromRoutines(recap.fromRoutines)}</em>}
      </span>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileValue}>{value}</span>
      <span className={styles.tileLabel}>{label}</span>
    </div>
  );
}
