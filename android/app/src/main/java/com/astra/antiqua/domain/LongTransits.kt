package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.abs

/**
 * The long transits where the year and the day page print them: the spine
 * under web's /year (web/src/components/horizons/YearNave.tsx, spanHeadline
 * in yearContent.ts) and the day page's teaser (buildLongTransit in
 * web/src/components/home/buildHomeBundle.ts, drawn by TransitTeaser.tsx).
 * Both walk the slow bodies against the natal Sun, Moon, Ascendant and
 * Midheaven; HorizonParityTest pins them to web's output.
 */
object LongTransits {
    private const val MS_PER_DAY = 86_400_000L
    private const val YEAR_DAYS = 365
    private const val SPINE_ROWS = 6

    /** The teaser reads web's /transits window: 420 days back, 1200 in all. */
    private const val LOOKBACK_DAYS = 420L
    private const val WINDOW_DAYS = 1200

    /**
     * The year's spine: the spans that open in the twelve months from [now]
     * and are not yet over, in the order they open, six at most.
     */
    fun yearSpine(engine: AstronomyEngine, natal: List<NatalPoint>, now: Date): List<TransitSpan> =
        TransitSpans.compute(engine, natal, SLOW_BODIES, now, YEAR_DAYS)
            .filter { it.end.time >= now.time }
            .sortedBy { it.start.time }
            .take(SPINE_ROWS)

    /** "GEB TIPS THE SCALES AGAINST YOUR MIDHEAVEN": one row of the spine. */
    fun spanHeadline(culture: AncientCulture, span: TransitSpan): String {
        val deity = DeityRegistry.getDeity(culture, span.transitPlanet).name.uppercase()
        val verb = AspectVerbs.of(culture, span.aspect).uppercase()
        val natal = when (span.natalKey) {
            "asc" -> "YOUR ASCENDANT"
            "mc" -> "YOUR MIDHEAVEN"
            else -> "YOUR NATAL ${DeityRegistry.getDeity(culture, planetOf(span.natalKey)).name.uppercase()}"
        }
        return "$deity $verb $natal"
    }

    /** Whether a span holds today, opens later, there is none in reach, or there is no chart. */
    enum class TeaserStatus { ACTIVE, UPCOMING, NONE, CTA }

    /**
     * The day page's long transit. [title] is the body in its sign's image
     * ("GEB IN THE RAM") and [through] the month the span ends, in UTC as web
     * prints it ("MAR 2027").
     */
    data class Teaser(
        val status: TeaserStatus,
        val span: TransitSpan? = null,
        val title: String? = null,
        val through: String? = null,
    )

    /**
     * The span the day page names: among the spans holding [now], the one
     * whose body stands closest to exact at 00:00 UTC that day; when none
     * holds it, the next to open. Without a chart there is nothing to read
     * one against.
     */
    fun teaser(engine: AstronomyEngine, culture: AncientCulture, now: Date, natal: List<NatalPoint>?): Teaser {
        if (natal == null) return Teaser(TeaserStatus.CTA)
        val spans = TransitSpans.compute(
            engine = engine,
            natalPoints = natal,
            transitPlanets = SLOW_BODIES,
            start = Date(now.time - LOOKBACK_DAYS * MS_PER_DAY),
            days = WINDOW_DAYS,
        )
        val active = spans.filter { it.start.time <= now.time && now.time <= it.end.time }
        val chosen = if (active.isNotEmpty()) {
            val sky = DayDecreeComposer.chartAt(engine, Date(Math.floorDiv(now.time, MS_PER_DAY) * MS_PER_DAY))
            active.minBy { orbOf(it, sky.getValue(it.transitPlanet)) }
        } else {
            spans.filter { it.start.time > now.time }.minByOrNull { it.start.time }
        } ?: return Teaser(TeaserStatus.NONE)

        val deity = DeityRegistry.getDeity(culture, chosen.transitPlanet).name.uppercase()
        return Teaser(
            status = if (active.isNotEmpty()) TeaserStatus.ACTIVE else TeaserStatus.UPCOMING,
            span = chosen,
            title = "$deity IN THE ${HorizonBanks.signImage(chosen.transitSign)}",
            through = monthYearUtc(chosen.end),
        )
    }

    /**
     * The teaser's line under THE LONG TRANSIT, as web's TransitTeaser prints
     * it on a phone. The arrow is held to its word by a no-break space, as
     * web's &nbsp; holds it.
     */
    fun teaserLine(teaser: Teaser): String = when {
        teaser.status == TeaserStatus.CTA -> "CAST THE FIRST CHART TO READ ONE\u00A0→"
        teaser.status == TeaserStatus.NONE || teaser.title == null -> "NO SLOW BODY IN REACH RIGHT NOW"
        else -> "${teaser.title} · THROUGH ${teaser.through}\u00A0→"
    }

    private val MONTHS = listOf(
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    )

    /** "MAR 2027", in UTC: web's home formatMonthYear. */
    internal fun monthYearUtc(date: Date): String {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply { time = date }
        return "${MONTHS[calendar.get(Calendar.MONTH)]} ${calendar.get(Calendar.YEAR)}"
    }

    /** How far the body stands from exact, in degrees. */
    private fun orbOf(span: TransitSpan, longitude: Double): Double {
        val raw = abs(longitude - span.natalLongitude) % 360.0
        val separation = if (raw > 180.0) 360.0 - raw else raw
        return abs(separation - span.aspect.degree)
    }

    private fun planetOf(key: String): Planet = Planet.valueOf(key.uppercase())
}
