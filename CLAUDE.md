# Astra Antiqua

Ancient-astrology product with **two independent surfaces that share a domain but no code**:

- **`web/`** — Next.js 16 + React 19 + TypeScript site. Domain data in `web/src/data/*.ts`, pure
  logic in `web/src/lib/*.ts`. Astronomy via the `astronomy-engine` npm package. Auth via
  `jose` + `bcryptjs`; storage via `better-sqlite3`.
- **`android/`** — Kotlin + Jetpack Compose app (Gradle KTS, KSP, Room, DataStore). Astronomy via
  the `cosinekitty/astronomy` JAR. Package root `com.astra.antiqua`, MVVM layout
  (`data/ domain/ model/ ui/ viewmodel/`).

The two surfaces re-implement the **same concepts** — zodiac signs, ancient cultures, deities,
oracle decrees, natal-chart math — each in its own language. They are kept in sync **by hand**.
When you change domain content on one surface, check whether the other needs the same change.

## Run / build

| Surface | Command |
|---------|---------|
| web     | `cd web && npm install && npm run dev`  (Next dev server, :3000) |
| android | open `android/` in Android Studio, or `cd android && ./gradlew compileDebugSources` |

If `java` isn't on PATH, point `JAVA_HOME` at the Android Studio JBR
(`C:/Program Files/Android/Android Studio/jbr`).

## Notes

- `android/local.properties` holds the machine-specific SDK path — git-ignored, never commit it.
- This repo is **self-contained**. It has no relationship to any other project under
  `L:\Claude Projects` (competency-tracker, clearance-delivery, etc.). Do not pull context from them.
