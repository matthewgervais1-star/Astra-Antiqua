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

## Step 3, Sky Week with the Moon (2026-10-31)

- FACT (prompt pasted by Matthew, 2026-10-31): build Sky Week on `GlassScreen` (WEEK, SKY) with P171 as
  approved ("Behind, slower than text": the disc a layer under the scrolling content, at rest centre 60,
  388.3, 170 of 220 shown, rising 0.5 dp per dp of scroll, lit part bone 10%; band P53 keeps 136 and the
  five facts; scrolled frame 556; Tuesday's TENSION line at 3.57:1 accepted). Board: Glass-Week and
  Glass-Week-scrolled (canvas version 1793480018-d41d, read 2026-10-31); table `report-r3b.md` in the design
  worktree; P171 in its `docs/design/ios-layout-2026-10-21.md` (2026-10-31).
- FACT (`domain/SkyWeek.kt`, `viewmodel/SkyWeekViewModel.kt`): `SkyWeekComposer` composes the week with the
  existing port `WeekReading.build` (Monday of the local week, each row read at 00:00 UTC) and the Moon with
  Sky Day's `moonToday` at the instant. `MoonToday` gained `waxing` (phase angle under 180).
- FACT (node run of web's `buildWeekDays("egypt" and "rome", mondayOf(sample), null)` against `web/src`,
  TZ Europe/Rome, 2026-10-31): Android's seven lines, tones, shorthand and Rome flags equal the web's for
  the sample week; `SkyWeekTest` pins Egypt's lines and two shorthands.
- FACT (`ui/screens/SkyWeekScreen.kt`): the board's sections in order. Web strings: the institution
  (`ScriptName`, so the reveal runs), the voice's week title (web `cultureVoice.ts` weekTitle, ported by
  hand in `WeekVoice`, set in its own case), each row's line and shorthand (deity glyphs, aspect glyph,
  TIGHT; ingress arrow and sign), the tone ink (conflict on tension, dim otherwise), Rome's F, N, C beside
  the weekday. Board forms where the web has no string: the kicker's range "19 → 25 OCT 2026" (across a
  month "29 SEP → 5 OCT 2026"), the count line, the band's five facts, the TODAY frame and label.
- INFERENCE: the count line counts a day with a figure or an ingress as weighed (the board counts its
  Wednesday ingress so) and writes zero as NONE ("SEVEN WEIGHED · NONE QUIET" for the sample week); the
  board shows no zero.
- FACT (same file): left off, as the votive was on Sky Day: the web's thesis paragraph, week note, votive,
  feedback row and links; each row's headline (the board has no slot). A row with a figure opens its
  figure page, where the web's headline link went, with the pressed fill P170, web's focus outline and the
  label "Read the figure for WED 21"; ingress and quiet rows take no tap. Asked in the popup.
- FACT (`GlassScreen.kt`, `SkyWeekScreen.kt`): `GlassScreen` gained a `behind` slot, drawn on the ground
  under the content and inside the glass backdrop. P171 sits on the band's measured centre (so it follows
  the band if the copy above grows), 220x170 at the content's left edge, offset in the layout phase by 0.5
  of the scroll; with the animator duration scale at 0 (`rememberAnimationsOff`, now internal) it moves
  with the text. The lit part is a half circle closed by an ellipse of semi-axis R x |2k - 1|, lit side
  right when waxing (`discPath`). P171 is hidden from TalkBack; the band reads as one sentence-case stop.
- FACT (`MainActivity.kt`): Route.WEEK opens `SkyWeekScreen` (not `flat`); `WeekScreen.kt` stays on disk,
  out of the graph. Its only exit of its own was the figure page, which the rows keep; `FigureScreen`'s
  "The week" link opens Sky Week.

## Step 3 checks (2026-10-31)

- FACT (`SkyWeekScreenshotTest`, `docs/design/android-glass/step3/placement.txt`): renders at rest,
  scrolled 556, scrolled 280, scrolled 280 with animations off, and Rome. Chrome in all: P1 off 0.9, P2,
  P3, P17, P20 0.0.
