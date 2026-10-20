package com.astra.antiqua.ui.screens

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.annotation.StringRes
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.core.content.FileProvider
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.R
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.AccentRule
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AccountAction
import com.astra.antiqua.viewmodel.AccountExit
import com.astra.antiqua.viewmodel.AccountNotice
import com.astra.antiqua.viewmodel.AccountPhase
import com.astra.antiqua.viewmodel.AccountViewModel
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.RecordMode
import com.astra.antiqua.viewmodel.SignInViewModel
import com.astra.antiqua.viewmodel.WaitListViewModel
import com.astra.antiqua.viewmodel.rollOrdinal
import java.io.File

/**
 * The web account on Android: THE RECORD (web's /signin), ACCOUNT (web's
 * /account) and THE ROLL (web's /waitlist), on the nave chassis and in the
 * culture's theme. The wording is web's, kept in strings.xml.
 *
 * The account is optional. Every other screen works signed out, and nothing
 * here removes the device chart.
 */

/** THE RECORD: sign in, or a first entry. */
@Composable
fun SignInScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onSignedIn: () -> Unit,
    onContinue: () -> Unit,
    onOpenRoll: () -> Unit,
) {
    val model: SignInViewModel = viewModel(factory = AstraViewModelFactory)
    val state by model.state.collectAsState()
    val accent = LocalAccent.current

    var email by rememberSaveable { mutableStateOf("") }
    var displayName by rememberSaveable { mutableStateOf("") }
    // The passwords live in composition only: never saved to the instance
    // state, never kept by the ViewModel, and cleared when the screen stops
    // or the reader is in.
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    LifecycleEventEffect(Lifecycle.Event.ON_STOP) {
        password = ""
        confirm = ""
    }
    LaunchedEffect(state.signedIn) {
        if (state.signedIn) {
            password = ""
            confirm = ""
            model.consumeSignedIn()
            onSignedIn()
        }
    }

    val firstEntry = state.mode == RecordMode.FIRST_ENTRY
    NaveShell(
        context = stringResource(R.string.record_context),
        culture = culture,
        onNavigate = onNavigate,
        section = Section.ACCOUNT,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = Spacing.Chapter),
        ) {
            // The signed-out face of the badge ACCOUNT shows, as web's sub
            // bar carries SYNC OFF until the reader signs in.
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.Gutter)
                    .padding(top = Spacing.Step),
                horizontalArrangement = Arrangement.End,
            ) {
                Badge(stringResource(R.string.account_sync_off), tone = BadgeTone.OUTLINE)
            }
            NaveHead(
                kicker = stringResource(R.string.record_kicker),
                headline = stringResource(R.string.record_headline),
            )
            ProseLine(stringResource(R.string.record_sub))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.Gutter)
                    .padding(top = Spacing.Section),
            ) {
                RecordMode.entries.forEach { mode ->
                    val active = mode == state.mode
                    val label = stringResource(
                        if (mode == RecordMode.SIGN_IN) R.string.record_tab_sign_in else R.string.record_tab_first_entry
                    )
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clickable(onClickLabel = label, role = Role.Tab) { model.setMode(mode) },
                    ) {
                        Text(
                            text = label,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (active) accent else Dim,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Snug),
                        )
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(if (active) Dim else Rule)
                        )
                    }
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.Gutter)
                    .padding(top = Spacing.Step),
                verticalArrangement = Arrangement.spacedBy(Spacing.Step),
            ) {
                RecordField(
                    label = stringResource(R.string.record_email),
                    value = email,
                    onValueChange = { email = it },
                    keyboardType = KeyboardType.Email,
                )
                val submit = { model.submit(email, password, confirm, displayName) }
                RecordField(
                    label = stringResource(R.string.record_password),
                    value = password,
                    onValueChange = { password = it },
                    secret = true,
                    onDone = if (firstEntry) null else submit,
                )
                if (firstEntry) {
                    RecordField(
                        label = stringResource(R.string.record_confirm),
                        value = confirm,
                        onValueChange = { confirm = it },
                        secret = true,
                    )
                    RecordField(
                        label = stringResource(R.string.record_display_name),
                        value = displayName,
                        onValueChange = { displayName = it },
                        capitalization = KeyboardCapitalization.Words,
                        onDone = submit,
                    )
                }
                val action = when {
                    state.submitting && firstEntry -> R.string.record_entering
                    state.submitting -> R.string.record_opening
                    firstEntry -> R.string.record_enter
                    else -> R.string.record_open
                }
                ActionButton(
                    label = stringResource(action),
                    onClick = submit,
                    weight = ActionWeight.VOTIVE,
                    enabled = !state.submitting,
                )
                state.notice?.let { NoticeLine(noticeText(it, culture)) }
                Text(
                    text = stringResource(R.string.record_microcopy),
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
                ActionButton(
                    label = stringResource(R.string.record_continue_without),
                    onClick = onContinue,
                    weight = ActionWeight.GHOST,
                )
                ActionButton(
                    label = stringResource(R.string.record_to_roll),
                    onClick = onOpenRoll,
                    weight = ActionWeight.GHOST,
                )
            }
        }
    }
}

