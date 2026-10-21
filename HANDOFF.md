# HANDOFF, Astra Antiqua, state at 2026-10-20

Read first; this file outranks older lines elsewhere. Tags: FACT (source) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (GitHub PR #2): plan-gap branch to `master`, CI green, mergeable, not merged.
- FACT (GitHub PR #4): `claude/reading-anatomy-495257`, stacked on PR #2's head, holds
  the second wave. Done and reviewed: Tasks 15 to 17 (day page, figure page, dive deeper),
  11 to 14 (archive, rule hex, display-xs 18px, Spectral SC), 18a and 18b (Android sync
  client and screens; Android birth times now use a bundled tz-lookup, as web does).
- FACT (ledger, 2026-10-08): 18c passed on the emulator; whole-branch review of 9804a4e..1d930a3 found 0 Critical,
  1 Important (Room 2->3 migration kept the guessed-zone instant); fixed 1e048b1..44bc3e3.
  Cleanup done and reviewed: C1 LICENCES screen (6292fea); C2 /charts header, /week rows,
  names wrap at 1280 (7638d9e); C3 Android ASC line on web's obliquity, CNC/PSC/AQR on both
  surfaces, transit spans to the true ASC (d30dfa6..440c3ab). C4 Egypt echo tests and rewording, spec A.6/B.3
  (3985cb4..53d42d5, five fix rounds). FACT (ledger, 2026-10-20): final review of
  1d930a3..53d42d5 found 1 Important (river echo in the Egypt transit spine), fixed
  2d16643..65691d1, re-review Approved. At 65691d1: web 112 (95 pass, 17 skipped), Android
  200/0, dotnet 39/0. FACT (ledger): two sessions ran this wave in parallel; the second added
  1c28ac7..3e71306 on top (figure page: river in the title and at most one other line, the
  recurrence line no longer names it; haul once; headlines hyphenate from 1100px; French legal
  pages `fr-CA`), re-review clean. At 5105fd9: web 113 (96 pass, 17 skipped), Android 200/0
  (fresh build), dotnet 39/0. Egypt and Canaan device errors follow the owner's guidance, Carthage and
  Rome approved as written.

- FACT (ledger `.superpowers/sdd/2026-10-20-script-reveal/progress.md`, 2026-10-20): branch
  `claude/script-reveal` (stacked on PR #4, unpushed) holds the owner's script reveal: names in
  attested script resolve to English or French on scroll (spec `2026-10-20-script-reveal.md`).
  Tasks 1 (data, 56 of 60 sourced) and 2 (web, large culture names, picker) done and reviewed.
  Task 3 (Android) built, 078a60e..ee9e774, 215 tests green, NOT yet reviewed. Then Task 4, PR.

## Decisions taken, and why
- 2026-09-29, owner: rebuild the daily readings to the Co-Star anatomy in five voices (spec
  `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`); archive six unwired banks;
  apply three design calls; build Android sync (spec `...-android-account-sync.md`).
- 2026-10-06, controller: the sky picks the figure (always the tightest), the day picks the
  words; recurrence by mean geocentric rates (Sun meets Mercury every 57.9 d, Venus 291.9 d);
  natal day readings read fast bodies first; Android keeps the typed birth date and time
  (Room v3). All rulings with their reasons: the ledger and the plan's Rulings section.

## Pending, in order
1. FACT (GitHub, 2026-10-20): PR #4 head 3e71306, open against PR #2's branch, CI running.
   Owner merges #2, then #4 (squash: web tests are red at 1c28ac7..429136c). Claude Design:
   26 cards pushed from 4e3c1a5, then NaveHead, CenterDecree and specimen.css from 3e71306.
- Owner inputs still needed: mail vendor; deployed API origin for Android release builds;
  `web/src/lib/legal/policyFacts.ts` values; Law 25 assessments; Play keystore; French UI.

## Deadlines
CANNOT CONFIRM: none recorded in this repo; the owner has named none.

## Files that matter
- Plan: `docs/superpowers/plans/2026-09-29-planned-work-closeout.md`. Ledger (git-ignored):
  `.superpowers/sdd/2026-09-29-planned-work-closeout/progress.md` and the task reports.
- Composition: `web/src/lib/decree.ts`, `figureReading.ts`; banks in `web/src/data/`, mirrored
  to Android by `web/scripts/gen-android-*.mjs`. Script forms: `web/src/data/scriptForms.ts`.
