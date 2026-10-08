package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The two surfaces print the same dive deeper and the same Do and Don't
 * lists. Each golden (DiveDeeperGoldens.kt) is web's composeDiveDeeper and
 * permissions for one day per culture, without a chart and against the
 * screenshots' seeded chart; this test reads the same day's sky with
 * Android's engine, composes it in Kotlin, and compares every string.
 */
class DiveDeeperParityTest {
    private val engine = AstronomyEngine()
    private val natal = NatalPoints(DIVE_NATAL, DIVE_NATAL_ASCENDANT)

    private fun flat(dd: DiveDeeper) = dd.groups.map { "${it.title}|${it.evidence}|${it.sentences.joinToString(" ")}" }

    private fun sky(golden: DiveDeeperGolden): Pair<Map<Planet, Double>, Long> {
        val instant = Date.from(Instant.parse(golden.instantUtc))
        val day = Math.floorDiv(instant.time, 86_400_000L)
        return DayDecreeComposer.chartAt(engine, Date(day * 86_400_000L)) to day
    }

    @Test
    fun `every culture's dive deeper matches web's, with a chart and without`() {
        assertEquals(AncientCulture.entries.toSet(), DIVE_DEEPER_GOLDENS.map { it.culture }.toSet())
        for (g in DIVE_DEEPER_GOLDENS) {
            val instant = Date.from(Instant.parse(g.instantUtc))
            val label = "${g.culture} at ${g.instantUtc}"
            val plain = DiveDeeperComposer.composeForDay(engine, g.culture, instant, null)
            assertEquals("$label without a chart", g.skyGroups, flat(plain))
            assertEquals(false, plain.natal)
            val read = DiveDeeperComposer.composeForDay(engine, g.culture, instant, natal)
            assertEquals("$label with the chart", g.natalGroups, flat(read))
            assertEquals(true, read.natal)
        }
    }

    @Test
    fun `every culture's Do and Don't lists match web's, from the sky and from the chart`() {
        for (g in DIVE_DEEPER_GOLDENS) {
            val (chart, day) = sky(g)
            val label = "${g.culture} at ${g.instantUtc}"
            val decree = DayDecreeComposer.compose(g.culture, chart, day)
            val plain = DayPermissionsComposer.forFigures(g.culture, decree.figures, day)
            assertEquals("$label sky proceed", g.skyProceed, plain.proceed)
            assertEquals("$label sky refrain", g.skyRefrain, plain.refrain)
            val read = DayPermissionsComposer.forNatal(g.culture, chart, natal.chart, day)!!
            assertEquals("$label natal proceed", g.natalProceed, read.proceed)
            assertEquals("$label natal refrain", g.natalRefrain, read.refrain)
        }
    }

    @Test
    fun `the lists turn with the day and fill four a column`() {
        val g = DIVE_DEEPER_GOLDENS.first()
        val (chart, day) = sky(g)
        val figures = DayDecreeComposer.dayFigures(chart)
        val today = DayPermissionsComposer.forFigures(g.culture, figures, day)
        val tomorrow = DayPermissionsComposer.forFigures(g.culture, figures, day + 1)
        assertEquals(4, today.proceed.size)
        assertEquals(4, today.refrain.size)
        assertNotEquals(today, tomorrow)
        // A body against its own natal place gives no figure.
        assertTrue(DayPermissionsComposer.natalFigures(chart, natal.chart).none { it.a == it.b })
    }

    @Test
    fun `a group whose figures are read above points there, as web prints it`() {
        // On 2026-10-22 the third group's only figures are read by the second (web's dump).
        val date = Date.from(Instant.parse("2026-10-22T00:00:00Z"))
        val expected = mapOf(
            AncientCulture.EGYPT to "The same weight that sits on the House of the Ka reaches here too, and it is weighed once.",
            AncientCulture.GREECE to "The answer given at the Oikos is the one this place hears too.",
            AncientCulture.CANAAN to "The matter heard at the Father's House is the same matter heard here.",
            AncientCulture.CARTHAGE to "The entry posted under the Courtyard is charged here as well, and it is not entered twice.",
            AncientCulture.ROME to "The sign read in the Domus falls here as well, and the augur does not take it twice.",
        )
        for ((culture, line) in expected) {
            val group = DiveDeeperComposer.composeForDay(engine, culture, date, null).groups[2]
            assertEquals(culture.name, listOf(line), group.sentences)
            assertEquals(false, group.quiet)
        }
    }

    @Test
    fun `a group no natal point sits in prints the quiet line`() {
        val g = DIVE_DEEPER_GOLDENS.first()
        val (chart, day) = sky(g)
        // Every natal body in Taurus from a rising in Aries: only the first group has a point.
        val crowded = NatalPoints(Planet.entries.mapIndexed { i, p -> p to 31.0 + i * 2.5 }.toMap(), 5.0)
        for (culture in AncientCulture.entries) {
            val decree = DayDecreeComposer.compose(culture, chart, day)
            val dd = DiveDeeperComposer.compose(culture, decree, chart, day, crowded)
            for (group in 1 until 4) {
                assertEquals(listOf(DiveDeeperBanks.quiet(culture, group)), dd.groups[group].sentences)
                assertTrue(dd.groups[group].quiet)
            }
        }
    }
}