/** ACCOUNT: the ledger, sign-out, export and the strike. Signed out, it sends the reader to THE RECORD. */
@Composable
fun AccountScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onSignIn: () -> Unit,
    onSignedOut: () -> Unit,
    onStruck: () -> Unit,
    onChangeCulture: () -> Unit,
    onOpenLicences: () -> Unit,
) {
    val model: AccountViewModel = viewModel(factory = AstraViewModelFactory)
    val state by model.state.collectAsState()
    val context = LocalContext.current
    val accent = LocalAccent.current
    val chooserTitle = stringResource(R.string.account_export_chooser)

    val lifecycleOwner = LocalLifecycleOwner.current
    LifecycleEventEffect(Lifecycle.Event.ON_START) { model.onStart() }
    // The redirect fires only while this entry is resumed. An entry on its
    // way out (signed out, fading to the day) is no longer resumed, so it
    // cannot push THE RECORD over where the reader went.
    LaunchedEffect(lifecycleOwner) {
        lifecycleOwner.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            model.state
                .map { it.phase }
                .distinctUntilChanged()
                .collect { phase -> if (phase == AccountPhase.SIGNED_OUT) onSignIn() }
        }
    }
    LaunchedEffect(state.exit) {
        val exit = state.exit ?: return@LaunchedEffect
        model.consumeExit()
        when (exit) {
            AccountExit.SIGNED_OUT -> onSignedOut()
            AccountExit.STRUCK -> onStruck()
        }
    }
    LaunchedEffect(state.exportFile) {
        val file = state.exportFile ?: return@LaunchedEffect
        shareExport(context, file, chooserTitle)
        model.consumeExport()
    }

    NaveShell(
        context = stringResource(R.string.account_context),
        culture = culture,
        onNavigate = onNavigate,
        section = Section.ACCOUNT,
    ) {
        if (state.phase != AccountPhase.READY) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    text = stringResource(R.string.account_reading),
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                )
            }
            return@NaveShell
        }

        val email = state.email
        val shownEmail = email?.uppercase() ?: stringResource(R.string.account_email_unknown)
        var strikeOpen by rememberSaveable { mutableStateOf(false) }
        var typed by rememberSaveable { mutableStateOf("") }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = Spacing.Gutter, vertical = Spacing.Section),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = stringResource(R.string.account_kicker, shownEmail),
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                    modifier = Modifier.weight(1f),
                )
                Badge(stringResource(R.string.account_sync_on), tone = BadgeTone.OUTLINE)
            }
            AccentRule(Modifier.padding(vertical = Spacing.Step))

            LedgerRow(stringResource(R.string.account_culture)) {
                // CHANGE is 48dp tall for its touch target; centring keeps the
                // culture's name on CHANGE's line instead of riding above it.
                Row(
                    horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(culture.label.uppercase(), style = MaterialTheme.typography.labelSmall, color = Bone)
                    val change = stringResource(R.string.account_change)
                    Text(
                        text = change,
                        style = MaterialTheme.typography.labelSmall,
                        color = accent,
                        modifier = Modifier
                            .minimumInteractiveComponentSize()
                            .clickable(onClickLabel = change, role = Role.Button, onClick = onChangeCulture),
                    )
                }
            }
            LedgerRow(stringResource(R.string.account_your_chart)) {
                LedgerValue(stringResource(if (state.hasChart) R.string.account_synced else R.string.account_not_cast))
            }
            LedgerRow(stringResource(R.string.account_devices)) {
                LedgerValue(stringResource(R.string.account_this_one))
            }
            LedgerRow(stringResource(R.string.account_licences), last = true) {
                val open = stringResource(R.string.account_licences_open)
                Text(
                    text = open,
                    style = MaterialTheme.typography.labelSmall,
                    color = accent,
                    modifier = Modifier
                        .minimumInteractiveComponentSize()
                        .clickable(
                            onClickLabel = stringResource(R.string.account_licences),
                            role = Role.Button,
                            onClick = onOpenLicences,
                        ),
                )
            }

            Column(
                modifier = Modifier.padding(top = Spacing.Step),
                verticalArrangement = Arrangement.spacedBy(Spacing.Snug),
            ) {
                ActionButton(
                    label = stringResource(
                        if (state.busy == AccountAction.SIGN_OUT) R.string.account_signing_out else R.string.account_sign_out
                    ),
                    onClick = model::signOut,
                    enabled = state.busy == null,
                )
                if (!strikeOpen) {
                    ConflictAction(
                        label = stringResource(R.string.account_strike),
                        onClick = { strikeOpen = true },
                        enabled = state.busy == null && email != null,
                    )
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, Conflict)
                            .padding(Spacing.Step),
                        verticalArrangement = Arrangement.spacedBy(Spacing.Snug),
                    ) {
                        Text(
                            text = stringResource(R.string.account_strike_confirm, shownEmail),
                            style = MaterialTheme.typography.labelSmall,
                            color = Conflict,
                        )
                        RecordField(
                            label = null,
                            value = typed,
                            onValueChange = { typed = it },
                            keyboardType = KeyboardType.Email,
                            placeholder = email,
                            onDone = { model.strike(typed) },
                        )
                        ConflictAction(
                            label = stringResource(
                                if (state.busy == AccountAction.STRIKE) R.string.account_striking
                                else R.string.account_strike_permanently
                            ),
                            onClick = { model.strike(typed) },
                            enabled = state.busy == null && model.canStrike(typed),
                        )
                    }
                }
                Text(
                    text = stringResource(R.string.account_strike_note),
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                )
            }

            state.notice?.let { NoticeLine(noticeText(it, culture), Modifier.padding(top = Spacing.Step)) }

            SectionDivider(stringResource(R.string.account_export), Modifier.padding(top = Spacing.Section))
            ActionButton(
                label = if (state.busy == AccountAction.EXPORT) {
                    stringResource(R.string.account_export_preparing)
                } else {
                    stringResource(R.string.account_export_action, shownEmail)
                },
                onClick = model::export,
                enabled = state.busy == null,
            )
        }
    }
}

