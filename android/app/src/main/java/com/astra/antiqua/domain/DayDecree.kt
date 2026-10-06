package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Calendar
import java.util.Date
import java.util.TimeZone
import kotlin.math.abs
import kotlin.math.floor

/**
 * The day page: a headline to the reader, an evidence line naming the figure,
 * one paragraph of five sentences, and the culture's come-back line.
 */
data class DayDecree(
    val headline: String,
    /** "RA △ NUT · 0°19′", or "" on a quiet day. */
    val evidence: String,
    val paragraph: String,
    val tone: DayTone,
    val comeBack: String,
    /** The paragraph's sentences: meaning, consequence, image, second, instruction. */
    val sentences: List<String>,
    /** The headline figure, then the second figure, then every other candidate by orb. */
    val figures: List<SkyFigure>,
)

/** The day's message in one breath: the headline and three of the page's sentences. */
data class DailyMessage(val headline: String, val body: String, val tone: DayTone)

/** One aspect in the sky, in the web detector's pair order. */
data class SkyFigure(val a: Planet, val b: Planet, val aspect: AspectType, val orb: Double)

/**
 * The day page's composer, ported from web/src/lib/decree.ts. The banks it
 * reads are generated from web (ReadingBanks.kt), and DayDecreeParityTest pins
 * the two composers to the same text for the same instant.
 */
object DayDecreeComposer {
    /** Fastest first: when both bodies of a figure are fast, the faster speaks. */
    val FAST_ORDER: List<Planet> = listOf(Planet.MOON, Planet.SUN, Planet.MERCURY, Planet.VENUS, Planet.MARS)

    /**
     * Under half a degree a figure is exact: the meaning sentence carries the
     * culture's exact tail, and the week marks the day EXACT.
     */
    const val EXACT_ORB = 0.5

    /** Below this orb the evidence line prints EXACT instead of the orb. */
    private const val EXACT_EVIDENCE_ORB = 0.1

    /** No sentence repeats within seven days; see [composeDayPage]. */
    const val REPEAT_WINDOW_DAYS = 7
    private const val LEAD_DAYS = 14
    private const val DAY_MS = 86_400_000L

    fun glyph(aspect: AspectType): String = when (aspect) {
        AspectType.CONJUNCTION -> "☌"
        AspectType.SEXTILE -> "⚹"
        AspectType.SQUARE -> "□"
        AspectType.TRINE -> "△"
        AspectType.OPPOSITION -> "☍"
    }

    private fun name(culture: AncientCulture, body: Planet): String =
        DeityRegistry.getDeity(culture, body).name

