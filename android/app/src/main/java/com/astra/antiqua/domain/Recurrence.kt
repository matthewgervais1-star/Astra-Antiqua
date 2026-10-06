package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.abs
import kotlin.math.roundToLong

/** The stretch a figure holds its orb. */
data class OrbWindow(val start: Date, val end: Date)

/** One tick of the four-tick timeline: where it sits, 0 to 100, and its labels. */
data class TimelineTick(val pct: Float, val label: String, val sub: String)

data class Timeline(val ticks: List<TimelineTick>, val presentPct: Float, val presentInside: Boolean)

/**
 * How often a figure comes round, and how long it holds. Ported from
 * web/src/lib/recurrence.ts: the transiting body's cycle (the Moon's sidereal
 * month, the Sun's year, Mercury's and Venus's synodic periods, the sidereal
 * periods beyond), once a cycle for a conjunction or an opposition and twice
 * for the others, said in words each calendar can say truthfully.
 */
object Recurrence {
    private const val YEAR = 365.25

    fun cycleDays(body: Planet): Double = when (body) {
        Planet.MOON -> 27.32
        Planet.SUN -> YEAR
        Planet.MERCURY -> 115.9
        Planet.VENUS -> 583.9
        Planet.MARS -> 687.0
        Planet.JUPITER -> 11.86 * YEAR
        Planet.SATURN -> 29.46 * YEAR
        Planet.URANUS -> 84.0 * YEAR
        Planet.NEPTUNE -> 164.8 * YEAR
        Planet.PLUTO -> 248.0 * YEAR
    }

    fun days(body: Planet, aspect: AspectType): Double =
        cycleDays(body) / if (aspect == AspectType.CONJUNCTION || aspect == AspectType.OPPOSITION) 1.0 else 2.0

    private val UNITS = listOf(
        "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
        "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen",
    )
    private val TENS = listOf("", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety")

    /** 1 to 999 in words. */
    fun numberWords(n: Int): String {
        require(n in 1..999) { "numberWords: $n" }
        val hundreds = n / 100
        val rest = n % 100
        val restWords = when {
            rest == 0 -> ""
            rest < 20 -> UNITS[rest]
            else -> TENS[rest / 10] + if (rest % 10 != 0) "-${UNITS[rest % 10]}" else ""
        }
        if (hundreds == 0) return restWords
        return if (restWords.isNotEmpty()) "${UNITS[hundreds]} hundred and $restWords" else "${UNITS[hundreds]} hundred"
    }

    /** JavaScript's Math.round: half rounds up. */
    private fun jsRound(x: Double): Int = Math.floor(x + 0.5).toInt()

    private const val MONTH_DAYS = 30.44

    /** "about every two months", in the culture's calendar words; see recurrence.ts. */
    fun interval(culture: AncientCulture, days: Double): String {
        if (days < 45) {
            val half = days < 20
            return when (culture) {
                AncientCulture.EGYPT -> if (half) "about every decan and a half" else "about every three decans"
                AncientCulture.ROME -> if (half) "about every ${numberWords(jsRound(days))} days" else "about once a month"
                else -> if (half) "about twice a month" else "about once a month"
            }
        }
        if (days < 330) {
            if (culture == AncientCulture.EGYPT && abs(days - 120) < 10) return "about once a season"
            return "about every ${numberWords(jsRound(days / MONTH_DAYS))} months"
        }
        if (days < 548) return "about once a year"
        if (days < 640) return "about every ${numberWords(jsRound(days / MONTH_DAYS))} months"
        return "about every ${numberWords(jsRound(days / YEAR))} years"
    }

    fun compose(culture: AncientCulture, body: Planet, aspect: AspectType): String =
        FigureBanks.recurrenceFrame(culture).replace("{interval}", interval(culture, days(body, aspect)))

    // --- the window in orb ---------------------------------------------------

    private const val HOUR_MS = 3_600_000L
    private const val DAY_MS = 86_400_000L
    const val WINDOW_STEP_HOURS = 6
    private const val WINDOW_CAP_DAYS = 400

    private fun separation(x: Double, y: Double): Double {
        val raw = abs(x - y) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    fun longitude(engine: AstronomyEngine, body: Planet, at: Date): Double =
        engine.getPlanetPosition(at.time / 86_400_000.0 + 2440587.5, TransitSpans.bodyOf(body)).longitude

    private fun walk(distance: (Date) -> Double, aspect: AspectType, instant: Date): OrbWindow {
        val step = WINDOW_STEP_HOURS * HOUR_MS
        val steps = (WINDOW_CAP_DAYS * DAY_MS + step - 1) / step
        fun edge(direction: Int): Date {
            var last = instant
            for (i in 1..steps) {
                val probe = Date(instant.time + direction * i * step)
                if (distance(probe) > aspect.orb) break
                last = probe
            }
            return last
        }
        return OrbWindow(edge(-1), edge(1))
    }

    /** The window during which two moving bodies hold the figure, sampled every six hours. */
    fun skyWindow(engine: AstronomyEngine, a: Planet, b: Planet, aspect: AspectType, instant: Date): OrbWindow =
        walk({ t -> abs(separation(longitude(engine, a, t), longitude(engine, b, t)) - aspect.degree) }, aspect, instant)

    /** The window during which a moving body holds the figure to a fixed natal longitude. */
    fun natalWindow(engine: AstronomyEngine, body: Planet, natalLongitude: Double, aspect: AspectType, instant: Date): OrbWindow =
        walk({ t -> abs(separation(longitude(engine, body, t), natalLongitude) - aspect.degree) }, aspect, instant)

    // --- the four-tick timeline ---------------------------------------------

    private val MONTHS = listOf("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC")

    private fun utc(d: Date): Calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { time = d }

    /** Four ticks across the window, labelled in UTC at the window's scale, the present marked. */
    fun timeline(window: OrbWindow, present: Date, fallback: Date): Timeline {
        val start = window.start.time
        val span = (window.end.time - start).coerceAtLeast(1L)
        val days = span.toDouble() / DAY_MS
        val crossesYear = utc(window.start).get(Calendar.YEAR) != utc(window.end).get(Calendar.YEAR)
        val ticks = (0..3).map { i ->
            val c = utc(Date(start + (span * i / 3.0).roundToLong()))
            val month = MONTHS[c.get(Calendar.MONTH)]
            val day = c.get(Calendar.DAY_OF_MONTH)
            val pct = i * 100f / 3f
            when {
                days < 4 -> TimelineTick(
                    pct,
                    "$month $day",
                    "%02d:%02d".format(c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE)),
                )
                days < 60 -> TimelineTick(pct, "$month $day", if (crossesYear) c.get(Calendar.YEAR).toString() else "")
                else -> {
                    val part = if (day <= 10) "EARLY" else if (day <= 20) "MID" else "LATE"
                    TimelineTick(pct, "$part $month", if (crossesYear || days > 300) c.get(Calendar.YEAR).toString() else "")
                }
            }
        }
        val inside = present.time >= start && present.time <= window.end.time
        val marker = if (inside) present else fallback
        val presentPct = (((marker.time - start).toDouble() / span) * 100.0).coerceIn(0.0, 100.0).toFloat()
        return Timeline(ticks, presentPct, inside)
    }
}
