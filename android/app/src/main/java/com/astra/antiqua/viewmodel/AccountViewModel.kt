package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.ProfileRepository
import com.astra.antiqua.data.account.AccountRepository
import com.astra.antiqua.data.account.AccountResult
import java.io.File
import java.io.IOException
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

enum class AccountPhase {
    /** Reading the session and asking the server who it belongs to. */
    LOADING,

    /** No session on the device. The screen sends the reader to THE RECORD. */
    SIGNED_OUT,

    READY,
}

/** The one action in flight, so its button can say so. */
enum class AccountAction { SIGN_OUT, STRIKE, EXPORT }

/** Why the screen is leaving, once an action has finished. */
enum class AccountExit {
    /** Back to the day. The device chart stays. */
    SIGNED_OUT,

    /** Back to culture selection. The device chart stays. */
    STRUCK,
}

data class AccountState(
    val phase: AccountPhase = AccountPhase.LOADING,
    /** The account's email, or null when the server could not be asked. */
    val email: String? = null,
    /** True when this device holds a chart. Web's ledger reads the same thing. */
    val hasChart: Boolean = false,
    val busy: AccountAction? = null,
    val notice: AccountNotice? = null,
    /** The export written to the cache, waiting for the share sheet. */
    val exportFile: File? = null,
    val exit: AccountExit? = null,
)

/**
 * ACCOUNT: the culture, the chart, SYNC ON, sign-out, export and the strike.
 *
 * Neither sign-out nor the strike touches the device chart: the repository
 * keeps it, and this screen only leaves. A strike the server confirmed is
 * success whatever happens after; the repository returns Ok for it, and this
 * class never turns that into a notice.
 *
 * [exportDir] is a directory under the app's cache that the FileProvider
 * shares. Each export replaces the last, so the cache holds one at most.
 */
class AccountViewModel(
    private val account: AccountRepository,
    private val profiles: ProfileRepository,
    private val exportDir: () -> File,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) : ViewModel() {

    private val _state = MutableStateFlow(AccountState())
    val state: StateFlow<AccountState> = _state.asStateFlow()

    init {
        viewModelScope.launch {
            profiles.profile
                .catch { emit(null) }
                .collect { profile -> _state.update { it.copy(hasChart = profile != null) } }
        }
        viewModelScope.launch {
            account.isSignedIn.collect { signedIn ->
                // Once the reader has signed out or struck, the session is
                // gone on purpose; the screen is leaving, not redirecting.
                if (_state.value.exit != null || _state.value.busy != null) return@collect
                if (signedIn) {
                    loadUser()
                } else {
                    _state.update { it.copy(phase = AccountPhase.SIGNED_OUT) }
                }
            }
        }
    }

    private suspend fun loadUser() {
        when (val me = account.me()) {
            is AccountResult.Ok -> {
                val user = me.value
                _state.update {
                    if (user == null) {
                        it.copy(phase = AccountPhase.SIGNED_OUT)
                    } else {
                        it.copy(phase = AccountPhase.READY, email = user.email)
                    }
                }
            }
            is AccountResult.Failed -> _state.update {
                it.copy(phase = AccountPhase.READY, notice = me.error.toNotice())
            }
        }
    }

    /** True when [typed] is the account's email, as web compares it: trimmed, any case. */
    fun canStrike(typed: String): Boolean {
        val email = _state.value.email ?: return false
        return typed.trim().lowercase() == email.lowercase()
    }

    fun signOut() {
        if (_state.value.busy != null) return
        _state.update { it.copy(busy = AccountAction.SIGN_OUT, notice = null) }
        viewModelScope.launch {
            when (val result = account.signOut()) {
                is AccountResult.Ok -> _state.update { it.copy(busy = null, exit = AccountExit.SIGNED_OUT) }
                is AccountResult.Failed -> _state.update { it.copy(busy = null, notice = result.error.toNotice()) }
            }
        }
    }

    fun strike(typed: String) {
        if (_state.value.busy != null || !canStrike(typed)) return
        _state.update { it.copy(busy = AccountAction.STRIKE, notice = null) }
        viewModelScope.launch {
            when (val result = account.strike()) {
                is AccountResult.Ok -> _state.update { it.copy(busy = null, exit = AccountExit.STRUCK) }
                is AccountResult.Failed -> _state.update { it.copy(busy = null, notice = result.error.toNotice()) }
            }
        }
    }

    fun export() {
        if (_state.value.busy != null) return
        _state.update { it.copy(busy = AccountAction.EXPORT, notice = null) }
        viewModelScope.launch {
            when (val result = account.export()) {
                is AccountResult.Failed -> _state.update { it.copy(busy = null, notice = result.error.toNotice()) }
                is AccountResult.Ok -> {
                    val file = try {
                        withContext(io) { write(result.value.fileName, result.value.json) }
                    } catch (e: CancellationException) {
                        throw e
                    } catch (e: IOException) {
                        Log.w(TAG, "The export could not be written: ${e::class.simpleName}")
                        null
                    } catch (e: SecurityException) {
                        Log.w(TAG, "The export could not be written: ${e::class.simpleName}")
                        null
                    }
                    _state.update {
                        if (file == null) {
                            it.copy(busy = null, notice = AccountNotice.ExportNotWritten)
                        } else {
                            it.copy(busy = null, exportFile = file)
                        }
                    }
                }
            }
        }
    }

    /**
     * The screen has left. Navigation may keep this ViewModel in a saved
     * back stack, so it starts over: a later visit reads the session afresh
     * rather than finding the old exit and leaving again.
     */
    fun consumeExit() {
        _state.update { AccountState(hasChart = it.hasChart) }
        viewModelScope.launch {
            val signedIn = try {
                account.isSignedIn.first()
            } catch (e: CancellationException) {
                throw e
            } catch (_: Exception) {
                false
            }
            if (signedIn) loadUser() else _state.update { it.copy(phase = AccountPhase.SIGNED_OUT) }
        }
    }

    /** The share sheet has the file. */
    fun consumeExport() = _state.update { it.copy(exportFile = null) }

    private fun write(fileName: String, json: String): File {
        val dir = exportDir()
        if (!dir.isDirectory && !dir.mkdirs()) throw IOException("no export directory")
        dir.listFiles()?.forEach { it.delete() }
        val file = File(dir, safeName(fileName))
        file.writeText(json, Charsets.UTF_8)
        return file
    }

    private companion object {
        const val TAG = "Account"

        /** The server's file name, kept to characters a file system and a share target accept. */
        fun safeName(name: String): String {
            val cleaned = name.replace(Regex("[^A-Za-z0-9._-]"), "_").trim('.', '_')
            val base = cleaned.ifEmpty { "astra-antiqua-export" }
            return if (base.endsWith(".json")) base else "$base.json"
        }
    }
}