    private fun capitalize(s: String): String =
        if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }

    private fun fill(template: String, slots: Map<String, String>): String =
        Regex("""\{(\w+)\}""").replace(template) { match ->
            slots[match.groupValues[1]] ?: match.value
        }

    private fun toneFor(aspect: AspectType): DayTone =
        if (aspect == AspectType.SQUARE || aspect == AspectType.OPPOSITION) DayTone.TENSION else DayTone.HARMONY

    /** Which of a bank's two variants a day uses: they alternate day by day. */
    private fun variant(day: Long): Int = Math.floorMod(day, 2L).toInt()

    /** The headline body of a figure and its partner. */
    fun headlineBody(a: Planet, b: Planet): Pair<Planet, Planet> {
        for (fast in FAST_ORDER) {
            if (a == fast) return fast to b
            if (b == fast) return fast to a
        }
        error("no fast body in $a-$b")
    }

    /** "0°19′" with the minutes carried; rounds half up, as JavaScript's Math.round does. */
    private fun formatOrb(orb: Double): String {
        var deg = floor(orb).toInt()
        var min = floor((orb - deg) * 60.0 + 0.5).toInt()
        if (min == 60) {
            deg += 1
            min = 0
        }
        return "$deg°${min.toString().padStart(2, '0')}′"
    }

    fun composeEvidence(culture: AncientCulture, f: SkyFigure): String {
        val measure = if (f.orb < EXACT_EVIDENCE_ORB) "EXACT" else formatOrb(f.orb)
        return "${name(culture, f.a).uppercase()} ${glyph(f.aspect)} ${name(culture, f.b).uppercase()} · $measure"
    }

    private fun meaningClause(culture: AncientCulture, f: SkyFigure): String =
        "${deityDomain(culture, f.a)} and ${deityDomain(culture, f.b)} ${DecreeBanks.relation(culture, f.aspect)}"

    /** Sentence (a): two domains and a relation, the exact tail under half a degree. */
    fun composeMeaning(culture: AncientCulture, f: SkyFigure, day: Long = 0): String {
        val tail = if (f.orb < EXACT_ORB) DecreeBanks.exactTail(culture, variant(day)) else ""
        return "${capitalize(meaningClause(culture, f))}$tail."
    }

    /** Sentence (b): the consequence, keyed by kind and partner body. */
    fun composeConsequence(culture: AncientCulture, f: SkyFigure): String =
        DecreeBanks.consequence(culture, f.aspect, headlineBody(f.a, f.b).second)

    fun composeHeadline(culture: AncientCulture, f: SkyFigure): String =
        DecreeBanks.headline(culture, f.aspect, headlineBody(f.a, f.b).first)

    private fun godSlots(culture: AncientCulture, f: SkyFigure): Map<String, String> {
        val (body, partner) = headlineBody(f.a, f.b)
        return mapOf("god" to name(culture, body), "partner" to name(culture, partner))
    }

    private fun composeImage(culture: AncientCulture, f: SkyFigure): String =
        fill(DecreeBanks.image(culture, f.aspect, headlineBody(f.a, f.b).first), godSlots(culture, f))

    private fun composeInstruction(culture: AncientCulture, f: SkyFigure): String =
        fill(DecreeBanks.instruction(culture, f.aspect, headlineBody(f.a, f.b).first), godSlots(culture, f))

    private fun composeSecond(culture: AncientCulture, f: SkyFigure, day: Long): String =
        "${DecreeBanks.secondFigure(culture, variant(day))} ${name(culture, f.a)} " +
            "${AspectVerbs.of(culture, f.aspect)} ${name(culture, f.b)}: ${meaningClause(culture, f)}."

    /**
     * Every aspect in the chart, using the one documented orb table. Pairs are
     * taken once in body order, and the first matching kind wins, exactly as
     * the web detector does.
     */
    fun aspectsOf(chart: Map<Planet, Double>): List<SkyFigure> {
        val bodies = Planet.entries
        val out = mutableListOf<SkyFigure>()
        for (i in bodies.indices) {
            for (j in i + 1 until bodies.size) {
                val a = bodies[i]
                val b = bodies[j]
                val separation = separation(chart.getValue(a), chart.getValue(b))
                for (aspect in AspectType.entries) {
                    val orb = abs(separation - aspect.degree)
                    if (orb <= aspect.orb) {
                        out += SkyFigure(a, b, aspect, orb)
                        break
                    }
                }
            }
        }
        return out
    }

    private fun separation(x: Double, y: Double): Double {
        val raw = abs(x - y) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    /** The orb the same pair makes in the same kind on another chart, or infinity when out of orb. */
    private fun orbOn(chart: Map<Planet, Double>, f: SkyFigure): Double {
        val orb = abs(separation(chart.getValue(f.a), chart.getValue(f.b)) - f.aspect.degree)
        return if (orb <= f.aspect.orb) orb else Double.POSITIVE_INFINITY
    }

    /** The day's candidates: every aspect touching a fast body, tightest first. */
    fun dayFigures(chart: Map<Planet, Double>): List<SkyFigure> =
        aspectsOf(chart).filter { it.a in FAST_ORDER || it.b in FAST_ORDER }.sortedBy { it.orb }

    /**
     * The decree for one chart. [day] is the UTC day number and picks the
     * variants; [recent] holds the sentences the six days before printed, and
     * [tomorrow] the next day's sky, so a figure that tightens overnight waits.
     */
    fun compose(
        culture: AncientCulture,
        chart: Map<Planet, Double>,
        day: Long = 0,
        recent: Set<String> = emptySet(),
        tomorrow: Map<Planet, Double>? = null,
    ): DayDecree {
        val candidates = dayFigures(chart)
        if (candidates.isEmpty()) {
            return DayDecree(
                headline = quietDayHeadline(culture),
                evidence = "",
                paragraph = quietDayLine(culture),
                tone = DayTone.QUIET,
                comeBack = DecreeBanks.comeBack(culture),
                sentences = listOf(quietDayLine(culture)),
                figures = emptyList(),
            )
        }

        fun own(f: SkyFigure) = listOf(
            composeHeadline(culture, f),
            composeMeaning(culture, f, day),
            composeConsequence(culture, f),
            composeImage(culture, f),
            composeInstruction(culture, f),
        )
        fun stale(f: SkyFigure) = own(f).count { it in recent }
        fun ripening(f: SkyFigure) = tomorrow != null && orbOn(tomorrow, f) < f.orb

        val fresh = candidates.filter { stale(it) == 0 }
        val top = fresh.firstOrNull { !ripening(it) }
            ?: fresh.firstOrNull()
            ?: candidates.reduce { best, f -> if (stale(f) < stale(best)) f else best }

        // A second figure only earns its sentence if it speaks in a different
        // aspect kind, so its relation never repeats the meaning sentence's.
        val others = candidates.filter { it.aspect != top.aspect }
        val second = others.firstOrNull { composeSecond(culture, it, day) !in recent } ?: others.firstOrNull()
        val secondSentence = second?.let { composeSecond(culture, it, day) } ?: DecreeBanks.noSecondFigure(culture)

        val parts = own(top)
        val sentences = listOf(parts[1], parts[2], parts[3], secondSentence, parts[4])
        return DayDecree(
            headline = parts[0],
            evidence = composeEvidence(culture, top),
            paragraph = sentences.joinToString(" "),
            tone = toneFor(top.aspect),
            comeBack = DecreeBanks.comeBack(culture),
            sentences = sentences,
            figures = listOf(top) + listOfNotNull(second) + candidates.filter { it != top && it != second },
        )
    }

    private class Walk(val pages: MutableList<DayDecree>, var next: Map<Planet, Double>)

    private val walks = mutableMapOf<String, Walk>()

    /**
     * The day page for the UTC day containing [date], as web's composeDayPage
     * reads it: every page of a year comes from one walk that starts LEAD_DAYS
     * before 1 January (UTC), so each day avoids the sentences the six days the
     * reader saw before it printed. Kept for the process.
     */
    @Synchronized
    fun composeDayPage(engine: AstronomyEngine, culture: AncientCulture, date: Date): DayDecree {
        val today = Math.floorDiv(date.time, DAY_MS)
        val calendar = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
        calendar.timeInMillis = today * DAY_MS
        val year = calendar.get(Calendar.YEAR)
        calendar.clear()
        calendar.set(year, Calendar.JANUARY, 1, 0, 0, 0)
        val anchor = Math.floorDiv(calendar.timeInMillis, DAY_MS) - LEAD_DAYS
        val walk = walks.getOrPut("$culture|$anchor") {
            Walk(mutableListOf(), chartAt(engine, Date(anchor * DAY_MS)))
        }
        while (anchor + walk.pages.size <= today) {
            val day = anchor + walk.pages.size
            val tomorrow = chartAt(engine, Date((day + 1) * DAY_MS))
            val recent = walk.pages.takeLast(REPEAT_WINDOW_DAYS - 1)
                .flatMap { listOf(it.headline) + it.sentences }
                .toSet()
            walk.pages += compose(culture, walk.next, day, recent, tomorrow)
            walk.next = tomorrow
        }
        return walk.pages[(today - anchor).toInt()]
    }

    private fun messageOf(decree: DayDecree): DailyMessage {
        val body = if (decree.tone == DayTone.QUIET) {
            decree.sentences.firstOrNull().orEmpty()
        } else {
            listOf(decree.sentences[0], decree.sentences[1], decree.sentences[4]).joinToString(" ")
        }
        return DailyMessage(decree.headline, body, decree.tone)
    }

    /** The headline plus the meaning, the consequence and the instruction. */
    fun dailyMessage(culture: AncientCulture, chart: Map<Planet, Double>): DailyMessage =
        messageOf(compose(culture, chart))

    /** The message for the day page of the UTC day containing [date]. */
    fun dayMessage(engine: AstronomyEngine, culture: AncientCulture, date: Date): DailyMessage =
        messageOf(composeDayPage(engine, culture, date))

    /** Every body's longitude at [instant], the way web's computeChart reads it. */
    fun chartAt(engine: AstronomyEngine, instant: Date): Map<Planet, Double> {
        val julianDay = instant.time / 86_400_000.0 + 2440587.5
        return Planet.entries.associateWith {
            engine.getPlanetPosition(julianDay, TransitSpans.bodyOf(it)).longitude
        }
    }

    /** 00:00 UTC on the UTC day containing [now], the instant the home page reads. */
    fun startOfUtcDay(now: Date): Date = Date(now.time - Math.floorMod(now.time, 86_400_000L))
}
