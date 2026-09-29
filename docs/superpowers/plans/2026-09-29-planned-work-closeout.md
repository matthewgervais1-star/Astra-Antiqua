# Planned-work close-out, 2026-09-29

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. One task per dispatch, serial, task review after each.

**Goal:** Close every gap the 2026-09-29 audit found between the repository's plan documents and the tree, where the gap is code or docs work that needs no product-owner decision. Items that need a decision (a backend for Android, a mail sender, hosting, design calls, French UI, store listings) are out of scope here and are listed for the owner in the final report.

**Spec:** The plan documents themselves are the authority: `docs/superpowers/plans/2026-08-11-web-rebrand-phase2.md`, `docs/android-rollout-plan.md`, `docs/design/prompts/implement-design-system.md`, `docs/design/prompts/finish-on-ultracode.md`, `docs/design/rebrand-brief.md` (Verification bar), `docs/web-ios-android-plan.md`. Where they conflict with a later deliberate commit (`8796ef7` one chart per account; `67d67db` notification corpus replaced by `dailyMessage.ts`; `82f921c` voice audit), the later commit wins.

**Worktree:** `L:\Claude Projects\astra-antiqua\.claude\worktrees\planner-buildout-completion-495257`. Run every command from there. Never `cd` to `L:\Claude Projects\astra-antiqua`.

## Global Constraints

- **Writing:** no em dashes anywhere (code, comments, docs, commit messages). No throat-clearing openers, no adverbs such as really / just / simply / actually, no "not X but Y" contrasts, active voice with a named actor. Never rewrite quoted identifiers, string literals or file contents.
- **Web checks at every commit** (from `web/`): `pnpm typecheck && pnpm lint && pnpm gates && pnpm test:db && pnpm build`. All must pass. `pnpm test:db` starts its own PGlite; no `DATABASE_URL` is needed.
- **Android checks at every commit** (from `android/`, PowerShell): `$env:JAVA_HOME='C:/Program Files/Android/Android Studio/jbr'; ./gradlew compileDebugSources testDebugUnitTest --console=plain`. `android/local.properties` exists locally and is git-ignored; never commit it.
- **Dotnet** is untouched by every task; do not edit `dotnet/` or `shared/content/` (generated; the exporter is the only writer).
- **Design system is canonical.** Do not redraw, restyle or replace any mark or glyph. No gradients, shadows, rounded corners, `backdrop-filter`. Fonts stay self-hosted.
- **Commits:** present-tense subjects in the log's style (`feat(web): ...`, `fix(android): ...`, `docs: ...`, `ci: ...`), a body that says why, and the trailer line `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`. Commit only the task's files; run `git status --short` before `git add`.
- **Scope:** exactly what each task lists. No refactors beyond it.

---

### Task 1: Web plan leftovers (method span rule, gates, DeityGlyph, OG wordmark)

**Files:** Modify `web/src/app/method/page.tsx`, `web/scripts/check-gates.mjs`, `web/README.md` (Style gates section only), `web/src/lib/transits.ts` (one comment), `web/src/components/chrome/DeityGlyph.tsx` and its name-adjacent call sites, `web/src/app/voices/[culture]/opengraph-image.tsx`.

