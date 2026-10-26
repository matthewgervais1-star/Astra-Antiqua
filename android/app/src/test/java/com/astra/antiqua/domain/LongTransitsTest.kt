package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The year's spine headlines and the day page's teaser, rule by rule.
 * HorizonParityTest checks both against web's output for the seeded chart.
 */
class LongTransitsTest {
    private val engine = AstronomyEngine()

    private fun span(planet: Planet, aspect: AspectType, natalKey: String) = TransitSpan(
        id = "${planet.name.lowercase()}-${aspect.name.lowercase()}-$natalKey",
        transitPlanet = planet,
        natalKey = natalKey,
        natalLongitude = 0.0,
        aspect = aspect,
        start = Date(0),
        end = Date(0),
        passes = emptyList(),
        transitSign = ZodiacSign.LEO,
        transitDegree = 0.0,
    )

    @Test
    fun `a spine row names the body, the verb and the natal point in caps`() {
        val greece = AncientCulture.GREECE
        assertEquals("ZEUS CHALLENGES YOUR MIDHEAVEN", LongTransits.spanHeadline(greece, span(Planet.JUPITER, AspectType.SQUARE, "mc")))
        assertEquals(
            "KRONOS HOLDS THE FAR END OF THE AGORA AGAINST YOUR ASCENDANT",
            LongTransits.spanHeadline(greece, span(Planet.SATURN, AspectType.OPPOSITION, "asc")),
        )
        assertEquals(
            "ZEUS OFFERS FAIR COUNSEL TO YOUR NATAL HELIOS",
            LongTransits.spanHeadline(greece, span(Planet.JUPITER, AspectType.SEXTILE, "sun")),
        )
    }

    @Test
    fun `the teaser's line follows web's three states`() {
        val chosen = LongTransits.Teaser(
            status = LongTransits.TeaserStatus.ACTIVE,
            span = span(Planet.SATURN, AspectType.SQUARE, "mc"),
            title = "GEB IN THE RAM",
            through = "MAR 2027",
        )
        assertEquals("GEB IN THE RAM · THROUGH MAR 2027\u00A0→", LongTransits.teaserLine(chosen))
        assertEquals("CAST THE FIRST CHART TO READ ONE\u00A0→", LongTransits.teaserLine(LongTransits.Teaser(LongTransits.TeaserStatus.CTA)))
        assertEquals("NO SLOW BODY IN REACH RIGHT NOW", LongTransits.teaserLine(LongTransits.Teaser(LongTransits.TeaserStatus.NONE)))
    }

    @Test
    fun `the teaser's month is UTC's`() {
        assertEquals("MAR 2027", LongTransits.monthYearUtc(Date.from(Instant.parse("2027-03-31T23:30:00Z"))))
        assertEquals("APR 2027", LongTransits.monthYearUtc(Date.from(Instant.parse("2027-04-01T00:30:00Z"))))
    }

    @Test
    fun `without a chart the teaser asks for one`() {
        val teaser = LongTransits.teaser(engine, AncientCulture.ROME, Date(), null)
        assertEquals(LongTransits.TeaserStatus.CTA, teaser.status)
        assertNull(teaser.span)
    }

    @Test
    fun `when no span holds the day the teaser names the next to open`() {
        val now = Date.from(Instant.parse("2026-10-27T00:00:00Z"))
        // A lone natal degree no slow body touches today, found by walking the circle.
        val (natal, spans) = (0 until 360 step 7).asSequence()
            .map { listOf(NatalPoint("sun", it.toDouble())) }
            .map { it to TransitSpans.compute(engine, it, SLOW_BODIES, Date(now.time - 420L * 86_400_000L), 1200) }
            .first { (_, spans) -> spans.none { it.start.time <= now.time && now.time <= it.end.time } }

        val teaser = LongTransits.teaser(engine, AncientCulture.CARTHAGE, now, natal)

        assertEquals(LongTransits.TeaserStatus.UPCOMING, teaser.status)
        val next = spans.filter { it.start.time > now.time }.minBy { it.start.time }
        assertEquals(next.id, teaser.span!!.id)
        assertTrue(teaser.title!!.endsWith("IN THE ${HorizonBanks.signImage(next.transitSign)}"))
        assertEquals(LongTransits.monthYearUtc(next.end), teaser.through)
    }
}
