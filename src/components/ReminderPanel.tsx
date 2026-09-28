"use client";

import { OverlayPanel } from "./OverlayPanel";
import { useReminders } from "@/lib/useReminders";
import { useT } from "@/lib/i18n";
import styles from "./ReminderPanel.module.css";

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00

export function ReminderPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useT().reminder;
  const r = useReminders();

  return (
    <OverlayPanel isOpen={isOpen} onClose={onClose} title={t.title} subtitle={t.subtitle}>
      {r.support === "ios-install" && <p className={styles.note}>{t.iosInstall}</p>}
      {r.support === "unsupported" && <p className={styles.note}>{t.unsupported}</p>}

      {r.support === "ok" && (
        <>
          {r.permission === "denied" && <p className={styles.note}>{t.denied}</p>}

          <div className={styles.row}>
            <button
              className={`${styles.switch} ${r.enabled ? styles.switchOn : ""}`}
              onClick={r.enabled ? r.disable : r.enable}
              disabled={r.busy || r.permission === "denied"}
              aria-pressed={r.enabled}
            >
              <span className={r.enabled ? styles.active : ""}>{t.on}</span>
              <span className={!r.enabled ? styles.active : ""}>{t.off}</span>
            </button>
          </div>

          <label className={styles.label}>
            {t.time}
            <select
              className={styles.select}
              value={r.hour}
              onChange={(e) => r.changeHour(Number(e.target.value))}
              disabled={r.busy}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </label>

          {r.enabled && (
            <button className={styles.test} onClick={r.sendTest} disabled={r.busy}>
              {t.test}
            </button>
          )}
          {r.error && <p className={styles.error}>{t.failed}</p>}
        </>
      )}
    </OverlayPanel>
  );
}
