# Android Rollout Plan

Bringing `android/` in line with the rebuilt web surface. Written against a full
survey of the Kotlin tree (33 files, one `:app` module, `app/src/main` only).

**Read first:** [shared-content-model.md](shared-content-model.md) for the
web/Android divergence list, and [design/handoff/README.md](design/handoff/README.md)
for the visual identity Android is being brought onto.

## How to use this document

Each phase has a **prompt** to paste into Claude Code opened at
`L:\Claude Projects\astra-antiqua` (not at `android/`, so the assistant can read
`web/src` for the source of truth). Run Android Studio alongside for the build,
the emulator, and Compose previews.

Phases are ordered by dependency, not by appeal. Phases 0 and 1 are unglamorous
and must come first: they exist because the expansion this rollout is for would
otherwise fail silently in production copy.

**Gate discipline:** every phase ends with `./gradlew assembleDebug` green plus
its own stated check. Do not start a phase before its predecessor's gate passes.

> ## Correction, 2026-08-18: phases 1 to 3 were already done
>
> This plan was written from a codebase survey that described a much older
> state of `android/`. Checked directly against the branch afterwards, the
> survey was wrong on every point that set the plan's ordering:
>
> | The survey said | The branch actually has |
> |---|---|
> | No test source set, zero tests | 29 tests in 11 classes, all green |
> | Orbs 4 / 3 / 4 / 4 / 5, stale | 8 / 5 / 7 / 7 / 8, matching the documented table |
> | `oracle_decrees.json`, 420 denormalized records | Retired; `shared/content/*.json` read as a build-time asset |
> | Deity names stale (Apollo, Artemis, Cronus) | Corrected in `72af9a0` |
> | Four silent-failure sites | Three already compile-enforced in `c5325c4` |
>
> So **Phase 1 (safety net), Phase 2 (correctness parity) and Phase 3 (content
> migration) are complete**, and Phase 3 landed better than this plan proposed:
> Android does not keep its own copy of the universal layer, it consumes the
> same files the web exporter generates, so the two surfaces cannot drift.
>
> **Phase 0 is done** (commit `03b07de`), executed against the real branch.
>
> **What actually remains:** Phase 4 (ten bodies) is now small, because
> `shared/content/` already carries all 10 bodies, 50 deity records including
> the 15 receptions with their "Received:" notes, and the correct orb table.
> The work is widening `ClassicalPlanet` and following the compiler, with the
> existing completeness tests as the net. Phases 5 to 7 (design system, screen
> rebrand, structure) stand as written.
>
> Read the phases below with that in mind: 1 to 3 are kept as a record of the
> reasoning, not as work to do.

> ## Status: the rollout is complete
>
> All seven phases are done, on branch `feature/android-rollout`.
>
> | Phase | Outcome |
> |---|---|
> | 0 Build health | Release emits a signed apk, targetSdk 36, R8 on with rules proven on device. `03b07de` |
> | 1 Safety net | Was already done before this rollout began. |
> | 2 Correctness | Was already done. Orbs, aspect detection, deity names, timezone. |
> | 3 Content model | Was already done, and better: Android reads the web exporter's own output. |
> | 4 Ten bodies | `c1cfac3`. The compiler found all twelve gaps; none could fail silently. |
> | 5 Design system | `e0eb763`. Real fonts, the full type scale, five culture schemes, a component vocabulary. |
> | 6 Screens | `5837c7b`. Every screen on the system, three defects fixed, one regression caught on device. |
> | 7 Structure | `57c066f` and `c7e08bf`. Room hardened, dead files retired, the method page, a nav graph. |
>
> **Deliberately not done, with reasons:**
> - **Hilt.** Two destinations and three ViewModels do not pay for the
>   indirection. The case arrives with surfaces that need shared repositories.
> - **The Placidus routines.** Listed here as dead, but the code carries a
>   comment saying they are retained for future use. That decision outranks
>   this plan.
> - **`getDeitiesFor` and `getOfficerName`.** Listed as dead; both are covered
>   by tests, so they are API rather than debris.
> - **Long transits and the week / season / year horizons.** Done after this
>   status was written: `4f23517` ports the long transits as spans, `050844c`
>   the week, and `36581e5` the season and the year, so all four horizons exist
>   on Android.

> ## Update, 2026-09-29
>
> - **The Room migration gate could not be met as written.** Phase 7's gate
>   asks for a passing migration test. The database has been at version 2
>   since the import commit `02efea4`, and no version 1 schema was ever
>   exported, so there is nothing to migrate from. `57c066f` turned schema
>   export on (`android/app/schemas/`) and removed the destructive fallback.
>   The first real schema change adds the migration and its test.
> - **All seven ViewModels have unit tests against fakes** (`7222c01`). The
>   Android suite runs 65 unit tests.
> - **The notification corpus no longer exists as fixed lines.** `67d67db`
>   deleted the 160 lines in `web/src/data/notifications.ts`, and
>   `web/src/lib/dailyMessage.ts` composes the day's line from the sky
>   instead. The bullet under "What this plan does not cover" describes the
>   old corpus.

