package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Date
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
     * Under half a degree a figure is tight: the meaning sentence carries the
     * culture's tight tail and the week flags the day TIGHT. One threshold for
     * every surface that says "tight". The evidence line does not use it; it
     * prints the measured orb, and says EXACT only under one minute of arc.
     */
    const val TIGHT_ORB = 0.5

    /** The evidence line says EXACT only under this: one minute of arc. */
    private const val ONE_ARCMINUTE = 1.0 / 60.0

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

    /**
     * Which of a bank's three variants a day uses, by the UTC day number. The
     * sky picks the figure; the day only picks among the words.
     */
    private fun variant(day: Long): Int = Math.floorMod(day, 3L).toInt()

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
        val measure = if (f.orb < ONE_ARCMINUTE) "EXACT" else formatOrb(f.orb)
        return "${name(culture, f.a).uppercase()} ${glyph(f.aspect)} ${name(culture, f.b).uppercase()} · $measure"
    }

    private fun meaningClause(culture: AncientCulture, f: SkyFigure, day: Long): String =
        "${deityDomain(culture, f.a)} and ${deityDomain(culture, f.b)} " +
            DecreeBanks.relation(culture, f.aspect, variant(day))

    /** Sentence (a): two domains and a relation, the tight tail under half a degree. */
    fun composeMeaning(culture: AncientCulture, f: SkyFigure, day: Long = 0): String {
        val tail = if (f.orb < TIGHT_ORB) DecreeBanks.tightTail(culture, variant(day)) else ""
        return "${capitalize(meaningClause(culture, f, day))}$tail."
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

    /**
     * Sentence (d): the second figure. Its opener names the headline figure's
     * two gods, unless the two figures share a god (compared by name: Carthage
     * gives Jupiter and Saturn one god); then the plain opener.
     */
    private fun composeSecond(culture: AncientCulture, top: SkyFigure, f: SkyFigure, day: Long): String {
        val headlineGods = setOf(name(culture, top.a), name(culture, top.b))
        val shared = name(culture, f.a) in headlineGods || name(culture, f.b) in headlineGods
        val opener = if (shared) {
            DecreeBanks.secondFigurePlain(culture, variant(day))
        } else {
            fill(DecreeBanks.secondFigure(culture, variant(day)), godSlots(culture, top))
        }
        return "$opener ${name(culture, f.a)} ${AspectVerbs.of(culture, f.aspect)} ${name(culture, f.b)}: " +
            "${meaningClause(culture, f, day)}."
    }

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

    /** The day's candidates: every aspect touching a fast body, tightest first. */
    fun dayFigures(chart: Map<Planet, Double>): List<SkyFigure> =
        aspectsOf(chart).filter { it.a in FAST_ORDER || it.b in FAST_ORDER }.sortedBy { it.orb }

    /**
     * The decree for one chart. The headline figure is the tightest figure that
     * touches a fast body, always: the sky decides it. [day] is the UTC day
     * number and picks the variants.
     */
    fun compose(culture: AncientCulture, chart: Map<Planet, Double>, day: Long = 0): DayDecree {
        val candidates = dayFigures(chart)
        val top = candidates.firstOrNull()
            ?: return DayDecree(
                headline = quietDayHeadline(culture),
                evidence = "",
                paragraph = quietDayLine(culture),
                tone = DayTone.QUIET,
                comeBack = DecreeBanks.comeBack(culture),
                sentences = listOf(quietDayLine(culture)),
                figures = emptyList(),
            )

        // A second figure only earns its sentence if it speaks in a different
        // aspect kind, so its relation never repeats the meaning sentence's.
        val second = candidates.firstOrNull { it.aspect != top.aspect }
        val secondSentence = second?.let { composeSecond(culture, top, it, day) }
            ?: DecreeBanks.noSecondFigure(culture)
        val sentences = listOf(
            composeMeaning(culture, top, day),
            composeConsequence(culture, top),
            composeImage(culture, top),
            secondSentence,
            composeInstruction(culture, top),
        )
        return DayDecree(
            headline = composeHeadline(culture, top),
            evidence = composeEvidence(culture, top),
            paragraph = sentences.joinToString(" "),
            tone = toneFor(top.aspect),
            comeBack = DecreeBanks.comeBack(culture),
            sentences = sentences,
            figures = listOf(top) + listOfNotNull(second) + candidates.filter { it != top && it != second },
        )
    }

    /** The day page for the UTC day containing [date]: the sky at 00:00 UTC. */
    fun composeDayPage(engine: AstronomyEngine, culture: AncientCulture, date: Date): DayDecree {
        val day = Math.floorDiv(date.time, DAY_MS)
        return compose(culture, chartAt(engine, Date(day * DAY_MS)), day)
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
