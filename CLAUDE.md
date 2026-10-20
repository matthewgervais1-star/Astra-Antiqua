# Astra Antiqua

Ancient-astrology product with **three surfaces that share a domain**:

- **`web/`** — Next.js 16 + React 19 + TypeScript site. Domain data in `web/src/data/*.ts`, pure
  logic in `web/src/lib/*.ts`. Astronomy via the `astronomy-engine` npm package. Auth via
  `jose` + `bcryptjs`; storage via `better-sqlite3`. **Web is canonical** for content and rules.
- **`android/`** — Kotlin + Jetpack Compose app (Gradle KTS, KSP, Room, DataStore). Astronomy via
  the `cosinekitty/astronomy` JAR. Package root `com.astra.antiqua`, MVVM layout
  (`data/ domain/ model/ ui/ viewmodel/`).
- **`dotnet/`** — C# surface for iOS. `AstraAntiqua.Core` (netstandard2.0 + net8.0) holds the
  chart math and reads the shared JSON; golden tests in `AstraAntiqua.Core.Tests` pin it to
  parity with web's computed output. `AstraAntiqua.App` is the MAUI head — **not in the
  solution and not buildable on this Windows machine** (iOS needs macOS); it is built by
  `.github/workflows/ios.yml` on a macOS runner.

**`shared/content/*.json` is generated — never hand-edit it.** It is exported from the web data
by `cd web && npm run export:content` (golden fixtures: `npm run export:goldens`). Web and
Android still re-implement the same concepts by hand; when you change domain content on one
surface, check whether the others need the same change, and re-run the exporters so the C#
core sees it.

## Run / build

| Surface | Command |
|---------|---------|
| web     | `cd web && npm install && npm run dev`  (Next dev server, :3000) |
| android | open `android/` in Android Studio, or `cd android && ./gradlew compileDebugSources` |
| dotnet  | `cd dotnet && dotnet test`  (Core + parity tests; the MAUI head builds only in CI) |

If `java` isn't on PATH, point `JAVA_HOME` at the Android Studio JBR
(`C:/Program Files/Android/Android Studio/jbr`).

## Notes

- `android/local.properties` holds the machine-specific SDK path — git-ignored, never commit it.
- This repo is **self-contained**. It has no relationship to any other project under
  `L:\Claude Projects` (competency-tracker, clearance-delivery, etc.). Do not pull context from them.

## Session files and entry documents (added 2026-10-06)
- `HANDOFF.md` at the root is the state of play, printed by the user-level SessionStart hook. Where it contradicts an older line in this file or in any index, `HANDOFF.md` wins. It supersedes "storage via `better-sqlite3`" (accounts, charts and the wait list moved to Postgres on 2026-09-16), "`cd web && npm install && npm run dev`" and the `npm run export:content` and `npm run export:goldens` commands (the web tree uses pnpm). `web/README.md` env row `AUTH_DB_PATH` and its Deployment section are also superseded by `docs/deploy.md`.
- Entry documents, in order: `HANDOFF.md`, `CLAUDE.md`, `docs/deploy.md`, `docs/law25-checklist.md`, `docs/design/IMPLEMENTATION.md`, `docs/shared-content-model.md`.
- `_sessions/` holds exported transcripts, one file per session, named `_sessions/YYYY-MM-DD_<session-name>.txt` (run `/export` with that path). A transcript is a working record, never a source of truth; check the disk before acting on anything it says.
- `_sessions/` is listed in `.gitignore` because this repository pushes to GitHub; transcripts never leave this machine.
