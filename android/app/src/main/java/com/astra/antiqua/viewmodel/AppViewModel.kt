package com.astra.antiqua.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.data.local.room.AppDatabase
import com.astra.antiqua.model.AncientCulture
import kotlinx.coroutines.delay
import com.astra.antiqua.model.AppPhase
import com.astra.antiqua.ui.LauncherIcon
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class AppViewModel : ViewModel() {
    private val _currentPhase = MutableStateFlow(AppPhase.ENGINE_WARMUP)
    val currentPhase: StateFlow<AppPhase> = _currentPhase.asStateFlow()

    private val _selectedCulture = MutableStateFlow(AncientCulture.GREECE)
    val selectedCulture: StateFlow<AncientCulture> = _selectedCulture.asStateFlow()

    fun init(context: Context) {
        viewModelScope.launch {
            _currentPhase.value = AppPhase.ENGINE_WARMUP
            
            // Brief splash delay for animation
            delay(1500)

            // Load settings and determine next phase
            val dataStore = DataStoreManager(context)
            val database = AppDatabase.getDatabase(context)
            
            val hasCompletedSetup = dataStore.isOnboardingCompleted.first()
            val savedCulture = dataStore.selectedPantheon.first()
            val userProfile = database.userDao().getUserProfile().first()
            
            if (savedCulture != null) {
                try {
                    _selectedCulture.value = AncientCulture.valueOf(savedCulture.uppercase())
                } catch (_: Exception) {
                    _selectedCulture.value = AncientCulture.GREECE
                }
            }
            
            // On first launch or if no profile exists, go to Culture Selection
            if (hasCompletedSetup && userProfile != null) {
                _currentPhase.value = AppPhase.MAIN_DASHBOARD
            } else {
                // If profile is missing but setup was "completed", reset setup flag
                if (hasCompletedSetup && userProfile == null) {
                    dataStore.setOnboardingCompleted(false)
                }
                _currentPhase.value = AppPhase.CULTURE_SELECTION
            }
        }
    }

    fun updatePhase(newPhase: AppPhase) {
        _currentPhase.value = newPhase
    }

    fun selectCulture(context: Context, culture: String) {
        viewModelScope.launch {
            val dataStore = DataStoreManager(context)
            dataStore.savePantheon(culture)
            try {
                _selectedCulture.value = AncientCulture.valueOf(culture.uppercase())
            } catch (_: Exception) {
                _selectedCulture.value = AncientCulture.GREECE
            }
            // The home screen icon follows the culture. This is its one call
            // site; LauncherIcon holds the alias mapping.
            LauncherIcon.applyLauncherIcon(context, _selectedCulture.value)
            updatePhase(AppPhase.ONBOARDING)
        }
    }

    fun completeOnboarding(context: Context) {
        viewModelScope.launch {
            val dataStore = DataStoreManager(context)
            dataStore.setOnboardingCompleted(true)
            updatePhase(AppPhase.MAIN_DASHBOARD)
        }
    }
}
