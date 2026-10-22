package com.astra.antiqua.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.astra.antiqua.data.account.AccountRepository
import com.astra.antiqua.data.account.AccountResult
import com.astra.antiqua.data.account.WaitListEntry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class RollState(
    val submitting: Boolean = false,
    /** The reader's place on the roll, 1-based, once the server has given it. */
    val position: Int? = null,
    val notice: AccountNotice? = null,
)

/**
 * THE ROLL: the wait list, email only, as web's compact `/waitlist` form.
 * The server validates the address; its message for the field is shown.
 */
class WaitListViewModel(
    private val account: AccountRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(RollState())
    val state: StateFlow<RollState> = _state.asStateFlow()

    fun submit(email: String) {
        if (_state.value.submitting) return
        _state.update { it.copy(submitting = true, notice = null) }
        viewModelScope.launch {
            when (val result = account.joinWaitList(WaitListEntry(email = email))) {
                is AccountResult.Ok -> _state.update { RollState(position = result.value.position) }
                is AccountResult.Failed -> _state.update {
                    it.copy(submitting = false, notice = result.error.toNotice(field = "email"))
                }
            }
        }
    }
}