- FACT (same, at rest): every gap between blocks equals the board's to 0.1 (P21 to P31, P53). Boxes
  against the table: P21 18.3 against 17.6 (the script face's line, as Day's P4); P22 40.0 against 35.1
  (the web's title "SEVEN DAYS WEIGHED" on one line; Spectral SC's ascent and descent at 26 make 40.0 and
  Android grows the line box where CSS lets the glyphs overflow, as on Day's P6); so P23 on sits 5.7 lower
  (P53 at 326.0, P171 at 284.0). Rows follow the web's shorter copy: P25 141.0 against 192.3, P26 167.7
  against 218.7, P27 (today) 168.7 against 167.0, P28 141.0 against 166.0, P29 167.7 against 192.3, P30
  141.0 against 192.3, P31 141.0 against 166.0; each row is 0.6 taller than its lines because the
  shorthand's 16 dp glyph exceeds the 15.4 line. The page scrolls to 826 against the board's 1046.
- FACT (same): the Moon's top minus the band's top: at rest -42 (centre on centre), at 556 236, at 280 98,
  at 280 with animations off -42. `theDiscLightsTheRightSide` checks the path at 0, 5, 26, 50, 74 and 100%
  lit, waxing and waning. Rome: Cinzel title, flags C N N C F F F as the web.
- CANNOT CONFIRM: where the lit part crosses a tension line in this week's copy (the 3.57:1 figure is the
  board's, measured on the board's rows); not measured on Android. How the frames look on a phone:
  Robolectric drew them.
- FACT (review, one Opus reviewer, 2026-10-31): nothing Critical. Three Important, fixed in round 1: the
  band grows with the font scale (`heightIn`); TalkBack read the Moon twice and focused a box drifting
  under the chrome (P171 now decorative, the band one stop); the tests asserted too little (now gaps, the
  Moon's lead in four frames, the disc path, Rome's flags). Minors fixed: the anchor in the ground's own
  coordinates, reset on a culture change; counts past seven; per-day click labels; one month list. Round
  2 (scoped, same reviewer): no Important left; three Minors fixed (interior-point checks on the disc,
  the ground keyed on culture, the band's spoken text in sentence case).
- Deferred (Minors, Sky Day has the same): the page does not reload on resume after midnight, and a
  compose failure leaves blank chrome; one fix for both screens (reload on resume, an error line).
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 252 tests, 0 failures.

## Open for Matthew (asked in one popup, 2026-10-31)

1. Reduce Motion: the Moon scrolls with the text (built; INFERENCE in the design record).
2. The web's row headlines: off (built, board form) or above each row's line.
3. The web's thesis, week note (Rome's F, N, C key), votive, feedback and links: off (built) or below.
4. Sky Week approved, go to step 4 (Season)?

### Matthew's answers on Sky Week (popup, 2026-10-31, after the five renders were shown in the chat)

- FACT: Reduce Motion "Scroll with the text" (as built); rows "Add the web's headline" above each row's
  line; the web's thesis, note, votive, feedback and links "Below the seven rows"; step 3 "Changes first",
  with no notes. INFERENCE: the changes are the two above; step 4 waits for them.

### Matthew's two changes, built (2026-10-31)

- FACT (Matthew, 2026-10-31, "Yes, build them"): the web's headline in each row and the web's own sections
  below the seven rows, as he answered in the popup.
- FACT (`SkyWeekScreen.kt`, `RowBody`): each row prints the web's headline between the shorthand line and the
  reading, in web WeekNave's form (font-display at display-xs 18, leading 1.1, own case, 4 above the line);
  none on an ingress day, the culture's holds line on a repeated figure, as on web.
- FACT (`SkyWeekScreen.kt`, `WebWeekSections`; `domain/SkyWeek.kt`, `WeekVoice`): below Sunday, in the web's
  order and spacing: the thesis (web weekThesis, 40 under the rows), the note (web weekNote; Rome's carries
  its key " · F LAWFUL · N UNLAWFUL · C MIXED"), the votive for the week's hardest day (web WEEK_VOTIVE and
  pickHardestDay, drawn to web's Votive.tsx: rules, 16 inside, 18/1.6 at .14em in the accent), the feedback
  row and the links ← THE DAY, THE SEASON →, THE LONG TRANSITS →. Strings ported by hand; the reviewer checked
  each against `cultureVoice.ts` and `WeekNave.tsx` character for character.
- FACT (`ui/components/FeedbackRow.kt`): new. "AGAINST THIS WEEK → IT WAS SO · IT WAS NOT SO · KEPT ON THIS
  DEVICE"; the verdict sits in SharedPreferences `astra-antiqua.feedback.v1` under web's reading id
  (`week-2026-W43`, ISO week); a second tap clears it, as on web. Nothing leaves the device. TalkBack reads
  the pair as radio buttons with a "Clear" action on the chosen one.
