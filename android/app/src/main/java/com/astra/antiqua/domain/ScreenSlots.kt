package com.astra.antiqua.domain

import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.time.ZoneId
import java.util.Date

/**
 * One screen's printed text by slot key (`<screen>.<slot>`, as in
 * shared/strings/en.json and shared/goldens/screens/<screen>.json): a value is
 * a String, or a List<String> for a slot that repeats (rows, sections, links).
 * Stacked lines inside one slot are joined with "\n", as web's models join
 * them. The screens draw from these maps; ScreenGoldenTest compares them with
 * web's goldens character for character.
 */
class SlotMap(val values: Map<String, Any>) {
    fun has(key: String): Boolean = key in values

    fun text(key: String): String = values[key] as? String ?: error("SlotMap: no text slot $key")

    fun textOrNull(key: String): String? = values[key] as? String

    @Suppress("UNCHECKED_CAST")
    fun list(key: String): List<String> = values[key] as? List<String> ?: error("SlotMap: no list slot $key")

    @Suppress("UNCHECKED_CAST")
    fun listOrEmpty(key: String): List<String> = values[key] as? List<String> ?: emptyList()

    /** The stacked lines of a text slot. */
    fun lines(key: String): List<String> = text(key).split("\n")
}

internal fun lines(vararg parts: String): String = parts.joinToString("\n")

private fun fill(template: String, vararg slots: Pair<String, Any>): String =
    SharedStrings.fill(template, slots.associate { (k, v) -> k to v.toString() })

private fun institution(culture: AncientCulture): String = SharedStrings.COMMON_INSTITUTION.getValue(culture)

/** A Moon phase's name in the catalog (common.moon.*), from web's English name ("Waxing Gibbous"). */
fun moonPhaseText(name: String): String = when (name) {
    "New Moon" -> SharedStrings.COMMON_MOON_NEW_MOON
    "Waxing Crescent" -> SharedStrings.COMMON_MOON_WAXING_CRESCENT
    "First Quarter" -> SharedStrings.COMMON_MOON_FIRST_QUARTER
    "Waxing Gibbous" -> SharedStrings.COMMON_MOON_WAXING_GIBBOUS
    "Full Moon" -> SharedStrings.COMMON_MOON_FULL_MOON
    "Waning Gibbous" -> SharedStrings.COMMON_MOON_WANING_GIBBOUS
    "Last Quarter" -> SharedStrings.COMMON_MOON_LAST_QUARTER
    "Waning Crescent" -> SharedStrings.COMMON_MOON_WANING_CRESCENT
    else -> error("moonPhaseText: unknown phase $name")
}

/** The feedback row's four printed parts (chrome.feedback.*), for a screen's noun. */
fun feedbackLines(noun: String): List<String> = listOf(
    fill(SharedStrings.CHROME_FEEDBACK_LEAD, "noun" to noun),
    SharedStrings.CHROME_FEEDBACK_SO,
    SharedStrings.CHROME_FEEDBACK_NOT_SO,
    SharedStrings.CHROME_FEEDBACK_KEPT,
)

/** web's natalPointLabel: the deity, upper, for the Sun and Moon; ASCENDANT and MIDHEAVEN for the angles. */
fun natalPointUpper(culture: AncientCulture, key: String): String = when (key) {
    "asc" -> "ASCENDANT"
    "mc" -> "MIDHEAVEN"
    else -> Planet.entries.firstOrNull { it.name.equals(key, ignoreCase = true) }
        ?.let { DeityRegistry.getDeity(culture, it).name.uppercase() } ?: key.uppercase()
}

/** Sky Day's slots (board Glass-Day; table section "Day"), from a composed day. */
object SkyDaySlots {
    /**
     * Slots web prints that Android has not built: the day votive (web's
     * composeDayVotive has no Android port; ruled off on the ports). The
     * golden test skips these and lists them.
     */
    val NOT_BUILT = setOf("day.votive")

