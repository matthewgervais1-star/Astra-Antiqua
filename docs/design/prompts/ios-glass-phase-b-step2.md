# Prompt: Phase B, step 2, Sky Day (2026-10-31)

Paste the fenced block into a new Claude Code session opened on worktree
`L:\Claude Projects\astra-antiqua\.claude\worktrees\ios-glass-phase-b-881817`
(branch `claude/ios-glass-phase-b-881817`).

```text
You are running Phase B, step 2 (Sky Day) of the Astra Antiqua iPhone Liquid Glass port, on branch
claude/ios-glass-phase-b-881817. Read first: HANDOFF.md; the Phase B sections at the end of
docs/design/ios-layout-2026-10-21.md; this file's "Map" section below; ios/README.md;
ios/AstraAntiqua/Theme/Glass.swift (step 1, the chrome: GlassScreen, P1 P2 P3 P17 P20 P55, placement
probes). The design brief's PHASE B paragraph is in the design worktree
L:\Claude Projects\astra-antiqua\.claude\worktrees\astra-antiqua-design-rounds-a1291d at
docs/design/prompts/ios-glass-build.md; its tables are under that worktree's
.superpowers/sdd/glass-build/ (report.md has the Day table P4 to P16; report-r7.md the specs). The
board is project/Glass-Day.dc.html on canvas https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V
(Artifact read with that path).

Matthew's decisions of 2026-10-31 (popup) bind:
1. Merge origin/master into this branch (never force-push, push only on his word), fix
   web/scripts/export-content.mjs against master's banks, regenerate shared/content and the
   goldens (npm run export:content, export:learn, export:goldens), add a day-page golden.
2. Board sections, web strings: keep Glass-Day's sections in its order, filled with the web's
   composition: kicker institution, headline, evidence line, paragraph (master's composeDayPage);
   the WHERE THE DAY FALLS clauses (dayPressure) for the chart rows; the web's own long-transit
   pick (buildHomeBundle's buildLongTransit). Moon and Season lines from the Swift ports. The
   web's votive, permissions, dive deeper and come-back line stay off Sky Day.
3. Board's forms where the web has no string: the kicker date form WED 21 OCT 2026, the label
   ON YOUR CHART TODAY, each chart row's data line (e.g. VENUS △ NATAL JUPITER · 0.8° FROM EXACT ·
   EASE) built from the web's numbers.
4. This step runs in its own session. One implementer agent and one reviewer (Opus for the
   review); stop after two fix rounds on Minor findings.

Work: port the composition into ios/AstraCore (master's Android port, gen-android-reading-banks.mjs
and DayDecree.kt with its goldens, is the template), pin it with a golden test against the web's
output for the sample state (2026-10-21 06:00 UTC, the smoke birth
dotnet/AstraAntiqua.Core.Tests/TestData/smoke-birth.v1.json, five cultures), run AstraCore's tests
under WSL Swift (command in ios/README.md); build Sky Day on GlassScreen (horizon .day, section .sky)
from the board's markup and the P4 to P16 table; wire GlassScreen into MainTabs in place of the
system TabView (SKY holds DAY, WEEK, SEASON, YEAR; Today and Horizons merge); add the screenshot
capture "sky-day" and ios/placement/sky-day.json; list every ID that differs from the table by
more than a point and why (the web's copy is longer or shorter than the board's in places).
Then append the layout record and HANDOFF.md with dated FACT lines naming their sources, add a
dated line to ios/README.md, commit, report with the ID list, the commit hash and what CI still has
to prove (Actions disabled since 2026-10-30), show any render in the chat, ask in one
AskUserQuestion popup, and stop. Matthew's rules: no em dashes, no hedging adverbs, dated notes
tagged FACT / INFERENCE / CANNOT CONFIRM.
```

## Map (2026-10-31, read-only research; web from origin/master 45df0fc)

- FACT (`web/src/components/home/HomeBody.tsx:54-100`, data `buildHomeBundle.ts:292`): the web's Day.
  Kicker `CenterDecree.tsx:49` (weekday · date (`format.ts:71,75`, UTC) · institution from
  `data/cultureVoice.ts:33` through `scriptForms.ts`). Headline `decree.ts:152` `composeHeadline`
  (`data/decreeBanks.ts`). Evidence `decree.ts:119` `composeEvidence` ("ISIS □ OSIRIS · 0°25′").
  Paragraph `decree.ts:229-239`: meaning `:141`, consequence `:147`, image `:162`, second figure
  `:176`, instruction `:167`. Figure `decree.ts:242` (Venus □ Pluto, orb 0.4219). `composeDayPage`
  `decree.ts:252` reads the sky at 00:00 UTC; variant `utcDayNumber % 3` (`:92`).
- FACT (same): "THE SKY, COMPUTED" on web is planet rows (`CompactSkyTable.tsx:19`), not Moon and
  Season; the board's Moon and Season lines come from the Swift ports `MoonPhase.swift:92`,
  `Season.swift:53`. "ON YOUR CHART TODAY" is a board label; its web source is "WHERE THE DAY
  FALLS" (`DayPressureModule.tsx:21`, `dayPressure.ts:167`, `rankContacts` `:86`). Long transit:
  `LongTransitBox.tsx:41-58`, builder `buildHomeBundle.ts:222` (smallest current orb, `:244`).
- FACT (`web/scripts/export-content.mjs` on this branch): stale against master; it imports
  `data/aspectFrames.ts` (deleted on master), `INGRESS_VERB`, `EXACT_FORMS`, `SUMMARY_INTRO`. Banks
  on master no JSON carries: `decreeBanks`, `QUIET_HEADLINE`, `deityDomains`, `cultureVoice`,
  `figureBanks`, `diveDeeperBanks`, `permissionsRegister`, `DAY_VOTIVES`, `scriptForms`,
  `SIGN_IMAGE`, `aspectRulings`. Master's `gen-android-reading-banks.mjs` emits all of them for
  Android (`DayDecree.kt`, `DayDecreeGoldens.kt`).
- FACT (`ios/AstraAntiqua/Screens/DayView.swift`, `WeekReading.swift`): the Swift day is a port of
  the MAUI page: noon UTC, a used-pairs rule (orb 0.35), no decree, institution, evidence,
  long-transit card or day pressure. `TransitSpans.compute` exists (`:216`).
- FACT (`ios/AstraCore/Tests/AstraCoreTests/ParityTests.swift`, `Fixtures.swift`): goldens from
  `dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json` and `horizons.json`; no day-page fixture;
  the week goldens predate master's composition.
- FACT (design worktree `.superpowers/sdd/glass-build/compose-day-r6.mjs`, `day-r6.json`): runs the
  real `composeDayPage` for the five cultures from `web/` with `node --import
  ./scripts/register-alias.mjs`; the chart rows and the long-transit span were hand-picked there, so
  the app must call `dayPressure` and `buildLongTransit` instead. Orbs at the sample instant: Venus
  △ Jupiter 0.7508 (0.8°), Neptune □ Jupiter 1.0649 (1.1°).
