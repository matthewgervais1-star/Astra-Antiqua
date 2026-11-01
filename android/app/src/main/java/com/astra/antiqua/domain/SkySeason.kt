package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import kotlin.math.ceil
import kotlin.math.roundToInt

/**
 * A dated row of THE SEASON’S SKY, web's SeasonSkyRow: the event as the
 * catalog prints it ("MARS INTO LEO"), web's ingress sentence under an
 * ingress (null on the other rows), and the tone the date's ink follows.
 */
data class SeasonSkyRow(val date: Date, val label: String, val prose: String?, val tone: SeasonRowTone)

enum class SeasonRowTone { CONFLICT, HARMONY, DIM }

/**
 * The house the season's sign takes in the reader's chart: the board's
 * heading ("The eleventh house · The Assembly", season.chart.houseHeading)
 * and the web's sentence (season.chart.prose).
 */
data class SeasonHouse(val house: Int, val ordinal: String, val title: String, val prose: String)

/** Sky Season, composed: what the board's sections print, from the web's season page. */
data class SkySeason(
    val window: SkyEvents.SeasonWindow,
    val daysRemaining: Int,
    /** The Sun's longitude at the instant read, for the wheel's mark. */
    val sun: Double,
    /** season.title, web's NaveHead title: "THE SEASON OF THE SCALES". */
    val headline: String,
    /** season.dayLine, the board's line under the bar: "DAY 29 OF 31 · 2 TO GO". */
    val dayLine: String,
    /** web OrbBar's fill, in percent. */
    val barPercent: Int,
    /** web's sign blurb (zodiacSigns.ts). */
    val signProse: String,
    /** The natal Ascendant; null without a birth record. */
    val ascendant: Double?,
    val house: SeasonHouse?,
    /** web composeWhatItTouchesSky, the section's sentence without a chart. */
    val touchesSky: String,
    val rows: List<SeasonSkyRow>,
    /** web's WHAT IS CHANGING, WHERE IT BEGINS and WHAT IT LEAVES BEHIND, below the board. */
    val whatIsChanging: String,
    val whereItBegins: String,
    val whatItLeavesBehind: String,
    /** web's SEASON_VOTIVE for the season's tone, its line break kept. */
    val votive: String,
    /** web's seasonReadingId, "season-libra-2026", the feedback row's key. */
    val readingId: String,
)

/**
 * Ports of web's season page (`components/horizons/SeasonNave.tsx`,
 * `seasonContent.ts`, `lib/season.ts`) for the parts Sky Season prints. The
 * window is `SkyEvents.currentSeason`, which counts local calendar days as
 * web's getCurrentSeason does.
 */
object SkySeasonComposer {

    private const val DAY_MS = 86_400_000L

    /**
     * web's CULTURE_VOICES houseGroups names (`data/cultureVoice.ts`), in the
     * order of `FigureReadingComposer.houseGroupIndex`: work, home, words, inner.
     */
    private val HOUSE_GROUPS: Map<AncientCulture, List<String>> = mapOf(
        AncientCulture.EGYPT to listOf("THE GRANARY", "THE HOUSE OF THE KA", "THE FERRY", "THE SEALED SHRINE"),
        AncientCulture.GREECE to listOf("THE AGORA", "THE OIKOS", "THE HERM", "THE ADYTON"),
        AncientCulture.CANAAN to listOf("THE THRESHING FLOOR", "THE FATHER'S HOUSE", "THE GATE", "THE TENT OF EL"),
        AncientCulture.CARTHAGE to listOf("THE COUNTING HOUSE", "THE COURTYARD", "THE HARBOR", "THE PRECINCT"),
        AncientCulture.ROME to listOf("FORUM", "DOMUS", "VIA", "TEMPLUM"),
    )

    /** web's SEASON_INGRESS_PLANETS. */
    private val INGRESS_BODIES = listOf(Planet.MERCURY, Planet.VENUS, Planet.MARS)

    /** web's finder sampling pad: scan this far past the window, then trim to its end. */
    private const val SAMPLING_PAD_DAYS = 6

    /**
     * The natal points the season reads: the chart's Sun and Moon, its
     * Ascendant, and the Midheaven at the birth's instant and place (web's
     * computeAngularPoints).
     */
    fun natal(engine: AstronomyEngine, chart: NatalChartData, latitude: Double, longitude: Double): SeasonNatal = SeasonNatal(
        sun = chart.planets.getValue(Planet.SUN).longitude,
        moon = chart.planets.getValue(Planet.MOON).longitude,
        ascendant = chart.ascendant,
        midheaven = engine.getMidheaven(chart.julianDay, latitude, longitude),
    )

