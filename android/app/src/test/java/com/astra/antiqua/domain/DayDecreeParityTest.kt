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
    fun `no sentence of the day page repeats within seven days, over thirty days`() {
        val start = Instant.parse("2026-09-29T00:00:00Z").toEpochMilli()
        for (culture in AncientCulture.entries) {
            val printed = mutableListOf<List<String>>()
            for (i in 0 until 30) {
                val page = DayDecreeComposer.composeDayPage(engine, culture, Date(start + i * 86_400_000L))
                val lines = listOf(page.headline) + page.sentences
                val window = printed.takeLast(DayDecreeComposer.REPEAT_WINDOW_DAYS - 1).flatten().toSet()
                assertEquals("$culture day $i", emptyList<String>(), lines.filter { it in window })
                printed += lines
            }
        }
    }

    @Test
    fun `the week never shows one headline twice`() {
        val monday = Calendar.getInstance().apply { set(2026, Calendar.SEPTEMBER, 7, 0, 0, 0) }
        for (week in 0 until 8) {
            val start = (monday.clone() as Calendar).apply { add(Calendar.DAY_OF_MONTH, week * 7) }.time
            for (culture in AncientCulture.entries) {
                val headlines = WeekReading.build(engine, culture, start, start).mapNotNull { it.headline }
                assertEquals("$culture week $week: $headlines", headlines.size, headlines.toSet().size)
            }
        }
    }
}
