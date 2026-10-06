package com.astra.antiqua.data.account

import java.util.concurrent.TimeUnit
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Cookie
import okhttp3.Headers
import okhttp3.HttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

/**
 * The HTTP layer under the account repository. It owns the one rule of the
 * web session: the `astra_session` cookie is the only credential.
 *
 * - Every request to the origin carries the stored cookie, set by hand as a
 *   `Cookie` header. The OkHttp client has no cookie jar of its own.
 * - No request carries `Origin` or `Referer`. The server's same-origin check
 *   (`web/src/lib/auth/origin.ts`) passes when both are absent; a native app
 *   has no origin that could match the server's `Host`.
 * - Only the routes that issue a session (sign-up, sign-in) store a new
 *   cookie from `Set-Cookie`. Any response that clears the cookie (sign-out,
 *   strike) clears the store.
 * - A 401 from a route that requires a session clears the store: the token
 *   expired, the account is gone, or the secret was rotated.
 *
 * Nothing here logs. A [Session] prints as redacted.
 */
class AccountClient(
    private val origin: HttpUrl,
    private val http: OkHttpClient,
    private val session: SessionStore,
    private val io: CoroutineDispatcher = Dispatchers.IO,
    private val now: () -> Long = System::currentTimeMillis,
) {
    class Reply(val status: Int, val body: String, val headers: Headers) {
        val isSuccessful: Boolean get() = status in 200..299
    }

    /**
     * Sends one request and returns the reply, whatever its status. Throws
     * [java.io.IOException] for a call that got no answer (the repository
     * turns it into [AccountError.Unreachable]) and [SessionStorageException]
     * when a new session from sign-up or sign-in could not be stored
     * ([AccountError.DeviceWriteFailed]). A failure to clear never throws.
     */
    suspend fun send(
        method: String,
        path: String,
        json: String? = null,
        requiresSession: Boolean = false,
        issuesSession: Boolean = false,
    ): Reply {
        val url = origin.resolve(path) ?: error("Not a path: $path")
        val body = when {
            json != null -> json.toRequestBody(JSON)
            method == "GET" || method == "DELETE" -> null
            else -> ByteArray(0).toRequestBody(null)
        }
        val request = Request.Builder()
            .url(url)
            .method(method, body)
            .header("Accept", "application/json")
            .apply { session.read()?.let { header("Cookie", "$SESSION_COOKIE=${it.token}") } }
            .build()

        val reply = withContext(io) {
            http.newCall(request).execute().use { response ->
                Reply(response.code, response.body?.string().orEmpty(), response.headers)
            }
        }

        val issued = Cookie.parseAll(url, reply.headers).lastOrNull { it.name == SESSION_COOKIE }
        when {
            issued != null && (issued.value.isEmpty() || issued.expiresAt <= now()) -> forgetQuietly()
            issued != null && issuesSession && reply.isSuccessful ->
                session.write(Session(issued.value, issued.expiresAt))
            reply.status == 401 && requiresSession -> forgetQuietly()
        }
        return reply
    }

    /**
     * Clears the store, retrying once. A store that still cannot clear has
     * forgotten the session for this process anyway (see [SessionStore.clear]),
     * so the server's answer, not the device's, is what the caller sees.
     */
    suspend fun forgetQuietly() {
        repeat(2) {
            try {
                session.clear()
                return
            } catch (_: SessionStorageException) {
            }
        }
    }

    companion object {
        private val JSON = "application/json; charset=utf-8".toMediaType()

        /**
         * The production client. Redirects are off: the API never redirects,
         * and a redirect to another host would carry the hand-set `Cookie`
         * header with it. No cache, no cookie jar, no logging interceptor.
         */
        fun defaultHttpClient(): OkHttpClient = OkHttpClient.Builder()
            .followRedirects(false)
            .followSslRedirects(false)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .build()
    }
}