    fun compose(engine: AstronomyEngine, culture: AncientCulture, now: Date, natal: SeasonNatal?): SkySeason {
        val ascendant = natal?.ascendant
        val window = SkyEvents.currentSeason(engine, now)
        val remaining = (window.totalDays - window.dayOfSeason).coerceAtLeast(0)
        val span = window.end.time - window.start.time
        val days = ceil(span.toDouble() / DAY_MS).toInt() + SAMPLING_PAD_DAYS
        val stations = SkyEvents.stations(engine, window.start, days).filter { it.date.time <= window.end.time }
        val phases = SeasonStandouts.moonPhases(engine, window.start, days).filter { it.first.time <= window.end.time }
        val eclipses = SeasonStandouts.eclipses(window.start, days).filter { it.first.time <= window.end.time }
        val ingresses = SkyEvents.ingresses(engine, window.start, days, INGRESS_BODIES).filter { it.date.time <= window.end.time }
        val sun = DayDecreeComposer.chartAt(engine, now).getValue(Planet.SUN)
        val status = status(window.totalDays, window.dayOfSeason, remaining)
        val standouts = SeasonStandouts.build(engine, culture, window, natal)
        val startYear = Calendar.getInstance().apply { time = window.start }.get(Calendar.YEAR)
        return SkySeason(
            window = window,
            daysRemaining = remaining,
            sun = sun,
            headline = SharedStrings.fill(SharedStrings.SEASON_TITLE, mapOf("signPhrase" to SharedFormat.signPhrase(window.sign))),
            dayLine = SharedStrings.fill(
                SharedStrings.SEASON_DAY_LINE,
                mapOf("n" to "${window.dayOfSeason}", "total" to "${window.totalDays}", "remaining" to "$remaining"),
            ),
            barPercent = barPercent(remaining, window.totalDays),
            signProse = Learn.SIGNS.first { it.sign == window.sign.signName }.blurb,
            ascendant = ascendant,
            house = ascendant?.let { house(culture, window.sign, it) },
            touchesSky = touchesSky(culture, ingresses),
            rows = skyRows(engine, culture, window, phases, ingresses, stations, eclipses),
            whatIsChanging = SeasonStandouts.whatIsChanging(culture, standouts),
            whereItBegins = SeasonStandouts.whereItBegins(culture, window, status, SeasonStandouts.companion(engine, window, now)),
            whatItLeavesBehind = SeasonStandouts.whatItLeavesBehind(culture, window),
            votive = SeasonStandouts.votive(culture, standouts),
            readingId = "season-${window.sign.signName.lowercase()}-$startYear",
        )
    }

    /** web's seasonStatus: OPENING in the first ~15%, CLOSING in the last, else the middle. */
    fun status(total: Int, day: Int, remaining: Int): String {
        val edge = maxOf(3, (total * 0.15).roundToInt())
        return when {
            day <= edge -> "OPENING"
            remaining <= edge -> "CLOSING"
            else -> "MIDPOINT PASSED"
        }
    }

    /** web's OrbBar with orb = days remaining and maxOrb = the season's days: at least 6%. */
    fun barPercent(remaining: Int, total: Int): Int {
        val ratio = if (total > 0) (remaining.toDouble() / total).coerceIn(0.0, 1.0) else 0.0
        return maxOf(6, ((1 - ratio) * 100).roundToInt())
    }

    /** web's properCase: each word and each hyphenated part capitalised ("Water-Bearer"). */
    fun properCase(s: String): String {
        val lower = s.lowercase()
        val out = StringBuilder()
        var last = 0
        // Split on whitespace and hyphens and keep them, as web's split(/([\s-])/) does.
        for (m in Regex("[\\s-]").findAll(lower)) {
            out.append(lower.substring(last, m.range.first).replaceFirstChar { it.uppercase() }).append(m.value)
            last = m.range.last + 1
        }
        return out.append(lower.substring(last).replaceFirstChar { it.uppercase() }).toString()
    }

    /** web's getSeasonHouse with seasonHouseHeading and composeWhatItTouchesNatal. */
    fun house(culture: AncientCulture, sign: ZodiacSign, ascendant: Double): SeasonHouse {
        val number = FigureReadingComposer.wholeSignHouse(sign.ordinal * 30.0 + 15.0, ascendant)
        val meaning = HouseMeanings.get(number)
        val ordinal = SharedFormat.ordinalWord(number)
        val group = HOUSE_GROUPS.getValue(culture)[FigureReadingComposer.houseGroupIndex(number)].lowercase()
        val arena = meaning.arena.replaceFirstChar { it.lowercase() }
        return SeasonHouse(
            house = number,
            ordinal = ordinal,
            title = SharedStrings.fill(SharedStrings.SEASON_CHART_HOUSE_HEADING, mapOf("ordinal" to ordinal, "title" to meaning.title)),
            prose = SharedStrings.fill(
                SharedStrings.SEASON_CHART_PROSE,
                mapOf("ordinal" to ordinal, "group" to group, "arena" to arena),
            ),
        )
    }

