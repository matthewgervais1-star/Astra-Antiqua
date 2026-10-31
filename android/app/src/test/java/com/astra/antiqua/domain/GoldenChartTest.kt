package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.Planet
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Characterization test, not a correctness test: it locks in the body
 * longitudes this build's ephemeris pipeline produces for one fixed birth
 * moment and location, so unintended drift in later phases (a Julian-day
 * conversion tweak, a frame/aberration change in AstronomyEngine, an
 * ephemeris-library bump, etc.) shows up as a failing assertion instead of
 * shipping silently. The expected values were recorded by running this test
 * once against the code as of this commit; they are not independently
 * verified against an external ephemeris and are allowed to change
 * deliberately (updating this file) when a chart-math change is intentional.
 */
class GoldenChartTest {

    // 2000-06-15 14:30:00 UTC, Athens (37.9838N, 23.7275E).
    private val goldenProfile = UserProfile(
        name = "Golden Fixture",
        birthDateUtc = Instant.parse("2000-06-15T14:30:00Z").toEpochMilli(),
        latitude = 37.9838,
        longitude = 23.7275,
        cityName = "Athens",
        timezoneId = "Europe/Athens"
    )

    @Test
    fun `fixed birth moment produces stable planetary longitudes`() {
        val useCase = CalculateNatalChartUseCase(AstronomyEngine())
        val chart = useCase.execute(goldenProfile)

        val expectedLongitudes = mapOf(
            Planet.SUN to 84.7796,
            Planet.MOON to 250.1562,
            Planet.MERCURY to 107.6989,
            Planet.VENUS to 85.9182,
            Planet.MARS to 89.3847,
            Planet.JUPITER to 56.8199,
            Planet.SATURN to 54.9165
        )

        expectedLongitudes.forEach { (planet, expected) ->
            val actual = chart.planets.getValue(planet).longitude
            assertEquals("Longitude drifted for $planet", expected, actual, 0.01)
        }
    }
}
