package com.astra.antiqua.data.account

import com.astra.antiqua.model.AncientCulture
import kotlinx.serialization.Serializable

/**
 * What a call to the web account returns: a value, or a failure the UI can
 * show. The repository never throws to its caller; every network, parsing
 * and storage failure arrives here as an [AccountError].
 */
sealed interface AccountResult<out T> {
    data class Ok<out T>(val value: T) : AccountResult<T>
    data class Failed(val error: AccountError) : AccountResult<Nothing>
}

inline fun <T, R> AccountResult<T>.map(transform: (T) -> R): AccountResult<R> = when (this) {
    is AccountResult.Ok -> AccountResult.Ok(transform(value))
    is AccountResult.Failed -> this
}

sealed interface AccountError {
    /**
     * The server answered with its envelope `{ ok: false, error }`. [error] is
     * the server's own sentence, written for a reader ("Email or password is
     * incorrect."); [fieldErrors] is filled by the wait list's validation.
     */
    data class Server(
        val status: Int,
        val error: String,
        val fieldErrors: Map<String, List<String>> = emptyMap(),
    ) : AccountError

    /** The server answered, but not with a body this client can read. */
    data class Unreadable(val status: Int) : AccountError

    /** No answer: no network, the host is down, or the call timed out. */
    data object Unreachable : AccountError

    /**
     * The device could not store what it had to: the session (the Keystore
     * or the session file refused it, even after a fresh key) or the server's
     * chart (the profile database refused it).
     */
    data object DeviceWriteFailed : AccountError
}

/** `{ id, email, displayName }` as every auth route returns it. */
@Serializable
data class AccountUser(
    val id: String,
    val email: String,
    val displayName: String? = null,
)

/**
 * The account's one chart as the server keeps it (`SavedChartInputs` in
 * `web/src/lib/savedCharts.ts`). [time] is wall-clock at the birthplace,
 * `HH:MM` or `HH:MM:SS`; there is no zone field.
 */
@Serializable
data class RemoteChart(
    val id: String,
    val name: String,
    val date: String,
    val time: String,
    val cityLabel: String,
    val latitude: Double,
    val longitude: Double,
    val createdAt: String,
)

/** The body of `PUT /api/charts`. The server assigns `id` and `createdAt`. */
@Serializable
data class ChartInputs(
    val name: String,
    val date: String,
    val time: String,
    val cityLabel: String,
    val latitude: Double,
    val longitude: Double,
)

/**
 * `GET /api/me/export`: the JSON document exactly as the server sent it, and
 * the file name from its `Content-Disposition`, for the share sheet.
 */
data class AccountExport(val json: String, val fileName: String)

/** A wait-list entry. Blank optional fields are dropped before sending. */
data class WaitListEntry(
    val email: String,
    val name: String? = null,
    val culture: AncientCulture? = null,
    val background: String? = null,
)

/** The reader's place on the roll, 1-based. */
data class WaitListPlace(val position: Int, val duplicate: Boolean, val persisted: Boolean)

/** What [AccountRepository.syncAfterSignIn] did, by the web's merge rule. */
enum class SyncOutcome {
    /** The server had a chart; it replaced the device's. */
    SERVER_CHART_KEPT,

    /** The server had none; the device's chart was uploaded. */
    DEVICE_CHART_UPLOADED,

    /** Neither side had a chart. */
    NOTHING_TO_SYNC,
}
