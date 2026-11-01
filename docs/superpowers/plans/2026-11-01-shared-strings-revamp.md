# Shared strings revamp, plan of 2026-11-01

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

Tags: FACT names its source; INFERENCE is a judgment; CANNOT CONFIRM is open. The four questions in
"Open decisions" went to Matthew in one popup on 2026-11-01; he took the recommended option on all four
(recorded at the foot). The plan is not started: Task 0 waits for his word.

**Goal:** web, the iPhone app and Android print one set of strings on every screen, and only the layout
differs per screen.

**Architecture:** web authors every printed string once, in a typed catalog beside its data
(`web/src/strings/`). An exporter writes the catalog and a format table to `shared/strings/`, next to the
existing `shared/content/`. Web screens build a pure screen model (slot name to printed text) from that
catalog; an exporter runs those models over fixed cases and writes screen goldens. Android (generated
Kotlin), Swift and C# (the JSON) load the same catalog, and each surface's tests compose the same cases
and must equal the goldens byte for byte.

**Tech stack:** TypeScript and node scripts under `web/` (pnpm), Kotlin and Compose, Swift (`ios/`), C#
(`dotnet/AstraAntiqua.Core`).

**Spec:** Matthew's ask, quoted in `docs/design/android-glass.md` on `claude/android-glass-7a8074`
(lines 474 to 477): "Could we not do a master design revamp that merges and standardizes all the
versions? this way there's no split or differentials other than layout and thats a screen issue that is
solvable?" His popup answer of 2026-11-01: "Pause the port until it lands" (same file, line 512).

## Where things stand (survey of 2026-11-01)

Three read-only agents surveyed the trees on 2026-11-01; their full tables sit in the session notes
folder, and the findings below were spot-checked against the files named.

### What web exports today

- FACT (`web/package.json`, `web/scripts/export-content.mjs`): `pnpm export:content` writes seven files to
  `shared/content/`: `cultures.json`, `deities.json` (50), `planet-in-sign.json` (120), `houses.json` (12),
  `zodiac-signs.json` (12), `aspect-rules.json` (5), `manifest.json`. `pnpm export:goldens` writes chart
  numbers only (4 cases) to `dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json`.
- FACT (same survey): master exports no UI string, no composed-reading template and no date or ordinal
  helper. Not exported: decree, figure, dive-deeper, domain, permission and charge banks; `aspectVerbs`,
  `scriptForms`, `cities`; the Learn pages; `yearNarrative`, `aspectReadings`, `transitSpine`;
  `seasonContent.ts`, `signPhrase.ts`, `WEEK_VOTIVE`, `YEAR_VOTIVE`; `cultureVoice.ts` (weekTitle,
  weekThesis, weekNote, houseGroups); every inline string in `web/src/components/`.
- FACT (git, `claude/ios-branch-parity-895dbc`, 18 commits not on master): that branch's
  `export-content.mjs` adds `reading-banks.json` (25 banks, slot templates `{a}` and `{A}`), `cities.json`,
  `palettes.json`, `method.json`, `glyphs.json`, and `learn.json` through `export:learn`. Master has none of
  them.
- FACT (`web/src/components/horizons/format.ts`, `web/src/components/home/format.ts`): web's date helpers
  are `formatDayMonth`, `formatMonthYear`, `enDashRange` (spaced " – "), `isoWeek`, `mondayOf`, and
  `weekdayUpper`, `dateLongUpper`, `shortDateUpper` (en-US, UTC). Degrees come from three functions with
  two paddings (`chartFormat.ts`, `home/format.ts`, `transits/spanDisplay.ts:128`).

### What Android copies by hand

- FACT (`web/scripts/gen-android-*.mjs`): generated, not hand copies: `ReadingBanks.kt` (about 1317
  strings), `AspectVerbs.kt`, `FigureBanks.kt` and three golden test files (`gen-android-reading-banks`,
  pinned by the DayDecree, Figure and DiveDeeper parity tests); `LearnContent.kt` (`gen-android-learn`,
  no test); `ScriptForms.kt` (pinned by `ScriptFormsParityTest`); `Cities.kt` (no test).
