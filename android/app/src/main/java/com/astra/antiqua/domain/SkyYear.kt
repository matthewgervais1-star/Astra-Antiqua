package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Date
import java.util.Locale
import kotlin.math.floor

/**
 * A turning of the year, web's SkyTimelineRow (`yearContent.ts`
 * buildSkyOnlyTimeline): a station either way or a slow body's ingress. The
 * row's head and its month label are formatted in the reader's zone by
 * [SkyYearSlots].
 */
data class YearTurning(val date: Date, val kind: SkyEventKind, val planet: Planet, val sign: ZodiacSign) {
    /** web's row tone: a turn to retrograde reads in the conflict ink, the rest dim. */
    val conflict: Boolean get() = kind == SkyEventKind.RETROGRADE
}

/** One of web's AnnualQuarter, the parts the segments print. */
data class YearQuarter(val start: Date, val end: Date, val narrative: String, val events: String)

/** web's AnnualReport, the parts Sky Year prints: the theme's body, its dominant aspect, the quarters. */
data class YearReport(val body: String, val dominant: AspectType?, val quarters: List<YearQuarter>)

/** web's YearSegment (`yearContent.ts`). */
data class YearSegment(val label: String, val dateRange: String, val summary: String, val status: String) {
    /** web's SegmentRow lights the segment the instant falls in. */
    val current: Boolean get() = status.startsWith("DAY ")
}

/** One row of web's spine box: spanHeadline and "→ JUN 2027", the span's end month. */
data class YearSpineRow(val id: String, val headline: String, val end: String)

/** Sky Year, composed: the board's timeline and web's own sections below it. */
data class SkyYear(
    /** The instant the year is read from. */
    val now: Date,
    /** Stations and slow-body ingresses over the 365 days from [now], in date order. */
    val turnings: List<YearTurning>,
    /** The Moon's quarters in the same window, which the count line adds. */
    val lunations: Int,
    /** Null without a birth record. */
    val report: YearReport?,
    val segments: List<YearSegment>,
    val spine: List<YearSpineRow>,
    /** web's opening paragraph: the year theme's body, or SKY_ONLY_OPENING without a chart. */
    val opening: String,
    /** web's yearStructure is "festivals" (Greece): the note under the segments prints. */
    val festivals: Boolean,
    /** web's yearReadingId, "year-2026", the feedback row's key. */
    val readingId: String,
)

/**
 * Ports of web's year page for what Sky Year prints: `lib/screens/year.ts`
 * (buildYearScreen), `components/horizons/yearContent.ts`
 * (buildSkyOnlyTimeline, buildYearSegments, yearVotiveTone, SKY_ONLY_OPENING,
 * spanHeadline), `components/horizons/YearNave.tsx` (the spine's filter and
 * the reading id) and `lib/annualReport.ts` (buildAnnualReport's year theme
 * and quarters). The finders are the ones Season already ports: stations and
 * ingresses through [SkyEvents], the Moon's quarters and the eclipses through
 * [SeasonStandouts], the exact passes and spans through [TransitSpans].
 *
 * Left out of buildAnnualReport, as the page does not print them: the theme's
 * headline and context line, the hardest and easiest stretches, the standouts
 * and the solar return.
 */
object SkyYearComposer {

    /** web's YEAR_DAYS: the year is read over the 365 days from the instant. */
    const val YEAR_DAYS = 365

    private const val DAY_MS = 86_400_000L

    /** web's quarter length in buildQuarters. */
    private const val QUARTER_DAYS = 91

    /** web's SLOW_BODIES (`lib/yearForecast.ts`). */
    private val SLOW = listOf(Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO)

    /** web's NATAL_TARGET_FULL (`lib/annualReport.ts`). */
    private val NATAL_TARGET_FULL = mapOf(
        "sun" to "your identity",
        "moon" to "your inner feelings",
        "asc" to "the threshold you cross into the world",
        "mc" to "the public face you wear",
    )

    /** web's SKY_ONLY_OPENING (`yearContent.ts`). */
    val SKY_ONLY_OPENING: Map<AncientCulture, String> = mapOf(
        AncientCulture.EGYPT to "This is the sky alone, without a chart to carry it. Cast one, and the year gains a thread the flood can follow.",
        AncientCulture.GREECE to "This is the sky alone; no question has been asked of it yet. Cast a chart, and the oracle has something to answer.",
        AncientCulture.CANAAN to "This is the sky alone; no matter has been brought before the council. Cast a chart, and the year has business to sit on.",
        AncientCulture.CARTHAGE to "This is the sky alone; no cargo is entered against it. Cast a chart, and the ledger has an account to keep.",
        AncientCulture.ROME to "This is the sky alone, read without a chart to take the auspices for. Cast one, and the year has a subject.",
    )

