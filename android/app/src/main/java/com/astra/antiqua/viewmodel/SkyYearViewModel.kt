package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.SkyYear
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.domain.SkyYearComposer
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
 * Sky Year for the culture in force: the year's turnings in both states, and
 * the annual report's segments, spine and votive when there is a birth record.
 */
class SkyYearViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _year = MutableStateFlow<SkyYear?>(null)
    val year: StateFlow<SkyYear?> = _year.asStateFlow()

    private var job: Job? = null
    private var loaded: Pair<AncientCulture, Int>? = null
    private var shown: AncientCulture? = null

    /**
     * Composes the year for [culture] from [now]. The kicker, TODAY and the
     * segments' day counts move at local midnight, so the key is the local
     * day; the same culture on the same day keeps the page it has, and so the
     * reader's scroll. A newer call cancels an older one still running.
     */
    fun load(culture: AncientCulture, now: Date = Date()) {
        val c = Calendar.getInstance().apply { time = now }
        val key = culture to c.get(Calendar.YEAR) * 1000 + c.get(Calendar.DAY_OF_YEAR)
        if (key == loaded && (job?.isActive == true || _year.value != null)) return
        // Another culture's year is not drawn in this culture's chrome while the new one composes.
        // The culture is kept apart from the key, which a page with no birth record clears.
        if (shown != culture) _year.value = null
        shown = culture
        loaded = key
        job?.cancel()
        job = viewModelScope.launch {
            try {
                // The profile first, so a reader with a chart never sees the page without it.
                val profile = profiles.profile.first()
                var chartFailed = false
                _year.value = withContext(Dispatchers.Default) {
                    // A chart that cannot be computed leaves the sky's year, not an empty page.
                    val natal = profile?.let { p ->
                        runCatching {
                            val chart = CalculateNatalChartUseCase(astronomy).execute(p)
                            SkySeasonComposer.natal(astronomy, chart, p.latitude, p.longitude)
                        }
                            .onFailure { Log.e(TAG, "Could not compute the chart for Sky Year", it) }
                            .getOrNull()
                    }
                    chartFailed = profile != null && natal == null
                    SkyYearComposer.compose(astronomy, culture, now, natal)
                }
                // No birth record yet, or one whose chart failed: the next return composes
                // again, so a record saved or mended meanwhile brings the segments, the
                // spine and the votive instead of the sky-only page until the next day.
                if (profile == null || chartFailed) loaded = null
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Could not compose Sky Year", e)
                loaded = null
            }
        }
    }

    private companion object {
        const val TAG = "SkyYearViewModel"
    }
}
