package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.local.room.UserProfile
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.LongTransitsComposer
import com.astra.antiqua.domain.NatalPoints
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.model.Planet
import java.util.Date
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
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

    /**
     * [natal] and [skyNow] feed the figure anatomy the detail screen wraps
     * around a span: the reader's points, and where every body stands now.
     */
    data class Ready(
        val spans: List<TransitSpan>,
        val now: Date,
        val natal: NatalPoints? = null,
        val skyNow: Map<Planet, Double> = emptyMap(),
    ) : SpansState()
    data class Error(val message: String) : SpansState()
}

/**
 * Every long-transit span: the five slow bodies against the Sun, the Moon,
 * the Ascendant and the Midheaven (web's readerSpans), walked once per birth
 * record and held until the record changes.
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

    private var job: Job? = null

    /** The birth record the spans on show were walked against; null when none are on show. */
    private var walked: UserProfile? = null

    /**
     * Reads the profile and walks the spans when they are not already on show
     * for it. Each call reads the profile again: with no birth record the page
     * shows NoChart and the next call looks again (a chart cast from the empty
     * state); a profile that differs from the one walked (a recast chart)
     * walks again; an error is retried on the next call. Once the spans are
     * walked for a profile, a later [now] is ignored: the instant stays the
     * one of the first walk until the profile changes or the ViewModel goes.
     * A call while a walk runs does nothing; the walk reads the profile again
     * when it ends and walks again if the record changed meanwhile, so it
     * never publishes an older chart's spans.
     */
    fun load(now: Date = Date()) {
        if (job?.isActive == true) return
        job = viewModelScope.launch {
            try {
                var profile = profiles.profile.first()
                if (profile == walked && _state.value is SpansState.Ready) return@launch
                while (true) {
                    val current = profile
                    if (current == null) {
                        walked = null
                        _state.value = SpansState.NoChart
                        return@launch
                    }
                    _state.value = SpansState.Loading
                    var natal: NatalPoints? = null
                    var skyNow: Map<Planet, Double> = emptyMap()
                    val spans = withContext(Dispatchers.Default) {
                        val chart = CalculateNatalChartUseCase(astronomy).execute(current)
                        natal = NatalPoints.of(chart)
                        skyNow = DayDecreeComposer.chartAt(astronomy, now)
                        val points = SkySeasonComposer.natal(astronomy, chart, current.latitude, current.longitude)
                        LongTransitsComposer.readerSpans(astronomy, points, now)
                    }
                    // A record saved while the walk ran (a recast) is walked instead of publishing these spans.
                    profile = profiles.profile.first()
                    if (profile != current) continue
                    walked = current
                    _state.value = SpansState.Ready(spans, now, natal, skyNow)
                    return@launch
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Could not compute the long transits", e)
                // Nothing walked: the next load tries again.
                walked = null
                _state.value = SpansState.Error(
                    "The long transits could not be computed: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    private companion object {
        const val TAG = "TransitsViewModel"
    }
}
