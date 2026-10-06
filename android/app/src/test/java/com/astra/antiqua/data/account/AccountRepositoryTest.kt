package com.astra.antiqua.data.account

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.viewmodel.FakeProfiles
import com.astra.antiqua.viewmodel.ROME_BIRTH_UTC_MS
import com.astra.antiqua.viewmodel.romeProfile
import java.time.Instant
import java.time.ZoneOffset
import java.util.concurrent.TimeUnit
import java.time.ZonedDateTime
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.test.runTest
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.double
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

/** A session store in memory, for the JVM. */
internal class InMemorySessionStore(
    initial: Session? = null,
    private val failWrites: Boolean = false,
) : SessionStore {
    private val state = MutableStateFlow(initial)
    private val forgotten = MutableStateFlow(false)
    override val isPresent = combine(state, forgotten) { s, gone -> s != null && !gone }
    override suspend fun read(): Session? = if (forgotten.value) null else state.value
    override suspend fun write(session: Session) {
        if (failWrites) throw SessionStorageException(java.security.KeyStoreException("refused"))
        state.value = session
        forgotten.value = false
    }
    override suspend fun clear() {
        clearAttempts++
        if (failWrites) {
            // As DataStoreSessionStore does: the bytes stay, the process forgets.
            forgotten.value = true
            throw SessionStorageException(java.io.IOException("read-only"))
        }
        state.value = null
    }
    var clearAttempts = 0
        private set
    fun stored(): Session? = state.value
}

/**
 * The repository against MockWebServer: real OkHttp, real JSON, a fake
 * server speaking the web API's envelope and its `Set-Cookie` headers.
 */
class AccountRepositoryTest {
    private lateinit var server: MockWebServer
    private lateinit var session: InMemorySessionStore
    private lateinit var profiles: FakeProfiles
    private lateinit var repository: HttpAccountRepository

    private val issued = "astra_session=header.payload.signature; Path=/; Max-Age=2592000; HttpOnly; SameSite=lax"
    private val cleared = "astra_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly; SameSite=lax"
    private val user = """{"ok":true,"user":{"id":"u-1","email":"livia@example.com","displayName":null}}"""
    private val far = Long.MAX_VALUE / 2

    @Before
    fun setUp() {
        server = MockWebServer().apply { start() }
        newRepository(session = InMemorySessionStore(), profiles = FakeProfiles())
    }

    @After
    fun tearDown() {
        runCatching { server.shutdown() }
    }

    private fun newRepository(session: InMemorySessionStore, profiles: FakeProfiles) {
        this.session = session
        this.profiles = profiles
        repository = HttpAccountRepository(
            client = AccountClient(server.url("/"), AccountClient.defaultHttpClient(), session),
            session = session,
            profiles = profiles,
        )
    }

    /** The next request the server saw, waiting at most a second for it. */
    private fun MockWebServer.next(): RecordedRequest =
        takeRequest(1, TimeUnit.SECONDS) ?: error("The server saw no request")

    private fun json(status: Int = 200, body: String) =
        MockResponse().setResponseCode(status).setHeader("Content-Type", "application/json").setBody(body)

    private fun RecordedRequest.json(): JsonObject = Json.parseToJsonElement(body.readUtf8()).jsonObject

    private fun signedIn() = newRepository(
        session = InMemorySessionStore(Session("stored-token", far)),
        profiles = profiles,
    )

    private val serverChart = """{"ok":true,"chart":{"id":"c-1","name":"Aelia","date":"1985-03-02",""" +
        """"time":"06:15","cityLabel":"Athens","latitude":37.98,"longitude":23.73,"createdAt":"2026-09-01T10:00:00.000Z"}}"""

    @Test
    fun `sign-in stores the cookie and sends no Origin`() = runTest {
        server.enqueue(json(body = user).addHeader("Set-Cookie", issued))

        val result = repository.signIn(" livia@example.com ", "hunter22")

        assertEquals(AccountResult.Ok(AccountUser("u-1", "livia@example.com", null)), result)
        assertEquals("header.payload.signature", session.stored()?.token)
        assertTrue(repository.isSignedIn.first())
        val request = server.next()
        assertEquals("POST", request.method)
        assertEquals("/api/auth/signin", request.path)
        assertNull(request.getHeader("Origin"))
        assertNull(request.getHeader("Referer"))
        val body = request.json()
        assertEquals("livia@example.com", body["email"]!!.jsonPrimitive.content)
        assertEquals("hunter22", body["password"]!!.jsonPrimitive.content)
    }

    @Test
    fun `sign-up stores the cookie and leaves out a blank display name`() = runTest {
        server.enqueue(json(body = user).addHeader("Set-Cookie", issued))

        repository.signUp("livia@example.com", "hunter22", displayName = "  ")

        assertEquals("header.payload.signature", session.stored()?.token)
        assertFalse(server.next().json().containsKey("displayName"))
    }

