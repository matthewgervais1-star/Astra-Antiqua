package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.content.PlacementContentStore
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import java.io.File
import java.time.Instant
import org.junit.Assert.assertEquals
import org.junit.Test

/**
 * Characterization test for the dashboard's composed card output -- the
 * render-time cultural mask (DeityRegistry name/epithet + LexiconDictionary's
 * decree framing) layered over the universal placement paragraph
 * (PlacementContentStore, reading the real shared/content/planet-in-sign.json)
 * -- exercised end to end against the same fixed birth moment GoldenChartTest
 * locks in, so this is the test the rollout plan's Phase 3 gate names: "the
 * dashboard composition path is exercised by a golden characterization test."
 * A change to either the ephemeris pipeline or the composition itself shows
 * up here as a deliberate, visible diff rather than a silent copy change.
 * Recorded once by running this test against the code as of this commit.
 */
class NatalReadingComposerGoldenTest {

    // Same fixture as GoldenChartTest: 2000-06-15 14:30:00 UTC, Athens.
    private val goldenProfile = UserProfile(
        name = "Golden Fixture",
        birthDateUtc = Instant.parse("2000-06-15T14:30:00Z").toEpochMilli(),
        latitude = 37.9838,
        longitude = 23.7275,
        cityName = "Athens",
        timezoneId = "Europe/Athens"
    )

    private val placementStore = PlacementContentStore {
        File("../../shared/content/planet-in-sign.json").inputStream()
    }

    @Test
    fun `the Greek Sun reading for the golden chart matches the recorded composition`() {
        val chart = CalculateNatalChartUseCase(AstronomyEngine()).execute(goldenProfile)
        val sunPosition = chart.planets.getValue(ClassicalPlanet.SUN)

        val placementText = placementStore.textFor(sunPosition.planet, sunPosition.zodiacSign)
        val reading = NatalReadingComposer.compose(AncientCulture.GREECE, sunPosition, placementText)

        assertEquals(ZodiacSign.GEMINI, sunPosition.zodiacSign)
        assertEquals("Helios", reading.deityName)
        assertEquals("Who Sees All Things", reading.deityEpithet)
        assertEquals(
            "I am Helios, and this hour born under Gemini is read and sealed by my hand.",
            reading.decreeLine
        )
        assertEquals(
            "A self assembled out loud. The version of you that speaks is the one you keep, and the one that stays quiet never gets built. The risk is a self that exists only in company.",
            reading.placementText
        )
        // House number recorded from a real run against this fixture; see
        // GoldenChartTest for the same caveat -- not independently verified
        // against an external ephemeris, allowed to change deliberately when
        // a chart-math change is intentional.
        assertEquals(8, sunPosition.house)
        assertEquals("Eighth", reading.houseMeaning.ordinal)
        assertEquals("The Crossing", reading.houseMeaning.title)
    }
}
