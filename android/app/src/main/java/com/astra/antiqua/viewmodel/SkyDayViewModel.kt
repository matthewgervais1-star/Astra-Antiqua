package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.SkyDay
import com.astra.antiqua.domain.SkyDayComposer
import com.astra.antiqua.model.AncientCulture
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Date

/**
 * Sky Day for the culture in force: the sky's own page first, which needs no
 * birth record, then the same page with the chart rows and the long transit
 * once the chart is computed.
 */
class SkyDayViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _day = MutableStateFlow<SkyDay?>(null)
    val day: StateFlow<SkyDay?> = _day.asStateFlow()

    private var job: Job? = null
    private var loaded: Pair<AncientCulture, Long>? = null

    /**
     * Composes the page for [culture] on the UTC day of [now]. The screen calls
     * this each time it returns to the composition; the same culture on the
     * same UTC day keeps the page it has, so the chart rows stay and so does
     * the reader's scroll. A newer call cancels an older one still running.
     */
    fun load(culture: AncientCulture, now: Date = Date()) {
        val key = culture to Math.floorDiv(now.time, DAY_MS)
        if (key == loaded && (job?.isActive == true || _day.value != null)) return
        // Another culture's page is not drawn in this culture's chrome while the new one composes.
        if (loaded?.first != culture) _day.value = null
        loaded = key
        job?.cancel()
        job = viewModelScope.launch {
            try {
                _day.value = withContext(Dispatchers.Default) { SkyDayComposer.compose(astronomy, culture, now, null) }
                val profile = profiles.profile.first()
                if (profile == null) {
                    // No birth record yet: the next return composes again, so a record
                    // saved meanwhile brings the chart rows without waiting for tomorrow.
                    loaded = null
                    return@launch
                }
                _day.value = withContext(Dispatchers.Default) {
                    val chart = CalculateNatalChartUseCase(astronomy).execute(profile)
                    SkyDayComposer.compose(astronomy, culture, now, chart)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Could not compose Sky Day", e)
                loaded = null
            }
        }
    }

    private companion object {
        const val TAG = "SkyDayViewModel"
        const val DAY_MS = 86_400_000L
    }
}
