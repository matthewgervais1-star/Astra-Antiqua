package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.SkySeason
import com.astra.antiqua.domain.SkySeasonComposer
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
import java.util.Calendar
import java.util.Date

/**
 * Sky Season for the culture in force: the sky's season first, which needs no
 * birth record, then the same page with the reader's house and wheel once the
 * chart is computed.
 */
class SkySeasonViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _season = MutableStateFlow<SkySeason?>(null)
    val season: StateFlow<SkySeason?> = _season.asStateFlow()

    private var job: Job? = null
    private var loaded: Pair<AncientCulture, Int>? = null

    /**
     * Composes the season for [culture] on the local day of [now]. The day
     * counter moves at local midnight, as web's does, so the key is the local
     * day; the same culture on the same day keeps the page it has, and so the
     * reader's scroll. A newer call cancels an older one still running.
     */
    fun load(culture: AncientCulture, now: Date = Date()) {
        val c = Calendar.getInstance().apply { time = now }
        val key = culture to c.get(Calendar.YEAR) * 1000 + c.get(Calendar.DAY_OF_YEAR)
        if (key == loaded && (job?.isActive == true || _season.value != null)) return
        // Another culture's season is not drawn in this culture's chrome while the new one composes.
        if (loaded?.first != culture) _season.value = null
        loaded = key
        job?.cancel()
        job = viewModelScope.launch {
            try {
                _season.value = withContext(Dispatchers.Default) { SkySeasonComposer.compose(astronomy, culture, now, null) }
                val profile = profiles.profile.first()
                if (profile == null) {
                    // No birth record yet: the next return composes again.
                    loaded = null
                    return@launch
                }
                _season.value = withContext(Dispatchers.Default) {
                    val chart = CalculateNatalChartUseCase(astronomy).execute(profile)
                    SkySeasonComposer.compose(astronomy, culture, now, chart.ascendant)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Could not compose Sky Season", e)
                loaded = null
            }
        }
    }

    private companion object {
        const val TAG = "SkySeasonViewModel"
    }
}
