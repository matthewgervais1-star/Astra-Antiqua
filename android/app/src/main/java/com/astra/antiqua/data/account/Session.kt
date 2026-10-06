package com.astra.antiqua.data.account

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import java.security.KeyStore
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

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
 * Where the session lives between launches. An interface so the client and
 * the repository can be tested with an in-memory store on the JVM.
 */
interface SessionStore {
    /** True while an unexpired session is stored. */
    val isPresent: Flow<Boolean>

    /** The stored session, or null when there is none or it has expired. */
    suspend fun read(): Session?
    suspend fun write(session: Session)
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
 */
class KeystoreSessionCipher(private val alias: String = KEY_ALIAS) : SessionCipher {

    override fun encrypt(plain: ByteArray): ByteArray {
        val cipher = Cipher.getInstance(TRANSFORMATION)
        cipher.init(Cipher.ENCRYPT_MODE, key())
        return cipher.iv + cipher.doFinal(plain)
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

    private fun key(): SecretKey {
        val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
        (keyStore.getKey(alias, null) as? SecretKey)?.let { return it }
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

/** The session's own DataStore file, apart from the settings one. */
val Context.sessionDataStore: DataStore<Preferences> by preferencesDataStore(name = "account_session")

/**
 * The session in a Preferences DataStore, the token sealed by [cipher].
 *
 * A token that will not decrypt (the Keystore key is gone, as after a backup
 * restored onto another device) reads as no session and is cleared, so the
 * reader signs in again instead of carrying a blob nothing can open.
 */
class DataStoreSessionStore(
    private val dataStore: DataStore<Preferences>,
    private val cipher: SessionCipher,
    private val now: () -> Long = System::currentTimeMillis,
) : SessionStore {

    override val isPresent: Flow<Boolean> = dataStore.data.map { prefs ->
        prefs[SEALED_TOKEN] != null && (prefs[EXPIRES_AT] ?: 0L) > now()
    }

    override suspend fun read(): Session? {
        val prefs = dataStore.data.first()
        val sealed = prefs[SEALED_TOKEN] ?: return null
        val expiresAt = prefs[EXPIRES_AT] ?: 0L
        if (expiresAt <= now()) {
            clear()
            return null
        }
        val token = try {
            String(cipher.decrypt(Base64.getDecoder().decode(sealed)), Charsets.UTF_8)
        } catch (_: Exception) {
            clear()
            return null
        }
        return Session(token, expiresAt)
    }

    override suspend fun write(session: Session) {
        val sealed = Base64.getEncoder().encodeToString(cipher.encrypt(session.token.toByteArray(Charsets.UTF_8)))
        dataStore.edit { prefs ->
            prefs[SEALED_TOKEN] = sealed
            prefs[EXPIRES_AT] = session.expiresAtMillis
        }
    }

    override suspend fun clear() {
        dataStore.edit { prefs ->
            prefs.remove(SEALED_TOKEN)
            prefs.remove(EXPIRES_AT)
        }
    }

    private companion object {
        val SEALED_TOKEN = stringPreferencesKey("sealed_token")
        val EXPIRES_AT = longPreferencesKey("expires_at")
    }
}
