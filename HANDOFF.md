# HANDOFF, Astra Antiqua, state at 2026-10-22

Read first; this file outranks older lines elsewhere. Tags: FACT (source) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (GitHub, 2026-10-22): `master` (2f38e6e) holds PR #2 with PR #4 (the second wave), PR #5
  (script reveal) and PR #6 (Android institution titles). It matches the Claude Design cards.
- FACT (ledger `.superpowers/sdd/2026-09-29-planned-work-closeout/progress.md`): second wave
  reviewed: day, figure and dive-deeper pages, three design calls, Android sync (Room v3, bundled
  tz-lookup), cleanup C1 to C4. Counts there at 5105fd9: web 113 (96 pass, 17 skipped),
  Android 200/0, dotnet 39/0. Egypt and Canaan device errors follow the owner's guidance.
- FACT (ledger `.superpowers/sdd/2026-10-20-script-reveal/progress.md`): names in attested script
  resolve to English or French on scroll, web and Android (spec `2026-10-20-script-reveal.md`);
  56 of 60 names sourced; Android institution titles equal web's and reveal too.
- FACT (GitHub PR #7, 2026-10-22): branch `claude/continue-next-stage-7bf3d6` fixes the four
  Android reveal Minors deferred at #5's merge: no Latin frame before script, the animation
  setting followed live, the picker's hold after the phase fade, D-pad focus as on web (plan
  `2026-10-22-android-reveal-polish.md`). Review approved after one fix round; Android 223/0 local.
- FACT (git, 2026-10-22): the native Swift iOS app sits on `claude/ios-branch-parity-895dbc`,
  18 commits not on `master`. Its layout port waits for the owner to approve the flat canvas
  (`docs/design/ios-layout-2026-10-21.md`, uncommitted in worktree `festive-khayyam-4aac34`).

## Decisions taken, and why
- 2026-09-29, owner: rebuild the daily readings to the Co-Star anatomy in five voices (spec
  `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`); archive six unwired banks;
  apply three design calls; build Android sync (spec `...-android-account-sync.md`).
- 2026-10-06, controller: the sky picks the figure (always the tightest), the day picks the
  words; recurrence by mean geocentric rates (Sun meets Mercury every 57.9 d, Venus 291.9 d);
  natal day readings read fast bodies first; Android keeps the typed birth date and time
  (Room v3). All rulings with their reasons: the ledger and the plan's Rulings section.
- 2026-10-22, owner (popup): the four deferred Android reveal Minors come before the iOS port and
  the Swift catch-up, which both need CI. Controller: Android focus follows web's `:focus-visible`
  (Latin only while a row holds focus), because web is canonical.

## Pending, in order
1. FACT (GitHub, 2026-10-22): PR #7 open against `master`; the owner reviews and merges it.
2. FACT (check-run annotation, 2026-10-22): GitHub Actions jobs do not start: "recent account
   payments have failed or your spending limit needs to be increased". Owner fixes billing; every
   CI step passed locally at ece6cf4 (ledger), Android at 2113a55 (PR #7).
3. FACT (canvas, 2026-10-22): no comments yet on https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V;
   the SwiftUI port starts once the owner approves it. SwiftUI builds only in CI. Claude Design:
   26 cards pushed from 4e3c1a5, 3 files from 3e71306, tokens/fonts.css from 24346d4 (2026-10-21), 12 script-reveal files from a2b762f (2026-10-22).
- Owner inputs still needed: mail vendor; deployed API origin for Android release builds;
  `web/src/lib/legal/policyFacts.ts` values; Law 25 assessments; Play keystore; French UI.

## Deadlines
CANNOT CONFIRM: none recorded in this repo; the owner has named none.

## Files that matter
- Plan: `docs/superpowers/plans/2026-09-29-planned-work-closeout.md`. Ledger (git-ignored):
  `.superpowers/sdd/2026-09-29-planned-work-closeout/progress.md` and the task reports.
- Composition: `web/src/lib/decree.ts`, `figureReading.ts`; banks in `web/src/data/`, mirrored
  to Android by `web/scripts/gen-android-*.mjs`. Script forms: `web/src/data/scriptForms.ts`.
