package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * The line under the placements table, web's /charts footer
 * (web/src/components/charts/ChartsInstrument.tsx):
 * `ASC {formatDegMin(degree)} {SIGN} · WHOLE-SIGN HOUSES`.
 *
 * Golden: New York (web/src/data/cities.ts: 40.7128, -74.006), 1990-07-04
 * 14:30 America/New_York, 18:30Z. Web's computeAngularPoints puts the
 * Ascendant at 208.4559, which its formatDegMin prints as 28°27′ Libra.
 */
class AscendantLineTest {

    private val newYork = UserProfile(
        name = "Golden Fixture",
        birthDateUtc = Instant.parse("1990-07-04T18:30:00Z").toEpochMilli(),
        latitude = 40.7128,
        longitude = -74.006,
        cityName = "New York",
        timezoneId = "America/New_York",
    )

    @Test
    fun `the New York chart prints web's ascendant line`() {
        val chart = CalculateNatalChartUseCase(AstronomyEngine()).execute(newYork)

        assertEquals("ASC 28°27′ LIBRA · WHOLE-SIGN HOUSES", chart.ascendantLine)
    }

    /**
     * Far from J2000 the obliquity of date and web's fixed mean obliquity
     * (23.4392911, web/src/lib/ascendant.ts) print different minutes. London
     * (web/src/data/cities.ts: 51.5074, -0.1278) at 1955-03-21T04:00Z: web's
     * computeAngularPoints gives 297.36077, printed 27°22′ Capricorn; the
     * obliquity of date gives 297.34793, which prints 27°21′.
     */
    @Test
    fun `a 1955 London chart prints web's ascendant line`() {
        val london = UserProfile(
            name = "Golden Fixture",
            birthDateUtc = Instant.parse("1955-03-21T04:00:00Z").toEpochMilli(),
            latitude = 51.5074,
            longitude = -0.1278,
            cityName = "London",
            timezoneId = "Europe/London",
        )
        val chart = CalculateNatalChartUseCase(AstronomyEngine()).execute(london)

        assertEquals(297.36077, chart.ascendant, 0.001)
        assertEquals("ASC 27°22′ CAPRICORN · WHOLE-SIGN HOUSES", chart.ascendantLine)
    }

    @Test
    fun `the chart keeps the ascendant longitude, not the first house cusp`() {
        val chart = CalculateNatalChartUseCase(AstronomyEngine()).execute(newYork)

        assertEquals(208.4559, chart.ascendant, 0.01)
        assertEquals(180.0, chart.houseCusps[1], 0.0)
    }

    @Test
    fun `the minute rounds as web's does`() {
        // 29.9995 degrees into Pisces rounds to 30°00′, which web holds at 29°59′.
        assertEquals("ASC 29°59′ PISCES · WHOLE-SIGN HOUSES", ascendantLine(359.9995))
        assertEquals("ASC 00°00′ ARIES · WHOLE-SIGN HOUSES", ascendantLine(0.0))
    }
}