- FACT (`android/app/build.gradle.kts:96`): `assets.srcDir(rootProject.file("../shared/content"))`. Only
  `PlacementContentStore.kt` (`planet-in-sign.json`) and `CultureContentStore.kt` (`cultures.json`) read
  it. Android never reads `deities.json`, `houses.json`, `zodiac-signs.json` or `aspect-rules.json` at run
  time; `DeityRegistryDeitiesJsonParityTest` pins `DeityRegistry.kt` against `deities.json`.
- FACT (master): hand copies `domain/HouseMeanings.kt` (48 strings, mirrors `houses.ts`, no test),
  `model/DeityRegistry.kt` (about 98, tested), `domain/LexiconDictionary.kt` (about 84, Android only, a
  non-blank test), `res/values/strings.xml` (about 85, account and licence copy, no test), and about 370
  literals in screens and view models (no test).
- FACT (`claude/android-glass-7a8074` against master): new hand copies `domain/SkyDay.kt` (25),
  `domain/SkyWeek.kt` with `WeekVoice` (36), `domain/SkySeason.kt` (39), `domain/SeasonStandouts.kt` (82),
  the three Sky screens (66), `ui/components/FeedbackRow.kt` (11). Their tests pin values typed into the
  test, checked once against a node run of `web/src`; no web golden pins them.
- FACT (same survey): Android holds five separate month arrays (`Recurrence.kt`, `ForecastScreen.kt`,
  `HorizonScreens.kt`, `SkyWeek.kt`, `SkyDayScreen.kt`).

### What the iPhone surfaces copy by hand

- FACT (`dotnet/AstraAntiqua.Core/AstraAntiqua.Core.csproj`, master): embeds `shared/content/*.json` by
  glob, less `manifest.json`; `ContentStore.Load()` reads five files. Hand strings sit only in
  `AstraAntiqua.App/MainPage.cs` ("ASTRA ANTIQVA", "House n", "· received"). `GoldenParityTests` pins
  numbers, `ContentStoreTests` completeness; neither pins wording.
- FACT (`claude/ios-branch-parity-895dbc`): the Swift app lives in `ios/AstraAntiqua` and `ios/AstraCore`;
  `ios/project.yml` copies `../shared/content` into the bundle and `ContentStore(directory:)` reads 13 files.
  `Format.swift` ports `format.ts`. Hand copies: moon phase and quarter names, month and weekday
  abbreviations, ordinals, eclipse kinds, the `DayPressure` and `DayDecree` templates, the board forms in
  `SkyDay.swift` and `SkyWeek.swift`, and the chrome in `MoreView`, `CultureView`, `HorizonsView`,
  `TransitsView`, `DayView`, `SkyDayView`, `SkyWeekView`, `Glass.swift`, `Words.swift`, `BirthView`,
  `LearnView`. `ParityTests`, `ContentTests`, `DayPageTests` (`day.json`), `SkyWeekTests`,
  `HorizonParityTests` and `ContentBanksTests` pin composed reading text; no test pins chrome copy.
- FACT (git): `docs/design/prompts/ios-glass-build.md` is on no iPhone branch (history at b6df17c, on the
  design-rounds and glass-round-3 branches). The iPhone web-or-board calls sit in
  `docs/design/ios-layout-2026-10-21.md`, `docs/design/prompts/ios-glass-phase-b-step2.md` and `HANDOFF.md`
  on `claude/ios-glass-phase-b-week` (equal to origin `claude/ios-glass-phase-b-881817`, ce5c54a).

### The board forms against web's

- FACT (canvas https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, version 1793493664-ced5, read only):
  every board from Day to More exists. Kickers differ on 8 of 9 boards (Transit detail matches); section
  labels, titles and count lines on about 22; house titles on 3; data lines and tone words on about 12;
  degree and percent forms on 7. The More page has no web page.
- FACT (Android and iPhone records): the calls made so far, by Matthew's popups of 2026-10-31.

