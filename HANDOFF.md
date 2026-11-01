# HANDOFF, Astra Antiqua iOS glass port (Phase B), state at 2026-10-31

Tags: FACT (source) / INFERENCE / CANNOT CONFIRM. This branch's handoff; the design branch keeps its own.

## What this is
- FACT (`CLAUDE.md`): one computed sky read through five ancient theologies; web is canonical,
  `shared/content/*.json` is generated from it. The native Swift app is `ios/AstraAntiqua`, its maths
  `ios/AstraCore`; SwiftUI compiles only on a macOS CI runner (`.github/workflows/swift.yml`).
- FACT (git): branch `claude/ios-glass-phase-b-881817`, cut from `claude/ios-branch-parity-895dbc` at 1f176e8.

## The approved design (copied from the design worktree's records)
- FACT (`docs/design/ios-layout-2026-10-21.md`, 2026-10-31 sections): Matthew approved the whole Liquid
  Glass design on 2026-10-31 ("Approved, start Phase B"), kept the pressed and disabled states P163 to
  P170 ("Keep as drawn") and picked the Moon behind the text on Week ("Behind, slower than text": P171,
  0.5 pt per pt of scroll, lit part bone 10%, band P53 kept; Tuesday's TENSION line at 3.57:1, accepted).
- FACT (same): reference is canvas https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, page "Glass",
  version 39 (id 1793472626-da1b); next free ID P172. Spec tables and the Hand-off index:
  `.superpowers/sdd/glass-build/report-r7.md` in worktree `astra-antiqua-design-rounds-a1291d`
  (git-ignored there, read from that path).

## Where things stand
- FACT (`ios/AstraAntiqua/Theme/Glass.swift`): step 1, the chrome, written: P17, P1, P3, P55, P2, P20,
  `GlassScreen`, the pressed style for P163 to P170; not yet wired into `MainTabs` (step 2 does). Six
  captures at 390x844 on an iPhone 16e; CI checks 30 rects to 1 pt (`ios/placement/chrome.json`).
- FACT (`swift` run 41243281478, 2026-10-31): step 1 builds, every screen runs and is photographed on the
  iPhone 17e (iOS 27.0, 390x844), and all 30 chrome positions are within 0.3 pt. The iPhone Duo (iOS 27.1)
  is photographed too, pictures only; content wider than its safe width widens the chrome (INFERENCE).

## Decisions taken, and why
- 2026-10-31, Matthew (popup): top row at max(safe top, 62), so a 390x844 phone (safe top 47) keeps the
  canvas numbers; chrome type fixed at the canvas sizes, large content viewer on long press; go on to
  Sky Day before CI proves step 1; do not push yet.
- 2026-10-31, session: system Liquid Glass on iOS 26+, tinted with the canvas fill; the canvas
  approximation below iOS 26 and under Reduce Transparency (opaque there, INFERENCE).
- 2026-10-31, session: `Glass.swift` added to the committed Xcode project by hand; XcodeGen's drift
  check in CI will flag it until the regenerated project is committed.

## Pending, in order
1. FACT (git, 2026-10-31): step 2, Sky Day, built (master merged 0f356fe, day page in AstraCore pinned to
   `TestData/day.json`, glass MainTabs; Swift core 39/0, dotnet 105/0), pushed to this branch at 0982dc5 on
   Matthew's word; the swift run must prove SwiftUI and `sky-day.json`. Matthew (popup, 2026-10-31): keep all
   four chart rows in web order; a design round redraws Glass-Day with the web's copy; step 3, Sky Week, next.
1b. FACT (git, 2026-10-31): step 3, Sky Week, built on `claude/ios-glass-phase-b-week` (e37d418, 0a35efc,
   492b93a, 036a162, cut at 0c2246f; not pushed). Swift core 48/0; SwiftUI unproven until a swift run. Web's
   kicker and title replace the board's; seven rows off the table by copy length; Monday's TENSION line sits
   over the Moon at 3.57:1 (layout record, step 3). Matthew (popup, 2026-10-31): the board's kicker and
   title; accept the 3.57:1; Reduce Motion scrolls the Moon with the text; fast-forward and push.
2. Steps 2 to 11 of the brief: Sky Day; Week with P53 and P171 (Reduce Motion: the Moon scrolls with
   the text, Matthew's ruling of 2026-10-31); Season with P54; Year; Transits; Chart; Placement with P55 and P56;
   Transit detail; More, the culture sheet P146, the Doorway; the five cultures live.
3. FACT (message from the session that started this one, 2026-10-31): Matthew approved Round 8,
   Glass-Explain, built in step 10 with More: canvas version 43 (id 1793475970-ffe5), row y 26500, a
   pushed screen (back to More, MORE lit, no switcher) opened by P119 and P139; IDs P172 to P225, next
   free P226. Copy and tables: `compose-explain-r8.mjs`, `explain-r8.json`, `report-r8.md` under the
   design worktree's `.superpowers/sdd/glass-build/`; Round 8 section of its layout record. The canvas
   change log is now five notes (changeLog to changeLog5), the Hand-off index two.

## Deadlines: CANNOT CONFIRM, none recorded for this work; Matthew has named none.

## Files that matter
- `ios/AstraAntiqua/Theme/Glass.swift`, `ios/AstraAntiqua/ScreenshotMode.swift`, `ios/placement/*.json`,
  `.github/scripts/ios-smoke.sh`, `.github/scripts/check-placement.py`, `.github/workflows/swift.yml`.
- Records: `docs/design/ios-layout-2026-10-21.md` (Phase B sections at the end), `ios/README.md`.
- Brief: `docs/design/prompts/ios-glass-build.md` in the design worktree (PHASE B paragraph).
