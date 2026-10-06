package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import java.time.Instant
import java.util.Calendar
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The two surfaces print the same day page for the same instant. Each golden
 * (DayDecreeGoldens.kt) is web's composeDayPage run on web's ephemeris; this
 * test walks the same year with Android's own engine and the Kotlin port, and
 * compares the strings.
 */
class DayDecreeParityTest {
    private val engine = AstronomyEngine()

    @Test
    fun `every culture's day page matches web's for its golden instant`() {
        assertEquals(AncientCulture.entries.toSet(), DAY_DECREE_GOLDENS.map { it.culture }.toSet())
        for (golden in DAY_DECREE_GOLDENS) {
            val instant = Date.from(Instant.parse(golden.instantUtc))
            val decree = DayDecreeComposer.composeDayPage(engine, golden.culture, instant)
            val label = "${golden.culture} at ${golden.instantUtc}"
            assertEquals("$label headline", golden.headline, decree.headline)
            assertEquals("$label evidence", golden.evidence, decree.evidence)
            assertEquals("$label paragraph", golden.paragraph, decree.paragraph)
        }
    }

    @Test
    fun `every culture's daily message matches web's and is a subset of the page`() {
        for (golden in DAY_DECREE_GOLDENS) {
            val instant = Date.from(Instant.parse(golden.instantUtc))
            val message = DayDecreeComposer.dayMessage(engine, golden.culture, instant)
            assertEquals(golden.headline, message.headline)
            assertEquals(golden.messageBody, message.body)
            val page = DayDecreeComposer.composeDayPage(engine, golden.culture, instant).sentences
            message.body.split(Regex("""(?<=[.!?])\s+""")).forEach { assertTrue(it in page) }
        }
    }

    @Test
    fun `the sky picks the figure, and a held figure prints at least two new sentences`() {
        val start = Instant.parse("2026-09-29T00:00:00Z").toEpochMilli()
        for (culture in AncientCulture.entries) {
            var previous: DayDecree? = null
            for (i in 0 until 30) {
                val date = Date(start + i * 86_400_000L)
                val page = DayDecreeComposer.composeDayPage(engine, culture, date)
                val raw = DayDecreeComposer.dayFigures(DayDecreeComposer.chartAt(engine, date)).first()
                assertEquals("$culture day $i", raw, page.figures.first())
                val prev = previous
                if (prev != null && prev.figures.first().let { it.a == raw.a && it.b == raw.b && it.aspect == raw.aspect }) {
                    val changed = page.sentences.indices.count { page.sentences[it] != prev.sentences[it] }
                    assertTrue("$culture day $i changes $changed sentence(s)", changed >= 2)
                }
                previous = page
            }
        }
    }

    @Test
    fun `a week row whose figure is the row above's prints the holds line`() {
        val monday = Calendar.getInstance().apply { set(2026, Calendar.SEPTEMBER, 28, 0, 0, 0) }.time
        for (culture in AncientCulture.entries) {
            val days = WeekReading.build(engine, culture, monday, monday)
            assertEquals(culture.name, DecreeBanks.holds(culture), days[1].headline)
            assertTrue(days[0].headline != DecreeBanks.holds(culture))
        }
    }
}
