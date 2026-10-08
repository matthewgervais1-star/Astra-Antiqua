# HANDOFF, Astra Antiqua, state at 2026-10-06 (late evening)

Read first. Where this file and an older line in `CLAUDE.md` or any index disagree, this
file wins. Tags: FACT (with its source file) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (GitHub PR #2): `claude/planner-buildout-completion-495257` to `master`, CI green,
  mergeable, not merged. It closed every plan gap that needed no owner decision.
- FACT (`git log`): `claude/reading-anatomy-495257`, stacked on PR #2's head, unpushed, holds
  the second wave. Done and reviewed: Tasks 15 to 17 (day page, figure page, dive deeper),
  11 to 14 (archive, rule hex, display-xs 18px, Spectral SC), 18a and 18b (Android sync
  client and screens; Android birth times now use a bundled tz-lookup, as web does).
  Web 98 and Android 173 tests green (Android count from `task-18c-report.md`).
- FACT (`task-18c-report.md`, commits 92c04b2 to 86eca0a): Task 18c passed all ten emulator
  steps and fixed four device defects: TODAY opened the birth form, a recast kept the old
  chart, placements truncated the minute, the CULTURE row sat off CHANGE's line. 27
  screenshots, test address redacted, in `docs/design/screenshots/phase13-android-sync/`.
  Open from it: Android prints no Ascendant; sign abbreviations differ (CAN/PIS vs CNC/PSC).
- FACT (`git log`, 2026-10-08): the 375px sub-bar fix from the session "Fix 375px horizontal
  scroll on day and week pages" (53addc3, PR #3 to `master`, open) is cherry-picked here as
  d22b4d6. It drops the chip's "CULTURE:" prefix below md. PR #3 can merge or close; either
  way the fix reaches master through this branch.
- INFERENCE: the live checkout `L:\Claude Projects\astra-antiqua` holds an older uncommitted
  `HANDOFF.md`; this file replaces it when the branches merge.

## Decisions taken, and why
- 2026-09-29, owner: rebuild the daily readings to the Co-Star anatomy in five voices (spec
  `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`); archive six unwired banks;
  apply three design calls; build Android sync (spec `...-android-account-sync.md`).
- 2026-10-06, controller: the sky picks the figure (always the tightest), the day picks the
  words; recurrence by mean geocentric rates (Sun meets Mercury every 57.9 d, Venus 291.9 d);
  natal day readings read fast bodies first; Android keeps the typed birth date and time
  (Room v3). All rulings with their reasons: the ledger and the plan's Rulings section.

## Pending, in order
1. A whole-branch review and one cleanup pass over the ledger's
   deferred list. Largest items: no licence screen in the Android app for its five SIL OFL
   font families and tz-lookup (CC0); phone-width overflow (culture chip, /charts header,
   /week headline column); "HORUS THE RED" truncated in the /charts table at 1280;
   the Android Ascendant line and sign abbreviations from 18c.
2. Owner to approve or reword the four Android device-error sentences (Egypt, Canaan,
   Carthage, Rome) in `android/app/src/main/res/values/strings.xml`.
3. Push the branch and open its PR; push the refreshed design-system cards to Claude Design.
- Owner inputs still needed: mail vendor; deployed API origin for Android release builds;
  `web/src/lib/legal/policyFacts.ts` values; Law 25 assessments; Play keystore; French UI.

## Deadlines
CANNOT CONFIRM: none are recorded in this repo, and the owner has named none in session.

## Files that matter
- Plan: `docs/superpowers/plans/2026-09-29-planned-work-closeout.md`. Ledger (git-ignored):
  `.superpowers/sdd/2026-09-29-planned-work-closeout/progress.md` and the task reports.
- Composition: `web/src/lib/decree.ts`, `figureReading.ts`, `diveDeeper.ts`;
  `web/src/data/decreeBanks.ts`, `figureBanks.ts`, `diveDeeperBanks.ts`; Android mirrors via
  `web/scripts/gen-android-reading-banks.mjs`. Android sync: `android/.../data/account/`.