    /**
     * web's note under Greece's segments (YearNave.tsx), printed as written
     * there; it has no catalog key.
     */
    const val FESTIVALS_NOTE = "MARKED BY THE ATHENIAN CIRCUIT, NOT QUARTERS"

    /** web's yearNatalPoints: the Sun, the Moon, the Ascendant and the Midheaven. */
    fun natalPoints(natal: SeasonNatal): List<NatalPoint> = listOf(
        NatalPoint("sun", natal.sun),
        NatalPoint("moon", natal.moon),
        NatalPoint("asc", natal.ascendant),
        NatalPoint("mc", natal.midheaven),
    )

    fun compose(engine: AstronomyEngine, culture: AncientCulture, now: Date, natal: SeasonNatal?): SkyYear {
        val stations = SkyEvents.stations(engine, now, YEAR_DAYS)
        val ingresses = SkyEvents.ingresses(engine, now, YEAR_DAYS, SLOW)
        // web pushes the stations, then the ingresses, then sorts by date (a stable sort).
        val turnings = (stations + ingresses)
            .map { YearTurning(it.date, it.kind, it.body, it.sign) }
            .sortedBy { it.date.time }
        val lunations = SeasonStandouts.moonPhases(engine, now, YEAR_DAYS).size

        var report: YearReport? = null
        var spine = emptyList<YearSpineRow>()
        if (natal != null) {
            val passes = TransitSpans.findExactPasses(engine, natalPoints(natal), SLOW, now, YEAR_DAYS)
            report = annualReport(culture, now, passes, SeasonStandouts.eclipseEvents(now, YEAR_DAYS), engine)
            // YearNave: the spans still open at the instant, by their start, the first six.
            spine = TransitSpans.spansOf(engine, passes)
                .filter { it.end.time >= now.time }
                .sortedBy { it.start.time }
                .take(6)
                .map { YearSpineRow(it.id, spanHeadline(culture, it), "→ ${SharedFormat.monthYear(it.end)}") }
        }
        return SkyYear(
            now = now,
            turnings = turnings,
            lunations = lunations,
            report = report,
            segments = report?.let { segments(culture, it.quarters, now) } ?: emptyList(),
            spine = spine,
            opening = report?.body ?: SKY_ONLY_OPENING.getValue(culture),
            festivals = culture == AncientCulture.GREECE,
            readingId = "year-${SharedFormat.year(now)}",
        )
    }

    // ---------- annualReport.ts ----------

    /** web's planetWeight (annualReport.ts, not transits.ts: Uranus and Neptune weigh 4 here). */
    private fun planetWeight(planet: Planet): Double = when (planet) {
        Planet.PLUTO -> 5.0
        Planet.SATURN, Planet.URANUS, Planet.NEPTUNE -> 4.0
        Planet.JUPITER -> 3.0
        Planet.MARS -> 2.0
        Planet.VENUS, Planet.MERCURY -> 1.5
        Planet.SUN, Planet.MOON -> 1.0
    }

    private fun aspectWeight(aspect: AspectType): Double = when (aspect) {
        AspectType.CONJUNCTION, AspectType.OPPOSITION -> 3.0
        AspectType.SQUARE -> 2.5
        AspectType.TRINE -> 2.0
        AspectType.SEXTILE -> 1.0
    }

    private fun pointWeight(key: String): Double = when (key) {
        "sun", "moon" -> 2.0
        "asc", "mc" -> 1.5
        else -> 1.0
    }

    private fun significance(p: TransitSpans.Peak): Double = planetWeight(p.planet) * aspectWeight(p.aspect) * pointWeight(p.natalKey)

    private fun isEasing(aspect: AspectType) = aspect == AspectType.TRINE || aspect == AspectType.SEXTILE

    private fun isTense(aspect: AspectType) = aspect == AspectType.SQUARE || aspect == AspectType.OPPOSITION

    /** web's toneOf (`lib/tone.ts`). */
    private fun tone(aspect: AspectType): String = when {
        isEasing(aspect) -> "harmony"
        isTense(aspect) -> "tension"
        else -> "union"
    }

    private fun cap(s: String) = s.replaceFirstChar { it.uppercase() }

    private fun deity(culture: AncientCulture, planet: Planet) = DeityRegistry.getDeity(culture, planet).name

    private fun planetOf(key: String): Planet = Planet.valueOf(key.uppercase(Locale.ROOT))

    /** web's toLocaleDateString(undefined, { month: "long", day: "numeric" }) under an en-US runtime: "June 8". */
    private val LONG_DAY: DateTimeFormatter = DateTimeFormatter.ofPattern("MMMM d", Locale.US)

    private fun longDay(date: Date): String = LONG_DAY.format(Instant.ofEpochMilli(date.time).atZone(ZoneId.systemDefault()))