    /** [zone] is the zone the season count and the quarter's date read in (local); the kicker reads the UTC day. */
    fun build(day: SkyDay, culture: AncientCulture, zone: ZoneId = ZoneId.systemDefault()): SlotMap {
        val m = linkedMapOf<String, Any>()
        m["day.kicker"] = fill(SharedStrings.DAY_KICKER, "date" to SharedFormat.dateDay(day.date, SharedFormat.UTC), "institution" to institution(culture))
        m["day.headline"] = day.decree.headline
        if (day.decree.evidence.isNotEmpty()) m["day.evidence"] = day.decree.evidence
        m["day.paragraph"] = listOf(day.decree.paragraph)
        m["day.sky.label"] = SharedStrings.DAY_SKY_LABEL
        val moon = day.moon
        m["day.sky.moon"] = lines(
            SharedStrings.DAY_SKY_MOON_LABEL,
            fill(SharedStrings.DAY_SKY_MOON_LINE, "phase" to moonPhaseText(moon.phase), "percent" to SharedFormat.percent(moon.litFraction)),
        )
        moon.nextDate?.let {
            m["day.sky.nextQuarter"] = lines(
                fill(SharedStrings.DAY_SKY_NEXT_QUARTER, "quarter" to moonPhaseText(moon.nextName)),
                fill(SharedStrings.DAY_SKY_NEXT_QUARTER_DATE, "date" to SharedFormat.dayMonthYear(it, zone)),
            )
        }
        val season = day.season
        m["day.sky.season"] = lines(
            SharedStrings.DAY_SKY_SEASON_LABEL,
            fill(SharedStrings.DAY_SKY_SEASON_LINE, "sign" to SharedFormat.signFull(season.sign), "n" to season.dayOfSeason, "total" to season.totalDays),
        )
        m["day.sky.bar"] = listOf(
            SharedFormat.dayMonth(season.start, zone),
            fill(SharedStrings.DAY_SKY_BAR_TO_GO, "remaining" to maxOf(0, season.totalDays - season.dayOfSeason)),
            SharedFormat.dayMonth(season.end, zone),
        )
        day.contacts?.let { contacts ->
            m["day.chart.label"] = SharedStrings.DAY_CHART_LABEL
            m["day.chart.row.sentence"] = contacts.map { it.sentence }
            m["day.chart.row.data"] = contacts.map { contactData(it) }
        }
        day.longTransit?.let { pick ->
            val span = pick.span
            m["day.longTransit.label"] = SharedStrings.DAY_LONG_TRANSIT_LABEL
            m["day.longTransit.meta"] = fill(
                SharedStrings.DAY_LONG_TRANSIT_META,
                "status" to if (pick.active) SharedStrings.DAY_LONG_TRANSIT_OPEN else SharedStrings.DAY_LONG_TRANSIT_NEXT,
                "range" to SharedFormat.rangeMonths(span.start, span.end, SharedFormat.UTC),
            )
            m["day.longTransit.title"] = lines(
                fill(
                    SharedStrings.DAY_LONG_TRANSIT_TITLE1,
                    "deity" to DeityRegistry.getDeity(culture, span.transitPlanet).name.uppercase(),
                    "signPhrase" to SharedFormat.signPhrase(span.transitSign),
                ),
                fill(
                    SharedStrings.DAY_LONG_TRANSIT_TITLE2,
                    "verb" to AspectVerbs.of(culture, span.aspect).uppercase(),
                    "natal" to natalPointUpper(culture, span.natalKey),
                ),
            )
            m["day.longTransit.footer"] = fill(
                SharedStrings.DAY_LONG_TRANSIT_FOOTER,
                "exact" to span.passes.size,
                "ahead" to span.passes.count { it.time > day.date.time },
                "tone" to SharedFormat.spanToneWord(span.aspect),
            )
            m["day.longTransit.link"] = SharedStrings.DAY_LONG_TRANSIT_LINK
        }
        m["day.footer"] = listOf(SharedStrings.CHROME_FOOTER_TO_WEEK, SharedStrings.CHROME_FOOTER_TO_SEASON, SharedStrings.CHROME_FOOTER_TO_YEAR)
        m["day.feedback"] = feedbackLines(SharedStrings.DAY_FEEDBACK_NOUN)
        return SlotMap(m)
    }

