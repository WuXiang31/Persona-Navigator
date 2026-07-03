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