- [ ] **Span rule on `/method`.** The rebrand plan (Task 7) requires the long-transit span rule to be documented on `/method`: "a long transit is active while the body holds within three degrees of exact". Add one sentence to the ORBS section of `web/src/app/method/page.tsx`, in the page's existing register and markup, that reads the number from `SPAN_ORB` in `web/src/lib/transitSpans.ts` rather than hard-coding 3. Example wording: `A long transit is active while the body holds within ${SPAN_ORB}° of exact.`
- [ ] **Two missing gates.** `web/scripts/check-gates.mjs` must also fail on `backdrop-filter` anywhere in `web/src`, and on any `border-radius` that is not zero (a value of `0` or `0px` is allowed). Add both to `GATES` with clear names, update the header comment (it numbers the checks), and update the "Style gates" section of `web/README.md` so the documented list matches the script. Run `pnpm gates`; it must still print `gates clean`.
- [ ] **Stale comment.** `web/src/lib/transits.ts` line 20 says "Uses tighter orbs than the natal-internal aspect detector". There is one orb table (`ASPECT_RULES` in `web/src/data/sampleChart.ts`) shared by natal, transit and synastry detection. Rewrite the comment to state that.
- [ ] **DeityGlyph read twice.** `web/src/components/chrome/DeityGlyph.tsx` hard-codes `aria-hidden={false}` and always sets `role="img"` + `aria-label`, so a row reads "Sol SOL 24°09′ GEM" to a screen reader. Add an optional `decorative?: boolean` prop. When true, both branches (the glyph svg and the Unicode fallback span) render `aria-hidden="true"` and carry no `role` or `aria-label`; the svg `<title>` may stay. Default stays false. Then audit all 18 call sites (`rg -n "<DeityGlyph" web/src`) and pass `decorative` at every site where the deity's visible name or the body's label is rendered in the same row immediately beside the glyph. Leave `decorative` off where the glyph is the only identification (for example a glyph standing alone in a table cell with no name). Record in the report which sites got it and why.
- [ ] **OG card wordmark.** `web/src/app/voices/[culture]/opengraph-image.tsx` types "ASTRA ANTIQUA" as text at about line 106. `web/src/app/opengraph-image.tsx` renders the drawn wordmark (`WordmarkGlyphs`) instead. Make the per-culture card do the same, sized to the same cap height the typed text had. Build must still succeed (Satori renders these).
- [ ] Run all web checks. Commit `feat(web): the span rule on method, two more gates, and quieter glyphs`.

---

### Task 2: Preview cards for the design-system components

**Files:** Modify `web/scripts/specimens/specimens.json` and whatever `web/scripts/specimens/` needs to render new entries; regenerate `docs/design/system/components/previews/*.html` and `specimen.css` with `pnpm specimens`.

