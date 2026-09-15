package com.astra.antiqua.data

import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.model.AncientCulture
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * What the app remembers between launches: the culture the reader chose, and
 * whether they have been through the first-run flow.
 *
 * This is an interface so a ViewModel can be tested with a fake instead of a
 * DataStore and an Android runtime. The culture crosses the boundary as the
 * enum rather than as a string: parsing it once here is what stops every
 * caller writing its own `valueOf` with its own fallback, which is how the
 * app came to have three of them.
 */
interface SettingsRepository {
    val selectedCulture: Flow<AncientCulture?>
    val isOnboardingCompleted: Flow<Boolean>
    suspend fun saveCulture(culture: AncientCulture)
    suspend fun setOnboardingCompleted(completed: Boolean)
}

class DataStoreSettingsRepository(
    private val dataStore: DataStoreManager,
) : SettingsRepository {

    override val selectedCulture: Flow<AncientCulture?> =
        dataStore.selectedPantheon.map { stored ->
            stored?.let { runCatching { AncientCulture.valueOf(it.uppercase()) }.getOrNull() }
        }

    override val isOnboardingCompleted: Flow<Boolean> = dataStore.isOnboardingCompleted

    override suspend fun saveCulture(culture: AncientCulture) {
        dataStore.savePantheon(culture.name)
    }

    override suspend fun setOnboardingCompleted(completed: Boolean) {
        dataStore.setOnboardingCompleted(completed)
    }
}
