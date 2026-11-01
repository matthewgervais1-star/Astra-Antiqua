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

## Added 2026-10-29: script name on the large title (built)

- FACT (Matthew's popup answer, 2026-10-29, recorded in worktree `astra-antiqua-design-rounds-a1291d`'s
  HANDOFF): "Script until scrolled": the title name is script from the first paint with no Latin
  flash, Latin when scrolled into the middle band or hovered.
- FACT (this branch, `claude/large-title-script-band-rule-038769`): `ScriptName` takes `scriptFirst`.
  The class `script-name--script-first` paints the script before hydration; after mount the name reads
  `data-reveal="script"` and the band's verdict waits for the reader's first scroll, then every crossing
  applies; hover shows Latin as on any name the band has not reached; reduced motion and a page with no
  JavaScript (noscript style in `web/src/app/layout.tsx`) show Latin. `NaveHead`'s culture title and the
  voices page headline use it. The 1.2 s intro stays on the culture picker only (`PICKER_INTRO_MS` in
  `CultureSwitch.tsx`); `CULTURE_NAME_INTRO_MS` is gone.
- FACT (headless Chrome, `web/scripts/check-script-reveal.mjs`, now at 1280x800, 390x844 and 375x740,
  `--viewport WxH` to pick one): at 390x844 the voices title sits inside the band at the top of the page
  (y 320 to 364, band 253 to 591), so it turns Latin on the first scroll and back to script about 110 px
  down; the day page's title sits above the band (159 to 203) and stays script until hovered, like the
  culture chip. Under the plain band rule the voices title would have resolved before any scroll, which
  is why the first scroll gates it.
- INFERENCE: Android's title still holds its script 1.2 s then fades (`Shell.kt`,
  `ScriptReveal.INTRO_HOLD_MILLIS`); the same change there waits on Matthew's word.
- FACT (traced in headless Chrome, this session): the picker intro on `/welcome` sometimes never showed
  under the dev server: a second stylesheet arrives 60 to 80 ms in and the intro animations are
  cancelled and re-created, and when hydration lands in that frame `ScriptName`'s check for a running
  animation found none and dropped the intro class for good (stack: `finishIntro` from the effect).
  Pre-existing path; fixed by finishing the intro at hydration only once the hold delay has elapsed
  since the page started, since before that the intro cannot have ended and its own `animationend`
  finishes it. Three runs against `master` did not hit the frame; this worktree's server hit it in
  about half its runs.
- FACT (review, one Opus reviewer and two Sonnet refuters per finding, 2026-10-29): five Minors, none
  blocking. Fixed: a scroll before hydration or a restored scroll position counts as scrolled (the hold
  starts only at scrollY 0); a scroll event that leaves the page at the top (the router's scroll to the
  top on navigation) does not release it; a hold the reader released survives a re-run of the effect
  (culture switched in place via the chip). The check now counts the first-paint and no-JS records.
  Deferred: when JavaScript is on but the bundle never hydrates (chunk failure, a blocker on
  `/_next/static`), the title stays script with Latin on hover only; a CSS fallback that fades to Latin
  after a long unhydrated wait would cover it, at the cost of a snap back on a very slow load.
- FACT (GitHub, 2026-10-30): PR #8 opens this branch against `master` (commit 94136a1). Its `web`
  check did not start: zero steps, the same billing annotation as item 2 above. Every CI step passed
  locally at 94136a1 (tsc, eslint, gates, 110 unit tests, the reveal check at three viewports).
- FACT (Matthew, 2026-10-30): merge PR #8 on the local verification; the Actions check stays
  unstarted because he does not pay for that feature. Same ground applies to later PRs until he says otherwise.
- FACT (GitHub, 2026-10-30, on Matthew's word): PR #8 merged as 5cd7669. The four Actions workflows
  (`android.yml`, `ios.yml`, `swift.yml`, `web.yml`) are disabled from the Actions tab, so PRs show no
  check. Consequence: the MAUI and SwiftUI iOS heads build only in CI and cannot build until a workflow
  is re-enabled (Actions tab, "Enable workflow"); web, Android and dotnet checks run locally as before.
- Pending: Round 7 of the glass design on Matthew's word.

## Added 2026-10-31: Liquid Glass on Android, step 1 (the chrome)

- FACT (Matthew, 2026-10-31, relayed by the session that started this one): Android to look like the
  iPhone glass design; "Start now" on a port built on Kyant0/AndroidLiquidGlass. Branch
  `claude/android-glass-7a8074`, committed, not pushed, no PR. Record: `docs/design/android-glass.md`.
- FACT (`android/app/src/main/java/com/astra/antiqua/ui/theme/glass/`): the chrome as composables,
  P17 tab bar, P1 wordmark, P3 culture menu, P55 back button, P2 horizon control, P56 accessory and
  body switcher, P20 scroll edge, `GlassScreen`; constants named as the iPhone port's (`Chrome`,
  `GlassInk`). No screen uses them yet; Sky Day (step 2) waits for Matthew's word.
