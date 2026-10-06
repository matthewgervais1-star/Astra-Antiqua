package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone

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
    /** The day page's headline for the day's figure, the culture's holds line
     *  when the figure is the row above's, or null on an ingress day. */
    val headline: String?,
    val line: String,
    val tone: DayTone,
    val tight: Boolean,
    val shorthand: String,
    val flag: RomeDayFlag?,
    /** The row's figure page (UTC date, figure id), or null on an ingress or quiet day. */
    val figure: Pair<String, String>? = null,
)

/**
 * The seven days of a week in one culture's voice, ported from
 * web/src/lib/weekReading.ts.
 *
 * Each day's headline is the tightest aspect involving a fast mover, inside
 * 1.2 degrees, flagged TIGHT under DayDecreeComposer.TIGHT_ORB. The sky decides
 * the figure; a figure that holds from one row to the next prints the
 * culture's holds line instead of its headline a second time. Where nothing is in orb the day says
 * so plainly rather than inventing weather, which is the honesty the method
 * page promises.
 */
object WeekReading {
    private const val EVENT_ORB = 1.2
    private const val TIGHT_ORB = DayDecreeComposer.TIGHT_ORB
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
        var previous: SkyFigure? = null

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
            // 00:00 UTC on the row's calendar date, the instant the day page
            // reads, so a date shows the same figure on both screens.
            val instant = utcMidnightMillis(date)
            val chart = chartAt(engine, instant)
            // The tightest fast-mover aspect inside the event orb is the day's
            // figure, always: the sky decides it. A figure that holds from one
            // row to the next says so in the culture's holds line.
            val tightest = DayDecreeComposer.aspectsOf(chart)
                .filter { it.orb < EVENT_ORB && (it.a in FAST_BODIES || it.b in FAST_BODIES) }
                .minByOrNull { it.orb }
            val holds = tightest != null && previous != null &&
                tightest.a == previous.a && tightest.b == previous.b && tightest.aspect == previous.aspect
            previous = tightest

            var headline: String? = null
            var figure: Pair<String, String>? = null
            val line: String
            val tone: DayTone
            val shorthand: String
            var tight = false
            if (tightest != null) {
                tight = tightest.orb < TIGHT_ORB
                tone = toneFor(tightest.aspect)
                // The headline speaks to the reader; beneath it the meaning and
                // the consequence. The week line itself gives no order.
                headline = if (holds) DecreeBanks.holds(culture) else DayDecreeComposer.composeHeadline(culture, tightest)
                line = DayDecreeComposer.composeMeaning(culture, tightest, Math.floorDiv(instant, DAY_MS)) + " " +
                    DayDecreeComposer.composeConsequence(culture, tightest)
                figure = FigureReadingComposer.isoDateUtc(Date(instant)) to FigureReadingComposer.figureId(tightest)
                shorthand = "${tightest.a.name.take(3)} ${tightest.aspect.name.take(3)} " +
                    "${tightest.b.name.take(3)}${if (tight) " · TIGHT" else ""}"
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
                    tight -> RomeDayFlag.N
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
                tight = tight,
                shorthand = shorthand,
                flag = flag,
                figure = figure,
            )
        }
        return days
    }

    /** 00:00 UTC on the local calendar date of [date], the instant a day is read for. */
    private fun utcMidnightMillis(date: Date): Long {
        val local = Calendar.getInstance()
        local.time = date
        val utc = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        utc.clear()
        utc.set(
            local.get(Calendar.YEAR),
            local.get(Calendar.MONTH),
            local.get(Calendar.DAY_OF_MONTH),
            0, 0, 0,
        )
        return utc.timeInMillis
    }

    private fun chartAt(engine: AstronomyEngine, millis: Long): Map<Planet, Double> =
        DayDecreeComposer.chartAt(engine, Date(millis))

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