    @Test
    fun `the stored cookie goes out on the next request`() = runTest {
        signedIn()
        server.enqueue(json(body = """{"ok":true,"chart":null}"""))

        assertEquals(AccountResult.Ok(null), repository.getChart())

        val request = server.next()
        assertEquals("astra_session=stored-token", request.getHeader("Cookie"))
        assertNull(request.getHeader("Origin"))
    }

    @Test
    fun `a 401 from a session route clears the session and carries the server's words`() = runTest {
        signedIn()
        server.enqueue(json(401, """{"ok":false,"error":"Not signed in."}"""))

        val result = repository.getChart()

        assertEquals(AccountResult.Failed(AccountError.Server(401, "Not signed in.")), result)
        assertNull(session.stored())
        assertFalse(repository.isSignedIn.first())
    }

    @Test
    fun `a wrong password is a 401 that leaves no session behind and maps to the sealed type`() = runTest {
        server.enqueue(json(401, """{"ok":false,"error":"Email or password is incorrect."}"""))

        val result = repository.signIn("livia@example.com", "wrong")

        assertEquals(AccountResult.Failed(AccountError.Server(401, "Email or password is incorrect.")), result)
        assertNull(session.stored())
    }

    @Test
    fun `PUT sends the profile as the web's chart inputs`() = runTest {
        signedIn()
        server.enqueue(json(body = serverChart))

        val result = repository.putChart(romeProfile())

        assertTrue(result is AccountResult.Ok)
        val request = server.next()
        assertEquals("PUT", request.method)
        assertEquals("/api/charts", request.path)
        val body = request.json()
        assertEquals(setOf("name", "date", "time", "cityLabel", "latitude", "longitude"), body.keys)
        assertEquals("Livia", body["name"]!!.jsonPrimitive.content)
        assertEquals("1990-06-15", body["date"]!!.jsonPrimitive.content)
        assertEquals("14:30", body["time"]!!.jsonPrimitive.content)
        assertEquals("Rome", body["cityLabel"]!!.jsonPrimitive.content)
        assertEquals(41.9028, body["latitude"]!!.jsonPrimitive.double, 0.0)
        assertEquals(12.4964, body["longitude"]!!.jsonPrimitive.double, 0.0)
    }