## Verified facts (checked, not assumed)

Run against the tree on 2026-08-18 before this plan was finalized, so the phases
below plan around what is true rather than what looked risky:

| Check | Result |
|---|---|
| `./gradlew assembleDebug` | **BUILD SUCCESSFUL** (26s). AGP 9.1.1 + compileSdk 34 + Compose BOM 2024.09.02 build fine together. |
| `./gradlew assembleRelease` | **BUILD SUCCESSFUL** (1m36s), but the artifact is **`app-release-unsigned.apk`**. |
| Missing `proguard-rules.pro` | **Latent, not active.** `isMinifyEnabled = false` means the file is never read. It breaks only when R8 is enabled. |
| Cinzel / Spectral / IBM Plex Mono as TTF | **All three serve TTF** from the Google Fonts css2 API when queried without a browser user-agent (3 / 4 / 2 files). |
| Cinzel TTF on Android | **Already proven**: `web/src/fonts/cinzel-og-500.ttf` (46 KB) was fetched by this route for the OG card. |

**What this changes about the plan:** the toolchain pairing is *not* a blocker
and Phase 0 does not need to chase it. The real Phase 0 items are the unsigned
artifact and `targetSdk 34`. Font acquisition for Phase 5 is a solved problem,
not a research task.

## The situation in one page

| | Web (canonical) | Android (today) |
|---|---|---|
| Bodies | 10, with `RECEIVED_BODIES` + `isReceived()` | 7, `enum ClassicalPlanet` |
| Orbs | 8 / 5 / 7 / 7 / 8, published on `/method` | 4 / 3 / 4 / 4 / 5, with a code comment falsely claiming parity |
| Content model | universal text + render-time cultural mask | denormalized 84 x 5 = 420 records |
| Deity names | corrected (Helios, Selene, Kronos, Kothar, Attart) | stale (Apollo, Artemis, Cronus, Kothar-wa-Khasis, Astarte) |
| Fonts | Cinzel / Spectral / IBM Plex Mono, self-hosted | **aliases to system serif/mono; no `res/font/` exists** |
| Type scale | full | 4 of 15 M3 styles defined; 11 silently render Roboto |
| Culture theming | 5 grounds + 5 accents | 4 of 5 cultures share one identical black/gold scheme |
| Tests | gates + typecheck + lint + build | **none; no test source set exists** |

**The two facts that drive the ordering:**

1. **Silent-failure sites outnumber compiler-enforced ones five to one.** Only
   `mapPlanetToBody`'s `when` forces you to handle a new body. `DeityRegistry`
   uses `getValue()` (runtime throw), `culturalVoices` falls back to
   `"The Servant"`, `getPlanetColor` falls back to white, and a missing
   `PLANET_SIGN` JSON key returns `null` and drops the card. Expanding before
   closing these means shipping wrong copy that compiles clean.

2. **The content model decides the expansion's cost.** Under today's
   denormalized shape, three new bodies cost **+180 authored records**
   (36 keys x 5 cultures). Under web's universal model, they cost **36
   paragraphs**. `shared-content-model.md` already declares the web model
   canonical. Migrating first turns the expansion from the most expensive
   phase into a cheap one.

---

## Phase 0 — Build health and release readiness

**Why first:** the app currently cannot produce an installable release artifact
and cannot be submitted to Play. Both are quiet failures: the build succeeds and
hands you something unusable.

**Already verified green, so this phase does not need to fix them:** the debug
and release builds both pass, and the AGP 9.1.1 / compileSdk 34 / Compose BOM
2024.09.02 pairing works despite looking mismatched. Leave the toolchain alone
unless `targetSdk 36` forces a move.

Real items: the release artifact is **unsigned**; **`targetSdk 34`** is below
Play's floor; **`proguard-rules.pro` is referenced but absent** (latent while
minify is off); four `android.*=false` escape hatches sit in
`gradle.properties`; `local.properties` and `.idea/workspace.xml` are tracked.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Do not touch web/.

Goal: make this module produce an installable, submittable release artifact.
No feature or visual changes in this phase.

Context already verified, do not redo it: `./gradlew assembleDebug` and
`./gradlew assembleRelease` both succeed today. The AGP 9.1.1 / compileSdk 34 /
Compose BOM 2024.09.02 pairing builds fine. Release currently emits
app/build/outputs/apk/release/app-release-unsigned.apk. Set JAVA_HOME to the
Android Studio JBR (C:/Program Files/Android/Android Studio/jbr) if java is not
on PATH.

