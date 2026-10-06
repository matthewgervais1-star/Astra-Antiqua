package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The two surfaces print the same figure page. Each golden (FigureGoldens.kt)
 * is web's composeFigurePage for one figure per culture, without a chart and
 * against a fixed one; this test reads the same date's sky with Android's
 * engine, composes it in Kotlin, and compares every printed string.
 */
class FigureParityTest {
    private val engine = AstronomyEngine()

    private fun flat(p: FigurePage) = FigureGoldenPage(
        headline = p.headline,
        evidence = p.evidence,
        moveOne = p.anatomy.moveOne,
        moveTwo = p.anatomy.moveTwo,
        parts = p.anatomy.parts.joinToString(" / ") { "${it.phrase}|${it.tag}" },
        recurrence = p.anatomy.recurrence,
        actLine = p.anatomy.actLine,
        manifestations = p.anatomy.manifestations.joinToString(" · "),
        cards = p.anatomy.cards.joinToString(" · ") { it.title },
        lesson = p.anatomy.lesson,
    )

    @Test
    fun `every culture's figure page matches web's, with a chart and without`() {
        assertEquals(AncientCulture.entries.toSet(), FIGURE_GOLDENS.map { it.culture }.toSet())
        for (g in FIGURE_GOLDENS) {
            val label = "${g.culture} ${g.date} ${g.id}"
            val sky = FigureReadingComposer.composePage(engine, g.culture, g.date, g.id, null)!!
            assertEquals(label, g.sky, flat(sky))
            assertEquals(label, false, sky.natal)
            val natal = FigureReadingComposer.composePage(engine, g.culture, g.date, g.id, NatalPoints(g.natal, g.ascendant))!!
            assertEquals("$label natal", g.natalPage, flat(natal))
            assertEquals("$label natal", true, natal.natal)
            val window = natal.window!!
            assertTrue("$label window holds the instant", window.start <= natal.instant && window.end >= natal.instant)
        }
    }

    @Test
    fun `a figure the sky does not hold, or a bad id, opens on nothing`() {
        val g = FIGURE_GOLDENS.first()
        assertNull(FigureReadingComposer.composePage(engine, g.culture, g.date, "jupiter-trine-saturn", null))
        assertNull(FigureReadingComposer.composePage(engine, g.culture, "2026-02-30", g.id, null))
        assertNull(FigureReadingComposer.parseFigureId("mars-trine-mars"))
    }

    @Test
    fun `recurrence speaks each calendar's words`() {
        assertEquals("about every fourteen days", Recurrence.interval(AncientCulture.ROME, Recurrence.days(com.astra.antiqua.model.Planet.MOON, AspectType.SQUARE)))
        assertEquals("about every three decans", Recurrence.interval(AncientCulture.EGYPT, Recurrence.days(com.astra.antiqua.model.Planet.MOON, AspectType.CONJUNCTION)))
        assertEquals("about every two years", Recurrence.interval(AncientCulture.ROME, Recurrence.days(com.astra.antiqua.model.Planet.MARS, AspectType.OPPOSITION)))
        assertEquals("one hundred and sixty-five", Recurrence.numberWords(165))
    }
}