    /** web's nDeity in pickYearTheme and buildQuarters: the angles by their place, a planet by its god. */
    private fun natalDeity(culture: AncientCulture, key: String): String = when (key) {
        "asc" -> "the threshold of your chart"
        "mc" -> "the top of your chart"
        else -> deity(culture, planetOf(key))
    }

    /**
     * web's buildAnnualReport for the parts the page prints: pickYearTheme's
     * body and dominant transit, and buildQuarters. [passes] are web's
     * findMajorTransits (date order); [eclipses] web's findEclipses.
     */
    internal fun annualReport(
        culture: AncientCulture,
        now: Date,
        passes: List<TransitSpans.Peak>,
        eclipses: List<SeasonStandouts.Eclipse>,
        engine: AstronomyEngine,
    ): YearReport {
        val (body, dominant) = yearTheme(culture, passes, eclipses)
        return YearReport(body, dominant, quarters(culture, now, passes, eclipses, engine))
    }

    private fun yearTheme(
        culture: AncientCulture,
        passes: List<TransitSpans.Peak>,
        eclipses: List<SeasonStandouts.Eclipse>,
    ): Pair<String, AspectType?> {
        if (passes.isEmpty() && eclipses.isEmpty()) return YearNarrative.special("quiet") to null
        // The heaviest transit by composite significance; a stable sort keeps the earliest of equals.
        val dominant = passes.sortedByDescending { significance(it) }.firstOrNull()
            ?: return YearNarrative.special("eclipse-held") to null
        YearNarrative.theme(dominant.planet.name.lowercase(Locale.ROOT), dominant.natalKey, tone(dominant.aspect))?.let {
            return it to dominant.aspect
        }
        // web's fallback for a pairing not yet written (none of the slow bodies reaches it today).
        val principle = SeasonStandouts.PRINCIPLE.getValue(dominant.planet)
        val target = NATAL_TARGET_FULL[dominant.natalKey] ?: "this point of your chart"
        val dateStr = longDay(dominant.date)
        val clause = when {
            isTense(dominant.aspect) -> "The year presses $principle against $target. It will be tested, and what holds by the end will be the stronger for the testing."
            isEasing(dominant.aspect) -> "The year keeps $principle flowing toward $target. The support is real, so you will not have to force it."
            else -> "The year fuses $principle onto $target. You will feel the two as one signal where you usually feel them as two, so use the concentration rather than fighting it."
        }
        return "$clause The exact peak falls on $dateStr, but the influence runs for weeks on either side." to dominant.aspect
    }

    /** web's buildQuarters: four rolling 91-day quarters from the instant, each framed by its weather. */
    private fun quarters(
        culture: AncientCulture,
        now: Date,
        passes: List<TransitSpans.Peak>,
        eclipses: List<SeasonStandouts.Eclipse>,
        engine: AstronomyEngine,
    ): List<YearQuarter> = (0 until 4).map { q ->
        val start = Date(now.time + q * QUARTER_DAYS * DAY_MS)
        val end = Date(now.time + (q + 1) * QUARTER_DAYS * DAY_MS - 1)
        val inQuarter = passes.filter { it.date.time in start.time..end.time }
        val eclipsesIn = eclipses.filter { it.date.time in start.time..end.time }
        val dominant = inQuarter.sortedByDescending { significance(it) }.firstOrNull()
        val parts = mutableListOf<String>()
        if (dominant != null) {
            parts += "${deity(culture, dominant.planet)} ${AspectVerbs.of(culture, dominant.aspect)} your " +
                "${natalDeity(culture, dominant.natalKey)}, exact on ${longDay(dominant.date)}."
        }
        eclipsesIn.firstOrNull()?.let { e ->
            val scope = if (e.lunar) "lunar" else "solar"
            val lord = deity(culture, if (e.lunar) Planet.MOON else Planet.SUN)
            parts += "${cap(e.kind)} $scope eclipse of $lord in ${eclipseSign(engine, e).signName} on ${longDay(e.date)}."
        }
        val slow = setOf(Planet.SATURN, Planet.PLUTO, Planet.URANUS, Planet.NEPTUNE)
        val hasTense = inQuarter.any { isTense(it.aspect) || (it.aspect == AspectType.CONJUNCTION && it.planet in slow) } ||
            eclipsesIn.isNotEmpty()
        val hasEasy = inQuarter.any {
            isEasing(it.aspect) || (it.aspect == AspectType.CONJUNCTION && (it.planet == Planet.JUPITER || it.planet == Planet.NEPTUNE))
        }
        val weather = when {
            !hasTense && !hasEasy -> "quiet"
            hasTense && hasEasy -> "mixed"
            hasTense -> "tense"
            else -> "easy"
        }
        YearQuarter(start, end, YearNarrative.season(weather), parts.joinToString(" "))
    }

