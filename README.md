# Persona Navigator

A gamified self-improvement app that turns real-life habits into an RPG. You level up five stats by completing missions, get bonus XP from today's weather, and chat with an AI navigator that turns your plans into missions.

The visual style is angular red/black/white with halftone textures. All characters, names and assets are original. See the IP notes in [`design/handoff/README.md`](design/handoff/README.md).

## Features

- **Five stats with ranks**: Knowledge, Vitality, Charm, Craft and Nerve. Each has 0-500 XP and one rank per 100 XP (Novice -> Apprentice -> Adept -> Expert -> Master). Stats are shown on a radar chart, with toasts for XP changes and rank-ups.
- **Missions**: create missions that reward a stat, then complete or undo them. Undo takes back exactly the XP that was granted.
- **Quick Log**: give +15 XP to a stat you just worked on.
- **Weather bonus**: missions for today's weather stat give ×1.5 XP. Weather comes from your location via [Open-Meteo](https://open-meteo.com/), which needs no API key.
- **Stat decay**: a stat that hasn't gained XP for 3 days loses 5 XP per extra day.
- **AI navigator chat** (Gemini):
  - Tell it your plans, and it proposes missions you can accept or pass.
  - It sees your stats, ranks, active missions and the weather, so it can suggest missions for weak stats.
  - Chat history persists across reloads.

All data lives in the browser's `localStorage`. There are no accounts or backend yet.

## Getting started

Requirements: Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey).

```bash
npm install
touch .env.local   # then fill it in, see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow location access if you want the weather bonus.

### Environment variables (`.env.local`)

```bash
GEMINI_API_KEY=your-key-here

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

## Project structure

```
src/
  app/
    page.tsx              Welcome screen
    role-select/          Choose a role
    (app)/home/           Status: radar chart, stat chips, active missions, Quick Log
    (app)/missions/       Weather banner, active missions, archive
    (app)/chat/           AI navigator chat
    api/chat/route.ts     Gemini call: reply + proposed missions
  components/             UI components (MissionCard, RadarChart, WeatherBanner, ...)
  context/                Profile (stats, XP, decay), Missions, Toasts
  lib/                    Game rules and helpers (progression, weather, decay, localStore)
docs/TECHNICAL_OVERVIEW.md  Architecture, data model and game formulas
design/handoff/             High-fidelity design reference (HTML prototypes, screenshots, videos)
design/brand/               App icon source (SVG/PNG) and exported iOS/macOS icon sets
archive/flutter_legacy/     Previous Flutter implementation, kept for reference only
```

## Documentation

- [Technical overview](docs/TECHNICAL_OVERVIEW.md): architecture, storage keys, game formulas and the chat API contract.
- [Design handoff](design/handoff/README.md): design tokens, screens, interactions and IP constraints.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · framer-motion · Gemini API · Open-Meteo
