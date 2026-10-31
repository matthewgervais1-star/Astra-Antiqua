package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Time
import io.github.cosinekitty.astronomy.searchMoonPhase
import java.util.Date
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.roundToInt

/** THE SKY, COMPUTED: the Moon's phase now and the next quarter, from web/src/lib/moonPhase.ts. */
data class MoonToday(
    /** "Waxing Gibbous". */
    val phase: String,
    /** 0 to 100, (1 - cos angle) / 2 as web computes it. */
    val percentLit: Int,
    /** The next quarter's name, "Full Moon" while waxing gibbous. */
    val nextName: String,
    /** Null when the library's search finds no quarter within 40 days; the line is then left out. */
    val nextDate: Date?,
)

/**
 * One house group's lead contact, as web's dayPressure reads it
 * (web/src/lib/dayPressure.ts): the transiting body, the natal body it
 * touches, the aspect and orb, and the web's sentence for it.
 */
data class ChartContact(
    val transit: Planet,
    val natal: Planet,
    val aspect: AspectType,
    val orb: Double,
    /** "Isis rows in time with your Amun in the eleventh. It touches …". */
    val sentence: String,
)

/** THE LONG TRANSIT: the span web's buildLongTransit picks, and how far through it today sits. */
data class LongTransitPick(val span: TransitSpan, val active: Boolean, val progress: Float)

/** Everything Sky Day prints, for one culture at one instant. */
data class SkyDay(
    val date: Date,
    val decree: DayDecree,
    /** The god the headline speaks of, for the glyph above it; null on a quiet day. */
    val headlineBody: Planet?,
    val moon: MoonToday,
    val season: SkyEvents.SeasonWindow,
    /** The house groups' lead contacts, in web's group order; null without a chart. */
    val contacts: List<ChartContact>?,
    /** Null without a chart, or when no slow body holds within reach of it. */
    val longTransit: LongTransitPick?,
)

/**
 * Sky Day's content: web's day page (composeDayPage, read at 00:00 UTC), the
 * Moon and the season at the instant itself, web's "where the day falls"
 * contacts and web's long-transit pick. The board's own forms (the kicker
 * date, the data lines) are drawn by the screen from these numbers.
 */
object SkyDayComposer {
    private const val DAY_MS = 86_400_000L

    /** web buildLongTransit: spans walked from 420 days back over 1200 days. */
    private const val LOOKBACK_DAYS = 420L
    private const val WINDOW_DAYS = 1200

    private val ORDINAL_WORDS = listOf(
        "first", "second", "third", "fourth", "fifth", "sixth",
        "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth",
    )

    private fun normalize(v: Double): Double = ((v % 360.0) + 360.0) % 360.0

    /** web moonPhase.ts nameForAngle. */
    fun phaseName(angle: Double): String {
        val a = normalize(angle)
        return when {
            a < 22.5 -> "New Moon"
            a < 67.5 -> "Waxing Crescent"
            a < 112.5 -> "First Quarter"
            a < 157.5 -> "Waxing Gibbous"
            a < 202.5 -> "Full Moon"
            a < 247.5 -> "Waning Gibbous"
            a < 292.5 -> "Last Quarter"
            a < 337.5 -> "Waning Crescent"
            else -> "New Moon"
        }
    }

    /** web moonPhase.ts computeMoonPhase: the phase angle from the geocentric ecliptic longitudes. */
    fun moonToday(engine: AstronomyEngine, date: Date): MoonToday {
        val sky = DayDecreeComposer.chartAt(engine, date)
        val angle = normalize(sky.getValue(Planet.MOON) - sky.getValue(Planet.SUN))
        val lit = (1 - cos(Math.toRadians(angle))) / 2
        val (target, name) = when {
            angle < 90 -> 90.0 to "First Quarter"
            angle < 180 -> 180.0 to "Full Moon"
            angle < 270 -> 270.0 to "Last Quarter"
            else -> 0.0 to "New Moon"
        }
        // Time counts UT days from J2000 (2451545.0); the Unix epoch is JD 2440587.5.
        val start = Time(date.time / DAY_MS.toDouble() + 2440587.5 - 2451545.0)
        val next = searchMoonPhase(target, start, 40.0)
        return MoonToday(
            phase = phaseName(angle),
            percentLit = (lit * 100).roundToInt(),
            nextName = name,
            nextDate = next?.let { Date(((it.ut + 2451545.0 - 2440587.5) * DAY_MS).toLong()) },
        )
    }