    /** web reads the Moon's sign at a lunar eclipse's peak and the Sun's at a solar one. */
    private fun eclipseSign(engine: AstronomyEngine, e: SeasonStandouts.Eclipse): ZodiacSign {
        val lon = engine.getPlanetPosition(e.date.time / 86_400_000.0 + 2440587.5, TransitSpans.bodyOf(if (e.lunar) Planet.MOON else Planet.SUN)).longitude
        return ZodiacSign.entries[floor((((lon % 360.0) + 360.0) % 360.0) / 30.0).toInt() % 12]
    }

    // ---------- yearContent.ts ----------

    /** web's statusFor: COMING, DONE, or "DAY n / total" inside the segment. */
    internal fun status(start: Date, end: Date, now: Date): String {
        if (now.time < start.time) return "COMING"
        if (now.time > end.time) return "DONE"
        val total = maxOf(1, jsRound((end.time - start.time).toDouble() / DAY_MS) + 1)
        val day = minOf(total, maxOf(1, jsRound((now.time - start.time).toDouble() / DAY_MS) + 1))
        return "DAY $day / $total"
    }

    private fun jsRound(x: Double): Int = floor(x + 0.5).toInt()

    private fun summaryOf(q: YearQuarter): String = q.events.ifEmpty { q.narrative }

    private fun merged(a: YearQuarter, b: YearQuarter): String = listOf(summaryOf(a), summaryOf(b)).filter { it.isNotEmpty() }.joinToString(" ")

    private fun range(start: Date, end: Date): String = "${SharedFormat.dayMonth(start)} → ${SharedFormat.dayMonth(end)}"

    /**
     * web's buildYearSegments: the four quarters as the culture's year is
     * cut. Rome four quarters, Egypt three seasons (the middle two merged),
     * Canaan and Carthage two halves, Greece four festival quarters.
     */
    fun segments(culture: AncientCulture, quarters: List<YearQuarter>, now: Date): List<YearSegment> {
        if (quarters.size < 4) return emptyList()
        val (q0, q1, q2, q3) = quarters
        fun one(label: String, q: YearQuarter) = YearSegment(label, range(q.start, q.end), summaryOf(q), status(q.start, q.end, now))
        fun two(label: String, a: YearQuarter, b: YearQuarter) = YearSegment(label, range(a.start, b.end), merged(a, b), status(a.start, b.end, now))
        return when (culture) {
            AncientCulture.ROME -> listOf("VER", "AESTAS", "AUTUMNUS", "HIEMS").zip(quarters).map { (label, q) -> one(label, q) }
            AncientCulture.EGYPT -> listOf(
                one("AKHET · THE FLOOD", q0),
                two("PERET · THE SOWING", q1, q2),
                one("SHEMU · THE HARVEST", q3),
            )
            AncientCulture.CANAAN -> listOf(
                two("THE RAINS · BAAL RETURNED", q0, q1),
                two("THE DRY · MOT HOLDS HIM", q2, q3),
            )
            AncientCulture.CARTHAGE -> listOf(
                two("MARE APERTUM · THE OPEN SEA", q0, q1),
                two("MARE CLAUSUM · THE HAULED-UP MONTHS", q2, q3),
            )
            AncientCulture.GREECE -> listOf("LENAIA", "ANTHESTERIA TO THARGELIA", "PANATHENAIA", "THE MYSTERIES")
                .zip(quarters).map { (label, q) -> one(label, q) }
        }
    }

    /** web's spanHeadline: "GEB TIPS THE SCALES AGAINST YOUR NATAL RA". */
    fun spanHeadline(culture: AncientCulture, span: TransitSpan): String {
        val natal = when (span.natalKey) {
            "asc" -> "YOUR ASCENDANT"
            "mc" -> "YOUR MIDHEAVEN"
            else -> "YOUR NATAL ${deity(culture, planetOf(span.natalKey)).uppercase()}"
        }
        return "${deity(culture, span.transitPlanet).uppercase()} ${AspectVerbs.of(culture, span.aspect).uppercase()} $natal"
    }

    /** web's yearVotiveTone: no dominant transit is quiet; a square or opposition, tension; the rest, harmony. */
    fun votiveTone(dominant: AspectType?): String = when {
        dominant == null -> "quiet"
        isTense(dominant) -> "tension"
        else -> "harmony"
    }

    /** web's yearVotive: year.votive.<tone> for the culture, its line break kept. */
    fun votive(culture: AncientCulture, tone: String): String = when (tone) {
        "tension" -> SharedStrings.YEAR_VOTIVE_TENSION
        "harmony" -> SharedStrings.YEAR_VOTIVE_HARMONY
        else -> SharedStrings.YEAR_VOTIVE_QUIET
    }.getValue(culture)
}