1. SIGNING. There are no signingConfigs, which is why release output is
   unsigned and therefore not installable or uploadable. Add a signingConfigs
   block that reads a gitignored keystore.properties (storeFile, storePassword,
   keyAlias, keyPassword) and falls back to debug signing when that file is
   absent, so a fresh clone still builds. Add keystore.properties to .gitignore
   and commit a keystore.properties.template. Do NOT generate a keystore or
   invent credentials: print the exact keytool command for me to run myself, and
   confirm afterwards that release output is app-release.apk, not
   app-release-unsigned.apk.
2. TARGET SDK. targetSdk 34 is below Google Play's floor (35+ required since
   Aug 2025, 36 since Aug 2026). Raise compileSdk and targetSdk to 36. Expect
   fallout: SDK 35+ enforces edge-to-edge, and ui/theme/Theme.kt sets
   window.statusBarColor in a SideEffect, which is deprecated as of 35 and
   ineffective under enforcement. Replace it with enableEdgeToEdge() in
   MainActivity plus the modern insets APIs, and check every screen for content
   drawn under the status or navigation bar. Only move AGP or the Compose BOM if
   36 actually forces it; if you do move them, say exactly what forced it.
3. PROGUARD. app/proguard-rules.pro is referenced by the release buildType and
   does not exist. It is harmless today only because isMinifyEnabled = false.
   Create it with the rules this dependency set needs:
     - kotlinx.serialization 1.7.1: keep @Serializable classes and their
       synthetic Companion/$serializer members. The library publishes consumer
       rules, so verify what is actually still required rather than pasting a
       stale block.
     - Room 2.8.4 entities and the generated _Impl classes.
     - com.github.cosinekitty:astronomy v2.1.17.
   Then set isMinifyEnabled = true (and isShrinkResources = true) for release,
   build, and INSTALL the result on an emulator. A minified build that compiles
   but crashes on first chart calculation is the failure mode here, so actually
   run the app through onboarding to a rendered chart before calling it done.
4. GRADLE PROPERTIES. Four compatibility escape hatches sit in
   gradle.properties: android.disallowKotlinSourceSets,
   android.uniquePackageNames, android.dependency.useConstraints,
   android.r8.strictFullModeForKeepRules, all =false, several with comments
   admitting they work around AGP errors. Note that item 3 turns R8 on, which
   makes strictFullModeForKeepRules load-bearing. For each flag: remove it, see
   what breaks, and either fix the cause or restore it with a comment saying
   what it is masking and when it must be revisited.
5. HYGIENE. local.properties (machine-specific SDK path) and
   .idea/workspace.xml are tracked. Untrack both, keep them on disk, add to
   .gitignore.

