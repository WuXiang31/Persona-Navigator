# Persona Navigator - Agent Rules

## Documentation Maintenance
Whenever developing a new feature or making architectural changes, you MUST update the `technical_overview.md` artifact to reflect those changes. 
Always document new data structures, algorithms, dependencies, or architectural patterns in that file to ensure the technical overview remains an accurate source of truth for the project.
Artifact path: `/Users/wx/.gemini/antigravity/brain/a489d495-75b8-415b-aa49-bd6db5230073/technical_overview.md`

## Feature Testing Requirement
Whenever implementing a new feature in this app, you MUST test it to ensure it works before moving on.
1. **Automated Testing:** Check if there are existing test files. If they exist, run them. If they do not exist, write them.
2. **Manual/UI Testing:** You must also test the UI visually using integration testing (`integration_test` package) to simulate moving the cursor, tapping buttons, and showing the flow to the user on their screen.
3. **Iteration:** If a test fails, you must debug it, fix the code, and test it again until it is fully working and good to go. Do not start implementing a new feature until the current one passes these tests.

## The 6-Part Development Lifecycle
All feature development must follow this strict 6-part pipeline. When possible, these phases should be delegated to specialized subagents:
1. **Planning:** Researching requirements, exploring the codebase, and creating the `implementation_plan.md` artifact.
2. **Design:** Defining the UI/UX aesthetics, layout, and visual assets (must match the Persona 5 style).
3. **Engineering:** Architecting the data models, state management (Riverpod), and logic.
4. **Implement (Developing):** Writing the actual Dart/Flutter code and assembling the UI components.
5. **Testing:** Writing and running automated unit and UI integration tests to verify functionality.
6. **Documentation:** Updating `technical_overview.md` and `walkthrough.md` with the new changes.

## Git Branching Strategy
Whenever implementing a new feature, you MUST create a new Git branch (e.g., `feature/<feature-name>`). 
All development, testing, and debugging must occur on this branch. 
Only after the feature is 100% complete and successfully tested by all agents should it be merged back into the `main` branch.