| Item | Web prints | Board prints | Ruled for |
|---|---|---|---|
| Day kicker | `WEDNESDAY · OCTOBER 21, 2026 · {institution}` (INFERENCE from `weekdayUpper`, `dateLongUpper`) | `WED 21 OCT 2026 · {institution}` | board, iPhone and Android |
| Day chart rows label | `WHERE THE DAY FALLS` | `ON YOUR CHART TODAY` | board |
| Day row data line | none | `MERCURY ⚹ NATAL SATURN · 3.0° FROM EXACT · EASE` | board, from web numbers |
| Day row sentence | `{god} {verb} your {god} in the {ordinal}. It touches {arena}.` | a short board line | web ("Web's full sentence") |
| Long transit meta | `THE LONG TRANSIT · ACTIVE`, `OCT 2026 → JUN 2027` | `OPEN NOW · OCT 2026 → JUN 2027`, `3 EXACT · 2 AHEAD · EASE` | board meta, web titles |
| Week kicker | `{institution} · THE WEEK` (`WeekNave.tsx:176`) | `19 → 25 OCT 2026 · {institution}` | board |
| Week title | `SEVEN DAYS WEIGHED` and four other per-culture titles (`cultureVoice.ts`) | `The week` | iPhone board; Android web |
| Week count line | none | `SEVEN DAYS · SIX WEIGHED · ONE QUIET` | board |
| Week row headline | per-day headline | none | Android web (above the line); iPhone off |
| Week shorthand | deity glyphs, `TIGHT`, `→ SIGN3` | planet glyphs, `EXACT`, tone word, full sign | iPhone web plus board additions; Android web |
| Season kicker | `THE SEASON · 23 SEP – 23 OCT` (`SeasonNave.tsx:90`) | `23 SEP → 23 OCT 2026 · {institution}` | open (this revamp) |
| Season title | `THE SEASON OF THE SCALES` | `The Sun in Libra` | Android web |
| Season day line | `DAY 29 OF 31 · CLOSING` | `DAY 29 OF 31 · 2 TO GO` | Android web |
| Season house title | none (parts in `houses.ts:90-93`) | `The eleventh house · The Assembly` | Android board |
| Season sky label | `THE SEASON'S SKY` (straight) | `THE SEASON’S SKY` (curly) | Android web |

- INFERENCE: the two ports already disagree on the week title, the row headline and the shorthand, and
  web prints neither port's kicker. Each call was right for its screen and wrong for the product: the
  split Matthew named is real today.

## Global Constraints

- One printed string per slot per culture. A surface may place, wrap, size, hide behind a tap, or reorder a
  slot; it may not change the slot's characters. "Layout" is position, size, face, colour, wrapping,
  truncation with an ellipsis the reader can open, and which screen hosts the slot.
- The catalog stores the case the reader sees. No surface transforms case (CSS `uppercase`,
  `textAllCaps`, `.uppercased()`, `text-transform`) on a catalog string. Reason: a golden compares
  characters, and a CSS transform is invisible to it.
- Web stays canonical: authored in `web/src/strings/*.ts`; `shared/strings/*.json` is generated and never
  hand-edited (the rule `CLAUDE.md` sets for `shared/content/`).
- Every slot with a culture dimension carries all five cultures (egypt, greece, canaan, carthage, rome).
  The exporter fails on a missing culture; there is no fallback string.
- Characters are exact: `’` (U+2019) against `'`, `–` against `→`, `℞`, `′`, `°`, `·` (U+00B7) with one
  space each side. Files are UTF-8, NFC.
- Dates format in the zone the slot names: Day reads the UTC day (as web's `composeDayPage` and the
  Android Sky Day fix); Week and Season count local calendar days (as web). The slot's format entry
  states which.
- Composed readings keep web's wording as written, "Scales's excuses" and "under via" included, until a
  separate copy pass.
- No em dashes in strings, docs, comments or commits. Commits end with
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Checks run locally (Actions workflows are disabled, `HANDOFF.md` of 2026-10-30): `pnpm test`,
  `pnpm check:shared` (new), `./gradlew testDebugUnitTest`, `dotnet test`, and the Swift tests through WSL.

## The shared-string format