GATE: `./gradlew assembleRelease` produces a SIGNED apk, minification is on, and
that minified build runs on an emulator from onboarding through a rendered
chart. Report every version you changed and every escape hatch you removed or
kept. Commit in reviewable slices, conventional messages.
```

---

## Phase 1 — Safety net: tests, and turning silent failures into compile errors

**Why here:** this is the phase that makes every later phase safe. It adds the
first test source set this app has ever had, and converts the four silent
failure modes into compiler-enforced ones **while the model is still 7 bodies**,
so the conversion itself is verifiable against known-good output.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Read
L:\Claude Projects\astra-antiqua\docs\shared-content-model.md first.

This app has no tests and four places where a missing planet fails silently
rather than at compile time. Close both gaps. Change NO content and NO visuals
in this phase; behavior must be identical when you finish.

PART A: make the silent sites compiler-enforced.
1. model/DeityRegistry.kt holds Map<AncientCulture, Map<ClassicalPlanet, Deity>>
   read via getValue() (throws at runtime on a missing pair). Restructure so a
   missing (culture, planet) pair is a COMPILE error: an exhaustive `when` on
   the planet enum inside an exhaustive `when` on the culture enum is the
   simplest shape that gives this. Keep the public API (getDeity, getDeitiesFor)
   source-compatible.
2. domain/LexiconDictionary.kt has five culturalVoices maps read via
   `culturalVoices[planet] ?: "The Servant"` in domain/CulturalLexicon.kt:18.
   That fallback silently produces wrong copy. Make the lookup total (exhaustive
   `when`) and delete the fallback.
3. ui/screens/MainDashboardScreen.kt getPlanetColor() is an if-chain returning
   Color.White by default. Make it an exhaustive `when` with no else.
4. data/OracleRepository.kt returns null on a missing PLANET_SIGN key and the
   card silently disappears. Keep it nullable (a decree genuinely can be
   absent), but add a debug-only assertion or log that names the missing key,
   so absence is visible during development.

PART B: create the test source set (app/src/test) and write these JVM tests.
Use JUnit 4, already declared.
1. DeityRegistryCompletenessTest: every AncientCulture x every ClassicalPlanet
   resolves to a non-blank name and epithet.
2. LexiconCompletenessTest: every culture's culturalVoices covers every planet
   with non-blank copy.
3. AspectOrbTest: assert AspectType's exact degree and orb values, so the table
   can never drift silently again. For now assert the CURRENT values
   (4/3/4/4/5) and add a TODO naming the web values it must move to in Phase 2.
   The point is to make the change deliberate and visible in a diff.
4. AspectDetectionTest: build a synthetic chart with two bodies at a known
   separation and assert exactly one Aspect is emitted with the expected type.
   Include a case at a separation that falls inside two orb bands, and assert
   the current behavior; note in a comment whether it double-counts.
   (domain/CalculateNatalChartUseCase.calculateAspects lacks the `break` that
   web's computeAspects has.)
5. WholeSignHouseTest: assert house assignment for a known ascendant, including
   the wraparound case (ascendant in Pisces, body in Aries).
6. GoldenChartTest: pick one fixed birth moment and location, compute the chart,
   and assert each body's longitude to 0.01 degrees against values you obtain by
   running the code once and recording them. Label it a characterization test:
   its job is to catch unintended ephemeris drift in later phases.

For the JSON key coverage test, oracle_decrees.json lives in assets and needs a
Context. Either put that one test in app/src/androidTest, or refactor
OracleRepository to read from an InputStream so a JVM test can feed it the file
directly. Prefer the refactor and say why in the commit.

GATE: `./gradlew test` green with all of the above, and `./gradlew assembleDebug`
green. Report the golden-chart values you recorded.
```

---

## Phase 2 — Correctness parity with the documented method

**Why here:** with tests in place, these become safe, provable changes. Each one
is a place where Android currently disagrees with what `/method` publishes.

Four defects, all confirmed by the survey:

- **Orbs are stale** (4/3/4/4/5 vs the documented 8/5/7/7/8), and the comment
  above them falsely claims parity with web.
- **`calculateAspects` has no `break`**, so one pair can emit two aspects.
- **Deity names are stale** relative to web's corrections, and the names are
  woven into the decree *prose*, so this is not a find-and-replace.
- **Timezone bug:** `saveProfile` stores `TimeZone.getDefault().id` (the
  device's zone, not the birth location's), and `CalculateNatalChartUseCase`
  never reads it while `OnboardingScreen` builds `birthDateUtc` by adding local
  hour/minute to a UTC-midnight picker value.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. The web surface is canonical;
read web/src/data/sampleChart.ts (ASPECT_RULES) and
docs/shared-content-model.md before starting.

Fix four correctness defects. Phase 1's tests must stay green throughout; update
a test only when the change of behavior is the intended point, and say so.

1. ORBS. domain/NatalChartData.kt AspectType carries 4/3/4/4/5. The documented
   table, published on the web /method page, is: conjunction 8, sextile 5,
   square 7, trine 7, opposition 8. Move Android onto it and update the stale
   comment above the enum, which currently claims a parity that does not exist.
   Update AspectOrbTest to the new values and remove its TODO.
2. DOUBLE-COUNTING. domain/CalculateNatalChartUseCase.calculateAspects loops
   AspectType.values() with no break, so a pair inside two orb bands emits two
   aspects. Web breaks on first match. Match that, and make AspectDetectionTest
   assert the single-aspect outcome.
3. WHEEL DENSITY. Widening the orbs roughly doubles detected aspects. Look at
   NatalWheel in ui/screens/MainDashboardScreen.kt: it draws one chord per
   aspect with no budget, no filtering, and no z-ordering. Decide and implement
   a rule so the wheel stays legible (for example: draw only the tightest N, or
   scale alpha by exactness and draw hard aspects last). Explain the rule you
   chose in a comment.
4. DEITY NAMES. Per shared-content-model.md, web corrected: Greece Sun
   Apollo -> Helios, Greece Moon Artemis -> Selene, Greece Saturn Cronus ->
   Kronos, Canaan Mercury Kothar-wa-Khasis -> Kothar, Canaan Venus Astarte ->
   Attart, and disambiguated Carthage's two Baal Hammon seats (Jupiter "in
   bounty", Saturn "the elder"). These names live in TWO places on Android:
   model/DeityRegistry.kt (35 records) and assets/oracle_decrees.json (420
   records) where they are also woven into the decree and interpretation prose
   (e.g. "Apollo declares a soul of..."). Rename in both, and REWRITE the
   affected prose lines so they read naturally with the corrected name. Do not
   leave a sentence that only made sense with the old name.
