# Technical Overview

This is the source of truth for how Persona Navigator works. Update it whenever you add a feature or change the architecture (see [`.agents/AGENTS.md`](../.agents/AGENTS.md)).

## Architecture

- **Framework**: Next.js 16 App Router, React 19 and TypeScript. Pages under `src/app/(app)/` share a layout with the bottom nav.
- **App state**: the game runs on `localStorage` as a synchronous local cache, and each account's copy is synced to Neon Postgres (see [Cloud sync](#cloud-sync)). Server code is two Route Handlers: `/api/chat` (keeps the Gemini key off the client) and `/api/state` (save data).
- **Accounts**: Clerk (see [Authentication](#authentication-clerk)). Every screen except the welcome and auth pages requires sign-in.
- **External services**:
  - Clerk (sign-up, sign-in, sessions) and Neon Postgres (save data), both provisioned through the Vercel Marketplace.
  - Gemini (`generativelanguage.googleapis.com`), called from `src/app/api/chat/route.ts`.
  - Open-Meteo (`api.open-meteo.com`), called directly from the browser. No key needed.

```
src/proxy.ts  clerkMiddleware: signed-out requests -> /sign-in (pages) or 401 (/api)
Browser
  ClerkProvider       session, <SignIn>/<SignUp>/<UserButton>
  ToastProvider
    CloudSyncProvider   load account save on sign-in, push local writes <---> /api/state <---> Neon
      ProfileProvider   role, profile, mask, stats, addXp, daily decay
        MissionProvider missions, complete/undo (weather-boosted XP)
          pages ---- POST /api/chat ----> Gemini
  useWeather() ---- geolocation + fetch ----> Open-Meteo
```

Providers are nested in `src/app/layout.tsx`. `MissionProvider` uses `useProfile().addXp`, and `ProfileProvider` uses `useToast()`, so the order matters. `CloudSyncProvider` must sit above `ProfileProvider`, because `ProfileProvider` charges stat decay on mount and must see the account's data, not stale local data.

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
| `persona_profile` | `PlayerProfile` | `ProfileContext` | Awakening answers (see [Personal masks](#personal-masks-maskts)) |
| `persona_mask` | `Mask` | `ProfileContext` | The personal mask; `null` until the player awakens one |
| `persona_log` | `XpEvent[]` | `ProfileContext` | Every XP change (missions, Quick Log, decay), last 3 months. Recaps are built from it. |
| `persona_chapter` | `Chapter` | `ProfileContext` | The month being played: number, start day, stats at the start |
| `persona_recaps` | `Recap[]` | `ProfileContext` | Finished chapters, newest first (max 24), with the navigator's summary once written |
| `persona_weather` | `{ condition, fetchedAt }` | `useWeather` | `condition` is `null` when location or the API is unavailable. Per device, not synced. |
| `persona_reminder_hour` | number | `useReminders` | Local hour this device reminds at. Per device, not synced. |
| `persona_lang` | `"en" \| "zh"` | `i18n.ts` | UI language chosen with the switch; absent = follow the device. Per device, not synced. |
| `persona_owner` | Clerk user ID | `CloudSyncProvider` | Which account the local game state belongs to. Not synced. |

### Cloud sync

Each account's save lives in Neon Postgres. The browser keeps working on `localStorage`, so every guarantee above (synchronous reads, no double XP) still holds.

- **Table** (`src/db/schema.ts`, Drizzle ORM): `user_state(user_id, key, value, updated_at)`, primary key `(user_id, key)`. `value` is the raw `localStorage` string, so each store's codec (JSON, or the bare role string) round-trips unchanged. Synced keys are listed in `SYNCED_KEYS` (`src/lib/cloudSync.ts`): role, stats, decay, missions, chat, profile, mask, log, chapter, recaps.
- **Connection** (`src/db/index.ts`): `pg` pool on the pooled `DATABASE_URL`, registered with `attachDatabasePool` from `@vercel/functions` for Fluid Compute.
- **API** (`src/app/api/state/route.ts`, Clerk-authenticated; signed out -> 401):
  - `GET` -> `{ entries: { key: rawValue } }` for the signed-in user.
  - `PUT { changes: { key: rawValue | null } }` -> upserts values and deletes keys set to `null`, in one transaction. Unknown keys and values over 200 000 characters are rejected with 400.
- **Sign-in** (`CloudSyncProvider`, `src/context/CloudSyncContext.tsx`): the app renders nothing until the account's save is loaded. `planHydration` decides what to load:
  - the account has cloud data -> replace local state with it;
  - no cloud data, and the local data has no owner (saved before accounts) or is the same user's -> upload it (first-sign-in import);
  - otherwise -> start empty, so one account never inherits another's local data.
  After loading, `persona_owner` is set and `refreshStores()` re-notifies every store.
- **Writes**: `createLocalStore().set` reports each write through `onStoreWrite`. React runs child effects before parent effects, so providers can write on mount (monthly rollover, stat decay) before the listener exists; when it starts, it also queues every key whose local value differs from the snapshot just loaded. Changes are batched per key and pushed 500 ms later, and flushed immediately (with `keepalive`) when the tab is hidden or closed. A failed push is retried after 5 s without losing newer writes.
- **Sign-out**: the synced keys and `persona_owner` are removed from the browser.
- **Conflicts**: last write wins per key. Playing on two devices at the same moment can overwrite one side's change.
- **Load failure**: a RETRY screen is shown instead of the app, so an empty local state is never pushed over the cloud copy.
- **Migrations** (Drizzle Kit, `drizzle/`): edit `src/db/schema.ts`, run `npm run db:generate`, commit the SQL, then run `npm run db:migrate`. `drizzle.config.ts` uses `DATABASE_URL_UNPOOLED`, because migrations need a direct connection.

## Daily reminders (PWA + Web Push)

- **Installable app**: `src/app/manifest.ts` (standalone, starts at `/home`, icons in `public/` made from `design/brand/app_icon.png`), `src/app/apple-icon.png`, and `appleWebApp` metadata in the root layout. iOS only allows Web Push for apps added to the home screen (16.4+).
- **Service worker** (`public/sw.js`, served with no-cache headers from `next.config.ts`): shows pushed notifications (one `daily-reminder` tag, so a newer one replaces an unread one) and opens or focuses the app on tap.
- **Opting in** (`useReminders`, `ReminderPanel`, the bell on Status): the tap asks for notification permission, registers `/sw.js`, subscribes with `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, and `PUT /api/push` saves the subscription with the device's IANA time zone, the chosen hour (06:00-23:00, default 20:00) and the UI language. Turning it off deletes the row and unsubscribes. SEND A TEST calls `POST /api/push`. On iPhone outside the home screen the panel explains how to add the app; with permission denied it explains how to allow it.
- **Table** `push_subscriptions(endpoint PK, user_id, p256dh, auth, time_zone, hour, lang, last_sent_day, created_at)`, one row per device. Changing the hour clears `last_sent_day`.
- **Schedule**: Vercel Hobby cron jobs may run at most once a day, with ±59 min precision, but a project may have 100. `vercel.json` therefore defines 24 daily jobs (`0 H * * *`, paths `/api/push/cron?h=H`), one per UTC hour. `/api/push/cron` checks `Authorization: Bearer CRON_SECRET` and is public in `src/proxy.ts`.
- **Who gets a reminder** (`src/lib/reminders.ts`): a device is due when its local hour is in `[hour, hour + 3)` and `last_sent_day` is not today (local). If the player's `persona_log` (read from `user_state`) already has a mission completed on that local day, the reminder is skipped. Either way `last_sent_day` is set, so at most one reminder a day. A failed send is retried next hour; 404/410 from the push service deletes the subscription.
- **Text**: `MESSAGES[lang].reminder.notifyTitle/notifyBody`, naming the mask when there is one ("No votes for {mask} yet today. One small mission is enough."). The catalog lives in `src/lib/messages.ts` (pure data) so API routes can import it; `i18n.ts` adds the React hooks.
- **Sign-out** unsubscribes the device, so the previous account's reminders stop.
- **Env**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET` (set in all Vercel environments); optional `VAPID_SUBJECT` (defaults to the production URL).

## Languages (`src/lib/i18n.ts`)

- **Messages**: one `en` object holds all UI copy (strings, plus functions for interpolated text such as `chapterDay(n, day, days)`); `zh` is typed `Messages = typeof en`, so a missing key is a type error. `i18n.test.ts` also compares every leaf key (including the `Record` maps for questionnaire options) and checks every option and rank is covered.
- **Choosing**: `persona_lang` if set, else the device (`navigator.languages` starting with `zh` -> Chinese). Server render and hydration always use English, and `useIsClient` switches to the device language right after, so there is no hydration mismatch.
- **Reading**: components call `useT()` (and `useLang()` for date locales); code outside render (toasts in callbacks and effects) calls `messages()`, which reads the language at call time.
- **Switch**: `LangToggle` on the welcome and Status screens.
- **Clerk**: `ClerkProvider` lives in the client component `AuthProvider`, which passes `zhCN` from `@clerk/localizations` and sets `<html lang>`.
- **Game terms in Chinese**: stats 知识 / 体魄 / 魅力 / 技艺 / 胆识; ranks 新手 / 学徒 / 熟练 / 专家 / 大师. Ranks in recaps are stored by English name and shown via `RANK_NAMES` index.
- **AI output**: the awakening and recap pages send `lang`, and `writingLanguage` uses it when the player's own words don't reveal a language. Chat already replies in the language the user writes in.

## Game rules

All tunable constants live in `src/lib/`.

### Stats and ranks (`progression.ts`)
- Stats: `knowledge`, `vitality`, `charm`, `craft`, `nerve`, each clamped to `0..MAX_STAT` (500).
- Rank index is `min(4, floor(xp / 100))`, which maps to Novice, Apprentice, Adept, Expert, Master.
- `addXp(stat, xp)` clamps the result and returns the change actually applied. It shows an XP toast, and a delayed (900 ms) "Rank up!" toast when the rank index increases.

### Missions (`MissionContext.tsx`)
- `completeMission` grants `missionXp(rewardXp, stat, weather, mask)` (weather ×1.5 and focus ×1.25 multiply, then round) and stores the applied amount as `awardedXp`. With a personal mask it also shows an "A vote for {mask}" toast (skipped when `quiet`).
- `uncompleteMission` subtracts `awardedXp`, so undo is exact even when the stat was capped or boosted.
- Quick Log grants `QUICK_LOG_XP` (15) to a chosen stat.
- `addXp(stat, xp, { quiet })` and `completeMission(id, { quiet })`: `quiet` skips the per-change XP toast. Rank-up toasts still show. Multi-select uses it to show a single "N missions cleared +X XP" toast.

### Missions UI
Mission cards follow the design handoff:
- **Toggle**: tapping a card completes it, and tapping again reopens it (`uncompleteMission`). A completed card is struck through and stamped COMPLETE.
- **Delete**: the × in the corner deletes the mission. It is hidden in select mode.
- **Left edge color**: red = normal, gold = boosted (weather or focus stat, XP shows ⚡), gray = done, gold with a tinted background = selected.
- **Select mode** (Missions page): tapping selects active missions. The bar shows the count and the combined weather-boosted XP, and COMPLETE clears them all.
- **New missions**: name, target stat, and XP from a 10-60 slider in steps of 5. AI-proposed missions can still carry 10-100 XP and a description.
- **Home screen** keeps its original layout (speech bubble, case file radar, stat chips, weather banner, active targets with + ADD, Quick Log). Only its mission cards use the redesigned `MissionCard`.
- **Shared constants**: stat glyphs (◆ ▲ ★ ⬢ ⚡) and 3-letter codes live in `STAT_GLYPHS` / `STAT_SHORT` in `progression.ts`.
- **Overlays**: Quick Log and New Mission share the `OverlayPanel` component.

### Personal masks (`mask.ts`)

The five preset roles were replaced by a mask generated for each player.

- **Awakening** (`src/app/awakening/`): four steps (age range, occupation + detail, situations multi-select + free text, aspiration), then `POST /api/mask`, then a review screen where the name, identity and focus stats can be edited and routines removed. REROLL asks again; EQUIP saves `persona_profile` and `persona_mask` and goes to `/home`. Re-entering prefills the saved answers. The questionnaire tells players their answers go to Gemini.
- **Types**: `PlayerProfile { ageRange, occupation, occupationDetail, situations[], aspiration }` (option ids in `AGE_RANGES`, `OCCUPATIONS`, `SITUATIONS`); `Mask { name, identity, focusStats: [Stat, Stat], routines: ProposedMission[], equippedAt }`.
- **Focus bonus**: `FOCUS_BOOST` = 1.25 for missions whose stat is one of `mask.focusStats`. `missionXp` applies it with the weather bonus; the Missions select total and `MissionCard` use the same function, so shown XP always equals granted XP.
- **Routines**: shown as one-tap chips on the Missions page; tapping adds the routine as a normal mission. A chip is disabled while an active mission with the same title exists.
- **Legacy roles**: players with a `persona_role` but no mask get `legacyMask(role)`, the old role's name, a one-line identity and its focus stats (e.g. athlete -> vitality + nerve), with no routines. Status invites them to "Awaken your personal mask". `useProfile().mask` is the personal mask or this fallback; `hasPersonalMask` tells them apart.
- **Validation**: `sanitizeProfile` (known ids, trimmed text ≤ 200 chars, ≤ 12 situations) and `sanitizeMask` (name ≤ 40, identity ≤ 160, two distinct valid focus stats, routines through `sanitizeMissions` capped at `MAX_ROUTINES` = 10).
- `/role-select` now redirects to `/awakening`.

### Chapters and recaps (`chapter.ts`)

A chapter is one calendar month. When it ends, the player gets a recap and closing words from the navigator.

- **XP log**: `addXp(stat, xp, { event })` appends an `XpEvent { t, stat, xp, kind, missionId?, title?, routine?, weather? }` for missions and Quick Log; decay appends negative `decay` events. Undoing a mission removes its event (`unlogMission`). Missions added from routine chips carry `routine: true`. The log keeps the current month and the two before it (`pruneLog`).
- **Rollover** (`planRollover`, run on mount in `ProfileProvider`, before decay): with no chapter, start chapter 1 today; in a new month, close the old chapter with `buildRecap` and start the next one on the 1st with the current stats as its starting point. The recap therefore appears the first time the app is opened in a new month. A player's first chapter starts the day chapters first ran.
- **Recap** (`buildRecap`, pure): per-stat start/end/gained/decay lost/rank change, missions cleared (and how many were routines), Quick Logs, active days, longest daily streak, top 3 repeated missions, routines never done, most improved and least trained stat, missions per time of day (morning 5-12, afternoon 12-17, evening 17-22, night 22-5) and the favorite one, weather-boosted count, and a snapshot of the mask.
- **Recap page** (`src/app/recap/[month]/`, full screen, no bottom nav): opening it marks it seen; the first time, it calls `/api/recap` and saves the summary into the recap. RE-AWAKEN goes to `/awakening`, NEXT CHAPTER to `/home`.
- **Status**: an unread recap shows a "Chapter N clear · View your recap" banner; otherwise "Chapter N · Day d/D" (plus "Ends tonight" on the last day) and an "All chapters" link.
- **Chapters page** (`src/app/(app)/chapters/`): the chapter in progress, summarized so far by running `buildRecap` on the current month (votes, active days, best streak), then every finished chapter, newest first, as a card (month, mask, dates, votes, streak, most improved stat, rank-ups, a NEW tag while unread, and the first lines of the navigator's words). Cards open `/recap/[month]`, which links back with "All chapters".

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

## Authentication (Clerk)

- **Setup**: Clerk was added with `vercel integration add clerk`, which sets `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` for Production, Preview and Development. Locally, `vercel env pull` writes them to `.env.local`. The build does not need the keys, so CI runs without them.
- **Route protection** (`src/proxy.ts`, the Next.js 16 name for middleware):
  - Public: `/`, `/sign-in/*`, `/sign-up/*`.
  - Pages: signed-out visitors are redirected to `/sign-in?redirect_url=...`. The proxy passes `signInUrl`, so the redirect goes to our page, not Clerk's hosted portal.
  - `/api/*`: signed-out calls get `401 { error: "Sign in required" }` instead of a redirect.
- **Pages**: `src/app/sign-in/[[...sign-in]]` and `src/app/sign-up/[[...sign-up]]` render Clerk's `<SignIn>` / `<SignUp>` inside a shared frame (`src/app/auth.module.css`).
- **Redirects** (props on `ClerkProvider` in `src/app/layout.tsx`): after sign-up -> `/awakening`, after sign-in -> `/home`, after sign-out -> `/`.
- **Welcome screen**: signed-in players with a mask (personal or legacy role) are sent straight to `/home`. Otherwise BEGIN goes to `/sign-up` (signed out) or `/awakening` (signed in), and a LOG IN link is shown to signed-out visitors.
- **Status screen**: `<UserButton>` in the header opens account settings and sign-out. The speech bubble shows the mask name and identity, and "Change mask" (or "Awaken your personal mask") links to `/awakening`.
- **Theme**: `appearance.variables` on `ClerkProvider` match the red/black/white tokens in `globals.css`.
- **Sign-in methods** (Google, email code, email + password) are configured in the Clerk Dashboard, not in code.

## AI chat (`src/app/api/chat/route.ts`)

**Request** (`POST /api/chat`)

```ts
{
  messages: { sender: "user" | "companion"; text: string }[]; // last 12 are used
  role: string | null;          // legacy role, used only when there is no mask
  profile: PlayerProfile | null;
  mask: Mask | null;
  stats: Record<Stat, number>;
  weather: WeatherCondition | null;
  activeMissions: string[]; // titles, used to avoid duplicates
}
```

**Response**: `{ reply: string, missions: { title, description, rewardStat, rewardXp }[] }`, or `{ error }` with a non-200 status.

**How it works**
- **Model**: `GEMINI_MODEL` (default `gemini-flash-latest`) with structured output (`responseSchema`), so the reply and mission list always come back as JSON.
- **Retries and fallback** (`src/lib/retry.ts`):
  - `fetchWithRetry` retries network errors and 429/500/502/503/504 with exponential backoff (800 ms, then 1.6 s), honoring `Retry-After` up to 4 s.
  - The main model gets 1 retry. If it is still unavailable, the request moves to `GEMINI_FALLBACK_MODEL` (default `gemini-flash-lite-latest`, 2 retries). Set it to `none` to disable the fallback.
  - The route sets `maxDuration = 60` so retries fit within the serverless time limit.
- **System prompt**: persona + mission rules + context.
  - The persona is `COMPANION_PERSONA` from the environment, or the built-in Vesper persona.
  - The context block includes the profile, the mask (name, identity, focus stats, routines) or else the legacy role, each stat's XP and rank, today's weather bonus, and the active missions. The prompt asks the navigator to prefer routines and to frame encouragement around the identity.
  - The Gemini call (structured output, retries, fallback model) is shared with `/api/mask` through `generateJson` in `src/lib/gemini.ts`; the persona and mission rules live in `src/lib/prompts.ts`.
- **Output sanitizing** (`sanitizeMissions` in `src/lib/missionProposals.ts`):
  - Unknown stats are dropped.
  - XP is clamped to 10-100 and rounded to a multiple of 10.
  - At most 5 missions are returned.
- **Client**: missions come back as proposals. Only the ones the user accepts are added through `addMission`.
- **Companion name**: shown in the UI from `NEXT_PUBLIC_COMPANION_NAME` (`src/lib/companion.ts`), default "Vesper".
- **Chat UI**: the original skewed bubbles. "{name} is typing..." shows while a reply is pending, and sending is disabled until the reply arrives.

If every attempt fails, the API returns the last error status and the chat shows an in-character error line.

Of the models listed for this key, `gemini-2.5-flash` and `gemini-2.5-flash-lite` return 404. Check a model with the ListModels API and a test call before configuring it.

## Mask generation (`src/app/api/mask/route.ts`)

**Request** (`POST /api/mask`, signed in): `{ profile: PlayerProfile }`. An invalid profile gets 400.

**Response**: `{ mask: Mask }`, or `{ error }` (502 when the output has no usable name or routines).

- The prompt asks for a 2-4 word original name, a first-person identity grounded in the aspiration, the two most relevant focus stats, and 6-10 small, safe, repeatable routines that fit the player's life. Routines must cover the focus stats most, plus at least one vitality and one charm mission. They follow the same `MISSION_RULES` as chat proposals.
- Every field is written in the player's language. `writingLanguage` detects Chinese, Japanese or Korean in the player's own words and states it explicitly, because the model (or a custom persona) tends to drift back to English.
- Temperature 0.9, so REROLL gives a different mask.

## Recap summary (`src/app/api/recap/route.ts`)

**Request** (`POST /api/recap`, signed in): `{ recap: Recap, profile?: PlayerProfile }`. **Response**: `{ summary }`, or `{ error }`.

- The navigator sets its usual teasing aside and writes 4-6 warm sentences, like a companion at the end of an arc: honor specific efforts from the numbers, invite the player to look back and thank the self who kept trying, mention untouched things softly as something for the next chapter, and tie it to the chosen identity.
- The language comes from `writingLanguage` (profile answers plus the mask's name and identity).

## Testing

- **Reminders**: time-zone day/hour, the due window, once-a-day, and "played today" detection (`reminders.test.ts`).

- **Unit tests**: Vitest (`npm test`). Test files sit next to the code as `src/lib/*.test.ts` and cover:
  - ranks and stat clamping
  - WMO code mapping and the weather bonus
  - decay (grace period, per-stat tracking, idempotence, month boundaries)
  - mission sanitizing
  - retry/backoff
  - the localStorage store, including the `onStoreWrite` / `refreshStores` sync hooks
  - cloud sync hydration rules (`planHydration`)
  - masks: `missionXp` (focus × weather, rounding), focus-stat, mask and profile sanitizing, legacy role presets, language detection
  - chapters: month helpers, streaks, time-of-day buckets, log pruning, every recap statistic, rollover
- **Environments**: tests run in Node by default. A file that needs the DOM opts in with a `/** @vitest-environment jsdom */` docblock. The `@/` alias comes from `resolve.tsconfigPaths` in `vitest.config.mts`.
- **CI**: `.github/workflows/ci.yml` runs lint, `tsc --noEmit`, tests and build on pushes to `main` and on pull requests.
- **UI flows**: checked in a real browser (headless Chrome driven by puppeteer-core) by seeding `localStorage`, clicking through, and asserting on stored state. For weather, the Open-Meteo request is intercepted to force a condition.
- **ESLint**: ignores `archive/` and `design/`, which are reference material, not app code.

## Roadmap

- Squad (friends) features, and sharing a recap as an image.
- The desktop three-pane layout from the design handoff.
