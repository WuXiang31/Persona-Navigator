"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useProfile } from "@/context/ProfileContext";
import { useToast } from "@/context/ToastContext";
import { STATS_ORDER, STAT_GLYPHS } from "@/lib/progression";
import {
  AGE_RANGES,
  AgeRange,
  MAX_IDENTITY_LENGTH,
  MAX_NAME_LENGTH,
  MAX_TEXT_LENGTH,
  Mask,
  OCCUPATIONS,
  Occupation,
  PlayerProfile,
  SITUATIONS,
} from "@/lib/mask";
import type { Stats } from "@/context/ProfileContext";
import styles from "./page.module.css";

type Step = "age" | "occupation" | "situation" | "aspiration" | "forging" | "review";
const QUESTION_STEPS: Step[] = ["age", "occupation", "situation", "aspiration"];

export default function AwakeningPage() {
  const router = useRouter();
  const { profile: saved, setProfile, equipMask, isLoaded } = useProfile();
  const { showToast } = useToast();

  // Answers start from the saved profile, so re-awakening edits rather than restarts
  const [step, setStep] = useState<Step>("age");
  const [ageRange, setAgeRange] = useState<AgeRange | null>(saved?.ageRange ?? null);
  const [occupation, setOccupation] = useState<Occupation | null>(saved?.occupation ?? null);
  const [occupationDetail, setOccupationDetail] = useState(saved?.occupationDetail ?? "");
  const [situations, setSituations] = useState<string[]>(
    saved?.situations.filter((s) => SITUATIONS.some((o) => o.id === s)) ?? []
  );
  const [customSituation, setCustomSituation] = useState(
    saved?.situations.filter((s) => !SITUATIONS.some((o) => o.id === s)).join("; ") ?? ""
  );
  const [aspiration, setAspiration] = useState(saved?.aspiration ?? "");
  const [draft, setDraft] = useState<Mask | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) return null;

  const buildProfile = (): PlayerProfile | null =>
    ageRange && occupation
      ? {
          ageRange,
          occupation,
          occupationDetail: occupationDetail.trim(),
          situations: [...situations, ...(customSituation.trim() ? [customSituation.trim()] : [])],
          aspiration: aspiration.trim(),
        }
      : null;

  const forge = async () => {
    const profile = buildProfile();
    if (!profile) return;
    setError(null);
    setStep("forging");
    try {
      const res = await fetch("/api/mask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { mask } = (await res.json()) as { mask: Mask };
      setDraft(mask);
      setStep("review");
    } catch {
      setError("The mask wouldn't form. The navigator may be overloaded; try again.");
      setStep("aspiration");
    }
  };

  const equip = () => {
    const profile = buildProfile();
    if (!profile || !draft || !draft.name.trim() || draft.routines.length === 0) return;
    setProfile(profile);
    equipMask({ ...draft, name: draft.name.trim(), identity: draft.identity.trim(), equippedAt: Date.now() });
    showToast("Mask awakened", "rank");
    router.push("/home");
  };

  const toggleSituation = (id: string) =>
    setSituations((list) => (list.includes(id) ? list.filter((s) => s !== id) : [...list, id]));

  const toggleFocus = (stat: keyof Stats) => {
    if (!draft) return;
    const current = draft.focusStats;
    if (current.includes(stat)) return;
    // Picking a new stat replaces the older of the two
    setDraft({ ...draft, focusStats: [current[1], stat] });
  };

  const questionIndex = QUESTION_STEPS.indexOf(step);
  const canContinue =
    (step === "age" && ageRange) ||
    (step === "occupation" && occupation) ||
    step === "situation" ||
    step === "aspiration";

  const next = () => {
    if (step === "aspiration") forge();
    else setStep(QUESTION_STEPS[questionIndex + 1]);
  };
  const back = () => (questionIndex > 0 ? setStep(QUESTION_STEPS[questionIndex - 1]) : router.back());

  return (
    <main className={styles.container}>
      {questionIndex >= 0 && (
        <>
          <p className={styles.kicker}>AWAKENING · {questionIndex + 1}/{QUESTION_STEPS.length}</p>
          <div className={styles.progress} aria-hidden>
            {QUESTION_STEPS.map((s, i) => (
              <span key={s} className={i <= questionIndex ? styles.progressOn : ""} />
            ))}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.section
          key={step}
          className={styles.step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {step === "age" && (
            <>
              <h1 className={styles.title}>How old are you?</h1>
              <div className={styles.options}>
                {AGE_RANGES.map((a) => (
                  <button
                    key={a.id}
                    className={`${styles.option} ${ageRange === a.id ? styles.optionOn : ""}`}
                    onClick={() => setAgeRange(a.id)}
                    aria-pressed={ageRange === a.id}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "occupation" && (
            <>
              <h1 className={styles.title}>What do you do?</h1>
              <div className={styles.options}>
                {OCCUPATIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`${styles.option} ${occupation === o.id ? styles.optionOn : ""}`}
                    onClick={() => setOccupation(o.id)}
                    aria-pressed={occupation === o.id}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <label className={styles.label}>
                MORE DETAIL (OPTIONAL)
                <input
                  className={styles.input}
                  value={occupationDetail}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) => setOccupationDetail(e.target.value)}
                  placeholder="e.g. 3rd-year Computer Science"
                />
              </label>
            </>
          )}

          {step === "situation" && (
            <>
              <h1 className={styles.title}>What&apos;s going on lately?</h1>
              <p className={styles.hint}>Pick any that fit.</p>
              <div className={styles.options}>
                {SITUATIONS.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.option} ${situations.includes(s.id) ? styles.optionOn : ""}`}
                    onClick={() => toggleSituation(s.id)}
                    aria-pressed={situations.includes(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <label className={styles.label}>
                ANYTHING ELSE?
                <input
                  className={styles.input}
                  value={customSituation}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) => setCustomSituation(e.target.value)}
                  placeholder="e.g. Preparing for finals in December"
                />
              </label>
            </>
          )}

          {step === "aspiration" && (
            <>
              <h1 className={styles.title}>Who do you want to become?</h1>
              <p className={styles.hint}>One sentence. This becomes the identity your missions vote for.</p>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={aspiration}
                maxLength={MAX_TEXT_LENGTH}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder="e.g. An engineer who ships real products, stays healthy and speaks up"
              />
              {error && <p className={styles.error}>{error}</p>}
              <p className={styles.privacy}>
                Your answers are saved to your account and sent to the AI navigator (Gemini) only to design your
                mask and missions.
              </p>
            </>
          )}

          {step === "forging" && (
            <div className={styles.forging}>
              <motion.div
                className={styles.forgingMark}
                animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
              />
              <h1 className={styles.title}>Forging your mask...</h1>
            </div>
          )}

          {step === "review" && draft && (
            <>
              <p className={styles.kicker}>YOUR MASK</p>
              {/* A textarea so long names wrap instead of scrolling out of view; newlines are stripped */}
              <textarea
                className={styles.maskName}
                value={draft.name}
                maxLength={MAX_NAME_LENGTH}
                rows={1}
                onChange={(e) => setDraft({ ...draft, name: e.target.value.replace(/\n/g, " ") })}
                aria-label="Mask name"
              />
              <textarea
                className={styles.identity}
                value={draft.identity}
                maxLength={MAX_IDENTITY_LENGTH}
                onChange={(e) => setDraft({ ...draft, identity: e.target.value })}
                aria-label="Identity statement"
              />

              <p className={styles.label}>FOCUS STATS · &times;1.25 XP</p>
              <div className={styles.statRow}>
                {STATS_ORDER.map((stat) => (
                  <button
                    key={stat}
                    className={`${styles.stat} ${draft.focusStats.includes(stat) ? styles.statOn : ""}`}
                    onClick={() => toggleFocus(stat)}
                    aria-pressed={draft.focusStats.includes(stat)}
                  >
                    {STAT_GLYPHS[stat]} {stat}
                  </button>
                ))}
              </div>

              <p className={styles.label}>ROUTINES</p>
              <ul className={styles.routines}>
                {draft.routines.map((r, i) => (
                  <li key={`${r.title}-${i}`} className={styles.routine}>
                    <div>
                      <span className={styles.routineTitle}>{r.title}</span>
                      {r.description && <span className={styles.routineDesc}>{r.description}</span>}
                    </div>
                    <span className={styles.routineXp}>
                      {STAT_GLYPHS[r.rewardStat]} +{r.rewardXp}
                    </span>
                    <button
                      className={styles.remove}
                      onClick={() => setDraft({ ...draft, routines: draft.routines.filter((_, j) => j !== i) })}
                      aria-label={`Remove ${r.title}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.section>
      </AnimatePresence>

      {questionIndex >= 0 && (
        <div className={styles.actions}>
          <button className={styles.back} onClick={back}>
            BACK
          </button>
          <button className={styles.primary} onClick={next} disabled={!canContinue}>
            {step === "aspiration" ? "FORGE MASK" : "NEXT"}
          </button>
        </div>
      )}

      {step === "review" && draft && (
        <div className={styles.actions}>
          <button className={styles.back} onClick={forge}>
            REROLL
          </button>
          <button
            className={styles.primary}
            onClick={equip}
            disabled={!draft.name.trim() || draft.routines.length === 0}
          >
            EQUIP
          </button>
        </div>
      )}
    </main>
  );
}