    @Test
    fun `merge - the server's chart replaces the device's and nothing is uploaded`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far)), FakeProfiles(romeProfile()))
        server.enqueue(json(body = serverChart))

        val result = repository.syncAfterSignIn()

        assertEquals(AccountResult.Ok(SyncOutcome.SERVER_CHART_KEPT), result)
        val stored = profiles.stored()!!
        assertEquals(1, stored.id)
        assertEquals("Aelia", stored.name)
        assertEquals("Athens", stored.cityName)
        // Athens keeps Eastern European Time, UTC+2 in March, so 06:15 there is 04:15 UTC.
        assertEquals("Europe/Athens", stored.timezoneId)
        assertEquals(
            ZonedDateTime.of(1985, 3, 2, 4, 15, 0, 0, ZoneOffset.UTC).toInstant().toEpochMilli(),
            stored.birthDateUtc,
        )
        assertEquals(1, server.requestCount)
    }

    @Test
    fun `merge - with no server chart the device's chart is uploaded`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far)), FakeProfiles(romeProfile()))
        server.enqueue(json(body = """{"ok":true,"chart":null}"""))
        server.enqueue(json(body = serverChart))

        val result = repository.syncAfterSignIn()

        assertEquals(AccountResult.Ok(SyncOutcome.DEVICE_CHART_UPLOADED), result)
        assertEquals("GET", server.next().method)
        val put = server.next()
        assertEquals("PUT", put.method)
        assertEquals("Livia", put.json()["name"]!!.jsonPrimitive.content)
        assertEquals(ROME_BIRTH_UTC_MS, profiles.stored()!!.birthDateUtc)
        assertEquals(0, profiles.saveCount)
    }

    @Test
    fun `merge - with no chart on either side nothing moves`() = runTest {
        signedIn()
        server.enqueue(json(body = """{"ok":true,"chart":null}"""))

        assertEquals(AccountResult.Ok(SyncOutcome.NOTHING_TO_SYNC), repository.syncAfterSignIn())
        assertEquals(1, server.requestCount)
    }

    @Test
    fun `strike clears the session and keeps the device chart`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far)), FakeProfiles(romeProfile()))
        server.enqueue(json(body = """{"ok":true}""").addHeader("Set-Cookie", cleared))

        val result = repository.strike()

        assertEquals(AccountResult.Ok(Unit), result)
        val request = server.next()
        assertEquals("DELETE", request.method)
        assertEquals("/api/me", request.path)
        assertNull(session.stored())
        assertEquals(romeProfile(), profiles.stored())
        assertEquals(0, profiles.saveCount)
    }

    @Test
    fun `a refused strike keeps the session`() = runTest {
        signedIn()
        server.enqueue(json(403, """{"ok":false,"error":"Cross-origin request from elsewhere:1."}"""))

        val result = repository.strike()

        assertEquals(AccountResult.Failed(AccountError.Server(403, "Cross-origin request from elsewhere:1.")), result)
        assertEquals("stored-token", session.stored()?.token)
    }

    @Test
    fun `sign-out forgets the session even when the server is unreachable`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far)), FakeProfiles(romeProfile()))
        server.shutdown()

        assertEquals(AccountResult.Ok(Unit), repository.signOut())
        assertNull(session.stored())
        assertEquals(romeProfile(), profiles.stored())
    }

    @Test
    fun `me with no user clears a stale session`() = runTest {
        signedIn()
        server.enqueue(json(body = """{"ok":true,"user":null}"""))

        assertEquals(AccountResult.Ok(null), repository.me())
        assertNull(session.stored())
    }

    @Test
    fun `the wait list returns the position and sends the culture in the web's form`() = runTest {
        server.enqueue(json(body = """{"ok":true,"persisted":true,"duplicate":false,"position":7}"""))

        val result = repository.joinWaitList(
            WaitListEntry(email = "livia@example.com", name = " ", culture = AncientCulture.ROME),
        )

        assertEquals(AccountResult.Ok(WaitListPlace(position = 7, duplicate = false, persisted = true)), result)
        val body = server.next().json()
        assertEquals("rome", body["pantheon"]!!.jsonPrimitive.content)
        assertFalse(body.containsKey("name"))
        assertFalse(body.containsKey("background"))
    }

    @Test
    fun `a wait-list validation failure carries its field errors`() = runTest {
        server.enqueue(
            json(
                400,
                """{"ok":false,"error":"Validation failed.","fieldErrors":{"email":["Please enter a valid email address."]}}""",
            ),
        )

        val result = repository.joinWaitList(WaitListEntry(email = "not-an-email"))

        assertEquals(
            AccountResult.Failed(
                AccountError.Server(400, "Validation failed.", mapOf("email" to listOf("Please enter a valid email address."))),
            ),
            result,
        )
    }

    @Test
    fun `a body that is not the envelope maps to Unreadable`() = runTest {
        server.enqueue(MockResponse().setResponseCode(502).setBody("<html>Bad gateway</html>"))

        assertEquals(AccountResult.Failed(AccountError.Unreadable(502)), repository.me())
    }

    @Test
    fun `no answer maps to Unreachable`() = runTest {
        server.shutdown()

        assertEquals(AccountResult.Failed(AccountError.Unreachable), repository.signIn("a@b.co", "pw"))
    }

    @Test
    fun `export returns the document and the server's file name`() = runTest {
        signedIn()
        val document = """{"exportedAt":"2026-10-06T00:00:00.000Z","user":{"id":"u-1"},"chart":null}"""
        server.enqueue(
            json(body = document)
                .setHeader("Content-Disposition", "attachment; filename=\"astra-antiqua-livia_example.com-2026-10-06.json\""),
        )

        val result = repository.export()

        assertEquals(
            AccountResult.Ok(AccountExport(document, "astra-antiqua-livia_example.com-2026-10-06.json")),
            result,
        )
    }

    @Test
    fun `delete chart reports whether a chart was removed`() = runTest {
        signedIn()
        server.enqueue(json(body = """{"ok":true,"removed":true}"""))

        assertEquals(AccountResult.Ok(true), repository.deleteChart())
        assertEquals("DELETE", server.next().method)
    }

    @Test
    fun `a 401 from sign-in keeps an existing session`() = runTest {
        signedIn()
        server.enqueue(json(401, """{"ok":false,"error":"Email or password is incorrect."}"""))

        repository.signIn("livia@example.com", "wrong")

        assertEquals("stored-token", session.stored()?.token)
    }

    @Test
    fun `a clearing Set-Cookie on any route clears the store`() = runTest {
        signedIn()
        server.enqueue(json(body = user).addHeader("Set-Cookie", cleared))

        repository.me()

        assertNull(session.stored())
    }

    @Test
    fun `a 401 on PUT clears the session`() = runTest {
        signedIn()
        server.enqueue(json(401, """{"ok":false,"error":"Not signed in."}"""))

        assertEquals(
            AccountResult.Failed(AccountError.Server(401, "Not signed in.")),
            repository.putChart(romeProfile()),
        )
        assertNull(session.stored())
    }

    @Test
    fun `a 401 on export clears the session`() = runTest {
        signedIn()
        server.enqueue(json(401, """{"ok":false,"error":"Not signed in."}"""))

        assertEquals(AccountResult.Failed(AccountError.Server(401, "Not signed in.")), repository.export())
        assertNull(session.stored())
    }

    @Test
    fun `a fresh cookie on a route that does not issue sessions is ignored`() = runTest {
        signedIn()
        server.enqueue(json(body = """{"ok":true,"chart":null}""").addHeader("Set-Cookie", issued))

        repository.getChart()

        assertEquals("stored-token", session.stored()?.token)
    }

    @Test
    fun `a session the device cannot store maps to DeviceWriteFailed`() = runTest {
        newRepository(InMemorySessionStore(failWrites = true), FakeProfiles())
        server.enqueue(json(body = user).addHeader("Set-Cookie", issued))

        assertEquals(
            AccountResult.Failed(AccountError.DeviceWriteFailed),
            repository.signIn("livia@example.com", "hunter22"),
        )
    }

    @Test
    fun `a sign-out the device cannot record maps to DeviceWriteFailed`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far), failWrites = true), FakeProfiles())

        assertEquals(AccountResult.Failed(AccountError.DeviceWriteFailed), repository.signOut())
        assertEquals(0, server.requestCount)
    }

    @Test
    fun `PUT gives a blank-named profile the city's name`() = runTest {
        signedIn()
        server.enqueue(json(body = serverChart))

        repository.putChart(romeProfile(name = " "))

        assertEquals("Rome", server.next().json()["name"]!!.jsonPrimitive.content)
    }

    @Test
    fun `a strike the device cannot record still succeeds and leaves no session present`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far), failWrites = true), FakeProfiles(romeProfile()))
        server.enqueue(json(body = """{"ok":true}""").addHeader("Set-Cookie", cleared))

        assertEquals(AccountResult.Ok(Unit), repository.strike())
        assertFalse(repository.isSignedIn.first())
        assertTrue(session.clearAttempts >= 2)
        assertEquals(romeProfile(), profiles.stored())
    }

    @Test
    fun `a 401 whose clear fails still surfaces as the 401`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far), failWrites = true), FakeProfiles())
        server.enqueue(json(401, """{"ok":false,"error":"Not signed in."}"""))

        assertEquals(AccountResult.Failed(AccountError.Server(401, "Not signed in.")), repository.getChart())
        assertFalse(repository.isSignedIn.first())
        assertEquals(2, session.clearAttempts)
    }

    @Test
    fun `a gap time typed on the device goes up as typed`() = runTest {
        signedIn()
        server.enqueue(json(body = serverChart))
        val zone = com.astra.antiqua.domain.birthZoneFor(40.7128, -74.006)
        val typed = romeProfile().copy(
            birthDateUtc = com.astra.antiqua.domain.resolveWallClockMillis(
                java.time.LocalDateTime.of(2021, 3, 14, 2, 30), zone,
            ),
            latitude = 40.7128,
            longitude = -74.006,
            cityName = "New York",
            timezoneId = zone.id,
            birthDate = "2021-03-14",
            birthTime = "02:30",
        )

        repository.putChart(typed)

        val body = server.next().json()
        assertEquals("2021-03-14", body["date"]!!.jsonPrimitive.content)
        assertEquals("02:30", body["time"]!!.jsonPrimitive.content)
        assertEquals(Instant.parse("2021-03-14T06:30:00Z").toEpochMilli(), typed.birthDateUtc)
    }

    @Test
    fun `a web gap time synced down and saved again goes up unchanged`() = runTest {
        newRepository(InMemorySessionStore(Session("stored-token", far)), FakeProfiles(romeProfile()))
        server.enqueue(
            json(
                body = """{"ok":true,"chart":{"id":"c-1","name":"Aelia","date":"1995-10-29",""" +
                    """"time":"02:30","cityLabel":"Sydney","latitude":-33.8688,"longitude":151.2093,""" +
                    """"createdAt":"2026-09-01T10:00:00.000Z"}}""",
            ),
        )
        server.enqueue(json(body = serverChart))

        repository.syncAfterSignIn()
        val synced = profiles.stored()!!
        repository.putChart(synced)

        // Web's rule puts Sydney's spring-forward 02:30 on 16:30Z the day before.
        assertEquals(Instant.parse("1995-10-28T16:30:00Z").toEpochMilli(), synced.birthDateUtc)
        server.next()
        val body = server.next().json()
        assertEquals("1995-10-29", body["date"]!!.jsonPrimitive.content)
        assertEquals("02:30", body["time"]!!.jsonPrimitive.content)
    }
}
