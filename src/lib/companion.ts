import type { Stats } from "@/context/ProfileContext";
import type { Mission } from "@/context/MissionContext";
import { STATS_ORDER } from "./progression";

// The AI companion's display name. Defaults to the original character Vesper;
// override locally with NEXT_PUBLIC_COMPANION_NAME (and COMPANION_PERSONA for the prompt).
export const COMPANION_NAME = process.env.NEXT_PUBLIC_COMPANION_NAME || "Vesper";

// Letter shown in the companion's avatar tile
export const COMPANION_INITIAL = COMPANION_NAME.charAt(0).toUpperCase();

// The companion's one-liner on the Status screen: a jab at the weakest stat,
// or grudging praise once every mission is cleared
export function statusLine(stats: Stats, missions: Pick<Mission, "status">[]): string {
  if (missions.length > 0 && missions.every((m) => m.status === "completed")) {
    return "Full clear?! Fine, I'm impressed. Don't let it go to your head.";
  }
  const weakest = STATS_ORDER.reduce((a, b) => (stats[a] <= stats[b] ? a : b));
  return `Your ${weakest.toUpperCase()} is embarrassing. Do something about it before I disown you.`;
}
