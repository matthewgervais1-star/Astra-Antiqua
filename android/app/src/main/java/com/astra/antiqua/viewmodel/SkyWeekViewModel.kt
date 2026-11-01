package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.SkyWeek
import com.astra.antiqua.domain.SkyWeekComposer
import com.astra.antiqua.model.AncientCulture
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Calendar
import java.util.Date

/**
 * Sky Week for the culture in force: seven charts and the Moon, composed off
 * the main thread. The week reads the sky alone, as web's does, so it needs no
 * birth record.
 */
class SkyWeekViewModel(private val astronomy: AstronomyEngine) : ViewModel() {

    private val _week = MutableStateFlow<SkyWeek?>(null)
    val week: StateFlow<SkyWeek?> = _week.asStateFlow()

    private var job: Job? = null
    private var loaded: Pair<AncientCulture, Int>? = null

    /**
     * Composes the week for [culture] on the local day of [now]. The same
     * culture on the same local day keeps the page it has, and so the reader's
     * scroll; the TODAY row moves at local midnight, so the key is the local
     * day. A newer call cancels an older one still running.
     */
    fun load(culture: AncientCulture, now: Date = Date()) {
        val c = Calendar.getInstance().apply { time = now }
        val key = culture to c.get(Calendar.YEAR) * 1000 + c.get(Calendar.DAY_OF_YEAR)
        if (key == loaded && (job?.isActive == true || _week.value != null)) return
        // Another culture's week is not drawn in this culture's chrome while the new one composes.
        if (loaded?.first != culture) _week.value = null
        loaded = key
        job?.cancel()
        job = viewModelScope.launch {
            try {
                _week.value = withContext(Dispatchers.Default) { SkyWeekComposer.compose(astronomy, culture, now) }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "Could not compose Sky Week", e)
                loaded = null
            }
        }
    }

    private companion object {
        const val TAG = "SkyWeekViewModel"
    }
}