    /** day.chart.row.data: "MERCURY ⚹ NATAL SATURN · 3.0° FROM EXACT · EASE", the conjunction's tone UNION (F9). */
    fun contactData(contact: ChartContact): String = fill(
        SharedStrings.DAY_CHART_ROW_DATA,
        "planet" to SharedFormat.planetName(contact.transit),
        "aspectGlyph" to DayDecreeComposer.glyph(contact.aspect),
        "natalPlanet" to SharedFormat.planetName(contact.natal),
        "orb" to SharedFormat.orbDecimal(contact.orb),
        "tone" to SharedFormat.toneWord(contact.aspect),
    )
}

/** Sky Week's slots (board Glass-Week; table section "Week"), from a composed week. */
object SkyWeekSlots {
    val NOT_BUILT = emptySet<String>()

    /** Week counts local calendar days (F2): [zone] is the reader's. */
    fun build(week: SkyWeek, culture: AncientCulture, zone: ZoneId = ZoneId.systemDefault()): SlotMap {
        val m = linkedMapOf<String, Any>()
        val days = week.days
        m["week.kicker"] = fill(SharedStrings.WEEK_KICKER, "range" to SharedFormat.rangeDays(week.start, week.end, zone), "institution" to institution(culture))
        m["week.title"] = WeekVoice.title(culture)
        m["week.countLine"] = SkyWeekComposer.countLine(days)
        m["week.thesis"] = WeekVoice.thesis(culture)
        val moon = week.moon
        val moonLines = mutableListOf(
            SharedStrings.WEEK_MOON_LABEL,
            fill(SharedStrings.WEEK_MOON_PHASE, "phase" to moonPhaseText(moon.phase)),
            fill(SharedStrings.WEEK_MOON_LIT, "percent" to SharedFormat.percent(moon.litFraction)),
        )
        moon.nextDate?.let {
            moonLines += fill(SharedStrings.WEEK_MOON_NEXT_QUARTER, "quarter" to moonPhaseText(moon.nextName))
            moonLines += fill(SharedStrings.WEEK_MOON_NEXT_QUARTER_DATE, "date" to SharedFormat.dayMonthYear(it, zone))
        }
        m["week.moon"] = lines(*moonLines.toTypedArray())
        // The weekday over the day of the month; Rome adds the day's flag after the number.
        m["week.row.weekday"] = days.map {
            lines(
                fill(SharedStrings.WEEK_ROW_WEEKDAY, "weekday" to SharedFormat.weekday(it.date, zone)),
                fill(SharedStrings.WEEK_ROW_DATE, "d" to SharedFormat.dayOfMonth(it.date, zone)) + (it.flag?.let { f -> " ${f.name}" } ?: ""),
            )
        }
        m["week.row.today"] = days.map { if (it.isToday) SharedStrings.WEEK_ROW_TODAY else "" }
        m["week.row.headline"] = days.map { it.headline ?: "" }
        m["week.row.line"] = days.map { it.line }
        m["week.row.shorthand.aspect"] = days.map { (it.shorthand as? WeekShorthand.Aspect)?.text() ?: "" }
        m["week.row.shorthand.ingress"] = days.map { (it.shorthand as? WeekShorthand.Ingress)?.text() ?: "" }
        m["week.row.shorthand.quiet"] = days.map { if (it.shorthand == WeekShorthand.Quiet) it.shorthand.text() else "" }
        m["week.note"] = WeekVoice.note(culture)
        m["week.votive"] = WeekVoice.votive(culture, days)
        m["week.footer"] = listOf(SharedStrings.CHROME_FOOTER_TO_DAY, SharedStrings.CHROME_FOOTER_TO_SEASON, SharedStrings.CHROME_FOOTER_TO_TRANSITS)
        return SlotMap(m)
    }
}

/** Sky Season's slots (board Glass-Season; table section "Season"), from a composed season. */
object SkySeasonSlots {
    val NOT_BUILT = emptySet<String>()

