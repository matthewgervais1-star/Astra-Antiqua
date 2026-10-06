package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.PressInteraction
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.TimePicker
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.material3.rememberTimePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.birthZoneFor
import com.astra.antiqua.domain.resolveBirthDateUtcMillis
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.PrimaryAction
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.LocationSearchViewModel
import com.astra.antiqua.viewmodel.Place
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScreen(
    onLocationSaved: () -> Unit,
    /**
     * A way out, for the times this form is reached from the chart rather
     * than from the first run. The first run has nowhere to go back to and
     * passes null, so no dead control is drawn there.
     */
    onCancel: (() -> Unit)? = null,
) {
    val viewModel: LocationSearchViewModel = viewModel(factory = AstraViewModelFactory)
    val searchQuery by viewModel.searchQuery.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val isSearching by viewModel.isSearching.collectAsState()
    val context = LocalContext.current
    val accent = LocalAccent.current

    // Birth data state
    var name by remember { mutableStateOf("") }
    var selectedDateMillis by remember { mutableStateOf<Long?>(null) }
    var selectedHour by remember { mutableIntStateOf(12) }
    var selectedMinute by remember { mutableIntStateOf(0) }
    var selectedPlace by remember { mutableStateOf<Place?>(null) }
    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }

    val datePickerState = rememberDatePickerState()
    val timePickerState = rememberTimePickerState(initialHour = 12, initialMinute = 0)

    val dateFormatter = remember {
        SimpleDateFormat("MMMM d, yyyy", Locale.getDefault()).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
    }

    val canConfirm = name.isNotBlank() && selectedDateMillis != null && selectedPlace != null

    // Debounced search trigger
    LaunchedEffect(searchQuery) {
        if (searchQuery.length >= 3 && selectedPlace == null) {
            delay(600) // Debounce delay
            viewModel.searchLocation(context, searchQuery)
        }
    }

    // Date Picker Dialog
    if (showDatePicker) {
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    selectedDateMillis = datePickerState.selectedDateMillis
                    showDatePicker = false
                }) { Text("OK", color = accent) }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel", color = Bone)
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    // Time Picker Dialog
    if (showTimePicker) {
        AlertDialog(
            onDismissRequest = { showTimePicker = false },
            title = { Text("Select Birth Time", color = Bone) },
            text = { TimePicker(state = timePickerState) },
            confirmButton = {
                TextButton(onClick = {
                    selectedHour = timePickerState.hour
                    selectedMinute = timePickerState.minute
                    showTimePicker = false
                }) { Text("OK", color = accent) }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) {
                    Text("Cancel", color = Bone)
                }
            }
        )
    }

    val textFieldColors = TextFieldDefaults.colors(
        focusedTextColor = Bone,
        unfocusedTextColor = Bone,
        focusedContainerColor = Color.Transparent,
        unfocusedContainerColor = Color.Transparent,
        focusedIndicatorColor = accent,
        unfocusedIndicatorColor = Rule,
        focusedLabelColor = accent,
        unfocusedLabelColor = Dim,
        cursorColor = accent,
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Section)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (onCancel != null) {
            Text(
                text = "← BACK",
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier
                    .align(Alignment.Start)
                    .clickable(
                        onClickLabel = "Leave this form",
                        role = Role.Button,
                        onClick = onCancel,
                    )
                    .padding(bottom = Spacing.Step),
            )
        }

        Text(
            text = displayCase("Enter Your Birth Data"),
            style = MaterialTheme.typography.displaySmall,
            color = Bone,
            modifier = Modifier.padding(bottom = Spacing.Section)
        )

        // Name
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Your Name") },
            modifier = Modifier.fillMaxWidth(),
            colors = textFieldColors,
            shape = RectangleShape,
            singleLine = true
        )

        Spacer(modifier = Modifier.height(Spacing.Step))

        // Birth Date. Read-only, but the field itself -- not a separate
        // TextButton underneath it -- is the tap target and the thing
        // TalkBack announces, so the accessible control and the visible one
        // are the same element.
        // A read-only field cannot be opened with Modifier.clickable: the text
        // field consumes the press for focus and the click never arrives. The
        // press has to be read from the field's own interaction source, with
        // the semantics declared separately so a screen reader still announces
        // and activates it as a button.
        val dateLabel = if (selectedDateMillis == null) "Select birth date" else "Change birth date"
        val datePresses = remember { MutableInteractionSource() }
        LaunchedEffect(datePresses) {
            datePresses.interactions.collect { if (it is PressInteraction.Release) showDatePicker = true }
        }
        OutlinedTextField(
            value = selectedDateMillis?.let { dateFormatter.format(Date(it)) } ?: "",
            onValueChange = {},
            label = { Text("Birth Date") },
            placeholder = { Text("Tap to select", color = Dim) },
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    role = Role.Button
                    onClick(label = dateLabel) { showDatePicker = true; true }
                },
            interactionSource = datePresses,
            colors = textFieldColors,
            shape = RectangleShape,
            readOnly = true,
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(Spacing.Step))

        // Birth Time. Same read-only-plus-clickable treatment as the date.
        val timePresses = remember { MutableInteractionSource() }
        LaunchedEffect(timePresses) {
            timePresses.interactions.collect { if (it is PressInteraction.Release) showTimePicker = true }
        }
        OutlinedTextField(
            value = String.format(Locale.US, "%02d:%02d", selectedHour, selectedMinute),
            onValueChange = {},
            label = { Text("Birth Time (24h)") },
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    role = Role.Button
                    onClick(label = "Change birth time") { showTimePicker = true; true }
                },
            interactionSource = timePresses,
            colors = textFieldColors,
            shape = RectangleShape,
            readOnly = true,
            singleLine = true,
        )

        Spacer(modifier = Modifier.height(Spacing.Step))

        // Location Search
        OutlinedTextField(
            value = searchQuery,
            onValueChange = {
                selectedPlace = null
                viewModel.onSearchQueryChanged(context, it)
            },
            label = {
                Text(
                    if (selectedPlace != null) "Birth City (selected)" else "Search Birth City"
                )
            },
            modifier = Modifier.fillMaxWidth(),
            colors = textFieldColors,
            shape = RectangleShape,
            singleLine = true,
            trailingIcon = {
                if (isSearching) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = accent,
                        strokeWidth = 2.dp
                    )
                }
            }
        )

        // Search results (fixed height so it doesn't fight with scroll)
        if (searchResults.isNotEmpty() && selectedPlace == null) {
            Box(modifier = Modifier.height(200.dp)) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = Spacing.Snug)
                ) {
                    items(searchResults) { place ->
                        Panel(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = Spacing.Tight)
                                .clickable {
                                    selectedPlace = place
                                    viewModel.onSearchQueryChanged(context, place.label)
                                }
                        ) {
                            Text(
                                text = place.label,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Bone
                            )
                        }
                    }
                }
            }
        } else if (searchQuery.length >= 3 && searchResults.isEmpty() && !isSearching && selectedPlace == null) {
             Text(
                text = "No cities found. Try a different name.",
                style = MaterialTheme.typography.bodySmall,
                color = Dim,
                modifier = Modifier.padding(top = Spacing.Snug)
            )
        }

        if (selectedPlace != null) {
            val addr = selectedPlace!!
            val locationName = addr.label
            Panel(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = Spacing.Snug)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = locationName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = accent,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(Spacing.Snug))
                    Text(
                        text = "CHANGE",
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                        modifier = Modifier.clickable(
                            onClickLabel = "Change birth city",
                            role = Role.Button,
                        ) { selectedPlace = null }
                    )
                }
            }
            Text(
                text = "The birth time above is read in this city's own time zone, with " +
                    "its daylight-saving history, not your device's time zone.",
                style = MaterialTheme.typography.bodySmall,
                color = Dim,
                modifier = Modifier.padding(top = Spacing.Snug)
            )
        }

        Spacer(modifier = Modifier.height(Spacing.Section))

        // Confirm Button
        PrimaryAction(
            label = "Consult the Oracle",
            enabled = canConfirm,
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                val addr = selectedPlace ?: return@PrimaryAction

                // The birth place's own IANA zone (birthZoneFor, the
                // lookup web uses), NOT the device's current zone, which
                // would depend on wherever the phone entering this data
                // happens to be configured rather than on the birth itself.
                // selectedDateMillis is UTC midnight of the picked calendar
                // date (Material3's DatePickerState contract), not a real
                // instant, so it must be combined with the picked
                // hour/minute THROUGH a zone conversion, not by adding
                // clock-offset millis onto it.
                val assumedBirthZone = birthZoneFor(addr.latitude, addr.longitude)
                val birthDateUtc = resolveBirthDateUtcMillis(
                    utcMidnightMillis = selectedDateMillis ?: 0L,
                    hour = selectedHour,
                    minute = selectedMinute,
                    zoneId = assumedBirthZone
                )
                viewModel.saveProfile(
                    name = name,
                    birthDateUtc = birthDateUtc,
                    timezoneId = assumedBirthZone.id,
                    place = addr,
                    onSaved = onLocationSaved
                )
            },
        )

        Spacer(modifier = Modifier.height(Spacing.Section))
    }
}
