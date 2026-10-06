# HANDOFF, Astra Antiqua, state at 2026-10-06

Read first. Where this file and an older line in `CLAUDE.md` or any index disagree, this
file wins. Tags: FACT (with its source file) / INFERENCE / CANNOT CONFIRM.

## What this is (FACT, `CLAUDE.md`)
- One computed sky read through five ancient theologies on three surfaces sharing a domain:
  `web/` (Next.js 16, canonical), `android/` (Kotlin, Compose), `dotnet/` (C# core; MAUI iOS
  head built only in CI). `shared/content/*.json` is generated from web; never hand-edit it.

## Where things stand
- FACT (`git log`, GitHub PR #2): branch `claude/planner-buildout-completion-495257` is PR #2
  to `master`, 22 commits, CI green on web, Android and dotnet, mergeable, not merged. It
  closed every plan gap that needed no owner decision and refreshed the plan documents
  (`docs/web-ios-android-plan.md` status table dated 2026-09-29, `docs/web-rebrand-report.md`).
- FACT (`git log`): branch `claude/reading-anatomy-495257`, stacked on PR #2's head, unpushed,
  holds the second wave. Task 15 (the day page speaks to the reader) is complete after four
  fix rounds, Task 16 (figure page) and Task 17 (dive deeper) after two each; web 98 and
  Android 78 tests green (reports in the ledger folder). Tasks 11 to 14 (archive, rule hex,
  display-xs 18px, Spectral SC) complete. Task 18 (Android sync) in progress.
- FACT (`docs/superpowers/plans/2026-09-29-planned-work-closeout.md`): Tasks 16 (figure page),
  17 (dive deeper), 11 to 14 (archive, rules, display-xs, Spectral SC) and 18 (Android sync,
  three dispatches) are queued in that order.
- FACT (DesignSync, 2026-09-29): Claude Design project `24e2b41c-9c28-47de-88ce-e515b647b2bf`
  holds the 44 preview cards and the four outlined signs.
- INFERENCE: the live checkout `L:\Claude Projects\astra-antiqua` carries an uncommitted
  bootstrap `HANDOFF.md` (dated 2026-10-06, pre-PR #2 state) plus a `CLAUDE.md` section and a
  `.gitignore` line; this worktree committed the same section and line, so this file should
  replace the live one when the branches merge.

## Decisions taken, and why
- 2026-09-29, owner: the daily readings "flow poorly"; rebuild to the anatomy of the Co-Star
  screens filed in `docs/design/references/costar-2026-09-29/` (README with hashes), keeping
  the five voices. Spec `docs/superpowers/specs/2026-09-29-daily-reading-voice.md`, 3 phases.
- 2026-09-29, owner: archive the six unwired web banks to `docs/archive/`; apply all three
  design calls; build Android account sync with export, strike and the wait list (spec
  `docs/superpowers/specs/2026-09-29-android-account-sync.md`); open PR #2 (done).
- 2026-10-06, controller: the sky picks the figure (always the tightest), the day picks the
  words (variants rotate); a persisting figure keeps its headline and the week prints a
  "holds" line. Reason: spec A.2 and the method page's "nothing is estimated" outrank the
  no-repeat rule. All rulings: the plan's "Rulings" section and the ledger.

## Pending
- Task 15 re-review; then Tasks 16, 17, 11 to 14, 18; then a PR for the second branch.
- Owner inputs before code can proceed: a mail vendor; the deployed API origin for Android
  release builds; `web/src/lib/legal/policyFacts.ts` values (legal pages build as 404 until
  filled, FACT from the build log); the Law 25 assessments; a Play keystore; French UI.

## Deadlines
CANNOT CONFIRM: none are recorded in this repo, and the owner has named none in session.

## Files that matter
- Plan: `docs/superpowers/plans/2026-09-29-planned-work-closeout.md`. Ledger (git-ignored):
  `.superpowers/sdd/2026-09-29-planned-work-closeout/progress.md`, every task, ruling and
  deferred minor; `task-15-report.md` beside it holds the rendered readings.
- Composition under rework: `web/src/lib/decree.ts`, `web/src/data/decreeBanks.ts`,
  `web/src/data/deityDomains.ts`, `web/src/data/permissionsRegister.ts`,
  `web/src/lib/permissions.ts`, `web/src/lib/weekReading.ts`, generated
  `android/.../domain/ReadingBanks.kt` (via `web/scripts/gen-android-reading-banks.mjs`).
- Entry documents are listed in `CLAUDE.md` under "Session files and entry documents".
