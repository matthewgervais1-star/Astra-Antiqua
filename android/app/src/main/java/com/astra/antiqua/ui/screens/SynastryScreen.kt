package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.text.KeyboardOptions
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.AspectVerbs
import com.astra.antiqua.domain.estimateZoneOffsetForLongitude
import com.astra.antiqua.domain.resolveBirthDateUtcMillis
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.Bond
import com.astra.antiqua.viewmodel.LocationSearchViewModel
import com.astra.antiqua.viewmodel.Place
import com.astra.antiqua.viewmodel.SynastryState
import com.astra.antiqua.viewmodel.SynastryViewModel
import java.util.Calendar
import java.util.TimeZone

/** The ten tightest contacts: past that a synastry reads as a list, not a reading. */
private const val SHOWN_BONDS = 10

/**
 * Two charts read against each other, web's /synastry.
 *
 * The second party is entered for the reading and never stored. Web compares
 * two saved charts because web keeps many; this surface keeps one birth
 * record, so nothing about another person is written to the device. That is a
 * smaller feature and a plainer promise, and the screen says so.
 */
@Composable
fun SynastryScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onCastChart: () -> Unit,
) {
    val viewModel: SynastryViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.state.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { viewModel.load() }

    NaveShell(
        context = "Two charts, read against each other",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.CHART,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item { NaveHead(kicker = "The bond between two skies", headline = "Synastry") }

            when (val current = state) {
                is SynastryState.NeedsChart -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = "A synastry is read between two charts. There is none on " +
                                "this device yet.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Prose,
                            textAlign = TextAlign.Center,
                        )
                        Box(modifier = Modifier.padding(top = Spacing.Step)) {
                            ActionButton(
                                label = "Cast your chart",
                                weight = ActionWeight.VOTIVE,
                                onClick = onCastChart,
                            )
                        }
                    }
                }

                is SynastryState.Computing -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) { CircularProgressIndicator(color = accent) }
                }

                is SynastryState.Error -> item {
                    Text(
                        text = current.message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Conflict,
                        modifier = Modifier.padding(Spacing.Gutter),
                    )
                }

                is SynastryState.Waiting -> item {
                    SecondParty(
                        yourName = current.yourName,
                        onCompare = viewModel::compare,
                    )
                }

                is SynastryState.Ready -> {
                    item {
                        Panel(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = Spacing.Gutter),
                        ) {
                            Text(
                                text = "${current.yourName.uppercase()} AND " +
                                    "${current.theirName.uppercase()} · " +
                                    "${current.bonds.size} CONTACTS IN ORB",
                                style = MaterialTheme.typography.labelSmall,
                                color = Dim,
                            )
                        }
                    }
                    item {
                        SectionDivider(
                            label = "The tightest contacts",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (current.bonds.isEmpty()) {
                        item {
                            Text(
                                text = "NOTHING BETWEEN THESE TWO CHARTS IS IN ORB",
                                style = MaterialTheme.typography.labelSmall,
                                color = Dim,
                                modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
                            )
                        }
                    } else {
                        items(current.bonds.take(SHOWN_BONDS)) { bond ->
                            BondRow(bond, current.culture, current.yourName, current.theirName)
                        }
                    }
                    item {
                        Text(
                            text = "NOTHING ABOUT THE SECOND PERSON IS SAVED · THIS READING " +
                                "LIVES ONLY AS LONG AS THE SCREEN DOES",
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                            modifier = Modifier.padding(Spacing.Gutter),
                        )
                        Box(modifier = Modifier.padding(horizontal = Spacing.Gutter)) {
                            ActionButton(
                                label = "Read against someone else",
                                weight = ActionWeight.PRIMARY,
                                onClick = viewModel::reset,
                            )
                        }
                        Column(Modifier.padding(Spacing.Chapter)) {}
                    }
                }
            }
        }
    }
}

/** One contact: your body, their body, and the angle between them. */
@Composable
private fun BondRow(
    bond: Bond,
    culture: AncientCulture,
    yourName: String,
    theirName: String,
) {
    val accent = LocalAccent.current
    val mine = DeityRegistry.getDeity(culture, bond.mine).name
    val theirs = DeityRegistry.getDeity(culture, bond.theirs).name
    val verb = AspectVerbs.of(culture, bond.aspect)
    val received = bond.mine.isReceived || bond.theirs.isReceived

    RowRule()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.Tight),
        ) {
            DeityGlyph(body = bond.mine, culture = culture, size = 16.dp)
            Text(
                text = "→",
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
            )
            DeityGlyph(body = bond.theirs, culture = culture, size = 16.dp)
            Box(modifier = Modifier.padding(start = Spacing.Tight)) {
                Badge(
                    text = "%.1f°".format(bond.orb),
                    tone = if (bond.orb < 1.0) BadgeTone.ACCENT else BadgeTone.OUTLINE,
                )
            }
        }
        Text(
            text = "Your $mine $verb their $theirs.",
            style = MaterialTheme.typography.bodyMedium,
            color = if (received) accent else Bone,
            modifier = Modifier.padding(top = Spacing.Snug),
        )
        Text(
            text = "${yourName.uppercase()} → ${theirName.uppercase()} · " +
                bond.aspect.name,
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.padding(top = Spacing.Tight),
        )
    }
}

/**
 * The second party's details, entered for this reading only.
 *
 * The same birthplace picker the first run uses, so a reader offline can
 * still name a place. The birth zone is estimated from the place's longitude,
 * exactly as the first run does, and the screen says that rather than
 * implying a precision it does not have.
 */