5. TIMEZONE. viewmodel/LocationSearchViewModel.saveProfile writes
   TimeZone.getDefault().id, the device zone rather than the birth location's,
   and CalculateNatalChartUseCase never reads timezoneId at all while
   OnboardingScreen (around lines 337-339) builds birthDateUtc by adding local
   hour and minute to a UTC-midnight date-picker value. Work out what the
   intended UTC instant is, fix the construction so a birth outside the device's
   current zone is computed correctly, and add a JVM test with a birth in a
   different zone than the test JVM's default. This is an ephemeris correctness
   bug, so treat the golden-chart test with care: if it changes, that is the fix
   working, and you should re-record and say so explicitly.

GATE: `./gradlew test` and `./gradlew assembleDebug` green. Report the aspect
count before and after on the golden chart, and confirm the five renamed deities
read correctly in their decree prose.
```

---

## Phase 3 — Migrate the content model (the decision that sets the expansion's price)

**Why before the expansion:** under today's denormalized shape, adding three
bodies costs **+180 authored records** (~68 KB of new prose) in a model
`shared-content-model.md` says is being retired. Migrating first collapses
420 records to ~120 and makes the same expansion cost **36 paragraphs**.

Doing this phase second-to-last instead would mean authoring 180 records and
then throwing most of them away.

> **Checkpoint:** this phase changes the product's content architecture. Read
> the migration report before starting Phase 4.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Read
L:\Claude Projects\astra-antiqua\docs\shared-content-model.md (the Interpretation
model section) and study how web does this: web/src/data/planetInSign.ts
(universal text), web/src/data/deities.ts (the cultural mask),
web/src/lib/reading.ts (how they compose at render time).

Migrate Android from the denormalized decree model to web's universal-text-plus-
cultural-mask model.

TODAY: assets/oracle_decrees.json holds 84 PLANET_SIGN keys x 5 culture columns
= 420 records, each with deity_name, epitheton, decree, interpretation. The
deity name and cultural framing are baked into every record, so content grows
multiplicatively and drifts between cultures.

TARGET: the universal placement meaning is stored once per (planet, sign), and
the active culture is applied at render time from the deity registry and the
cultural lexicon, exactly as web does it.

1. Design the target shape first and show it to me before converting anything:
   the new asset format (or Kotlin data source), the loader, and the render-time
   composition. Say explicitly what happens to `epitheton`, which today exists in
   all 420 records and is rendered by NO screen.
2. Port web's universal layer where it already exists. web/src/data/planetInSign
   .ts has 120 authored paragraphs (10 bodies x 12 signs) that are already
   universal and already at the voice bar. The 7 classical bodies' worth (84
   paragraphs) is directly usable. Prefer porting it over re-deriving from the
   Android decrees; where an Android decree carries a better line, keep it and
   say so.
3. Preserve what is genuinely Android-only and good: domain/LexiconDictionary
   .kt's per-culture UI vocabulary has no web counterpart and should survive the
   migration intact.
4. Keep the decree CARD looking the same to a user in this phase. This is an
   architecture change, not a visual one. The dashboard should render the same
   kind of content it does today, composed differently underneath.
5. Fix the loader while you are here: data/OracleRepository re-reads and
   re-parses the whole 156 KB asset on EVERY lookup, uncached, with a
   try/catch(Exception) that makes malformed JSON, a missing key, and an IO
   error indistinguishable. Load once, cache, and distinguish the failure modes.
6. There are three separate AncientCulture -> JSON-column mappings (two `when`s
   in OracleRepository around lines 29-36 and 45-52, and a third in
   DashboardViewModel around lines 79-85). Collapse to one.
7. DashboardViewModel lines ~79-85 hold hardcoded per-culture summary strings
   with $sunSign/$moonSign interpolated: a sixth place culture copy lives,
   outside both the lexicon and the JSON. Move it into the lexicon.

Add tests: every (planet, sign) resolves to universal text; every (culture,
planet) resolves to a deity; the composed output for a known chart matches a
recorded golden string.

GATE: `./gradlew test` and `./gradlew assembleDebug` green, the dashboard renders
the same content as before, and you report old/new record counts and the byte
size change.
```

---

## Phase 4 — Ten bodies

Now cheap, because Phases 1 and 3 removed both hazards: silent failures are
compile errors, and content is universal.

