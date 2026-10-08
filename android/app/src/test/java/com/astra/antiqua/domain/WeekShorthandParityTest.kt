package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.util.Date
import java.util.TimeZone
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

/**
 * The week's shorthand as web builds it (web/src/lib/weekReading.ts,
 * `WeekShorthand`): bodies and the aspect kind as data, which the screen draws
 * as deity glyphs and the aspect glyph, and an ingress's sign printed with
 * [ZodiacSign.abbr].
 *
 * Expected values: web's buildWeekDays("rome", new Date(2026, 1, 16), null)
 * under TZ=UTC, Node 24, 2026-10-08. The week holds every kind of row,
 * including the Sun entering Pisces, which web prints as PSC.
 */
class WeekShorthandParityTest {

    private lateinit var savedZone: TimeZone

    @Before
    fun pinZone() {
        savedZone = TimeZone.getDefault()
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    }

    @After
    fun restoreZone() {
        TimeZone.setDefault(savedZone)
    }

    @Test
    fun `the week of 2026-02-16 carries web's shorthand`() {
        val start = Date.from(Instant.parse("2026-02-16T00:00:00Z"))
        val days = WeekReading.build(AstronomyEngine(), AncientCulture.ROME, start, start)

        assertEquals(
            listOf(
                WeekShorthand.Aspect(Planet.SUN, AspectType.SQUARE, Planet.URANUS, tight = true),
                WeekShorthand.Aspect(Planet.MERCURY, AspectType.TRINE, Planet.JUPITER, tight = true),
                WeekShorthand.Ingress(Planet.SUN, ZodiacSign.PISCES),
                WeekShorthand.Aspect(Planet.MOON, AspectType.CONJUNCTION, Planet.MERCURY, tight = true),
                WeekShorthand.Quiet,
                WeekShorthand.Aspect(Planet.MOON, AspectType.SQUARE, Planet.JUPITER, tight = false),
                WeekShorthand.Aspect(Planet.VENUS, AspectType.TRINE, Planet.JUPITER, tight = false),
            ),
            days.map { it.shorthand },
        )
    }

    @Test
    fun `an ingress prints the arrow and the sign's abbreviation`() {
        assertEquals("→ PSC", WeekShorthand.Ingress(Planet.SUN, ZodiacSign.PISCES).tail)
    }

    @Test
    fun `an aspect prints web's aspect glyph between the bodies and TIGHT after`() {
        val aspect = WeekShorthand.Aspect(Planet.SUN, AspectType.SQUARE, Planet.URANUS, tight = true)
        assertEquals("□", aspect.glyph)
        assertEquals("TIGHT", aspect.tail)
        assertEquals(null, aspect.copy(tight = false).tail)
    }
}
