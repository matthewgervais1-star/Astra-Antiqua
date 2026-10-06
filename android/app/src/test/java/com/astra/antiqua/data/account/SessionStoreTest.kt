package com.astra.antiqua.data.account

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import java.io.File
import java.nio.file.Files
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The DataStore half of the session store on the JVM. The Keystore cipher
 * needs a device, so a reversible stand-in seals the token here; what this
 * pins is that only the sealed form reaches the file, and that an expired or
 * unopenable session reads as none.
 */
class SessionStoreTest {
    private val dir: File = Files.createTempDirectory("session-store").toFile()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val file = File(dir, "account_session.preferences_pb")
    private val dataStore = PreferenceDataStoreFactory.create(scope = scope) { file }
    private var clock = 1_000L

    /** XOR with a fixed byte: reversible, and the plain token never appears. */
    private class XorCipher(
        private val fail: Boolean = false,
        private val failSealing: Boolean = false,
    ) : SessionCipher {
        override fun encrypt(plain: ByteArray): ByteArray {
            if (failSealing) throw java.security.KeyStoreException("keystore refused")
            return ByteArray(plain.size) { (plain[it].toInt() xor 0x5A).toByte() }
        }
        override fun decrypt(sealed: ByteArray): ByteArray {
            if (fail) throw javax.crypto.AEADBadTagException("key is gone")
            return ByteArray(sealed.size) { (sealed[it].toInt() xor 0x5A).toByte() }
        }
    }

    @After
    fun tearDown() {
        scope.cancel()
        dir.deleteRecursively()
    }

    @Test
    fun `a written session reads back and only its sealed form reaches the file`() = runTest {
        val store = DataStoreSessionStore(dataStore, XorCipher()) { clock }

        store.write(Session("plain-jwt-token", 5_000L))

        assertEquals(Session("plain-jwt-token", 5_000L), store.read())
        assertTrue(store.isPresent.first())
        assertFalse(String(file.readBytes(), Charsets.ISO_8859_1).contains("plain-jwt-token"))
    }

    @Test
    fun `an expired session reads as none and is removed`() = runTest {
        val store = DataStoreSessionStore(dataStore, XorCipher()) { clock }
        store.write(Session("t", 2_000L))

        clock = 2_000L

        assertNull(store.read())
        assertFalse(store.isPresent.first())
    }

    @Test
    fun `a token that will not decrypt reads as none and is removed`() = runTest {
        DataStoreSessionStore(dataStore, XorCipher()) { clock }.write(Session("t", 5_000L))
        val afterRestore = DataStoreSessionStore(dataStore, XorCipher(fail = true)) { clock }

        assertNull(afterRestore.read())
        assertFalse(afterRestore.isPresent.first())
    }

    @Test
    fun `a cipher that cannot seal surfaces as SessionStorageException and stores nothing`() = runTest {
        val store = DataStoreSessionStore(dataStore, XorCipher(failSealing = true)) { clock }

        val thrown = runCatching { store.write(Session("t", 5_000L)) }.exceptionOrNull()

        assertTrue(thrown is SessionStorageException)
        assertNull(store.read())
        assertFalse(store.isPresent.first())
    }

    @Test
    fun `presence turns false when the session expires, with no write in between`() = runTest {
        val store = DataStoreSessionStore(dataStore, XorCipher()) { clock }
        store.write(Session("t", clock + 1_000L))

        assertEquals(listOf(true, false), store.isPresent.take(2).toList())
    }

    @Test
    fun `a blob that will not decrypt is never reported as present`() = runTest {
        DataStoreSessionStore(dataStore, XorCipher()) { clock }.write(Session("t", 5_000L))
        val afterReset = DataStoreSessionStore(dataStore, XorCipher(fail = true)) { clock }

        assertFalse(afterReset.isPresent.first())
    }

    @Test
    fun `a session never prints its token`() {
        assertFalse(Session("secret-token", 1L).toString().contains("secret-token"))
    }
}