@Composable
private fun SecondParty(
    yourName: String,
    onCompare: (String, Long, Double, Double) -> Unit,
) {
    val context = LocalContext.current
    val search: LocationSearchViewModel = viewModel(factory = AstraViewModelFactory)
    val results by search.searchResults.collectAsState()
    val query by search.searchQuery.collectAsState()
    val accent = LocalAccent.current

    var theirName by remember { mutableStateOf("") }
    var year by remember { mutableStateOf("") }
    var month by remember { mutableStateOf("") }
    var day by remember { mutableStateOf("") }
    var hour by remember { mutableStateOf("12") }
    var minute by remember { mutableStateOf("00") }
    var place by remember { mutableStateOf<Place?>(null) }

    val colors = TextFieldDefaults.colors(
        focusedContainerColor = androidx.compose.ui.graphics.Color.Transparent,
        unfocusedContainerColor = androidx.compose.ui.graphics.Color.Transparent,
        focusedIndicatorColor = accent,
        unfocusedIndicatorColor = Rule,
        focusedTextColor = Bone,
        unfocusedTextColor = Bone,
        cursorColor = accent,
    )

    val ready = theirName.isNotBlank() &&
        year.length == 4 && month.isNotBlank() && day.isNotBlank() && place != null

    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.Gutter)) {
        Text(
            text = "Your chart is on this device as ${yourName.uppercase()}. Enter the second " +
                "person's birth to read the bond. Nothing about them is saved.",
            style = MaterialTheme.typography.bodyMedium,
            color = Prose,
        )

        OutlinedTextField(
            value = theirName,
            onValueChange = { theirName = it },
            label = { Text("Their name") },
            singleLine = true,
            shape = RectangleShape,
            colors = colors,
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.Step),
        )

        Row(
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug),
            horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
        ) {
            NumberField("Year", year, 4, { year = it }, colors, Modifier.weight(1.4f))
            NumberField("Month", month, 2, { month = it }, colors, Modifier.weight(1f))
            NumberField("Day", day, 2, { day = it }, colors, Modifier.weight(1f))
        }
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug),
            horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
        ) {
            NumberField("Hour", hour, 2, { hour = it }, colors, Modifier.weight(1f))
            NumberField("Minute", minute, 2, { minute = it }, colors, Modifier.weight(1f))
        }

        OutlinedTextField(
            value = query,
            onValueChange = {
                place = null
                search.onSearchQueryChanged(context, it)
            },
            label = { Text(if (place != null) "Birth city (chosen)" else "Their birth city") },
            singleLine = true,
            shape = RectangleShape,
            colors = colors,
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug),
        )

        if (place == null) {
            results.take(5).forEach { candidate ->
                Panel(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = Spacing.Tight)
                        .clickable(
                            onClickLabel = candidate.label,
                            role = Role.Button,
                            onClick = {
                                place = candidate
                                search.onSearchQueryChanged(context, candidate.label)
                            },
                        ),
                ) {
                    Text(
                        text = candidate.label,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Bone,
                    )
                }
            }
        }

        Box(modifier = Modifier.padding(top = Spacing.Step)) {
            ActionButton(
                label = "Read the bond",
                weight = ActionWeight.VOTIVE,
                enabled = ready,
                onClick = {
                    val chosen = place ?: return@ActionButton
                    // The birth zone is estimated from the place's longitude,
                    // the same stand-in the first run uses, because there is
                    // no birth-location timezone lookup on this surface.
                    val zone = estimateZoneOffsetForLongitude(chosen.longitude)
                    val utcMidnight = utcMidnightOf(
                        year.toIntOrNull() ?: 2000,
                        (month.toIntOrNull() ?: 1).coerceIn(1, 12),
                        (day.toIntOrNull() ?: 1).coerceIn(1, 31),
                    )
                    val birthDateUtc = resolveBirthDateUtcMillis(
                        utcMidnightMillis = utcMidnight,
                        hour = (hour.toIntOrNull() ?: 12).coerceIn(0, 23),
                        minute = (minute.toIntOrNull() ?: 0).coerceIn(0, 59),
                        zoneId = zone,
                    )
                    onCompare(theirName, birthDateUtc, chosen.latitude, chosen.longitude)
                },
            )
        }
        Text(
            text = "THE BIRTH ZONE IS ESTIMATED FROM THE PLACE'S LONGITUDE · A TRANSITION DATE " +
                "MAY BE OFF BY UP TO AN HOUR",
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.padding(top = Spacing.Snug),
        )
        Column(Modifier.height(Spacing.Chapter)) {}
    }
}

@Composable
private fun NumberField(
    label: String,
    value: String,
    maxLength: Int,
    onChange: (String) -> Unit,
    colors: androidx.compose.material3.TextFieldColors,
    modifier: Modifier = Modifier,
) {
    OutlinedTextField(
        value = value,
        onValueChange = { next -> onChange(next.filter(Char::isDigit).take(maxLength)) },
        label = { Text(label) },
        singleLine = true,
        shape = RectangleShape,
        colors = colors,
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        modifier = modifier,
    )
}

/** UTC midnight of a calendar date, the contract the birth resolver expects. */
private fun utcMidnightOf(year: Int, month: Int, day: Int): Long =
    Calendar.getInstance(TimeZone.getTimeZone("UTC")).apply {
        clear()
        set(year, month - 1, day, 0, 0, 0)
    }.timeInMillis
