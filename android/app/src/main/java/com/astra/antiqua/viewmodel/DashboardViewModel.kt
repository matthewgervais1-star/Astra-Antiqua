package com.astra.antiqua.viewmodel

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.OracleRepository
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.data.local.room.AppDatabase
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.OracleContent
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
        val bigThreeDecrees: List<OracleContent>,
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
                val oracleRepository = OracleRepository(context, dataStoreManager)
                
                val database = AppDatabase.getDatabase(context)
                val userProfile = database.userDao().getUserProfile().first()
                
                if (userProfile != null) {
                    val chartData = withContext(Dispatchers.Default) {
                        useCase.execute(userProfile)
                    }
                    
                    val bigThreeDecrees = mutableListOf<OracleContent>()
                    
                    // Fetch for Sun
                    val sunPosition = chartData.planets[ClassicalPlanet.SUN]
                    if (sunPosition != null) {
                        oracleRepository.getDecree(ClassicalPlanet.SUN, sunPosition.longitude)?.let {
                            bigThreeDecrees.add(it.copy(planetPosition = sunPosition))
                        }
                    }
                    
                    // Fetch for Moon
                    val moonPosition = chartData.planets[ClassicalPlanet.MOON]
                    if (moonPosition != null) {
                        oracleRepository.getDecree(ClassicalPlanet.MOON, moonPosition.longitude)?.let {
                            bigThreeDecrees.add(it.copy(planetPosition = moonPosition))
                        }
                    }
                    
                    // High Priest Summary with "Fate, History, and Power" tone
                    val sunSign = sunPosition?.zodiacSign?.signName ?: "the unknown"
                    val moonSign = moonPosition?.zodiacSign?.signName ?: "the depths"
                    val culture = dataStoreManager.selectedPantheon.first()?.uppercase() ?: "GREECE"
                    
                    val summary = when (culture) {
                        "CARTHAGE" -> "The Decree is absolute. With the Sun in $sunSign, your life is a territory claimed by the Suffete. The Moon in $moonSign demands the sacrifice of your hesitation. Bow to the cosmic authority of the Ba'al Priest; power is the reward for the disciplined soul."
                        "EGYPT" -> "The scales of Ma'at find balance in your alignment. The Sun in $sunSign manifest the creative spark, while the Moon in $moonSign flows through the fertile banks of your fate. You are the architect of divine order against the rising chaos."
                        "CANAAN" -> "The Divine Council has spoken. With the Sun in $sunSign, El the Father of Years has marked your path with sovereign fire. The Moon in $moonSign binds you to Yarikh's silent tide. You walk between storm and stillness, chosen of the assembly."
                        "ROME" -> "Roma Aeterna records your fate in her annals. With the Sun in $sunSign, Jupiter Optimus Maximus grants you the auctoritas to command. The Moon in $moonSign binds you to Juno's watchful counsel. You stand in the Forum of destiny, heir to an empire of will."
                        else -> "The threads of history converge in your alignment. With the Sun in $sunSign, you carry the ancestral fire of command. Yet, the Moon in $moonSign whispers of a fate bound to the deep, silent waters of power. You are a bridge between the old world and the coming storm."
                    }
                    
                    _chartState.value = ChartState.Success(chartData, bigThreeDecrees, summary)
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