### Files (generated)

- `shared/strings/en.json`: the catalog. A key is `<screen>.<slot>`; a value is a string, or an object
  with one string per culture. Slots in braces fill at run time.

```json
{
  "season.kicker": "{range} · {institution}",
  "season.title": { "egypt": "THE SEASON OF {signEpithet}", "greece": "...", "canaan": "...", "carthage": "...", "rome": "..." },
  "week.countLine": "{days} DAYS · {weighed} WEIGHED · {quiet} QUIET",
  "common.house.heading": "The {ordinal} house · {title}"
}
```

- `shared/strings/formats.json`: named formats with a closed pattern set, so each surface implements one
  small formatter: `date.day` (`EEE d MMM yyyy`, upper), `date.dayMonth` (`d MMM`), `date.monthYear`
  (`MMM yyyy`), `range.days` (same month `19 → 25 OCT 2026`, across months `29 SEP → 5 OCT 2026`, across
  years `29 DEC 2026 → 4 JAN 2027`, or whatever Matthew's table fixes), `angle.degMin` (padding stated),
  `angle.orbDecimal` (`3.0°`), `percent` (`74%`), `count.word` (`ONE` to `TWELVE`, zero as `NONE`),
  `ordinal.word` (`eleventh`), `house.roman` (`II`), `sign.abbr` (`CAP`), and the month and weekday
  abbreviations. Each entry names its zone rule (UTC or local).
- `shared/strings/manifest.json`: source commit, key count, culture count.
- `shared/goldens/formats.json`: input and output pairs for every format, edge cases included.
- `shared/goldens/screens/<screen>.json`: for each fixed case, the printed text of every slot.

```json
{ "cases": [ { "id": "season-egypt-2026-10-21-rome-birth", "culture": "egypt",
  "instant": "2026-10-21T06:00:00Z", "zone": "Europe/Rome", "birth": "smoke",
  "slots": { "season.kicker": "23 SEP → 23 OCT 2026 · THE HALL OF MA’AT", "season.rows": ["..."] } } ] }
```

### How each surface loads it

- Web: imports `web/src/strings/*.ts` directly; screen models in `web/src/lib/screens/<screen>.ts` return
  the slot map, and components render from it.
- Android: `web/scripts/gen-android-strings.mjs` reads `shared/strings/en.json` and `formats.json` and
  writes `android/.../domain/generated/SharedStrings.kt` (one `const val` or per-culture `Map` per key) and
  `SharedFormats.kt`. Reason: a missing key fails the compile, and it follows the `gen-android-*` pattern
  the banks already use. The generators that now read TypeScript (`gen-android-reading-banks`,
  `gen-android-learn`) move to reading the exported JSON, so one pipeline runs TS to JSON to Kotlin.
- Swift: `ios/project.yml` adds `../shared/strings` beside `../shared/content`; `AstraCore` gains a
  `Strings` loader and a `Formats` port. Missing key: a test fails, the app prints the key.
- C#: the csproj glob adds `shared/strings/*.json`; `ContentStore` gains `Strings` and `Formats`.
- Goldens: Android reads `shared/goldens/` from test resources (`sourceSets["test"].resources.srcDir`);
  Swift from the test bundle; C# as embedded test data.

## How a board form becomes a named shared string

1. The conflict table (Task 1) lists each slot with web's form, the board's form, each port's form, the
   default under the rule Matthew picks, and the source line of each.
2. Matthew rules each row once: web, board, or a new form he writes. One ruling binds all three surfaces.
3. The winner enters `web/src/strings/<screen>.ts` under its slot key, with the board ID (P33 and so on)
   in a comment. Web prints it too, so web changes where the board wins.
4. `pnpm export:strings` writes the JSON; `pnpm export:screen-goldens` writes the goldens; each surface
   regenerates or reloads and its golden test goes green.

Example, the season kicker. Web prints `THE SEASON · 23 SEP – 23 OCT`; the board and Android print
`23 SEP → 23 OCT 2026 · THE HALL OF MA’AT`. Under the default rule (board for chrome) the catalog reads
`"season.kicker": "{range} · {institution}"` with `range` from `range.days`; web's `SeasonNave.tsx:90`
drops `THE SEASON · ` and `enDashRange` for the model's slot; Android's `SkySeasonScreen.kt:169` and the
Swift Season view read `SharedStrings.SEASON_KICKER`. If Matthew rules for web, the key reads
`"THE SEASON · {range}"`, `range.days` prints `23 SEP – 23 OCT`, and both ports change instead.

## Review Focus

1. Ranges across a month end and a year end (`29 SEP → 5 OCT 2026`, the Capricorn season of 2026-12-30):
   one `range.days` rule must cover all three shapes. Test: `formats.json` pairs, all three surfaces.
2. The UTC day against the local day: in Montreal the sample instant reads DAY 30 OF 32 where Rome reads
   DAY 29 OF 31 (`android-glass.md` line 204). Test: every screen golden case names its zone, and one case
   runs in America/Montreal.
3. A reader with no birth record: slots that need a chart either carry a chart-less form in the catalog
   or are absent from the model, never blank. Test: one no-chart case per screen.
4. Zero and plural counts (`NONE QUIET`, `ONE QUIET`, `1 RETURN REMAINS`): Test: count cases 0, 1, 2, 7.
5. Look-alike characters (`'` and `’`, `-` and `–`, `R` and `℞`): byte comparison catches them only if the
   goldens hold the real characters. Test: `check:shared` rejects ASCII apostrophes and hyphen ranges in
   catalog values unless the key is listed as allowed.

## Tasks, in order, with size

Size is in sessions of one implementer plus one reviewer (the token rules in the user's global
instructions). INFERENCE: about 11 sessions in all, the conflict ruling included.

### Task 0: land the iPhone exporters on master (1 session)

**Files:** `web/scripts/export-content.mjs`, `web/package.json`, `shared/content/*` from
`claude/ios-branch-parity-895dbc`; `dotnet/AstraAntiqua.Core` where it reads the new files. The MAUI head
stays out (answer 4).
- [ ] Bring the branch's exporter changes (reading banks, cities, palettes, method, glyphs, learn) onto a
  branch off master; regenerate; `pnpm test`, `dotnet test` green.
- [ ] Android's generators keep their outputs byte-equal (diff `ReadingBanks.kt` before and after).
- [ ] Commit; PR on Matthew's word.

### Task 1: the conflict table and Matthew's rulings (1 session, with Matthew)

**Files:** create `docs/design/shared-strings-table-2026-11.md`.
- [ ] One row per slot on Day, Week, Season, Year, Transits, Chart, Placement, Transit detail, More, the
  culture sheet, the Doorway and the chrome (tabs, horizon control, footer links): slot key, board ID, web
  form with `file:line`, board form, Android form, Swift form, default under the rule.
- [ ] Include the Android-only `LexiconDictionary.kt` vocabulary and `strings.xml` account copy: each row
  is either adopted by web or dropped from Android.
- [ ] Include Sky Season's "Changes first" (`android-glass.md` line 510): ask Matthew to name them here.
- [ ] Send the table to Matthew; record each ruling in the table with the date. No code changes.

### Task 2: the web catalog, formats and exporter (2 sessions)

**Files:** create `web/src/strings/{common,day,week,season,year,transits,chart,placement,transit,more}.ts`,
`web/src/strings/formats.ts`, `web/scripts/export-strings.mjs`, `web/scripts/check-shared.mjs`; modify
`web/src/components/horizons/format.ts`, `web/src/components/home/format.ts`, `chartFormat.ts`,
`transits/spanDisplay.ts` to call one formatter; `web/package.json` (`export:strings`, `check:shared`).

**Interfaces:**
- Produces: `str(key: StringKey, culture: Culture, slots?: Record<string, string>): string`;
  `fmt(name: FormatName, value: Date | number, zone: "UTC" | string): string`; type `StringKey` as the
  union of catalog keys.
- [ ] Failing test `web/src/strings/strings.test.ts`: every per-culture key has five cultures; every
  `{slot}` in a value is a declared slot; `str("season.kicker", "egypt", {...})` equals the ruled form.
- [ ] Failing test `web/src/strings/formats.test.ts` over the `formats.json` pairs, Review Focus 1 and 4
  included.
- [ ] Implement; move the inline strings each ruled row names out of components into the catalog.
- [ ] `check-shared.mjs`: rerun both exporters into a temp folder and diff against `shared/`; fail on any
  difference, on Review Focus 5, and on a case transform applied to a catalog string in `web/src`.
- [ ] `pnpm test`, `pnpm check:shared`, `tsc`, `eslint` green; commit.

### Task 3: web screen models and screen goldens (2 sessions)

**Files:** create `web/src/lib/screens/<screen>.ts` per screen, `web/scripts/export-screen-goldens.mjs`,
`shared/goldens/screens/*.json`; modify `SeasonNave.tsx`, `WeekNave.tsx`, `YearNave.tsx`,
`CenterDecree.tsx`, `TransitsIndex.tsx`, `ChartsInstrument.tsx`, `PlacementReading.tsx`, `TransitDetail.tsx`
to render from the model.

**Interfaces:**
- Produces: `buildSeasonModel(input: ScreenInput): SlotMap` and one builder per screen, where
  `ScreenInput = { culture, instant, zone, birth | null }` and `SlotMap = Record<string, string | string[]>`.
- [ ] Fixed cases: the smoke birth (Rome 1990-01-15 04:30 UTC) at 2026-10-21 06:00 UTC in Europe/Rome for
  all five cultures; 2025-03-01 (the eclipse ranking); 2026-12-30 (year end); the week of 29 SEP 2026;
  no birth; America/Montreal. Set the zone inside the script (`TZ=` from Git Bash does not take, per
  `android-glass.md` line 399).
- [ ] Failing test: each model's slot set equals the slot list in the table for that screen.
- [ ] Implement; `export-screen-goldens.mjs` writes one file per screen; `check:shared` covers it.
- [ ] Headless Chrome check (`web/scripts/check-script-reveal.mjs` pattern) still passes at three
  viewports; commit.

### Task 4: Android loads the catalog (2 sessions)

**Files:** create `web/scripts/gen-android-strings.mjs`, `domain/generated/SharedStrings.kt`,
`SharedFormats.kt`, `app/src/test/.../ScreenGoldenTest.kt`; modify `build.gradle.kts` (test resources
from `../shared/goldens`); replace the hand strings in `HouseMeanings.kt`, `SkyDay.kt`, `SkyWeek.kt`
(`WeekVoice`), `SkySeason.kt`, `SeasonStandouts.kt`, `FeedbackRow.kt`, the three Sky screens, and the five
month arrays; move `gen-android-reading-banks` and `gen-android-learn` onto the JSON.
- [ ] Failing `ScreenGoldenTest`: for every case in `shared/goldens/screens/{day,week,season}.json`, the
  Android composer's slot map equals the golden.
- [ ] Failing `SharedFormatsTest` over `shared/goldens/formats.json`.
- [ ] Implement on top of `claude/android-glass-7a8074` (steps 1 to 4); the screenshot tests' gap checks
  still hold to 0.1.
- [ ] `./gradlew compileDebugSources testDebugUnitTest` green (275 at 95afe84, plus the new tests); commit.
- [x] Moved out of Task 4 (2026-11-01, review of 2ea0cd4): "move `gen-android-reading-banks` and
  `gen-android-learn` onto the JSON" now sits in Task 4a below. INFERENCE: the lead or Matthew still
  confirms this move or sends the item back to Task 4. Until Task 4a lands, the line "one pipeline runs TS
  to JSON to Kotlin" under "How each surface loads it" holds for `gen-android-strings` only.

### Task 4a: move the two TypeScript-reading Android generators onto the JSON (1 session, follow-up)

FACT (`shared/content/reading-banks.json`, `web/scripts/gen-android-reading-banks.mjs`,
`web/scripts/gen-android-learn.mjs`, checked 2026-11-01): `reading-banks.json` holds no decree, figure or
dive-deeper banks and no permissions register; `gen-android-reading-banks` also runs web's composers to
write the golden test files; `gen-android-learn` is itself the writer of `shared/content/learn.json`, and
`LearnContent.kt` carries the zodiac signs, which `learn.json` does not hold.
- [ ] Widen `export-content.mjs` so `reading-banks.json` carries the decree, figure and dive-deeper banks
  and the permissions register; `check:shared` covers the new keys.
- [ ] Split the golden writing out of `gen-android-reading-banks` into a web-side exporter (the
  `export-goldens` pattern), then point the Kotlin generation at the JSON; the DayDecree, Figure and
  DiveDeeper parity tests stay byte-equal.
- [ ] Split `gen-android-learn` into an exporter that writes `learn.json` (with the zodiac signs added)
  and a generator that reads it.
- [ ] `./gradlew compileDebugSources testDebugUnitTest` and `pnpm test` green; commit.

### Task 5: Swift loads the catalog (2 sessions)

**Files:** `ios/project.yml`, `ios/AstraCore/Sources/.../Strings.swift`, `Formats.swift` (replaces
`Format.swift`), `ScreenGoldenTests.swift`; replace hand strings in `Words.swift`, `SkyDay.swift`,
`SkyWeek.swift`, `DayPressure`, `DayDecree`, the views listed in the survey.
- [ ] Failing `ScreenGoldenTests` and `FormatsTests` over the same goldens.
- [ ] Implement; the iPhone placement JSON (`ios/placement/*.json`) still holds.
- [ ] Swift tests green through WSL (full path, per the project memory); the SwiftUI head builds only in
  CI, which is disabled: CANNOT CONFIRM a device build until a workflow is enabled. Commit.

### Task 6: C# loads the catalog (1 session)

**Files:** `dotnet/AstraAntiqua.Core/AstraAntiqua.Core.csproj`, `ContentStore.cs`, new `Strings.cs`,
`Formats.cs`, `AstraAntiqua.Core.Tests/ScreenGoldenTests.cs`. Not `AstraAntiqua.App` (answer 4).
- [ ] Failing tests over `formats.json` and the screen goldens for the screens the core composes.
- [ ] Implement; `dotnet test` green; commit.

### Task 7: resume the Android glass port on the catalog (folds into steps 5 to 11)

- [ ] Each later screen (Year, Transits, Chart, Placement, Transit detail, More, the five cultures) adds
  its slots to the table, the catalog and the goldens first, then builds its layout on each surface. The
  "web string or board form" question no longer arises per screen.

## Open decisions (put to Matthew in one popup, 2026-11-01)

1. The default when web and the board differ: board for chrome (kickers, dates, labels, counts) and web
   for composed prose; web everywhere; board everywhere; or a ruling per row with no default.
2. Where strings are authored: typed web catalog exported to JSON (the repo's rule today), or hand-edited
   JSON as the master.
3. Navigation names: one name per destination on every surface while the bars themselves stay layout
   (CHART against web's CHARTS), or navigation counts as layout and names may differ.
4. The iPhone base: land the Swift branch's exporters on master first (Task 0), take the MAUI head into
   scope too, or start from master and let the Swift app catch up after.

- INFERENCE (decided in this plan, open to Matthew's veto): Android loads generated Kotlin, Swift and C#
  read the JSON; the catalog holds English only, named `en.json` so French can join as `fr.json` once he
  supplies it (an owner input `HANDOFF.md` lists).

## Matthew's answers

FACT (popup, 2026-11-01), each his pick of the four:

1. "Board chrome, web prose": the table's defaults take the board form for kickers, dates, labels and counts
   and web's words for composed readings; Matthew still rules each row in Task 1.
2. "Web catalog, exported": strings are authored in `web/src/strings/`; `shared/strings/` stays generated.
3. "One name per destination": the bars stay layout; each shared destination gets one name, ruled in the
   table's chrome rows.
4. "Swift exporters to master first": Task 0 runs first; the MAUI head stays a skeleton and out of scope
   (Task 6 covers the C# core only, and `MainPage.cs` keeps its strings).