    /**
     * web dayPressure: today's transits to the chart bucketed by the
     * whole-sign house of the natal point they touch, into the four house
     * groups; each group with a contact reads the one rankContacts puts first.
     * Groups nothing touches are left out: Sky Day lists contacts only.
     */
    fun contacts(culture: AncientCulture, sky: Map<Planet, Double>, natal: NatalPoints): List<ChartContact> {
        val hits = DayPermissionsComposer.transits(sky, natal.chart)
        return (0 until 4).mapNotNull { group ->
            val lead = hits
                .filter {
                    FigureReadingComposer.houseGroupIndex(
                        FigureReadingComposer.wholeSignHouse(natal.chart.getValue(it.b), natal.ascendant),
                    ) == group
                }
                .sortedWith(
                    compareBy<SkyFigure>(
                        { if (it.a == Planet.MOON && it.b == Planet.MOON) 1 else 0 },
                        { if (it.a in DayDecreeComposer.FAST_ORDER) 0 else 1 },
                        { if (it.a == it.b) 1 else 0 },
                        { it.orb },
                    ),
                )
                .firstOrNull() ?: return@mapNotNull null
            val house = FigureReadingComposer.wholeSignHouse(natal.chart.getValue(lead.b), natal.ascendant)
            val t = DeityRegistry.getDeity(culture, lead.a).name
            val n = DeityRegistry.getDeity(culture, lead.b).name
            val verb = AspectVerbs.of(culture, lead.aspect)
            val sentence = "$t $verb your $n in the ${ORDINAL_WORDS[house - 1]}. It touches ${HouseMeanings.get(house).arena}."
            ChartContact(lead.a, lead.b, lead.aspect, lead.orb, sentence)
        }
    }

    /** How far [span]'s body sits from exact today: web currentOrbForSpan. */
    private fun currentOrb(span: TransitSpan, sky: Map<Planet, Double>): Double {
        val diff = abs(normalize(sky.getValue(span.transitPlanet) - span.natalLongitude))
        val separation = if (diff > 180) 360 - diff else diff
        return abs(separation - span.aspect.degree)
    }

    /**
     * web buildLongTransit: of the spans open today, the one closest to exact
     * now; when none is open, the next to open. Walked against the Sun, Moon
     * and rising as the Transits tab is (web adds the midheaven, which the
     * Android Transits tab does not list, so a card could not open it).
     * [sky] is the day page's sky at 00:00 UTC, web's todayChart.
     */
    fun longTransit(engine: AstronomyEngine, chart: NatalChartData, now: Date, sky: Map<Planet, Double>): LongTransitPick? {
        val spans = TransitSpans.compute(
            engine = engine,
            natalPoints = natalPointsOf(chart),
            transitPlanets = SLOW_BODIES,
            start = Date(now.time - LOOKBACK_DAYS * DAY_MS),
            days = WINDOW_DAYS,
        )
        if (spans.isEmpty()) return null
        val active = spans.filter { it.start.time <= now.time && now.time <= it.end.time }
        val chosen = if (active.isNotEmpty()) {
            active.minBy { currentOrb(it, sky) }
        } else {
            spans.filter { it.start.time > now.time }.minByOrNull { it.start.time } ?: return null
        }
        val length = (chosen.end.time - chosen.start.time).toFloat()
        val progress = if (length > 0) ((now.time - chosen.start.time) / length).coerceIn(0f, 1f) else 0f
        return LongTransitPick(chosen, active.isNotEmpty(), progress)
    }

    fun compose(engine: AstronomyEngine, culture: AncientCulture, now: Date, chart: NatalChartData?): SkyDay {
        val day = Math.floorDiv(now.time, DAY_MS)
        val sky = DayDecreeComposer.chartAt(engine, Date(day * DAY_MS))
        val decree = DayDecreeComposer.compose(culture, sky, day)
        val top = decree.figures.firstOrNull()
        val natal = chart?.let { NatalPoints.of(it) }
        return SkyDay(
            date = now,
            decree = decree,
            headlineBody = top?.let { DayDecreeComposer.headlineBody(it.a, it.b).first },
            moon = moonToday(engine, now),
            season = SkyEvents.currentSeason(engine, now),
            contacts = natal?.let { contacts(culture, sky, it) },
            longTransit = chart?.let { longTransit(engine, it, now, sky) },
        )
    }
}
