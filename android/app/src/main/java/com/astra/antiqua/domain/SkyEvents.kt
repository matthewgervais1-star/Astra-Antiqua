package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Time
import io.github.cosinekitty.astronomy.searchMoonQuarter
import io.github.cosinekitty.astronomy.nextMoonQuarter
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.floor

/**
 * What the sky does on its own, apart from any birth chart: a body changing
 * sign, a body turning retrograde or direct, and the Moon's quarters.
 *
 * Ported from the finders in web/src/lib/yearForecast.ts. Each uses the same
 * sampling cadence web uses, because the cadence is what decides whether a
 * fast body's ingress is found at all: sampling Mercury every fortnight would
 * miss most of them.
 */
enum class SkyEventKind { INGRESS, RETROGRADE, DIRECT, MOON_QUARTER }

data class SkyEvent(
    val kind: SkyEventKind,
    val date: Date,
    val body: Planet,
    val sign: ZodiacSign,
    /** The sign a body left, on an ingress. */
    val fromSign: ZodiacSign? = null,
    /** "New Moon", "First Quarter" and the rest, on a quarter. */
    val quarter: String? = null,
)

object SkyEvents {
    private const val MS_PER_DAY = 86_400_000L

    private val QUARTER_NAMES =
        listOf("New Moon", "First Quarter", "Full Moon", "Last Quarter")

    /**
     * Bodies that visibly retrograde. The Sun and Moon never do as seen from
     * Earth, so asking about them would only find floating-point noise.
     */
    private val RETROGRADE_BODIES = Planet.entries.filter {
        it != Planet.SUN && it != Planet.MOON
    }

    /** How often a body must be sampled for a sign change not to slip past. */
    private fun ingressStepDays(body: Planet): Int = when (body) {
        Planet.MOON -> 1
        Planet.SUN, Planet.MERCURY, Planet.VENUS -> 2
        Planet.MARS -> 5
        Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO -> 20
        else -> 14
    }

    private fun stationStepDays(body: Planet): Int = when (body) {
        Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO -> 5
        Planet.SATURN, Planet.JUPITER -> 3
        else -> 1
    }

    private fun julianDayOf(date: Date): Double = date.time / 86_400_000.0 + 2440587.5

