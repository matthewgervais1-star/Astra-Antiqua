package com.astra.antiqua.ui.screens

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.DayPermissionsComposer
import com.astra.antiqua.domain.DiveDeeperComposer
import com.astra.antiqua.domain.NatalPoints
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayComposer
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DayExtras
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import java.util.Date

/**
 * The whole Sky Day page on one tall frame (390 wide), with the old Day
 * page's sections under the board's (Matthew, 2026-10-31: "Keep them below
 * Sky Day"), for the sample state. A picture of the page, not a placement check.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h5200dp-xxhdpi")
class SkyDayFullPageTest {

    @get:Rule
    val compose = createComposeRule()

    @get:Rule
    val zone = RomeZoneRule()

    @Test
    fun fullPage() {
        val culture = AncientCulture.EGYPT
        val engine = AstronomyEngine()
        val chart = CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth)
        val now = SkyDayTest.sampleNow
        val day = SkyDayComposer.compose(engine, culture, now, chart)

        // The old Day page's data, composed as DashboardViewModel composes it.
        val dayNumber = Math.floorDiv(now.time, 86_400_000L)
        val sky = DayDecreeComposer.chartAt(engine, Date(dayNumber * 86_400_000L))
        val natal = NatalPoints.of(chart)
        val extras = DayExtras(
            permissions = DayPermissionsComposer.forNatal(culture, sky, natal.chart, dayNumber)
                ?: DayPermissionsComposer.forFigures(culture, day.decree.figures, dayNumber),
            listsFromChart = true,
            diveDeeper = DiveDeeperComposer.compose(culture, day.decree, sky, dayNumber, natal),
        )
        val readings = NatalReadingRepository(RuntimeEnvironment.getApplication())
        val placements = chart.planets.mapNotNull { (body, position) -> readings.getReading(position, culture)?.let { body to it } }.toMap()
        val chartState = ChartState.Success(
            chartData = chart,
            bigThreePlacements = listOfNotNull(placements[Planet.SUN], placements[Planet.MOON]),
            placements = placements,
            highPriestSummary = "",
        )

        compose.setContent {
            AstraAntiquaTheme(selectedCulture = culture) {
                SkyDayFrame(culture = culture, day = day) { OldDaySections(culture, chartState, extras) }
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File("build/outputs/roborazzi/sky-day/sky-day-full.png").path)
    }
}
