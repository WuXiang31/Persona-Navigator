# Technical Overview

This is the source of truth for how Persona Navigator works. Update it whenever you add a feature or change the architecture (see [`.agents/AGENTS.md`](../.agents/AGENTS.md)).

## Architecture

- **Framework**: Next.js 16 App Router, React 19 and TypeScript. Pages under `src/app/(app)/` share a layout with the bottom nav.
- **Client-side app state**: all game state lives in the browser's `localStorage`. There is no database or auth yet. The only server code is the chat Route Handler, which keeps the Gemini key off the client.
- **External services**:
  - Gemini (`generativelanguage.googleapis.com`), called from `src/app/api/chat/route.ts`.
  - Open-Meteo (`api.open-meteo.com`), called directly from the browser. No key needed.

```
Browser
  ToastProvider
    ProfileProvider   role, stats, addXp, daily decay
      MissionProvider missions, complete/undo (weather-boosted XP)
        pages ---- POST /api/chat ----> Gemini
  useWeather() ---- geolocation + fetch ----> Open-Meteo
```

Providers are nested in `src/app/layout.tsx`. `MissionProvider` uses `useProfile().addXp`, and `ProfileProvider` uses `useToast()`, so the order matters.

## State and persistence

Every persisted value goes through `createLocalStore` in `src/lib/localStore.ts`. Components read it with `useLocalStore(store)`, which is built on `useSyncExternalStore`.

- **Synchronous reads.** `store.get()` always returns the latest saved value. Handlers such as `completeMission` read fresh state without refs, and a double click can't grant XP twice.
- **No setState-in-effect loading.** The server snapshot is the fallback value. `useIsClient()` tells pages when real data is available (this is the `isLoaded` exposed by the contexts).
- **Stable references.** The parsed value is cached per raw string, so unchanged data doesn't re-render.
- **Cross-tab sync.** Stores listen to the `storage` event, so changes in one tab show up in others.

### localStorage keys

| Key | Type | Owner | Notes |
|---|---|---|---|
| `persona_role` | bare string | `ProfileContext` | Not JSON (legacy format). Uses a custom codec. |
| `persona_stats` | `Stats` | `ProfileContext` | Each stat 0-500 |
| `persona_decay` | `DecayState` | `ProfileContext` | Per-stat last trained day, plus the last day decay was charged |
| `persona_missions` | `Mission[]` | `MissionContext` | `awardedXp` is set while a mission is completed |
| `persona_chat` | `MessageData[]` | chat page | Last 100 messages, including proposal accept/pass state |
| `persona_weather` | `{ condition, fetchedAt }` | `useWeather` | `condition` is `null` when location or the API is unavailable |

## Game rules

All tunable constants live in `src/lib/`.

### Stats and ranks (`progression.ts`)
- Stats: `knowledge`, `vitality`, `charm`, `craft`, `nerve`, each clamped to `0..MAX_STAT` (500).
- Rank index is `min(4, floor(xp / 100))`, which maps to Novice, Apprentice, Adept, Expert, Master.
- `addXp(stat, xp)` clamps the result and returns the change actually applied. It shows an XP toast, and a delayed (900 ms) "Rank up!" toast when the rank index increases.

### Missions (`MissionContext.tsx`)
- `completeMission` grants `boostedXp(rewardXp, weather, stat)` and stores the applied amount as `awardedXp`.
- `uncompleteMission` subtracts `awardedXp`, so undo is exact even when the stat was capped or boosted.
- Quick Log grants `QUICK_LOG_XP` (15) to a chosen stat.

### Weather bonus (`weather.ts`, `useWeather.ts`)

| Condition | WMO codes | Bonus stat |
|---|---|---|
| clear | 0, 1 and anything unmapped | charm |
| cloudy | 2, 3, 45-48 | craft |
| rainy | 51-67, 80-82 | knowledge |
| snowy | 71-77, 85, 86 | nerve |
| storm | 95-99 | all |

- A mission for the bonus stat is worth `round(xp * 1.5)`. Mission cards show a ⚡ and the boosted value.
- Weather is fetched from the device location (low accuracy, 10 s timeout) and cached for 1 hour.
- If location is denied or the fetch fails, `condition` is `null`. The banner then shows "Weather offline" and no bonus applies. The app never falls back to a fake condition.

### Stat decay (`decay.ts`)
- Each stat records the last day it gained XP (`lastTrained`).
- After `DECAY_GRACE_DAYS` (3) idle days, it loses `DECAY_XP_PER_DAY` (5) XP per extra day, down to a floor of 0.
- `applyDecay` runs once when `ProfileProvider` mounts. It only charges days after `appliedThrough`, so reloads and StrictMode double effects are idempotent. Days are local calendar days.
- New users, and users upgrading from a version without decay, start with every stat trained "today", so there is no retroactive penalty.
- Losses are reported in one "Getting rusty" toast.

## AI chat (`src/app/api/chat/route.ts`)

**Request** (`POST /api/chat`)

```ts
{
  messages: { sender: "user" | "companion"; text: string }[]; // last 12 are used
  role: string | null;
  stats: Record<Stat, number>;
  weather: WeatherCondition | null;
  activeMissions: string[]; // titles, used to avoid duplicates
}
```

**Response**: `{ reply: string, missions: { title, description, rewardStat, rewardXp }[] }`, or `{ error }` with a non-200 status.

**How it works**
- **Model**: `gemini-flash-latest` with structured output (`responseSchema`), so the reply and mission list always come back as JSON.
- **System prompt**: persona + mission rules + context.
  - The persona is `COMPANION_PERSONA` from the environment, or the built-in Vesper persona.
  - The context block includes the role, each stat's XP and rank, today's weather bonus, and the active missions.
- **Output sanitizing**:
  - Unknown stats are dropped.
  - XP is clamped to 10-100 and rounded to a multiple of 10.
  - At most 5 missions are returned.
- **Client**: missions come back as proposals. Only the ones the user accepts are added through `addMission`.
- **Companion name**: shown in the UI from `NEXT_PUBLIC_COMPANION_NAME` (`src/lib/companion.ts`), default "Vesper".

**Known limitation**: Gemini sometimes returns 503 under load. The chat then shows an in-character error line. There is no retry yet.

## Testing

There is no test runner in the repo yet. Current practice:
- `npx tsc --noEmit`, `npm run lint` and `npm run build` must pass.
- UI flows are checked in a real browser (headless Chrome driven by puppeteer-core) by seeding `localStorage`, clicking through, and asserting on stored state.
- For weather, the Open-Meteo request is intercepted to force a condition.

## Roadmap

- Gemini retry and a fallback provider.
- Accounts and cloud sync (Firebase was used in the Flutter version).
- Squad (friends) features.
- The desktop three-pane layout from the design handoff.
