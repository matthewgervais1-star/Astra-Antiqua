package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Body
import java.util.Date
import kotlin.math.abs
import kotlin.math.floor

/**
 * A long transit as a SPAN rather than a moment: the stretch during which a
 * slow body holds within [SPAN_ORB] degrees of exact against a natal point,
 * with every exact pass, retrograde returns included, inside it.
 *
 * Ported from web/src/lib/transitSpans.ts and the findMajorTransits walk in
 * web/src/lib/yearForecast.ts, rule for rule, so a reader who opens both
 * surfaces against the same birth record sees the same spans on the same
 * dates. The three-degree rule is what the method page publishes; it is
 * named once, here, rather than re-derived per screen.
 */
data class TransitSpan(
    /** "jupiter-square-sun": the id a detail screen is opened by. */
    val id: String,
    val transitPlanet: Planet,
    val natalKey: String,
    val natalLongitude: Double,
    val aspect: AspectType,
    val start: Date,
    val end: Date,
    val passes: List<Date>,
    val transitSign: ZodiacSign,
    val transitDegree: Double,
)

/** A natal point a transit can be measured against. */
data class NatalPoint(val key: String, val longitude: Double)

/**
 * One exact pass of a moving body over an aspect to a natal point, web's
 * NatalTransitPeak. The season reads these as dated beats; a span groups them.
 */
data class TransitPeak(
    val transitPlanet: Planet,
    val natalKey: String,
    val natalLongitude: Double,
    val aspect: AspectType,
    val date: Date,
    val transitSign: ZodiacSign,
    val transitDegree: Double,
)

/** The natal Sun, Moon, Ascendant and Midheaven, the points the long transits are walked against, in web's order. */
fun natalPointsOf(chart: NatalChartData): List<NatalPoint> = buildList {
    chart.planets[Planet.SUN]?.let { add(NatalPoint("sun", it.longitude)) }
    chart.planets[Planet.MOON]?.let { add(NatalPoint("moon", it.longitude)) }
    add(NatalPoint("asc", chart.ascendant))
    add(NatalPoint("mc", chart.midheaven))
}

/**
 * The five slow bodies. Anything faster crosses a natal degree so often that
 * a span stops meaning anything.
 */
val SLOW_BODIES: List<Planet> = listOf(
    Planet.JUPITER,
    Planet.SATURN,
    Planet.URANUS,
    Planet.NEPTUNE,
    Planet.PLUTO,
)

object TransitSpans {
    /** Degrees either side of exact that a span still counts inside. */
    const val SPAN_ORB = 3.0

    private const val MS_PER_DAY = 86_400_000L
    private const val WALK_STEP_DAYS = 5
    private const val WALK_CAP_DAYS = 700

    /** The outers move so little per day that an eight-day sample misses nothing. */
    private const val SLOW_SAMPLE_DAYS = 8
    private const val FAST_SAMPLE_DAYS = 2

    fun bodyOf(planet: Planet): Body = when (planet) {
        Planet.SUN -> Body.Sun
        Planet.MOON -> Body.Moon
        Planet.MERCURY -> Body.Mercury
        Planet.VENUS -> Body.Venus
        Planet.MARS -> Body.Mars
        Planet.JUPITER -> Body.Jupiter
        Planet.SATURN -> Body.Saturn
        Planet.URANUS -> Body.Uranus
        Planet.NEPTUNE -> Body.Neptune
        Planet.PLUTO -> Body.Pluto
    }

    /**
     * Group every exact pass into spans. A slow body triple-hits a degree
     * across its retrogradation; those passes share one span, which is the
     * whole point of reading a transit as a stretch rather than a date.
     */
    fun compute(
        engine: AstronomyEngine,
        natalPoints: List<NatalPoint>,
        transitPlanets: List<Planet>,
        start: Date,
        days: Int,
    ): List<TransitSpan> {
        val peaks = peaks(engine, natalPoints, transitPlanets, start, days)
        val groups = LinkedHashMap<String, MutableList<TransitPeak>>()
        for (peak in peaks) {
            val id = "${peak.transitPlanet.name.lowercase()}-${peak.aspect.name.lowercase()}-${peak.natalKey}"
            groups.getOrPut(id) { mutableListOf() }.add(peak)
        }

        return groups.map { (id, group) ->
            group.sortBy { it.date.time }
            val first = group.first()
            val last = group.last()
            TransitSpan(
                id = id,
                transitPlanet = first.transitPlanet,
                natalKey = first.natalKey,
                natalLongitude = first.natalLongitude,
                aspect = first.aspect,
                start = walkEdge(engine, first, first.date, -1),
                end = walkEdge(engine, last, last.date, 1),
                passes = group.map { it.date },
                transitSign = first.transitSign,
                transitDegree = first.transitDegree,
            )
        }.sortedBy { it.start.time }
    }

