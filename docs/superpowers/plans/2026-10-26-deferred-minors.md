# Deferred Minors sweep (2026-10-26)

Spec: none of its own. The authority is web, which is canonical, and the review findings each
item cites. Source: the deferred Minors in the ledgers of the 2026-09-29 closeout and the
2026-10-20 script reveal, re-checked against this tree on 2026-10-26. The owner chose all four
groups below on 2026-10-26 (session popup).

Branch `claude/deferred-minors`, stacked on PR #7 (`claude/continue-next-stage-7bf3d6`, 5f96a05).

## Global Constraints

- Web is canonical. Where Android differs from web, Android moves to web.
- Never hand-edit `shared/content/*.json` or any generated Android file
  (`ReadingBanks.kt`, `FigureBanks.kt`, `AspectVerbs.kt`, the `*Goldens.kt` test files). Change
  the web source, then run the generator: `cd web && node scripts/gen-android-reading-banks.mjs`.
  If a task changes anything `export-content.mjs` or `export-goldens.mjs` reads, run
  `pnpm export:content` and `pnpm export:goldens` and commit what changes.
- The web tree uses pnpm (`pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm gates`).
- Android: `cd android && ./gradlew testDebugUnitTest compileDebugSources`. If `java` is not on
  PATH, set `JAVA_HOME` to `C:/Program Files/Android/Android Studio/jbr`. Never commit
  `android/local.properties`.
- Before changing anything, record the test counts at your base commit (web pass/skip/fail,
  Android tests/failures). Every count stays green; new tests add to it.
- Code comments match the density and voice of the file they sit in. No em dashes in comments,
  strings or commit messages.
- Commits: `fix(<surface>): <plain sentence>` (surface: web, android, ci), ending with the
  trailer naming the model that wrote the commit, for example
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Reading text: every replacement line below is given verbatim. If a given line fails one of
  web's text tests (`imageEcho.test.ts`, the content-word ratchet, the seven-day rule), keep the
  line's sense, pick the nearest wording that passes, and report the line you used and why.

## Task 1: Android parity, the midheaven spans and the dated back link

### A. Midheaven spans

Web walks the long transits against four natal points: Sun, Moon, Ascendant and Midheaven
(`web/src/lib/season.ts:152-155`, `web/src/components/horizons/YearNave.tsx:85-88`,
`web/src/components/forecast/ForecastExperience.tsx:229-232`, and `buildHomeBundle`). Android's
`natalPointsOf` (`android/.../domain/TransitSpans.kt:38-43`) stops at the Ascendant, and
`NatalChartData` has no midheaven.

Required:
- `NatalChartData` carries `midheaven: Double`, the ecliptic longitude of the Midheaven, computed
  by web's formula in `web/src/lib/ascendant.ts` (`atan2(sin RAMC, cos RAMC * cos obliquity)`,
  normalised to 0-360) with web's fixed mean obliquity, the same constant and RAMC that
  `AstronomyEngine.getAscendant` already uses. No default value: every constructor call,
  previews included, passes it.
- `natalPointsOf` adds `NatalPoint("mc", chart.midheaven)` after the Ascendant, in web's order.
- Every Android screen whose web counterpart feeds `mc` gets the midheaven spans through it.
  List them in the report, and name any web site whose Android counterpart does not exist.
