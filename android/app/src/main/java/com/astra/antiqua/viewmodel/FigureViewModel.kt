package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.FigurePage
import com.astra.antiqua.domain.FigureReadingComposer
import com.astra.antiqua.domain.NatalPoints
import com.astra.antiqua.model.AncientCulture
import java.util.Date
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class FigureState {
    object Loading : FigureState()

    /** The date or id does not parse, the pair is slow, or the sky did not hold the figure that day. */
    data class Missing(val reason: FigureReadingComposer.Missing) : FigureState()

    data class Ready(val page: FigurePage, val now: Date) : FigureState()
}

/**
 * One day's figure, web's /day/[date]/figure/[id]: composed against the
 * reader's chart when there is one and the figure touches it, against the
 * sky when not. The window walk samples the ephemeris every six hours, so it
 * runs off the main thread.
 */
class FigureViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {
    private val _state = MutableStateFlow<FigureState>(FigureState.Loading)
    val state: StateFlow<FigureState> = _state.asStateFlow()

    private var loadedKey: String? = null

    fun load(culture: AncientCulture, date: String, id: String) {
        val key = "$culture|$date|$id"
        if (loadedKey == key) return
        loadedKey = key
        _state.value = FigureState.Loading
        viewModelScope.launch {
            val page = withContext(Dispatchers.Default) {
                val natal = try {
                    profiles.profile.first()?.let { profile ->
                        val chart = CalculateNatalChartUseCase(astronomy).execute(profile)
                        val ascendant = chart.houseCusps.getOrNull(1)
                        if (ascendant == null) null else NatalPoints(chart.planets.mapValues { it.value.longitude }, ascendant)
                    }
                } catch (e: Exception) {
                    // A chart that cannot be computed reads as no chart: the sky figure still stands.
                    Log.e(TAG, "Could not compute the natal chart", e)
                    null
                }
                FigureReadingComposer.composePage(astronomy, culture, date, id, natal)
            }
            _state.value = if (page != null) {
                FigureState.Ready(page, Date())
            } else {
                val sky = FigureReadingComposer.parseIsoDate(date)?.let { DayDecreeComposer.chartAt(astronomy, it) }
                FigureState.Missing(FigureReadingComposer.missing(date, sky, id) ?: FigureReadingComposer.Missing.ABSENT)
            }
        }
    }

    private companion object {
        const val TAG = "FigureViewModel"
    }
}