- [ ] Read `web/scripts/specimens/` first (the generator, `specimens.json`, `specimens.generated.tsx`) to learn how an entry is declared and rendered. Do not change the generator's output format.
- [ ] Add one card for each design-system component that has none: `Button` (all three weights on one card), `Badge` (each tone), `IconTile` (one attested sign and one traced mask), `DataRow` (with house and motion), `CultureSwitch`, `Monogram`, `Wordmark`, `DeityGlyph` (one culture's ten bodies at 16px), `CultureEmblem` (all five). Each entry carries a `culture` when its sample text or mark names one, following the convention already in the file; culture-neutral entries carry none.
- [ ] Run `pnpm specimens`. The `BirthForm` card must change (the component changed in `62eaa13` after its last render). Confirm `git status` shows only preview HTML/CSS and the specimens sources. Open two of the new cards in a browser or the Node renderer and confirm they render (report how you checked).
- [ ] Run `node scripts/check-svgs.mjs docs/design/system` from the repo root; it must report all files well-formed.
- [ ] Commit `feat(design): preview cards for the nine components the system gained`.

---

### Task 3: Continuous integration for web and Android

**Files:** Create `.github/workflows/web.yml`, `.github/workflows/android.yml`. Do not touch `.github/workflows/ios.yml`.

- [ ] **web.yml:** on `push` and `pull_request` when paths under `web/**`, `shared/**` or the workflow file change. One job on `ubuntu-latest`: checkout; `pnpm/action-setup@v4` with `version: 11` (the lockfile was written by pnpm 11; `package.json` has no `packageManager` field); `actions/setup-node@v4` with `node-version-file: web/.nvmrc` and `cache: pnpm`, `cache-dependency-path: web/pnpm-lock.yaml`; then from `web/`: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm gates`, `pnpm test:db`, `pnpm build`. Set `working-directory: web` as a job default. `permissions: contents: read`.
- [ ] **android.yml:** on `push` and `pull_request` when paths under `android/**`, `shared/**`, `web/scripts/gen-android-*.mjs` or the workflow file change. One job on `ubuntu-latest`: checkout; `actions/setup-java@v4` (temurin, 17); `gradle/actions/setup-gradle@v4`; then from `android/`: `./gradlew compileDebugSources testDebugUnitTest --console=plain --no-daemon`. The GitHub Ubuntu runner ships the Android SDK at `ANDROID_HOME`; do not create `local.properties`. Upload `android/app/build/test-results/testDebugUnitTest` as an artifact on failure. `permissions: contents: read`.
- [ ] Validate both files parse as YAML (use `python -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" FILE` if Python with PyYAML is present; otherwise `node -e` with the `yaml` package from `web/node_modules` if it exists; otherwise a careful read). Commit `ci: build and test the web and Android surfaces on every push`.

---

### Task 4: Android leftovers (em dash, dead code, generated aspect verbs)

**Files:** Modify `android/app/src/main/java/com/astra/antiqua/model/DeityRegistry.kt` (line 6), `android/app/src/main/java/com/astra/antiqua/model/Planet.kt` (delete `PlanetPosition`), `android/app/src/main/java/com/astra/antiqua/data/local/room/UserDao.kt` (delete `deleteUserProfile`), `web/scripts/gen-android-reading-banks.mjs`, `android/app/src/main/java/com/astra/antiqua/domain/AspectVerbs.kt`.

- [ ] Replace the em dash on `DeityRegistry.kt` line 6 with a comma or a period, whichever reads better.
- [ ] Delete the `PlanetPosition` data class at the bottom of `Planet.kt`; `rg -n "\bPlanetPosition\b" android/app/src` must return nothing (hits on `AccuratePlanetPosition` and `getPlanetPosition` do not match the whole word).
- [ ] Delete `UserDao.deleteUserProfile` (no callers; confirm with `rg -n deleteUserProfile android/app/src`). Room generates `UserDao_Impl` at build time; nothing generated is committed.
- [ ] **Generate AspectVerbs.kt.** `web/scripts/gen-android-reading-banks.mjs` already generates `ReadingBanks.kt` from `deityCharges.ts` and `aspectFrames.ts`. Extend it to also generate `domain/AspectVerbs.kt` from `web/src/data/aspectVerbs.ts`, keeping the Kotlin object's public API identical (same object name, same function signatures, same enum keys) so no caller changes. The generated file carries the same GENERATED header the other outputs carry. Run the generator; the resulting `AspectVerbs.kt` must be semantically identical to the hand-ported one (all 25 verbs equal). Show the diff in the report.
- [ ] Run the Android checks (compile + unit tests: 40 must still pass). Commit `chore(android): generate the aspect verbs, and drop two dead members`.

---

### Task 5: Rename `ClassicalPlanet` to `Planet`

**Files:** Every Kotlin file under `android/app/src` that references `ClassicalPlanet` (38 files); `docs/shared-content-model.md` (two mentions).

- [ ] The enum in `android/app/src/main/java/com/astra/antiqua/model/Planet.kt` is `ClassicalPlanet`, which its own KDoc calls "half true" since the three received bodies joined. Rename the enum to `Planet` (the web type's name), keep every constant and `isReceived` as they are, and delete the KDoc paragraph that explains why the rename was deferred. Do the rename mechanically (`rg -l ClassicalPlanet android/app/src`, then replace the whole word `ClassicalPlanet` only), then let the compiler find anything else. Watch for a name clash with any imported `Planet` symbol; if one exists, report it and qualify the import rather than choosing another name.
- [ ] Check the generated Kotlin (`ReadingBanks.kt`, `AspectVerbs.kt`, `DeityGlyphs.kt`, `LearnContent.kt`): if any of them emit `ClassicalPlanet`, change the generator in `web/scripts/` and regenerate; do not hand-edit generated output.
- [ ] Update the two mentions in `docs/shared-content-model.md` (the Bodies row and divergence 6).
- [ ] Android checks green, 40 tests passing. Commit `refactor(android): the planet enum stops calling the received three classical`.

---

### Task 6: Unit tests for the six untested ViewModels

**Files:** Create `android/app/src/test/java/com/astra/antiqua/viewmodel/{Dashboard,LocationSearch,Transits,Horizon,Forecast,Synastry}ViewModelTest.kt`. Do not modify production code unless a ViewModel cannot be constructed with fakes at all; if that happens, the smallest constructor change is allowed and must be reported.

- [ ] Read `android/app/src/test/java/com/astra/antiqua/viewmodel/AppViewModelTest.kt` and follow its harness exactly: `StandardTestDispatcher`, `Dispatchers.setMain` in `@Before`, `resetMain` in `@After`, `runTest` + `advanceUntilIdle`, fakes implementing the repository interfaces (`SettingsRepository`, `ProfileRepository`, and whichever others the six take). `AstronomyEngine` is pure Kotlin over the astronomy JAR and deterministic; use the real one where a ViewModel needs it, with a fixed birth instant.
- [ ] For each of the six ViewModels write at least two tests that assert observable state after an action, chosen from what the ViewModel actually does (read its file). Likely candidates: DashboardViewModel exposes a chart and reading for the stored profile and culture; LocationSearchViewModel searches the packaged city list offline and saves a profile with the location's zone; TransitsViewModel lists spans for the profile and exposes one by id; HorizonViewModel produces the week, season and year for a date; ForecastViewModel produces the twelve-month spans and a solar return; SynastryViewModel compares the stored chart against a second party and never persists the party. Name each test after the behaviour.
- [ ] Every test must fail if the behaviour is removed. State in the report that you checked at least one per class by temporarily breaking the ViewModel and then restoring it.
- [ ] Android checks green; report the new total test count. Commit `test(android): every ViewModel runs against fakes`.

---

### Task 7: The balance reaches Android's Egypt doorway

**Files:** Modify `web/scripts/outline-signs.mjs` (one more sign), `web/scripts/gen-android-emblems.mjs` (one more typeset sign), `android/app/src/main/java/com/astra/antiqua/ui/brand/TypesetSigns.kt` (generated; do not hand-edit), `android/app/src/main/java/com/astra/antiqua/ui/screens/VoiceScreen.kt` (`figuresFor`), create `docs/design/system/assets/marks/ts-balance.svg`.

- [ ] Web's Egypt doorway shows two tier-3 figures, the ankh and the balance (`web/src/app/voices/[culture]/page.tsx`, `CULTURE_FIGURES.egypt`: "THE BALANCE · GARDINER U38, U+1335D"). Android's shows only the ankh because it has no outline for U+1335D. Add a fourth entry to `SIGNS` in `web/scripts/outline-signs.mjs`: file `ts-balance.svg`, culture Egypt, label "The balance", family `Noto Sans Egyptian Hieroglyphs` (css `family=Noto+Sans+Egyptian+Hieroglyphs`), codepoints `[0x1335d]`. The script fetches the TTF the same way it does for the other three. Run the script; confirm the new SVG follows the 512 grid and `fill="currentColor"` convention, and that the three existing SVGs are byte-identical after the run.
- [ ] Run `node scripts/check-svgs.mjs docs/design/system` from the repo root.
- [ ] Extend `web/scripts/gen-android-emblems.mjs` so `TypesetSign` gains `BALANCE` from `ts-balance.svg`, regenerate `TypesetSigns.kt`, and add `TileMark.Sign(TypesetSign.BALANCE)` after the ankh in `figuresFor(AncientCulture.EGYPT)` in `VoiceScreen.kt`, with the same caption convention the other signs use there.
- [ ] Android checks green. Commit `feat(android): the balance stands beside the ankh on Egypt's doorway`.

---

### Task 8: The rebrand's verification evidence and final report

**Files:** Modify `web/scripts/screenshot.mjs` (the `--seed-chart` seed is stale); create `docs/design/screenshots/phase10-verification/*.png`; create `docs/web-rebrand-report.md`.

- [ ] **Fix the seed.** `web/scripts/screenshot.mjs` seeds `astra-antiqua.saved-charts.v2`, but `web/src/lib/savedCharts.ts` now stores one chart under a `chart.v3` key with a different shape, and the onboarding flag may have moved too. Read `savedCharts.ts`, `savedNatal.ts` and the welcome flow to find the current keys and shapes, and update `SEED` so `/charts`, `/transits` and the home natal modules render for a seeded reader (Rome, 1990-06-15 14:30, Rome Italy, 41.9028 / 12.4964).
- [ ] **Run the dev server** from `web/` in the background (`pnpm dev`, port 3000; `DATABASE_URL` is not needed for anonymous pages). Stop it when done.
- [ ] **Capture** with the script at scale 1 into `docs/design/screenshots/phase10-verification/` (create it), named `<route>-<culture>-<width>.png`:
  - Desktop 1280: `/` anonymous (rome), `/` seeded (rome), `/week`, `/season`, `/year`, `/transits` and one `/transits/<id>` (take the first id the seeded `/transits` page links), `/forecast`, `/charts` empty and seeded, `/synastry` seeded, `/voices/canaan` full page (`--full`), `/welcome` with cleared storage, `/signin`, `/account` (signed out: capture whatever it shows), `/method`, `/matrix`, `/learn/aspects`, `/this-route-does-not-exist` (the not-found register).
  - The five-voice check, seeded, 1280: `/?culture=egypt`, `greece`, `canaan`, `carthage`, `rome`.
  - Responsive: `/`, `/week`, `/charts` (seeded) and the same `/transits/<id>` at 375 and 768.
- [ ] **Check** in the captures, and record the result: no horizontal scroll at 375 (add a small evaluate to the script that reports `document.documentElement.scrollWidth` against the viewport width, or inspect the PNG width), five distinct grounds and accents across the five-voice set, and no relic tokens. Spot-check redirects with `curl -sI` against `/pantheon/rome`, `/methodology`, `/sign-up`, `/wait-list`, `/onboarding`, `/about`, `/translation-matrix`, recording status and `location` for each.
- [ ] **Write `docs/web-rebrand-report.md`** (the final report the rebrand plan's Task 13 and the brief's verification bar require, never written): what shipped (route map, the missing surfaces delivered); the two honesty deviations (the mocks say Swiss Ephemeris, production names astronomy-engine; the mocks promise a one-time code by email, production keeps email and password because no mailer exists, see `web/src/app/signin/page.tsx` around line 20); the orb-table change and that Android now carries the same table; the later decisions that changed the plan (`8796ef7` one chart per account and the comparison party never stored; `67d67db` the daily line composed from the sky instead of 160 fixed lines; `82f921c` the voice audit that rewrote the handoff's Rome and Egypt ruling phrases); the screenshot index with paths; the five-voice result; the responsive result; the redirect table. Plain prose, no em dashes, short sentences.
- [ ] Commit `docs(web): the rebrand's verification evidence and final report`. PNGs are committed (the repo already carries nine such directories).

---

### Task 9: Bring the plan and design documents up to date

**Files:** Modify `docs/web-ios-android-plan.md`, `docs/android-rollout-plan.md`, `docs/design/IMPLEMENTATION.md`, `docs/shared-content-model.md`, `docs/design/deity-glyphs/README.md`, `docs/design/canvas-1a/DECISIONS.md`, `docs/superpowers/specs/2026-08-24-shared-core-and-ios-foundation-design.md`, `docs/deploy.md`.

Every edit states what is true in the tree today, with the commit that made it true where one exists. Do not delete historical reasoning; correct status lines and add dated notes.

- [ ] `docs/web-ios-android-plan.md`: replace the "Delivery status — 2026-07-12" table with a "Delivery status, 2026-09-29" table. Rows and true states: web reading flow Done; Android reading flow Done (18 screens); content and chart-math parity Done; shared content model Done (generated `shared/content`, consumed by Android and the C# core); auth on web Done; saved charts on web Done, one chart per account on Postgres since `8796ef7`; onboarding + PWA install Done, no service worker; auth + saved charts on Android Not started, needs a deployed backend (owner decision); iOS: a .NET MAUI head with the chart core proven by 39 golden-parity tests, built by CI on macOS, one page, no reading flow; web rebrand Done; Android restyle Done; Android ten bodies and orb table Done; notification delivery Not started, and the fixed corpus was replaced by the sky-composed `dailyMessage.ts` in `67d67db`; PWA widgets Not started; social Out of scope; shared domain extraction Partial (content shared, chart rules still written in TypeScript, Kotlin and C#, pinned to each other by golden tests); CI: web, Android and dotnet workflows (after Task 3). Keep the rest of the document.
- [ ] `docs/android-rollout-plan.md`: in the status block, correct "Long transits and the week / season / year horizons" (done in `4f23517`, `050844c`, `36581e5`); add a dated note that the Room migration gate could not be met as written because the database has been at version 2 since the import commit `02efea4` with no version 1 ever exported, so there is nothing to migrate; schema export is on and the destructive fallback is gone; the first real schema change adds the migration and its test. Note that all seven ViewModels now have unit tests (Task 6) and that the notification corpus named under "What this plan does not cover" no longer exists as fixed lines.
- [ ] `docs/design/IMPLEMENTATION.md`: "Android keeps one birth record where web keeps many" is out of date since `8796ef7` (both keep one; synastry enters the second party on both). The rulings count reads "twenty-five" in one place and "thirty" in another: state 25 frames and 5 exact-only instructions in both. Mark the `aria-hidden` item and the Egypt balance item as done (Tasks 1 and 7). Record that `ReadingDisplay`'s opacity fade is the plain fade `docs/design/system/readme.md` permits, so it stands.
- [ ] `docs/shared-content-model.md`: `ClassicalPlanet` is now `Planet` (Task 5); `AspectVerbs.kt` is generated (Task 4); add the 10 x 5 deity matrix as a row; in the web-only banks list, mark `domainReadings.ts`, `weekReadings.ts`, `seasonReadings.ts`, `oracleDecrees.ts`, `methodologyContent.ts` and `lib/transitReading.ts` as retained legacy banks that no route renders, kept because the brief forbids deleting corpus substance, pending an owner decision.
- [ ] `docs/design/deity-glyphs/README.md`: the "Not done" section still says the glyphs are not wired in and the app prints ♀ beside Isis; replace it with a short "Wired in" note pointing at `docs/design/IMPLEMENTATION.md`.
- [ ] `docs/design/canvas-1a/DECISIONS.md`: the "Still needed from the design project" section lists items now present; update it so only `uploads/rqgvol5zn55g1.jpeg` (over the sync size cap) remains listed.
- [ ] The 2026-08-24 spec: append a dated note under its out-of-scope list that Android was rewired to `shared/content` the next day in `13f428d` and `9922e1c`.
- [ ] `docs/deploy.md`: the hosting decision in `603af3e` (recorded in `docs/law25-checklist.md`) is a Supabase `ca-central-1` (Montreal) Postgres for the database and Vercel for the app, with the s. 17 assessment still owed because the app tier leaves Quebec. Rewrite the "A database" step and the opening paragraph to match; keep the environment-variable table; add that the legal pages return 404 until `web/src/lib/legal/policyFacts.ts` is filled (the build prints this).
- [ ] Every touched file: no em dashes (`rg "—" <file>` must return nothing new). Commit `docs: the plans say what the tree does`.

---

### Task 10: The instrument stacks until it fits

**Files:** Modify `web/src/components/chrome/InstrumentShell.tsx` (breakpoint and its comment), re-capture three PNGs in `docs/design/screenshots/phase10-verification/`, update `docs/web-rebrand-report.md` (responsive table and the defect line).

Found by Task 8's captures: `InstrumentShell` switches to three columns at 720px (`min-[720px]:grid-cols-[minmax(340px,360px)_1fr_minmax(380px,470px)]`), and its two rails alone need 720px, so at 768 wide `/charts` measures 1023, `/synastry` 904 and `/forecast` 881, all scrolling sideways. All three fit at 1024. The brief's verification bar requires no horizontal scroll at tablet width.

- [ ] Change the three `min-[720px]:` utilities in `InstrumentShell.tsx` to `min-[1024px]:` so the instrument keeps its single, reading-first column until the three columns can fit; update the component's comment (it says "below 720px") to say the same in words, and say why (the rails' minimum widths sum to 720). Do not touch column widths, order, or any other component. The nave (`NaveShell`) and the home grid are untouched.
- [ ] Start the dev server, re-capture `charts-seeded-rome-768.png`, `synastry-seeded-rome-768.png` (or whichever 768 names Task 8 used for those three pages) and `forecast-seeded-rome-768.png` with `--report-scroll`, confirm each reports a scroll width equal to 768, and capture the same three at 1024 as `<route>-seeded-rome-1024.png` to show the three-column layout resumes. Stop the server.
- [ ] Update `docs/web-rebrand-report.md`: the responsive table shows the new 768 numbers, the defect paragraph says the fault was found by these captures and fixed in this commit (name the breakpoint change), and the 1024 captures join the index.
- [ ] Web checks green. Commit `fix(web): the instrument stacks until its three columns fit`.

## Rulings made while writing this plan

- The `/account` "SYNC ON/OFF" row the rebrand plan asked for is satisfied by the `SyncFlag` badge the page already renders at its head; no row is added.
- The `feedbackNoun` map is not added: the nouns do not vary by culture in any shipped surface, so a per-culture map would carry five identical copies.
- The `--light-*` and `--glyph-size-*` tokens are not added to `globals.css`: the only light-ground surfaces (the OG cards) render through Satori with literal values, and glyph size is a numeric prop, so neither token would have a consumer.
- The retention-sweep cron is not scheduled: `runRetentionSweep` is a no-op without a mail sender, and the sender is a paid-processor decision for the owner.
- No Room migration is written (see Task 9's note).
