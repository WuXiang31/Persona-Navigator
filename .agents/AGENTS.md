# Persona Navigator - Agent Rules

The app is a Next.js 16 (App Router) + React 19 + TypeScript project. The Flutter version in `archive/flutter_legacy/` is for reference only; don't add Dart code.

## Documentation Maintenance
Whenever developing a new feature or making architectural changes, you MUST update [`docs/TECHNICAL_OVERVIEW.md`](../docs/TECHNICAL_OVERVIEW.md) to reflect those changes, and the README when setup, features or environment variables change.
Always document new data structures, localStorage keys, algorithms/formulas, dependencies, or architectural patterns there so the technical overview remains an accurate source of truth for the project.

## Feature Testing Requirement
Whenever implementing a new feature in this app, you MUST test it to ensure it works before moving on.
1. **Static checks:** `npx tsc --noEmit` and `npm run lint` must pass; run `npm run build` for changes that affect routing or server code. CI runs all of these plus the tests on every pull request.
2. **Automated/UI testing:** Run `npm test` (Vitest). Add or update unit tests (`src/lib/*.test.ts`) for any game rule or helper you change. For UI changes, also verify the flow in a real browser (e.g. headless Chrome via puppeteer-core): seed `localStorage`, click through the UI, and assert on the resulting state. Mock external services (Gemini, Open-Meteo) when you need deterministic results.
3. **Iteration:** If a test fails, you must debug it, fix the code, and test it again until it is fully working and good to go. Do not start implementing a new feature until the current one passes these tests.

## The 6-Part Development Lifecycle
All feature development must follow this strict 6-part pipeline. When possible, these phases should be delegated to specialized subagents:
1. **Planning:** Researching requirements, exploring the codebase (including `design/handoff/`), and writing an implementation plan.
2. **Design:** Defining the UI/UX aesthetics, layout, and visual assets. Match the design handoff's angular red/black/white style, and keep all names, characters and copy original (see its IP constraint).
3. **Engineering:** Architecting the data models, state (React context + `createLocalStore` in `src/lib/localStore.ts`), and game logic in `src/lib/`.
4. **Implement (Developing):** Writing the TypeScript/React code and assembling the UI components (CSS Modules, framer-motion).
5. **Testing:** Running the checks and browser tests described above.
6. **Documentation:** Updating `docs/TECHNICAL_OVERVIEW.md` and the README with the new changes.

## Git Branching Strategy
Whenever implementing a new feature, you MUST create a new Git branch (e.g., `feature/<feature-name>`).
All development, testing, and debugging must occur on this branch.
Only after the feature is 100% complete and successfully tested by all agents should it be merged back into the `main` branch.
