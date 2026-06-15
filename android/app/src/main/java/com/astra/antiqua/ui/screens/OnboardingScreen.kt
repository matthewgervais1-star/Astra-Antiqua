package com.astra.antiqua.ui.screens

import android.location.Address
import androidx.compose.foundation.clickable
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.ui.components.GlassCard
import com.astra.antiqua.ui.theme.Gold
import com.astra.antiqua.viewmodel.LocationSearchViewModel
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OnboardingScreen(
    onLocationSaved: () -> Unit
) {
    val viewModel: LocationSearchViewModel = viewModel()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val isSearching by viewModel.isSearching.collectAsState()
    val context = LocalContext.current

    // Birth data state
    var name by remember { mutableStateOf("") }
    var selectedDateMillis by remember { mutableStateOf<Long?>(null) }
    var selectedHour by remember { mutableIntStateOf(12) }
    var selectedMinute by remember { mutableIntStateOf(0) }
    var selectedAddress by remember { mutableStateOf<Address?>(null) }
    var showDatePicker by remember { mutableStateOf(false) }
    var showTimePicker by remember { mutableStateOf(false) }

    val datePickerState = rememberDatePickerState()
    val timePickerState = rememberTimePickerState(initialHour = 12, initialMinute = 0)

    val dateFormatter = remember {
        SimpleDateFormat("MMMM d, yyyy", Locale.getDefault()).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
    }

    val canConfirm = name.isNotBlank() && selectedDateMillis != null && selectedAddress != null

    // Debounced search trigger
    LaunchedEffect(searchQuery) {
        if (searchQuery.length >= 3 && selectedAddress == null) {
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
                }) { Text("OK", color = Gold) }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel", color = Color.White)
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
            title = { Text("Select Birth Time", color = Color.White) },
            text = { TimePicker(state = timePickerState) },
            confirmButton = {
                TextButton(onClick = {
                    selectedHour = timePickerState.hour
                    selectedMinute = timePickerState.minute
                    showTimePicker = false
                }) { Text("OK", color = Gold) }
            },
            dismissButton = {
                TextButton(onClick = { showTimePicker = false }) {
                    Text("Cancel", color = Color.White)
                }
            }
        )
    }

    val textFieldColors = TextFieldDefaults.colors(
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White,
        focusedContainerColor = Color.Transparent,
        unfocusedContainerColor = Color.Transparent,
        focusedIndicatorColor = Gold,
        unfocusedIndicatorColor = Color.Gray,
        focusedLabelColor = Gold,
        unfocusedLabelColor = Color.Gray
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 32.dp, vertical = 24.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "ENTER YOUR BIRTH DATA",
            style = MaterialTheme.typography.displaySmall.copy(
                fontFamily = MaterialTheme.typography.displayLarge.fontFamily,
                letterSpacing = 2.sp
            ),
            color = Color.White,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        // Name
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Your Name") },
            modifier = Modifier.fillMaxWidth(),
            colors = textFieldColors,
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Birth Date
        Row(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = selectedDateMillis?.let { dateFormatter.format(Date(it)) } ?: "",
                onValueChange = {},
                label = { Text("Birth Date") },
                modifier = Modifier
                    .weight(1f)
                    .clickable { showDatePicker = true },
                colors = textFieldColors,
                readOnly = true,
                enabled = false
            )
        }
        // Tap target for the disabled field
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(0.dp)
        )
        TextButton(
            onClick = { showDatePicker = true },
            modifier = Modifier.align(Alignment.Start)
        ) {
            Text(
                if (selectedDateMillis == null) "TAP TO SELECT DATE" else "CHANGE DATE",
                color = Gold,
                style = MaterialTheme.typography.labelSmall
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Birth Time
        Row(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = String.format(Locale.US, "%02d:%02d", selectedHour, selectedMinute),
                onValueChange = {},
                label = { Text("Birth Time (24h)") },
                modifier = Modifier
                    .weight(1f)
                    .clickable { showTimePicker = true },
                colors = textFieldColors,
                readOnly = true,
                enabled = false
            )
        }
        TextButton(
            onClick = { showTimePicker = true },
            modifier = Modifier.align(Alignment.Start)
        ) {
            Text(
                "CHANGE TIME",
                color = Gold,
                style = MaterialTheme.typography.labelSmall
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Location Search
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { 
                selectedAddress = null
                viewModel.onSearchQueryChanged(it) 
            },
            label = {
                Text(
                    if (selectedAddress != null) "Birth City (selected)" else "Search Birth City"
                )
            },
            modifier = Modifier.fillMaxWidth(),
            colors = textFieldColors,
            singleLine = true,
            trailingIcon = {
                if (isSearching) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Gold,
                        strokeWidth = 2.dp
                    )
                }
            }
        )

        // Search results (fixed height so it doesn't fight with scroll)
        if (searchResults.isNotEmpty() && selectedAddress == null) {
            Box(modifier = Modifier.height(200.dp)) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp)
                ) {
                    items(searchResults) { address ->
                        val locationName = address.getAddressLine(0)
                            ?: "${address.locality}, ${address.countryName}"
                        GlassCard(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clickable { 
                                    selectedAddress = address
                                    viewModel.onSearchQueryChanged(locationName)
                                }
                        ) {
                            Text(
                                text = locationName,
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        } else if (searchQuery.length >= 3 && searchResults.isEmpty() && !isSearching && selectedAddress == null) {
             Text(
                text = "No cities found. Try a different name.",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        if (selectedAddress != null) {
            val addr = selectedAddress!!
            val locationName = addr.getAddressLine(0)
                ?: "${addr.locality}, ${addr.countryName}"
            GlassCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = locationName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Gold,
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    TextButton(onClick = { selectedAddress = null }) {
                        Text("CHANGE", color = Color.Gray, style = MaterialTheme.typography.labelSmall)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Confirm Button
        Button(
            onClick = {
                val addr = selectedAddress ?: return@Button
                val birthDateUtc = (selectedDateMillis ?: 0L) +
                        (selectedHour * 3600000L) +
                        (selectedMinute * 60000L)
                viewModel.saveProfile(context, name, birthDateUtc, addr, onLocationSaved)
            },
            enabled = canConfirm,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = Gold,
                contentColor = Color.Black,
                disabledContainerColor = Color.DarkGray,
                disabledContentColor = Color.Gray
            )
        ) {
            Text(
                text = "CONSULT THE ORACLE",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontFamily = MaterialTheme.typography.displayLarge.fontFamily,
                    letterSpacing = 2.sp
                )
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
