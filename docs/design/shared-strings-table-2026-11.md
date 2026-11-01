# Shared strings conflict table, 2026-11-01

Task 1 of `docs/superpowers/plans/2026-11-01-shared-strings-revamp.md`. No code changed. Rulings go in the
"Ruled" column with their date once Matthew answers.

## How to read this table

- FACT (popup, 2026-11-01, as relayed by the session): the default rule. The board form wins for chrome (kickers,
  dates, date ranges, section labels, count lines, data lines, tone words, house headings, the format of degrees
  and percents); web's words win for composed prose (readings, sentences, headlines, votives, theses). One name per
  navigation destination; the tab bar and the Lintel stay layout. Earlier per-screen rulings count as precedent;
  where the two ports disagree, the default rule decides.
- Tags: FACT names its source. INFERENCE is a judgment of this table. CANNOT CONFIRM is open.
- Sources, read on 2026-11-01:
  - Web: `web/src/` in worktree `shared-strings-revamp` (branch `claude/shared-strings-revamp`). `file:line` is
    relative to `web/src/`.
  - Board: canvas `LKiWRGTi16LRZ5GvyHbD3V` version 1793493664-ced5, local copy in the session scratchpad
    `artifact-files/9c7a9a25-.../project/Glass-*.dc.html` (text extracted from the markup; Week rows from the
    board's row data at `Glass-Week.dc.html:80-86`). Board IDs from `.superpowers/sdd/glass-build/report-r3.md`,
    `report-r3b.md`, `report-r4.md`, `report-r5.md` (design worktree, git-ignored) and the `.placement("P..")`
    calls in `SkyDayView.swift`, `SkyWeekView.swift`.
  - Android: `git show claude/android-glass-7a8074:android/app/src/main/java/com/astra/antiqua/<path>`; `A:` below
    stands for that prefix. Screens not yet ported to glass (Year, Transits, Chart, Placement, Transit detail,
    More) cite the master-era screen on the same branch.
  - Swift: `git show claude/ios-glass-phase-b-week:ios/<path>`; `S:` stands for that prefix.
- `{slot}` marks a run-time fill. `{institution}` is the culture's `institution` (`data/cultureVoice.ts:33,53,73,
  93,113`): egypt `THE HALL OF MA’AT`, greece `THE DAY’S ORACLE`, canaan `THE COUNCIL OF EL`, carthage `THE DECREE
  OF THE TOPHET`, rome `THE AUSPICES OF THE DAY` (web types the greece apostrophe straight; the format rule F10 makes
  it curly).
- "none" means the surface prints nothing in that slot. "not built" means the screen exists on that surface only in
  an older form, cited where it has one.
- INFERENCE (applies to every row): where the board omits a slot web prints (footers, votive, thesis, feedback),
  the default keeps web's string in the catalog and the board's omission counts as layout (a surface may hide a
  slot). Where web omits a slot the board prints (Moon box, count lines, data lines), the board's form enters the
  catalog and web gains the slot.

## Precedent rulings carried in

FACT (plan table and `survey-ios-dotnet.md` section 3, Matthew's popups of 2026-10-31):

| Item | iPhone ruling | Android ruling | Default under the rule |
|---|---|---|---|
| Day kicker | board | board | board (agree) |
| Day chart rows label | board | board | board (agree) |
| Day row data line | board, from web numbers | board | board (agree) |
| Day row sentence | web | web | web (agree) |
| Long transit meta and footer | board | board | board (agree) |
| Week kicker | board | board | board (agree) |
| Week title | board `The week` | web per culture | web, as a headline (ports disagree; see Q1) |
| Week count line | board | board | board (agree) |
| Week row headline | off | web, above the line | web (prose; ports disagree) |
| Week shorthand | web words plus board tone and sign | web | board form (ports disagree; see Q3 for TIGHT) |
| Season kicker | open | board | board |
| Season title | `The Sun in {sign}` (HorizonsView) | web | web, as a headline (see Q1) |
| Season day line | board form | web `· CLOSING` | board `· {n} TO GO` (ports disagree) |
| Season house title | board form (HorizonsView) | board | board (agree) |
| Season sky label | straight `'` (HorizonsView) | web straight `'` | board curly `’` (format rule F10) |

## Day (board Glass-Day, P4 to P16, P226, P227)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| day.kicker | P4 | `{WEEKDAY} · {MONTH D, YYYY} · {institution}` (`components/home/CenterDecree.tsx:47-49`, `home/format.ts:71,75`) | `WED 21 OCT 2026 · THE HALL OF MA’AT` | board (`A:ui/screens/SkyDayScreen.kt:267`, `:224-229`) | board (`S:AstraCore/.../SkyDay.swift:69,145`) | `{date.day} · {institution}` (F1, UTC day) | institution |
| day.headline | P6 | `reading.headline` (`CenterDecree.tsx:58-64`) | web's copy (round 6 redraw) | web | web | web | composed per culture |
| day.evidence | P7 | `EvidenceLine` (`components/chrome/EvidenceLine.tsx`) | `ISIS □ OSIRIS · 0°25′` | web | web | `{DEITY} {aspectGlyph} {DEITY} · {angle.degMin}` | deity names |
| day.paragraph | P9 | `reading.paragraphs` (`CenterDecree.tsx:68-77`) | web's copy | web | web | web | composed |
| day.votive | none | `<Votive>` (`CenterDecree.tsx:80`) | none | off (ruled) | off (ruled) | web, hidden on the ports (layout) | per culture |
| day.sky.label | P10 | `THE SKY, COMPUTED` over ephemeris rows (`components/home/CompactSkyTable.tsx:19`) | `THE SKY, COMPUTED` over Moon and Season | `SkyDayScreen.kt:329` | `S:AstraAntiqua/Screens/SkyDayView.swift:178` | `THE SKY, COMPUTED` | none |
| day.sky.moon | P11 | none (`lib/moonPhase.ts` computes, no component prints) | `MOON` / `WAXING GIBBOUS · 74% LIT` | `SkyDayScreen.kt:389` | `SkyDay.swift:150` | `MOON` / `{PHASE} · {percent} LIT` | none |
| day.sky.nextQuarter | P11 | none | `FULL MOON` / `26 OCT 2026` | `SkyDayScreen.kt:232-235` | `SkyDay.swift:111` | `{QUARTER}` / `{date.dayMonthYear}` (local) | none |
| day.sky.season | P11 | none (web sub-bar `LIBRA SEASON · DAY 29 / 31`, `SeasonNave.tsx:188`) | `SEASON` / `SUN IN LIBRA · DAY 29 OF 31` | `SkyDayScreen.kt:392-393` | `SkyDay.swift:153` | `SEASON` / `SUN IN {SIGN} · DAY {n} OF {total}` | none |
| day.sky.bar | P11 | none | `23 SEP` · `2 TO GO` · `23 OCT` | `SkyDayScreen.kt:402` | `SkyDay.swift:156` | `{date.dayMonth}` · `{n} TO GO` · `{date.dayMonth}` | none |
| day.chart.label | P12 | `WHERE THE DAY FALLS` + `FROM YOUR CHART’S HOUSES` (`components/home/DayPressureModule.tsx:21-22`) | `ON YOUR CHART TODAY` | `SkyDayScreen.kt:333` | `SkyDayView.swift:186` | `ON YOUR CHART TODAY` | none |
| day.chart.row.sentence | P13, P14, P226, P227 | `{god} {verb} your {god} in the {ordinal}. It touches {arena}.` (`lib/dayPressure.ts`) | short board lines | web (`A:domain/SkyDay.kt:146`) | web (`DayPressure.swift`) | web | deity, verb |
| day.chart.row.data | P13, P14, P226, P227 | none | `MERCURY ⚹ NATAL SATURN · 3.0° FROM EXACT · EASE` | `SkyDayScreen.kt:439-440`, conjunction prints `EASE` | `SkyDay.swift:80-90`, conjunction prints `UNION` | `{PLANET} {glyph} NATAL {PLANET} · {angle.orbDecimal} FROM EXACT · {tone}`, tone F9 | none |
| day.longTransit.label | P15 | `THE LONG TRANSIT` (`components/home/LongTransitBox.tsx:33`) | `THE LONG TRANSIT` | `SkyDayScreen.kt:342` | `SkyDayView.swift` (P15) | `THE LONG TRANSIT` | none |
| day.longTransit.meta | P16 | `THE LONG TRANSIT · ACTIVE` or `· NEXT` (`LongTransitBox.tsx:44`); range `OCT 2026 → JUN 2027` (`home/buildHomeBundle.ts:255`) | `OPEN NOW · OCT 2026 → JUN 2027` | `SkyDayScreen.kt:475,485` | `SkyDay.swift:135` | `{OPEN NOW or NEXT} · {date.monthYear} → {date.monthYear}` | none |
| day.longTransit.title | P16 | `{DEITY} IN THE {SIGN_IMAGE}` / `{VERB} YOUR NATAL {POINT}` (`buildHomeBundle.ts:250-254`) | `AMUN IN THE LION` / `ROWS IN TIME WITH YOUR NATAL ASCENDANT` | web | web | web (agree) | deity, verb |
| day.longTransit.footer | P16 | none | `3 EXACT · 2 AHEAD · EASE` | `SkyDayScreen.kt:495` | `SkyDay.swift:139` | `{n} EXACT · {m} AHEAD · {tone}` (digits, F7) | none |
| day.longTransit.link | P16 | `READ THE LONG TRANSIT →` (`LongTransitBox.tsx:56`) | `READ →` | `SkyDayScreen.kt:496` | `SkyDayView.swift` (LongTransitCardView) | `READ →` | none |
| day.footer | none | `THE WEEK →` · `THE SEASON →` · `THE YEAR →` (`CenterDecree.tsx:89-97`) | none | none | none | web, hidden on the ports | none |
| day.feedback | none | `FeedbackRow` noun `DECREE` (`CenterDecree.tsx:85`) | none | off | off | web, hidden on the ports | none |

## Week (board Glass-Week, P21 to P31, P53, P171)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| week.kicker | P21 | `{institution} · THE WEEK` (`components/horizons/WeekNave.tsx:176`); sub-bar `WEEK 43 · 19–25 OCT 2026` (`WeekNave.tsx:27-36`) | `19 → 25 OCT 2026 · THE HALL OF MA’AT` | board (`A:ui/screens/SkyWeekScreen.kt:192`) | board (`S:AstraCore/.../SkyWeek.swift:50-61`) | `{range.days} · {institution}` (F2, local) | institution |
| week.title | P22 | per culture `weekTitle` (`WeekNave.tsx:176`, `data/cultureVoice.ts:34,54,74,94,114`) | `The week` | web (`A:domain/SkyWeek.kt:85-89`) | board (`SkyWeek.swift:117`) | web per culture (headline); see Q1 | `SEVEN DAYS WEIGHED`, `SEVEN QUESTIONS`, `SEVEN SITTINGS`, `THE WEEK’S LEDGER`, `FASTUS AND NEFASTUS` |
| week.countLine | P23 | none | `SEVEN DAYS · SIX WEIGHED · ONE QUIET` | `SkyWeek.kt:75`, zero `NONE` | `SkyWeek.swift:66-72`, zero part left out | `{count.word} DAYS · {count.word} WEIGHED · {count.word} QUIET`, zero `NONE` (F7) | INFERENCE: `WEIGHED` is Egypt’s word; Swift and Android hard-code it for every culture. CANNOT CONFIRM a per-culture form. |
| week.thesis | none | `voice.weekThesis` (`WeekNave.tsx:177-179`) | none | `SkyWeek.kt:94-98` | none | web | per culture |
| week.moon | P53 | none | `MOON` / `WAXING GIBBOUS` / `74% LIT` / `FULL MOON` / `26 OCT 2026` | `SkyWeekScreen.kt:348-350` | `SkyWeek.swift:108-112` | as Day P11, five lines | none |
| week.row.weekday | P25 to P31 | `MON 19` one string (`lib/weekReading.ts:176`) | `MON` over `19` | `SkyWeekScreen.kt:448-450` | `SkyWeek.swift:135` | `{weekday.abbr}` and `{d}` as two slots; web joins with a space (layout) | rome adds ` {F,N,C}` |
| week.row.today | P27 | `TODAY` (`WeekNave.tsx:121-127`) | `TODAY` | `SkyWeekScreen.kt:462` | `S:AstraAntiqua/Screens/SkyWeekView.swift:341` | `TODAY` (agree) | none |
| week.row.headline | none | `day.headline` (`WeekNave.tsx:131-138`) | none | web, above the line | off | web (prose; ports disagree) | composed |
| week.row.line | P25 to P31 | `day.line` (`WeekNave.tsx:139`) | board prose (no web source found by grep on this branch) | web | web | web (ruled precedent) | composed |
| week.row.shorthand.aspect | P25 to P31 | `{deity glyph} {aspectGlyph} {deity glyph} TIGHT` (`WeekNave.tsx:68-79`) | `☽ △ ♅ · EXACT · EASE`; conjunction `☉ ☌ ♀ · SCORPIO · EASE` | web (`SkyWeekScreen.kt` shorthand) | `{symbol} {glyph} {symbol} · TIGHT · {tone}` (`SkyWeek.swift:89-92`) | board: `{planet symbol} {glyph} {planet symbol}[ · EXACT][ · {SIGN} for ☌] · {tone}`; marker word in Q3 | none |
| week.row.shorthand.ingress | P25 to P31 | `{deity glyph} → {SIGN3}` (`WeekNave.tsx:82-89`) | `☽ INTO PISCES` | web | `{symbol} → {SIGN3}` (`SkyWeek.swift:96`) | `{planet symbol} INTO {SIGN}` (F8 full sign) | none |
| week.row.shorthand.quiet | P25 to P31 | `QUIET` (`WeekNave.tsx:91`) | `QUIET` | `SkyWeekScreen.kt:516` | `SkyWeek.swift:98` | `QUIET` (agree) | none |
| week.note | none | `voice.weekNote` + rome ` · F LAWFUL · N UNLAWFUL · C MIXED` (`WeekNave.tsx:185-188`) | none | `SkyWeek.kt:103-107` (rome joined into one string, same characters) | none | web | per culture |
| week.votive | none | `WEEK_VOTIVE` (`WeekNave.tsx:48-77,190`) | none | `SkyWeek.kt:119-141` | none | web | per culture and tone |
| week.footer | none | `← THE DAY` · `THE SEASON →` · `THE LONG TRANSITS →` (`WeekNave.tsx:194-205`) | none | `SkyWeekScreen.kt:309-311` | none | web | none |

## Season (board Glass-Season, P32 to P42, P54)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| season.kicker | P32 | `THE SEASON · 23 SEP – 23 OCT` (`components/horizons/SeasonNave.tsx:90`) | `23 SEP → 23 OCT 2026 · THE HALL OF MA’AT` | board (`A:ui/screens/SkySeasonScreen.kt:169-171`) | `{culture} · the season` (`S:AstraAntiqua/Screens/HorizonsView.swift:149`) | `{range.days} · {institution}` (F2) | institution |
| season.title | P34 | `THE SEASON OF THE {SIGN_PHRASE}` (`SeasonNave.tsx:102`) | `The Sun in Libra` | web (`A:domain/SkySeason.kt:129`) | `The Sun in {sign}` (`HorizonsView.swift:150`) | web (headline); see Q1 | none |
| season.dayLine | P35 | `DAY 29 OF 31 · CLOSING` (`SeasonNave.tsx:98-100`, words `horizons/seasonContent.ts:20-24`) | `DAY 29 OF 31 · 2 TO GO`, bar caps `23 SEP` `23 OCT` | web (`SkySeason.kt:130,149-151`) | `Day {n} of {m} · {date} to {date}` (`HorizonsView.swift:151`) | `DAY {n} OF {total} · {n} TO GO` (count line, board) | none |
| season.signProse | P36 | none in the head (sign blurb lives in `zodiac-signs.json`) | `The scales; forever balancing, ...` | not traced | not traced | web’s sign blurb, if Matthew keeps the slot (prose) | none |
| season.chart.label | P37 | none; web prints `WHAT IT TOUCHES` (`SeasonNave.tsx:108`) | `THROUGH YOUR CHART` | `SkySeasonScreen.kt:247` (with chart), `WHAT IT TOUCHES` without (`:266`) | `Through your chart` (`HorizonsView.swift:157`) | `THROUGH YOUR CHART`; section set in Q2 | none |
| season.chart.houseHeading | P38 | none (parts in `data/houses.ts`) | `The eleventh house · The Assembly` | `SkySeason.kt:184` | `HorizonsView.swift:159` | `The {ordinal.word} house · {house.title}` (house heading, board) | none |
| season.chart.prose | P39 | `The season sits in your {ordinal} house, which this culture keeps under {group}. It works on {arena}.` (`seasonContent.ts:89`) | same sentence | `SkySeason.kt:185` | not traced | web (agree) | house groups per culture (`SkySeason.kt:85-89`) |
| season.sections | none | `WHAT IS CHANGING`, `WHERE IT BEGINS`, `WHAT IT LEAVES BEHIND` (`SeasonNave.tsx:106-109`) | none | `SkySeasonScreen.kt:294-296` | none | see Q2 | composed |
| season.votive | none | `SEASON_VOTIVE` (`SeasonNave.tsx:113`) | none | printed | none | web | per culture and tone |
| season.sky.label | P40 | `THE SEASON'S SKY` straight (`SeasonNave.tsx:121`) | `THE SEASON’S SKY` curly | straight (`SkySeasonScreen.kt:271`) | `The season's sky` (`HorizonsView.swift:164`) | `THE SEASON’S SKY` (F10) | none |
| season.sky.row | P41, P42 | `{D MON} {DEITY} → THE {PHRASE} · SEASON OPENS`, `{DEITY} STATIONED ℞`, `{SUN} ☌ {DEITY}[ EXACT]`, `... · SEASON CLOSES` (`seasonContent.ts:135-190`, date `SeasonNave.tsx:134`) | `26 SEP 2026 · FULL MOON · ARIES` + `Khonsu at 3°37′ Aries.`; `28 SEP 2026 · MARS INTO LEO` + ingress prose | web set (`SkySeason.kt:206-229`) | board-like set (quarters, ingresses, stations, eclipses; `HorizonsView.swift:190-250`) | INFERENCE: board line form `{date.dayMonthYear} · {EVENT}` with planet names; the event set follows the board (data lines). The prose under each row is web’s where web has it. CANNOT CONFIRM a web source for the lunation sentence. | deity names in prose |
| season.noChart | none | `CAST A CHART TO SEE WHAT THE SEASON TOUCHES IN YOUR OWN HOUSES →` + `READING` (`SeasonNave.tsx:144-147`) | none | `SkySeasonScreen.kt:336-344` | none | web | none |
| season.footer | none | `← THE DAY` · `THE WEEK` · `THE YEAR →` · `THE LONG TRANSITS →` (`SeasonNave.tsx:153-164`) | none | `SkySeasonScreen.kt:353-356` | none | web | none |

## Year (board Glass-Year, P43 to P52)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| year.kicker | P43 | `{institution} · THE YEAR` (`components/horizons/YearNave.tsx:136`) | `FROM 1 OCT 2026 · THE HALL OF MA’AT` | not built; master form `{dashboardTitle} · the year` (`A:ui/screens/HorizonScreens.kt:153`) | `{culture} · the year` (`HorizonsView.swift:172`) | `FROM {date.dayMonthYear} · {institution}` | institution |
| year.title | P44 | `{ROMAN} · {yearTitle}`, e.g. `MMXXVI · THE YEAR OF THE RIVER` (`YearNave.tsx:137`, `cultureVoice.ts:37,57,77,97,117`) | `The year ahead` | `The year ahead` (`HorizonScreens.kt:155`) | `The year ahead` (`HorizonsView.swift:173`) | web (headline); see Q1. INFERENCE: if the board form wins, it collides with the More row `The year ahead`, which opens the forecast. | yearTitle per culture |
| year.countLine | P45 | `STATIONS AND INGRESSES · THE YEAR AHEAD` sky-only (`YearNave.tsx:191`); `THE YEAR'S LONG TRANSITS · ITS SPINE` with a chart (`:160`) | `72 TURNINGS · STATIONS, INGRESSES, LUNATIONS` | not built | `{date} onward · {n} turnings` (`HorizonsView.swift:174`) | `{n} TURNINGS · STATIONS, INGRESSES, LUNATIONS` (digits, F7); the spine label keeps web’s words with `’` | none |
| year.monthLabel | P46 | none (row date `MON YYYY`, `YearNave.tsx:197`) | `OCT 2026` | not built | not traced | `{date.monthYear}` | none |
| year.row.head | P47, P48, P50 to P52 | `{DEITY} STATIONS RETROGRADE ℞`, `{DEITY} STATIONS DIRECT`, `{DEITY} ENTERS THE {PHRASE}` (`horizons/yearContent.ts:206,215`) | `3 OCT · VENUS TURNS RETROGRADE`, `23 OCT · SUN INTO SCORPIO` | master `TURNS RETROGRADE`, `TURNS DIRECT`, `SIGN CHANGE` (`HorizonScreens.kt:215-218`) | `{label} turns retrograde`, `{label} into {sign}` (`HorizonsView.swift:213-223`) | `{date.dayMonth} · {PLANET} TURNS RETROGRADE`, `· {PLANET} TURNS DIRECT`, `· {PLANET} INTO {SIGN}` (F11 drops ℞ here) | none |
| year.row.prose | P47 to P52 | ingress verb `is ferried into` (`lib/weekReading.ts:80`) | `Isis stands still at 8°29′ Scorpio.`; ingress sentences | not built | `{deity} stands still at {deg} {Sign}.` (`HorizonsView.swift:224`) | web where a web sentence exists; the station sentence has no web source (CANNOT CONFIRM) | deity, verb |
| year.today | P49 | none | `TODAY · 21 OCT` | not built | not traced | `TODAY · {date.dayMonth}` | none |
| year.noChart | none | `CAST A CHART TO READ THE YEAR AGAINST YOUR OWN SKY`, `CAST A CHART →` (`YearNave.tsx:206,212`) | none | not built | none | web | none |
| year.votive | none | `YEAR_VOTIVE` (`yearContent.ts:132-157`) | none | not built | none | web; straight `'` becomes `’` (F10) | per culture |
| year.footer | none | `← THE SEASON` · `THE FORECAST →` (`YearNave.tsx:223-228`) | none | not built | none | web words, destination name from N4 | none |

## Transits (board Glass-Transits, P57 to P68)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| transits.kicker | P57 | `{institution} · THE LONG TRANSITS` (`components/transits/TransitsIndex.tsx:77`) | `READ AGAINST YOUR OWN SKY` | `Read against your own sky` (`A:ui/screens/TransitsScreen.kt:81`) | `Read against your own sky` (`S:AstraAntiqua/Screens/TransitsView.swift:18`) | `READ AGAINST YOUR OWN SKY` | none (web’s varies by institution) |
| transits.title | P58 | `WHAT DOES NOT PASS IN A DAY` (`TransitsIndex.tsx:77`) | `The long transits` | `The long transits` (`TransitsScreen.kt:82`) | `The long transits` (`TransitsView.swift:18`) | web (headline); see Q1 | none |
| transits.countLine | P59 | none | `SIX SPANS · OCT 2026 → AUG 2028` | none | none | `{count.word} SPANS · {date.monthYear} → {date.monthYear}` | none |
| transits.axis | P60 | none | `2026` `2027` `2028` | none | none | `{yyyy}` | none |
| transits.group.open | P62 | `ACTIVE NOW` (`TransitsIndex.tsx:80`) | `OPEN NOW` | `Running now` (`TransitsScreen.kt:121`) | `Open now` (`TransitsView.swift:57`) | `OPEN NOW` (also the Day meta word) | none |
| transits.group.ahead | P64 | `AHEAD` (`TransitsIndex.tsx:84`) | `AHEAD` | `Still to come` (`TransitsScreen.kt:135`) | `Ahead` (`TransitsView.swift:58`) | `AHEAD` | none |
| transits.group.behind | none | none | none | none | `Behind` (`TransitsView.swift:59`) | Swift drops it (no web or board slot) | none |
| transits.row.title | P63, P65 to P68 | `{DEITY} {VERB} {NATAL}`, natal asc printed `ASCENDANT` (`TransitsIndex.tsx:36`, `home/format.ts:90-95`) | `Amun rows in time with your rising` | web-like (`TransitsScreen.kt`) | `{deity} {verb} {natalPoint}` with `your rising` (`TransitsView.swift:92`) | web words (headline). INFERENCE: `WITH ASCENDANT` lacks the `YOUR` the board, the Day card and the detail print; a copy-pass item. | deity, verb |
| transits.row.data | P63, P65 to P68 | `{MON YYYY} → {MON YYYY} · {n} EXACT {PASS or PASSES}` (`TransitsIndex.tsx:39`) | `OCT 2026 → JUN 2027 · 3 EXACT · 2 AHEAD · EASE` | `{n} EXACT {PASS} · {m} AHEAD` (`TransitsScreen.kt:223`) | `... · {n} exact · {m} ahead · ease` (`TransitsView.swift:93-94`) | `{date.monthYear} → {date.monthYear} · {n} EXACT[ · {m} AHEAD] · {tone}`. INFERENCE: the board drops `· 0 AHEAD`. | none |
| transits.row.link | none | `READ →` (`TransitsIndex.tsx:42`) | none (row taps) | `READ →` (`TransitsScreen.kt:230`) | none | `READ →`, hidden where the row taps | none |
| transits.empty.open | none | `NOTHING HOLDS WITHIN ORB TODAY` (`TransitsIndex.tsx:81`) | none | `NO LONG TRANSIT IS IN ORB TODAY` (`TransitsScreen.kt:126`) | not traced | web | none |
| transits.empty.ahead | none | `NO FURTHER PASSAGES IN THIS WINDOW` (`TransitsIndex.tsx:85`) | none | `NOTHING FURTHER INSIDE THE WINDOW` (`TransitsScreen.kt:140`) | not traced | web | none |
| transits.loading | none | `COMPUTING THE SKY…` (`TransitsIndex.tsx:66`) | none | `COMPUTING THE SKY…` (`TransitsScreen.kt:94`) | `Computing the sky…` (`TransitsView.swift:27`) | `COMPUTING THE SKY…` | none |

## Chart (board Glass-Chart, P69 to P86)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| chart.kicker | P69 | `PLACEMENTS · B. {date} · {CITY}` as the table label (`components/charts/ChartsInstrument.tsx:131`); sub-bar `CHARTS · NATAL INSTRUMENT` (`:128`) | `FIXED AT THE HOUR OF YOUR BIRTH` | `Fixed at the hour of your birth` (`A:ui/screens/PlacementsScreen.kt:75`) | same, sentence case (`S:AstraAntiqua/Screens/PlacementsView.swift:16`) | `FIXED AT THE HOUR OF YOUR BIRTH` | none |
| chart.title | P70 | none | `The placements` | `The placements` (`PlacementsScreen.kt:76`) | `The placements` (`PlacementsView.swift:16`) | `The placements` (no web headline; board fills) | none |
| chart.subline | P71 | `ASC {deg} {SIGN} · WHOLE-SIGN HOUSES` (`ChartsInstrument.tsx:159`) | `SMOKE TEST · RISING SAGITTARIUS 22°23′` | not built | `{name} · {place} · rising {sign} {deg}` (`PlacementsView.swift:42`) | `{NAME} · RISING {SIGN} {angle.degMin}` | none |
| chart.birthLine | P72 | `B. {date} · {CITY}` (`ChartsInstrument.tsx:131`) | `ROME · 15 JAN 1990 · 05:30` | not built | not traced | `{CITY} · {date.dayMonthYear} · {HH:mm}` (birth zone) | none |
| chart.summary | P74 | `SUMMARY_INTRO`, `SUMMARY_TONES` (`lib/reading.ts:47,56-58`) | web’s summary | not built | `NatalReading.swift` | web | per culture |
| chart.section.bodies | P75 | none | `TEN BODIES` | not built | `Ten bodies` (`PlacementsView.swift:21`) | `TEN BODIES` | none |
| chart.section.received | P83 | wheel legend `ACCENT GLYPHS: THE THREE RECEIVED` (`ChartsInstrument.tsx:184`), a separate slot | `THE RECEIVED THREE · SEATS SET BY MODERN HANDS` | not built | not traced | `THE RECEIVED THREE · SEATS SET BY MODERN HANDS` | none |
| chart.row | P76 to P86 | `DataRow`: body, `03°37′` padded, `SIGN3`, house `02`, `R` or `D` (`ChartsInstrument.tsx:150-156`, `components/chrome/DataRow.tsx:75-77`) | deity `Ra` over `SUN · CAPRICORN 24°45′`, `· R` when retrograde, house `II` | not built | `{label} · {Sign} {deg}`, `House {roman}` (`PlacementsView.swift:51-53`) | `{DEITY}` / `{PLANET} · {SIGN} {angle.degMin}[ · R]` / `{house.roman}` (F5, F8, F11) | deity |
| chart.legend | none | `CONFLICT`, `HARMONY`, `THE NATAL WHEEL`, `ASTRONOMY-ENGINE · ORBS DOCUMENTED →` `METHOD` (`ChartsInstrument.tsx:160-184`) | none | not built | `Whole-sign houses · R is retrograde, ...` (`PlacementsView.swift:26`) | web, hidden on the ports | none |
| chart.empty | none | `NO CHART IS YET / ENTERED IN THE RECORD`, `CAST THE FIRST CHART`, `KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC` (`ChartsInstrument.tsx:86-98`) | none | not built | `The placements are read from a chart cast ...` (`PlacementsView.swift:34`) | web | none |

## Placement (board Glass-Placement, P87 to P98)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| placement.kicker | P88 | `{institution} · YOUR STANDING PLACEMENT` (`components/charts/PlacementReading.tsx:127`) + sub `{deg} {SIGN} · {ORDINAL} HOUSE · FIXED AT YOUR BIRTH` (`:135-136`) | `SUN · CAPRICORN 24°45′ · HOUSE II` | `InstitutionKicker(after = "your standing placement")` (`A:ui/screens/PlacementScreen.kt:120`) | `{label} in {Sign} · House {roman}` (`S:AstraAntiqua/Screens/PlacementView.swift:49`) | `{PLANET} · {SIGN} {angle.degMin} · HOUSE {house.roman}` | none |
| placement.title | P89 | `YOUR {DEITY}` / `IN THE {SIGN_PHRASE}` (`PlacementReading.tsx:140-142`) | `Ra` | `Your {deity} in {Sign}` (`PlacementScreen.kt:121`) | not traced | web (headline); see Q1 | deity |
| placement.epithet | P90 | none (`RECEIVED` badge, `PlacementReading.tsx:137`) | `THE CREATOR AND KING · GLYPH ATTESTED` | not built | `{Sign} {deg} · glyph {status}` (`PlacementView.swift:52`) | `{EPITHET} · GLYPH {STATUS}` (data line, board); epithet from `deities.json` | deity |
| placement.section.governs | P93 | none | `WHAT THE BODY GOVERNS` | none | `What the body governs` (`PlacementView.swift:27`) | see Q2 | none |
| placement.section.sign | P95 | `WHAT IT IS` (`PlacementReading.tsx:148`) | `IN CAPRICORN` | `What it is` (`PlacementScreen.kt:145`) | `In {sign}` (`PlacementView.swift:30`) | see Q2 | none |
| placement.section.house | P97, P98 | `HOW IT SHOWS` (`PlacementReading.tsx:154`) | `IN THE SECOND HOUSE` + `The Storehouse` | `How it shows` (`PlacementScreen.kt:158`) | `In the {ordinal} house` (`PlacementView.swift:69`) | see Q2 | none |
| placement.section.keep | none | `WHAT TO KEEP IN VIEW` (`PlacementReading.tsx:160`) | none | not traced | none | see Q2 | none |
| placement.prose | P92, P94, P96 | `buildWhatItIs`, `buildHowItShows`, `buildKeepInView` (`PlacementReading.tsx:150-162`) | deity note, planet domain, planet-in-sign paragraph | web | content files | web’s sentences | composed |
| placement.received | none | `THIS IS A MODERN BODY, ...` (via `ReceptionNote`) | none | `PlacementScreen.kt:181-182` | `· received` (`PlacementView.swift:51`) | web | none |
| placement.votive | none | per-culture votive | none | `PlacementScreen.kt:238-243` | none | web | per culture |

## Transit detail (board Glass-Transit-detail, P99 to P127)

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| transit.kicker | P99 | `{institution} · A READING SCOPED TO THE TRANSIT'S WHOLE SPAN` (`components/transits/TransitDetail.tsx:170`) | same, curly `’` | `InstitutionKicker(after = "A long transit")` (`A:ui/screens/TransitDetailScreen.kt:133`) | `{culture} · a long transit` (`S:AstraAntiqua/Screens/TransitsView.swift:121`) | `{institution} · A READING SCOPED TO THE TRANSIT’S WHOLE SPAN` | institution |
| transit.headline | P101 | `figure.headline` (`TransitDetail.tsx:184`) | web’s | figure headline (`TransitDetailScreen.kt:134`) | `{deity} {verb} {natal}` | web | composed |
| transit.meta.title | P102 | `{DEITY} {VERB} {NATAL}` (`TransitDetail.tsx:174`) | `AMUN ROWS IN TIME WITH YOUR RISING` | not traced | not traced | web words; same `YOUR` note as transits.row.title | deity, verb |
| transit.meta.degrees | P102 | `degreesLine` via `natalDegreeSide` (`transits/spanDisplay.ts:252-258`), degrees padded | `AMUN 22°24′ LEO △ YOUR RISING 22°24′ SAGITTARIUS` | not traced | `At first pass: {sign} {deg}` (`TransitsView.swift:139`) | board degrees (F5) | deity |
| transit.meta.release | P102 | `THROUGH THE {SEASON} OF {year}` (`TransitDetail.tsx:180`) | `THROUGH THE SUMMER OF 2027` | not traced | none | web (agree) | none |
| transit.section labels | P106, P108, P110, P112 | `WHAT IS CHANGING`, `WHERE IT BEGINS`, `WHAT IT TOUCHES`, `WHAT IT LEAVES BEHIND` (`TransitDetail.tsx:197-211`) | same | `What is meeting what`, `The exact passes` (`TransitDetailScreen.kt:148,178`) | `What is meeting what`, `The exact passes` (`TransitsView.swift:127,133`) | web and board (agree) | none |
| transit.figure labels | P114, P119, P123, P125 | `WHAT IT LOOKS LIKE IN SPACE`, `WHAT IS THIS? →`, `TRY THIS`, `THE LESSON`, cards `CONSIDER` `READ` `KEEP`, centre `YOU` (`components/figure/FigureAnatomy.tsx:25,89,127,150,163`) | same | `YOU` (`TransitDetailScreen.kt:168`) | not traced | web and board (agree) | none |
| transit.playsOut | P120 | `playsOutTitle` (`data/figureBanks.ts:152,702`) | `HOW THIS PLAYS OUT ON THE RIVER` | generated (`FigureBanks.kt`) | content files | web (agree) | per culture: RIVER, LEDGER, ... |
| transit.statusLine | P118 | `FIRST EXACT PASS DONE · {n} RETURNS REMAIN · RELEASES {MON YYYY}` (`spanDisplay.ts:219-226`) | `FIRST EXACT PASS DONE · 2 RETURNS REMAIN · RELEASES JUN 2027` | `PASSED`, `AHEAD` (`TransitDetailScreen.kt:265`) | `Passed`, `Ahead` (`TransitsView.swift:157`) | web and board (agree), digits | none |
| transit.timeline caps | P118 | `buildTimeline` | `EARLY OCT` `2026`, `LATE DEC` `2026` | not traced | not traced | board form `{EARLY, MID or LATE} {MON}` over `{yyyy}`. CANNOT CONFIRM web’s caps text. | none |
| transit.footer | none | `← THE YEAR` · `THE FORECAST` · `ALL LONG TRANSITS →` (`TransitDetail.tsx:233-242`) | none | not traced | none | web words; `ALL LONG TRANSITS →` takes the destination name `THE LONG TRANSITS →` (N3) | none |

## More (board Glass-More, P128 to P144; culture sheet P146 to P153)

FACT (survey-canvas section 3): web has no More page. FACT (`app/` listing): web has `/forecast`, `/synastry`,
`/learn`, `/voices`, `/matrix`, `/method`, `/account`, `/signin`, `/waitlist`. INFERENCE: More is chrome of a
screen both ports carry, so the board's forms enter the catalog and web gains a More model even if no web page
prints it yet.

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| more.kicker | P128 | none | `SMOKE TEST · ROME, ITALY` | not built (MORE opens Learn, `A:ui/screens/SkyDayScreen.kt:158`) | `Astra Antiqua` (`S:AstraAntiqua/Screens/MoreView.swift:17`) | `{NAME} · {PLACE}` | none |
| more.title | none | none | none | not built | `More` (`MoreView.swift:17`) | none (board has no title; Swift drops it) | none |
| more.culture.label | P129, P148 | none | `YOUR CULTURE` | not built | not traced | `YOUR CULTURE` | none |
| more.culture.row | P130 to P134, P149 to P153 | name `CULTURE_LABELS`, tagline `CULTURE_TAGLINES` (`data/cultures.ts:30-41`), Egypt `The Hall of Ma'at` straight | `EGYPT` / `The Hall of Ma’at`, ... | not built | `CultureView.swift` | `{CULTURE NAME}` / `{tagline}` with `’` (F10) | one row per culture |
| more.readings.label | P135 | none | `READINGS` | not built | `Readings` (`MoreView.swift:34`) | `READINGS` | none |
| more.row.forecast | P136 | destination `/forecast`, named `THE FORECAST →` in footers (`YearNave.tsx:227`) | `The year ahead` / `YOUR SOLAR RETURN, LONG TRANSITS AND STATIONS` | not built | `The year ahead` / `Your solar return, ...` (`MoreView.swift:36`) | board; name per N4 | none |
| more.row.today | none | none | none | not built | `Today in full` (`MoreView.swift:35`) | Swift drops it (no web or board slot) | none |
| more.row.synastry | P137 | `SYNASTRY · TWO CHARTS WEIGHED` (`app/synastry/page.tsx:116`) | `Synastry` / `TWO CHARTS READ AGAINST EACH OTHER` | not built | `Synastry` / `Two charts read ...` (`MoreView.swift:37`) | board | none |
| more.reference.label | P138 | none | `REFERENCE` | not built | `Reference` (`MoreView.swift:42`) | `REFERENCE` | none |
| more.row.learn | P139 | Lintel `LEARN` (`components/chrome/Lintel.tsx:21`) | `Learn` / `HOW THE SKY BECOMES A CHART, IN SEVEN SECTIONS` | not built | `MoreView.swift:43` | board; name per N2 | none |
| more.row.voices | P140 | Lintel `VOICES` (`Lintel.tsx:20`) | `The five voices` / `ONE SKY, FIVE THEOLOGIES` | not built | `MoreView.swift:44` | board; name per N2 | none |
| more.row.matrix | P141 | `/matrix` (Android lintel `MATRIX`, `A:ui/nav/Destinations.kt:96`) | `The matrix` / `TEN BODIES ACROSS FIVE PANTHEONS` | not built | `MoreView.swift:45` | board; name per N2 | none |
| more.row.method | P142 | `METHOD` link (`ChartsInstrument.tsx:163`) | `The method` / `THE NUMBERS THE APP RUNS, AND ITS SOURCES` | not built | `MoreView.swift:46` | board; name per N2 | none |
| more.record.label | P143 | none | `YOUR RECORD` | not built | `Your record` (`MoreView.swift:51`) | `YOUR RECORD` | none |
| more.record.lines | P144 | none | `Smoke Test` / `15 JAN 1990 · 05:30 · ROME, ITALY` / `ZONE EUROPE/ROME · RISING SAGITTARIUS` | not built | `Read as {stamp} UTC · ...` (`MoreView.swift:91-94`) | board | none |
| more.record.actions | P144 | none | `EDIT THE BIRTH`, `DELETE THE RECORD` | not built | `Edit the birth`, `Delete the record`, `Change the culture`, `Cast your chart` (`MoreView.swift:55-62`) | board; `CAST YOUR CHART` when no birth (INFERENCE, the board shows a birth) | none |
| more.record.note | P144 | `KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC` (`ChartsInstrument.tsx:98`) | `KEPT ON THIS DEVICE ONLY · LEFT OUT OF BACKUPS` | `KEPT ON THIS DEVICE` (`A:ui/components/FeedbackRow.kt`) | `The record is kept on this device only. ...` (`MoreView.swift:60`) | board for More. INFERENCE: web’s line belongs to the Chart empty state and stays there; the two say different things (web offers sync). | none |
| more.delete.confirm | none | none | none | not built | `Yes, delete it from this device`, `Keep it` (`MoreView.swift:65-66`) | Swift’s words enter the catalog (chrome of a shared screen with no other source) | none |

## Chrome

| Slot key | Board ID | Web (file:line) | Board | Android | Swift | DEFAULT | Per culture |
|---|---|---|---|---|---|---|---|
| chrome.wordmark | P1 | wordmark SVG | `ASTRA ANTIQVA` | `A:ui/theme/glass/GlassChrome.kt:219` | `S:AstraAntiqua/Theme/Glass.swift:328` | `ASTRA ANTIQVA` (agree) | none |
| chrome.cultureChip | P3 | `CultureSwitch` prints the script name and the institution (`components/chrome/CultureSwitch.tsx:57-70`) | `EGYPT` + chevron | culture name (`GlassChrome.kt:242-251`) | culture label (`Glass.swift:370`) | `{CULTURE NAME}`: `EGYPT`, `GREECE`, `CANAAN`, `CARTHAGE`, `ROME`, stored upper | per culture |
| chrome.cultureChip.a11y | P3 | none | none | `Culture: {name}. Change culture` (`GlassChrome.kt:251`) | same (`Glass.swift:370`) | `Culture: {name}. Change culture` (ports agree) | name |
| chrome.horizon | P2 | `D` `W` `S` `Y` (`components/chrome/HorizonControl.tsx:17-20`) | `DAY` `WEEK` `SEASON` `YEAR` | `horizon.name` (`GlassChrome.kt:336-350`); master `D W S Y` (`A:ui/nav/Destinations.kt:77-82`) | rawValue upper (`Glass.swift:467`) | `DAY`, `WEEK`, `SEASON`, `YEAR`. INFERENCE: web’s letters are a narrow-bar abbreviation; the plan allows truncation only with an ellipsis, so web prints the words or Matthew rules the letters as a separate slot. | none |
| chrome.tabs | P17 | Lintel `TODAY VOICES LEARN` · `CHARTS ACCOUNT` (`Lintel.tsx:18-25`) | `SKY` `TRANSITS` `CHART` `MORE` | `GlassChrome.kt:180` | `Glass.swift:305` | bars stay layout (popup); names per N1 to N4 | none |
| chrome.back | P55 | none | chevron only | `Back to {parent}` a11y (`GlassChrome.kt:282-285`) | `Back to {title}` a11y (`Glass.swift:400`) | `Back to {destination name}` a11y | none |
| chrome.footer | none | `← THE DAY`, `THE WEEK →`, `THE WEEK`, `THE SEASON →`, `← THE SEASON`, `THE YEAR →`, `← THE YEAR`, `THE LONG TRANSITS →`, `ALL LONG TRANSITS →`, `THE FORECAST →`, `THE FORECAST` (Day, Week, Season, Year, Transit detail rows above) | none | Week and Season footers (`SkyWeekScreen.kt:309-311`, `SkySeasonScreen.kt:353-356`) | none | web form, one name per destination (N3, N4), arrows as web prints them; hidden on the board | none |
| chrome.feedback | none | `AGAINST THIS {NOUN} →`, `IT WAS SO`, `IT WAS NOT SO`, `KEPT ON THIS DEVICE` (`components/chrome/FeedbackRow.tsx:34`) | none | `A:ui/components/FeedbackRow.kt` (11 strings) | none | web | none |

### Navigation names (one name per destination)

| Rule | Destination | Web | Board | Android | Swift | DEFAULT |
|---|---|---|---|---|---|---|
| N1 | The sky (Day and its horizons) | Lintel `TODAY` (`Lintel.tsx:19`) | tab `SKY` | tab `SKY`; master lintel `TODAY` | tab `SKY` | `SKY`. INFERENCE: web’s `/` is the Day horizon of the same destination. |
| N1 | The chart | Lintel `CHARTS` (`Lintel.tsx:24`), sub-bar `CHARTS · NATAL INSTRUMENT` | tab `CHART` | `CHART` | `CHART` | `CHART` (plan names it) |
| N1 | The long transits | footer `THE LONG TRANSITS →` | tab `TRANSITS`, title `The long transits` | `TRANSITS` | `TRANSITS` | tab `TRANSITS`; link `THE LONG TRANSITS →` |
| N2 | Learn, voices, matrix, method | Lintel `LEARN`, `VOICES`; link `METHOD` | More rows `Learn`, `The five voices`, `The matrix`, `The method` | lintel `LEARN`, `VOICES`, `MATRIX` | More rows as the board | board words; each slot keeps its drawn case. INFERENCE: web’s Lintel `VOICES` becomes `THE FIVE VOICES`, `MATRIX` becomes `THE MATRIX`, `METHOD` becomes `THE METHOD`. |
| N3 | Transits index from a footer | `THE LONG TRANSITS →` and `ALL LONG TRANSITS →` | none | `THE LONG TRANSITS →` | none | `THE LONG TRANSITS →` |
| N4 | The forecast (`/forecast`) | `THE FORECAST →`, `THE FORECAST` | More row `The year ahead` | master `ForecastScreen` | More row `The year ahead` | board `The year ahead`, so web’s footer reads `THE YEAR AHEAD →`. Depends on Q1: if the Year screen title takes the board’s `The year ahead`, two destinations share one name. |
| N5 | Account | Lintel `ACCOUNT`; pages `THE RECORD` | none (More `YOUR RECORD` is the local record) | `ACCOUNT`, `THE RECORD` (`strings.xml`) | none | web; no board destination |

## Android-only vocabulary

### `LexiconDictionary.kt` (`A:domain/LexiconDictionary.kt`)

Default for this block: keep if web has a matching destination; otherwise web adopts it only if it is chrome of a
shared screen; else Android drops it.

| Field | Example (Egypt, `:44-65`) | Where Android prints it | Web match | DEFAULT |
|---|---|---|---|---|
| `dashboardTitle` | `The Hall of Ma’at` (Greek `The Day's Oracle`, `:13`) | master kickers `{dashboardTitle} · the season/year/week` (`HorizonScreens.kt:73,90,137,153`, `WeekScreen.kt`), `CultureSelectionScreen.kt`, `MainDashboardScreen.kt` | `institution` (`cultureVoice.ts`) carries the same words in caps | drop; print `{institution}` from the catalog |
| `birthChartMenu` | `Scroll of Thoth` | no reader (grep) | none | drop |
| `ephemerisMenu` | `The Decans` | no reader | none | drop |
| `settingsTitle` | `Scales of Ma'at` | no reader | none | drop |
| `culturalVoices` | `The Lord`, `The Lunar Traveler`, ... | no reader | deity epithets in `deities.json` | drop |
| `highPriestSummaryTitle` | `The Weighing of the Heart` | `MainDashboardScreen.kt` | none; web Day has no such heading | drop (old dashboard, not a shared screen) |
| `officerRole` | `The Lector Priest` | `MainDashboardScreen.kt` | none | drop |
| `harmoniousAspectLabel`, `conflictingAspectLabel` | `The Feather of Ma'at`, `The Incursion of Isfet` | no reader | tone words F9 | drop |
| `decreeLine` | `I am {deity}, and this hour born under {sign} ...` | `NatalPlacementReading.kt`, `NatalReadingComposer.kt`, `MainDashboardScreen.kt` | none | drop; the chart summary takes web’s `SUMMARY_*` |
| `highPriestSummary` | `The threads of history converge ...` | `MainDashboardScreen.kt`, `DashboardViewModel.kt` | none | drop |

INFERENCE: every field is either unread or read only by the old dashboard and natal composer; none is chrome of a
board screen. CANNOT CONFIRM that `MainDashboardScreen` is gone from the glass navigation (not traced).

### `res/values/strings.xml` account copy (`claude/android-glass-7a8074:android/app/src/main/res/values/strings.xml`)

FACT (comments in the file): the record, account and roll strings are taken from web's `/signin`, `/account` and
`/waitlist`. FACT (grep of `web/src`): `OPEN THE RECORD` (`app/signin/page.tsx:199`), `CONTINUE WITHOUT AN ACCOUNT`
(`:217`), `AN ACCOUNT ADDS SYNC,` / `NOTHING ELSE` (`:81-83`), `EXPORT THE RECORD` (`app/account/page.tsx:447`),
`THE ROLL IS OPEN` (`app/waitlist/page.tsx:26`), `SYNC ON` / `SYNC OFF` (`components/chrome/SyncFlag.tsx:12`), `WE
EMAIL ONCE, WHEN CALLED` (`components/waitlist/WaitListForm.tsx:76`).

| Group | Keys | Web match | DEFAULT |
|---|---|---|---|
| Record (sign in) | `record_*` (17) | `/signin` | keep; the catalog takes web’s strings, `account.*` keys |
| Account | `account_*` (24) | `/account`, `SyncFlag.tsx` | keep, web’s words |
| Roll | `roll_*` (9) | `/waitlist`, `WaitListForm.tsx` | keep, web’s words; `roll_position` uses web’s `ordinal()` (`WaitListForm.tsx:28`) as a format |
| Account errors | `account_error_unreachable`, `_unreadable`, `record_refused`, `record_missing`, `_passwords_disagree`, `_export_not_written` | not found by grep | INFERENCE: chrome of a web destination (`/account`, `/signin`); web adopts them if its pages print an equivalent error, else Android keeps them as Android-only until Matthew rules. CANNOT CONFIRM web’s error strings (not traced). |
| Device write errors per culture | `account_error_device_write_{egypt,...}` | none (grep: `papyrus` only in decree banks) | drop, or web adopts if web gains the error; not a board screen |
| Licences | `account_licences*`, `licences_*` (19) | none (web has no licences page) | Android keeps (platform obligation, not a shared screen). INFERENCE: outside the catalog. |
| Figure errors | `figure_failed`, `figure_try_again` | not found | drop, or web adopts if the figure page gains an error line |
| `app_name` | `Astra Antiqua` | site title | outside the catalog (platform) |

## Format rules

| Rule | Name | Web | Board | Android | Swift | DEFAULT |
|---|---|---|---|---|---|---|
| F1 | `date.day` | `WEDNESDAY` + `OCTOBER 21, 2026` (`home/format.ts:71,75`) | `WED 21 OCT 2026` | `SkyDayScreen.kt:224-229`, UTC | `SkyDay.swift:69`, UTC | `EEE d MMM yyyy`, upper, UTC day |
| F2 | `range.days` | Week sub-bar `19–25 OCT 2026` unspaced, `19 OCT – 1 NOV 2026` (`WeekNave.tsx:27-36`); Season `23 SEP – 23 OCT` spaced, no year (`horizons/format.ts:42`) | `19 → 25 OCT 2026`; `23 SEP → 23 OCT 2026` | same month `19 → 25 OCT 2026`, across months `29 SEP → 5 OCT 2026`, across years `29 DEC 2025 → 4 JAN 2026` (`A:domain/SkyWeek.kt:44-58`) | same month and across months as Android; across years `29 DEC → 4 JAN 2027`, first year dropped (`SkyWeek.swift:52-60`) | Android’s three shapes: `{d} → {d} {MMM} {yyyy}`, `{d} {MMM} → {d} {MMM} {yyyy}`, `{d} {MMM} {yyyy} → {d} {MMM} {yyyy}`; spaced `→`; local days. INFERENCE: Swift’s year-end form is a bug. |
| F3 | `date.dayMonth`, `date.dayMonthYear`, `date.monthYear` | `23 JUL`, `MAY 2027` (`horizons/format.ts:32,37`); `home/format.ts:65` uses en-US | `23 SEP`, `26 OCT 2026`, `OCT 2026` | five month arrays (plan) | `Format.swift:26-36` | `d MMM`, `d MMM yyyy`, `MMM yyyy`, upper; zone per slot |
| F4 | `range.months` | `OCT 2026 → JUN 2027` (`buildHomeBundle.ts:255`) | same | `SkyDayScreen.kt:485` | `SkyDay.swift:135` | `{MMM yyyy} → {MMM yyyy}` (agree) |
| F5 | `angle.degMin` | padded `03°37′` (`charts/chartFormat.ts:45-49`, `transits/spanDisplay.ts:128`); unpadded orb `0°25′` (`home/format.ts:58`); minutes rounded | `24°45′`, `3°37′`, `0°52′`: degree unpadded, minutes two digits | `%02d°%02d′` padded (`NatalChartData.kt:50`) | unpadded, minutes floored (`Format.swift:92-96`) | degree unpadded, minutes two digits, `°` and `′` (U+2032). INFERENCE: minutes round as web does (web’s numbers are canonical); Swift’s floor differs by one minute at most. |
| F6 | `angle.orbDecimal`, `percent` | none | `3.0°`, `74% LIT` | `%.1f°` (`SkyDayScreen.kt:438`), `{n}% LIT` | `%.1f°` of tenths (`SkyDay.swift:73-75`), `{n}% LIT` | one decimal with `°`; whole percent, no space before `%` |
| F7 | `count.word` | none; spans digits `3 EXACT`, `2 RETURNS REMAIN` (`spanDisplay.ts:226`); `smallNumberWord` in prose only (`spanDisplay.ts:183`) | words in count lines `SEVEN DAYS`, `SIX SPANS`; digits in data lines `3 EXACT · 2 AHEAD`, `72 TURNINGS` | `NONE ONE ... SEVEN` (`SkyWeek.kt:27`) | `NO ONE ... SEVEN`, zero part left out (`SkyWeek.swift:40,66-72`) | words in count lines, zero `NONE` (part kept); digits in data lines and over twelve. Plural nouns: `PASS`/`PASSES`, `RETURN`/`RETURNS` as web. |
| F8 | `sign.full`, `sign.abbr` | three letters `CAP` in the chart table and week shorthand (`chartFormat.ts:9-22`) | full `CAPRICORN`, `SCORPIO`, `PISCES` | three letters, pinned by `ZodiacSignAbbrTest` | three letters (`SkyWeek.swift:96`) | full upper name in every board slot; `sign.abbr` stays in `formats.json` for web’s desktop table only if Matthew keeps that table (INFERENCE) |
| F9 | `tone.word` | span tone `tension` or `ease` (`spanDisplay.ts:42`), no printed tone word on rows | `EASE`, `TENSION`, `UNION` (conjunction) | `EASE` or `TENSION`; conjunction `EASE` (`SkyDayScreen.kt:440`) | `EASE`, `TENSION`, `UNION` (`SkyDay.swift:80-82`) | `EASE` (trine, sextile), `TENSION` (square, opposition), `UNION` (conjunction). Spans keep two (`EASE`, `TENSION`) as all four surfaces do. |
| F10 | apostrophe | straight `'` in `THE SEASON'S SKY`, `THE DAY'S ORACLE`, `THE WEEK'S LEDGER`, `TRANSIT'S WHOLE SPAN`, `The Hall of Ma'at`, votives; curly in `THE HALL OF MA’AT`, `CHART’S HOUSES` | curly `’` throughout | mixed | mixed | `’` (U+2019) in every catalog value. INFERENCE: prose banks in `shared/content/` keep their characters until the copy pass (plan constraint). |
| F11 | retrograde mark | `R` or `D` in the chart table (`DataRow.tsx:77`); `℞` in season and year rows (`seasonContent.ts:152`, `yearContent.ts:206`) | `R` in chart rows; words `TURNS RETROGRADE` in year rows | `℞` in season rows (`SkySeason.kt:209`) | `R` caption (`PlacementsView.swift:26`) | chart rows `R` (board and web agree); event rows use words (`TURNS RETROGRADE`, `TURNS DIRECT`); `℞` leaves the printed chrome. Web’s `D` for direct is dropped (board prints nothing). |
| F12 | `house.roman`, `ordinal.word` | house `02` padded (`DataRow.tsx:75`); `toRoman` (`horizons/format.ts:62`); ordinal `Eleventh` capitalised in `houses.ts`, `eleventh` in `lib/dayPressure.ts:55` | `II`, `X`, `XII`; `HOUSE II`; `The eleventh house`, `IN THE SECOND HOUSE` | `SkyDay.kt:73-74` lower ordinals | `Format.toRoman`, lower ordinals | roman numerals for houses; ordinal words lower in sentences and headings, upper in mono labels, each stored as printed |
| F13 | separators | `·` (U+00B7) with spaces; `–` and `→` mixed | `·` and `→` only | `·`, `→` | `·`, `→` | `·` with one space each side; `→` (U+2192) spaced between dates; no `–` in chrome |
| F14 | case | CSS and `.toUpperCase()` at render (survey) | as drawn | `.uppercase()` at render | `.uppercased()` at render | the catalog stores the printed case; no surface transforms a catalog string (plan constraint) |

## Open items outside the three questions

- CANNOT CONFIRM (plan Task 1; `android-glass.md:509-510` on `claude/android-glass-7a8074`): Matthew's step 4
  answer "Changes first" named no change to Sky Season. He should name them in the ruling session.
- CANNOT CONFIRM: the Doorway (P154 to P162) and the Explain and Spec boards were not in the local copy; their rows
  are not in this table.
- INFERENCE: Week row prose, Year station sentences and the Season lunation sentence on the board have no source
  in `web/src` on this branch (grep for `plumb hangs`, `new bank`, `stands still`). Under the rule web's words win;
  where web has no sentence, the slot needs Matthew's word or stays empty.

## Questions for Matthew (at most three)

Q1. Screen titles. Should the Week, Season, Year, Transits and Placement titles print web's headlines or the
board's plain names?
- Web headlines (Recommended): `SEVEN DAYS WEIGHED` (and `SEVEN QUESTIONS`, `SEVEN SITTINGS`, `THE WEEK’S LEDGER`,
  `FASTUS AND NEFASTUS`), `THE SEASON OF THE SCALES`, `MMXXVI · THE YEAR OF THE RIVER`, `WHAT DOES NOT PASS IN A DAY`,
  `YOUR RA / IN THE GOAT`. Chart keeps the board's `The placements` (web has no title there).
- Board plain names: `The week`, `The Sun in Libra`, `The year ahead`, `The long transits`, `Ra`, `The placements`;
  the forecast row then needs a new name, since `The year ahead` would name two destinations.

Q2. Sections on Season and Placement. Where the board's section set differs from web's, which set prints?
- Board labels, web's extras kept (Recommended): Season prints `THROUGH YOUR CHART`, `The eleventh house · The
  Assembly` and web's house sentence, then `WHAT IS CHANGING`, `WHERE IT BEGINS`, `WHAT IT LEAVES BEHIND` (Android's
  layout today); Placement prints `WHAT THE BODY GOVERNS`, `IN CAPRICORN`, `IN THE SECOND HOUSE` / `The Storehouse`,
  then `WHAT TO KEEP IN VIEW`.
- Board sections only: Season prints only `THROUGH YOUR CHART` and its house block; Placement only `WHAT THE BODY
  GOVERNS`, `IN CAPRICORN`, `IN THE SECOND HOUSE`.
- Web sections only: Season prints `WHAT IS CHANGING`, `WHERE IT BEGINS`, `WHAT IT TOUCHES`, `WHAT IT LEAVES
  BEHIND`; Placement prints `WHAT IT IS`, `HOW IT SHOWS`, `WHAT TO KEEP IN VIEW`.

Q3. The week shorthand marker. Web prints `TIGHT` when an aspect's orb is under 0.5° (`lib/decree.ts:51`); the
board prints `EXACT` for the same rows. Which word prints?
- TIGHT, web's word (Recommended): `☽ △ ♅ · TIGHT · EASE`. `EXACT` already means the moment of zero orb on the Day
  card (`3.0° FROM EXACT`) and on Transits (`3 EXACT`).
- EXACT, board's word: `☽ △ ♅ · EXACT · EASE`.

## Matthew's rulings (popup, 2026-11-01)

- FACT: "All defaults stand": every row prints its DEFAULT column, apart from the three answers below.
- FACT: titles "Web headlines": Week, Season, Year, Transits and Placement print web's headlines; Chart keeps the
  board's "The placements".
- FACT: sections "Board labels, web extras": Season prints THROUGH YOUR CHART, the house heading and web's house
  sentence, then WHAT IS CHANGING, WHERE IT BEGINS, WHAT IT LEAVES BEHIND; Placement prints WHAT THE BODY
  GOVERNS, IN {SIGN}, IN THE {ORDINAL} HOUSE with the house title, then WHAT TO KEEP IN VIEW.
- FACT: week shorthand "TIGHT, no Season changes": an aspect under 0.5° prints TIGHT; Sky Season's "Changes
  first" names no change beyond this table.
