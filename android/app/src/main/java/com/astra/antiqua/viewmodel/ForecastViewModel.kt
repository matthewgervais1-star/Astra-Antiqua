package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.NatalPoint
import com.astra.antiqua.domain.SLOW_BODIES
import com.astra.antiqua.domain.SkyEvent
import com.astra.antiqua.domain.SkyEvents
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.domain.TransitSpans
import com.astra.antiqua.domain.ZodiacSign
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import java.util.Date
import kotlin.math.floor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/** The moment the Sun returns to the degree it held at birth. */
data class SolarReturn(val date: Date, val sign: ZodiacSign, val degree: Double)

sealed class ForecastState {
    object Loading : ForecastState()
    object NoChart : ForecastState()
    data class Ready(
        val now: Date,
        val culture: AncientCulture,
        val solarReturn: SolarReturn?,
        /** Long transits to the natal points that are open inside the year. */
        val spans: List<TransitSpan>,
        /** Retrograde and direct stations in the same window. */
        val stations: List<SkyEvent>,
    ) : ForecastState()
    data class Error(val message: String) : ForecastState()
}

/**
 * The year ahead read against the reader's own chart, web's /forecast.
 *
 * Where the year horizon reports what the sky does, this reports what the sky
 * does TO a particular chart: the long transits open in the next twelve
 * months, the stations inside them, and the solar return that opens the
 * personal year.
 */
class ForecastViewModel(
    private val astronomy: AstronomyEngine,
    private val profiles: ProfileRepository,
    private val settings: SettingsRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<ForecastState>(ForecastState.Loading)
    val state: StateFlow<ForecastState> = _state.asStateFlow()

    private var built = false

    fun load() {
        if (built) return
        built = true
        viewModelScope.launch {
            try {
                val profile = profiles.profile.first()
                if (profile == null) {
                    _state.value = ForecastState.NoChart
                    return@launch
                }
                val culture = settings.selectedCulture.first() ?: AncientCulture.GREECE
                val now = Date()
                val ready = withContext(Dispatchers.Default) {
                    val chart = CalculateNatalChartUseCase(astronomy).execute(profile)
                    val points = buildList {
                        chart.planets[Planet.SUN]?.let { add(NatalPoint("sun", it.longitude)) }
                        chart.planets[Planet.MOON]?.let { add(NatalPoint("moon", it.longitude)) }
                        chart.houseCusps.getOrNull(1)?.let { add(NatalPoint("asc", it)) }
                    }
                    // A span open at any point in the coming year belongs in
                    // the forecast, so the walk starts behind today: a transit
                    // that began last autumn is still this year's weather.
                    val spans = TransitSpans.compute(
                        engine = astronomy,
                        natalPoints = points,
                        transitPlanets = SLOW_BODIES,
                        start = Date(now.time - LOOKBACK_DAYS * DAY_MS),
                        days = WINDOW_DAYS,
                    ).filter { it.end.time >= now.time && it.start.time <= now.time + YEAR_MS }

                    val stations = SkyEvents.stations(astronomy, now, YEAR_DAYS)
                    val natalSun = chart.planets[Planet.SUN]?.longitude
                    val solarReturn = natalSun?.let { solarReturnAfter(it, now) }

                    ForecastState.Ready(now, culture, solarReturn, spans, stations)
                }
                _state.value = ready
            } catch (e: Exception) {
                Log.e(TAG, "Could not build the forecast", e)
                _state.value = ForecastState.Error(
                    "The year could not be read: ${e.localizedMessage ?: "unknown error"}"
                )
            }
        }
    }

    /**
     * The next time the Sun stands at the natal degree. Found by walking a day
     * at a time to the crossing and then bisecting it, rather than assuming
     * the birthday: the return drifts by up to a day and a half against the
     * calendar, which is the whole reason it is computed rather than looked up.
     */
    private fun solarReturnAfter(natalSunLongitude: Double, from: Date): SolarReturn? {
        val target = ((natalSunLongitude % 360.0) + 360.0) % 360.0
        fun sunAt(date: Date): Double =
            astronomy.getPlanetPosition(
                date.time / 86_400_000.0 + 2440587.5,
                io.github.cosinekitty.astronomy.Body.Sun,
            ).longitude

        fun signedDiff(longitude: Double): Double {
            var diff = longitude - target
            while (diff > 180.0) diff -= 360.0
            while (diff < -180.0) diff += 360.0
            return diff
        }

        var previous = from
        var previousDiff = signedDiff(sunAt(previous))
        for (day in 1..YEAR_DAYS + 2) {
            val date = Date(from.time + day * DAY_MS)
            val diff = signedDiff(sunAt(date))
            if (previousDiff < 0 && diff >= 0) {
                var lo = previous.time
                var hi = date.time
                repeat(32) {
                    val mid = (lo + hi) / 2
                    if (signedDiff(sunAt(Date(mid))) < 0) lo = mid else hi = mid
                }
                val exact = Date(hi)
                val index = floor(target / 30.0).toInt() % 12
                return SolarReturn(exact, ZodiacSign.entries[index], target - index * 30.0)
            }
            previous = date
            previousDiff = diff
        }
        return null
    }

    private companion object {
        const val TAG = "ForecastViewModel"
        const val DAY_MS = 86_400_000L
        const val YEAR_DAYS = 365
        const val YEAR_MS = YEAR_DAYS * DAY_MS
        const val LOOKBACK_DAYS = 420L
        const val WINDOW_DAYS = 1200
    }
}
