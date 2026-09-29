package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.abs
import kotlin.math.floor

/** How a day reads: the tone the design system colours a row by. */
enum class DayTone { HARMONY, TENSION, QUIET }

/**
 * Rome alone flags its days: F for fastus, lawful for public business; N for
 * nefastus; C for comitialis. The other four cultures carry no such calendar,
 * so nothing is invented for them.
 */
enum class RomeDayFlag { F, N, C }

data class WeekDay(
    val date: Date,
    val label: String,
    val isToday: Boolean,
    /** The day page's headline for the day's figure, or null on an ingress day. */
    val headline: String?,
    val line: String,
    val tone: DayTone,
    val exact: Boolean,
    val shorthand: String,
    val flag: RomeDayFlag?,
)

/**
 * The seven days of a week in one culture's voice, ported from
 * web/src/lib/weekReading.ts.
 *
 * Each day's headline is the tightest aspect involving a fast mover, inside
 * 1.2 degrees, marked exact under 0.35. A pair that has already headlined
 * earlier in the week only speaks again when it is exact that day, so a slow
 * contact does not fill the whole strip. Where nothing is in orb the day says
 * so plainly rather than inventing weather, which is the honesty the method
 * page promises.
 */
object WeekReading {
    private const val EVENT_ORB = 1.2
    private const val EXACT_ORB = 0.35
    private const val DAY_MS = 86_400_000L

    /** Seven days plus the buffer the coarsest sampling step needs. */
    private const val INGRESS_SCAN_DAYS = 9

    /** The Moon and the inner planets: the bodies that move enough to headline a day. */
    private val FAST_BODIES = setOf(
        Planet.MOON,
        Planet.MERCURY,
        Planet.VENUS,
        Planet.SUN,
        Planet.MARS,
    )

    private val WEEKDAYS = listOf("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT")

    /** The culture's quiet-day line, generated from web (ReadingBanks.kt). */
    fun quietLine(culture: AncientCulture): String = quietDayLine(culture)

    private fun signPhrase(sign: ZodiacSign): String = when (sign) {
        ZodiacSign.ARIES -> "Ram"
        ZodiacSign.TAURUS -> "Bull"
        ZodiacSign.GEMINI -> "Twins"
        ZodiacSign.CANCER -> "Crab"
        ZodiacSign.LEO -> "Lion"
        ZodiacSign.VIRGO -> "Maiden"
        ZodiacSign.LIBRA -> "Scales"
        ZodiacSign.SCORPIO -> "Scorpion"
        ZodiacSign.SAGITTARIUS -> "Archer"
        ZodiacSign.CAPRICORN -> "Goat"
        ZodiacSign.AQUARIUS -> "Water-Bearer"
        ZodiacSign.PISCES -> "Fishes"
    }

    /**
     * Square and opposition read as tension; everything else, the conjunction
     * included, reads as harmony. QUIET belongs to a day with nothing in orb,
     * not to an aspect, which is why it is not returned here.
     */
    private fun toneFor(aspect: AspectType): DayTone =
        if (aspect == AspectType.SQUARE || aspect == AspectType.OPPOSITION) {
            DayTone.TENSION
        } else {
            DayTone.HARMONY
        }

    /** Local midnight on the Monday of the week containing [around]. */
    fun weekStart(around: Date): Date {
        val calendar = Calendar.getInstance()
        calendar.time = around
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        // Calendar.MONDAY is 2; back up to it wherever the week starts locally.
        val shift = (calendar.get(Calendar.DAY_OF_WEEK) - Calendar.MONDAY + 7) % 7
        calendar.add(Calendar.DAY_OF_MONTH, -shift)
        return calendar.time
    }

