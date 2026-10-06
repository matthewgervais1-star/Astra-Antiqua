package com.astra.antiqua.data.account

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.datastore.core.DataStore
import androidx.datastore.core.handlers.ReplaceFileCorruptionHandler
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import java.io.IOException
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.security.ProviderException
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.transformLatest

/** The name of the web's session cookie (`web/src/lib/auth/session.ts`). */
const val SESSION_COOKIE = "astra_session"

/**
 * The web session: the `astra_session` cookie value, a signed JWT the server
 * issues on sign-up and sign-in, and the moment the cookie expires.
 *
 * [toString] never prints the token, so a session that reaches a log line or
 * an exception message by accident carries nothing anyone can replay.
 */
data class Session(val token: String, val expiresAtMillis: Long) {
    fun isExpired(nowMillis: Long): Boolean = nowMillis >= expiresAtMillis
    override fun toString(): String = "Session(token=<redacted>, expiresAtMillis=$expiresAtMillis)"
}

/**
 * The device could not store or remove the session: the Keystore refused the
 * key, or the DataStore file could not be written. The repository turns this
 * into [AccountError.DeviceWriteFailed]. The message never names the token.
 */
class SessionStorageException(cause: Throwable) : RuntimeException("The session could not be stored.", cause)

/**
 * Where the session lives between launches. An interface so the client and
 * the repository can be tested with an in-memory store on the JVM.
 */
interface SessionStore {
    /**
     * True while a readable, unexpired session is stored. Turns false when
     * the session expires, without waiting for another write.
     */
    val isPresent: Flow<Boolean>

    /**
     * The stored session, or null when there is none, it has expired, or it
     * cannot be read. Never throws: an unreadable session is a signed-out one.
     */
    suspend fun read(): Session?

    /** @throws SessionStorageException when the device cannot store it. */
    suspend fun write(session: Session)

    /** @throws SessionStorageException when the device cannot remove it. */
    suspend fun clear()
}

/** Encrypts and decrypts the stored token. */
interface SessionCipher {
    fun encrypt(plain: ByteArray): ByteArray
    fun decrypt(sealed: ByteArray): ByteArray
}

/**
 * AES-256-GCM under a key that lives in the Android Keystore and never leaves
 * it. The output is the 12-byte IV followed by the ciphertext and tag.
 *
 * This is the whole of the encryption, on platform APIs present since API 23,
 * in place of `androidx.security:security-crypto` (deprecated, and it pulls in
 * Tink) or a Tink-backed DataStore serializer (Tink again, a few megabytes
 * before R8). One string is stored; one Keystore key covers it.
 *
 * A Keystore key can go bad (a lock-screen change on some devices, a vendor
 * Keystore fault). When sealing fails, the alias is deleted and a new key
 * made, once; a second failure is thrown to the store.
 */
class KeystoreSessionCipher(private val alias: String = KEY_ALIAS) : SessionCipher {

    override fun encrypt(plain: ByteArray): ByteArray = try {
        seal(plain)
    } catch (_: GeneralSecurityException) {
        regenerate()
        seal(plain)
    } catch (_: ProviderException) {
        regenerate()
        seal(plain)
    }

    override fun decrypt(sealed: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(
            Cipher.DECRYPT_MODE,
            key(),
            GCMParameterSpec(TAG_BITS, sealed, 0, IV_BYTES),
        )
        return cipher.doFinal(sealed, IV_BYTES, sealed.size - IV_BYTES)
    }

    private fun seal(plain: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key())
        return cipher.iv + cipher.doFinal(plain)
    }

    private fun regenerate() {
        keyStore().deleteEntry(alias)
    }

    private fun keyStore(): KeyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }

    private fun key(): SecretKey {
        (keyStore().getKey(alias, null) as? SecretKey)?.let { return it }
        val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
        generator.init(
            KeyGenParameterSpec.Builder(
                alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build()
        )
        return generator.generateKey()
    }

    private companion object {
        const val KEYSTORE = "AndroidKeyStore"
        const val KEY_ALIAS = "astra_session_key"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val IV_BYTES = 12
        const val TAG_BITS = 128
    }
}

/**
 * The session's own DataStore file, apart from the settings one. A corrupt
 * file is replaced with an empty one: the reader is signed out, and the app
 * does not fail every later read.
 */
val Context.sessionDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "account_session",
    corruptionHandler = ReplaceFileCorruptionHandler { emptyPreferences() },
)

/**
 * The session in a Preferences DataStore, the token sealed by [cipher].
 *
 * A token that will not decrypt (the Keystore key is gone, as after a key
 * reset) reads as no session and is cleared, so the reader signs in again
 * instead of carrying a blob nothing can open. The file is also excluded from
 * backups (`res/xml/backup_rules.xml`, `data_extraction_rules.xml`).
 */
class DataStoreSessionStore(
    private val dataStore: DataStore<Preferences>,
    private val cipher: SessionCipher,
    private val now: () -> Long = System::currentTimeMillis,
) : SessionStore {

    @OptIn(ExperimentalCoroutinesApi::class)
    override val isPresent: Flow<Boolean> = dataStore.data
        .catch { e -> if (e is IOException) emit(emptyPreferences()) else throw e }
        .map { prefs -> open(prefs) }
        .transformLatest { session ->
            if (session == null) {
                emit(false)
            } else {
                emit(true)
                delay(session.expiresAtMillis - now())
                emit(false)
            }
        }
        .distinctUntilChanged()

    override suspend fun read(): Session? {
        val prefs = try {
            dataStore.data.first()
        } catch (_: IOException) {
            return null
        }
        if (prefs[SEALED_TOKEN] == null) return null
        val session = open(prefs)
        if (session == null) {
            // Expired or unreadable: forget it. A failure to forget changes
            // nothing for the caller, which is signed out either way.
            try {
                clear()
            } catch (_: SessionStorageException) {
            }
        }
        return session
    }

    override suspend fun write(session: Session) {
        try {
            val sealed = Base64.getEncoder()
                .encodeToString(cipher.encrypt(session.token.toByteArray(Charsets.UTF_8)))
            dataStore.edit { prefs ->
                prefs[SEALED_TOKEN] = sealed
                prefs[EXPIRES_AT] = session.expiresAtMillis
            }
        } catch (e: GeneralSecurityException) {
            throw SessionStorageException(e)
        } catch (e: ProviderException) {
            throw SessionStorageException(e)
        } catch (e: IOException) {
            throw SessionStorageException(e)
        }
    }

    override suspend fun clear() {
        try {
            dataStore.edit { prefs ->
                prefs.remove(SEALED_TOKEN)
                prefs.remove(EXPIRES_AT)
            }
        } catch (e: IOException) {
            throw SessionStorageException(e)
        }
    }

    /** The session in [prefs] if it is there, unexpired and decrypts. */
    private fun open(prefs: Preferences): Session? {
        val sealed = prefs[SEALED_TOKEN] ?: return null
        val expiresAt = prefs[EXPIRES_AT] ?: return null
        if (expiresAt <= now()) return null
        val token = try {
            String(cipher.decrypt(Base64.getDecoder().decode(sealed)), Charsets.UTF_8)
        } catch (_: GeneralSecurityException) {
            return null
        } catch (_: ProviderException) {
            return null
        } catch (_: IllegalArgumentException) {
            return null
        }
        return Session(token, expiresAt)
    }

    private companion object {
        val SEALED_TOKEN = stringPreferencesKey("sealed_token")
        val EXPIRES_AT = longPreferencesKey("expires_at")
    }
}
