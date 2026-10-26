package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.room.UserProfile
import java.io.File
import java.time.Instant
import java.util.Date
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The long transits walk against the Midheaven as well, as web does
 * (natal.angles.midheaven in useSpans.ts, ForecastExperience.tsx, YearNave.tsx,
 * buildHomeBundle.ts), and the Midheaven is web's: computeAngularPoints in
 * web/src/lib/ascendant.ts on the fixed mean obliquity.
 */
class TransitMidheavenTest {

    @Serializable
    private data class Golden(val name: String, val utc: String, val lat: Double, val lon: Double, val midheaven: Double)

    @Serializable
    private data class Goldens(val tolerance: Double, val cases: List<Golden>)

    // The web goldens the C# core is pinned to (pnpm export:goldens), read in place.
    private val goldensFile = File("../../dotnet/AstraAntiqua.Core.Tests/TestData/goldens.json")

    private val json = Json { ignoreUnknownKeys = true }

    private val engine = AstronomyEngine()

    // New York, 1990-07-04T18:30Z: Ascendant 208.4559, Midheaven 123.68.
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
    fun `the Midheaven matches web's golden charts`() {
        assertTrue("Expected to find ${goldensFile.path}", goldensFile.exists())
        val goldens = json.decodeFromString<Goldens>(goldensFile.readText())
        assertTrue(goldens.cases.isNotEmpty())

        for (golden in goldens.cases) {
            val profile = UserProfile(
                name = golden.name,
                birthDateUtc = Instant.parse(golden.utc).toEpochMilli(),
                latitude = golden.lat,
                longitude = golden.lon,
                cityName = golden.name,
                timezoneId = "UTC",
            )
            val computed = CalculateNatalChartUseCase(engine).execute(profile)

            assertEquals(golden.name, golden.midheaven, computed.midheaven, goldens.tolerance)
        }
    }

    @Test
    fun `the points are the Sun, the Moon, the Ascendant and the Midheaven, in web's order`() {
        val points = natalPointsOf(chart)

        assertEquals(listOf("sun", "moon", "asc", "mc"), points.map { it.key })
        assertEquals(chart.midheaven, points.single { it.key == "mc" }.longitude, 0.0)
    }

    @Test
    fun `a span to the Midheaven is measured against its degree`() {
        val spans = TransitSpans.compute(
            engine = engine,
            natalPoints = natalPointsOf(chart),
            transitPlanets = SLOW_BODIES,
            start = Date.from(Instant.parse("2025-01-01T00:00:00Z")),
            days = 1200,
        ).filter { it.natalKey == "mc" }

        assertTrue("Expected a span to the Midheaven in 2025-2028", spans.isNotEmpty())
        spans.forEach { assertEquals(it.id, chart.midheaven, it.natalLongitude, 0.0) }
    }
}
