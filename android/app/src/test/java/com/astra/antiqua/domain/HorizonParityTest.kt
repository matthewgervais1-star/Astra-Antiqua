package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import java.time.Instant
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The season, the year and the day page read the long transits against a
 * chart as web does. Each golden (HorizonGoldens.kt) is web's output for one
 * day per culture against the screenshots' seeded chart; this test recomputes
 * it with Android's engine and composers and compares every string.
 */
class HorizonParityTest {
    private val engine = AstronomyEngine()

    private fun instantOf(golden: HorizonGolden) = Date.from(Instant.parse(golden.instantUtc))

    @Test
    fun `every culture's WHAT IS CHANGING matches web's, with a chart and without`() {
        assertEquals(AncientCulture.entries.toSet(), HORIZON_GOLDENS.map { it.culture }.toSet())
        for (g in HORIZON_GOLDENS) {
            val window = SkyEvents.currentSeason(engine, instantOf(g))
            val label = "${g.culture} at ${g.instantUtc}"
            val sky = SeasonStandouts.events(engine, window, null)
            assertEquals("$label without a chart", g.seasonSky, SeasonStandouts.whatIsChanging(g.culture, SeasonStandouts.standouts(g.culture, sky)))
            val natal = SeasonStandouts.events(engine, window, HORIZON_NATAL)
            assertEquals("$label with the chart", g.seasonNatal, SeasonStandouts.whatIsChanging(g.culture, SeasonStandouts.standouts(g.culture, natal)))
        }
    }

    @Test
    fun `the goldens reach the reader's own transits and an eclipse`() {
        // Guards the goldens themselves: a regeneration that lost either would
        // stop this test from proving the paths it is here for.
        assertTrue(HORIZON_GOLDENS.any { "your Midheaven" in it.seasonNatal || "your Ascendant" in it.seasonNatal })
        assertTrue(HORIZON_GOLDENS.any { HorizonBanks.eclipseBeat(lunar = false).headline in it.seasonNatal })
    }

    @Test
    fun `every culture's year spine matches web's spans, headlines and edges`() {
        for (g in HORIZON_GOLDENS) {
            val now = instantOf(g)
            val label = "${g.culture} at ${g.instantUtc}"
            val spine = LongTransits.yearSpine(engine, HORIZON_NATAL, now)
            val expected = g.yearSpine.map { it.split("|") }
            assertEquals("$label ids", expected.map { it[0] }, spine.map { it.id })
            assertEquals("$label headlines", expected.map { it[1] }, spine.map { LongTransits.spanHeadline(g.culture, it) })
            expected.zip(spine).forEach { (row, span) ->
                assertWithin("$label ${span.id} start", row[2].toLong(), span.start.time)
                assertWithin("$label ${span.id} end", row[3].toLong(), span.end.time)
            }
        }
    }

    @Test
    fun `every culture's day teaser matches web's`() {
        for (g in HORIZON_GOLDENS) {
            val teaser = LongTransits.teaser(engine, g.culture, instantOf(g), HORIZON_NATAL)
            val line = listOf(
                teaser.status.name.lowercase(),
                teaser.span?.id.orEmpty(),
                teaser.title.orEmpty(),
                teaser.through.orEmpty(),
            ).joinToString("|")
            assertEquals("${g.culture} at ${g.instantUtc}", g.teaser, line)
        }
    }

    private fun assertWithin(message: String, expected: Long, actual: Long) =
        assertTrue("$message: expected $expected, was $actual", kotlin.math.abs(expected - actual) <= EDGE_TOLERANCE_MS)

    private companion object {
        /** An exact pass bisects to a minute; an edge is a pass plus whole five-day steps. */
        const val EDGE_TOLERANCE_MS = 3_600_000L
    }
}