- FACT (`placement.txt`): the gaps between blocks still equal the board's; the Moon's lead holds in all four
  frames. Rows with a headline grow by about 71 (P25 212.3, P26 219.0, P27 220.0, P28 212.3, P30 212.3,
  P31 212.3; Friday's ingress row 167.7 has none); the headline's Spectral SC glyphs at 18 are taller than
  CSS's 19.8 line box, so Android grows each headline as on P22. The page scrolls to 1722.7 with the
  sections below. New render `sky-week-end.png` (the page's foot).
- INFERENCE: the votive's first line, "WEIGH WHAT IS HEAVY BEFORE", wraps at 342 wide on the web at 390 too.
- FACT (scoped review, same Opus reviewer, 2026-10-31): no Important findings. Minors fixed: verdicts as a
  radio pair with a clear action, spoken labels on the links and the feedback lead, the foot's strings and
  Rome's key asserted, the votive's fallbacks tested. Deferred: the feedback file's first read runs on the
  main thread (small file); the links and verdicts keep the web's 18 dp tall targets, under Android's 48
  dp minimum (asked in the popup).
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 253 tests, 0 failures.

### Matthew's answers after the changes (popup, 2026-10-31, after four renders were shown in the chat)

- FACT: "Approved, go to Season"; tap targets "Grow the tap area only".
- FACT (`SkyWeekScreenshotTest.theFootsLinksTakeA48DpTouch`): Compose's hit test already widens a small
  clickable to the 48 dp minimum touch size when nothing else claims the touch; a tap 10 dp above THE DAY
  and THE SEASON, 10 dp below THE LONG TRANSITS and 10 dp above IT WAS SO each lands. No layout changed;
  the test pins it. Local: 254 tests, 0 failures.
- Step 4 prompt: `docs/design/prompts/android-glass-step4.md`.

## Step 4, Sky Season (2026-10-31)

- FACT (prompt pasted by Matthew, 2026-10-31): build Sky Season on `GlassScreen` (SEASON, SKY); board
  Glass-Season and Glass-Season-scrolled (canvas version 1793493664-ced5, read 2026-10-31, file
  `project/Glass-Season.dc.html`); table `report-r3b.md` in the design worktree (page 1197.7, scrolls to
  352, scrolled frame 256); the wheel from `r3-common.mjs` (`wheelGeom`, `houseWheel`).
- FACT (`domain/SkySeason.kt`): `SkySeasonComposer` ports web's season page for what the board prints:
  `seasonStatus`, OrbBar's fill (orb = days left, at least 6%), `SIGN_PHRASES`, `properCase`,
  `composeWhatItTouchesNatal` (with web's `houseGroups` names, five cultures),
  `composeWhatItTouchesSky`, `buildSeasonSkyRows` (open, each turn to retrograde, a slow body's closest
  approach within 3°, close), with web's 6-day sampling pad trimmed to the season's end. The window is
  `SkyEvents.currentSeason` (local calendar days, as web's).
- FACT (node run of `web/src` through jiti, `process.env.TZ = "Europe/Rome"`, 2026-10-31; scripts in this
  session's scratchpad, not kept): for the sample, LIBRA, DAY 29 OF 31, CLOSING, rows "23 SEP RA → THE SCALES
  · SEASON OPENS", "3 OCT ISIS STATIONED ℞", "23 OCT RA → THE SCORPION · SEASON CLOSES"; Rome SOL, VENUS;
  the eleventh house; for 2025-03-01 two conjunction rows (RA ☌ GEB EXACT, RA ☌ NUN EXACT); for
  2026-12-30 the Capricorn season across the year's end. `SkySeasonTest` pins each, and Android equals web.
  Note: `TZ=Europe/Rome node` from Git Bash did not take; set the zone inside the script.
- FACT (`ui/screens/SkySeasonScreen.kt`): the board's sections in order. Web strings: the institution
  (`ScriptName`, so the reveal runs), the title "THE SEASON OF THE SCALES" (P34, own case, two lines), the
  day line "DAY 29 OF 31 · CLOSING" and the bar's fill 94% (P35), the sign's blurb (P36, web
  `zodiacSigns.ts`, Android `Learn.SIGNS`), the house sentence (P39), the label THE SEASON'S SKY with web's
  straight apostrophe and web's rows (P40 on), each one mono line, the date in its tone's ink. Board forms
  where the web has no string: the kicker's range "23 SEP → 23 OCT 2026" (as Day and Week), the bar's end
  dates, THROUGH YOUR CHART, the house title "The eleventh house · The Assembly", the wheel P54.
- INFERENCE: without a birth record, P37 reads web's label WHAT IT TOUCHES over web's sky sentence, with no
  title and no wheel; the board has no chart-less form.
- FACT (same file): the wheel draws twelve whole-sign houses from the natal Ascendant at the left, the
  season's house at bone 14%, the Sun's ring and dot on radius 43 at its longitude now, the Ascendant tick;
  a longitude sits at 180° − (λ − Ascendant) in Compose's clockwise degrees. It equals the board's points
  (-7.42, -55.51 and -25, -34.98 at Sagittarius 22°23′ rising).
- FACT (`MainActivity.kt`): Route.SEASON opens `SkySeasonScreen` (not `flat`). `SeasonScreen` in
  `HorizonScreens.kt` and `HorizonViewModel.loadSeason` stay on disk, out of the graph; the flat screen had
  no exit of its own past its NaveShell, whose routes the glass chrome covers. Ways in: the horizon control,
  Sky Week's THE SEASON →.
- FACT (same file): nothing on the page is tappable. Each block that can sit below the fold (P36, P39, P54,
  each row) is a D-pad stop with web's focus outline; a focused block asks the scroll to show it with the
  glass's 173 above and 96 below. A touch never focuses it. Rows and the wheel carry spoken labels without
  glyphs ("3 oct isis stationed retrograde"; "Your houses: the Sun in the eleventh house, The Assembly").

## Step 4 checks (2026-10-31)

- FACT (`SkySeasonScreenshotTest`, `docs/design/android-glass/step4/placement.txt`): renders at rest,
  scrolled 256, Rome, without a chart, at font scale 1.3, on a 360x780 dp phone (2026-10-08, MIDPOINT
  PASSED), and with the last row focused. Chrome in all: P1
  off 0.9, P2, P3, P17, P20 0.0.
- FACT (same, at rest): every gap between blocks equals the board's to 0.1 (P32 to P42, P54). Boxes against
  the table: P32 18.3 against 17.6 (the script face's line, as Day's P4); P34 75.3 against 35.1 (web's title
  on two lines, each 37.6 for Spectral SC's glyphs, as Week's P22); P36 60.0 against 59.4; P38 24.7 against
  23.2 (Spectral SC at 16); P39 113.3 against 112.2; P54 120x120 at x 135 as the board; P41 and P42 48.7
  against 79.9 and 156.4 (web's rows are one mono line; the board's carry a prose line). A third row (the
  close, `row-3`) follows. So P35 sits 41.0 lower, P40 44.3; the page scrolls to 307.7 against 352.
- FACT (same): at 1.3 the day line keeps one line, 19.0 tall, and the gaps around the bar hold. At 360 dp
  "DAY 16 OF 31 · MIDPOINT PASSED" wraps to two lines between the dates; P35 grows to 37.3 and the gap to
  P36 stays 26. From P36, D-pad Down (`FocusManager.moveFocus`) walks P39, P54, P41, P42, row-3 in order; with
  row-3 focused the page scrolls to 283.7 and the row's bottom sits at 748, the tab bar's top.
- CANNOT CONFIRM: how the frames look on a phone; Robolectric drew them.
- FACT (review, one Opus reviewer, 2026-10-31): nothing Critical; the ports and the wheel geometry hold.
  Important, fixed in round 1: no D-pad way down the page (now the stops above); the day line could wrap
  over the bar at a large font scale (now it takes the width the dates leave, unboxed past scale 1.0); the
  page went blank on return without a birth record (a separate culture field now). The web's sections not
  on the board: asked in the popup. Minors fixed: the chart-less page shown first to a reader with a chart
  (the profile is now read first, one compose); the slow-body walk read ten bodies (now two); spoken labels;
  `properCase`; tests for conjunction rows, a year-end season, status edges, the filled sector, P54's box.
- FACT (scoped re-review, same reviewer, 2026-10-31): round 1's fixes hold but one. Important, fixed in round 2:
  on a 360 dp phone the day line wrapped inside its 11 dp box (the row now takes the text's height whenever
  the line wraps). Minors fixed: a chart that fails to compute leaves the sky's season, not an empty page;
  the D-pad test now moves focus down the stops. Second and last round.
- Deferred (Minors): a focused block is shown clear of the canvas's chrome (173 above, 96 below), not of the
  device's own bars where those are taller (`GlassScreen` would need to publish its chrome's extents); the
  kicker's board form (Day and Week precedent, asked); a birth record edited the same
  day shows at the next local day (Sky Day has the same); the flat `SeasonScreen` stays on disk; `SkyEvents`
  stops an ingress search at 60 s where web stops at 30 min, so an ingress within 30 min of midnight can
  print a day apart (inherited).
- FACT (local, 2026-10-31): `./gradlew compileDebugSources testDebugUnitTest` 270 tests, 0 failures (254
  before step 4).

## Open for Matthew (asked in one popup, 2026-10-31)

1. The web season's own sections not on the board: WHAT IS CHANGING, WHERE IT BEGINS, WHAT IT LEAVES BEHIND,
   the votive, the feedback row, the CAST A CHART line and the links. Below the board's sections as on
   Week, or off. WHAT IS CHANGING and the votive need web's standouts (eclipses, story beats, transit peaks
   to the chart), which Android has not ported.
2. The kicker: the board's "23 SEP → 23 OCT 2026 · institution" (built, as Day and Week) or web's "THE
   SEASON · 23 SEP – 23 OCT".
3. Sky Season approved, go to step 5 (Year)?

### Matthew's answers on Sky Season (popup, 2026-10-31, after the six renders were shown in the chat)

- FACT: the web's sections "Below the board, as Week" (WHAT IS CHANGING, WHERE IT BEGINS, WHAT IT LEAVES
  BEHIND, the votive, the feedback row, the CAST A CHART line, the links; WHAT IS CHANGING and the votive need
  a port of web's `buildSeasonStandouts`); step 4 "Changes first".
- FACT (his answer on the kicker, quoted): "Could we not do a master design revamp that merges and
  standardizes all the versions? this way there's no split or differentials other than layout and thats a
  screen issue that is solvable?" INFERENCE: the kicker stays as built until he settles that question; it
  asks for one set of strings shared by web, iPhone and Android, with only layout differing per screen.

### The web's sections below Sky Season, built (2026-10-31)

- FACT (Matthew, 2026-10-31, "Build sections now", after his popup answer "Below the board, as Week").
- FACT (`domain/SeasonStandouts.kt`): ports web's `buildSeasonStandouts` (`lib/season.ts`) with the finders it
  reads (`lib/yearForecast.ts`: `findMajorTransits` and its bisection, `findEclipses`, `findMoonPhases`; stations
  and ingresses through `SkyEvents`), the eight dated story beats (`data/yearNarrative.ts`), `TRANSIT_PRINCIPLE`,
  `transitPlanetWeight`, `toneOf`, and the page's prose (`seasonContent.ts`: `composeWhatIsChanging`,
  `composeWhereItBegins` with `companionInSign`, `composeWhatItLeavesBehind`, `SEASON_VOTIVE` by
  `seasonVotiveTone`). `AstronomyEngine.getMidheaven` ports web's Midheaven (`lib/ascendant.ts`); the season reads
  transits to the Sun, Moon, Ascendant and Midheaven as web's does.
- FACT (node run of `web/src`, TZ Europe/Rome, 2026-10-31): Android's sentences equal web's for the sample with
  and without the chart (Egypt, Rome), for 2025-03-01 with the chart (Egypt, Rome, Greece, Carthage, Canaan) and
  without it (the 14 March 2025 lunar eclipse ranks), and for 2026-12-30; `SkySeasonTest` pins them. The
  smoke birth's angles: Ascendant 262.398, Midheaven 195.599 on both. Web's own wording is kept as written,
  "Scales's excuses" and "under via" included.
- FACT (`ui/screens/SkySeasonScreen.kt`, `WebSeasonSections`): below the season's sky in web SeasonNave's order:
  WHAT IS CHANGING, WHERE IT BEGINS, WHAT IT LEAVES BEHIND (WHAT IT TOUCHES is P37 to P39), the votive, the
  feedback row (`season-libra-2026`, kept on the device), the call "CAST A CHART TO SEE WHAT THE SEASON TOUCHES
  IN YOUR OWN HOUSES → READING" when there is no birth record, and the links ← THE DAY, THE WEEK, THE YEAR →,
  THE LONG TRANSITS →. Web's spacing (40 under the rows as on Week, gap-7, gap-2.5, mt-8, mt-6, mt-9) holds to
  0.1 in `sky-season-end`. READING opens the cast screen on top of the season (`onOpen`), so saving a chart
  comes back to it. Each prose block and the votive is a D-pad stop; the links take Compose's 48 dp touch
  (tested on THE YEAR). The page scrolls to 954.0.
- FACT (scoped review, same Opus reviewer, 2026-10-31): nothing Critical or Important; the beats, verbs, ranking,
  votive tone, eclipse handling and Midheaven checked against web. Four Minors fixed in one round: READING
  switched sections instead of opening on top; the transit search read each planet's longitude once per target
  (now once per date); no test reached an eclipse or the other three voices (now both); TalkBack read the call's
  arrow. Local: 275 tests, 0 failures. New renders `sky-season-end.png`, `sky-season-no-chart-end.png`.

### Matthew's answers after the sections (popup, 2026-11-01)

- FACT: step 4 "Changes first", with no change named; the popup went up before the three renders reached the
  chat (a wrong path), and they were sent right after. CANNOT CONFIRM: which changes he wants.
- FACT: the master revamp (one set of strings for web, iPhone and Android, layout the only difference): "Pause
  the port until it lands". INFERENCE: steps 5 to 11 wait for the revamp; Sky Season stays as built until then.

## Step 5, Sky Year (2026-11-01)

- FACT (task from the session that ran the shared-strings revamp, 2026-11-01): Matthew chose to resume the port
  after PR #12 merged, from master (a16a73e); branch `claude/android-glass-step5-year-e880ad`. Board Glass-Year
  (canvas version 1793493664-ced5, read 2026-11-01, file `project/Glass-Year.dc.html`); table `report-r3b.md` in
  the design worktree, Year P43 to P52 (page 981.7, scrolls to 136, scrolled frame 100).
- FACT (`domain/SkyYear.kt`, `domain/YearNarrative.kt`, `domain/ScreenSlots.kt` `SkyYearSlots`): web's
  `buildYearScreen` slots (`lib/screens/year.ts`) and a port of what the page prints from `buildAnnualReport`
  (`lib/annualReport.ts`: the theme's body, its dominant transit, the four quarters), `buildYearSegments`,
  `spanHeadline`, `SKY_ONLY_OPENING`, `yearVotiveTone`, `buildSkyOnlyTimeline` (`yearContent.ts`) and
  YearNave's spine filter. Left out because the page does not print them: the theme's headline and context,
  hardest and easiest stretches, standouts, solar return, narrative headlines and beats. `YearNarrative.kt` was
  generated from web's `getYearTheme`, `getSeason`, `getSpecialYear` through node.
- FACT (`ScreenGoldenTest`): the 10 cases of `shared/goldens/screens/year.json` equal web's on every slot.
- FACT (node run of `web/src` through jiti, `process.env.TZ = "Europe/Rome"` inside the script, 2026-11-01;
  script `year-parity.mjs` in this session's scratchpad, not kept): opening body, dominant aspect, segments
  (label, range, summary, status), spine headlines with their end month, votive and row tones equal Android's
  (`SkyYearTest` literals) for the five cultures at the sample with and without the chart, for 2025-03-01,
  2026-12-30 and 2026-09-29. Web's own wording is kept as written ("against your the top of your chart").
- FACT (`ui/screens/SkyYearScreen.kt`): the board's sections in order with the catalog's strings: the kicker
  "FROM 21 OCT 2026 · THE HALL OF MA’AT" (institution through `ScriptName`, so the reveal runs), web's title
  "MMXXVI · THE YEAR OF THE RIVER" (two lines), the count "70 TURNINGS · …", then web's 21 turnings in the
  board's spine form: a month label (30 above, 18 below) over each month's ruled list, rows 20 apart, the
  retrograde words in conflict ink, an ingress's prose line from web, no prose line on stations.
- INFERENCE (same file): web's timeline starts at the instant, so TODAY (P49) leads its month and no row sits
  above it; the board shows 3 OCT and 16 OCT above it. When today's month has no row (29 SEP, 30 DEC), TODAY
  takes its own month label; web has no such slot.
- FACT (`placement.txt`, same file): with a chart web prints neither the count line nor the timeline (YearNave
  shows them only without one); Android prints both in both states because the board does.
- FACT (same file): the web's sections below the board, in YearNave's order: the opening (the year's theme, or
  the sky-only opening), with a chart the quarter segments (stacked: label and dates beside the status, the
  summary below, since web's three columns leave about 70 dp at 342), Greece's festivals note, the spine box
  (six rows, each a link to its transit except Midheaven rows, which Android's transit detail cannot open), the
  votive; without a chart the CAST A CHART box (opens the cast screen on top); the feedback row (`year-2026`,
  kept on the device); ← THE SEASON and THE YEAR AHEAD → (the forecast, on top). Web's spacing holds.
- FACT (`MainActivity.kt`): Route.YEAR opens `SkyYearScreen`. The flat `YearScreen` and
  `HorizonViewModel.loadYear` stay on disk, out of the graph. Ways in: the horizon control on Day, Week, Season
  and Year, Season's THE YEAR →. The flat screen's only exits were its NaveShell's tabs and horizons, which the
  glass chrome covers.
- FACT (same file): every row, TODAY, the opening, each segment, spine row and the votive is a D-pad stop shown
  clear of the glass (173 above, 96 below); spoken labels carry no glyphs ("24 oct mercury turns retrograde",
  "day 1 of 92").

## Step 5 checks (2026-11-01)

- FACT (`SkyYearScreenshotTest`, `docs/design/android-glass/step5/placement.txt`): renders at rest, scrolled 100,
  Rome, without a chart, at font scale 1.3, on a 360x780 dp phone, the end with and without a chart, Greece's
  end, and with row-7 focused. Chrome in all: P1 off 0.9, P2, P3, P17, P20 0.0.
- FACT (same, at rest): every gap equals the board's to 0.1 (18, 10, 30, 18, 19.9 as 20.0, rows 20; each further
  month 30 and 18), and holds in the scrolled, Rome, no-chart, 1.3 and 360 frames. Boxes against the table: P43
  18.3 against 17.6 (the script face's line); P44 75.3 against 35.1 (web's title on two lines); P45 41.0 lower;
  P46 41.1 lower; rows 15.7 against 45.9 and 122.4 (IBM Plex Mono's glyphs; stations carry no prose line). The
  page scrolls to 2928.3 with a chart and 1401.0 without, against the board's 136.
- FACT (same): D-pad Down from TODAY walks P47, P48, P50, P51, P52, row-6, row-7; with row-7 focused the page
  scrolls to 39.3 and the row's bottom sits at 748. THE SEASON, THE YEAR AHEAD and CAST A CHART take a 48 dp touch.
- CANNOT CONFIRM: how the frames look on a phone; Robolectric drew them. Web's `toLocaleDateString(undefined, …)`
  follows the runtime locale; Android and the node check use en-US ("June 8").
- FACT (review, one Opus reviewer, 2026-11-01): nothing Critical; the ports equal web against the node dump.
  Important, fixed in round 1: spine rows did not link to their transit as web's do (now they do, except
  Midheaven spans: `TransitsViewModel` reads only Sun, Moon and Ascendant). Minors fixed: spoken label for the
  spine heading, segment status spoken "day 1 of 92", the both-states note, a chart that fails to compute is
  retried on the next load.
- FACT (scoped re-review, same reviewer, 2026-11-01): round 1's fixes hold. Minor, fixed in round 2: the linked
  spine rows had lost the scroll clear of the glass (now `glassClearFocus()`, split out of `dpadStop()` in
  `SkySeasonScreen.kt`); a D-pad test ends on spine-1, top 658.0, bottom 748.0 (render `sky-year-spine-focus.png`).
  Second and last round.
- Deferred: the votive's second line leaves "YOU" alone on a third line at 342 (asked); spine headlines wrap to
  three lines (asked); `SkyYearComposer` formats in the device zone while `SkyYearSlots` takes a zone (web's
  "local" both ways); `SkyEvents` ingress search to 60 s (inherited from step 4).
- FACT (local, 2026-11-01): `./gradlew compileDebugSources testDebugUnitTest` 299 tests, 0 failures (279 before
  step 5).

### Matthew's answers on Sky Year (popup, 2026-11-01, after the ten renders were shown in the chat)

- FACT: the votive "Tighten tracking"; the spine headlines "Leave as built"; TODAY "Keep web's" (turnings from
  today only); step 5 "Approved, step 6 next".
- FACT (`SkyYearScreen.kt` `votiveTracking`, `SkyYearScreenshotTest.skyYearEnd`): the votive's tracking steps down
  from web's .14em by .01 (floor .04em) until each of the catalog's lines fits; at 342 Egypt's votive takes two
  lines, 92.0 tall against 121.0 before. Local: 299 tests, 0 failures.
- Next: step 6, Transits, in a fresh session; push and PR on Matthew's word.

## Step 6, Transits (2026-11-01)

- FACT (task from the session running the port, 2026-11-01): branch `claude/android-glass-step6-transits-30fec3`, cut
  from step 5's. Board Glass-Transits (canvas version 1793493664-ced5, file `project/Glass-Transits.dc.html`); table
  `report-r4.md` (chrome lines 7 to 17, content P57 to P68, page 979.6, scrolls to 134) and `report-r7.md` (Section
  divider P62, P64; Span timeline P60, P61, P63; List row P170).
- FACT (`domain/LongTransits.kt`, `domain/ScreenSlots.kt` `TransitsSlots`): web's `readerSpans` (Sun, Moon, Ascendant
  and Midheaven), `groupSpans`, `spanRowText` (tone by `spanTone`, so a conjunction is ease only for Jupiter) and
  `transitsModelFromSpans`. The board's bar geometry: months from the first listed span's start month to the last's
  end month inclusive; a bar at its start month's index over the months, as wide as the months it covers; a year at
  its January (the first at 0); NOW at (month index + day / days in month) over the months, drawn only inside 0..1.
- FACT (`viewmodel/TransitsViewModel.kt`): the detail's spans now walk the Midheaven too, and a load after the empty
  state reads the profile again. The flat `TransitDetailScreen` opens a Midheaven span ("Amun joins the barque of
  your midheaven", render `step6/transit-detail-mc.png`); Sky Year's Midheaven spine rows now link as web's do.
- FACT (`ScreenGoldenTest`): the ten cases of `shared/goldens/screens/transits.json` equal web's on every slot.
- FACT (node run of `web/src`, `process.env.TZ = "Europe/Rome"` inside the script, 2026-11-01; scripts in that
  session's scratchpad, not kept): group, id, title, data line, start, end and pass count equal Android's for Egypt
  and Rome at the sample and Egypt at 2025-03-01 (`LongTransitsTest` literals). Smoke angles: Ascendant 262.398,
  Midheaven 195.599.
- FACT (`ui/screens/LongTransitsScreen.kt`, `MainActivity.kt`): Route.TRANSITS opens `LongTransitsScreen`; the flat
  `TransitsScreen` stays on disk, out of the graph. The board's form: no READ → (web's `transits.row.link`), the
  whole row opens the flat detail on top with P170 under the finger. Without a birth record web's TransitEmptyState
  words (hard-coded in web), CAST THE FIRST CHART opening the cast screen on top. 2029's axis label sits left of
  its rule (at 96.4% it would leave the page).
- FACT (`LongTransitsScreenshotTest`, `docs/design/android-glass/step6/placement.txt`): chrome P1 off 0.9, P3, P17,
  P20 0.0 in every frame; every gap equals the board's (16, 10, 30, 18, 0, 22, rows 12 or 16 / 12 / 10 / 18 + rule)
  at rest, scrolled 134, Rome, 1.3 and 360 (all eleven block gaps and the inner gaps of P63, P65 and P66 in each).
  Web's title takes two lines (P58 75.3 against 35.1). Rows: P63 and P65 131.3 (board 107.8, 92.4), P66 to P68 114.3
  (board 96.4, 96.4, 117.4), row-6, row-8 and row-9 135.3, row-7 114.3; capitals wrap, and web's data line carries
  the AHEAD count. The page scrolls to 791.7.
- FACT (review, one Opus reviewer, 2026-11-01, fix round 1): Important, fixed: a year label could overlap the one
  before it when the first listed month is NOV or DEC (or OCT at 1.3); `axisMarks` now drops the earlier year (label
  and rule) when the later label would start within it plus 8, so the later January wins (tests: DEC at 390, NOV at
  360, the sample at 1.3, where 2026 gives way). Minors fixed: `TransitsViewModel` walks again when the profile
  differs from the one walked (a recast chart) and after an error; a later `now` is ignored once walked for the same
  profile (KDoc); `LongTransits` groups once; the axis labels' widths are remembered; CAST THE FIRST CHART is at
  least 48 tall with its words centred. Local: 328 tests, 0 failures (299 before step 6).
- Deferred to step 9: the flat detail builds its own `TransitsViewModel`, so each row tap walks the spans again.
- FACT (scoped re-review, same reviewer, 2026-11-01, fix round 2): a recast saved while a walk ran could publish the
  old chart's spans; `TransitsViewModel` now reads the profile again when a walk ends and walks again if it changed
  (test `a recast while the walk runs publishes the new chart's spans`); KDoc says spans are held per birth record.
  Second and last round.
- FACT (local, 2026-11-01): `./gradlew compileDebugSources testDebugUnitTest` 329 tests, 0 failures (299 before step 6).
- CANNOT CONFIRM: how the frames look on a phone; Robolectric drew them.
- Deferred (Minors): Day's long-transit card and the forecast still walk Sun, Moon and Ascendant through
  `natalPointsOf` (the Day golden passes); Day's footer tone uses `SharedFormat.spanToneWord`, which reads every
  conjunction as ease where web's `spanTone` reads ease only for Jupiter (not checked against web's Day); a row
  focused at the foot sits flush at 748, so its 2 px outline meets the tab bar (as steps 4 and 5).

## Open for Matthew (asked in one popup, 2026-11-01)

1. READ → (web's `transits.row.link`) at each row's right, or the board's form without it (built).
2. Row titles and the headline in the catalog's capitals (built, as steps 4 and 5), or small caps from lower case as
   the board and web's CSS draw them; capitals take more lines.
3. Sky Transits approved, go to step 7 (Chart)?
