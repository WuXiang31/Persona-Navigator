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
import { currentLang, useT } from "@/lib/i18n";
import styles from "./page.module.css";

type Step = "age" | "occupation" | "situation" | "aspiration" | "forging" | "review";
const QUESTION_STEPS: Step[] = ["age", "occupation", "situation", "aspiration"];

export default function AwakeningPage() {
  const router = useRouter();
  const { profile: saved, setProfile, equipMask, isLoaded } = useProfile();
  const { showToast } = useToast();
  const t = useT();

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
        body: JSON.stringify({ profile, lang: currentLang() }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const { mask } = (await res.json()) as { mask: Mask };
      setDraft(mask);
      setStep("review");
    } catch {
      setError(t.awakening.error);
      setStep("aspiration");
    }
  };

  const equip = () => {
    const profile = buildProfile();
    if (!profile || !draft || !draft.name.trim() || draft.routines.length === 0) return;
    setProfile(profile);
    equipMask({ ...draft, name: draft.name.trim(), identity: draft.identity.trim(), equippedAt: Date.now() });
    showToast(t.toast.maskAwakened, "rank");
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
          <p className={styles.kicker}>{t.awakening.kicker(questionIndex + 1, QUESTION_STEPS.length)}</p>
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
              <h1 className={styles.title}>{t.awakening.ageTitle}</h1>
              <div className={styles.options}>
                {AGE_RANGES.map((a) => (
                  <button
                    key={a.id}
                    className={`${styles.option} ${ageRange === a.id ? styles.optionOn : ""}`}
                    onClick={() => setAgeRange(a.id)}
                    aria-pressed={ageRange === a.id}
                  >
                    {t.awakening.ages[a.id]}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "occupation" && (
            <>
              <h1 className={styles.title}>{t.awakening.occupationTitle}</h1>
              <div className={styles.options}>
                {OCCUPATIONS.map((o) => (
                  <button
                    key={o.id}
                    className={`${styles.option} ${occupation === o.id ? styles.optionOn : ""}`}
                    onClick={() => setOccupation(o.id)}
                    aria-pressed={occupation === o.id}
                  >
                    {t.awakening.occupations[o.id]}
                  </button>
                ))}
              </div>
              <label className={styles.label}>
                {t.awakening.detailLabel}
                <input
                  className={styles.input}
                  value={occupationDetail}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) => setOccupationDetail(e.target.value)}
                  placeholder={t.awakening.detailPlaceholder}
                />
              </label>
            </>
          )}

          {step === "situation" && (
            <>
              <h1 className={styles.title}>{t.awakening.situationTitle}</h1>
              <p className={styles.hint}>{t.awakening.situationHint}</p>
              <div className={styles.options}>
                {SITUATIONS.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles.option} ${situations.includes(s.id) ? styles.optionOn : ""}`}
                    onClick={() => toggleSituation(s.id)}
                    aria-pressed={situations.includes(s.id)}
                  >
                    {t.awakening.situations[s.id]}
                  </button>
                ))}
              </div>
              <label className={styles.label}>
                {t.awakening.otherLabel}
                <input
                  className={styles.input}
                  value={customSituation}
                  maxLength={MAX_TEXT_LENGTH}
                  onChange={(e) => setCustomSituation(e.target.value)}
                  placeholder={t.awakening.otherPlaceholder}
                />
              </label>
            </>
          )}

          {step === "aspiration" && (
            <>
              <h1 className={styles.title}>{t.awakening.aspirationTitle}</h1>
              <p className={styles.hint}>{t.awakening.aspirationHint}</p>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={aspiration}
                maxLength={MAX_TEXT_LENGTH}
                onChange={(e) => setAspiration(e.target.value)}
                placeholder={t.awakening.aspirationPlaceholder}
              />
              {error && <p className={styles.error}>{error}</p>}
              <p className={styles.privacy}>
                {t.awakening.privacy}
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
              <h1 className={styles.title}>{t.awakening.forging}</h1>
            </div>
          )}

          {step === "review" && draft && (
            <>
              <p className={styles.kicker}>{t.awakening.yourMask}</p>
              {/* A textarea so long names wrap instead of scrolling out of view; newlines are stripped */}
              <textarea
                className={styles.maskName}
                value={draft.name}
                maxLength={MAX_NAME_LENGTH}
                rows={1}
                onChange={(e) => setDraft({ ...draft, name: e.target.value.replace(/\n/g, " ") })}
                aria-label={t.awakening.maskName}
              />
              <textarea
                className={styles.identity}
                value={draft.identity}
                maxLength={MAX_IDENTITY_LENGTH}
                onChange={(e) => setDraft({ ...draft, identity: e.target.value })}
                aria-label={t.awakening.identity}
              />

              <p className={styles.label}>{t.awakening.focusStats}</p>
              <div className={styles.statRow}>
                {STATS_ORDER.map((stat) => (
                  <button
                    key={stat}
                    className={`${styles.stat} ${draft.focusStats.includes(stat) ? styles.statOn : ""}`}
                    onClick={() => toggleFocus(stat)}
                    aria-pressed={draft.focusStats.includes(stat)}
                  >
                    {STAT_GLYPHS[stat]} {t.stat[stat]}
                  </button>
                ))}
              </div>

              <p className={styles.label}>{t.awakening.routines}</p>
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
                      aria-label={t.awakening.remove(r.title)}
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
            {t.awakening.back}
          </button>
          <button className={styles.primary} onClick={next} disabled={!canContinue}>
            {step === "aspiration" ? t.awakening.forge : t.awakening.next}
          </button>
        </div>
      )}

      {step === "review" && draft && (
        <div className={styles.actions}>
          <button className={styles.back} onClick={forge}>
            {t.awakening.reroll}
          </button>
          <button
            className={styles.primary}
            onClick={equip}
            disabled={!draft.name.trim() || draft.routines.length === 0}
          >
            {t.awakening.equip}
          </button>
        </div>
      )}
    </main>
  );
}
