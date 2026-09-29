package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.NatalPoint
import com.astra.antiqua.domain.SLOW_BODIES
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.domain.TransitSpans
import com.astra.antiqua.model.Planet
import java.util.Date
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class SpansState {
    object Loading : SpansState()

    /** No birth record, so there is nothing to read a transit against. */
    object NoChart : SpansState()

    data class Ready(val spans: List<TransitSpan>, val now: Date) : SpansState()
    data class Error(val message: String) : SpansState()
}

/**
 * Every long-transit span: the five slow bodies against the Sun, the Moon
 * and the ascendant, computed once and held.
 *
 * The walk is expensive, so it runs on the default dispatcher and the screen
 * waits behind a loading state rather than recomputing per frame. The window
 * matches web's useSpans: start 420 days back and cover 1200, so today sits
 * inside it with room for spans already under way.
 */
class TransitsViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<SpansState>(SpansState.Loading)
    val state: StateFlow<SpansState> = _state.asStateFlow()

    private var computed = false

    fun load() {
        if (computed) return
        computed = true
        viewModelScope.launch {
            try {
                val profile = profiles.profile.first()
                if (profile == null) {
                    _state.value = SpansState.NoChart
                    return@launch
                }
                val now = Date()
                val spans = withContext(Dispatchers.Default) {
                    val chart = CalculateNatalChartUseCase(astronomy).execute(profile)
                    val points = buildList {
                        chart.planets[Planet.SUN]?.let { add(NatalPoint("sun", it.longitude)) }
                        chart.planets[Planet.MOON]?.let { add(NatalPoint("moon", it.longitude)) }
                        chart.houseCusps.getOrNull(1)?.let { add(NatalPoint("asc", it)) }
                    }
                    TransitSpans.compute(
                        engine = astronomy,
                        natalPoints = points,
                        transitPlanets = SLOW_BODIES,
                        start = Date(now.time - LOOKBACK_DAYS * DAY_MS),
                        days = WINDOW_DAYS,
                    )
                }
                _state.value = SpansState.Ready(spans, now)
            } catch (e: Exception) {
                Log.e(TAG, "Could not compute the long transits", e)
                _state.value = SpansState.Error(
                    "The long transits could not be computed: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    private companion object {
        const val TAG = "TransitsViewModel"
        const val DAY_MS = 86_400_000L
        const val LOOKBACK_DAYS = 420L
        const val WINDOW_DAYS = 1200
    }
}
