package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import java.time.Instant
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The two surfaces print the same day page for the same instant. Each golden
 * (DayDecreeGoldens.kt) is web's composer run on web's ephemeris; this test
 * computes the chart with Android's own engine at the same instant, composes
 * with the Kotlin port, and compares the strings.
 */
class DayDecreeParityTest {
    private val engine = AstronomyEngine()

    @Test
    fun `every culture's day page matches web's for its golden instant`() {
        assertEquals(AncientCulture.entries.toSet(), DAY_DECREE_GOLDENS.map { it.culture }.toSet())
        for (golden in DAY_DECREE_GOLDENS) {
            val chart = DayDecreeComposer.chartAt(engine, Date.from(Instant.parse(golden.instantUtc)))
            val decree = DayDecreeComposer.compose(golden.culture, chart)
            val label = "${golden.culture} at ${golden.instantUtc}"
            assertEquals("$label headline", golden.headline, decree.headline)
            assertEquals("$label evidence", golden.evidence, decree.evidence)
            assertEquals("$label paragraph", golden.paragraph, decree.paragraph)
        }
    }

    @Test
    fun `every culture's daily message matches web's and is a subset of the page`() {
        for (golden in DAY_DECREE_GOLDENS) {
            val chart = DayDecreeComposer.chartAt(engine, Date.from(Instant.parse(golden.instantUtc)))
            val message = DayDecreeComposer.dailyMessage(golden.culture, chart)
            assertEquals(golden.headline, message.headline)
            assertEquals(golden.messageBody, message.body)
            val page = DayDecreeComposer.compose(golden.culture, chart).paragraph
            val sentences = message.body.split(Regex("""(?<=[.!?])\s+"""))
            assertTrue(sentences.all { page.contains(it) })
        }
    }
}