/** THE ROLL: the wait list, and the reader's place on it once entered. */
@Composable
fun WaitListScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
) {
    val model: WaitListViewModel = viewModel(factory = AstraViewModelFactory)
    val state by model.state.collectAsState()
    var email by rememberSaveable { mutableStateOf("") }
    val context = stringResource(R.string.roll_context)

    NaveShell(context = context, culture = culture, onNavigate = onNavigate, section = Section.ACCOUNT) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(bottom = Spacing.Chapter),
        ) {
            NaveHead(kicker = context, headline = stringResource(R.string.roll_headline))
            ProseLine(stringResource(R.string.roll_sub))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = Spacing.Gutter)
                    .padding(top = Spacing.Section),
                verticalArrangement = Arrangement.spacedBy(Spacing.Step),
            ) {
                val position = state.position
                if (position != null) {
                    Text(
                        text = stringResource(R.string.roll_position, rollOrdinal(position)),
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                } else {
                    RecordField(
                        label = null,
                        value = email,
                        onValueChange = { email = it },
                        keyboardType = KeyboardType.Email,
                        placeholder = stringResource(R.string.roll_email_hint),
                        onDone = { model.submit(email) },
                    )
                    ActionButton(
                        label = stringResource(if (state.submitting) R.string.roll_entering else R.string.roll_enter),
                        onClick = { model.submit(email) },
                        weight = ActionWeight.VOTIVE,
                        enabled = !state.submitting,
                    )
                    state.notice?.let { NoticeLine(noticeText(it, culture, unreachable = R.string.roll_failed)) }
                    Text(
                        text = stringResource(R.string.roll_footer),
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                    )
                }
            }
        }
    }
}

/** The sentence for a notice. The device-write failure is said in the culture's register. */
@Composable
private fun noticeText(
    notice: AccountNotice,
    culture: AncientCulture,
    @StringRes unreachable: Int = R.string.account_error_unreachable,
): String = when (notice) {
    is AccountNotice.Server -> notice.text
    AccountNotice.Unreachable -> stringResource(unreachable)
    AccountNotice.Unreadable -> stringResource(R.string.account_error_unreadable)
    AccountNotice.DeviceWriteFailed -> stringResource(deviceWriteFailed(culture))
    AccountNotice.RecordRefused -> stringResource(R.string.record_refused)
    AccountNotice.CredentialsMissing -> stringResource(R.string.record_missing)
    AccountNotice.PasswordsDisagree -> stringResource(R.string.account_error_passwords_disagree)
    AccountNotice.ExportNotWritten -> stringResource(R.string.account_error_export_not_written)
}

