package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.AspectType
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.math.abs

/** One contact between the two charts: their body, yours, and the angle. */
data class Bond(
    val mine: Planet,
    val theirs: Planet,
    val aspect: AspectType,
    val orb: Double,
)

sealed class SynastryState {
    object NeedsChart : SynastryState()

    /** A chart is on the device; the second party has not been entered yet. */
    data class Waiting(val yourName: String, val culture: AncientCulture) : SynastryState()

    object Computing : SynastryState()

    data class Ready(
        val yourName: String,
        val theirName: String,
        val culture: AncientCulture,
        val bonds: List<Bond>,
    ) : SynastryState()

    data class Error(val message: String) : SynastryState()
}

/**
 * Two charts read against each other, web's /synastry.
 *
 * Web compares two SAVED charts, because web keeps many. This surface keeps
 * one birth record, so the second party is entered for the reading and not
 * stored: nothing about another person is written to this device. That is a
 * smaller feature than web's and a plainer promise, and it is the honest
 * shape for an app with one record.
 */
class SynastryViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
    private val settings: SettingsRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<SynastryState>(SynastryState.Computing)
    val state: StateFlow<SynastryState> = _state.asStateFlow()

    private var yours: NatalChartData? = null
    private var yourName: String = "You"
    private var culture: AncientCulture = AncientCulture.GREECE

    fun load() {
        viewModelScope.launch {
            try {
                culture = settings.selectedCulture.first() ?: AncientCulture.GREECE
                val profile = profiles.profile.first()
                if (profile == null) {
                    _state.value = SynastryState.NeedsChart
                    return@launch
                }
                yourName = profile.name.ifBlank { "You" }
                yours = withContext(Dispatchers.Default) {
                    CalculateNatalChartUseCase(astronomy).execute(profile)
                }
                _state.value = SynastryState.Waiting(yourName, culture)
            } catch (e: Exception) {
                Log.e(TAG, "Could not read your chart", e)
                _state.value = SynastryState.Error(
                    "Your chart could not be read: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    /**
     * Computes the bonds against a second party. The profile is built for the
     * calculation and dropped; it is never saved.
     */
    fun compare(theirName: String, birthDateUtc: Long, latitude: Double, longitude: Double) {
        val mine = yours ?: return
        viewModelScope.launch {
            _state.value = SynastryState.Computing
            try {
                val bonds = withContext(Dispatchers.Default) {
                    val theirProfile = UserProfile(
                        id = 0,
                        name = theirName,
                        birthDateUtc = birthDateUtc,
                        latitude = latitude,
                        longitude = longitude,
                        cityName = "",
                        timezoneId = "UTC",
                    )
                    val theirs = CalculateNatalChartUseCase(astronomy).execute(theirProfile)
                    bondsBetween(mine, theirs)
                }
                _state.value = SynastryState.Ready(
                    yourName = yourName,
                    theirName = theirName.ifBlank { "Them" },
                    culture = culture,
                    bonds = bonds,
                )
            } catch (e: Exception) {
                Log.e(TAG, "Could not compare the charts", e)
                _state.value = SynastryState.Error(
                    "The two charts could not be compared: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    fun reset() {
        _state.value = SynastryState.Waiting(yourName, culture)
    }

    /**
     * Every contact between one chart's bodies and the other's, using the one
     * documented orb table. Both directions matter here in a way they do not
     * inside a single chart: your Sun on their Saturn is not their Sun on
     * yours, so the pair is ordered rather than taken once.
     */
    private fun bondsBetween(mine: NatalChartData, theirs: NatalChartData): List<Bond> {
        val out = mutableListOf<Bond>()
        for (a in Planet.entries) {
            val myLongitude = mine.planets[a]?.longitude ?: continue
            for (b in Planet.entries) {
                val theirLongitude = theirs.planets[b]?.longitude ?: continue
                val separation = angularSeparation(myLongitude, theirLongitude)
                for (aspect in AspectType.entries) {
                    val orb = abs(separation - aspect.degree)
                    if (orb <= aspect.orb) {
                        out += Bond(a, b, aspect, orb)
                        break
                    }
                }
            }
        }
        return out.sortedBy { it.orb }
    }

    private fun angularSeparation(a: Double, b: Double): Double {
        val raw = abs(a - b) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    private companion object {
        const val TAG = "SynastryViewModel"
    }
}
