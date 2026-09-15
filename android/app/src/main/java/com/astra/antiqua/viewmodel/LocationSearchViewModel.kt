package com.astra.antiqua.viewmodel

import android.content.Context
import android.location.Address
import android.location.Geocoder
import android.os.Build
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.CityEntry
import com.astra.antiqua.data.Cities
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.local.room.UserProfile
import kotlinx.coroutines.Dispatchers
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

/**
 * A birthplace the reader can pick, from either source.
 *
 * The packaged list and the geocoder used to be different types, and the
 * screen only knew the geocoder's, so with no network there was nothing to
 * choose and no way past the first run at all. One type, two sources.
 */
data class Place(
    val label: String,
    val cityName: String,
    val latitude: Double,
    val longitude: Double,
    /** True where the place came from the packaged list rather than the network. */
    val offline: Boolean,
)

class LocationSearchViewModel(
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _searchResults = MutableStateFlow(Cities.POPULAR.map(::placeOf))
    val searchResults: StateFlow<List<Place>> = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()

    private var searchJob: Job? = null

    /**
     * The packaged matches appear as the reader types, with no wait and no
     * network. The geocoder is then asked in the background and its answers
     * appended, so a place that is not on the list still resolves and the
     * field is never empty while that happens.
     */
    fun onSearchQueryChanged(context: Context, query: String) {
        _searchQuery.value = query
        _searchResults.value = Cities.search(query).map(::placeOf)

        searchJob?.cancel()
        if (query.trim().length < MIN_QUERY) return
        searchJob = viewModelScope.launch {
            delay(DEBOUNCE_MS)
            searchLocation(context, query)
        }
    }

    fun searchLocation(context: Context, query: String) {
        if (query.trim().length < MIN_QUERY) return
        viewModelScope.launch {
            _isSearching.value = true
            val found = withContext(Dispatchers.IO) { geocode(context, query) }
            // The packaged matches stay on top: they are instant, and they
            // were chosen for being places people are actually born.
            val offline = Cities.search(query).map(::placeOf)
            val extra = found.filterNot { remote ->
                offline.any { it.cityName.equals(remote.cityName, ignoreCase = true) }
            }
            _searchResults.value = offline + extra
            _isSearching.value = false
        }
    }

    private suspend fun geocode(context: Context, query: String): List<Place> = try {
        if (!Geocoder.isPresent()) {
            Log.w(TAG, "No geocoder here; the packaged list is the whole picker")
            emptyList()
        } else {
            val geocoder = Geocoder(context, Locale.getDefault())
            val addresses = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                suspendCancellableCoroutine { continuation ->
                    geocoder.getFromLocationName(
                        query,
                        MAX_REMOTE,
                        object : Geocoder.GeocodeListener {
                            override fun onGeocode(addresses: MutableList<Address>) {
                                continuation.resume(addresses)
                            }

                            override fun onError(errorMessage: String?) {
                                Log.w(TAG, "Geocode error: $errorMessage")
                                continuation.resume(emptyList())
                            }
                        },
                    )
                }
            } else {
                @Suppress("DEPRECATION")
                geocoder.getFromLocationName(query, MAX_REMOTE) ?: emptyList()
            }
            addresses.map(::placeOf)
        }
    } catch (e: Exception) {
        Log.w(TAG, "The geocoder could not be reached", e)
        emptyList()
    }

    /**
     * Saves the one birth record this app keeps.
     *
     * [timezoneId] is the zone [birthDateUtc] was resolved against (see
     * `resolveBirthDateUtcMillis` and `estimateZoneOffsetForLongitude`): an
     * explicit caller-supplied input, not read from the device here, so the
     * stored profile stays consistent with the zone actually used to compute
     * the birth instant. It is typically a fixed UTC offset derived from the
     * birth location's longitude rather than a real IANA zone id.
     */
    fun saveProfile(
        name: String,
        birthDateUtc: Long,
        timezoneId: String,
        place: Place,
        onSaved: () -> Unit,
    ) {
        viewModelScope.launch {
            try {
                profiles.save(
                    UserProfile(
                        name = name,
                        birthDateUtc = birthDateUtc,
                        latitude = place.latitude,
                        longitude = place.longitude,
                        cityName = place.cityName,
                        timezoneId = timezoneId,
                    )
                )
                onSaved()
            } catch (e: Exception) {
                Log.e(TAG, "Error saving profile", e)
            }
        }
    }

    private companion object {
        const val TAG = "LocationSearch"
        const val DEBOUNCE_MS = 400L
        const val MIN_QUERY = 3
        const val MAX_REMOTE = 5
    }
}

private fun placeOf(city: CityEntry) = Place(
    label = "${city.name}, ${city.country}",
    cityName = city.name,
    latitude = city.latitude,
    longitude = city.longitude,
    offline = true,
)

private fun placeOf(address: Address): Place {
    val city = address.locality ?: address.subAdminArea ?: address.featureName ?: "Unknown"
    return Place(
        label = address.getAddressLine(0) ?: "$city, ${address.countryName.orEmpty()}",
        cityName = city,
        latitude = address.latitude,
        longitude = address.longitude,
        offline = false,
    )
}
