package com.astra.antiqua.viewmodel

import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.os.Build
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.local.room.AppDatabase
import com.astra.antiqua.data.local.room.UserProfile
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume

class LocationSearchViewModel : ViewModel() {
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchResults = MutableStateFlow<List<Address>>(emptyList())
    val searchResults: StateFlow<List<Address>> = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()

    private var searchJob: Job? = null

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
        // Debounce search
        searchJob?.cancel()
        if (query.length >= 3) {
            searchJob = viewModelScope.launch {
                delay(500) // 500ms debounce
                // We'll trigger this from the UI for now as it needs context,
                // but we manage the timing here.
            }
        } else {
            _searchResults.value = emptyList()
        }
    }

    fun searchLocation(context: Context, query: String) {
        if (query.length < 3) return
        
        viewModelScope.launch {
            _isSearching.value = true
            val results = withContext(Dispatchers.IO) {
                try {
                    if (!Geocoder.isPresent()) {
                        Log.e("LocationSearch", "Geocoder is not present on this device")
                        return@withContext emptyList<Address>()
                    }

                    val geocoder = Geocoder(context, Locale.getDefault())
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        suspendCancellableCoroutine { continuation ->
                            geocoder.getFromLocationName(query, 5, object : Geocoder.GeocodeListener {
                                override fun onGeocode(addresses: MutableList<Address>) {
                                    continuation.resume(addresses)
                                }
                                override fun onError(errorMessage: String?) {
                                    Log.e("LocationSearch", "Geocode error: $errorMessage")
                                    continuation.resume(emptyList())
                                }
                            })
                        }
                    } else {
                        @Suppress("DEPRECATION")
                        geocoder.getFromLocationName(query, 5) ?: emptyList()
                    }
                } catch (e: Exception) {
                    Log.e("LocationSearch", "Exception during geocoding", e)
                    emptyList()
                }
            }
            _searchResults.value = results
            _isSearching.value = false
        }
    }

    /**
     * [timezoneId] is the zone [birthDateUtc] was resolved against (see
     * [com.astra.antiqua.domain.resolveBirthDateUtcMillis] and
     * [com.astra.antiqua.domain.estimateZoneOffsetForLongitude]) -- an
     * explicit caller-supplied input, not read from `TimeZone.getDefault()`
     * here, so the stored profile stays consistent with whatever zone was
     * actually used to compute the birth instant. It is typically a fixed
     * UTC offset id (e.g. "+01:00") derived from the birth location's
     * longitude, not a real IANA zone id.
     */
    fun saveProfile(
        context: Context,
        name: String,
        birthDateUtc: Long,
        timezoneId: String,
        address: Address,
        onSaved: () -> Unit
    ) {
        viewModelScope.launch {
            try {
                val database = AppDatabase.getDatabase(context)
                val cityName = address.locality ?: address.subAdminArea ?: address.featureName ?: "Unknown"

                val profile = UserProfile(
                    name = name,
                    birthDateUtc = birthDateUtc,
                    latitude = address.latitude,
                    longitude = address.longitude,
                    cityName = cityName,
                    timezoneId = timezoneId
                )
                database.userDao().insertUserProfile(profile)
                withContext(Dispatchers.Main) {
                    onSaved()
                }
            } catch (e: Exception) {
                Log.e("LocationSearch", "Error saving profile", e)
            }
        }
    }
}
