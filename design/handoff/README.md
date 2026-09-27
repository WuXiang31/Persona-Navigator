# Handoff: Persona Navigator

## Overview
Persona Navigator is a gamified self-improvement app with a "stylish rebellion" aesthetic (angular red/black/white, halftone textures, kinetic bold type). It turns real-life habits into an RPG: users level up five stats, complete weather-boosted daily missions, and chat with **Vesper**, an AI navigator companion (an original masked-fox-spirit character — NOT Morgana or any Persona-series asset).

This bundle contains **two design references**:
- **Mobile** (iOS/portrait) — onboarding → role select → home (Status) → missions → Vesper chat.
- **Desktop** (macOS) — a three-pane dashboard: sidebar nav, main Status/Missions panel, and a permanently docked Vesper chat.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, **not production code to ship directly**. The task is to **recreate these designs in the target codebase** (per the project brief: **Flutter** for iOS/macOS, or **React Native / Next.js** if that's the chosen stack) using that environment's established patterns, component library, and styling system. The HTML/inline-CSS here is a spec of pixels and behavior, not an implementation to port line-by-line.

## Fidelity
**High-fidelity.** Colors, typography, spacing, angles, and interactions are final and intentional. Recreate the UI faithfully — especially the skew angles, hard drop shadows, and clip-path shapes, which carry the whole aesthetic.

## ⚠️ IP / Originality Constraint (read first)
This design is *inspired by* the Persona 5 vibe but must remain **legally original**. Do NOT introduce, in code or assets:
- The name/likeness of **Morgana** or any Persona character. The companion is **Vesper**, an original masked fox spirit.
- Persona's exact stat **rank names** (e.g. "Erudite", "Badass"). We use original ranks: **Novice → Apprentice → Adept → Expert → Master**.
- Persona's exact stat names. We use: **Knowledge, Vitality, Charm, Craft, Nerve**.
- Any ripped fonts, logos, UI sprites, or artwork from the game.
Keep the *aesthetic language* (angular, high-contrast, halftone) but all names, copy, characters, and assets stay original.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Primary Red | `#E50000` | CTAs, active states, Vesper bubbles, accents |
| Red (hover) | `#FF1A1A` | Button hover |
| Red (dark) | `#B00000` | Radar stroke on light card |
| Background | `#111111` | Main app background |
| Surface | `#1E1E1E` | Cards, elevated rows |
| Surface (alt) | `#262626` | Hover / secondary rows |
| Deep black | `#000000` / `#0A0A0A` | Nav bars, titlebar, sidebar, bar tracks |
| Off-white | `#F2F2F2` | Primary text, white buttons, user chat bubbles |
| Muted | `#888888` | Secondary labels |
| Faint | `#555555` | Footnotes |
| Accent Yellow | `#FFD700` | XP toasts, weather-bonus highlights, Rank 5 |
| Velvet (onboarding bg) | `#0A0F2E` | Welcome screen |
| Velvet stripe/accent | `#2B3A8F` / `#55AAFF` | Welcome diagonal stripes, Rank 2 |

### Rank colors (index 0→4 = Rank 1→5)
`#888888` (Novice) · `#55AAFF` (Apprentice) · `#55FF55` (Adept) · `#FF8800` (Expert) · `#FFD700` (Master)

### Typography
- **Display / headlines:** `Anybody`, weight **900**, **italic**, uppercase, letter-spacing 1–3px. Used for all big titles, buttons, stamps, logo. (Google Fonts — substitute a comparable heavy condensed-ish italic if unavailable.)
- **Body / UI:** `Outfit`, weights 500–800. Labels are uppercase, bold, tracked ~1.5px.

### Geometry (the core of the look)
- **Skew:** most interactive containers use `transform: skewX(-6deg to -8deg)`; some also add a small `rotate(-1deg to -3deg)`. Text inside skewed boxes is left un-skewed by living in a child (or is short enough not to matter).
- **No border-radius** anywhere except the OS window chrome and traffic-light dots.
- **Hard drop shadows:** offset solid shadows, no blur — e.g. `box-shadow: 4px 4px 0 #000` or `12px 12px 0 rgba(229,0,0,0.85)`. These replace soft elevation.
- **Speech bubbles** use a jagged `clip-path: polygon(2% 4%, 98% 0%, 100% 50%, 97% 97%, 4% 100%, 0% 92%)`.
- **Torn "case file" card** uses `clip-path: polygon(0% 2%, 4% 0%, 96% 1%, 100% 5%, 99% 95%, 95% 100%, 5% 99%, 0% 96%)`.
- **Halftone texture:** `background-image: radial-gradient(rgba(0,0,0,0.28) 1.6px, transparent 1.6px); background-size: 11px 11px;`
- **Diagonal stripe texture:** `repeating-linear-gradient(-55deg, rgba(...) 0 3px, transparent 3px 26px)`.
- **Slash divider:** an 8–9px-tall red bar with `transform: skewX(-30deg)` next to titles.

### Spacing
Screen padding 20–30px. Card padding 11–18px. Gaps between stacked cards 11–14px. Nav items padded 9–16px.

---

## Game Data Model

### Stats (5)
Each stat holds `xp` (0–500) and derives a **rank 1–5** via `rank = min(5, floor(xp / 100) + 1)`. Bar fill % = `xp / 5`.

| Key | Display | Glyph | Boosted by |
|---|---|---|---|
| knowledge | KNOWLEDGE | ◆ | studying, reading, learning |
| vitality | VITALITY | ▲ | fitness, sleep, nutrition |
| charm | CHARM | ★ | social, networking |
| craft | CRAFT | ⬢ | technical skills, making |
| nerve | NERVE | ⚡ | facing fears, initiative |

Rank names (1→5): **NOVICE, APPRENTICE, ADEPT, EXPERT, MASTER**.

### Weather → bonus stat (×1.5 XP on matching missions)
| Condition | Label | Bonus stat | Banner bg / fg |
|---|---|---|---|
| clear | ☀ CLEAR | CHARM | `#E50000` / `#fff` |
| rainy | ☂ RAINY | KNOWLEDGE | `#F2F2F2` / `#111` |
| cloudy | ☁ CLOUDY | CRAFT | `#F2F2F2` / `#111` |
| snowy | ❄ SNOWY | NERVE | `#A8D8FF` / `#111` |
| storm | ⚡ STORM | ALL | `#3A1F6E` / `#fff` |

`boost = (weather.bonus === 'ALL' || weather.bonus === stat) ? 1.5 : 1`. Displayed gain = `round(baseXp * boost)`; a ⚡ marker + yellow color flags boosted quests. In production, `weather` comes from a real weather API keyed on GPS (Phase 2).

### Roles (onboarding)
Five selectable "masks": The Scholar (I), The Professional (II), The Creative (III), The Athlete (IV), The Explorer (V). Selecting expands an inline description; Confirm advances to Home. Role tunes which stats are emphasized (copy only in this prototype).

---

## Screens / Views

### MOBILE (see `Navigator App.dc.html`, size 402×874)

**1. Welcome (Velvet)** — `#0A0F2E` bg with diagonal stripe + dot textures. Kicker "WELCOME TO THE THRESHOLD" (`#55AAFF`), giant italic title "PERSONA NAVIGATOR", two skewed tagline chips (white, then red), and a large skewed **BEGIN** button (`#E50000`, `8px 8px 0 #000` shadow, rotate -2deg). Tap → Role select.

**2. Role Select** — Title "CHOOSE YOUR MASK". Vertical list of 5 skewed cards; each has a numeral chip + role name. Tapping selects (card turns red, border red) and reveals its description. A **CONFIRM** button appears once a role is chosen → Home + "MASK EQUIPPED" toast.

**3. Home / Status** — Three visual variants exist (selectable via the `variant` prop): `slash`, `halftone`, `dossier`, and **`hybrid` (the approved direction)**.
- **Hybrid (approved):** Red halftone header panel (clip-path angled bottom edge) containing Vesper avatar (skewed black square, red "V") + a jagged speech bubble (tap → chat) + "STATUS" title. Below: the torn white **Case File** radar card (rotated -2deg, red hard shadow) showing a pentagon radar of the 5 stats. Below that: a row of skewed stat chips (short name + rank #).
- Radar: pentagon, 5 concentric rings, value polygon `fill rgba(229,0,0,0.5) stroke #B00000`. Axis labels are stat name + rank name.
- Bottom: two skewed action buttons — **QUICK LOG** (red) opens the log overlay; **MISSIONS** (white) → Missions.

**4. Missions** — Skewed weather banner up top (color per table). Giant "MISSIONS" title with slash divider. List of quest cards (skewed, left red/gold accent border): checkbox, title, stat glyph+name, XP reward (gold + ⚡ if boosted). Tapping toggles complete → strikethrough + rotated "COMPLETE" stamp, and applies/removes XP with a toast.

**5. Vesper Chat** — "VESPER / NAVIGATOR ONLINE" header. Message list of jagged speech bubbles: **Vesper** left-aligned red bubble with red "V" avatar; **user** right-aligned white bubble with white "ME" avatar. Skewed text input + red **SEND**. A pulsing red "…" bubble shows while awaiting a reply. Replies come from the LLM with full context (see State/AI below).

**Bottom nav** (on Home/Missions/Chat): three skewed items HOME · MISSIONS · CHAT; active is red.

### DESKTOP / macOS (see `Navigator Desktop.dc.html`, size 1180×760)
Dark rounded window (`border-radius: 12px`) with a black titlebar: traffic-light dots (`#FF5F57/#FEBC2E/#28C840`), "PERSONA NAVIGATOR" wordmark, right-aligned date. Three panes:
- **Sidebar (210px):** Vesper logo lockup; skewed nav (STATUS / MISSIONS, active = red with hard shadow); pinned at bottom: weather chip + QUICK LOG button.
- **Main panel:** STATUS view = Case File radar card (360px) beside a column of full stat bars. MISSIONS view = 2-column grid of the same quest cards.
- **Chat dock (340px, always visible):** Vesper header with green online dot, scrolling avatared bubble list, input + SEND pinned at bottom.
- Quick Log overlay and XP toast (top-right) are shared.

---

## Interactions & Behavior
- **Navigation:** mobile uses screen state (`welcome → role → home/missions/chat`) + bottom nav; desktop swaps only the main panel (`home`/`missions`), chat is persistent.
- **Quest toggle:** completing adds `round(xp*boost)` to the stat and fires a toast; un-completing subtracts it. Stat clamped 0–500.
- **Quick Log:** overlay; each stat row grants +15 XP and a toast.
- **Rank-up:** if a stat crosses a 100-XP boundary, a delayed (~900ms) "RANK UP!" toast fires.
- **XP toast:** yellow skewed chip, `navToastIn` pop animation (scale 1.5→1, 0.18s), auto-dismiss ~1.8s.
- **Chat:** Enter or SEND submits; disabled while a request is in flight; pulsing "…" indicator; list auto-scrolls to bottom on update; network error inserts an in-character fallback line.
- **Hover:** buttons lighten to `#FF1A1A` / `#fff`; cards lighten surface; shadows may tighten.

## State Management
Per-instance state: `screen`, `selectedRole` (mobile), `stats {5 keys}`, `quests [{id,title,stat,xp,done}]`, `showLog`, `toast`, `chatMsgs [{from:'u'|'v', text}]`, `chatInput`, `thinking`. In production, persist stats/quests/chat to backend with real-time sync (Squad features, Phase 3), and source `weather` + quest generation from APIs.

## AI Companion (Vesper)
Prototype calls an LLM completion with a **system prompt** that injects live context and returns a ≤45-word in-character reply. Reproduce this pattern with your chosen provider (brief specifies **Gemini**):
- System prompt establishes Vesper as an original masked fox spirit, sets personality (sassy / encouraging / concerned — a `personality` prop in the prototype), forbids "pet" framing, and appends: current stats (rank + xp each), today's weather + bonus stat, and the mission list with done/open flags.
- Messages array = full chat history mapped to user/assistant roles.
- On error, show a short in-character fallback rather than a raw error.

## Assets
No external image assets — everything is CSS/SVG (radar is inline SVG; textures are CSS gradients; avatars are styled letter tiles). Fonts: **Anybody** + **Outfit** (Google Fonts). Glyphs are Unicode symbols (◆ ▲ ★ ⬢ ⚡). Replace the letter-tile avatars with a real original Vesper mascot illustration when available (Phase 3).

## Files
- `Navigator App.dc.html` — mobile prototype (all screens + 4 home variants; `hybrid` is approved). Wrapped in an iOS device frame.
- `Navigator Desktop.dc.html` — macOS desktop dashboard.
- `Persona Navigator.dc.html` — the option-comparison canvas (context only; shows variants side by side).
- `ios-frame.jsx`, `macos-window.jsx`, `support.js` — prototype runtime/frames (reference only; do not port).

---

## Changelog / Features to implement (latest)
These interactions were added after the initial spec and are present in the current design files:

**Missions — Add mission (mobile + desktop):** A dashed red "+" tile (mobile: at the end of the list; desktop: in the grid) opens a create sheet. Fields: mission name (text), target stat (one of the 5, chip picker), XP reward (10–60 slider, step 5). New missions append to the list, respect the weather ×1.5 bonus, and are completable like defaults. The ADD button is disabled (dimmed) until a name is entered.

**Missions — Multi-select (mobile + desktop):** A checklist-icon toggle (labeled SELECT) sits by the Missions title. In select mode, tapping a card toggles selection (gold checkbox + gold left edge + tinted bg) instead of completing it. A bar shows selected count and combined XP (weather bonus included) with a COMPLETE action that marks all selected done at once and fires a "N missions cleared" toast. The toggle flips to DONE; a CANCEL clears selection and exits. Icon = two rows of checkmark+line (see SVG in the files).

**Desktop — Collapsible chat dock:** The right-hand Vesper chat panel collapses via a "›" button in its header down to a thin 46px vertical rail (V avatar + vertical "VESPER" + online dot + "‹"). Clicking the rail reopens it. The main panel widens to fill the freed space while collapsed. Default state: open.

