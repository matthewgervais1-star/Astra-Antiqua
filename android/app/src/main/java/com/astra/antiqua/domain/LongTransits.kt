package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.generated.SharedFormats
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.time.YearMonth
import java.time.ZoneId
import java.util.Date

/**
 * The long transits index, web's /transits (`lib/screens/transits.ts`,
 * TransitsIndex.tsx, spanDisplay.ts): every span the five slow bodies make
 * against the natal Sun, Moon, Ascendant and Midheaven in web's window
 * (420 days back, 1200 in all), grouped into those open at the instant and
 * those still ahead, with web's row text.
 */
object LongTransitsComposer {
    private const val DAY_MS = 86_400_000L

    /** web's SPAN_LOOKBACK_DAYS: the walk starts this far before the instant, so open spans are found. */
    const val LOOKBACK_DAYS = 420L

    /** web's SPAN_WINDOW_DAYS. */
    const val WINDOW_DAYS = 1200

    /** web's readerSpans: the slow bodies against the four natal points, in the window around [now]. */
    fun readerSpans(engine: AstronomyEngine, natal: SeasonNatal, now: Date): List<TransitSpan> =
        TransitSpans.compute(
            engine = engine,
            natalPoints = SkyYearComposer.natalPoints(natal),
            transitPlanets = SLOW_BODIES,
            start = Date(now.time - LOOKBACK_DAYS * DAY_MS),
            days = WINDOW_DAYS,
        )

    /** web's groupSpans: open at [now] (start ≤ now ≤ end), and ahead (start > now), each in the window's order. */
    fun group(spans: List<TransitSpan>, now: Date): Pair<List<TransitSpan>, List<TransitSpan>> {
        val t = now.time
        return spans.filter { it.start.time <= t && t <= it.end.time } to spans.filter { it.start.time > t }
    }

    /** web's natalPointLabel: the natal body's deity for the Sun and Moon, YOUR RISING and YOUR MIDHEAVEN for the angles. */
    fun natalLabel(culture: AncientCulture, key: String): String = when (key) {
        "asc" -> "YOUR RISING"
        "mc" -> "YOUR MIDHEAVEN"
        else -> Planet.entries.firstOrNull { it.name.equals(key, ignoreCase = true) }
            ?.let { DeityRegistry.getDeity(culture, it).name.uppercase() } ?: key.uppercase()
    }

    /** transits.row.title: "AMUN ROWS IN TIME WITH YOUR RISING". */
    fun rowTitle(culture: AncientCulture, span: TransitSpan): String = SharedStrings.fill(
        SharedStrings.TRANSITS_ROW_TITLE,
        mapOf(
            "deity" to DeityRegistry.getDeity(culture, span.transitPlanet).name.uppercase(),
            "verb" to AspectVerbs.of(culture, span.aspect).uppercase(),
            "natal" to natalLabel(culture, span.natalKey),
        ),
    )

    /** web's SPAN_TONE_WORDS[spanTone(span)]: a conjunction is ease only for Jupiter. */
    fun toneWord(span: TransitSpan): String =
        if (spanTone(span) == SpanTone.EASE) SharedFormats.SPAN_TONE_WORDS.getValue("ease") else SharedFormats.SPAN_TONE_WORDS.getValue("tension")

    /**
     * transits.row.data, or dataNoAhead when no pass is still to come:
     * "OCT 2026 → JUN 2027 · 3 EXACT · 2 AHEAD · EASE". The months read in [zone].
     */
    fun rowData(span: TransitSpan, now: Date, zone: ZoneId): String {
        val ahead = span.passes.count { it.time > now.time }
        val range = SharedFormat.rangeMonths(span.start, span.end, zone)
        val slots = mutableMapOf("range" to range, "exact" to "${span.passes.size}", "tone" to toneWord(span))
        return if (ahead > 0) {
            slots["ahead"] = "$ahead"
            SharedStrings.fill(SharedStrings.TRANSITS_ROW_DATA, slots)
        } else {
            SharedStrings.fill(SharedStrings.TRANSITS_ROW_DATA_NO_AHEAD, slots)
        }
    }

    /** The months a listed span's bar is drawn across, and where a year label and NOW sit (the board's P60, P61, P63). */
    fun axis(listed: List<TransitSpan>, now: Date, zone: ZoneId): TransitsAxis? {
        if (listed.isEmpty()) return null
        fun month(d: Date): YearMonth = YearMonth.from(Instant.ofEpochMilli(d.time).atZone(zone))
        fun index(m: YearMonth): Int = m.year * 12 + m.monthValue - 1
        val first = listed.minOf { index(month(it.start)) }
        val last = listed.maxOf { index(month(it.end)) }
        val n = (last - first + 1).toFloat()
        val firstYear = first / 12
        val years = (firstYear..last / 12).map { y ->
            val at = if (y == firstYear) 0f else (y * 12 - first) / n
            y to at
        }
        val today = Instant.ofEpochMilli(now.time).atZone(zone)
        val todayMonth = YearMonth.from(today)
        val nowAt = (index(todayMonth) - first + today.dayOfMonth.toFloat() / todayMonth.lengthOfMonth()) / n
        val bars = listed.map { s ->
            val a = index(month(s.start)) - first
            val b = index(month(s.end)) - first
            TransitBar(left = a / n, width = (b - a + 1) / n)
        }
        return TransitsAxis(months = n.toInt(), years = years, now = nowAt, bars = bars)
    }
}

/** A span's bar on the shared axis: its start month's index over the months, and the months it covers inclusive. */
data class TransitBar(val left: Float, val width: Float)

/**
 * The shared axis: [months] from the first listed span's start month to the
 * last's end month inclusive; each year at its January's fraction (the first
 * at 0); NOW at (month index + day of month / days in the month) over the
 * months, outside 0..1 when no listed span is open; [bars] in the listed
 * order, open first, then ahead.
 */
data class TransitsAxis(val months: Int, val years: List<Pair<Int, Float>>, val now: Float, val bars: List<TransitBar>)

/** The index with a birth record: the instant and every span in the window. */
data class LongTransits(val now: Date, val spans: List<TransitSpan>) {
    private val groups = LongTransitsComposer.group(spans, now)
    val open: List<TransitSpan> = groups.first
    val ahead: List<TransitSpan> = groups.second
    val listed: List<TransitSpan> = open + ahead
}
