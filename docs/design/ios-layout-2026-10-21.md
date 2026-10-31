# The iOS layout redesign, as of 2026-10-21

Tags: FACT names its source; INFERENCE is a judgment; CANNOT CONFIRM is open.

## Where the design lives

- FACT: the redesign is a Claude Design canvas, https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V
  ("Astra Antiqua iOS layout"), private to its owner. Ten artboards: Doorway, Sky (Day, Week,
  Season, Year), Transits, Chart, Placement (Ra), More, and one board showing the same Wednesday
  in all five cultures. The screens link to each other, so the canvas runs as a prototype.
- FACT: every line of copy and every number on it comes from the app's own output: the CI
  screenshots of run 39554986285 (`swift-ios27-screens`), the week fixtures in
  `dotnet/AstraAntiqua.Core.Tests/TestData/horizons.json` (week of 2026-10-19, five cultures),
  `shared/content/cultures.json`, `shared/content/deities.json`, and positions for the smoke birth
  (`dotnet/AstraAntiqua.Core.Tests/TestData/smoke-birth.v1.json`) computed with astronomy-engine.
- FACT: tokens, type and rules follow `docs/design/system/` and the mobile mocks in
  `docs/design/handoff/screens/` (2a home mobile, 3a onboarding mobile).

## What the canvas changes against the current Swift app

- FACT: one header on every screen: the ASTRA ANTIQVA wordmark, then a sub-bar. The app today
  shows a navigation-bar title and an in-page heading for the same thing.
- FACT: Today and Horizons merge into one SKY tab with a DAY, WEEK, SEASON, YEAR control, as the
  web's horizon control does. Four tabs instead of five.
- FACT: a culture chip (accent square, name) sits in every sub-bar and opens the culture list.
- FACT: the accent is kept to its three jobs from `docs/design/system/readme.md`: the active
  culture, the votive line, the received bodies (Nut, Nun, Osiris in Egypt). Kickers and section
  labels move from accent to the dim ink.
