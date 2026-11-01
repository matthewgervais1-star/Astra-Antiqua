# Prompt: Android Liquid Glass, step 4, Sky Season (2026-10-31)

Paste the block into a new Claude Code session on worktree
`L:\Claude Projects\astra-antiqua\.claude\worktrees\android-glass-7a8074`
(branch `claude/android-glass-7a8074`, not pushed).

```text
You are running step 4 (Sky Season) of the Astra Antiqua Android Liquid Glass port, on branch
claude/android-glass-7a8074. Steps 1 (the chrome), 2 (Sky Day) and 3 (Sky Week with the Moon) are
built and approved. Read first: HANDOFF.md (the 2026-10-31 sections at the end);
docs/design/android-glass.md (every decision and number of steps 1 to 3, Matthew's answers
included); android/app/src/main/java/com/astra/antiqua/ui/theme/glass/ (GlassScreen with its
`behind` slot, Chrome, GlassInk, KyantGlass); ui/screens/SkyWeekScreen.kt and SkyDayScreen.kt (the
pattern for a Sky screen: board numbers in a Board object, CSS line boxes via LineHeightStyle centred
and untrimmed, test tags with the canvas IDs, the web's own sections drawn below the board's, rows
opening their detail with the pressed fill P170); the tests ui/screens/SkyWeekScreenshotTest.kt
(gaps asserted against the board, chrome within 1 dp) and domain/SkyWeekTest.kt (the sample state:
smoke birth, 2026-10-21 06:00 UTC, RomeZoneRule; web parity checked by running web/src in node,
see the script idea in docs/design/android-glass.md, step 3).

The design (read-only, worktree L:\Claude Projects\astra-antiqua\.claude\worktrees\astra-antiqua-design-rounds-a1291d):
docs/design/ios-layout-2026-10-21.md (Round 3; P54 built 2026-10-28); .superpowers/sdd/glass-build/
report-r3.md, report-r3b.md (the Season table, P32 to P42 and P54: page 1197.7, scrolls to 352,
scrolled frame 256; the wheel 135, 670.4, 120x120, whole-sign houses from the chart's rising, the
Sun's house filled bone 14%, the Sun's mark, an Ascendant tick), r3-common.mjs (the wheel's markup),
report-r7.md. The boards are Glass-Season and Glass-Season-scrolled on canvas
https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V (Artifact read with path
project/Glass-Season.dc.html; never publish to it).

Rules that bind (Matthew): the board's sections in its order filled with the web's own strings
(web/src is canonical: the season page and web/src/lib/season.ts; Android already ports the season
in ui/screens/SeasonScreen.kt, HorizonViewModel.loadSeason and domain/SkyEvents), the board's forms
only where the web has no string; content flat on the culture's ground, glass for the navigation
layer only; Kyant0/AndroidLiquidGlass 1.0.6; fill .80 (tint tier .90); chrome type fixed size;
Route.SEASON opens the glass screen and the flat SeasonScreen leaves the graph (check nothing loses
its only way in). Precedent from Week (Matthew, 2026-10-31): web strings the board has no slot for
were added where he asked (the row headlines), and the web's own sections not on the board went
below the board's sections; ask in the stop popup whether Season follows the same, unless the record
settles it. Touch targets: Compose widens small clickables to 48 dp in hit testing; keep a test like
SkyWeekScreenshotTest.theFootsLinksTakeA48DpTouch for any small link.

Work: build Sky Season on GlassScreen (horizon SEASON, section SKY); render at 390x844 dp with
Roborazzi at rest and at the scrolled frame 256 (and Rome); check the chrome to within 1 dp, assert
every gap between blocks against the board's table and list every content ID with the reason for
each difference; keep the script reveal, reduced motion and D-pad focus working; one implementer
(you) and one Opus reviewer, at most two fix rounds on Minors. Build and test locally with
`cd android && ./gradlew compileDebugSources testDebugUnitTest` (JAVA_HOME = C:/Program Files/Android/Android Studio/jbr).
On this drive new build folders carry the read-only attribute and Gradle then fails with "Unable to
delete directory": run `attrib -R /S /D app\build\*` (and build\*, .gradle\*) from android/ first.
The suite is 254/0 at the close of step 3.

Then append docs/design/android-glass.md and HANDOFF.md with dated FACT / INFERENCE / CANNOT
CONFIRM lines naming their sources, commit on the branch (no push, no PR until Matthew says), send
the renders into the chat (his standing rule), ask everything open in one AskUserQuestion popup,
and stop. No em dashes, no hedging adverbs.
```
