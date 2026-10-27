# HANDOFF, Astra Antiqua, state at 2026-10-26

Read first; this file outranks older lines elsewhere. Tags: FACT (source) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (GitHub, 2026-10-26): `master` (2f38e6e) holds PRs #2, #4, #5 and #6: the second wave,
  the script reveal (names in attested script resolve on scroll, 56 of 60 sourced) and Android
  institution titles. Their ledgers stay in worktree `planner-buildout-completion-495257`.
- FACT (disk, 2026-10-26): folder cleanup ran; ledger copies and the full account are in `_archive/2026-10-26_folder-cleanup/` (`ledgers/`, `README.md`).
- FACT (GitHub, 2026-10-26): PR #7 (`claude/continue-next-stage-7bf3d6`, 5f96a05) is open and
  unmerged: four Android reveal fixes (no Latin frame before script, live animation setting,
  picker hold after the phase fade, D-pad focus as on web). Android 223/0 local.
- FACT (git, 2026-10-26): branch `claude/deferred-minors` sits on PR #7's head, not pushed. It
  closes deferred review Minors (plan `2026-10-26-deferred-minors.md`):
  - Android: long transits walk the natal midheaven; a figure's "← The day" opens its own date
    (live day when it is today), with `← BACK TO TODAY`. Web: `/year` fits 375px; no `--:--`.
  - About a dozen reading lines reworded (see Decisions). Schema bootstrap: transaction-scoped
    lock, failed connect retried (`docs/deploy.md`). CI jobs have timeouts. Reviews clean
    after one final fix wave (ledger `.superpowers/sdd/2026-10-26-deferred-minors/`).
  - Merged in at the owner's word (popup, 2026-10-26), each reviewed in its own session: the
    home clock reads its time and UTC at 375px (05fa59d, 8fba41c); Android's season, year and
    day read the long transits against the chart as web's do (acf168f..afe5a46, merge ade0dd9).
  - Counts at ade0dd9: web 128 (111 pass, 17 skipped), Android 256/0; test:db 128/128 at 3a9fad1.
- FACT (git): the native Swift iOS app sits on `claude/ios-branch-parity-895dbc`, 18 commits not
  on `master`, waiting on the flat-canvas approval below.

## Decisions taken, and why
- 2026-09-29 to 2026-10-22: reading anatomy, recurrence, fast-first, Android sync and reveal
  rulings stand as recorded in their plans and ledgers; Android focus follows web's `:focus-visible`.
- 2026-10-26, owner (popup): all four groups of deferred Minors as the next stage.
- 2026-10-26, controller (the owner holds the voice and can overrule each): Greece's dive-deeper
  last line is `Expect {thing}.`, Rome's `Prepare for {thing}.`; Egypt's tight tail
  `, and Thoth records it foremost`; Greece's `, and the seer needs no second look`; Canaan
  `Your temper at work`, `A mourner's lament`; two Rome items reworded. Reasons in the plan's
  "As shipped" note: each earlier wording repeated a word on the page or read wrong.

## Pending, in order
1. FACT: PR #7 waits for the owner's merge. `claude/deferred-minors` stays local by the owner's
   choice (popup, 2026-10-26); its PR, when asked for, takes base PR #7's branch.
2. FACT (check-run annotation, 2026-10-22): GitHub Actions jobs do not start: "recent account
   payments have failed or your spending limit needs to be increased". Owner fixes billing.
3. FACT (canvas, 2026-10-26): no comments on https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V;
   the SwiftUI port starts once the owner approves it.
4. INFERENCE (ledger): left for a later pass, none blocking: `MainActivity.kt` reads the
   library-internal `currentBackStack`; `TodaySpecimen.html` shows an old headline (run
   `pnpm specimens` before the next Claude Design push); three Rome items strain after "Prepare for".
- Owner inputs still needed: mail vendor; deployed API origin for Android release builds;
  `web/src/lib/legal/policyFacts.ts` values; Law 25 assessments; Play keystore; French UI.

## Deadlines, CANNOT CONFIRM: none recorded in this repo; the owner has named none.

## Files that matter
- Plan: `docs/superpowers/plans/2026-10-26-deferred-minors.md`. Composition in `web/src/lib/`; banks
  in `web/src/data/`, mirrored by `web/scripts/gen-android-reading-banks.mjs`; voice rules `docs/design/reading-voice.md`.