@StringRes
private fun deviceWriteFailed(culture: AncientCulture): Int = when (culture) {
    AncientCulture.EGYPT -> R.string.account_error_device_write_egypt
    AncientCulture.GREECE -> R.string.account_error_device_write_greece
    AncientCulture.CANAAN -> R.string.account_error_device_write_canaan
    AncientCulture.CARTHAGE -> R.string.account_error_device_write_carthage
    AncientCulture.ROME -> R.string.account_error_device_write_rome
}

/** A notice, in the prose face and the signal ink. */
@Composable
private fun NoticeLine(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodySmall,
        color = Conflict,
        textAlign = TextAlign.Center,
        modifier = modifier.fillMaxWidth(),
    )
}

@Composable
private fun ProseLine(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyMedium,
        color = Prose,
        textAlign = TextAlign.Center,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter),
    )
}

/**
 * A labelled field on the incised rule, square-cornered. A [secret] field
 * hides what is typed, takes the password keyboard (which offers no
 * clipboard or history suggestions) and turns autocorrect off. The last
 * field of a form takes [onDone], which submits it from the keyboard.
 */
@Composable
private fun RecordField(
    label: String?,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    secret: Boolean = false,
    keyboardType: KeyboardType = KeyboardType.Text,
    capitalization: KeyboardCapitalization = KeyboardCapitalization.None,
    placeholder: String? = null,
    onDone: (() -> Unit)? = null,
) {
    val accent = LocalAccent.current
    val colors = TextFieldDefaults.colors(
        focusedContainerColor = Color.Transparent,
        unfocusedContainerColor = Color.Transparent,
        focusedIndicatorColor = accent,
        unfocusedIndicatorColor = Rule,
        focusedTextColor = Bone,
        unfocusedTextColor = Bone,
        cursorColor = accent,
    )
    Column(modifier = modifier.fillMaxWidth()) {
        if (label != null) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.padding(bottom = Spacing.Tight),
            )
        }
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            shape = RectangleShape,
            colors = colors,
            textStyle = MaterialTheme.typography.labelMedium,
            placeholder = placeholder?.let { hint ->
                { Text(hint, style = MaterialTheme.typography.labelMedium, color = FaintInk) }
            },
            visualTransformation = if (secret) PasswordVisualTransformation() else VisualTransformation.None,
            keyboardOptions = KeyboardOptions(
                capitalization = capitalization,
                autoCorrectEnabled = false,
                keyboardType = if (secret) KeyboardType.Password else keyboardType,
                imeAction = if (onDone != null) ImeAction.Done else ImeAction.Next,
            ),
            keyboardActions = KeyboardActions(onDone = onDone?.let { done -> { done() } }),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

/** One ledger row: a dim label, its value at the right, on the faint row rule. */
@Composable
private fun LedgerRow(label: String, last: Boolean = false, value: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(RuleRow))
        // 48dp tall, so CHANGE keeps a full touch target inside the row
        // rather than stretching it.
        Row(
            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = Dim, modifier = Modifier.weight(1f))
            value()
        }
        if (last) Box(Modifier.fillMaxWidth().height(1.dp).background(RuleRow))
    }
}

@Composable
private fun LedgerValue(text: String) {
    Text(text, style = MaterialTheme.typography.labelSmall, color = Bone)
}

/**
 * The strike's action: the ActionButton's shape in the signal ink. The
 * conflict ink is for a warning and nothing else, and this is one.
 */
@Composable
private fun ConflictAction(label: String, onClick: () -> Unit, enabled: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, if (enabled) Conflict else Rule)
            .then(
                if (enabled) Modifier.clickable(onClickLabel = label, role = Role.Button, onClick = onClick) else Modifier
            )
            .padding(vertical = Spacing.Step, horizontal = Spacing.Gutter),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            color = if (enabled) Conflict else Dim,
            textAlign = TextAlign.Center,
        )
    }
}

/** Hands the export to the share sheet as a file, readable by the chosen app for this share only. */
private fun shareExport(context: Context, file: File, title: String) {
    val uri = FileProvider.getUriForFile(context, "${context.packageName}.export", file)
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "application/json"
        putExtra(Intent.EXTRA_STREAM, uri)
        clipData = ClipData.newRawUri(file.name, uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
    }
    try {
        context.startActivity(Intent.createChooser(send, title))
    } catch (_: ActivityNotFoundException) {
        Log.w("Account", "No app on this device takes a shared file")
    }
}
