package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import java.time.Instant
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The long transits and the forecast walk against the Ascendant's degree, as
 * web does (natal.angles.ascendant in ForecastExperience.tsx, YearNave.tsx,
 * buildHomeBundle.ts), not against 0 degrees of the rising sign.
 */
class TransitAscendantTest {

    private val engine = AstronomyEngine()

    // New York, 1990-07-04T18:30Z: Ascendant 208.4559 (28°27′ Libra), first cusp 180.
    private val chart = CalculateNatalChartUseCase(engine).execute(
        UserProfile(
            name = "Golden Fixture",
            birthDateUtc = Instant.parse("1990-07-04T18:30:00Z").toEpochMilli(),
            latitude = 40.7128,
            longitude = -74.006,
            cityName = "New York",
            timezoneId = "America/New_York",
        ),
    )

    @Test
    fun `the asc point is the true Ascendant degree`() {
        val asc = natalPointsOf(chart).single { it.key == "asc" }
        assertEquals(chart.ascendant, asc.longitude, 0.0)
    }

    @Test
    fun `a span to the Ascendant is measured against its degree`() {
        val spans = TransitSpans.compute(
            engine = engine,
            natalPoints = natalPointsOf(chart),
            transitPlanets = SLOW_BODIES,
            start = Date.from(Instant.parse("2025-01-01T00:00:00Z")),
            days = 1200,
        ).filter { it.natalKey == "asc" }

        assertTrue("Expected a span to the Ascendant in 2025-2028", spans.isNotEmpty())
        spans.forEach { assertEquals(it.id, chart.ascendant, it.natalLongitude, 0.0) }
    }

    @Test
    fun `the figure and day readers take the Ascendant degree`() {
        assertEquals(chart.ascendant, NatalPoints.of(chart).ascendant, 0.0)
    }
}
