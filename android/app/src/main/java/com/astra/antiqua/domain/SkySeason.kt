package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.roundToInt

/** A dated row of THE SEASON'S SKY, web's SeasonSkyRow: the date's ink follows the tone. */
data class SeasonSkyRow(val date: Date, val label: String, val tone: SeasonRowTone)

enum class SeasonRowTone { CONFLICT, HARMONY, DIM }

/**
 * The house the season's sign takes in the reader's chart: the board's title
 * ("The eleventh house · The Assembly") and the web's sentence.
 */
data class SeasonHouse(val house: Int, val ordinal: String, val title: String, val prose: String)

/** Sky Season, composed: what the board's sections print, from the web's season page. */
data class SkySeason(
    val window: SkyEvents.SeasonWindow,
    val daysRemaining: Int,
    /** The Sun's longitude at the instant read, for the wheel's mark. */
    val sun: Double,
    /** web's NaveHead title, "THE SEASON OF THE SCALES". */
    val headline: String,
    /** web's line under the bar, "DAY 29 OF 31 · CLOSING". */
    val status: String,
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

    /** web's SIGN_PHRASES (`components/horizons/signPhrase.ts`). */
    val SIGN_PHRASES: Map<ZodiacSign, String> = mapOf(
        ZodiacSign.ARIES to "RAM",
        ZodiacSign.TAURUS to "BULL",
        ZodiacSign.GEMINI to "TWINS",
        ZodiacSign.CANCER to "CRAB",
        ZodiacSign.LEO to "LION",
        ZodiacSign.VIRGO to "MAIDEN",
        ZodiacSign.LIBRA to "SCALES",
        ZodiacSign.SCORPIO to "SCORPION",
        ZodiacSign.SAGITTARIUS to "ARCHER",
        ZodiacSign.CAPRICORN to "GOAT",
        ZodiacSign.AQUARIUS to "WATER-BEARER",
        ZodiacSign.PISCES to "FISHES",
    )

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

    /** web's SLOW_BODIES (`lib/yearForecast.ts`). */
    private val SLOW_BODIES = listOf(Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO)

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
        val ingresses = SkyEvents.ingresses(engine, window.start, days, INGRESS_BODIES).filter { it.date.time <= window.end.time }
        val sun = DayDecreeComposer.chartAt(engine, now).getValue(Planet.SUN)
        val status = status(window.totalDays, window.dayOfSeason, remaining)
        val standouts = SeasonStandouts.build(engine, culture, window, natal)
        val startYear = Calendar.getInstance().apply { time = window.start }.get(Calendar.YEAR)
        return SkySeason(
            window = window,
            daysRemaining = remaining,
            sun = sun,
            headline = "THE SEASON OF THE ${SIGN_PHRASES.getValue(window.sign)}",
            status = "DAY ${window.dayOfSeason} OF ${window.totalDays} · $status",
            barPercent = barPercent(remaining, window.totalDays),
            signProse = Learn.SIGNS.first { it.sign == window.sign.signName }.blurb,
            ascendant = ascendant,
            house = ascendant?.let { house(culture, window.sign, it) },
            touchesSky = touchesSky(culture, ingresses),
            rows = skyRows(engine, culture, window, stations),
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

    /** web's getSeasonHouse with composeWhatItTouchesNatal; the title is the board's form. */
    fun house(culture: AncientCulture, sign: ZodiacSign, ascendant: Double): SeasonHouse {
        val number = FigureReadingComposer.wholeSignHouse(sign.ordinal * 30.0 + 15.0, ascendant)
        val meaning = HouseMeanings.get(number)
        val ordinal = meaning.ordinal.lowercase()
        val group = HOUSE_GROUPS.getValue(culture)[FigureReadingComposer.houseGroupIndex(number)].lowercase()
        val arena = meaning.arena.replaceFirstChar { it.lowercase() }
        return SeasonHouse(
            house = number,
            ordinal = ordinal,
            title = "The $ordinal house · ${meaning.title}",
            prose = "The season sits in your $ordinal house, which this culture keeps under $group. It works on $arena.",
        )
    }

    /** web's composeWhatItTouchesSky: the first three fast ingresses of the window. */
    fun touchesSky(culture: AncientCulture, ingresses: List<SkyEvent>): String {
        if (ingresses.isEmpty()) return "No fast planet changes sign this month; the season holds its shape."
        return ingresses.take(3).joinToString(" ") {
            val deity = DeityRegistry.getDeity(culture, it.body).name
            "$deity enters the ${properCase(SIGN_PHRASES.getValue(it.sign))} on ${dayMonth(it.date)}."
        }
    }

    /**
     * web's buildSeasonSkyRows: the season's open and close, every turn to
     * retrograde inside it, and the closest approach of a slow body that sits
     * in the sign when the season opens, if the Sun comes within 3° of it.
     */
    fun skyRows(engine: AstronomyEngine, culture: AncientCulture, window: SkyEvents.SeasonWindow, stations: List<SkyEvent>): List<SeasonSkyRow> {
        val sunDeity = DeityRegistry.getDeity(culture, Planet.SUN).name.uppercase()
        val rows = mutableListOf(
            SeasonSkyRow(window.start, "$sunDeity → THE ${SIGN_PHRASES.getValue(window.sign)} · SEASON OPENS", SeasonRowTone.DIM),
        )
        stations.filter { it.kind == SkyEventKind.RETROGRADE }.forEach {
            rows += SeasonSkyRow(it.date, "${DeityRegistry.getDeity(culture, it.body).name.uppercase()} STATIONED ℞", SeasonRowTone.CONFLICT)
        }
        val span = minOf(60, ((window.end.time - window.start.time).toDouble() / DAY_MS).roundToInt() + 1)
        for (body in SLOW_BODIES) {
            val startSign = ZodiacSign.entries[signIndex(longitude(engine, body, window.start))]
            if (startSign != window.sign) continue
            var best: Pair<Date, Double>? = null
            for (d in 0..span) {
                val date = Date(window.start.time + d * DAY_MS)
                if (date.time > window.end.time) break
                val raw = abs(longitude(engine, Planet.SUN, date) - longitude(engine, body, date)) % 360.0
                val sep = if (raw > 180) 360 - raw else raw
                if (best == null || sep < best.second) best = date to sep
            }
            best?.takeIf { it.second <= 3 }?.let { (date, sep) ->
                val deity = DeityRegistry.getDeity(culture, body).name.uppercase()
                rows += SeasonSkyRow(date, "$sunDeity ☌ $deity${if (sep < 1) " EXACT" else ""}", SeasonRowTone.HARMONY)
            }
        }
        val close = ZodiacSign.entries[(window.sign.ordinal + 1) % 12]
        rows += SeasonSkyRow(window.end, "$sunDeity → THE ${SIGN_PHRASES.getValue(close)} · SEASON CLOSES", SeasonRowTone.DIM)
        return rows.sortedBy { it.date.time }
    }

    /** One body's geocentric longitude, as DayDecreeComposer.chartAt reads each. */
    private fun longitude(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(date.time / 86_400_000.0 + 2440587.5, TransitSpans.bodyOf(body)).longitude

    private fun signIndex(longitude: Double): Int = ((((longitude % 360.0) + 360.0) % 360.0) / 30.0).toInt() % 12

    /** web's formatDayMonth, "3 OCT", on the local calendar. */
    fun dayMonth(date: Date): String {
        val c = Calendar.getInstance().apply { time = date }
        return "${c.get(Calendar.DAY_OF_MONTH)} ${SkyWeekComposer.MONTHS[c.get(Calendar.MONTH)]}"
    }
}