    /**
     * Season counts local calendar days (F2): [zone] is the reader's. With a
     * birth the house block leads; without one, web's WHAT IT TOUCHES section
     * joins the sections and the cast line prints (Q2 ruling).
     */
    fun build(season: SkySeason, culture: AncientCulture, zone: ZoneId = ZoneId.systemDefault()): SlotMap {
        val m = linkedMapOf<String, Any>()
        val window = season.window
        m["season.kicker"] = fill(SharedStrings.SEASON_KICKER, "range" to SharedFormat.rangeDays(window.start, window.end, zone), "institution" to institution(culture))
        m["season.title"] = season.headline
        m["season.dayLine"] = season.dayLine
        m["season.signProse"] = season.signProse
        val house = season.house
        if (house != null) {
            m["season.chart.label"] = SharedStrings.SEASON_CHART_LABEL
            m["season.chart.houseHeading"] = house.title
            m["season.chart.prose"] = house.prose
        }
        val sections = mutableListOf(
            lines(SharedStrings.SEASON_SECTION_CHANGING, season.whatIsChanging),
            lines(SharedStrings.SEASON_SECTION_BEGINS, season.whereItBegins),
        )
        if (house == null) sections += lines(SharedStrings.SEASON_SECTION_TOUCHES, season.touchesSky)
        sections += lines(SharedStrings.SEASON_SECTION_LEAVES, season.whatItLeavesBehind)
        m["season.sections"] = sections
        m["season.votive"] = season.votive
        m["season.sky.label"] = SharedStrings.SEASON_SKY_LABEL
        m["season.sky.row"] = season.rows.map { skyRowText(it, zone) }
        if (house == null) m["season.noChart"] = listOf(SharedStrings.SEASON_NO_CHART_LINE, SharedStrings.SEASON_NO_CHART_LINK)
        m["season.footer"] = listOf(
            SharedStrings.CHROME_FOOTER_TO_DAY,
            SharedStrings.CHROME_FOOTER_WEEK,
            SharedStrings.CHROME_FOOTER_TO_YEAR,
            SharedStrings.CHROME_FOOTER_TO_TRANSITS,
        )
        return SlotMap(m)
    }

    /** The row's head, "28 SEP 2026 · MARS INTO LEO", with web's sentence under an ingress. */
    fun skyRowHead(row: SeasonSkyRow, zone: ZoneId = ZoneId.systemDefault()): String =
        fill(SharedStrings.SEASON_SKY_ROW, "date" to SharedFormat.dayMonthYear(row.date, zone), "event" to row.label)

    fun skyRowText(row: SeasonSkyRow, zone: ZoneId = ZoneId.systemDefault()): String {
        val head = skyRowHead(row, zone)
        return row.prose?.let { lines(head, it) } ?: head
    }
}

/** Sky Year's slots (board Glass-Year; table section "Year"), from a composed year: web's buildYearScreen. */
object SkyYearSlots {
    val NOT_BUILT = emptySet<String>()

    /**
     * The rows' dates, the month labels, the kicker and the year in the title
     * read in [zone], the reader's (F2). The count adds the window's lunations
     * to the turnings; with a birth the votive prints, without one the cast lines.
     */
    fun build(year: SkyYear, culture: AncientCulture, zone: ZoneId = ZoneId.systemDefault()): SlotMap {
        val m = linkedMapOf<String, Any>()
        val rows = year.turnings
        m["year.kicker"] = fill(SharedStrings.YEAR_KICKER, "date" to SharedFormat.dayMonthYear(year.now, zone), "institution" to institution(culture))
        m["year.title"] = fill(SharedStrings.YEAR_TITLE.getValue(culture), "roman" to SharedFormat.roman(SharedFormat.year(year.now, zone).toInt()))
        m["year.countLine"] = fill(SharedStrings.YEAR_COUNT_LINE, "n" to SharedFormat.countDigits(rows.size + year.lunations))
        m["year.monthLabel"] = rows.mapIndexed { i, row ->
            val month = SharedFormat.monthYear(row.date, zone)
            val prev = rows.getOrNull(i - 1)
            if (prev == null || SharedFormat.monthYear(prev.date, zone) != month) fill(SharedStrings.YEAR_MONTH_LABEL, "date" to month) else ""
        }
        m["year.row.head"] = rows.map { rowHead(it, zone) }
        m["year.row.prose"] = rows.map { if (it.kind == SkyEventKind.INGRESS) SkySeasonComposer.ingressSentence(culture, it.planet, it.sign) else "" }
        m["year.today"] = fill(SharedStrings.YEAR_TODAY, "date" to SharedFormat.dayMonth(year.now, zone))
        if (year.report == null) m["year.noChart"] = listOf(SharedStrings.YEAR_NO_CHART_TITLE, SharedStrings.YEAR_NO_CHART_LINK)
        year.report?.let { m["year.votive"] = SkyYearComposer.votive(culture, SkyYearComposer.votiveTone(it.dominant)) }
        m["year.footer"] = listOf(SharedStrings.CHROME_FOOTER_BACK_SEASON, SharedStrings.CHROME_FOOTER_TO_FORECAST)
        return SlotMap(m)
    }