    private fun longitudeAt(engine: AstronomyEngine, planet: Planet, date: Date): Double =
        engine.getPlanetPosition(julianDayOf(date), bodyOf(planet)).longitude

    private fun julianDayOf(date: Date): Double = date.time / 86_400_000.0 + 2440587.5

    private fun normalize360(angle: Double): Double {
        val a = angle % 360.0
        return if (a < 0) a + 360.0 else a
    }

    private fun signedDiff(longitude: Double, target: Double): Double {
        var diff = longitude - target
        while (diff > 180.0) diff -= 360.0
        while (diff < -180.0) diff += 360.0
        return diff
    }

    private fun angularSeparation(a: Double, b: Double): Double {
        val raw = abs(a - b) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    /**
     * Walk out from an exact pass until the body leaves the orb. Capped, so a
     * body that barely moves cannot walk the loop forever.
     */
    private fun walkEdge(engine: AstronomyEngine, peak: TransitPeak, from: Date, direction: Int): Date {
        var edge = from
        var step = 1
        while (step * WALK_STEP_DAYS <= WALK_CAP_DAYS) {
            val probe = Date(from.time + direction.toLong() * step * WALK_STEP_DAYS * MS_PER_DAY)
            val lon = longitudeAt(engine, peak.transitPlanet, probe)
            val distance = abs(angularSeparation(lon, peak.natalLongitude) - peak.aspect.degree)
            if (distance > SPAN_ORB) break
            edge = probe
            step += 1
        }
        return edge
    }

    /**
     * For each transit planet, natal point and aspect angle, sample forward
     * and look for a sign change in the signed difference from the target
     * longitude. A crossing is then narrowed by bisection and confirmed
     * against the angle to half a degree, so a wraparound cannot be mistaken
     * for a hit. Web's findMajorTransits, in date order.
     */
    fun peaks(
        engine: AstronomyEngine,
        natalPoints: List<NatalPoint>,
        transitPlanets: List<Planet>,
        start: Date,
        days: Int,
    ): List<TransitPeak> {
        val out = mutableListOf<TransitPeak>()
        for (planet in transitPlanets) {
            val sampleDays = if (planet.isReceived) SLOW_SAMPLE_DAYS else FAST_SAMPLE_DAYS
            for (point in natalPoints) {
                for (aspect in AspectType.entries) {
                    val targets = if (aspect.degree == 0.0 || aspect.degree == 180.0) {
                        listOf(normalize360(point.longitude + aspect.degree))
                    } else {
                        listOf(
                            normalize360(point.longitude + aspect.degree),
                            normalize360(point.longitude - aspect.degree),
                        )
                    }
                    for (target in targets) {
                        var prevDate = start
                        var prevDiff = signedDiff(longitudeAt(engine, planet, prevDate), target)
                        var d = sampleDays
                        while (d <= days) {
                            val date = Date(start.time + d.toLong() * MS_PER_DAY)
                            val lon = longitudeAt(engine, planet, date)
                            val diff = signedDiff(lon, target)
                            if (prevDiff * diff < 0 && abs(prevDiff - diff) < 30.0) {
                                val exact = bisect(engine, planet, target, prevDate, date)
                                val lonAtExact = longitudeAt(engine, planet, exact)
                                val separation = angularSeparation(lonAtExact, point.longitude)
                                if (abs(separation - aspect.degree) < 0.5) {
                                    out += TransitPeak(
                                        transitPlanet = planet,
                                        natalKey = point.key,
                                        natalLongitude = point.longitude,
                                        aspect = aspect,
                                        date = exact,
                                        transitSign = signOf(lonAtExact),
                                        transitDegree = lonAtExact - floor(lonAtExact / 30.0) * 30.0,
                                    )
                                }
                            }
                            prevDate = date
                            prevDiff = diff
                            d += sampleDays
                        }
                    }
                }
            }
        }
        return out.sortedBy { it.date.time }
    }

    private fun bisect(
        engine: AstronomyEngine,
        planet: Planet,
        target: Double,
        lo: Date,
        hi: Date,
    ): Date {
        var loTime = lo.time
        var hiTime = hi.time
        val loDiff = signedDiff(longitudeAt(engine, planet, lo), target)
        repeat(32) {
            val mid = (loTime + hiTime) / 2
            val midDiff = signedDiff(longitudeAt(engine, planet, Date(mid)), target)
            if (loDiff * midDiff <= 0) hiTime = mid else loTime = mid
            if (hiTime - loTime < 60_000) return Date((loTime + hiTime) / 2)
        }
        return Date((loTime + hiTime) / 2)
    }

    private fun signOf(longitude: Double): ZodiacSign {
        val index = (floor(normalize360(longitude) / 30.0).toInt()) % 12
        return ZodiacSign.entries[index]
    }
}
