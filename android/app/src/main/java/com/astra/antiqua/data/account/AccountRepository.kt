package com.astra.antiqua.data.account

import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.local.room.UserProfile
import java.io.IOException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json

/**
 * The reader's web account: sign-up, sign-in and sign-out, the one synced
 * chart, the export, the strike and the wait list, against the routes under
 * `web/src/app/api`. No method throws; each returns an [AccountResult].
 *
 * The account is optional. No screen that works signed out depends on this,
 * and nothing here deletes the device's chart.
 */
interface AccountRepository {
    /** True while a session is stored on the device. */
    val isSignedIn: Flow<Boolean>

    suspend fun signUp(email: String, password: String, displayName: String? = null): AccountResult<AccountUser>
    suspend fun signIn(email: String, password: String): AccountResult<AccountUser>

    /**
     * Forgets the session on the device, then tells the server. The server
     * keeps no session table (its JWT cannot be revoked), so the device's copy
     * is the session; this returns [AccountResult.Ok] even when the server
     * cannot be reached. The device chart stays.
     */
    suspend fun signOut(): AccountResult<Unit>

    /** The signed-in user, or null. A stored session the server does not accept is cleared. */
    suspend fun me(): AccountResult<AccountUser?>

    suspend fun getChart(): AccountResult<RemoteChart?>
    suspend fun putChart(profile: UserProfile): AccountResult<RemoteChart>
    suspend fun deleteChart(): AccountResult<Boolean>
    suspend fun export(): AccountResult<AccountExport>

    /** Deletes the account on the server and clears the session. The device chart stays. */
    suspend fun strike(): AccountResult<Unit>

    suspend fun joinWaitList(entry: WaitListEntry): AccountResult<WaitListPlace>

    /**
     * The web's merge rule after sign-in or sign-up: when the server has a
     * chart it replaces the device's; otherwise the device's chart, if any,
     * is uploaded. No timestamps, no field merge.
     */
    suspend fun syncAfterSignIn(): AccountResult<SyncOutcome>
}

