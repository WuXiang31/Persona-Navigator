import React from "react";
import styles from "./WeatherBanner.module.css";
import { useWeather } from "@/lib/useWeather";
import { WEATHER_BOOST, WEATHER_INFO } from "@/lib/weather";
import { useT } from "@/lib/i18n";

export function WeatherBanner() {
  const { condition, status } = useWeather();
  const t = useT();

  if (status !== "ok" || !condition) {
    return (
      <div className={`${styles.banner} ${styles.muted}`}>
        <span className={styles.label}>{status === "loading" ? t.weather.scanning : t.weather.offline}</span>
        {status === "unavailable" && <span className={styles.bonus}>{t.weather.allowLocation}</span>}
      </div>
    );
  }

  const info = WEATHER_INFO[condition];
  return (
    <div className={styles.banner} style={{ background: info.bg, color: info.fg }}>
      <span className={styles.label}>{t.weather.label[condition]}</span>
      <span className={styles.bonus}>
        {t.weather.bonus(info.bonus === "all" ? t.weather.allStats : t.stat[info.bonus], WEATHER_BOOST)}
      </span>
    </div>
  );
}
