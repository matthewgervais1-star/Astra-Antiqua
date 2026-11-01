# HANDOFF, Astra Antiqua, state at 2026-10-31

Read first; this file outranks older lines elsewhere. Tags: FACT (source) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (git, 2026-10-31): `master` (45df0fc) holds PRs #2, #4, #5, #6, #7 (a9c1508, Android reveal
  fixes), #8 (5cd7669, script name on the large title) and #9. #8's full account: `git show 45df0fc:HANDOFF.md`.
- FACT (`git show 45df0fc:HANDOFF.md`, Matthew 2026-10-30): the four Actions workflows are disabled and
  PRs merge on local verification; the MAUI and SwiftUI iOS heads cannot build until one is re-enabled.
- FACT (git, 2026-10-31): branch `claude/deferred-minors`, master merged in, closes the deferred review
  Minors (plan `docs/superpowers/plans/2026-10-26-deferred-minors.md`, ledger `.superpowers/sdd/2026-10-26-deferred-minors/`):
  - Android: long transits walk the natal midheaven; a figure's "← The day" opens its own date
    (live day when it is today), with `← BACK TO TODAY`. Web: `/year` fits 375px; no `--:--`.
  - About a dozen reading lines reworded (see Decisions). Schema bootstrap: transaction-scoped
    lock, failed connect retried (`docs/deploy.md`). CI jobs have timeouts.
  - The home clock reads its time and UTC at 375px (05fa59d, 8fba41c); Android's season, year and
    day read the long transits against the chart as web's do (acf168f..afe5a46, merge ade0dd9).
  - Docs: Draw Things prompt sheet `docs/design/prompts/draw-things-image-prompts.md`; the owner's
    references in `docs/design/references/2026-10-27_phone-screenshots/` and `2026-10-28_draw-things-model-picker/`.
- FACT (git, 2026-10-31): the Liquid Glass record lives in worktree `astra-antiqua-design-rounds-a1291d`
  (its HANDOFF.md and `docs/design/ios-layout-2026-10-21.md`; round 8b at ddc7553, newest f1438db), canvas
  https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V. Ports: SwiftUI on `claude/ios-glass-phase-b-881817`
  (pushed), Android on `claude/android-glass-7a8074`, Swift base `claude/ios-branch-parity-895dbc`; none on `master`.
- FACT (git, 2026-10-31): worktree `planner-buildout-completion-495257` lost HEAD, index and gitdir; re-registered
  on `claude/loving-morse-42eacf` (= `master`); 24 modified and 36 untracked files there, not reviewed; its Sky Week
  commits are safe on `claude/ios-glass-phase-b-week`. FACT (disk): hundreds of repo folders carry the Windows
  read-only attribute (77 in `web/src`, 259 in `.git/objects`); it broke a Gradle build here. INFERENCE: it also
  stopped git's automatic `worktree prune` halfway. Cause unknown. Cleanup account: `_archive/2026-10-26_folder-cleanup/`.

## Decisions taken, and why
- 2026-09-29 to 2026-10-22: reading anatomy, recurrence, fast-first, Android sync and reveal
  rulings stand as recorded in their plans and ledgers; Android focus follows web's `:focus-visible`.
- 2026-10-26, owner (popup): all four groups of deferred Minors as the next stage.
- 2026-10-26, controller (the owner holds the voice and can overrule each): Greece's dive-deeper
  last line is `Expect {thing}.`, Rome's `Prepare for {thing}.`; Egypt's tight tail
  `, and Thoth records it foremost`; Greece's `, and the seer needs no second look`; Canaan
  `Your temper at work`, `A mourner's lament`; two Rome items reworded. Reasons in the plan's
  "As shipped" note: each earlier wording repeated a word on the page or read wrong.
- Owner (popups): Liquid Glass for the iPhone app, chrome A (2026-10-27); the large title is "Script until scrolled" (2026-10-29, PR #8).
- 2026-10-31, owner (popup): merge master into `claude/deferred-minors` and open its PR to `master`;
  commit the prompt sheet and references; repair the planner worktree.

## Pending, in order
1. FACT (GitHub, 2026-10-31): PR #10 (`claude/deferred-minors` into `master`) waits for the owner's merge.
2. FACT (design-rounds worktree HANDOFF): the glass design and its two ports continue there.
3. INFERENCE (ledgers): later-pass items, none blocking: `MainActivity.kt` reads the internal `currentBackStack`;
   `TodaySpecimen.html` shows an old headline (`pnpm specimens` before the next Claude Design push); three Rome
   items strain after "Prepare for"; Android's title holds script 1.2 s (owner's call); no unhydrated fallback.
- Owner inputs still needed: mail vendor; deployed API origin for Android release builds;
  `web/src/lib/legal/policyFacts.ts` values; Law 25 assessments; Play keystore; French UI.
- Deadlines, CANNOT CONFIRM: none recorded in this repo; the owner has named none.

## Files that matter
- Plans in `docs/superpowers/plans/`; composition `web/src/lib/`; banks `web/src/data/` (mirrored by
  `web/scripts/gen-android-*.mjs`); script forms `web/src/data/scriptForms.ts`; voice `docs/design/reading-voice.md`.