The ephemeris layer needs **no edit** — the survey confirmed the shipped
astronomy JAR's `Body` enum already contains `Uranus`, `Neptune`, `Pluto`, and
`AstronomyEngine`'s `else ->` branch handles all three.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Read web/src/data/cultures.ts
(PLANETS, RECEIVED_BODIES, isReceived), web/src/data/deities.ts (the 15 reception
records and their "Received:" notes), and the "THE THREE RECEIVED BODIES"
section of web/src/app/method/page.tsx.

Expand from 7 to 10 bodies, matching web's framing exactly: Uranus, Neptune and
Pluto are RECEIVED bodies, admitted the way Rome admitted foreign gods, and every
surface that shows them says so.

1. model/Planet.kt: add URANUS, NEPTUNE, PLUTO. The enum is named
   ClassicalPlanet, which becomes false the moment they join. Rename it (web
   calls the set PLANETS and the three RECEIVED_BODIES) and add an isReceived
   predicate. Also delete the dead PlanetPosition data class in this file.
2. Let the compiler drive the rest. After Phase 1 the exhaustive `when`s in
   DeityRegistry, LexiconDictionary, mapPlanetToBody and getPlanetColor will all
   fail to compile until handled. Work through every error.
3. Deity names, fixed by web, do not invent alternatives:
   Uranus  Nut / Ouranos / Shamem / Baal Shamem / Caelus
   Neptune Nun / Poseidon / Yammu / Yam / Neptunus
   Pluto   Osiris / Plouton / Motu / Mot / Dis Pater
   Port the epithets and the "Received:" notes from web/src/data/deities.ts
   verbatim. model/Deity.kt has no `note` field: add one, because the reception
   framing has nowhere else to live.
4. Author the universal placement text for the three new bodies by porting the
   36 paragraphs already written and audited in web/src/data/planetInSign.ts.
5. AstronomyEngine needs no change: the else -> branch already covers all
   three. The claim that Pluto is range-limited to 1700-2200 and throws outside
   it, which earlier drafts of this plan repeated from the survey, was tested
   against this library version and is false. It answered at 1000, 1500, 1600,
   1700, 2000, 2200, 2400 and 3000 CE and threw at none. Do not add a guard:
   returning null outside an assumed span would drop a body the library is
   willing to compute. The finding is recorded in AstronomyEngine's docstring.
6. Surface the reception honestly in the UI: received bodies are visually marked
   (web uses the culture accent colour), and the app states plainly somewhere a
   user can reach that the outer planets are a modern extension made in the
   ancient manner. Match web's wording rather than inventing your own.
7. Watch the wheel again: pair count goes 21 -> 45. Confirm the density rule
   from Phase 2 still holds, and tighten it if not.