- FACT (`android/gradle/libs.versions.toml`): `io.github.kyant0:backdrop` 1.0.6 (Apache-2.0); the
  current 2.0.1 needs Kotlin 2.4. Compose BOM 2024.09.02 to 2026.02.00. Test-only: Robolectric 4.17,
  Roborazzi 1.77.0.
- FACT (`GlassChromeScreenshotTest`, `docs/design/android-glass/step1/placement.txt`): eight JVM
  renders at 390x844 dp; every ID within 1 dp of the Round 7 table (P1 off 0.87, the rest 0.00).
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 234 tests, 0 failures.
- FACT (`GlassContrastTest`): the tint tier (API 26 to 30) uses fill .90, 4.64:1 over a bone stroke;
  the canvas's .80 gives 3.45:1 there.
- INFERENCE: the iPhone answer "Fixed at 11 pt" applies to Android's chrome type too.
- FACT (Matthew's popup, 2026-10-31): canvas 62 and 34 as floors; tint fill .90; keep blur 24 (the
  lens barely shows under it); stay on backdrop 1.0.6. Step 1 stands as built.
- FACT (Matthew's popup answer relayed 2026-10-31, "Compare both"): Kyant 1.0.6 against chrisbanes/haze
  1.7.2 (Apache-2.0; 2.0.1 is Haze's current stable, needs Compose 1.12 and Kotlin 2.4) behind one seam
  (`GlassBackdrop`, `GlassEngine` in `ui/theme/glass/`). Sheets: `docs/design/android-glass/compare/`.
- FACT (`GlassLibraryComparisonTest`): at the canvas numbers the two draw the same glass (at most 9
  levels of 255 apart). Worst dim label over solid bone: Kyant 3.49, Haze 3.47, tint .90 4.70; at rest
  and scrolled every variant holds 5.4 or better.
- FACT (Matthew's popup, 2026-10-31): keep Kyant; keep the canvas fill .80 over bright areas. Haze removed
  (its comparison test stays in commit 432bf29).
- FACT (Matthew, 2026-10-31, "go ahead"): step 2 built. Route.DAY opens Sky Day on the glass chrome
  (`ui/screens/SkyDayScreen.kt`, `domain/SkyDay.kt`); chrome within 1 dp, every gap between blocks equals
  the board's, heights follow the web's longer copy. Review fixes in. Local: 241 tests, 0 failures.
  Record: `docs/design/android-glass.md` (step 2), renders `docs/design/android-glass/step2/`.
- FACT (Matthew's popup, 2026-10-31): Sky Day approved; MORE opens Learn until step 10; the old Day
  sections (lists, dive deeper, natal wheel, Sun and Moon readings) sit below Sky Day. 242 tests, 0 failures.
- Pending: step 3, Sky Week with the Moon, in a fresh session (prompt
  `docs/design/prompts/android-glass-step3.md`); push and PR on Matthew's word.
- FACT (prompt pasted by Matthew, 2026-10-31): step 3 built. Route.WEEK opens Sky Week on the glass chrome
  (`ui/screens/SkyWeekScreen.kt`, `domain/SkyWeek.kt`) with the Moon P171 behind the text at 0.5 rate, moving
  with the text when animations are off; rows equal the web's week (node check); chrome within 1 dp, every
  gap the board's. One Opus review, two fix rounds. Local: 252 tests, 0 failures. Record:
  `docs/design/android-glass.md` (step 3), renders `docs/design/android-glass/step3/`.
- Pending: Matthew's popup on step 3 (Reduce Motion, row headlines, the web's sections off the board,
  approval); push and PR on his word.
- FACT (Matthew's popup, 2026-10-31): Moon scrolls with the text under Reduce Motion (as built); add the
  web's headline to each week row; put the web's thesis, note, votive, feedback and links below the rows;
  "Changes first" before Season. Pending: those two changes, then his look.
- FACT (Matthew, 2026-10-31, "Yes, build them"): row headlines and the web's thesis, note, votive, feedback
  (kept on the device) and links below the rows built; 253 tests, 0 failures. Pending: his look at the renders.
