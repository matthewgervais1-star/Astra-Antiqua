package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Date

/** One house group's paragraph on the day page. */
data class DiveGroup(
    /** "The Forum: your standing and your coin". */
    val title: String,
    /** The figure the paragraph reads, in mono; "" when quiet. */
    val evidence: String,
    /** The paragraph's sentences, the concrete line last; the quiet line alone when quiet. */
    val sentences: List<String>,
    val quiet: Boolean,
)

data class DiveDeeper(val groups: List<DiveGroup>, val natal: Boolean)

/**
 * The day page's dive deeper, ported from web/src/lib/diveDeeper.ts: four
 * paragraphs, one per house group. With a chart a group reads its tightest
 * transit to a natal point in its houses, from a body that moves daily when
 * one touches the group; without one, its tightest sky figure with a body
 * whose domain it keeps that no earlier group reads. Each paragraph says the
 * two domains and the day's relation, the consequence, and one concrete
 * thing. A group nothing touches prints the culture's quiet line; a group
 * whose figures are all read above points to the group that read them.
 * No line the page already prints, whole or inside a longer sentence, is
 * printed again. DiveDeeperParityTest pins it to web.
 */
object DiveDeeperComposer {
    private const val DAY_MS = 86_400_000L

    private data class Reading(
        val first: Planet,
        val second: Planet,
        val aspect: AspectType,
        val evidence: String,
        /** The consequence keys in order of preference; the Moon keys none. */
        val keys: List<Planet>,
        /** Set when every figure touching the group is read by this earlier group: the group points there. */
        val sharedWith: Int? = null,
    )

    /** "the Granary" from "The Granary: your work and your rations". */
    private fun groupName(title: String): String =
        title.substringBefore(":").replaceFirstChar { it.lowercase() }

