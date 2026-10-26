package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.LongTransits
import com.astra.antiqua.domain.NatalPoint
import com.astra.antiqua.domain.SeasonStandouts
import com.astra.antiqua.domain.SkyEvent
import com.astra.antiqua.domain.SkyEvents
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.domain.WeekDay
import com.astra.antiqua.domain.WeekReading
import com.astra.antiqua.domain.natalPointsOf
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
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

sealed class SeasonState {
    object Loading : SeasonState()
    data class Ready(
        val window: SkyEvents.SeasonWindow,
        val events: List<SkyEvent>,
        val culture: AncientCulture,
        /** WHAT IS CHANGING: the season's two strongest beats, the reader's own transits among them. */
        val whatIsChanging: String,
    ) : SeasonState()
    data class Error(val message: String) : SeasonState()
}

sealed class YearState {
    object Loading : YearState()
    data class Ready(
        val start: Date,
        val events: List<SkyEvent>,
        val culture: AncientCulture,
        /** The year's long transits against the reader's chart, six at most; empty without one. */
        val spine: List<TransitSpan> = emptyList(),
    ) : YearState()
    data class Error(val message: String) : YearState()
}

/**
 * The week's seven days in the culture in force.
 *
 * Seven charts and their aspect tables is real work, so it runs off the main
 * thread and the screen waits. The culture is read here rather than passed in
 * because the reading's voice has to match the culture the app is actually
 * set to, not whatever a screen happened to be given.
 *
 * The season and the year also read the reader's chart when there is one, as
 * web's do: its Sun, Moon, Ascendant and Midheaven are what the long
 * transits are walked against.
 */
class HorizonViewModel(
    private val astronomy: AstronomyEngine,
    private val settings: SettingsRepository,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _week = MutableStateFlow<WeekState>(WeekState.Loading)
    val week: StateFlow<WeekState> = _week.asStateFlow()

    private val _season = MutableStateFlow<SeasonState>(SeasonState.Loading)
    val season: StateFlow<SeasonState> = _season.asStateFlow()

    private val _year = MutableStateFlow<YearState>(YearState.Loading)
    val year: StateFlow<YearState> = _year.asStateFlow()

    private var built = false
    private var seasonBuilt = false
    private var yearBuilt = false

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

    /** The reader's four points, or null when no chart is stored. */
    private suspend fun natalPoints(): List<NatalPoint>? {
        val profile = profiles.profile.first() ?: return null
        return withContext(Dispatchers.Default) {
            natalPointsOf(CalculateNatalChartUseCase(astronomy).execute(profile))
        }
    }

    /**
     * The season: the stretch the Sun spends in its current sign, and every
     * sky event inside it. The three inner planets are the ones whose sign
     * changes are worth naming over ten weeks; the outers barely move. Above
     * them, web's WHAT IS CHANGING.
     */
    fun loadSeason() {
        if (seasonBuilt) return
        seasonBuilt = true
        viewModelScope.launch {
            try {
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE
                val natal = natalPoints()
                val today = Date()
                val ready = withContext(Dispatchers.Default) {
                    val window = SkyEvents.currentSeason(astronomy, today)
                    val days = ((window.end.time - window.start.time) / 86_400_000L).toInt() + 1
                    val events = buildList {
                        addAll(SkyEvents.ingresses(astronomy, window.start, days, SEASON_BODIES))
                        addAll(SkyEvents.stations(astronomy, window.start, days))
                        addAll(SkyEvents.moonQuarters(astronomy, window.start, days))
                    }.filter { it.date.time <= window.end.time }.sortedBy { it.date.time }
                    val standouts = SeasonStandouts.standouts(culture, SeasonStandouts.events(astronomy, window, natal))
                    SeasonState.Ready(window, events, culture, SeasonStandouts.whatIsChanging(culture, standouts))
                }
                _season.value = ready
            } catch (e: Exception) {
                Log.e(TAG, "Could not read the season", e)
                _season.value = SeasonState.Error(
                    "The season could not be read: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    /**
     * The year: twelve months of sign changes and stations, from the start of
     * this month. The Moon is left out; thirteen ingresses a month would bury
     * everything else. With a chart, the year's spine as well: the long
     * transits from today, as web's /year reads them.
     */
    fun loadYear() {
        if (yearBuilt) return
        yearBuilt = true
        viewModelScope.launch {
            try {
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE
                val natal = natalPoints()
                val now = Date()
                val start = Calendar.getInstance().apply {
                    set(Calendar.DAY_OF_MONTH, 1)
                    set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }.time
                val (events, spine) = withContext(Dispatchers.Default) {
                    val events = buildList {
                        addAll(SkyEvents.ingresses(astronomy, start, YEAR_DAYS, YEAR_BODIES))
                        addAll(SkyEvents.stations(astronomy, start, YEAR_DAYS))
                    }.sortedBy { it.date.time }
                    events to natal?.let { LongTransits.yearSpine(astronomy, it, now) }.orEmpty()
                }
                _year.value = YearState.Ready(start, events, culture, spine)
            } catch (e: Exception) {
                Log.e(TAG, "Could not read the year", e)
                _year.value = YearState.Error(
                    "The year could not be read: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    private companion object {
        const val TAG = "HorizonViewModel"
        const val YEAR_DAYS = 365

        /** Over ten weeks these are the bodies that actually change sign. */
        val SEASON_BODIES = listOf(
            Planet.MERCURY,
            Planet.VENUS,
            Planet.MARS,
            Planet.SUN,
        )

        /** Every body but the Moon, whose monthly circuit would bury the rest. */
        val YEAR_BODIES = Planet.entries.filter { it != Planet.MOON }
    }
}
