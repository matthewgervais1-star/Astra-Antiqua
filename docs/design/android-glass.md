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

### Matthew's answers (popup, 2026-10-31, after the eight renders were shown in the chat)

- FACT: "Canvas 62 and 34 as floors"; "Fill .90, holds 4.5:1"; "Keep canvas blur 24"; "Stay on
  1.0.6". All four confirm step 1 as built; nothing changed. Step 2, Sky Day, waits for his word.

## The library comparison (2026-10-31)

- FACT (message from the session "Large title script name band rule", 2026-10-31, quoting Matthew's
  popup answer "Compare both (Recommended)"): render the chrome with Kyant0/AndroidLiquidGlass and
  with chrisbanes/haze over the same scrolling Sky Day content at 390x844 dp, at rest, scrolled and
  with a bright patch under the glass; give each library's worst dim-label contrast; keep the library
  behind one seam; Matthew picks; step 2 waits.
- FACT (GitHub API and Maven Central, read 2026-10-31): Haze is Apache-2.0, Maven
  `dev.chrisbanes.haze:haze`. Its current stable release is 2.0.1 (2026-09-29); the 2.0 line left
  beta with 2.0.0 on 2026-09-22. 2.0.x needs Compose 1.12 and Kotlin stdlib 2.4.20, and 1.7.3 needs
  Compose 1.12 and stdlib 2.3.20. The app takes 1.7.2, the newest stable release on Compose 1.10
  and Kotlin 2.2 (stdlib 2.2.21), the same footing as Kyant's 1.0.6.
- FACT (Haze 1.7.2 source and `docs/platforms.md` at that tag): blur through RenderEffect on API 31+;
  on 30 and below a plain scrim by default (RenderScript blur is opt-in and marked experimental);
  `HazeStyle` has a tint, a blur radius, noise and a fallback tint, and no saturation control.
- FACT (`ui/theme/glass/GlassSurface.kt`): the seam is the interface `GlassBackdrop` (`source()` on
  the ground and content, `surface(shape, tier)` on each capsule) with `GlassEngine` and
  `LocalGlassEngine` choosing; `KyantGlass.kt` and `HazeGlass.kt` hold one library each. The loser
  comes out with its file, its enum entry, its line in `rememberGlassBackdrop` and its dependency.
  Default today: Kyant, as committed in step 1. Both draw the same fill .80, blur 24 (radius 40.7)
  and our own highlight, hairline and shadow; Kyant adds saturate 1.5 and, on 33+, the lens; Haze
  draws no saturation. Below API 31 neither library is called: the tint tier (fill .90) is shared.
