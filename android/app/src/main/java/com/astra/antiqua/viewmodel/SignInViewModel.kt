package com.astra.antiqua.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.account.AccountRepository
import com.astra.antiqua.data.account.AccountResult
import com.astra.antiqua.data.account.SyncOutcome
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** The two doors of THE RECORD, as web's `/signin` tabs. */
enum class RecordMode { SIGN_IN, FIRST_ENTRY }

data class RecordState(
    val mode: RecordMode = RecordMode.SIGN_IN,
    val submitting: Boolean = false,
    val notice: AccountNotice? = null,
    /** Set once the session is stored and the sync has run; the screen then leaves. */
    val signedIn: Boolean = false,
    /** What the sync did, or null when it failed (the failure is logged, not shown). */
    val sync: SyncOutcome? = null,
)

/**
 * THE RECORD: sign in, or a first entry.
 *
 * The password arrives as an argument to [submit] and is never kept here.
 * The screen holds it in composition state only and clears it when the
 * screen stops.
 *
 * After the session is stored, the web's merge rule runs: the server's chart
 * replaces the device's when the server has one; otherwise the device's goes
 * up. A failed sync does not undo the sign-in; it is logged by its kind, and
 * the next profile save sends the chart again.
 */
class SignInViewModel(
    private val account: AccountRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RecordState())
    val state: StateFlow<RecordState> = _state.asStateFlow()

    fun setMode(mode: RecordMode) = _state.update { it.copy(mode = mode, notice = null) }

    fun submit(email: String, password: String, confirm: String = "", displayName: String = "") {
        val mode = _state.value.mode
        if (_state.value.submitting || _state.value.signedIn) return
        if (email.isBlank() || password.isEmpty()) {
            _state.update { it.copy(notice = AccountNotice.CredentialsMissing) }
            return
        }
        if (mode == RecordMode.FIRST_ENTRY && password != confirm) {
            _state.update { it.copy(notice = AccountNotice.PasswordsDisagree) }
            return
        }
        _state.update { it.copy(submitting = true, notice = null) }
        viewModelScope.launch {
            val result = when (mode) {
                RecordMode.SIGN_IN -> account.signIn(email, password)
                RecordMode.FIRST_ENTRY -> account.signUp(email, password, displayName.trim().ifEmpty { null })
            }
            if (result is AccountResult.Failed) {
                val notice = when (val notice = result.error.toNotice()) {
                    is AccountNotice.Server -> AccountNotice.RecordRefused
                    else -> notice
                }
                _state.update { it.copy(submitting = false, notice = notice) }
                return@launch
            }
            val sync = when (val synced = account.syncAfterSignIn()) {
                is AccountResult.Ok -> synced.value
                is AccountResult.Failed -> {
                    Log.w(TAG, "Sync after sign-in failed: ${synced.error::class.simpleName}")
                    null
                }
            }
            _state.update { it.copy(submitting = false, signedIn = true, sync = sync) }
        }
    }

    /** The screen has left; a second visit starts fresh. */
    fun consumeSignedIn() = _state.update { RecordState(mode = it.mode) }

    private companion object {
        const val TAG = "TheRecord"
    }
}