GATE: `./gradlew test` and `./gradlew assembleDebug` green, all completeness
tests cover 10 bodies, a chart renders all ten with the three marked as received,
and the golden-chart test is re-recorded with the new bodies.
```

---

## Phase 5 — Design system

**Why this order:** the visual rebrand is less work than it looks (there is no
blur and there are **zero gradients** in the entire tree; "glass" is three color
constants and six lines), but it is blocked on typography that is currently
fake. `PlayfairDisplay` and `JetBrainsMono` are aliases to `FontFamily.Serif`
and `FontFamily.Monospace`; there is no `res/font/` directory; only 4 of 15 M3
text styles are defined, so 11 render in Roboto.

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Read
L:\Claude Projects\astra-antiqua\docs\design\handoff\README.md (Design Tokens,
The two chassis) and docs/design/handoff/tokens.css. Study the shipped web
result in web/src/app/globals.css and web/src/components/chrome/ for how the
system resolves in practice.

Build the Android design system for the new identity. No screen rewrites in this
phase: this phase produces the vocabulary that Phase 6 applies.

1. FONTS. ui/theme/Type.kt declares `val PlayfairDisplay = FontFamily.Serif` and
   `val JetBrainsMono = FontFamily.Monospace`: the names are a fiction, they are
   the system families, there is no res/font/ directory, and the identity they
   name is the OLD one anyway. The new identity is Cinzel (display), Spectral
   (prose), IBM Plex Mono (data).
   Acquisition is already solved, do not research it: the Google Fonts css2 API
   returns TTF when queried WITHOUT a browser user-agent, and all three families
   are confirmed available that way (Cinzel 3 files, Spectral 4, IBM Plex Mono
   2). web/scripts/fetch-fonts.mjs already does exactly this fetch for woff2 and
   already knows the three family query strings; web/src/fonts/cinzel-og-500.ttf
   is a 46 KB TTF fetched by this route. Extend that script with a TTF mode that
   writes into android/app/src/main/res/font/ rather than writing a second
   downloader, so both surfaces keep one font pipeline.
   Android constraints that will bite: res/font/ filenames must be lowercase
   letters, digits and underscores only, so hyphenated web names like
   cinzel-latin-var.ttf must become cinzel_variable.ttf. Variable fonts need
   API 26+, which matches minSdk 26 exactly, so verify on a minSdk emulator
   rather than assuming. All three families are SIL Open Font License, so
   embedding is fine; add the license text to the app's attributions.
   Remove the dead playfairDisplay and jetbrainsMono entries from
   gradle/libs.versions.toml (declared under [versions] with no [libraries]
   entry and no usage).
2. TYPE SCALE. Define the FULL Material3 scale, not 4 of 15. Screens currently
   use displaySmall, headlineSmall, bodySmall, labelSmall and titleMedium, all
   of which silently fall back to Roboto today. Map each M3 slot to the identity:
   Cinzel for display and caps with wide letter-spacing (.06 to .3em), Spectral
   for prose at 1.65-1.75 line height, IBM Plex Mono for data and microcopy with
   an 11sp floor.
3. COLOR. Replace ui/theme/Color.kt's gold-on-black palette with the new tokens:
   grounds Egypt #1A1712, Greece #171A1C, Canaan #1A1813, Carthage #191218,
   Rome #1B1410, neutral #171310; accents Egypt #B59A55, Greece #7C93A6, Canaan
   #8A9268, Carthage #94648C, Rome #A5544A; inks bone #E6DECC, prose #D9D1BF,
   dim #9A917D, faint #6F6B60; signals harmony #B59A55, conflict #B56B71; rules
   at 16% and 11% bone.
4. FIVE REAL CULTURE SCHEMES. ui/theme/Theme.kt currently gives four of five
   cultures the identical black/gold scheme and only Rome its own. Author all
   five from the tokens above. The LocalLexicon CompositionLocal pattern in that
   file is clean and complete: reuse exactly that pattern for the palette.
5. GEOMETRY. The identity is flat and incised: border-radius 0 everywhere, no
   shadows, no gradients, 1px rules only. GlassCard's RoundedCornerShape(16.dp)
   and layered translucent fills are the old identity; replace it with a flat
   bordered surface. Keep the file name or rename it, your call, but say which.
6. COMPONENTS. There is currently ONE reusable component (GlassCard, used 4
   times) and everything else is inline Modifier chains. Build the small set
   Phase 6 will need: a screen scaffold, a bordered surface, a section divider,
   a votive block (centred caps between two rules), a data row, and a primary
   action. Give them the same names as their web counterparts where the concept
   matches, so the two surfaces stay legible to one reader.
7. SPACING. Define a scale rather than the current per-call-site dp values.

Update MainDashboardPreview.kt's 5 previews so the new schemes are visible in
Android Studio's preview pane; that is this phase's visual check.

GATE: `./gradlew assembleDebug` green, all five culture previews render in
Android Studio, and no screen behaviour has changed.
```

---

## Phase 6 — Screen rebrand

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android. Use ONLY the design system
built in Phase 5: no new inline colours, sizes, or shapes. Read
docs/design/handoff/screens/2a-home-desktop-rome.html and
2a-home-mobile-egypt.html for the composition the dashboard is moving toward.

Bring the four screens onto the new system.

1. MainDashboardScreen.kt (492 lines) is the app. It has 15 inline `alpha =`
   call sites and a HighPriestSummaryCard that hand-rolls its own bordered box
   instead of reusing the shared surface. Rebuild it from the Phase 5
   components. Specific content notes:
   - OracleDecreeCard renders a 140sp watermark of the deity's first letter at
     5% gold. That is the old identity; decide what replaces it, if anything.
   - epitheton is present in every record and rendered nowhere. Either surface
     it or delete it from the model, but do not leave it dead.
   - ScribeMargin's monospace sign/degree/house/direction column is good and
     close to web's ephemeris rail. Keep the idea, restyle the execution.
   - NatalWheel draws planet dots exactly ON the rim rather than inside it, and
     its tap haptic fires on `longitude % 60.0 < 5.0`, a placeholder unrelated
     to the computed aspects. Fix both: dots inside the ring, and either wire
     the tap to real aspect hit-testing or remove it.
2. CultureSelectionScreen.kt: the culture list is a hardcoded
   listOf("Egypt","Greece",...) of Strings round-tripped through
   AncientCulture.valueOf() with a silent GREECE fallback. Drive it from
   AncientCulture.values() and make the callback typed. Restyle to the doorway
   treatment in docs/design/handoff/screens/3a-onboarding-mobile.html.
3. OnboardingScreen.kt: replace the 10-property TextFieldDefaults.colors block
   and the ButtonDefaults.buttonColors with Phase 5 components. Two
   OutlinedTextFields are `enabled = false` with a separate TextButton as the
   tap target, which is hostile to screen readers: fix the accessibility while
   you are in here.
