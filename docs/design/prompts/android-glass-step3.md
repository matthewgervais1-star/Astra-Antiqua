# Prompt: Android Liquid Glass, step 3, Sky Week with the Moon (2026-10-31)

Paste the block into a new Claude Code session on worktree
`L:\Claude Projects\astra-antiqua\.claude\worktrees\android-glass-7a8074`
(branch `claude/android-glass-7a8074`, not pushed).

```text
You are running step 3 (Sky Week with the Moon) of the Astra Antiqua Android Liquid Glass port, on
branch claude/android-glass-7a8074. Steps 1 (the chrome) and 2 (Sky Day) are built and approved.
Read first: HANDOFF.md (the 2026-10-31 sections at the end); docs/design/android-glass.md (every
step-1 and step-2 decision and number); android/app/src/main/java/com/astra/antiqua/ui/theme/glass/
(GlassScreen, Chrome, GlassInk, KyantGlass) and ui/screens/SkyDayScreen.kt (the pattern for a Sky
screen: board numbers in a Board object, CSS line boxes via LineHeightStyle centred and untrimmed,
test tags with the canvas IDs); the tests ui/screens/SkyDayScreenshotTest.kt, domain/SkyDayTest.kt
(the sample state: smoke birth, 2026-10-21 06:00 UTC, RomeZoneRule).

The design (read-only, worktree L:\Claude Projects\astra-antiqua\.claude\worktrees\astra-antiqua-design-rounds-a1291d):
docs/design/ios-layout-2026-10-21.md (Round 3, P53 and P54 built 2026-10-28, and the 2026-10-31
Moon sections); .superpowers/sdd/glass-build/report-r3.md, report-r3b.md (the Week table, P21 to
P31 and P53), measure-moon-parallax.json, build-moon-apply.mjs, report-r7.md (Moon band spec). The
board is Glass-Week and Glass-Week-scrolled on canvas https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V
(Artifact read with path project/Glass-Week.dc.html; never publish to it). Approved for the Moon
(Matthew, 2026-10-31, "Behind, slower than text"): P171, the disc as a layer under the scrolling
content, at rest centre 60, 388.3, 170 of 220 shown, rising 0.5 dp per dp of scroll, lit part bone
10%; band P53 keeps its 136 and the five facts; scrolled frame 556. Accepted with it: Tuesday's
TENSION line falls to 3.57:1 where the Moon passes under it.

Rules that bind (Matthew): the board's sections in its order filled with the web's own strings
(web/src is canonical; Android already ports the week in domain/WeekReading.kt and
ui/screens/WeekScreen.kt), the board's forms only where the web has no string; content flat on the
culture's ground, glass for the navigation layer only; Kyant0/AndroidLiquidGlass 1.0.6 is the
library; fill .80 (tint tier .90); chrome type fixed size; Route.WEEK opens the glass screen, the
flat WeekScreen leaves the graph the way MainDashboardScreen did (check nothing else loses its only
way in). Open, ask in the stop popup unless the record settles it: under Reduce Motion (Android's
animator duration scale 0, read by the existing AnimationsOffProvider) the Moon scrolls with the
text (INFERENCE in the design record; Matthew has not ruled).

Work: build Sky Week on GlassScreen (horizon WEEK, section SKY); render at 390x844 dp with Roborazzi
at rest and at the scrolled frame 556 (and one Moon frame under Reduce Motion); check the chrome to
within 1 dp and list every content ID against the table with the reason for each difference; keep
the script reveal, reduced motion and D-pad focus working; one implementer (you) and one Opus
reviewer, at most two fix rounds on Minors. Build and test locally with
`cd android && ./gradlew compileDebugSources testDebugUnitTest` (JAVA_HOME = C:/Program Files/Android/Android Studio/jbr).
On this drive new build folders carry the read-only attribute and Gradle then fails with "Unable to
delete directory": run `attrib -R /S /D app\build\*` (and build\*, .gradle\*) from android/ first.
The suite is 242/0 at commit time of step 2.

Then append docs/design/android-glass.md and HANDOFF.md with dated FACT / INFERENCE / CANNOT
CONFIRM lines naming their sources, commit on the branch (no push, no PR until Matthew says), send
the renders into the chat (his standing rule), ask everything open in one AskUserQuestion popup,
and stop. No em dashes, no hedging adverbs.
```