class HttpAccountRepository(
    private val client: AccountClient,
    private val session: SessionStore,
    private val profiles: ProfileRepository,
) : AccountRepository {

    override val isSignedIn: Flow<Boolean> = session.isPresent

    override suspend fun signUp(email: String, password: String, displayName: String?): AccountResult<AccountUser> =
        call(
            method = "POST",
            path = "/api/auth/signup",
            body = json.encodeToString(
                SignUpBody.serializer(),
                SignUpBody(email.trim(), password, displayName?.trim()?.ifEmpty { null }),
            ),
            issuesSession = true,
        ) { userOf(it) }

    override suspend fun signIn(email: String, password: String): AccountResult<AccountUser> =
        call(
            method = "POST",
            path = "/api/auth/signin",
            body = json.encodeToString(SignInBody.serializer(), SignInBody(email.trim(), password)),
            issuesSession = true,
        ) { userOf(it) }

    override suspend fun signOut(): AccountResult<Unit> {
        if (!forget()) return AccountResult.Failed(AccountError.DeviceWriteFailed)
        call("POST", "/api/auth/signout") { }
        return AccountResult.Ok(Unit)
    }

    override suspend fun me(): AccountResult<AccountUser?> {
        val result = call("GET", "/api/auth/me") { json.decodeFromString(UserEnvelope.serializer(), it).user }
        if (result is AccountResult.Ok && result.value == null) forget()
        return result
    }

    override suspend fun getChart(): AccountResult<RemoteChart?> =
        call("GET", "/api/charts", requiresSession = true) {
            json.decodeFromString(ChartEnvelope.serializer(), it).chart
        }

    override suspend fun putChart(profile: UserProfile): AccountResult<RemoteChart> =
        call(
            method = "PUT",
            path = "/api/charts",
            body = json.encodeToString(ChartInputs.serializer(), profile.toChartInputs()),
            requiresSession = true,
        ) { json.decodeFromString(ChartEnvelope.serializer(), it).chart ?: throw SerializationException("no chart") }

    override suspend fun deleteChart(): AccountResult<Boolean> =
        call("DELETE", "/api/charts", requiresSession = true) {
            json.decodeFromString(RemovedEnvelope.serializer(), it).removed
        }

    override suspend fun export(): AccountResult<AccountExport> =
        callWithReply("GET", "/api/me/export", requiresSession = true) { reply ->
            AccountExport(json = reply.body, fileName = fileNameOf(reply.headers["Content-Disposition"]))
        }

    override suspend fun strike(): AccountResult<Unit> {
        val result = call("DELETE", "/api/me", requiresSession = true) { }
        if (result is AccountResult.Ok && !forget()) return AccountResult.Failed(AccountError.DeviceWriteFailed)
        return result
    }

    override suspend fun joinWaitList(entry: WaitListEntry): AccountResult<WaitListPlace> =
        call(
            method = "POST",
            path = "/api/wait-list",
            body = json.encodeToString(
                WaitListBody.serializer(),
                WaitListBody(
                    email = entry.email.trim(),
                    name = entry.name?.trim()?.ifEmpty { null },
                    pantheon = entry.culture?.name?.lowercase(),
                    background = entry.background?.trim()?.ifEmpty { null },
                ),
            ),
        ) {
            val body = json.decodeFromString(WaitListEnvelope.serializer(), it)
            WaitListPlace(body.position, body.duplicate, body.persisted)
        }

    override suspend fun syncAfterSignIn(): AccountResult<SyncOutcome> {
        val server = when (val result = getChart()) {
            is AccountResult.Failed -> return result
            is AccountResult.Ok -> result.value
        }
        val device = try {
            profiles.profile.first()
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            null
        }
        if (server != null) {
            val replacement = server.toUserProfileOrNull(id = device?.id ?: 0)
                ?: return AccountResult.Failed(AccountError.Unreadable(200))
            return try {
                profiles.save(replacement)
                AccountResult.Ok(SyncOutcome.SERVER_CHART_KEPT)
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                AccountResult.Failed(AccountError.DeviceWriteFailed)
            }
        }
        if (device == null) return AccountResult.Ok(SyncOutcome.NOTHING_TO_SYNC)
        return putChart(device).map { SyncOutcome.DEVICE_CHART_UPLOADED }
    }

    /** Clears the stored session; false when the device could not. */
    private suspend fun forget(): Boolean = try {
        session.clear()
        true
    } catch (_: SessionStorageException) {
        false
    }

    private fun userOf(body: String): AccountUser =
        json.decodeFromString(UserEnvelope.serializer(), body).user ?: throw SerializationException("no user")

    private suspend fun <T> call(
        method: String,
        path: String,
        body: String? = null,
        requiresSession: Boolean = false,
        issuesSession: Boolean = false,
        parse: (String) -> T,
    ): AccountResult<T> = callWithReply(method, path, body, requiresSession, issuesSession) { parse(it.body) }

    private suspend fun <T> callWithReply(
        method: String,
        path: String,
        body: String? = null,
        requiresSession: Boolean = false,
        issuesSession: Boolean = false,
        parse: (AccountClient.Reply) -> T,
    ): AccountResult<T> {
        val reply = try {
            client.send(method, path, body, requiresSession, issuesSession)
        } catch (e: CancellationException) {
            throw e
        } catch (_: IOException) {
            return AccountResult.Failed(AccountError.Unreachable)
        } catch (_: SessionStorageException) {
            return AccountResult.Failed(AccountError.DeviceWriteFailed)
        }
        if (!reply.isSuccessful) return AccountResult.Failed(errorOf(reply))
        return try {
            AccountResult.Ok(parse(reply))
        } catch (_: IllegalArgumentException) {
            // SerializationException is an IllegalArgumentException.
            AccountResult.Failed(AccountError.Unreadable(reply.status))
        }
    }

    private fun errorOf(reply: AccountClient.Reply): AccountError = try {
        val envelope = json.decodeFromString(ErrorEnvelope.serializer(), reply.body)
        AccountError.Server(reply.status, envelope.error, envelope.fieldErrors.orEmpty())
    } catch (_: IllegalArgumentException) {
        AccountError.Unreadable(reply.status)
    }

    private companion object {
        val json = Json {
            ignoreUnknownKeys = true
            explicitNulls = false
        }

        val FILE_NAME = Regex("filename=\"([^\"]+)\"")

        fun fileNameOf(disposition: String?): String =
            disposition?.let { FILE_NAME.find(it)?.groupValues?.get(1) } ?: "astra-antiqua-export.json"
    }
}

@Serializable
private data class SignUpBody(val email: String, val password: String, val displayName: String? = null)

@Serializable
private data class SignInBody(val email: String, val password: String)

@Serializable
private data class WaitListBody(
    val email: String,
    val name: String? = null,
    val pantheon: String? = null,
    val background: String? = null,
)

@Serializable
private data class UserEnvelope(val user: AccountUser? = null)

@Serializable
private data class ChartEnvelope(val chart: RemoteChart? = null)

@Serializable
private data class RemovedEnvelope(val removed: Boolean)

@Serializable
private data class WaitListEnvelope(val position: Int, val duplicate: Boolean = false, val persisted: Boolean = false)

@Serializable
private data class ErrorEnvelope(val error: String, val fieldErrors: Map<String, List<String>>? = null)
