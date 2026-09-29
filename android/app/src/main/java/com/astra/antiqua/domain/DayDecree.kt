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

    /** Below this orb the meaning sentence carries the culture's exact tail. */
    const val EXACT_ORB = 0.5

    /** Below this orb the evidence line prints EXACT instead of the orb. */
    private const val EXACT_EVIDENCE_ORB = 0.1

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

    private fun meaningClause(culture: AncientCulture, a: Planet, b: Planet, aspect: AspectType): String =
        "${deityDomain(culture, a)} and ${deityDomain(culture, b)} ${DecreeBanks.relation(culture, aspect)}"

    /** Sentence (a): two domains and a relation, the exact tail under half a degree. */
    fun composeMeaning(culture: AncientCulture, f: SkyFigure): String {
        val tail = if (f.orb < EXACT_ORB) DecreeBanks.exactTail(culture) else ""
        return "${capitalize(meaningClause(culture, f.a, f.b, f.aspect))}$tail."
    }

    /** Sentence (b): the consequence for the reader, naming the partner god. */
    fun composeConsequence(culture: AncientCulture, f: SkyFigure): String {
        val partner = headlineBody(f.a, f.b).second
        return fill(DecreeBanks.consequence(culture, f.aspect), mapOf("partner" to name(culture, partner)))
    }

    fun composeHeadline(culture: AncientCulture, f: SkyFigure): String =
        DecreeBanks.headline(culture, f.aspect, headlineBody(f.a, f.b).first)

    /** Sentence (e): the one instruction, naming the headline god and its domain. */
    private fun composeInstruction(culture: AncientCulture, f: SkyFigure): String {
        val body = headlineBody(f.a, f.b).first
        return fill(
            DecreeBanks.instruction(culture, f.aspect),
            mapOf("god" to name(culture, body), "domain" to deityDomain(culture, body)),
        )
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
                val raw = abs(chart.getValue(a) - chart.getValue(b)) % 360.0
                val separation = if (raw > 180.0) 360.0 - raw else raw
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

    /** The day's candidates: every aspect touching a fast body, tightest first. */
    private fun dayFigures(chart: Map<Planet, Double>): List<SkyFigure> =
        aspectsOf(chart).filter { it.a in FAST_ORDER || it.b in FAST_ORDER }.sortedBy { it.orb }

    fun compose(culture: AncientCulture, chart: Map<Planet, Double>): DayDecree {
        val candidates = dayFigures(chart)
        val top = candidates.firstOrNull()
            ?: return DayDecree(
                headline = quietDayHeadline(culture),
                evidence = "",
                paragraph = quietDayLine(culture),
                tone = DayTone.QUIET,
                comeBack = DecreeBanks.comeBack(culture),
            )

        val god = name(culture, headlineBody(top.a, top.b).first)
        // A second figure only earns its sentence if it speaks in a different
        // aspect kind, so its relation never repeats the meaning sentence's.
        val second = candidates.firstOrNull {
            (it.a != top.a || it.b != top.b) && it.aspect != top.aspect
        }
        val secondSentence = if (second != null) {
            "${DecreeBanks.secondFigure(culture)} ${name(culture, second.a)} " +
                "${AspectVerbs.of(culture, second.aspect)} ${name(culture, second.b)}: " +
                "${meaningClause(culture, second.a, second.b, second.aspect)}."
        } else {
            DecreeBanks.noSecondFigure(culture)
        }

        val paragraph = listOf(
            composeMeaning(culture, top),
            composeConsequence(culture, top),
            fill(DecreeBanks.image(culture, top.aspect), mapOf("god" to god)),
            secondSentence,
            composeInstruction(culture, top),
        ).joinToString(" ")

        return DayDecree(
            headline = composeHeadline(culture, top),
            evidence = composeEvidence(culture, top),
            paragraph = paragraph,
            tone = toneFor(top.aspect),
            comeBack = DecreeBanks.comeBack(culture),
        )
    }

    /** The headline plus the meaning, the consequence and the instruction. */
    fun dailyMessage(culture: AncientCulture, chart: Map<Planet, Double>): DailyMessage {
        val top = dayFigures(chart).firstOrNull()
            ?: return DailyMessage(quietDayHeadline(culture), quietDayLine(culture), DayTone.QUIET)
        val body = listOf(
            composeMeaning(culture, top),
            composeConsequence(culture, top),
            composeInstruction(culture, top),
        ).joinToString(" ")
        return DailyMessage(composeHeadline(culture, top), body, toneFor(top.aspect))
    }

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
