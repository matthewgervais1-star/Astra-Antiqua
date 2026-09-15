package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.domain.WeekDay
import com.astra.antiqua.domain.WeekReading
import com.astra.antiqua.model.AncientCulture
import java.util.Calendar
import java.util.Date
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

sealed class WeekState {
    object Loading : WeekState()
    data class Ready(val days: List<WeekDay>, val start: Date, val end: Date) : WeekState()
    data class Error(val message: String) : WeekState()
}

/**
 * The week's seven days in the culture in force.
 *
 * Seven charts and their aspect tables is real work, so it runs off the main
 * thread and the screen waits. The culture is read here rather than passed in
 * because the reading's voice has to match the culture the app is actually
 * set to, not whatever a screen happened to be given.
 */
class HorizonViewModel(
    private val astronomy: AstronomyEngine,
    private val settings: SettingsRepository,
) : ViewModel() {

    private val _week = MutableStateFlow<WeekState>(WeekState.Loading)
    val week: StateFlow<WeekState> = _week.asStateFlow()

    private var built = false

    fun loadWeek() {
        if (built) return
        built = true
        viewModelScope.launch {
            try {
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE
                val today = Date()
                val start = WeekReading.weekStart(today)
                val days = withContext(Dispatchers.Default) {
                    WeekReading.build(astronomy, culture, start, today)
                }
                val end = Calendar.getInstance().apply {
                    time = start
                    add(Calendar.DAY_OF_MONTH, 6)
                }.time
                _week.value = WeekState.Ready(days, start, end)
            } catch (e: Exception) {
                Log.e(TAG, "Could not read the week", e)
                _week.value = WeekState.Error(
                    "The week could not be read: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    private companion object {
        const val TAG = "HorizonViewModel"
    }
}