- A JVM test pins the midheaven to web's value for the golden charts: read the expected
  longitude from the exported goldens (`dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json`
  holds `midheaven`; find where Android's tests already read web goldens and follow that), to
  the tolerance the Ascendant parity test uses.
- The span screens already render `"mc"` (`TransitsScreen.kt:247`, `FigureReading.kt:363-366`);
  check them on the emulator: one shot of the year forecast or transits list showing a
  midheaven span for a seeded chart.

### B. "← The day" returns to the figure's own day

Web's figure page links back to its day as `/?date=YYYY-MM-DD` (`FigureDetail.tsx:37`), and the
day page then reads 00:00 UTC on that date (`HomeBody.tsx:31-41`), the same instant the figure
read. A dated day shows `YYYY-MM-DD · 00:00 UTC` with no LIVE flag (`LiveClock.tsx`), drops the
come-back line (`HomeBody.tsx:100`), and closes its centre column with `← BACK TO TODAY`, a link
to the live day (`CenterDecree.tsx:100-103`).

Android's `FigureLinks` (`FigureScreen.kt:180`) sends "← The day" to `Route.DAY`, today's
dashboard, so a figure opened from the week drops the reader on today.

Required:
- A dated day route on Android, `day/{date}` with `date` as YYYY-MM-DD (UTC), and a builder
  beside `Route.figure`. The dashboard composable takes the date; the dashboard's view model
  reads 00:00 UTC on that date instead of now. Without a date, nothing changes.
- A dated day shows the date where the live day shows today's, has no come-back line if the
  Android dashboard has one, and ends its reading with `← BACK TO TODAY`, which goes to the live
  day as the section tabs do (`goToSection(Route.DAY)`).
- "← The day" on a figure opens the dated day for that figure's date, as web does
  (`FigureDetail.tsx:38`): a date that is today (UTC), or does not parse, goes to the live day.
- Tests: the route builder, and a view-model or domain test that a dated day reads 00:00 UTC on
  its date. Emulator: open a figure from the week for a day other than today, tap "← The day",
  shot of the dated day; tap `← BACK TO TODAY`, shot of the live day.

## Task 2: web on phones, `/year` at 375px and the clock before it loads

### A. `/year` at 375px

`YearNave.tsx:55` sets `SegmentRow` to `grid-cols-[150px_1fr_auto]` at every width, and the span
list (`:167`) is a `flex justify-between` row with a `whitespace-nowrap` end date, so at 375px
the span headlines wrap to three lines. `/week` solved the same squeeze in 7638d9e
(`WeekNave.tsx:111,130`): on phones the headline takes a full row of its own.

Required: at 375px no span headline on `/year` wraps past two lines, and the page has no
horizontal scroll. From 640px (`sm`) up, the layout is unchanged. Verify with
`node scripts/screenshot.mjs` against the dev server, `--seed-chart`, at `--width 375` with
`--report-scroll` and `--full`, and at `--width 1280`; look at both shots and name them in the
report.

### B. No `--:--` before the clock knows the time

`HomeExperience.tsx:26` renders `--:-- UTC` as the Suspense fallback, and `LiveClock.tsx:46`
prints `--:--` until mount. Required: no frame prints `--:--`. Until the time is known, the time
slot keeps its width and shows nothing (a hidden placeholder of the same width, hidden from
screen readers too), so the line does not shift when the time arrives. The dated view
(`YYYY-MM-DD · 00:00 UTC`) is unchanged. Add or extend a test if the file has one; otherwise
say how you checked it.

## Task 3: reading text

Each line changes in `web/src/data/` as given, then the Android mirror is regenerated.

| File | Line now | Line after | Why |
|------|----------|------------|-----|
| `permissionsRegister.ts` canaan.sun.refrain | `Your temper to work` | `Your temper at work` | Read after HOLD BACK, "to work" turns the item inside out. |
| `permissionsRegister.ts` canaan.pluto.proceed | `Your grief out loud` | `A mourner's lament` | "Bring your grief out loud" is not English. |
| `decreeBanks.ts` egypt.tightTails[2] | `, and Thoth records it to the hair` | `, and Thoth records it before all else` | A tight figure is under half a degree, not exact; the evidence line prints the orb. |
| `decreeBanks.ts` greece.tightTails[0] | `, to the very degree` | `, and the seer needs no second look` | Same. |
| `decreeBanks.ts` greece.headlines.conjunction.moon | `Ask your household the question you avoid once the krater is mixed.` | `Once the krater is mixed, ask your household the question you avoid.` | "once the krater is mixed" attached to "avoid". |
| `decreeBanks.ts` egypt.headlines.square.moon | `Do not act on the mood you wake up with before the sun is high.` | `Before the sun is high, do not act on the mood you wake up with.` | "before the sun is high" attached to "wake up". |
| `diveDeeperBanks.ts` greece.shared | `The answer given at {group} is the one this place hears too.` | `The answer given at {group} holds here as well, so there is nothing new to ask.` | "this place" names nothing. |
| `diveDeeperBanks.ts` greece.concrete | `Look for {thing}.` | `The day holds {thing}.` | Several `{thing}` items are the reader's own act ("a question you are afraid to ask aloud"), which a reader cannot look for. |
| `diveDeeperBanks.ts` rome.concrete | `Watch for {thing}.` | `The auspices show {thing}.` | Same, for Rome's items. |

Kept, by ruling: Egypt's `Another delay` (WITHHOLD) reads as "keep from causing another delay",
which is the intended sense.

Also in this task:
- Android's `DiveDeeperParityTest` ("a group whose figures are read above points there",
  `android/app/src/test/.../domain/DiveDeeperParityTest.kt:76-91`) pins five literal sentences on
  2026-10-22, one of which changes above. Build each expected sentence from the generated bank
  (`DiveDeeperBanks`' shared line with the group's name in the slot), so the test pins the date's
  fact, not the wording. Then make that fact checked on web: a web test in
  `web/src/lib/diveDeeper.test.ts` that on 2026-10-22 (00:00 UTC, no chart) the third group of
  every culture prints its shared line and is not quiet.
- Search the web tests and Android tests for any other literal copy of a changed line and update
  it from the bank the same way, or to the new text where a literal is the point of the test.
- Regenerate the Android banks and goldens, and run the exporters if they read these banks.

## Task 4: small fixes

- Android `res/values/strings.xml:98`: `figure_failed` becomes `This figure could not be drawn.`
  The button keeps `figure_try_again` (`Try again`), so the screen says it once.
- Android `MethodScreen.kt:159-161` builds `"$licences →"` in Kotlin. Add a string resource
  `method_licences_link` with the value `LICENCES →` and use it for the text; the click label
  keeps `account_licences`.
- `.github/workflows/*.yml`: every job gets `timeout-minutes`: `android` 30, `web` 20,
  `core-tests` 15, `ios-build` 60.
- `web/src/lib/auth/db.ts` `ensureSchema` (around line 133): take the advisory lock inside a
  transaction with `pg_advisory_xact_lock`, so the lock ends with the transaction and the
  bootstrap works behind a transaction-mode pooler: `BEGIN`, the lock, the schema, `COMMIT`; on
  any error `ROLLBACK` (ignore a failure of the rollback itself), release the client with the
  error so the pool discards it, and leave `schemaReady = null` as today. First check that every
  statement in `SCHEMA` may run inside a transaction (no `CREATE INDEX CONCURRENTLY`, nothing
  else Postgres refuses there) and say so in the report. Update the comment above the function
  to say why the lock is transaction-scoped. `pnpm test:db` stays green.
