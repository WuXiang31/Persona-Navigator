import React from "react";
import styles from "./WeatherBanner.module.css";
import { useWeather } from "@/lib/useWeather";
import { WEATHER_BOOST, WEATHER_INFO } from "@/lib/weather";

export function WeatherBanner() {
  const { condition, status } = useWeather();

  if (status !== "ok" || !condition) {
    return (
      <div className={`${styles.banner} ${styles.muted}`}>
        <span className={styles.label}>{status === "loading" ? "SCANNING THE SKIES..." : "WEATHER OFFLINE"}</span>
        {status === "unavailable" && <span className={styles.bonus}>Allow location access for daily XP bonuses</span>}
      </div>
    );
  }

  const info = WEATHER_INFO[condition];
  return (
    <div className={styles.banner} style={{ background: info.bg, color: info.fg }}>
      <span className={styles.label}>{info.label}</span>
      <span className={styles.bonus}>
        Today&apos;s bonus: {info.bonus === "all" ? "ALL STATS" : info.bonus} &times;{WEATHER_BOOST}
      </span>
    </div>
  );
}
