package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.DayDecree
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.DayPermissions
import com.astra.antiqua.domain.DayPermissionsComposer
import com.astra.antiqua.domain.DiveDeeper
import com.astra.antiqua.domain.DiveDeeperComposer
import com.astra.antiqua.domain.FigureReadingComposer
import com.astra.antiqua.domain.NatalPoints
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.NatalPlacementReading
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Date

sealed class ChartState {
    object Loading : ChartState()
    data class Success(
        val chartData: NatalChartData,
        /** The Sun and the Moon, the two the dashboard prints as decree cards. */
        val bigThreePlacements: List<NatalPlacementReading>,
        /** Every body's composed reading, for the placement screen. */
        val placements: Map<Planet, NatalPlacementReading>,
        val highPriestSummary: String
    ) : ChartState()
    data class Error(val message: String) : ChartState()
}

/** What the day page prints under the decree: the lists and the dive deeper. */
data class DayExtras(
    val permissions: DayPermissions,
    /** True when the lists come from the day's transits to the reader's chart. */
    val listsFromChart: Boolean,
    val diveDeeper: DiveDeeper,
)

/**
 * The day's reading against the saved chart.
 *
 * Everything it needs arrives in the constructor. It used to take a Context
 * per call and build an engine, a DataStore, a database and a repository each
 * time the screen appeared, which is why nothing here could be tested.
 */
class DashboardViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
    private val settings: SettingsRepository,
    private val readings: NatalReadingRepository,
) : ViewModel() {

    private val _chartState = MutableStateFlow<ChartState>(ChartState.Loading)
    val chartState: StateFlow<ChartState> = _chartState.asStateFlow()

    /**
     * The day page: the sky at 00:00 UTC read in the culture in force. It
     * needs no birth record, so it is composed before the chart and shows even
     * when the chart fails.
     */
    private val _dayDecree = MutableStateFlow<DayDecree?>(null)
    val dayDecree: StateFlow<DayDecree?> = _dayDecree.asStateFlow()

    /**
     * The day's Do and Don't lists and its dive deeper: from the sky first,
     * then, once the chart is computed, from the day's transits to it.
     */
    private val _dayExtras = MutableStateFlow<DayExtras?>(null)
    val dayExtras: StateFlow<DayExtras?> = _dayExtras.asStateFlow()

    private fun extrasFor(culture: AncientCulture, decree: DayDecree, now: Date, natal: NatalPoints?): DayExtras {
        val day = Math.floorDiv(now.time, DAY_MS)
        val sky = DayDecreeComposer.chartAt(astronomy, Date(day * DAY_MS))
        val natalLists = natal?.let { DayPermissionsComposer.forNatal(culture, sky, it.chart, day) }
        return DayExtras(
            permissions = natalLists ?: DayPermissionsComposer.forFigures(culture, decree.figures, day),
            listsFromChart = natalLists != null,
            diveDeeper = DiveDeeperComposer.compose(culture, decree, sky, day, natal),
        )
    }

    /**
     * Read the day and the chart. A dated day (web's /?date=YYYY-MM-DD) reads
     * 00:00 UTC on [date], the instant the figure page read; a [date] that is
     * no day from 1900 to 2100 reads the live day, as web's useDatedDay does.
     */
    fun calculateChart(now: Date = Date(), date: String? = null) {
        val read = date?.let(FigureReadingComposer::parseIsoDate) ?: now
        viewModelScope.launch {
            _chartState.value = ChartState.Loading
            val dayCulture = settings.selectedCulture.first() ?: AncientCulture.GREECE
            try {
                // One hop to the background for the page, its lists and its dive deeper.
                val (decree, extras) = withContext(Dispatchers.Default) {
                    val page = DayDecreeComposer.composeDayPage(astronomy, dayCulture, read)
                    page to extrasFor(dayCulture, page, read, null)
                }
                _dayDecree.value = decree
                _dayExtras.value = extras
            } catch (e: Exception) {
                Log.e(TAG, "Error composing the day page", e)
            }
            try {
                val userProfile = profiles.profile.first()
                if (userProfile == null) {
                    Log.e(TAG, "User profile is null")
                    _chartState.value =
                        ChartState.Error("The Oracle cannot find your record. Please restart the onboarding.")
                    return@launch
                }

                // The lists and the dive deeper read the chart once it exists,
                // composed in the same hop as the chart.
                val decree = _dayDecree.value
                val (chartData, natalExtras) = withContext(Dispatchers.Default) {
                    val chart = CalculateNatalChartUseCase(astronomy).execute(userProfile)
                    val extras = if (decree != null) {
                        extrasFor(dayCulture, decree, read, NatalPoints.of(chart))
                    } else {
                        null
                    }
                    chart to extras
                }
                if (natalExtras != null) _dayExtras.value = natalExtras
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE

                // Compose every body once. The corpus covers all ten, the
                // composition is a string build rather than a lookup per
                // render, and the placement screen needs the other eight.
                val placements = chartData.planets.mapNotNull { (body, position) ->
                    readings.getReading(position, culture)?.let { body to it }
                }.toMap()

                val sunPosition = chartData.planets[Planet.SUN]
                val moonPosition = chartData.planets[Planet.MOON]
                val bigThree = listOfNotNull(
                    placements[Planet.SUN],
                    placements[Planet.MOON],
                )

                val sunSign = sunPosition?.zodiacSign?.signName ?: "the unknown"
                val moonSign = moonPosition?.zodiacSign?.signName ?: "the depths"
                val summary = LexiconDictionary.forCulture(culture).highPriestSummary(sunSign, moonSign)

                _chartState.value = ChartState.Success(chartData, bigThree, placements, summary)
            } catch (e: Exception) {
                Log.e(TAG, "Error calculating chart", e)
                _chartState.value = ChartState.Error(
                    "The celestial spheres are misaligned: ${e.localizedMessage ?: "Unknown error"}"
                )
            }
        }
    }

    private companion object {
        const val TAG = "DashboardViewModel"
        const val DAY_MS = 86_400_000L
    }
}