    /**
     * year.monthLabel for the instant's own month ("SEP 2026"): the label over
     * TODAY when today's month holds no turning. Not a web slot; web prints
     * TODAY as the heading of its no-chart box, above every month.
     */
    fun todayMonth(year: SkyYear, zone: ZoneId = ZoneId.systemDefault()): String =
        fill(SharedStrings.YEAR_MONTH_LABEL, "date" to SharedFormat.monthYear(year.now, zone))

    /** year.row.*: "24 OCT · MERCURY TURNS RETROGRADE", "26 JUL · JUPITER INTO VIRGO". */
    fun rowHead(row: YearTurning, zone: ZoneId = ZoneId.systemDefault()): String {
        val date = SharedFormat.dayMonth(row.date, zone)
        val planet = SharedFormat.planetName(row.planet)
        return when (row.kind) {
            SkyEventKind.RETROGRADE -> fill(SharedStrings.YEAR_ROW_RETROGRADE, "date" to date, "planet" to planet)
            SkyEventKind.DIRECT -> fill(SharedStrings.YEAR_ROW_DIRECT, "date" to date, "planet" to planet)
            else -> fill(SharedStrings.YEAR_ROW_INGRESS, "date" to date, "planet" to planet, "sign" to SharedFormat.signFull(row.sign))
        }
    }
}

/** The long transits index's slots (board Glass-Transits; table section "Transits"): web's transitsModelFromSpans. */
object TransitsSlots {
    val NOT_BUILT = emptySet<String>()

    /**
     * Without a birth record ([transits] null) only the loading line, as web's
     * model (web prints its hard-coded cast prompt, which has no slot). Each
     * group's rows sit in their own lists; the months read in [zone].
     */
    fun build(transits: LongTransits?, culture: AncientCulture, zone: ZoneId = ZoneId.systemDefault()): SlotMap {
        val m = linkedMapOf<String, Any>()
        if (transits != null) {
            val now = transits.now
            val open = transits.open
            val ahead = transits.ahead
            val listed = open + ahead
            m["transits.kicker"] = SharedStrings.TRANSITS_KICKER
            m["transits.title"] = SharedStrings.TRANSITS_TITLE
            if (listed.isNotEmpty()) {
                val first = listed.minOf { it.start.time }.let(::Date)
                val last = listed.maxOf { it.end.time }.let(::Date)
                m["transits.countLine"] = fill(
                    SharedStrings.TRANSITS_COUNT_LINE,
                    "count" to SharedFormat.countWord(listed.size),
                    "range" to SharedFormat.rangeMonths(first, last, zone),
                )
                m["transits.axis"] = (SharedFormat.year(first, zone).toInt()..SharedFormat.year(last, zone).toInt())
                    .map { fill(SharedStrings.TRANSITS_AXIS, "yyyy" to it) }
            }
            m["transits.group.open"] = SharedStrings.TRANSITS_GROUP_OPEN
            m["transits.group.ahead"] = SharedStrings.TRANSITS_GROUP_AHEAD
            for ((group, spans) in listOf("open" to open, "ahead" to ahead)) {
                if (spans.isEmpty()) continue
                m["transits.row.title.$group"] = spans.map { LongTransitsComposer.rowTitle(culture, it) }
                m["transits.row.data.$group"] = spans.map { LongTransitsComposer.rowData(it, now, zone) }
            }
            if (listed.isNotEmpty()) m["transits.row.link"] = SharedStrings.TRANSITS_ROW_LINK
            if (open.isEmpty()) m["transits.empty.open"] = SharedStrings.TRANSITS_EMPTY_OPEN
            if (ahead.isEmpty()) m["transits.empty.ahead"] = SharedStrings.TRANSITS_EMPTY_AHEAD
        }
        m["transits.loading"] = SharedStrings.TRANSITS_LOADING
        return SlotMap(m)
    }
}
