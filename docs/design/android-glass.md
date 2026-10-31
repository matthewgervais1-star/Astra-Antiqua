# The Liquid Glass design on Android, from 2026-10-31

Tags: FACT names its source; INFERENCE is a judgment; CANNOT CONFIRM is open.

## What this is

- FACT (Matthew, 2026-10-31): "is there something like glass for android? can we have the it look
  like the iphone version"; he chose "Start now" for a port built on Kyant's open-source Compose
  library, full glass on Android 13+, blur only on 12, a tinted panel on 8 to 11.
- FACT (design worktree `astra-antiqua-design-rounds-a1291d`, branch HEAD b845c0a; the brief named
  a3ae793, and b845c0a adds one docs commit on the Explain intro): the approved design is the canvas
  https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, page "Glass", approved on 2026-10-31
  ("Approved, start Phase B"), with rounds 8 and the Moon behind the text after it
  (`docs/design/ios-layout-2026-10-21.md` there). Numbers come from
  `.superpowers/sdd/glass-build/report-r7.md` (the Round 7 spec tables) in that worktree.
- FACT (`docs/design/prompts/ios-glass-build.md`, Phase B): the Android port follows the iPhone
  port's order, one screen per step with a stop: 1 the chrome; 2 Sky Day; 3 Sky Week with the Moon
  band; 4 Season; 5 Year; 6 Transits; 7 Chart; 8 Placement; 9 Transit detail; 10 More, the culture
  sheet, the Doorway; 11 the five cultures switched live.
- FACT (branch `claude/ios-glass-phase-b-881817`, commit 5546799, `ios/AstraAntiqua/Theme/Glass.swift`):
  the iPhone chrome's names and constants; the Android chrome keeps them (`Chrome`, `GlassInk`, the
  same canvas IDs in each comment).

## Step 1, the chrome (2026-10-31, branch `claude/android-glass-7a8074`)

- FACT (`android/app/src/main/java/com/astra/antiqua/ui/theme/glass/`): `GlassMetrics.kt` holds
  every lever default as a named constant with the canvas ID it places (`Chrome`, `GlassInk`), the
  tier (`GlassTier`, `LocalGlassTier`) and the pressed-state preview (`LocalPressedPreview`);
  `GlassSurface.kt` draws the glass (`Modifier.glassSurface`), the 1 px inset highlight and
  hairline, the shadow and web's focus outline; `GlassChrome.kt` holds P17 `GlassTabBar`, P1
  `GlassWordmark`, P3 `CultureMenu`, P55 `GlassBackButton`, `GlassTopBar`, P2 `GlassHorizonControl`,
  P56 `GlassAccessory` and `BodySwitcher`, P20 `ScrollEdge`; `GlassScreen.kt` lays them out over
  the culture's ground and records the ground and content as the glass's backdrop.
- FACT (`gradle/libs.versions.toml`; GitHub API and Maven Central, read 2026-10-31): the library is
  Kyant0/AndroidLiquidGlass, licence Apache-2.0, Maven `io.github.kyant0:backdrop`. Its current
  release is 2.0.1 (2026-08-26), a Compose Multiplatform build that needs Compose 1.12 and Kotlin
  stdlib 2.4.10; the app compiles with Kotlin 2.2.10, which reads metadata one version ahead (2.3)
  and no further. The app takes 1.0.6 (2026-02-14), the last Android-only release (Compose 1.10.3,
  stdlib 2.3.10). Compose BOM moved from 2024.09.02 to 2026.02.00, the BOM whose ui is 1.10.3, so
  every Compose library matches the one the backdrop brings.
- FACT (`GlassMetrics.kt`, `GlassSurface.kt`): tiers. API 33+ `LENS`: the library's lens
  (refraction height 12, amount 24, the library catalog's LiquidButton values; the canvas has no
  refraction) over blur 24 and saturate 1.5 and the fill rgba(24,21,16,.80). API 31 and 32 `BLUR`:
  the same without the lens. API 26 to 30 `TINT`: no backdrop effect, the fill at .90. Every tier
  draws the highlight rgba(255,255,255,.16), the hairline rgba(230,222,204,.14) and the shadow
  0 10 30 rgba(0,0,0,.45) outside the shape. CSS blur 24 is a standard deviation; Android's radius
  for it is 40.7 (Skia's 0.57735 r + 0.5).
- FACT (`GlassContrastTest`): in the blur and lens tiers the canvas's Round 1 model holds, dim 4.61
  over blurred heavy text (`report.md`, "Contrast on glass"). The tint tier does not blur, so a dim
  label can sit over a bone stroke: at the canvas's .80 that is 3.45:1, at .90 it is 4.64:1. The
  tint tier uses .90 so text on glass holds 4.5:1 there too. Open for Matthew, below.
- FACT (`GlassSurface.kt`): the shadow uses a hardware shadow layer, which Android draws on paths
  from API 28; on 26 and 27 the capsules have no shadow.
- FACT (`GlassChrome.kt`): pressed states P163 (tab), P164 (menu), P165 (back), P166 (segment), P167
  (switcher side) take the fill rgba(230,222,204,.26) with the highlight .24; P168 (a switcher end)
  drops to .4 and takes no tap. There is no ripple. P169 and P170 come with the sheet and the list
  rows (step 10 and the screens).
- FACT (same file): D-pad and keyboard focus draw web's `:focus-visible` (globals.css): a 1 px
  outline in the culture's accent, 2 px out, square. Compose focuses a clickable only from a key or
  D-pad, never from a touch.
- INFERENCE (Matthew's iOS answer of 2026-10-31, "Fixed at 11 pt", applied to Android): the chrome's
  type is fixed at the canvas sizes and does not follow the phone's font scale (each size is a dp
  turned into sp at the current scale). Android has no large content viewer to stand in for it.
- FACT (`GlassChrome.kt`, `ChromeText`): CSS adds letter-spacing after the last letter and Android
  does not, so each canvas text box is one letter-space wider than Android's text (3.64 for the
  wordmark, measured on the JVM: 151.0 against 153.8 before the fix). The chrome pads each text by
  that space, which keeps the canvas's boxes and centring.
