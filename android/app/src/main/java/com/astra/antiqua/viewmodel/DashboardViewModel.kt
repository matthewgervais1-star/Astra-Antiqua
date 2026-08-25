package com.astra.antiqua.viewmodel

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.data.local.room.AppDatabase
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

class DashboardViewModel : ViewModel() {

    private val _chartState = MutableStateFlow<ChartState>(ChartState.Loading)
    val chartState: StateFlow<ChartState> = _chartState.asStateFlow()

    fun calculateChart(context: Context) {
        viewModelScope.launch {
            _chartState.value = ChartState.Loading
            try {
                val astronomyEngine = AstronomyEngine()
                val useCase = CalculateNatalChartUseCase(astronomyEngine)

                val dataStoreManager = DataStoreManager(context)
                val natalReadingRepository = NatalReadingRepository(context)

                val database = AppDatabase.getDatabase(context)
                val userProfile = database.userDao().getUserProfile().first()

                if (userProfile != null) {
                    val chartData = withContext(Dispatchers.Default) {
                        useCase.execute(userProfile)
                    }

                    // The single AncientCulture -> JSON-column mapping that used
                    // to live here (a hardcoded `when (culture) { "CARTHAGE" ->
                    // ... }` of summary strings) is gone: culture now parses
                    // straight to the enum, exactly as AppViewModel already
                    // does, and both the summary and the decree line read from
                    // LexiconDictionary.forCulture -- the one culture-keyed
                    // mapping left after this migration.
                    val culture = runCatching {
                        AncientCulture.valueOf(
                            dataStoreManager.selectedPantheon.first()?.uppercase()
                                ?: AncientCulture.GREECE.name
                        )
                    }.getOrDefault(AncientCulture.GREECE)

                    val bigThreePlacements = mutableListOf<NatalPlacementReading>()

                    // Sun
                    val sunPosition = chartData.planets[ClassicalPlanet.SUN]
                    if (sunPosition != null) {
                        natalReadingRepository.getReading(sunPosition, culture)?.let {
                            bigThreePlacements.add(it)
                        }
                    }

                    // Moon
                    val moonPosition = chartData.planets[ClassicalPlanet.MOON]
                    if (moonPosition != null) {
                        natalReadingRepository.getReading(moonPosition, culture)?.let {
                            bigThreePlacements.add(it)
                        }
                    }

                    // High Priest Summary with "Fate, History, and Power" tone
                    val sunSign = sunPosition?.zodiacSign?.signName ?: "the unknown"
                    val moonSign = moonPosition?.zodiacSign?.signName ?: "the depths"
                    val summary = LexiconDictionary.forCulture(culture).highPriestSummary(sunSign, moonSign)

                    _chartState.value = ChartState.Success(chartData, bigThreePlacements, summary)
                } else {
                    Log.e("DashboardViewModel", "User profile is null")
                    _chartState.value = ChartState.Error("The Oracle cannot find your record. Please restart the onboarding.")
                }
            } catch (e: Exception) {
                Log.e("DashboardViewModel", "Error calculating chart", e, )
                _chartState.value = ChartState.Error("The celestial spheres are misaligned: ${e.localizedMessage ?: "Unknown error"}")
            }
        }
    }
}