    private fun longitudeAt(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(julianDayOf(date), TransitSpans.bodyOf(body)).longitude

    private fun velocityAt(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(julianDayOf(date), TransitSpans.bodyOf(body)).velocity

    private fun signIndexOf(longitude: Double): Int =
        floor((((longitude % 360.0) + 360.0) % 360.0) / 30.0).toInt() % 12

    private fun signOf(longitude: Double): ZodiacSign = ZodiacSign.entries[signIndexOf(longitude)]

    /** Every sign change in the window, for the bodies asked about. */
    fun ingresses(
        engine: AstronomyEngine,
        start: Date,
        days: Int,
        bodies: List<Planet>,
    ): List<SkyEvent> {
        val out = mutableListOf<SkyEvent>()
        for (body in bodies) {
            val step = ingressStepDays(body)
            var prevDate = start
            var prevIndex = signIndexOf(longitudeAt(engine, body, prevDate))
            var d = step
            while (d <= days) {
                val next = Date(start.time + d.toLong() * MS_PER_DAY)
                val nextIndex = signIndexOf(longitudeAt(engine, body, next))
                if (nextIndex != prevIndex) {
                    val exact = bisectIngress(engine, body, prevDate, next)
                    out += SkyEvent(
                        kind = SkyEventKind.INGRESS,
                        date = exact,
                        body = body,
                        sign = signOf(longitudeAt(engine, body, next)),
                        fromSign = signOf(longitudeAt(engine, body, prevDate)),
                    )
                }
                prevDate = next
                prevIndex = nextIndex
                d += step
            }
        }
        return out.sortedBy { it.date.time }
    }

    /** Every turn from direct to retrograde and back, in the window. */
    fun stations(engine: AstronomyEngine, start: Date, days: Int): List<SkyEvent> {
        val out = mutableListOf<SkyEvent>()
        for (body in RETROGRADE_BODIES) {
            val step = stationStepDays(body)
            var prevDate = start
            var prevVelocity = velocityAt(engine, body, prevDate)
            var d = step
            while (d <= days) {
                val date = Date(start.time + d.toLong() * MS_PER_DAY)
                val velocity = velocityAt(engine, body, date)
                if (prevVelocity * velocity < 0) {
                    val exact = bisectStation(engine, body, prevDate, date)
                    out += SkyEvent(
                        kind = if (prevVelocity > 0) {
                            SkyEventKind.RETROGRADE
                        } else {
                            SkyEventKind.DIRECT
                        },
                        date = exact,
                        body = body,
                        sign = signOf(longitudeAt(engine, body, exact)),
                    )
                }
                prevDate = date
                prevVelocity = velocity
                d += step
            }
        }
        return out.sortedBy { it.date.time }
    }

    /** The Moon's quarters, from the library's own search rather than a walk. */
    fun moonQuarters(engine: AstronomyEngine, start: Date, days: Int): List<SkyEvent> {
        val end = Date(start.time + days.toLong() * MS_PER_DAY)
        val out = mutableListOf<SkyEvent>()
        var quarter = searchMoonQuarter(timeOf(start))
        // A quarter every seven days or so; the bound is generous and stops a
        // library change from spinning here.
        repeat(days / 7 + 4) {
            val date = dateOf(quarter.time)
            if (date.time >= end.time) return out
            out += SkyEvent(
                kind = SkyEventKind.MOON_QUARTER,
                date = date,
                body = Planet.MOON,
                sign = signOf(longitudeAt(engine, Planet.MOON, date)),
                quarter = QUARTER_NAMES.getOrElse(quarter.quarter) { "New Moon" },
            )
            quarter = nextMoonQuarter(quarter)
        }
        return out
    }

    /** The window the Sun's current sign defines, and where today sits in it. */
    data class SeasonWindow(
        val sign: ZodiacSign,
        val start: Date,
        val end: Date,
        val dayOfSeason: Int,
        val totalDays: Int,
    )

    /**
     * The Sun's sign is the season. Its boundaries are found by walking to the
     * ingress either side rather than by assuming thirty days, because the
     * signs are not equal in time: the Sun takes longer through some of them.
     */
    fun currentSeason(engine: AstronomyEngine, date: Date): SeasonWindow {
        val sign = signOf(longitudeAt(engine, Planet.SUN, date))
        var start = date
        while (signOf(longitudeAt(engine, Planet.SUN, Date(start.time - MS_PER_DAY))) == sign) {
            start = Date(start.time - MS_PER_DAY)
            if (date.time - start.time > 40L * MS_PER_DAY) break
        }
        start = bisectIngress(engine, Planet.SUN, Date(start.time - MS_PER_DAY), start)

        var end = date
        while (signOf(longitudeAt(engine, Planet.SUN, Date(end.time + MS_PER_DAY))) == sign) {
            end = Date(end.time + MS_PER_DAY)
            if (end.time - date.time > 40L * MS_PER_DAY) break
        }
        end = bisectIngress(engine, Planet.SUN, end, Date(end.time + MS_PER_DAY))

        val total = (localDayIndex(start, end) + 1).coerceAtLeast(1)
        val day = (localDayIndex(start, date) + 1).coerceIn(1, total)
        return SeasonWindow(sign, start, end, day, total)
    }

    /**
     * Local calendar days between two instants. The screen prints the counter
     * beside locale-formatted dates, so day one has to be the day the ingress
     * renders as rather than the first twenty-four hours after it.
     */
    private fun localDayIndex(from: Date, to: Date): Int {
        val a = Calendar.getInstance().apply {
            time = from
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        val b = Calendar.getInstance().apply {
            time = to
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        return Math.round((b.timeInMillis - a.timeInMillis) / MS_PER_DAY.toDouble()).toInt()
    }

    private fun bisectIngress(
        engine: AstronomyEngine,
        body: Planet,
        lo: Date,
        hi: Date,
    ): Date {
        var loTime = lo.time
        var hiTime = hi.time
        val loIndex = signIndexOf(longitudeAt(engine, body, lo))
        repeat(40) {
            val mid = (loTime + hiTime) / 2
            val midIndex = signIndexOf(longitudeAt(engine, body, Date(mid)))
            if (midIndex == loIndex) loTime = mid else hiTime = mid
            if (hiTime - loTime < 60_000) return Date(hiTime)
        }
        return Date(hiTime)
    }

    private fun bisectStation(
        engine: AstronomyEngine,
        body: Planet,
        lo: Date,
        hi: Date,
    ): Date {
        var loTime = lo.time
        var hiTime = hi.time
        val loVelocity = velocityAt(engine, body, lo)
        repeat(40) {
            val mid = (loTime + hiTime) / 2
            val midVelocity = velocityAt(engine, body, Date(mid))
            if (loVelocity * midVelocity > 0) loTime = mid else hiTime = mid
            if (hiTime - loTime < 60_000) return Date((loTime + hiTime) / 2)
        }
        return Date((loTime + hiTime) / 2)
    }

    private fun timeOf(date: Date): Time = Time(julianDayOf(date) - 2451545.0)

    private fun dateOf(time: Time): Date {
        val millis = ((time.ut + 2451545.0) - 2440587.5) * 86_400_000.0
        return Date(millis.toLong())
    }
}