- FACT (`GlassLibraryComparisonTest`, Roborazzi on Robolectric SDK 35, tiers forced): the content is
  an approximation of Glass-Day for Egypt: the Round 6 board's strings (`r6-work/egypt.html`, design
  worktree) at the Round 1 table's y positions (`report.md`, P4 to P16), glyphs left out. Frames: at
  rest, scrolled 420 (Glass-Day's scrolled frame), scrolled 420 with solid bone (#E6DECC) under the
  top chrome and the tab bar. Sheets in `docs/design/android-glass/compare/` (`compare-chrome.png`:
  the top bar and tab bar strips for all three frames; `compare-rest.png`, `compare-scrolled.png`,
  `compare-bright.png`: full screens), made by `make-sheets.py` there from the test's renders.
- FACT (pixel diff of the renders): Kyant and Haze differ by at most 9 colour levels of 255 in any
  frame (2 pixels above 8 levels, in the bright frame). Haze on 12 equals Haze on 13+ exactly; Kyant
  on 12 differs from 13+ by at most 6 levels. Under the canvas's blur 24 and fill .80 the two
  libraries draw the same glass.
- FACT (same test, `compare/contrast.txt`; brightest pixel under each dim label with the labels
  hidden, against #9A917D): worst dim label per frame. At rest: Kyant 5.82, Haze 5.77, tint 5.86.
  Scrolled: Kyant 5.81, Haze 5.77, tint 5.42 (WEEK, text beneath unblurred). Bone patch: Kyant 3.49
  (MORE), Haze 3.47 (TRANSITS), tint 4.70; the horizon labels there read Kyant 4.37 to 4.43, Haze
  4.38. Over solid bone, fill .80 fails 4.5:1 in both libraries; the canvas's Round 1 table modelled
  text under blur (50% bone) and never a solid bright area.
- INFERENCE: on looks the two are a tie at the canvas numbers. What differs: Kyant brings the lens
  (barely visible at blur 24) and saturate 1.5; Haze has its own fallback for Android 11 and below
  and an opt-in blur there. FACT (GitHub API, read 2026-10-31): stars Kyant 4,407, Haze 2,641; last
  push Kyant 2026-08-26, Haze 2026-10-30. Both need a Kotlin move for their current releases.
- CANNOT CONFIRM: how either looks on a phone; Robolectric drew every frame.
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 249 tests, 0 failures.

### Matthew's answers on the comparison (popup, 2026-10-31, after the four sheets were shown in the chat)

- FACT: "Kyant AndroidLiquidGlass" is kept; "Keep the canvas .80" over a bright patch, so dim labels
  on the blurred tiers fall to about 3.5:1 over solid bone (Kyant 3.49), as on the canvas. The tint
  tier keeps .90 (his earlier answer).
- FACT (git, next commit after 432bf29): Haze came out through the seam: `HazeGlass.kt`,
  `GlassLibraryComparisonTest.kt`, the `GlassEngine` switch, the labels-hidden hook and the
  `dev.chrisbanes.haze:haze` dependency are gone; `GlassBackdrop` stays with Kyant as its one
  implementation. The sheets and `contrast.txt` in `docs/design/android-glass/compare/` stay as the
  record; commit 432bf29 holds the test that made them.

## Step 2, Sky Day (2026-10-31)

- FACT (Matthew, 2026-10-31, in this session): "go ahead", after step 1 and the library choice.
- FACT (`docs/design/prompts/ios-glass-phase-b-step2.md` on branch `claude/ios-glass-phase-b-881817`):
  Matthew's iPhone rulings for Sky Day: the board's sections in its order filled with the web's
  composition (kicker with the institution, headline, evidence line, paragraph; the "where the day
  falls" contacts for the chart rows; the web's long-transit pick); the board's forms where the web
  has no string (kicker date WED 21 OCT 2026, ON YOUR CHART TODAY, the rows' data lines); the votive,
  lists, dive deeper and come-back line off Sky Day. INFERENCE: they bind Android the same way.
- FACT (`domain/SkyDay.kt`): `SkyDayComposer` composes the page. The decree is Android's port of the
  web's `composeDayPage` (`DayDecreeComposer`, read at 00:00 UTC). The Moon line ports
  `web/src/lib/moonPhase.ts` (phase from the geocentric ecliptic longitudes, lit fraction
  (1 - cos) / 2, the next quarter through the library's `searchMoonPhase`). The season is
  `SkyEvents.currentSeason`. Each contact row ports `dayPressure` in `web/src/lib/dayPressure.ts`:
  the group's lead by `rankContacts` (already ported in `DiveDeeper.kt`) and the web's sentence
  "{god} {verb} your {god} in the {ordinal}. It touches {arena}." The long transit ports
  `buildLongTransit` (`web/src/components/home/buildHomeBundle.ts`): of the open spans the closest
  to exact now, else the next to open.
- FACT (same file): two departures from the web. Groups with no contact are left out (the board
  lists contacts only; the web prints "Nothing exact touches your fourth."). The long transit is
  walked against the Sun, Moon and rising, as Android's Transits tab is; the web adds the midheaven,
  which that tab does not list, so a card could not open it.
- FACT (`SkyDayTest`, smoke birth Rome 1990-01-15 04:30 UTC, sample 2026-10-21 06:00 UTC, zone
  Europe/Rome): WAXING GIBBOUS · 74% LIT; next quarter Full Moon 2026-10-26 04:12 UTC (the design
  record's numbers); SUN IN LIBRA · DAY 29 OF 31. Egypt reads the web's day: "Do not haggle with
  your beloved as you would over linen.", ISIS □ OSIRIS · 0°25′; four contacts (Mercury sextile
  Saturn 3.0°, Venus trine Jupiter 0.8°, Sun square Venus 3.3°, Mercury conjunct Pluto 2.9°); long
  transit jupiter-trine-asc, open, 3 passes, 2026-10-02 to 2027-06-29.
- FACT (same test): the season counts local calendar days, as the web does; in Montreal (this
  machine's zone) the same instant reads DAY 30 OF 32, because the Sun entered Libra on 22 Sep there.
- FACT (`ui/screens/SkyDayScreen.kt`, `MainActivity.kt`): Route.DAY opens Sky Day on `GlassScreen`
  (SKY lit, DAY lit). The tabs open Route.DAY, Route.TRANSITS, Route.PLACEMENTS and, for MORE,
  Route.ACCOUNT until step 10 builds More; the horizons open the flat Week, Season and Year; the
  culture menu opens the Voices list (where the account's "change culture" goes) until the sheet
  in step 10. The kicker's institution is a `ScriptName`, so the script reveal still runs there.
  Contact rows take the approved pressed fill P170; the card, a data box, has no pressed state on
  the canvas and takes none; both draw web's focus outline. `MainDashboardScreen` is no longer
  routed (its file stays).
- FACT (`MainActivity.kt`): the system-bar padding moved from one box around the whole app onto the
  first-run phases and each flat destination (`flat(...)`), so Sky Day paints its ground behind the
  bars and places its chrome at the larger of the bars and the canvas's 62 and 34.
- FACT (`SkyDayScreen.kt`): the text takes CSS's line boxes (`LineHeightStyle` centred, untrimmed),
  so each block's height is its line-height times its lines as on the board; the section labels
  keep CSS line-height 1 (11 tall). Headlines and the card title are set in their own case.
- FACT (`SkyDayScreenshotTest`, `docs/design/android-glass/step2/placement.txt`): renders at rest,
  scrolled 420, at the page's foot and in Rome. Chrome in all four: P1 off 0.9, P2, P3, P17, P20
  0.0. Content at rest against the board's table: every gap between blocks equals the board's to
  0.1. Heights differ where the copy differs: P6 headline 110.7 against 70.2 (three lines, the web's
  sentence), P9 paragraph 270.0 against 89.1 (the web's five sentences against the board's one),
  P13 and P14 147.7 against 95.3 (the web's longer sentences, two lines each), two more rows
  (147.7 and 173.3) for the day's four contacts against the board's two, P11 180.3 against 178.4,
  P16 151.0 against 147.8, P4 18.3 against 17.6 (the script face's line). So every block from P7 on
  sits lower than the board: P7 by 41.2, P10 by 222.3, P15 by 649.9.
- FACT (review, one Opus reviewer, 2026-10-31): nothing Critical; the ports match the web (sort keys,
  house groups, ordinals, the long-transit pick, the moon bands, the Julian-day conversion). Five
  Important, all fixed in one round: the page dropped its chart rows and the reader's scroll on every
  return (now kept for the same culture and UTC day); an older load could overwrite a newer one (now
  cancelled); the glass screen lost its side and cutout insets (`GlassScreen` now reads the system
  bars and display cutouts on all four sides, not the keyboard); the Method page had no way in once the dashboard left
  the graph (Sky Day now closes with the app's `MethodFooter`, not on the board); the kicker date named
  the local day above the UTC day's decree (now UTC, as the web formats it, and the card's months too).
  Minors fixed: the long-transit pick reads the 00:00 UTC sky as the web's todayChart does; a missing
  next quarter leaves its line out; cancellation is not logged as a failure; section labels grow with
  a large font scale; the row's spoken action says "Open Transits".
- Deferred (Minors): no web golden pins the contacts and the long-transit pick for the sample day (the
  web side needs an export like `npm run export:goldens`); D-pad focus can scroll a row to sit under the
  tab bar (needs a bring-into-view inset the height of the chrome).
- FACT (scoped re-review, Sonnet, 2026-10-31): all five fixes hold; four new Minors, fixed in the second
  and last round: the keyboard no longer lifts the chrome; a culture change clears the old page first;
  with no birth record the next return composes again; the section label's comment says its glyphs
  overflow at large font scales, as CSS line-height 1 does.
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 241 tests, 0 failures.

### Matthew's answers on Sky Day (popup, 2026-10-31, after the renders were shown in the chat)

- FACT: "Approved, go to Week"; "Web's full sentence" on the contact rows (as built); MORE opens "The
  Learn hub" until step 10 (`GlassSection.route()`, Route.learn("/learn")); the old Day page's
  sections: "Keep them below Sky Day".
- FACT (`ui/screens/SkyDayScreen.kt`, `OldDaySections`): under the long transit and before the method
  line, flat, inside the board's 24 margins, with their own components and data
  (`DashboardViewModel`): the Do and Don't lists, the dive deeper, the natal wheel, and the Sun and Moon
  readings under "Decrees of the Oracle". They keep their old styling (accent kickers), which the glass
  design moved to dim elsewhere. The high priest summary and the come-back line stay off; Matthew
  named neither.
- FACT (`SkyDayFullPageTest`, `docs/design/android-glass/step2/sky-day-full-sheet.png`): the whole page
  on one 390x5200 frame, in four columns. Local suite: 242 tests, 0 failures.
