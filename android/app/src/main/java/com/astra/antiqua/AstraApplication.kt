package com.astra.antiqua

import android.app.Application
import android.content.Context
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.data.DataStoreSettingsRepository
import com.astra.antiqua.data.NatalReadingRepository
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.RoomProfileRepository
import com.astra.antiqua.data.SettingsRepository
import com.astra.antiqua.data.account.AccountClient
import com.astra.antiqua.data.account.AccountRepository
import com.astra.antiqua.data.account.DataStoreSessionStore
import com.astra.antiqua.data.account.HttpAccountRepository
import com.astra.antiqua.data.account.KeystoreSessionCipher
import com.astra.antiqua.data.account.sessionDataStore
import com.astra.antiqua.data.local.datastore.DataStoreManager
import com.astra.antiqua.data.local.room.AppDatabase
import java.io.File
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import okhttp3.HttpUrl.Companion.toHttpUrl

/**
 * The dependency graph, built once for the process and handed to ViewModels
 * through [viewModelFactory].
 *
 * The rollout plan names Hilt as the default and asks for a reason if it is
 * not used. The reason is size: this graph is four objects deep with no
 * scoping beyond the process, and Hilt's value is in a graph large enough
 * that wiring it by hand becomes the bug. What the plan actually asks for is
 * that ViewModels stop taking Context per method and stop constructing their
 * own database, so they can be tested with fakes. Repository interfaces plus
 * this container deliver exactly that, with no annotation processor, no build
 * time and nothing to keep in step with the Kotlin and AGP versions. If the
 * graph grows scopes or a second entry point, Hilt becomes the right answer
 * and this is a small thing to replace.
 */
class AppContainer(context: Context) {
    private val appContext = context.applicationContext

    val astronomy: AstronomyEngine by lazy { AstronomyEngine() }

    val settings: SettingsRepository by lazy {
        DataStoreSettingsRepository(DataStoreManager(appContext))
    }

    val profiles: ProfileRepository by lazy {
        RoomProfileRepository(AppDatabase.getDatabase(appContext).userDao())
    }

    /**
     * Still takes a Context: it reads the shared content corpus out of the
     * APK's assets, which is a platform resource rather than a dependency.
     * The ViewModels no longer see it.
     */
    val readings: NatalReadingRepository by lazy { NatalReadingRepository(appContext) }

    /**
     * Work that must outlive the screen that started it: the PUT that
     * mirrors a profile save to the account. One failure never cancels the
     * next.
     */
    val appScope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    /**
     * Where an account export is written before the share sheet reads it.
     * `res/xml/export_paths.xml` shares this directory and nothing else.
     */
    val exportDir: File get() = File(appContext.cacheDir, "export")

    /**
     * The optional web account. Built on first use, so a reader who never
     * signs in never creates the Keystore key or the session file.
     */
    val account: AccountRepository by lazy {
        val session = DataStoreSessionStore(appContext.sessionDataStore, KeystoreSessionCipher())
        HttpAccountRepository(
            client = AccountClient(
                origin = BuildConfig.API_ORIGIN.toHttpUrl(),
                http = AccountClient.defaultHttpClient(),
                session = session,
            ),
            session = session,
            profiles = profiles,
        )
    }
}

class AstraApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