- FACT (`GlassScreen.kt`): the top row sits at the larger of the status bar's bottom and 62, the tab
  bar 6 above the larger of the navigation bar's top and 34 from the bottom (the canvas home line
  810). Open for Matthew, below.
- FACT (`GlassScreen.kt`): no script reveal, reduced-motion or D-pad code changed; the chrome has no
  animation, the culture menu names the culture in Latin as P3 does on the canvas. The existing
  screens still use `NaveShell`; no screen uses the glass chrome until step 2.

## Step 1 checks (2026-10-31)

- FACT (`android/app/src/test/java/com/astra/antiqua/ui/theme/glass/GlassChromeScreenshotTest.kt`):
  Roborazzi 1.77.0 on Robolectric 4.17, native graphics, hardware render mode, SDK 35, qualifiers
  `w390dp-h844dp-xxhdpi` (390x844 dp at 3x). Robolectric reports no system bars, so the chrome
  sits at the canvas's 62 and 810. The content is a test pattern of bone bars at 50% and 30% and
  1 px rules, no copy. Eight renders, copied to `docs/design/android-glass/step1/`: `chrome`
  (Egypt, at rest, lens tier), `chrome-scrolled-lens`, `chrome-scrolled-blur`,
  `chrome-scrolled-tint` (420 scrolled, each tier forced), `chrome-pressed` (P163 on TRANSITS, P164,
  P166 on WEEK), `chrome-pushed` (back to CHART, the switcher OSIRIS and KHONSU), 
  `chrome-pushed-pressed` (P165, P167 on the next side, P168 on the previous side),
  `chrome-carthage` (P3 at 129).
- FACT (same test, `build/outputs/roborazzi/glass/placement.txt`): every ID against the Round 7
  table, within 1 dp, in all eight renders. P2 16, 113 · 358x44; P3 270, 62 · 104x44 (Carthage 245,
  62 · 129x44); P17 16, 748 · 358x56; P20 0, 0 · 390x173 under P2 and 390x122 without; P55 16, 62 ·
  44x44; P56 16, 692 · 358x48: all off by 0.00. P1 24, 75 is 154.7x18 against 153.8x18 (off 0.87);
  on a pushed screen it sits at 87.7 against 88.1. Android rounds a text's width up to a whole pixel
  (151.0 for 150.16), and the letter-space pad adds 3.64 to the rounded width.
- FACT (pixel diff of `chrome-scrolled-lens.png` and `chrome-scrolled-blur.png`): the lens shader
  runs on the JVM, but under blur 24 it changes at most 4 colour levels, inside the capsules only.
  Blur 24 leaves nothing sharp beneath for the lens to bend. Open for Matthew, below.
- CANNOT CONFIRM: how the tiers look on a phone. The renders come from Robolectric's renderer; no
  emulator or device was run in this session.
- FACT (local run, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` passed, 234 tests,
  0 failures (223 before, plus 3 contrast tests and 8 screenshot tests).
- FACT (this machine): new folders under `android/app/build` on drive L: carry the read-only
  attribute, and Gradle's Java cannot delete a read-only folder on Windows, so a second build fails
  with "Unable to delete directory". `attrib -R /S /D app\build\*` before the build clears it.

## Open for Matthew (asked in one popup, 2026-10-31)

1. Status and navigation bars: keep the canvas's 62 and 34 as floors (the iPhone answer), or follow
   Android's own bars (the top row right under the status bar).
2. The tint tier (Android 8 to 11): fill .90, which holds 4.5:1, or the canvas's .80 (3.45:1 over a
   bone stroke).
3. The lens: keep the canvas's blur 24 (the lens barely shows), or a lighter blur so the refraction
   shows, which needs fill .90 on every tier to hold 4.5:1.
4. The library: stay on backdrop 1.0.6, or move the app to Kotlin 2.4 and Compose 1.12 for 2.0.1.