4. Launcher icon: still the Android Studio template green (#3DDC84). Replace it
   with the identity, matching what web/scripts/generate-icons.mjs draws.

Sweep for old-identity leftovers as you go: gold #FFD700, RoundedCornerShape,
GlassBackground/GlassBorder/CardBackground, and any remaining hardcoded planet
colours.

GATE: `./gradlew assembleDebug` green, all five culture previews render, and the
app runs on an emulator through the full flow (culture selection, onboarding,
dashboard) with no old-identity colour or radius visible. Capture a screenshot
per culture.
```

---

## Phase 7 — Structure and the missing surfaces

**Why last:** the app has no navigation and no DI, so every new screen today
means a new branch in a `when` and another ViewModel constructing its own
database. That is fine for four screens and untenable for the surfaces the
lexicon already has labels for (settings, birth chart, ephemeris) plus the ones
web now has (long transits, method, week/season/year).

**Prompt:**

```text
Work in L:\Claude Projects\astra-antiqua\android.

The app currently switches screens with a 4-branch `when (phase)` inside an
AnimatedContent in MainActivity, with no back handling. androidx.navigation
:navigation-compose:2.8.1 is a declared, unused dependency. There is no DI: every
ViewModel takes Context per-method and news up its own DataStoreManager,
AppDatabase, OracleRepository and AstronomyEngine, which is why nothing is
unit-testable without an Android runtime. AppViewModel is instantiated twice
(MainActivity by viewModels(), and again unused at MainDashboardScreen line 64).

1. Introduce a navigation graph. Keep the existing phase routing for the
   first-run flow (culture selection -> onboarding -> dashboard) but express it
   as routes with proper back handling.
2. Introduce dependency injection. Hilt is the default choice; justify briefly
   if you pick otherwise. Extract repository interfaces so ViewModels can be
   unit-tested with fakes, and remove Context from ViewModel method signatures.
   Delete the duplicate AppViewModel instantiation.
3. With that in place, add the surfaces the lexicon already names and web
   already has. Priority order: the method/reception statement (smallest, and
   Phase 4 needs somewhere to put it), then long transits, then the week /
   season / year horizons. Read web/src/components/transits/ and
   web/src/lib/transitSpans.ts for the span model before building transits;
   port the three-degree span rule rather than re-deriving it.
4. Delete the dead code the survey catalogued: data/DeityManager.kt (zero
   callers), DeityRegistry.getDeitiesFor, CulturalLexicon.getOfficerName and its
   6 unused fields, AstronomyEngine's ~63 lines of Placidus code,
   UserDao.deleteUserProfile, data/local/datastore/AppSettings.kt (a tombstone
   comment), the empty data/util/ directory, LocationSearchViewModel's no-op
   debounce coroutine, and HouseMeaning.arena if it is still unrendered.
5. Room is at version 2 with exportSchema = false and
   fallbackToDestructiveMigration(true): any version bump silently destroys user
   data. Turn on schema export, commit the schema, and write a real migration.

GATE: `./gradlew test` and `./gradlew assembleDebug` green, back navigation works
from every screen, ViewModels have unit tests using fakes, and a Room migration
test passes.
```

---

## Sequencing notes

- **Phases 0 and 1 are prerequisites, not preamble.** Skipping them means the
  10-body expansion ships wrong copy that compiles clean, on an app that cannot
  be submitted to Play.
- **Phase 3 before Phase 4 is the single highest-leverage ordering choice** in
  this plan: it changes the expansion's content cost from 180 records to 36
  paragraphs.
- **Phases 5 and 6 can run in parallel with 2 through 4** if two people are
  working, since they touch `ui/` while the others touch `model/`, `domain/`
  and `data/`. The one collision is `getPlanetColor` in
  `MainDashboardScreen.kt`, which Phase 1 moves and Phase 5 re-themes: do it
  once, in Phase 1, and let Phase 5 restyle it.
- **Phase 7 is genuinely optional** for parity. Phases 0 to 6 leave Android
  visually and astronomically in step with web. Phase 7 is what lets it keep up
  as web grows.

## What this plan does not cover

- **Play Store listing, screenshots, and release notes.** Phase 0 makes the app
  signable; shipping it is a separate exercise.
- **Sync with the web account system.** Android has no auth and no server
  charts. Web's account adds sync only, so this is a real feature decision, not
  a parity gap.
- **The notification corpus.** 160 authored lines exist in
  `web/src/data/notifications.ts` with no delivery mechanism on either surface.
  Android is the natural home for it, and it is a good first candidate after
  Phase 7. (2026-09-29: those fixed lines are gone. `67d67db` replaced them
  with the sky-composed `web/src/lib/dailyMessage.ts`.)
