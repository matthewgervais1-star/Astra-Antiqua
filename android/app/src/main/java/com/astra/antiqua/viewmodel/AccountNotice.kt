package com.astra.antiqua.viewmodel

import com.astra.antiqua.data.account.AccountError

/**
 * What an account screen has to tell the reader after a call. The screen
 * turns each case into its string resource, in the culture's register where
 * the copy varies. [Server] carries the server's own sentence as received.
 *
 * No case carries the session or the password, so nothing here can leak
 * either into a message.
 */
sealed interface AccountNotice {
    data class Server(val text: String) : AccountNotice

    /** No answer from the server. */
    data object Unreachable : AccountNotice

    /** The server answered in a form this client cannot read. */
    data object Unreadable : AccountNotice

    /** The device could not keep the session or the server's chart. */
    data object DeviceWriteFailed : AccountNotice

    /** First entry: the password and its confirmation differ. */
    data object PasswordsDisagree : AccountNotice

    /** The export arrived but the device could not write the file. */
    data object ExportNotWritten : AccountNotice
}

/**
 * The reader-facing form of an [AccountError]. A validation failure on one
 * field (the wait list's `fieldErrors`) shows that field's first message,
 * which is more precise than the envelope's.
 */
fun AccountError.toNotice(field: String? = null): AccountNotice = when (this) {
    is AccountError.Server -> AccountNotice.Server(
        field?.let { fieldErrors[it]?.firstOrNull() } ?: error,
    )
    is AccountError.Unreadable -> AccountNotice.Unreadable
    AccountError.Unreachable -> AccountNotice.Unreachable
    AccountError.DeviceWriteFailed -> AccountNotice.DeviceWriteFailed
}

/** 1ST, 2ND, 3RD, 4TH, and the teens that break the pattern, as web's `ordinal`. */
fun rollOrdinal(n: Int): String {
    val lastTwo = n % 100
    if (lastTwo in 11..13) return "${n}TH"
    val suffix = when (n % 10) {
        1 -> "ST"
        2 -> "ND"
        3 -> "RD"
        else -> "TH"
    }
    return "$n$suffix"
}