- FACT: Transits draws all six spans on one shared two-year axis with a NOW line. Placement gains
  previous and next body links (from the handoff's placement page).

## Decisions taken 2026-10-21 (Matthew, in the session popup)

- FACT: bottom bar: flat text tabs (SKY, TRANSITS, CHART, MORE), mono caps on the culture ground.
  No Liquid Glass, per the house rule against glass.
- FACT: headlines: Spectral SC at 0.06em on Egypt, Greece, Canaan and Carthage; Cinzel stays for
  Rome and the app shell (wordmark, culture names, doorway). Applied on the canvas, version 12.
- FACT: porting waits. Matthew comments on the canvas first; the SwiftUI port starts once he
  approves the revised design.

## Open

- CANNOT CONFIRM: what Matthew will change on the canvas.
- INFERENCE: the port needs a custom tab bar in place of `TabView`'s system bar and a shared
  header view.
- FACT: the iOS bundle takes its fonts from `android/app/src/main/res/font`, which has no Spectral
  SC file today; `web/scripts/fetch-fonts.mjs` already fetches the family (its "Spectral SC"
  entry), so the port adds the TTFs from there.

## Later on 2026-10-21: a glass version

- FACT: Matthew asked for a Claude Design prompt that builds the iPhone look with Liquid Glass and
  lets him go over layout and placement round by round. The prompt is
  `docs/design/prompts/ios-glass-design.md`; it reads the flat canvas for copy and data.
- INFERENCE: the flat-tabs decision above stands until Matthew picks between the flat canvas and
  the glass design. The port waits for that pick.
- FACT: Matthew said the flat canvas is "the beginning of the build" and is what he wants carried
  forward. The glass prompt now works inside that canvas: the ten flat artboards stay untouched on
  a "Flat (start)" page, glass copies go on a "Glass" page, and only the chrome changes. Canvas
  content checked unchanged at version 1792628087-bd93 (same project files as version 12).

## Later on 2026-10-27: Liquid Glass, rounds 1 to 3

- FACT (this file): this copy lives in worktree `planner-buildout-completion-495257`; the original in
  worktree `festive-khayyam-4aac34` is unchanged, because a session hook refuses writes across
  worktrees. The brief `docs/design/prompts/ios-glass-design.md` and the references folder
  `docs/design/references/2026-10-27_phone-screenshots/` were copied here the same way.
- FACT (canvas https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, page "Glass"): Round 1 built
  chrome variants A, B, C of Sky Day (rows at y 0, 1250, 2500). Matthew chose A (2026-10-27).
  Round 2 built Sky Day in A at full fidelity (row at y 3750). Round 3 (this session) built Sky
  Week, Season and Year in A (rows at y 5000, 6250, 7500), each at rest and scrolled, each with a
  placement map. The ten flat artboards on "Flat (start)" are untouched.
- FACT (canvas change log note; `.superpowers/sdd/glass-build/report.md`, `report-r3.md`): chrome A
  at default levers, 390x844 frames, points from the top left: P1 wordmark at 24, 75 (Cinzel 13,
  .28em); P3 culture menu, a glass capsule at 270, 62, 104x44; P2 DAY WEEK SEASON YEAR, a glass
  segmented control at 16, 113, 358x44, padding 3; P17 tab bar, a glass capsule at 16, 748,
  358x56, 6 above the bottom safe line at 810; P20 scroll edge at 0, 0, 390x173 in scrolled
  frames. Glass: rgba(24,21,16,0.80), blur 24, saturate 1.5, 1 px inset highlight, untinted.
  Dim labels hold 4.61:1 or better over dense text under the glass.
- FACT (`measure-r3.json`, headless Chrome): on all three screens the content keeps its flat x and
  y to a tenth of a point (kicker at y 189; content top lever 189 equals the flat header stack).
  The flat markup is carried as is; at default levers the glass content is byte for byte the flat
  content (checked by the generator). IDs: Week P21 to P31, Season P32 to P42, Year P43 to P52.
- FACT (same): page heights under glass, Week 1755 (scrolls to 910), Season 1062 (to 216), Year
  982 (to 136). Scrolled frames sit at 420, 120 and 100. The Year board keeps the flat's six
  October turnings; nothing was invented for the other 66.
- FACT (canvas note "Round 3 · proposals"): Matthew's two Co-Star references were placed as
  proposals only, P53 (a Moon-phase disc bleeding off the Week's edge, flat, no glow) and P54 (a
  centred house block with a drawn house wheel on Season). Nothing is built until he picks.
- FACT (tooling, git-ignored): `.superpowers/sdd/glass-build/` holds `build.mjs` (rounds 1 and 2),
  `r3-common.mjs`, `measure-r3.mjs`, `build-r3.mjs` (round 3), the measurement JSON and the
  reports. Run order: `node measure-r3.mjs <flat project dir> <work dir> measure-r3.json`, then
  `node build-r3.mjs <flat project dir> <out root> .`; Chrome runs headless with
  `--virtual-time-budget` so Google Fonts load before measuring.
- INFERENCE: the flat-tabs decision of 2026-10-21 is superseded by the choice of chrome A; the
  SwiftUI port now waits for the glass rounds to finish (4 to 7 remain) rather than the flat canvas.


## Later on 2026-10-28: P53 and P54 built

- FACT (Matthew's message of 2026-10-28, this session): "Approved. Build P53 on Week (left edge) and P54 on Season as proposed, then stop."
- FACT (canvas version 22, id 1793192456-665e, page "Glass"): the Week row (y 5000) and the Season row (y 6250) carry the additions, at rest, scrolled and on both placement maps. Glass Day and Year untouched; Glass Day's WEEK, SEASON and YEAR links still go to the flat boards.
- FACT (`.superpowers/sdd/glass-build/report-r3b.md`): P53 is a band 0, 320.3 · 390×136 after the short rule P24, on the ground; the disc 220 across, centre −30, 388.3, so 80 shows at the left edge and the band cuts it above and below; the label at 104, 358.6 · 195.4×59.4, three mono lines (MOON / WAXING GIBBOUS · 74% LIT / FULL MOON · 26 OCT 2026, the Day screen's facts). P25 to P31 move down 136; the Week page is 1890.9 tall and scrolls to 1046; its scrolled frame moved from 420 to 556 so the same rows sit under the glass as on 27 Oct.
- FACT (same report): P54 is the house wheel 135, 670.4 · 120×120, 15.9 under P39; P38 and P39 centred, same boxes; P40 to P42 move down 136; the Season page is 1197.7 tall and scrolls to 352; its scrolled frame moved from 120 to 256 so the 28 Sep event still runs under the tab bar. At rest the wheel's lower 42.4 run under the tab bar.
- FACT (astronomy-engine in `web/node_modules`, run 2026-10-28): the Sun's ecliptic longitude is 207.94° (Libra 27°56′) at 2026-10-21 06:00 UTC (08:00 Rome), when the Moon's illuminated fraction is 0.741; at 10:00 UTC it is 0.756. The next full moon is 2026-10-26 04:12 UTC, as the Day screen states. The proposal's "Libra 29°" was a rounding; the wheel's mark sits at 27°56′.
- FACT (`r3-common.mjs`): houses are whole-sign from Sagittarius rising 22°23′ (the brief's chart puts the Sun, Capricorn 24°45′, in house II), so Libra is the eleventh; the wheel fills that house at bone 14% and marks the Sun with a ring and dot. The disc's terminator is an ellipse of semi-axis 52.8 (R × |2k − 1| for k = 0.74), the lit side on the right (waxing).
- INFERENCE (`shots-r3b/clean-Week.png`): with 80 showing, the visible slice is lit throughout, since the terminator lies 52.8 left of the disc's centre, 82.8 beyond the frame edge; the slice reads as a bone bulge more than as a disc. The Week boards carry the levers to change that (discShow 170 brings the terminator on screen; discSize 136 gives a half-disc the band does not cut); nothing was changed without Matthew's word.
- FACT (canvas): the change log gained the entry "P53 and P54 built (28 Oct 2026)"; the proposals note now reads as built; new levers discSize, discShow, discEdge (Week) and wheelSize, lessonAlign (Season). IDs P53 and P54 are taken; the next free number is P55.
- FACT (disk, this worktree): `build-r3b.mjs` is the 28 Oct generator (`build-r3.mjs` stays as the 27 Oct record); `r3-common.mjs` holds the band and wheel markup and geometry; `measure-r3.mjs` measures the glass layout with the additions. Run order: measure-r3, then build-r3b with the live canvas.json, then publish the Week and Season files and canvas.json. Screenshots in `.superpowers/sdd/glass-build/shots-r3b/`.
- FACT (brief, rule 1): the session stopped after this build; Round 4 waits for Matthew.

### Same day, Matthew's line "P53 discShow 170"

- FACT (Matthew's message of 2026-10-28): "P53 discShow 170: bring the terminator on screen, then update the maps, tables and change log."
- FACT (`report-r3b.md`, canvas version 23): the disc's centre is now 60, 388.3; 170 of it shows; the dark part runs from the frame edge to x 7.2 at the band's middle and x 18.5 at its top and bottom, the terminator being the ellipse's left side. Band, rows and page height unchanged.
- FACT (`r3-common.mjs`): beside 170 of disc, 172 remain inside the margins; the joined line WAXING GIBBOUS · 74% LIT is 195 wide at 11 px and .14em, so the label now carries its five facts on five lines at x 194 (box 194, 338.8 · 114×99): MOON dim, WAXING GIBBOUS and 74% LIT bone, FULL MOON and 26 OCT 2026 dim. Words, inks, size and tracking unchanged. The Week boards' default discShow is 170.
- FACT (canvas): change log entry "P53 discShow 170 (28 Oct 2026, Matthew's line)". Screenshot `shots-r3b/clean-Week.png` re-rendered.

### Same day, housekeeping before Round 4 (Matthew's popup answer)

- FACT (canvas version 25, id 1793200550-0b07): the Week boards' `discShow` lever runs 40 to 220 (its default 170 sat above the old top of 160); Glass Day's WEEK, SEASON and YEAR links open the glass boards. The change log has the line "Housekeeping (28 Oct 2026)". No placement moved. The version before it (1793199505-5c24) was a save from the canvas page with no content change (checked key by key against version 23).

## Later on 2026-10-28: Round 4, Transits, Chart, Placement (Ra), Transit detail

- FACT (Matthew's popup answer, 2026-10-28): Round 4 after the housekeeping and a commit of the worktree (2d52f86).
- FACT (canvas version 26, id 1793201369-1b62, page "Glass"): four new rows at y 8750 (Transits), 10000 (Chart), 11250 (Placement · Ra), 12500 (Transit detail), each at rest and scrolled with placement maps; the 16 Sky boards republished with their TRANSITS and CHART tabs pointing at the glass boards; Day's long-transit card opens the detail. MORE still opens the flat board.
- FACT (`.superpowers/sdd/glass-build/report-r4.md`, `measure-r4.json`): content starts at 138 on all four (chrome bottom 106 + 32); scroll edge 122. Tab screens keep P1 at 24, 75 and P3 at 270, 62. Pushed screens: P55 back button 16, 62 · 44×44 (chevron; lever backLabel), P1 at 88.1, 75 between P55 and P3 (centred on the screen it touched the menu), P3 unchanged, the tab bar kept with the parent tab lit; Placement adds P56, the body switcher as a glass accessory 16, 692 · 358×48. Pages: Transits 979.6 (frame 134), Chart 1309.9 (frame 360), Placement 944.6 (frame 100), Transit detail 3505.7 (frame 1572).
- FACT (`r4-common.mjs`, checked by `build-r4.mjs`): the flat main markup is carried byte for byte at default levers; two lines move out of the flat nav bar, which has no home in A: READ AGAINST YOUR OWN SKY (P57, the Transits kicker) and ROME · 15 JAN 1990 · 05:30 (P72, under the Chart subline). IDs: P55, P56; Transits P57 to P68; Chart P69 to P86; Placement P87 to P98; Transit detail P99 to P127. Next free: P128.
- FACT (`compose-transit.mjs`, run with `node --import ./scripts/register-alias.mjs` from `web/`; output `transit-r4.json`): the Transit detail has no flat board; its copy and numbers are the web's own composition for the sample state (span jupiter-trine-asc, OCT 2026 → JUN 2027, exact 2026-10-17, 2027-02-08, 2027-06-14; headline "Plant the second field, since the soil is generous this year."; the Egypt spine, figure in space, recurrence, timeline, how it plays out, three cards, lesson, votive). The web's feedback row and footer links are not carried. The votive alone takes the accent (brief: the one line that asks something of the reader).
- FACT (same): the web writes the rising as 22°24′ (262.398°); the flat Chart says 22°23′. The detail follows the web; the Chart keeps its flat text. Flagged to Matthew.
- FACT (flat Transits board): five spans drawn under a SIX SPANS line; the brief's sixth (Amun rows in time with Ra, NOV 2027 → AUG 2028; the web counts 3 exact) is not drawn, as on the flat. Flagged, not built.
- FACT (tooling, git-ignored): `r4-common.mjs`, `measure-r4.mjs`, `build-r4.mjs`, `shots-r4.mjs`, `compose-transit.mjs`, `transit-r4.json`, `measure-r4.json`, `report-r4.md`, `shots-r4/`. Run order: compose (from web/), `node measure-r4.mjs <flat dir> transit-r4.json <work dir> measure-r4.json`, `node build-r3b.mjs …` (Sky tab links), `node build-r4.mjs <flat dir> transit-r4.json <out root> . <live canvas.json> <day dir>`, `node shots-r4.mjs <project dir> <out dir>`.
- INFERENCE: Round 5 (MORE, the culture sheet over Sky Day, the Doorway) is next on Matthew's word; the MORE tab links then move to the glass board.

## Later on 2026-10-28: Round 5, More, the culture sheet over Sky Day, the Doorway

- FACT (Matthew's message of 2026-10-28, this session): Phase A, Round 5: MORE as a tab with the chrome of Transits and Chart, content from the flat More board, the flat nav's context line moved into the content; the culture sheet open over Sky Day, a glass sheet at a medium detent, Sky Day dimmed beneath and not redrawn; the Doorway on the neutral ground #171310; then every MORE tab on the glass boards to the glass MORE board. Then stop.
- FACT (git, this worktree `astra-antiqua-design-rounds-a1291d`): fast-forwarded from a9c1508 to b6df17c (branch `claude/astra-antiqua-glass-round-3-e5986e`) to take the Round 4 records; the git-ignored tooling `.superpowers/sdd/glass-build/` and its `sdd/.gitignore` copied in from `planner-buildout-completion-495257`. This copy of the record is now the newest.
- FACT (canvas, before the publish): version 1793203459-5a49 held Round 4 as recorded; no comment threads. After: version 28, id 1793206038-dbaf, page "Glass", rows at y 13750 (More at rest, scrolled, two maps), 15000 (the culture sheet and its map) and 16250 (Doorway at rest, scrolled, two maps).
- FACT (`.superpowers/sdd/glass-build/report-r5.md`, `measure-r5.json`): MORE keeps P1 24, 75, P3 270, 62 and P17 16, 748 (MORE lit), P20 122 tall when scrolled. SMOKE TEST · ROME, ITALY becomes the kicker P128 at 24, 138; the flat markup follows as is, each block 13.4 higher than flat (YOUR CULTURE P129 at 24, 179.6). Page 1302, scrolls 458; scrolled frame at 300 (culture rows under the top glass, the record's two buttons under the tab bar). Lever sectionExtra adds to the four divider margins (flat 24, 34, 26, 26).
- FACT (same): the culture sheet board mounts the Glass Day board with `<dc-import name="Glass-Day">` under a black scrim at 40% (P145). Sheet P146 at 8, 450 · 374×386, corners 39, the chrome's glass fill; grabber P147 36×5 at 177, 455; inside, the flat More board's YOUR CULTURE label P148 and five rows P149 to P153 byte for byte (rows at x 24; Rome ends at 748). Levers detentH (to 764), sheetInset, sheetRadius, sheetTitle, dim, glassAlpha.
- INFERENCE (`r5-common.mjs`): the medium detent is drawn as half the large one, (844 − 62 − 10) / 2 = 386, from UIKit's "about half the screen"; the inset 8 and the corner 39 (a 47 display corner less the inset) approximate the iOS 26 floating sheet. In the app the system sheet sets all three.
- FACT (same report): the Doorway has no glass, no tab bar and no culture menu. P1 leads at 24, 75 as in chrome A (lever wordmark: centred, as the flat). The wordmark's row moves from the flat spacer 54 to the safe top 62, so the content follows by 8 (P154 kicker at 22, 112; side margin 22 as the flat). IDs P154 to P162.
- FACT (`measure-r5.json`): the flat Doorway's note ends at 855.9, past its 844 board (the last line clipped on the flat). Under chrome A the page is 895.9 and scrolls 51.9; scrolled frame at 50 (lever step 2), where P162 ends at 814, 4 inside the bottom safe area. The flat main also carries `width: -36px; height: 953px`, which drew nothing on the flat; the glass main does not carry the fixed height.
- FACT (`build-r5.mjs`): the MORE tab now opens Glass-More on 43 of the 44 glass boards; Glass-Day-C-scrolled-map has no MORE tab (its tab bar shrinks to SKY). The culture menu P3 on every board and the Transit detail's WHAT IS THIS? still open the flat More board.
- FACT (workflow run wf_b8e40db2-285, four read-only checks before the publish): content byte for byte under the listed substitutions; 75 placement rows within 0.5 pt of an independent measurement; each relink one href; the index unchanged but for the additions. Six minor findings fixed before the publish: an unsourced aria-label dropped, index order by y, the Doorway scroll wording, overlays for Glass Day's chrome on the sheet map, two map labels clipped at the right edge, the detent lever's top at 764.
- FACT (same run): the wordmark text measures 24, 74.5 by a text range; every table since Round 1 gives 75, the centre of the 44 header less half of 18. Within a point; Phase B checks against 75.
- FACT (tooling, git-ignored): `r5-common.mjs`, `measure-r5.mjs`, `build-r5.mjs`, `shots-r5.mjs`, `measure-r5.json`, `report-r5.md`, `shots-r5/`. Run order: `node measure-r5.mjs <live project dir> <work dir> measure-r5.json`, `node build-r5.mjs <live project dir> <out root> .`, `node shots-r5.mjs <out root>/project <absolute out dir>`, then publish `<out root>` with canvas.json as file_path. IDs P128 to P162; next free P163.
- Open, for Matthew (canvas change log, Round 5: its open list and its Doorway paragraph): (a) P3 could open the culture sheet; (b) WHAT IS THIS? still opens the flat More; (c) Round 4's tint lever drives nothing on its four boards; (d) Round 1's A, B, C boards keep TRANSITS and CHART on the flat boards; (e) the Doorway's note at full scroll rests inside the bottom safe area (lever contentBottom).
- FACT (brief, rule 1): the session stopped after Round 5; Round 6 waits for Matthew.

### Same day, housekeeping after Round 5 (Matthew's popup answers)

- FACT (Matthew's popup answers of 2026-10-28): the culture menu opens the culture sheet; WHAT IS THIS? opens the glass MORE board; drop Round 4's inert tint lever; point Round 1's A, B, C tabs at the glass boards; commit the Round 5 records.
- FACT (canvas version 30, id 1793208450-9acd; `housekeeping-r5.mjs`): P3 opens Glass-Culture-sheet on all 49 glass boards that carry it; P119 opens Glass-More on the four Transit detail boards; the tint lever and its two script lines are gone from the eight Round 4 boards (`{{thumbFill}}` appeared in none); the TRANSITS and CHART tabs of Round 1's A, B, C boards open the glass boards (22 links). Their horizon segments and content links still open the flat boards. No glass board links to the flat MORE board. Change log entry "Housekeeping after Round 5 (28 Oct 2026)". No placement moved.
- FACT (tooling): `build-r5.mjs` now emits P3 to the sheet on the MORE boards and `build-r4.mjs` no longer emits the tint lever, so a rerun reproduces version 30.

## 2026-10-29: Round 6, Sky Day at rest in the five cultures

- FACT (Matthew, 2026-10-28, "continue" after Round 5's housekeeping): go-ahead for Round 6.
- FACT (`.superpowers/sdd/glass-build/compose-day-r6.mjs` over web/src at a9c1508, output `day-r6.json`): the web on master reads Wednesday 21 Oct 2026 as Venus square Pluto (Day page, 0°25′; the week row holds Tuesday's figure) and names the institution in the day kicker (THE DAY'S ORACLE, THE COUNCIL OF EL, THE DECREE OF THE TOPHET, THE AUSPICES OF THE DAY). The flat boards and the brief read it as the Moon into Pisces with the taglines, following the iOS branch's export of 20 Oct (`dotnet/AstraAntiqua.Core.Tests/TestData/horizons.json` at b7238d8).
- FACT (Matthew's popup answer, 2026-10-28): "Flat and brief copy". Phase B follows the web's reading.
- FACT (canvas version 32, id 1793277435-71f6, page "Glass"): five boards Glass-Sky-Egypt to Glass-Sky-Rome in one row at y 17500, maps in the row at y 18750. Each is Glass Day with the ground and accent from the brief, the flat five-cultures board's kicker, Moon glyph, headline, line and prose, and the web's deity names, verbs and Venus and Neptune glyphs in the chart-today rows and the long transit. The Egypt board is Glass Day byte for byte, its title aside. Rome's headline defaults to Cinzel at .08em.
- FACT (`report-r6.md`, `menu-r6.json`): P3 widens to fit the longer names, right edge at 374, never under 104: Egypt and Rome 104, Greece and Canaan 113, Carthage 129. At 104 the longer names crowd or push out the chevron. One width for all five (129) would change approved Glass Day: Matthew's call.
- FACT (same): content moves only where words run longer: Carthage's kicker takes two lines (+17.6 below it), Rome's headline three lines (+35.1) and its prose one line fewer (-29.7), each chart-today row with longer names one more line (+25.5).
- FACT (same): dim label on the glass over heavy text 4.60 (Greece) to 4.64 (Carthage), all above 4.5; on the grounds 5.60 to 5.89. Accents as non-text: Rome #A5544A 3.44 and Carthage #94648C 3.88 on glass, the lowest; all at least 3.
- FACT (same): Greece's Selene on the flat board has square ends where the web's glyph has round caps; the boards follow the flat board. The chart-today orbs at 00:00 UTC are 0.75° and 1.06° (flat: 0.9° and 1.1°).
- FACT (workflow run wf_dafd0f02-7cf, three read-only checks): sources traced, placement within 0.5 pt, contrast within 0.01, index unchanged but for additions; three wording points fixed before the publish. No new ID; next free P163.
- FACT (brief, rule 1): stopped after Round 6; Round 7 waits for Matthew.

## 2026-10-31: Round 7, the hand-off specs

- FACT (Matthew, 2026-10-31): "Start Round 7", the go-ahead for the last canvas round of Phase A.
- FACT (canvas before the publish, version 1793458253-363f; no comment threads): its index equals the Round 6 publish key by key (compared against the `r6/project/canvas.json` kept in the Round 6 session's scratchpad); its board files equal in size the copies kept from the Round 5 housekeeping and Round 6 publishes, which this round used as the live project on disk. The two versions after 32 carry no index change.
- FACT (canvas version 35, id 1793459942-c042, page "Glass"): twelve spec artboards, 1180 wide, in two rows at y 20000 (tab bar, top bar, segmented control, bottom accessory, sheet, list row) and y 22000 (section divider, data box, Moon band, house wheel, figure diagram, span timeline), 1260 apart; row titles at y 19700 and 21700; the sticky note "Hand-off index" at 0, 23900 (w 1400) listing every glass board with its row, its IDs and its scrolled-frame offset; change log entry "Round 7 (31 Oct 2026)". No screen board changed. Heights: tab bar 1390, top bar 1670, segmented 1220, accessory 1320, sheet 1420, list row 1560, divider 1020, data box 1180, Moon band 890, wheel 1030, figure 860, timeline 1190.
- FACT (`.superpowers/sdd/glass-build/build-r7.mjs`, its checks on the run of 2026-10-31): every drawn component is a byte-for-byte slice of a live board at default levers (Glass-Day, Glass-Day-scrolled, Glass-Placement, Glass-Transit-detail, Glass-Transits, Glass-Chart, Glass-More, Glass-Culture-sheet, the five Sky boards' menus), or the Moon band, wheel, figure and timeline the generators `r3-common.mjs` and `r4-common.mjs` wrote and whose templates the live Week, Season and Transit detail boards hold; measured in headless Chrome (`measure-r7.json`), the chrome equals the records of Rounds 1 to 6 (P17 358×56 at 16; P3 104×44 at 270 and the five widths 104, 113, 113, 129, 104 ending at 374; P1 153.8 wide at 24 and 88.1; P55 44×44; P2 358×44; P56 and P18 358×48; P146 374×386 with the grabber 36×5 and rows 50, 48; rows 50, 49, 65, 65, 95.3; P11 342×178.4; P16 342×147.8; P53 390×136 with 170 of disc shown and the label at 194; P54 120; P115 280 at 55; P118 342×84.2; P83 41 tall).
- FACT (same checks against `web/src/data/`): the sheet rows' five names and institutions are the web's (`cultures.ts`; the web writes The Hall of Ma'at with a straight apostrophe, the boards with ’, as the flat More board did); OSIRIS and KHONSU on the switcher and Ra on the chart row are the web's deity names (`deities.ts`).
- FACT (the specs' content): each board shows the component at rest and in the states it has (pressed, scrolled, pushed, disabled, open, active), with redlines in points (cyan for chrome, amber for content) and five tables: measurements, states, colours, type, the IDs it appears as. The numbers in the redlines and the measurement tables are measured, not typed; the margins, levers and on-board positions quoted in the tables come from the Round 1 to 6 reports.
- FACT (new IDs): pressed and disabled states appear on no screen board; the specs draw them as proposals and give them IDs so they can be steered by number: P163 tab pressed, P164 menu pressed, P165 back button pressed, P166 segment pressed, P167 switcher side pressed, P168 switcher end disabled (opacity .4), P169 sheet row pressed, P170 list row pressed. Next free ID: P171.
- INFERENCE: the pressed fill rgba(230,222,204,.26) with the highlight at .24 is the tint lever's own "light" thumb value reused, so no number was invented; in the app the system's interactive glass (iOS 26) draws the press itself, and these values are what to approximate where it does not. The disabled .4 has no source on the canvas: a proposal for Matthew's word.
- FACT (tooling, git-ignored): `build-r7.mjs`, `shots-r7.mjs`, `measure-r7.json`, `report-r7.md` (every table and the index note verbatim), `r7-work/` (the measurement pages), `shots-r7/` (the twelve renders). Run order: `node build-r7.mjs <live project dir> <out root> .` from `.superpowers/sdd/glass-build/`, `node shots-r7.mjs <out root>/project <absolute out dir>`, then publish `<out root>` with canvas.json as file_path and the twelve spec files in `files`. The live project dir was assembled from the kept copies (`r5b/project`, `r5/project`, `r6/project`) plus the live canvas.json.
- FACT (brief, rule 1; the Round 7 paragraph): the session stopped after this round. Phase B (the SwiftUI port on `claude/ios-branch-parity-895dbc`) waits for Matthew's approval of the whole design.
- CANNOT CONFIRM (this session): whether the GitHub Actions workflows, disabled on 2026-10-30, are enabled again; nothing iOS builds until one is.

### Same day, Matthew's approval (popup answers of 2026-10-31)

- FACT (Matthew, 2026-10-31, after the twelve renders were shown in the chat): "Approved, start Phase B"; and on P163 to P170: "Keep as drawn". The whole Liquid Glass design is approved; the proposed pressed and disabled states are the rule for Phase B.
- FACT (Matthew, same popup, first answer): "when there are new visuals or visual changes always clearly show them in the chat". Standing rule for every later round and screen: send the renders into the chat before asking.
- FACT (canvas change log): entry "Approved (31 Oct 2026)". Phase A is complete. Phase B runs on `claude/ios-branch-parity-895dbc`, screen by screen as the brief's Phase B orders, in a session of its own (this worktree holds the design branch and its records).

### Same day, the Moon on Week: smaller options, then the Moon behind the text (proposals, nothing approved changed)

- FACT (message relayed from the session "Large title script name band rule", 2026-10-31, quoting Matthew): "I'm worried the moon might be too big". Answered with a panel on the Moon band spec: A 160 across, 126 shown, label at x 150; B 120 across, 96 shown, label at x 120; each keeps the dark sliver at the band's middle about 7 (canvas version 37, id 1793468188-d21e; `build-r7.mjs`, `shots-r7/Glass-Spec-Moon-band.png`). CANNOT CONFIRM: whether the size popup reached Matthew; its tool result was lost to an internal error.
- FACT (Matthew, 2026-10-31): "could we have the moon be behind the scrolling text? that way as we scroll down the page it moves upwards with the text scrolling at a higher rate?"
- FACT (canvas version 38, id 1793469792-e4b2; `.superpowers/sdd/glass-build/build-moon-parallax.mjs`, `measure-moon-parallax.json`): four proposal boards in the Week row (y 5000) at x 1880, 2350, 2820, 3290: at rest, scrolled 280, scrolled 556, a placement map. The approved Week boards did not change. The disc leaves the band and becomes P171, a layer under the scrolling content: at rest its centre is 60, 388.3 with 170 of 220 shown, as on Week; it rises 0.5 pt for every pt of scroll (lever moonRate 0 to 1.5). The band P53 keeps its 136 and the five facts (lever band: drop it). The rows sit where the approved board puts them (checked to 0.1).
- FACT (same, contrast): text over the lit part holds 4.5:1 only while the lit part stays at or under bone 10% (dim labels 4.52 there; prose would allow 33%, bone 37%). The proposal draws it at 10% (lever moonAlpha), where the approved Moon is solid bone. Tuesday's TENSION line (#B56B71) is 4.52 on the bare ground, so any Moon behind it falls below 4.5 (3.57 at 10%); at rate 0.5 the lit part reaches that line at about 337 pt of scroll, and the scrolled-556 frame shows it there.
- INFERENCE: a rate above 1 (the Moon rising faster than the text) keeps the Moon off Tuesday's line, since it leaves the rows and passes only behind the header lines; this reverses the usual parallax. In Phase B, Reduce Motion should make the Moon scroll with the text. New ID P171; next free P172.
- FACT (Matthew's popup answer, 2026-10-31, after the comparison renders were shown in the chat): "Behind, slower than text".
- FACT (canvas version 39, id 1793472626-da1b; `.superpowers/sdd/glass-build/build-moon-apply.mjs`): Glass-Week and Glass-Week-scrolled now carry P171, the Moon as a layer under the scrolling content (at rest centre 60, 388.3, 170 of 220 shown; rises 0.5 pt per pt of scroll, lever moonRate; lit part bone 10%, lever moonAlpha; band P53 keeps 136 and the five facts, lever band). The generator checks the new pair differs from each other only as the approved pair did (title, three self-links, scroll 0 or 556). Both Week maps keep every earlier overlay and add P171 (at rest 0, 278.3 · 170×220; scrolled 0, 0.3 · 170×220). The Moon band spec reads "P53 · P171" with a dated line; the Hand-off index names P171 and gives the next free ID as P172. The four proposal boards stay, retitled as chosen. Renders: `shots-moon/week-moon-built.png`.
- FACT (same pick): accepted with it, Tuesday's TENSION line falls to 3.57:1 where the Moon passes under it (from about 337 pt of scroll). Phase B builds Week this way, and under Reduce Motion the Moon scrolls with the text (INFERENCE, from Apple's motion guidance; Matthew has not ruled on it).

## 2026-10-31: Phase B, step 1, the chrome in SwiftUI (branch `claude/ios-glass-phase-b-881817`)

- FACT (git): this file is a copy of the design worktree's record (`astra-antiqua-design-rounds-a1291d`, commit 1d7394d), brought to this branch for Phase B; everything above this section is that record unchanged.
- FACT (`docs/design/prompts/ios-glass-build.md` in the design worktree, PHASE B paragraph; Matthew's approval of 2026-10-31 above): Phase B ports the approved design into `ios/`, one screen per step, a stop after each. Step 1 is the chrome.
- FACT (`ios/AstraAntiqua/Theme/Glass.swift`): reusable views for P17 (`GlassTabBar`), P1 (`Wordmark`), P3 (`CultureMenu`), P55 (`BackButton`), the top bar (`GlassTopBar`), P2 (`HorizonControl`), P20 (`ScrollEdge`) and a screen container (`GlassScreen`); every lever default is a named constant in `Chrome` or `GlassInk` with a comment naming the ID it places. Numbers from `.superpowers/sdd/glass-build/report-r7.md` (design worktree): P17 16, 748 · 358×56, padding 4; P2 16, 113 · 358×44, padding 3; P3 at 270, 62 · 104×44 (113, 113, 129 for Greece, Canaan, Carthage); P55 16, 62 · 44×44; P1 24, 75 or centred between P55 and P3 (88.1); P20 173 tall under P2, 122 without; content top 189 or 138.
- FACT (same file): the pressed states P163 to P166, P169 and P170 are one button style (`PressedFill`, fill rgba(230,222,204,.26), highlight .24); P168 is `GlassInk.disabledOpacity` .4. P167 to P170 take effect when the switcher (step 8), the sheet (step 10) and the list rows are built.
- FACT (same file): on iOS 26 and later the glass is the system's Liquid Glass (`glassEffect`, `Glass.regular` tinted with the canvas fill rgba(24,21,16,.80)); the culture menu and back button use interactive glass, which draws their press. Below iOS 26 (the app deploys to iOS 17), or with Reduce Transparency on, `GlassApproximation` draws the canvas glass: the fill over the thin material, the 1 px inset highlight, the hairline and the shadow. SwiftUI offers no blur radius or saturation for a material, so blur 24 and saturate 1.5 are approximated by the thin material. With Reduce Transparency the fill is opaque (INFERENCE: Apple's guidance for that setting; Matthew has not ruled on it).
- FACT (same file): the top row sits at the larger of the phone's safe top and the canvas's 62. On the iPhone 16e (390x844, safe top 47) that keeps the canvas numbers; open question for Matthew, below.
- FACT (`ios/AstraAntiqua/ScreenshotMode.swift`, `.github/scripts/ios-smoke.sh`): six captures, `chrome`, `chrome-scrolled` (a test pattern of bone bars at 30% and 50% under the glass, no copy), `chrome-approx` (the approximation forced), `chrome-pressed` (P163, P164, P166), `chrome-pushed`, `chrome-pushed-pressed` (P165), on Egypt's ground as the spec boards. The smoke run now photographs on an iPhone 16e (390x844), created if the runtime has the type and no device, else the first iPhone with a warning.
- FACT (`ios/placement/chrome.json`, `.github/scripts/check-placement.py`, `.github/workflows/swift.yml`): in a screenshot run each tagged view prints its frame; the job's last step compares 30 rects with the canvas to within 1 pt and fails on a miss.
- CANNOT CONFIRM (this session): that the app compiles and that the placements hold. SwiftUI builds only on macOS; the GitHub Actions workflows were disabled on 2026-10-30 (HANDOFF of the design worktree). The Swift files pass `swiftc -parse` under WSL; nothing more was run. AstraCore did not change, so its tests were not rerun.
- FACT (`ios/AstraAntiqua.xcodeproj/project.pbxproj`): `Glass.swift` added by hand with two fixed IDs; the CI step that regenerates the project with XcodeGen will report that drift (it is `continue-on-error`) and upload a regenerated project to commit later.
- FACT (review of 5546799 by a second agent, static only): `GlassScreen` read the safe area from a `GeometryReader` that ignored it, which may report zero insets and would have put P17 at y 782. Fixed in the next commit: the reader keeps to the safe area and takes the safe top from its global frame; the tab bar keeps to the safe area (6 above the home line); the placement log calls are wrapped in `MainActor.assumeIsolated`; CI uploads the placement table as `swift-placement`; the chrome captures wait 10 s.
- FACT (Matthew's popup answers, 2026-10-31, after step 1's report): "Go on to Sky Day" (step 2 starts before CI proves step 1); "Canvas 62 as floor" (the top row at max(safe top, 62), as built); "Fixed at 11 pt" (the chrome's type does not follow Dynamic Type; the tabs, horizons and culture menu show the large content viewer, `Glass.swift`); "Not yet" on pushing the branch.

## 2026-10-31: Phase B, step 2 (Sky Day), scoped, not built

- FACT (read-only research of 2026-10-31, kept in `docs/design/prompts/ios-glass-phase-b-step2.md`, section Map): the web's Day reading is master's (`decree.ts` `composeDayPage`, `dayPressure.ts`, `buildHomeBundle.ts`); this branch's `web/`, `web/scripts/export-content.mjs` and `shared/content` predate it, and AstraCore has no port of the decree composer and no day-page golden.
- FACT (Matthew's popup answers, 2026-10-31): "Merge master in"; "Board sections, web strings" (the board's sections in its order, filled with the web's composition; Moon and Season from the Swift ports; votive, permissions, dive deeper and come-back off Sky Day); "Board's forms" for the three strings with no web source (kicker date WED 21 OCT 2026, the label ON YOUR CHART TODAY, the chart rows' data lines built from the web's numbers); "Fresh session" for step 2, whose prompt is `docs/design/prompts/ios-glass-phase-b-step2.md`.
- FACT (git, 976b4f3): Spectral SC (`SpectralSC-Regular`, `SpectralSC-Medium`) from master's `android/app/src/main/res/font` is in the app bundle and named in `Ink`.
- FACT (message from the session that started this one, 2026-10-31): GitHub Actions runs again since Matthew made the repository public; `swift` run 41234333850 on `claude/ios-branch-parity-895dbc` passed core-linux and ios27-app (Xcode 27.1, iOS 27 simulator, 15 minutes). The android, dotnet and web workflows stay disabled. `claude/ios-glass-phase-b-881817` is not pushed, so step 1 is still unproven.