    private fun capitalize(s: String): String = if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }

    /** True when a line, or a clause inside a longer sentence, is already on the page. */
    private fun onPage(line: String, printed: Set<String>): Boolean {
        val needle = line.removeSuffix(".").lowercase()
        return printed.any { it.lowercase().contains(needle) }
    }

    private fun longWords(line: String): Set<String> =
        Regex("[a-z']{5,}").findAll(line.lowercase()).map { it.value }.toSet()

    /**
     * The relation sentence for a group. Groups alternate between the two
     * variants the decree does not use today, then the day's own variant. A
     * choice whose clause is on the page already, alone or inside a longer
     * sentence, is skipped. Of the rest, the group takes the first that shares
     * the fewest words with the consequence.
     */
    private fun relationSentence(
        culture: AncientCulture,
        reading: Reading,
        day: Long,
        group: Int,
        consequence: String?,
        printed: Set<String>,
    ): String {
        val echo = consequence?.let { longWords(it) } ?: emptySet()
        val days = if (group % 2 == 0) listOf(day + 1, day + 2, day) else listOf(day + 2, day + 1, day)
        val choices = days.map { d ->
            val relation = DecreeBanks.relation(culture, reading.aspect, Math.floorMod(d, 3L).toInt())
            val clause = DayDecreeComposer.pairClause(
                culture,
                deityDomain(culture, reading.first),
                deityDomain(culture, reading.second),
                reading.aspect,
                d,
            )
            longWords(relation).count { it in echo } to "${capitalize(clause)}."
        }
        val fresh = choices.filter { !onPage(it.second, printed) }
        val pool = fresh.ifEmpty { choices }
        return pool.reduce { best, c -> if (c.first < best.first) c else best }.second
    }

    private fun composeGroup(
        culture: AncientCulture,
        group: Int,
        reading: Reading?,
        day: Long,
        printed: MutableSet<String>,
    ): DiveGroup {
        val title = DiveDeeperBanks.title(culture, group)
        if (reading == null) return DiveGroup(title, "", listOf(DiveDeeperBanks.quiet(culture, group)), true)
        reading.sharedWith?.let { earlier ->
            val line = DiveDeeperBanks.shared(culture).replace("{group}", groupName(DiveDeeperBanks.title(culture, earlier)))
            return DiveGroup(title, reading.evidence, listOf(line), false)
        }

        val consequence = reading.keys.filter { it != Planet.MOON }
            .map { DecreeBanks.consequence(culture, reading.aspect, it) }
            .firstOrNull { !onPage(it, printed) }
        val sentences = mutableListOf<String>()
        // A body against its own natal place reads one domain twice; the
        // contact then speaks through its consequence alone.
        if (reading.first != reading.second) {
            sentences += relationSentence(culture, reading, day, group, consequence, printed)
        }
        consequence?.let { sentences += it }
        val things = FigureBanks.manifestations(culture, group, DayDecreeComposer.toneFor(reading.aspect) == DayTone.HARMONY)
        val thing = things[Math.floorMod(day, things.size.toLong()).toInt()]
        sentences += DiveDeeperBanks.concrete(culture).replace("{thing}", thing)
        printed += sentences
        return DiveGroup(title, reading.evidence, sentences, false)
    }

    private fun skyReadings(culture: AncientCulture, figures: List<SkyFigure>): List<Reading?> {
        val usedBy = mutableMapOf<SkyFigure, Int>()
        return (0 until 4).map { group ->
            val touching = figures.filter {
                FigureReadingComposer.domainGroup(it.a) == group || FigureReadingComposer.domainGroup(it.b) == group
            }
            if (touching.isEmpty()) return@map null
            // A figure an earlier group reads is not read again; a group whose
            // figures are all taken points to the group that read its tightest.
            val f = touching.firstOrNull { it !in usedBy }
            if (f == null) {
                val top = touching.first()
                return@map Reading(top.a, top.b, top.aspect, DayDecreeComposer.composeEvidence(culture, top), emptyList(), usedBy.getValue(top))
            }
            usedBy[f] = group
            val (body, partner) = DayDecreeComposer.headlineBody(f.a, f.b)
            val (first, second) = if (FigureReadingComposer.domainGroup(body) == group) body to partner else partner to body
            Reading(first, second, f.aspect, DayDecreeComposer.composeEvidence(culture, f), listOf(first, second))
        }
    }

    private fun natalReadings(culture: AncientCulture, sky: Map<Planet, Double>, natal: NatalPoints): List<Reading?> {
        val hits = DayPermissionsComposer.transits(sky, natal.chart)
        return (0 until 4).map { group ->
            val h = hits
                .filter {
                    FigureReadingComposer.houseGroupIndex(
                        FigureReadingComposer.wholeSignHouse(natal.chart.getValue(it.b), natal.ascendant),
                    ) == group
                }
                // web's rankContacts: the Moon on the natal Moon last of all,
                // a body that moves daily first, a body against its own natal
                // place last within its speed, then by orb.
                .sortedWith(
                    compareBy<SkyFigure>(
                        { if (it.a == Planet.MOON && it.b == Planet.MOON) 1 else 0 },
                        { if (it.a in DayDecreeComposer.FAST_ORDER) 0 else 1 },
                        { if (it.a == it.b) 1 else 0 },
                        { it.orb },
                    ),
                )
                .firstOrNull() ?: return@map null
            Reading(
                first = h.a,
                second = h.b,
                aspect = h.aspect,
                evidence = FigureReadingComposer.bridge(culture, h.a, h.b, h.aspect, h.orb),
                // Keyed as the figure page keys a contact: by the natal point,
                // by the transiting body when that point is the Moon.
                keys = if (h.b == Planet.MOON) listOf(h.a) else listOf(h.b, h.a),
            )
        }
    }

    /** The four paragraphs for a day page: [sky] at 00:00 UTC, [day] its UTC day number, [natal] the reader's chart or null. */
    fun compose(culture: AncientCulture, decree: DayDecree, sky: Map<Planet, Double>, day: Long, natal: NatalPoints?): DiveDeeper {
        val readings = if (natal != null) natalReadings(culture, sky, natal) else skyReadings(culture, DayDecreeComposer.dayFigures(sky))
        val printed = (listOf(decree.headline) + decree.sentences).toMutableSet()
        return DiveDeeper(readings.mapIndexed { g, r -> composeGroup(culture, g, r, day, printed) }, natal != null)
    }

    /** The dive deeper for the UTC day containing [date], read at 00:00 UTC as the day page is. */
    fun composeForDay(engine: AstronomyEngine, culture: AncientCulture, date: Date, natal: NatalPoints?): DiveDeeper {
        val day = Math.floorDiv(date.time, DAY_MS)
        val sky = DayDecreeComposer.chartAt(engine, Date(day * DAY_MS))
        return compose(culture, DayDecreeComposer.compose(culture, sky, day), sky, day, natal)
    }
}