    /** web's composeWhatItTouchesSky: the first three fast ingresses of the window. */
    fun touchesSky(culture: AncientCulture, ingresses: List<SkyEvent>): String {
        if (ingresses.isEmpty()) return "No fast planet changes sign this month; the season holds its shape."
        return ingresses.take(3).joinToString(" ") {
            val deity = DeityRegistry.getDeity(culture, it.body).name
            "$deity enters the ${properCase(SharedFormat.signPhrase(it.sign))} on ${dayMonth(it.date)}."
        }
    }

    /** web's ingressSentence: "Ra is ferried into the Scales.", the prose under an ingress row. */
    fun ingressSentence(culture: AncientCulture, planet: Planet, sign: ZodiacSign): String =
        "${DeityRegistry.getDeity(culture, planet).name} ${ingressVerb(culture)} the ${properCase(SharedFormat.signPhrase(sign))}."

    /** A Moon quarter's name in the catalog (common.moon.*), by the library's quarter index. */
    private fun quarterName(quarter: Int): String = when (quarter) {
        0 -> SharedStrings.COMMON_MOON_NEW_MOON
        1 -> SharedStrings.COMMON_MOON_FIRST_QUARTER
        2 -> SharedStrings.COMMON_MOON_FULL_MOON
        else -> SharedStrings.COMMON_MOON_LAST_QUARTER
    }

    /**
     * web's buildSeasonSkyRows, the board's event set (table row
     * season.sky.row): the Sun's ingress that opens the season and the one
     * that closes it, the Moon's quarters, the ingresses of Mercury, Venus and
     * Mars, the stations both ways and the eclipses, in date order. Ingress
     * rows carry web's ingress sentence.
     */
    fun skyRows(
        engine: AstronomyEngine,
        culture: AncientCulture,
        window: SkyEvents.SeasonWindow,
        phases: List<Triple<Date, Int, ZodiacSign>>,
        ingresses: List<SkyEvent>,
        stations: List<SkyEvent>,
        eclipses: List<Triple<Date, Boolean, Double>>,
    ): List<SeasonSkyRow> {
        fun ingress(date: Date, planet: Planet, sign: ZodiacSign) = SeasonSkyRow(
            date,
            SharedStrings.fill(
                SharedStrings.SEASON_SKY_EVENT_INGRESS,
                mapOf("planet" to SharedFormat.planetName(planet), "sign" to SharedFormat.signFull(sign)),
            ),
            ingressSentence(culture, planet, sign),
            SeasonRowTone.DIM,
        )
        val rows = mutableListOf(ingress(window.start, Planet.SUN, window.sign))
        phases.forEach { (date, quarter, sign) ->
            rows += SeasonSkyRow(
                date,
                SharedStrings.fill(
                    SharedStrings.SEASON_SKY_EVENT_PHASE,
                    mapOf("phase" to quarterName(quarter), "sign" to SharedFormat.signFull(sign)),
                ),
                null,
                SeasonRowTone.DIM,
            )
        }
        ingresses.forEach { rows += ingress(it.date, it.body, it.sign) }
        stations.forEach {
            val retro = it.kind == SkyEventKind.RETROGRADE
            rows += SeasonSkyRow(
                it.date,
                SharedStrings.fill(
                    if (retro) SharedStrings.SEASON_SKY_EVENT_RETROGRADE else SharedStrings.SEASON_SKY_EVENT_DIRECT,
                    mapOf("planet" to SharedFormat.planetName(it.body)),
                ),
                null,
                if (retro) SeasonRowTone.CONFLICT else SeasonRowTone.HARMONY,
            )
        }
        eclipses.forEach { (date, lunar, _) ->
            // web reads the Moon's sign at a lunar eclipse's peak and the Sun's at a solar one.
            val sign = ZodiacSign.entries[signIndex(longitude(engine, if (lunar) Planet.MOON else Planet.SUN, date))]
            rows += SeasonSkyRow(
                date,
                SharedStrings.fill(
                    if (lunar) SharedStrings.SEASON_SKY_EVENT_ECLIPSE_LUNAR else SharedStrings.SEASON_SKY_EVENT_ECLIPSE_SOLAR,
                    mapOf("sign" to SharedFormat.signFull(sign)),
                ),
                null,
                SeasonRowTone.CONFLICT,
            )
        }
        rows += ingress(window.end, Planet.SUN, ZodiacSign.entries[(window.sign.ordinal + 1) % 12])
        return rows.sortedBy { it.date.time }
    }

    /** One body's geocentric longitude, as DayDecreeComposer.chartAt reads each. */
    private fun longitude(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(date.time / 86_400_000.0 + 2440587.5, TransitSpans.bodyOf(body)).longitude

    private fun signIndex(longitude: Double): Int = ((((longitude % 360.0) + 360.0) % 360.0) / 30.0).toInt() % 12

    /** F3 `date.dayMonth`, "3 OCT", on the local calendar. */
    fun dayMonth(date: Date): String = SharedFormat.dayMonth(date)
}
