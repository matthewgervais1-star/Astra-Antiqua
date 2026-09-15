package com.astra.antiqua.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.AppPhase
import com.astra.antiqua.ui.LauncherIcon
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/**
 * The first-run sequence and the culture in force.
 *
 * Dependencies arrive in the constructor rather than as a Context handed to
 * every method, so this can be built with fakes and tested without a device.
 * The culture arrives already parsed: [SettingsRepository] owns the one
 * `valueOf` and its fallback, where this class used to carry two of its own.
 */
class AppViewModel(
    private val settings: SettingsRepository,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _currentPhase = MutableStateFlow(AppPhase.ENGINE_WARMUP)
    val currentPhase: StateFlow<AppPhase> = _currentPhase.asStateFlow()

    private val _selectedCulture = MutableStateFlow(AncientCulture.GREECE)
    val selectedCulture: StateFlow<AncientCulture> = _selectedCulture.asStateFlow()

    /** Guards against the splash running again on every recomposition. */
    private var started = false

    fun start() {
        if (started) return
        started = true
        viewModelScope.launch {
            _currentPhase.value = AppPhase.ENGINE_WARMUP
            delay(SPLASH_MS)

            settings.selectedCulture.first()?.let { _selectedCulture.value = it }

            val completed = settings.isOnboardingCompleted.first()
            val profile = profiles.profile.first()

            _currentPhase.value = if (completed && profile != null) {
                AppPhase.MAIN_DASHBOARD
            } else {
                // A completed flag with no record behind it is a lie the app
                // told itself. Clear it rather than send the reader to a
                // dashboard with nothing to read.
                if (completed) settings.setOnboardingCompleted(false)
                AppPhase.CULTURE_SELECTION
            }
        }
    }

    fun selectCulture(culture: AncientCulture) {
        viewModelScope.launch {
            settings.saveCulture(culture)
            _selectedCulture.value = culture
            // The home screen icon follows the culture. Recorded here and
            // applied when the app stops: swapping the alias under a running
            // task closes it. LauncherIcon holds the mapping and the timing.
            LauncherIcon.request(culture)
            _currentPhase.value = AppPhase.ONBOARDING
        }
    }

    fun completeOnboarding() {
        viewModelScope.launch {
            settings.setOnboardingCompleted(true)
            _currentPhase.value = AppPhase.MAIN_DASHBOARD
        }
    }

    private companion object {
        /** Long enough for the monogram to be read, short enough not to wait on. */
        const val SPLASH_MS = 1500L
    }
}
