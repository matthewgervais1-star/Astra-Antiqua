package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.Locale
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
 * web/src/lib/recurrence.ts. A figure returns when the sky brings it back:
 * each body has a mean geocentric rate in degrees a day (Mercury and Venus
 * keep the Sun's), a natal contact returns every 360 / rate days, and a sky
 * figure every 360 / |rate a - rate b| days. When the two rates are equal
 * the interval is measured: the Sun meets Mercury every 57.9 days and Venus
 * every 291.9 on average (inferior and superior conjunction both count), and
 * Mercury with Venus keeps no steady interval at all. Conjunction and
 * opposition come once in the cycle, the other kinds twice.
 */
object Recurrence {
    private const val YEAR = 365.25
    private const val MONTH_DAYS = 30.44

    fun meanRate(body: Planet): Double = when (body) {
        Planet.MOON -> 13.176
        Planet.SUN, Planet.MERCURY, Planet.VENUS -> 0.9856
        Planet.MARS -> 0.524
        Planet.JUPITER -> 0.0831
        Planet.SATURN -> 0.0335
        Planet.URANUS -> 0.011733
        Planet.NEPTUNE -> 0.005981
        Planet.PLUTO -> 0.003975
    }

    private val INNER: Set<Planet> = setOf(Planet.SUN, Planet.MERCURY, Planet.VENUS)

    private fun perKind(cycle: Double, aspect: AspectType): Double =
        cycle / if (aspect == AspectType.CONJUNCTION || aspect == AspectType.OPPOSITION) 1.0 else 2.0

    /** Days between returns of a moving body's figure to a fixed natal point. */
    fun natalDays(body: Planet, aspect: AspectType): Double = perKind(360.0 / meanRate(body), aspect)

    /** Days between returns of a figure between two moving bodies, or null when the pair keeps no steady interval. */
    fun skyDays(a: Planet, b: Planet, aspect: AspectType): Double? {
        if (a in INNER && b in INNER) {
            val pair = setOf(a, b)
            return when (pair) {
                setOf(Planet.SUN, Planet.MERCURY) -> perKind(57.9, aspect)
                setOf(Planet.SUN, Planet.VENUS) -> perKind(291.9, aspect)
                else -> null
            }
        }
        return perKind(360.0 / abs(meanRate(a) - meanRate(b)), aspect)
    }

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

    /** "about every two months", in the culture's calendar words: days under sixty, months under twenty-four, years beyond. */
    fun interval(culture: AncientCulture, days: Double): String {
        if (days < 20) {
            return when (culture) {
                AncientCulture.EGYPT -> "about every decan and a half"
                AncientCulture.ROME -> "about every ${numberWords(jsRound(days))} days"
                else -> "about twice a month"
            }
        }
        if (days < 45) return if (culture == AncientCulture.EGYPT) "about every three decans" else "about once a month"
        if (days < 60) return "about every ${numberWords(jsRound(days))} days"
        val months = jsRound(days / MONTH_DAYS)
        if (months < 24) {
            if (culture == AncientCulture.EGYPT && months == 4) return "about once a season"
            if (months == 12) return "about once a year"
            return "about every ${numberWords(months)} months"
        }
        return "about every ${numberWords(jsRound(days / YEAR))} years"
    }

    fun compose(culture: AncientCulture, days: Double?): String =
        if (days == null) {
            FigureBanks.recurrenceIrregular(culture)
        } else {
            FigureBanks.recurrenceFrame(culture).replace("{interval}", interval(culture, days))
        }

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

    private fun utc(d: Date): Calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { time = d }

    /** Four ticks across the window, labelled in UTC at the window's scale, the present marked. */
    fun timeline(window: OrbWindow, present: Date, fallback: Date): Timeline {
        val start = window.start.time
        val span = (window.end.time - start).coerceAtLeast(1L)
        val days = span.toDouble() / DAY_MS
        val crossesYear = utc(window.start).get(Calendar.YEAR) != utc(window.end).get(Calendar.YEAR)
        val ticks = (0..3).map { i ->
            val c = utc(Date(start + (span * i / 3.0).roundToLong()))
            val month = com.astra.antiqua.domain.generated.SharedFormats.MONTH_ABBR[c.get(Calendar.MONTH)]
            val day = c.get(Calendar.DAY_OF_MONTH)
            val pct = i * 100f / 3f
            when {
                days < 4 -> TimelineTick(
                    pct,
                    "$month $day",
                    String.format(Locale.ROOT, "%02d:%02d", c.get(Calendar.HOUR_OF_DAY), c.get(Calendar.MINUTE)),
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
