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
- FACT (same): Phase B follows the web's reading of the sample day, not the flat boards' copy (Round 6).

## Where things stand
- FACT (`ios/AstraAntiqua/Theme/Glass.swift`): step 1, the chrome, written: P17, P1, P3, P55, P2, P20,
  `GlassScreen`, the pressed style for P163 to P170. Not yet wired into the app's tabs (`MainTabs` still
  uses the system `TabView`); step 2 (Sky Day) replaces it.
- FACT (`ios/AstraAntiqua/ScreenshotMode.swift`, `.github/scripts/ios-smoke.sh`, `ios/placement/chrome.json`,
  `.github/scripts/check-placement.py`): six chrome captures at 390x844 on an iPhone 16e and a CI step
  that checks 30 rects against the canvas to within 1 pt.
- CANNOT CONFIRM: that it compiles. GitHub Actions workflows were disabled on 2026-10-30 (design
  worktree `HANDOFF.md`); nothing iOS builds until Matthew re-enables `swift.yml`. Local check: `swiftc
  -parse` under WSL passed. AstraCore unchanged.

## Decisions taken, and why
- 2026-10-31, Matthew (popup): top row at max(safe top, 62), so a 390x844 phone (safe top 47) keeps the
  canvas numbers; chrome type fixed at the canvas sizes, large content viewer on long press; go on to
  Sky Day before CI proves step 1; do not push yet.
- 2026-10-31, session: system Liquid Glass on iOS 26+, tinted with the canvas fill; the canvas
  approximation below iOS 26 and under Reduce Transparency (opaque there, INFERENCE).
- 2026-10-31, session: `Glass.swift` added to the committed Xcode project by hand; XcodeGen's drift
  check in CI will flag it until the regenerated project is committed.

## Pending, in order
1. Step 2, Sky Day (in progress). Push only on Matthew's word; a CI run once Actions is on again.
2. Steps 2 to 11 of the brief: Sky Day; Week with P53 and P171 (Reduce Motion: the Moon scrolls with
   the text, INFERENCE for Matthew); Season with P54; Year; Transits; Chart; Placement with P55 and P56;
   Transit detail; More, the culture sheet P146, the Doorway; the five cultures live.

## Deadlines
- CANNOT CONFIRM: none recorded for this work; Matthew has named none.

## Files that matter
- `ios/AstraAntiqua/Theme/Glass.swift`, `ios/AstraAntiqua/ScreenshotMode.swift`, `ios/placement/*.json`,
  `.github/scripts/ios-smoke.sh`, `.github/scripts/check-placement.py`, `.github/workflows/swift.yml`.
- Records: `docs/design/ios-layout-2026-10-21.md` (Phase B sections at the end), `ios/README.md`.
- Brief: `docs/design/prompts/ios-glass-build.md` in the design worktree (PHASE B paragraph).
