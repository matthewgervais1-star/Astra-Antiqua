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

---

## Owner decisions, 2026-09-29 (second wave)

The owner answered the four open questions after the first wave: move the orphaned banks to an archive; apply all three design calls; build Android account sync; open the PR (done, #2). The daily-reading prose and the Android sync get their own specs; the four tasks below need none.

### Task 11: Archive the six unwired content banks

**Files:** Move `web/src/data/domainReadings.ts`, `web/src/data/weekReadings.ts`, `web/src/data/seasonReadings.ts`, `web/src/data/oracleDecrees.ts`, `web/src/data/methodologyContent.ts`, `web/src/lib/transitReading.ts` to `docs/archive/web-content/` (same file names); modify `docs/shared-content-model.md` (the retained-legacy-banks paragraph) and add `docs/archive/README.md`.

- [ ] Confirm with `rg -n "domainReadings|weekReadings|seasonReadings|oracleDecrees|methodologyContent|transitReading" web/src web/scripts` that nothing imports the six (only their own files match). Move them with `git mv` so history follows. They keep their `.ts` extension so the prose stays syntax-highlighted; nothing compiles them (`tsconfig` covers `web/` only; confirm `pnpm typecheck` and `pnpm build` still pass and that no lint config walks `docs/`).
- [ ] `docs/archive/README.md`: three sentences saying these are authored banks from before the rebrand, retained because the brief forbids deleting corpus substance, not rendered by any route, and moved here on 2026-09-29 by the owner's decision; list the six with one line each on what they held.
- [ ] `docs/shared-content-model.md`: the retained-legacy-banks paragraph now points at `docs/archive/web-content/`.
- [ ] Web checks green. Commit `chore(web): the six unwired banks move to the archive`.

### Task 12: Rules take the design system's opaque hex

**Files:** Modify `web/src/app/globals.css` (`--color-rule`, `--color-rule-row`), `android/app/src/main/java/com/astra/antiqua/ui/theme/Color.kt` (`Rule`, `RuleRow`), `docs/design/IMPLEMENTATION.md` (the "Two rule colours drift" item moves to "Since closed"); regenerate the preview cards.

- [ ] Web: `--color-rule: #4A3E28` (the system's `--rule-hairline`) and `--color-rule-row: #2A241C` (`--rule-incised`), replacing the alpha bone values `rgb(230 222 204 / 0.16)` and `/ 0.11`. Keep the comment that names the system tokens. Check every consumer that relied on the rules being translucent over a culture ground (search `border-rule`, `bg-rule`, `rule-row`): an opaque hex on a lighter ground (the OG cards, any light surface) may need the `--light-*` values from `docs/design/system/tokens/colors.css`; report each such site rather than guessing.
- [ ] Android: `Rule = Color(0xFF4A3E28)`, `RuleRow = Color(0xFF2A241C)`; the KDoc names the system tokens.
- [ ] Run `pnpm specimens`; the cards with rules change; commit them. Capture `/` and `/charts` at 1280 for Rome and Egypt after the change and put them in `docs/design/screenshots/phase11-design-calls/` so the owner can see the rules on two grounds.
- [ ] `IMPLEMENTATION.md`: move the drift item to "Since closed" with this commit.
- [ ] Web and Android checks green. Commit `feat(design): the rules take the system's incised and hairline inks`.

### Task 13: A display-xs step for the small Cinzel labels

**Files:** Modify `docs/design/system/tokens/typography.css` (the canonical scale), `web/src/app/globals.css` (`--text-display-xs` and its utility), `android/app/src/main/java/com/astra/antiqua/ui/theme/Type.kt`, every web site that sets Cinzel at a literal size between 11 and 17px (about sixty; find them with `rg -n "font-display" web/src --glob "*.tsx"` combined with literal `text-[NNpx]` classes, and any `fontSize` on a Cinzel element), the matching Android sites (`Type.kt` lines 148 to 150 and any `fontSize =` on a Cinzel style), `docs/design/IMPLEMENTATION.md` ("A display step under 22px" moves to "Since closed"); regenerate the preview cards; the controller pushes the token file to the design project afterwards.

- [ ] Derive the step from the scale in `typography.css` (52 / 40 / 26 / 22): state the ratios, take the smallest step ratio (26 to 22), apply it once below 22, and round to a whole pixel (the arithmetic gives about 18.6, so 18px unless the file's comments prescribe another rule). Add `--type-display-xs` to `typography.css` with the same tracking and leading as the display scale, and a one-line comment that the owner added the step on 2026-09-29 to house the small labels the sweep had left literal.
- [ ] Web: add `--text-display-xs` (and tracking/leading if the scale binds them per step) to `globals.css` beside `--text-display-s`, so `text-display-xs` exists as a utility. Sweep: every Cinzel site at 14 to 17px moves to `text-display-xs`; sites at 11 to 13px are microcopy and move to the mono data scale (`text-data-s` or `text-data-xs`, `font-mono`) unless the element is a heading, in which case it also takes `display-xs`. Report the count moved to each and the list of any site left literal with the reason.
- [ ] Android: the equivalent in `Type.kt` (a `displayXs` style) and the same sweep over Compose sites.
- [ ] `pnpm specimens`; commit the changed cards. Capture `/`, `/week` and `/charts` at 1280 (Rome) into `docs/design/screenshots/phase11-design-calls/` and open them to confirm no row broke.
- [ ] Web and Android checks green. Commit `feat(design): a display-xs step, and the small labels move onto the scale`.

### Task 14: Spectral SC promoted to the tokens and carried to Android

**Files:** Modify `docs/design/system/tokens/typography.css` and `fonts.css` (Spectral SC is already named there; add whatever the prototype in `globals.css` lines about 175 to 225 defines that the tokens lack, for example the small-caps display size, tracking `--track-display-sc` and which surfaces use it), `web/src/app/globals.css` (the prototype block becomes token-driven), `web/scripts/fetch-fonts.mjs` (TTF pass adds Spectral SC 400 and 500 for Android), `android/app/src/main/res/font/` (the two TTFs), `android/app/src/main/java/com/astra/antiqua/ui/theme/Type.kt` (a `displaySc` family and style), the four non-Roman culture themes in `ui/theme/Theme.kt` (or wherever the display face is chosen per culture), `docs/design/IMPLEMENTATION.md` ("The Spectral SC display decision" moves to "Since closed"), `docs/design/system/readme.md` (the line that says the small-caps treatment is "not yet the rule").

- [ ] Read the prototype in `globals.css` first and write down, in the report, exactly what it does (which selectors, which cultures, which sizes and tracking) before moving any of it.
- [ ] Tokens: promote the values into `typography.css` (`--track-display-sc` exists at 0.06em; add the size step(s) the prototype uses if they are not on the scale) and make the web block consume the tokens. Keep Cinzel's tracking as it is; the readme's open question about Cinzel's tracking on small caps is answered by leaving Cinzel untouched and giving Spectral SC its own `--track-display-sc`.
- [ ] Android: extend `fetch-fonts.mjs`'s TTF mode with `family=Spectral+SC:wght@400;500`, run it, and confirm two files land in `res/font/` with lowercase underscore names; SIL OFL already covers the family (the attributions file lists Spectral; add Spectral SC beside it). In `Type.kt` add the family and a `displaySc` style; in the theme, the four non-Roman cultures (Egypt, Greece, Canaan, Carthage) take Spectral SC for the display slots the web prototype switches, and Rome and the shell keep Cinzel, exactly as the web block does.
- [ ] Capture the five-voice home set at 1280 (`/?culture=<c>` for the five) into `docs/design/screenshots/phase11-design-calls/`. An Android screenshot is not required (no emulator in CI); state that.
- [ ] `IMPLEMENTATION.md` and the readme updated. Web and Android checks green. Commit `feat(design): Spectral SC is the rule on the four non-Roman surfaces`.

### Task 15: The day page speaks to the reader (reading anatomy, phase 1)

**Spec:** `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`, sections A.1 to A.5, A.7, C and D (read it first; it is the requirement). Runs before Tasks 11 to 14 because it answers the owner's first complaint. Phase 2 (the figure page, spec section B) is Task 16 and phase 3 (dive deeper, A.6) is Task 17; do not build them here, but shape the banks file so they can be added beside these.

**Files:** Create `web/src/data/deityDomains.ts`, `web/src/data/decreeBanks.ts` (relations, consequences, images, instructions, no-second-figure lines, per culture and kind); modify `web/src/lib/decree.ts`, `web/src/lib/dailyMessage.ts`, `web/src/lib/weekReading.ts` (`composeAspectSentence` and the day lines), their tests (`decree.test.ts`, `dailyMessage.test.ts`, `deityCharges.test.ts` or its replacement), `web/scripts/gen-android-reading-banks.mjs` and the generated `android/.../domain/ReadingBanks.kt`, the Kotlin composer that mirrors `composeDecree` and the week line (find it: `rg -n "ReadingBanks\." android/app/src/main`), and `docs/design/reading-voice.md` (the "one ask per screen" amendment and the new shape). Delete `deityCharges.ts` and `aspectFrames.ts` only if nothing else reads them (`rg -n "deityCharges|aspectFrames|DEITY_CHARGES|ASPECT_FRAMES" web/src android web/scripts`).

- [ ] Author the banks to the spec's shape and rules, the 125 headlines included. Render all 45 body pairs × 5 kinds × 5 cultures through the meaning sentence and read them; fix any domain that cannot sit in a relation's subject slot. Read the 125 headlines aloud in your head: each is a sentence to a friend, and no two share a clause.
- [ ] Rewrite `composeDecree` to the headline + evidence line + five-sentence shape (`DayDecree` gains an `evidence` field: deity names, aspect glyph, orb or EXACT), `composeDailyMessage` to headline + sentences 1, 2 and 5, and the week day to headline + sentences 1 and 2. Update `CenterDecree.tsx` to render the headline as display type and the evidence line in mono beneath it, and `WeekNave.tsx` to show each day's headline above its line; mirror both on Android's dashboard decree card and week screen.
- [ ] The permissions module (`PermissionsModule.tsx`, `lib/permissions.ts`) renders for readers without a natal chart, deriving from the day's sky figures; its "WHY THESE" link still targets the aspects rail. Report what the module needed to allow that.
- [ ] Tests: the five-voice check (no shared sentence across cultures for one figure); a per-culture golden of one date; the exact tail appears only when the orb is under 0.5°; the daily message is a strict subset of the decree; no bank line contains a hedge word, an abstraction from the spec's list, or an em dash (a test walks the banks).
- [ ] Regenerate the Android banks; port the composer change to Kotlin; add a JVM parity test that one date per culture prints the same paragraph on both surfaces (compute the chart with each surface's own engine at the same instant and compare the strings).
- [ ] Dump six dates for five cultures to the report and read every line for flow before committing. Web and Android checks green. Commit in two: `feat(web): the daily reading speaks to the reader` and `feat(android): the daily reading speaks to the reader`.

### Task 16: The figure page (reading anatomy, phase 2)

**Spec:** section B of `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`, plus C and D for the banks and Android. Depends on Task 15's banks and composers.

**Files:** `web/src/components/transits/TransitDetail.tsx` and its spine data (`web/src/data/transitSpine.ts` stays for the slow-body spine where the spec keeps it; the new anatomy wraps it), a new route `web/src/app/day/[date]/figure/page.tsx` (or the id scheme the implementer justifies) for fast-body figures, `web/src/lib/figureReading.ts` (composition), `web/src/lib/recurrence.ts` (period per body and kind, the in-orb window for fast bodies), new banks in `web/src/data/` (slow headlines, manifestations, try-this cards, lessons), tests, the Android transit detail screen and a matching fast-figure screen, the generator, `docs/design/reading-voice.md`.

- [ ] Author the banks (spec C): 125 slow headlines, 160 manifestations, 150 try-this cards, 25 lessons, the five "how this plays out" section titles. Every try-this card names a real attested object, text or rite, with a one-line source; nothing invented.
- [ ] Build the anatomy B.1 to B.9 on web: the two-move paragraph (natal placement recast in second person from `PLANET_IN_SIGN`, then now), the decomposed sentence with its three mono tags, recurrence computed from the body's period and the kind, the four-tick timeline with the present marked, the manifestations keyed by (culture, house group of the natal point, tone), the three cards, the lesson, the feedback row and links.
- [ ] Recurrence: state the periods used (Moon sidereal 27.32 d; Sun 365.25 d; Mercury and Venus synodic 115.9 d and 583.9 d; Mars sidereal 687 d; Jupiter 11.86 y; Saturn 29.46 y; Uranus 84 y; Neptune 164.8 y; Pluto 248 y) and divide by one for conjunction and opposition and by two for the others; render "about every {n} {unit}" in the culture's calendar words where the culture has them (a Roman nundinal week is not a seven-day week; say "about every eight days" rather than lie).
- [ ] Android: mirror the composition and screens; regenerate the banks; extend the parity test with one figure per culture.
- [ ] Screenshots of one figure page per culture at 1280 and 375 into `docs/design/screenshots/phase12-reading-anatomy/`. Web and Android checks green. Commits `feat(web): the figure page, read the way the reference reads it` and `feat(android): the figure page`.

### Task 17: Dive deeper (reading anatomy, phase 3)

**Spec:** section A.6 of the same spec. Depends on Tasks 15 and 16.

**Files:** `web/src/components/home/DiveDeeper.tsx` (new), `web/src/lib/dayPressure.ts` (its buckets feed the four groups), new banks (group titles, group quiet lines, the per-group composition), the day page and the week's day pages, tests, Android's dashboard and week screens, the generator.

- [ ] Four titled paragraphs per day in the culture's house-group names, two or three sentences each from the figures that touch the group (natal buckets when a chart exists, sky-figure domains otherwise), ending in one concrete line; the group quiet line when nothing is in orb; the culture's come-back line closes the page.
- [ ] Tabs or an in-page list: follow the nave's existing patterns (SectionDivider and DataRow), no new chrome.
- [ ] Android mirror; parity test extended. Screenshots of the day page's dive-deeper block in five cultures into `phase12-reading-anatomy/`. Checks green. Commits `feat(web): dive deeper, by house group` and `feat(android): dive deeper`.

### Task 18: Android account sync

**Spec:** `docs/superpowers/specs/2026-09-29-android-account-sync.md` (the requirement). Runs after Tasks 11 to 14. Split into three dispatches: 18a the client and repository with tests; 18b the three screens and navigation with ViewModel tests; 18c the emulator pass against `pnpm dev` with screenshots and the report.

- [ ] 18a: `BuildConfig.API_ORIGIN` with the debug default and the release property; the network security config for `10.0.2.2` in debug only; the cookie session store in encrypted DataStore; the OkHttp client that sends the cookie, sends no `Origin`, stores `Set-Cookie` on signup and signin, and clears the store on a 401; `AccountRepository` interface, real implementation, fake; the chart mapping both ways; JVM tests for the repository against a fake HTTP layer. Commit `feat(android): a session, a client and a repository for the web account`.
- [ ] 18b: THE RECORD, ACCOUNT and THE ROLL screens on the nave chassis; routes in `Destinations.kt`; the shell's account entry; sync on sign-in and sign-up by the web's merge rule; mirror on profile save; export via `ACTION_SEND`; strike with type-your-email-to-confirm; ViewModels against the fake with tests. Commit `feat(android): sign in, the account, and the roll`.
- [ ] 18c: the emulator pass in the spec's Verification section, with screenshots into `docs/design/screenshots/phase13-android-sync/`, and `docs/web-ios-android-plan.md`'s row for Android auth and charts updated. Commit `docs(android): the sync pass on the emulator`.

## Rulings made while writing this plan

- The `/account` "SYNC ON/OFF" row the rebrand plan asked for is satisfied by the `SyncFlag` badge the page already renders at its head; no row is added.
- The `feedbackNoun` map is not added: the nouns do not vary by culture in any shipped surface, so a per-culture map would carry five identical copies.
- The `--light-*` and `--glyph-size-*` tokens are not added to `globals.css`: the only light-ground surfaces (the OG cards) render through Satori with literal values, and glyph size is a numeric prop, so neither token would have a consumer.
- The retention-sweep cron is not scheduled: `runRetentionSweep` is a no-op without a mail sender, and the sender is a paid-processor decision for the owner.
- No Room migration is written (see Task 9's note).
