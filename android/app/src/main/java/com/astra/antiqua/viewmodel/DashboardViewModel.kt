package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.NatalPlacementReading
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class ChartState {
    object Loading : ChartState()
    data class Success(
        val chartData: NatalChartData,
        val bigThreePlacements: List<NatalPlacementReading>,
        val highPriestSummary: String
    ) : ChartState()
    data class Error(val message: String) : ChartState()
}

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

    fun calculateChart() {
        viewModelScope.launch {
            _chartState.value = ChartState.Loading
            try {
                val userProfile = profiles.profile.first()
                if (userProfile == null) {
                    Log.e(TAG, "User profile is null")
                    _chartState.value =
                        ChartState.Error("The Oracle cannot find your record. Please restart the onboarding.")
                    return@launch
                }

                val chartData = withContext(Dispatchers.Default) {
                    CalculateNatalChartUseCase(astronomy).execute(userProfile)
                }
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE

                val bigThree = mutableListOf<NatalPlacementReading>()
                val sunPosition = chartData.planets[ClassicalPlanet.SUN]
                sunPosition?.let { readings.getReading(it, culture)?.let(bigThree::add) }
                val moonPosition = chartData.planets[ClassicalPlanet.MOON]
                moonPosition?.let { readings.getReading(it, culture)?.let(bigThree::add) }

                val sunSign = sunPosition?.zodiacSign?.signName ?: "the unknown"
                val moonSign = moonPosition?.zodiacSign?.signName ?: "the depths"
                val summary = LexiconDictionary.forCulture(culture).highPriestSummary(sunSign, moonSign)

                _chartState.value = ChartState.Success(chartData, bigThree, summary)
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
    }
}
