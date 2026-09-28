# Persona Navigator

A gamified self-improvement app that turns real-life habits into an RPG. You level up five stats by completing missions, get bonus XP from today's weather, and chat with an AI navigator that turns your plans into missions.

The visual style is angular red/black/white with halftone textures. All characters, names and assets are original. See the IP notes in [`design/handoff/README.md`](design/handoff/README.md).

## Features

- **Personal mask** (Awakening): after signing up, answer four questions (age, what you do, what's going on lately, who you want to become). The AI navigator forges a mask made for you:
  - a name and a first-person identity statement; every finished mission is "a vote" for it;
  - two **focus stats** whose missions pay ×1.25 XP (stacks with the weather bonus);
  - 6-10 **routines**, repeatable missions that fit your life (e.g. for a CS student: ship a commit, solve a LeetCode problem, talk to a classmate, go for a walk). Add one to today's list with a tap on the Missions screen.
  You can rename it, swap focus stats, drop routines or reroll before equipping, and re-awaken any time from Status. Players who chose one of the original five roles keep that role's focus stats until they awaken.
- **Five stats with ranks**: Knowledge, Vitality, Charm, Craft and Nerve. Each has 0-500 XP and one rank per 100 XP (Novice -> Apprentice -> Adept -> Expert -> Master). Stats are shown on a radar chart, with toasts for XP changes and rank-ups.
- **Missions**: create missions with a target stat and an XP reward (10-60).
  - Tap a mission card to complete it, and tap it again to undo. Undo takes back exactly the XP that was granted.
  - **Select** mode completes several missions at once.
  - The × on a card deletes it.
- **Quick Log**: give +15 XP to a stat you just worked on.
- **Weather bonus**: missions for today's weather stat give ×1.5 XP (×1.875 if it is also a focus stat). Weather comes from your location via [Open-Meteo](https://open-meteo.com/), which needs no API key.
- **Stat decay**: a stat that hasn't gained XP for 3 days loses 5 XP per extra day.
- **AI navigator chat** (Gemini):
  - Tell it your plans, and it proposes missions you can accept or pass.
  - It sees your profile, mask, stats, ranks, active missions and the weather, so it can suggest missions that fit you, preferring your routines.
  - Chat history persists across reloads.
  - When Gemini is overloaded, the request is retried automatically and then falls back to a lighter model.

- **Accounts** (Clerk): sign up or log in with Google, an email code, or email and password before playing. Returning players skip onboarding and land straight on Status. The avatar button on Status opens account settings and sign-out, and **Change mask** re-runs the Awakening.

- **Cloud save** (Neon Postgres): your stats, missions, profile, mask and chat follow your account, so you can pick up on any device. Progress saved in a browser before accounts existed is uploaded on your first sign-in. Signing out removes the game data from that browser.

## Getting started

Requirements: Node.js 22+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
npm i -g vercel && vercel link   # link to the Vercel project
vercel env pull                  # writes Clerk + database keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow location access if you want the weather bonus.

### Environment variables (`.env.local`)

```bash
GEMINI_API_KEY=your-key-here

# Set by `vercel env pull` (from the Clerk and Neon integrations)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
DATABASE_URL=...

# Optional: Gemini models (these are the defaults; set the fallback to "none" to disable it)
GEMINI_MODEL=gemini-flash-latest
GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest

# Optional: swap the AI companion (defaults to Vesper, an original character)
NEXT_PUBLIC_COMPANION_NAME=Vesper
COMPANION_PERSONA="You are ... (tone, style, how to address the user)"
```

- `COMPANION_PERSONA` only sets the companion's personality. The mission-generation rules are always appended by [`src/app/api/chat/route.ts`](src/app/api/chat/route.ts).
- Restart `npm run dev` after changing `NEXT_PUBLIC_*` values.
- `.env.local` is gitignored, so never commit keys.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest), run once |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run db:generate` | Generate a SQL migration after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations to the Neon database |

GitHub Actions runs lint, type-check, tests and build on every push to `main` and on every pull request (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Deploying to Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub and choose **Add New... > Project**.
2. Import the `Persona-Navigator` repository. Vercel detects Next.js automatically, so keep the default build settings.
3. Under **Environment Variables**, add `GEMINI_API_KEY`. Add the optional variables above only if you need them.
4. Add Clerk and Neon from the Vercel Marketplace (`vercel integration add clerk`, `vercel integration add neon`). Their keys are added to every environment automatically. Turn on the sign-in methods (Google, email code, password) in the Clerk Dashboard.
5. Click **Deploy**. Every push to `main` redeploys automatically, and pull requests get preview URLs.

The site is served over HTTPS, which browsers require for location access (and therefore the weather bonus). A public deployment should keep the default Vesper companion; only set `NEXT_PUBLIC_COMPANION_NAME` / `COMPANION_PERSONA` for private use.

## Project structure

```
src/
  app/
    page.tsx              Welcome screen (sign up / log in)
    sign-in/, sign-up/    Clerk auth pages
    awakening/            Questionnaire -> AI-forged personal mask (review, then equip)
    role-select/          Redirects to /awakening (the old five-role picker)
    (app)/home/           Status: radar chart, stat chips, active missions, Quick Log
    (app)/missions/       Weather banner, active missions, archive
    (app)/chat/           AI navigator chat
    api/chat/route.ts     Gemini call: reply + proposed missions
    api/mask/route.ts     Gemini call: profile -> personal mask
    api/state/route.ts    Load and save the signed-in user's game data
  proxy.ts                Route protection (Clerk): sign-in required outside the welcome/auth pages
  components/             UI components (MissionCard, RadarChart, WeatherBanner, OverlayPanel, ...)
  context/                CloudSync (account save), Profile (stats, XP, decay), Missions, Toasts
  db/                     Drizzle schema and Postgres connection
  lib/                    Game rules and helpers (progression, weather, mask, decay, gemini, prompts, retry, localStore, cloudSync)
                          with unit tests next to them (*.test.ts)
docs/TECHNICAL_OVERVIEW.md  Architecture, data model and game formulas
design/handoff/             High-fidelity design reference (HTML prototypes, screenshots, videos)
design/brand/               App icon source (SVG/PNG) and exported iOS/macOS icon sets
archive/flutter_legacy/     Previous Flutter implementation, kept for reference only
```

## Documentation

- [Technical overview](docs/TECHNICAL_OVERVIEW.md): architecture, storage keys, game formulas and the chat API contract.
- [Design handoff](design/handoff/README.md): design tokens, screens, interactions and IP constraints.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · framer-motion · Clerk · Neon Postgres + Drizzle · Vitest · Gemini API · Open-Meteo
