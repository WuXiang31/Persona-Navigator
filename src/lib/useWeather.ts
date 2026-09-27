import { useEffect } from "react";
import { createLocalStore, useLocalStore } from "./localStore";
import { WeatherCondition, conditionFromWmoCode } from "./weather";

interface WeatherState {
  // null when location or the weather API is unavailable
  condition: WeatherCondition | null;
  fetchedAt: number;
}

export type WeatherStatus = "loading" | "ok" | "unavailable";

const REFRESH_MS = 60 * 60 * 1000;

const weatherStore = createLocalStore<WeatherState | null>("persona_weather", null);
let inFlight = false;

function isStale(state: WeatherState | null) {
  return !state || Date.now() - state.fetchedAt > REFRESH_MS;
}

async function fetchCondition(): Promise<WeatherCondition | null> {
  if (!("geolocation" in navigator)) return null;
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: REFRESH_MS,
        timeout: 10_000,
      })
    );
    const { latitude, longitude } = position.coords;
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}&current=weather_code`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const code = data.current?.weather_code;
    return typeof code === "number" ? conditionFromWmoCode(code) : null;
  } catch {
    // Location denied, timed out, or network error
    return null;
  }
}

async function refreshIfStale() {
  if (inFlight || !isStale(weatherStore.get())) return;
  inFlight = true;
  try {
    weatherStore.set({ condition: await fetchCondition(), fetchedAt: Date.now() });
  } finally {
    inFlight = false;
  }
}

// Weather condition currently shown in the UI, read synchronously (e.g. when granting mission XP)
export function getWeatherCondition(): WeatherCondition | null {
  return weatherStore.get()?.condition ?? null;
}

// Today's weather, fetched from the device location and cached for an hour
export function useWeather(): { condition: WeatherCondition | null; status: WeatherStatus } {
  const state = useLocalStore(weatherStore);

  useEffect(() => {
    refreshIfStale();
  }, []);

  if (!state) return { condition: null, status: "loading" };
  return { condition: state.condition, status: state.condition ? "ok" : "unavailable" };
}