    fun build(engine: AstronomyEngine, culture: AncientCulture, start: Date, today: Date): List<WeekDay> {
        val days = mutableListOf<WeekDay>()
        val usedPairs = mutableSetOf<String>()

        // One ingress scan for the whole week rather than seven, buffered two
        // days past the end so the coarsest sampling step still lands beyond
        // the last day and nothing in the tail is missed.
        val weekIngresses = SkyEvents.ingresses(
            engine,
            start,
            INGRESS_SCAN_DAYS,
            Planet.entries,
        )

        for (i in 0 until 7) {
            val calendar = Calendar.getInstance()
            calendar.time = start
            calendar.add(Calendar.DAY_OF_MONTH, i)
            val date = calendar.time
            val chart = chartAtNoonUtc(engine, date)
            val candidates = aspectsOf(chart)
                .filter { it.orb < EVENT_ORB && (it.a in FAST_BODIES || it.b in FAST_BODIES) }
                .sortedBy { it.orb }

            var tightest: DayAspect? = null
            for (candidate in candidates) {
                val pair = "${candidate.a}|${candidate.b}"
                if (pair in usedPairs && candidate.orb >= EXACT_ORB) continue
                tightest = candidate
                usedPairs += pair
                break
            }

            var headline: String? = null
            val line: String
            val tone: DayTone
            val shorthand: String
            var exact = false
            if (tightest != null) {
                exact = tightest.orb < EXACT_ORB
                tone = toneFor(tightest.aspect)
                // The headline speaks to the reader; beneath it the meaning and
                // the consequence, both of which take the figure. No order: the
                // week reports the figure, and the day page carries the one
                // instruction.
                val figure = SkyFigure(tightest.a, tightest.b, tightest.aspect, tightest.orb)
                headline = DayDecreeComposer.composeHeadline(culture, figure)
                line = DayDecreeComposer.composeMeaning(culture, figure) + " " +
                    DayDecreeComposer.composeConsequence(culture, figure)
                shorthand = "${tightest.a.name.take(3)} ${tightest.aspect.name.take(3)} " +
                    "${tightest.b.name.take(3)}${if (exact) " · EXACT" else ""}"
            } else {
                // Nothing in orb. A body crossing into a new sign that day is
                // still something the sky did, and it is reported before the
                // day is called quiet.
                val dayStart = startOfDay(date)
                val dayEnd = Date(dayStart.time + DAY_MS)
                val ingress = weekIngresses.firstOrNull {
                    it.date.time >= dayStart.time && it.date.time < dayEnd.time
                }
                if (ingress != null) {
                    tone = DayTone.HARMONY
                    val deity =
                        com.astra.antiqua.model.DeityRegistry.getDeity(culture, ingress.body).name
                    val verb = ingressVerb(culture)
                    val ruling = ingressFrame(culture, deityCharge(culture, ingress.body))
                    line = "$deity $verb the ${signPhrase(ingress.sign)}. $ruling"
                    shorthand = "${ingress.body.name.take(3)} → " +
                        ingress.sign.signName.take(3).uppercase()
                } else {
                    tone = DayTone.QUIET
                    headline = quietDayHeadline(culture)
                    line = quietLine(culture)
                    shorthand = "QUIET"
                }
            }

            val flag = if (culture == AncientCulture.ROME) {
                when {
                    tone != DayTone.TENSION -> RomeDayFlag.F
                    exact -> RomeDayFlag.N
                    else -> RomeDayFlag.C
                }
            } else {
                null
            }

            days += WeekDay(
                date = date,
                label = "${weekdayAbbr(date)} ${calendar.get(Calendar.DAY_OF_MONTH)}",
                isToday = sameLocalDay(date, today),
                headline = headline,
                line = line,
                tone = tone,
                exact = exact,
                shorthand = shorthand,
                flag = flag,
            )
        }
        return days
    }

    private data class DayAspect(
        val a: Planet,
        val b: Planet,
        val aspect: AspectType,
        val orb: Double,
    )

    /** Every body's longitude at noon UTC on [date], the instant a day is read for. */
    private fun chartAtNoonUtc(
        engine: AstronomyEngine,
        date: Date,
    ): Map<Planet, Double> {
        val local = Calendar.getInstance()
        local.time = date
        val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utc.clear()
        utc.set(
            local.get(Calendar.YEAR),
            local.get(Calendar.MONTH),
            local.get(Calendar.DAY_OF_MONTH),
            12, 0, 0,
        )
        val julianDay = utc.timeInMillis / 86_400_000.0 + 2440587.5
        return Planet.entries.associateWith {
            engine.getPlanetPosition(julianDay, TransitSpans.bodyOf(it)).longitude
        }
    }

    /**
     * Every aspect in the chart, using the one documented orb table. Pairs are
     * taken once, and the first matching kind wins, exactly as the web
     * detector does, so the two surfaces cannot disagree about what is in orb.
     */
    private fun aspectsOf(chart: Map<Planet, Double>): List<DayAspect> {
        val bodies = Planet.entries
        val out = mutableListOf<DayAspect>()
        for (i in bodies.indices) {
            for (j in i + 1 until bodies.size) {
                val a = bodies[i]
                val b = bodies[j]
                val separation = angularSeparation(chart.getValue(a), chart.getValue(b))
                for (aspect in AspectType.entries) {
                    val orb = abs(separation - aspect.degree)
                    if (orb <= aspect.orb) {
                        out += DayAspect(a, b, aspect, orb)
                        break
                    }
                }
            }
        }
        return out
    }

    private fun angularSeparation(a: Double, b: Double): Double {
        val raw = abs(a - b) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    private fun signOf(longitude: Double): ZodiacSign {
        val normalized = ((longitude % 360.0) + 360.0) % 360.0
        return ZodiacSign.entries[floor(normalized / 30.0).toInt() % 12]
    }

    private fun weekdayAbbr(date: Date): String {
        val calendar = Calendar.getInstance()
        calendar.time = date
        return WEEKDAYS[calendar.get(Calendar.DAY_OF_WEEK) - 1]
    }

    private fun startOfDay(date: Date): Date = Calendar.getInstance().apply {
        time = date
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
    }.time

    private fun sameLocalDay(a: Date, b: Date): Boolean {
        val ca = Calendar.getInstance().apply { time = a }
        val cb = Calendar.getInstance().apply { time = b }
        return ca.get(Calendar.YEAR) == cb.get(Calendar.YEAR) &&
            ca.get(Calendar.DAY_OF_YEAR) == cb.get(Calendar.DAY_OF_YEAR)
    }
}
