"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";
import { MAX_STAT, STAT_GLYPHS } from "@/lib/progression";
import { COMPANION_NAME } from "@/lib/companion";
import type { Recap, TimeOfDay } from "@/lib/chapter";
import styles from "./page.module.css";

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  night: "Night",
};

const formatDay = (key: string) =>
  new Date(`${key}T12:00:00`).toLocaleDateString("en", { month: "short", day: "numeric" });

const monthName = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
};

export default function RecapPage() {
  const { month } = useParams<{ month: string }>();
  const router = useRouter();
  const { recaps, updateRecap, profile, isLoaded } = useProfile();
  const recap = recaps.find((r) => r.month === month);

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
      body: JSON.stringify({ recap, profile }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(({ summary }: { summary: string }) => updateRecap(recap.month, { summary }))
      .catch(() => setSummaryFailed(true));
  }, [recap, profile, updateRecap, attempt]);

  if (!isLoaded) return null;
  if (!recap) {
    return (
      <main className={styles.container}>
        <p className={styles.kicker}>NO RECAP FOR THIS MONTH</p>
        <button className={styles.primary} onClick={() => router.push("/home")}>
          BACK TO STATUS
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
        <p className={styles.kicker}>CHAPTER {recap.number} CLEAR</p>
        <h1 className={styles.title}>{monthName(recap.month)}</h1>
        <p className={styles.dates}>
          {formatDay(recap.startedOn)} – {formatDay(recap.endedOn)}
        </p>
      </motion.div>

      {recap.mask && (
        <div className={styles.maskCard}>
          <span className={styles.maskName}>{recap.mask.name}</span>
          <p className={styles.identity}>&ldquo;{recap.mask.identity}&rdquo;</p>
        </div>
      )}

      <Votes recap={recap} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>GROWTH</h2>
        {recap.stats.map((s, i) => {
          const focus = recap.mask?.focusStats.includes(s.stat);
          return (
            <div key={s.stat} className={styles.statLine}>
              <div className={styles.statHead}>
                <span className={styles.statName}>
                  {STAT_GLYPHS[s.stat]} {s.stat}
                  {focus && <span className={styles.focusTag}>FOCUS</span>}
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
                {s.lost > 0 && <> · rust -{s.lost}</>}
                {s.endRank !== s.startRank ? (
                  <span className={styles.rankUp}>
                    {" "}
                    · {s.startRank} → {s.endRank}
                  </span>
                ) : (
                  <> · {s.endRank}</>
                )}
              </p>
            </div>
          );
        })}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>HIGHLIGHTS</h2>
        <div className={styles.tiles}>
          <Tile label="Most improved" value={recap.mostImproved ?? "–"} />
          <Tile label="Longest streak" value={`${recap.longestStreak} day${recap.longestStreak === 1 ? "" : "s"}`} />
          <Tile label="Active days" value={String(recap.activeDays)} />
          <Tile label="Weather boosts" value={String(recap.weatherBoosted)} />
        </div>

        {recap.favoriteTime && (
          <div className={styles.timeBlock}>
            <p className={styles.timeLabel}>
              YOU USUALLY SHOWED UP IN THE <strong>{TIME_LABELS[recap.favoriteTime].toUpperCase()}</strong>
            </p>
            {(Object.keys(TIME_LABELS) as TimeOfDay[]).map((t) => {
              const count = recap.timeOfDay[t];
              const pct = recap.missionsCleared ? (count / recap.missionsCleared) * 100 : 0;
              return (
                <div key={t} className={styles.timeRow}>
                  <span>{TIME_LABELS[t]}</span>
                  <span className={styles.timeBar}>
                    <span
                      className={t === recap.favoriteTime ? styles.timeFillTop : styles.timeFill}
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
            <p className={styles.listLabel}>WHAT YOU KEPT COMING BACK TO</p>
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
            <p className={styles.listLabel}>WAITING FOR NEXT CHAPTER</p>
            <ul className={`${styles.list} ${styles.muted}`}>
              {recap.untouchedRoutines.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className={styles.words}>
        <h2 className={styles.wordsTitle}>{COMPANION_NAME.toUpperCase()}&apos;S WORDS</h2>
        {recap.summary ? (
          <motion.p className={styles.summary} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            {recap.summary}
          </motion.p>
        ) : summaryFailed ? (
          <button className={styles.retry} onClick={retrySummary}>
            {COMPANION_NAME} couldn&apos;t find the words. Try again
          </button>
        ) : (
          <p className={styles.writing}>{COMPANION_NAME} is writing...</p>
        )}
      </section>

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={() => router.push("/awakening")}>
          RE-AWAKEN
        </button>
        <button className={styles.primary} onClick={() => router.push("/home")}>
          NEXT CHAPTER
        </button>
      </div>
    </main>
  );
}

function Votes({ recap }: { recap: Recap }) {
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
        {recap.mask ? "VOTES FOR WHO YOU'RE BECOMING" : "MISSIONS CLEARED"}
        {recap.fromRoutines > 0 && <em> · {recap.fromRoutines} from your routines</em>}
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
