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
 * Sky Season for the culture in force, with the reader's house and wheel when
 * there is a birth record and web's sentence for the sky alone when there is none.
 */
class SkySeasonViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _season = MutableStateFlow<SkySeason?>(null)
    val season: StateFlow<SkySeason?> = _season.asStateFlow()

    private var job: Job? = null
    private var loaded: Pair<AncientCulture, Int>? = null
    private var shown: AncientCulture? = null

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
        // The culture is kept apart from the key, which a page with no birth record clears.
        if (shown != culture) _season.value = null
        shown = culture
        loaded = key
        job?.cancel()
        job = viewModelScope.launch {
            try {
                // The profile first, so a reader with a chart never sees the page without it.
                val profile = profiles.profile.first()
                _season.value = withContext(Dispatchers.Default) {
                    // A chart that cannot be computed leaves the sky's season, not an empty page.
                    val ascendant = profile?.let { p ->
                        runCatching { CalculateNatalChartUseCase(astronomy).execute(p).ascendant }
                            .onFailure { Log.e(TAG, "Could not compute the chart for Sky Season", it) }
                            .getOrNull()
                    }
                    SkySeasonComposer.compose(astronomy, culture, now, ascendant)
                }
                // No birth record yet: the next return composes again, so a record saved
                // meanwhile brings the house and the wheel.
                if (profile == null) loaded = null
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
