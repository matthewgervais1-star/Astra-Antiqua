package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.LongTransits
import com.astra.antiqua.domain.SkyEvent
import com.astra.antiqua.domain.SkyEventKind
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.HorizonViewModel
import com.astra.antiqua.viewmodel.SeasonState
import com.astra.antiqua.viewmodel.YearState
import java.util.Calendar
import java.util.Date

/** Every horizon is built, so the control lights all four. */
private val ALL_HORIZONS = Horizon.entries.toSet()

/**
 * The season, web's /season: the stretch the Sun spends in its current sign,
 * what is changing in it, and every sign change, station and lunar quarter
 * inside it.
 *
 * The window is found by walking to the ingress either side rather than
 * assuming thirty days, because the signs are not equal in time. The counter
 * says which day of the season today is, which is the thing a reader cannot
 * work out from a date alone. WHAT IS CHANGING is web's first section, the
 * reader's own transits among the beats it weighs.
 */
@Composable
fun SeasonScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
) {
    val viewModel: HorizonViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.season.collectAsState()
    val accent = LocalAccent.current
    val lexicon = LocalLexicon.current

    LaunchedEffect(Unit) { viewModel.loadSeason() }

    NaveShell(
        context = "${lexicon.dashboardTitle} · the season",
        culture = culture,
        onNavigate = onNavigate,
        horizon = Horizon.SEASON,
        builtHorizons = ALL_HORIZONS,
        section = Section.TODAY,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when (val current = state) {
                is SeasonState.Loading -> item { Waiting(accent = accent) }

                is SeasonState.Error -> item { Failed(current.message) }

                is SeasonState.Ready -> {
                    val window = current.window
                    item {
                        NaveHead(
                            kicker = "${lexicon.dashboardTitle} · the season",
                            culture = culture,
                            headline = "The Sun in ${window.sign.signName}",
                            sub = "Day ${window.dayOfSeason} of ${window.totalDays} · " +
                                "${dayMonthYear(window.start)} to ${dayMonthYear(window.end)}",
                        )
                    }
                    item {
                        SectionDivider(
                            label = "What is changing",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                        Text(
                            text = current.whatIsChanging,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Prose,
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    item {
                        SectionDivider(
                            label = "What the sky does",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (current.events.isEmpty()) {
                        item { Quiet("NOTHING CHANGES SIGN OR STATION INSIDE THIS SEASON") }
                    } else {
                        items(current.events, key = { "${it.kind}-${it.body}-${it.date.time}" }) {
                            EventRow(it, current.culture)
                        }
                    }
                    item { Tail("THE SUN'S SIGN IS THE SEASON · ITS EDGES ARE THE TWO INGRESSES EITHER SIDE") }
                }
            }
        }
    }
}

/**
 * The year, web's /year: with a chart, the year's long transits, its spine;
 * then twelve months of sign changes and stations, grouped by the month they
 * fall in.
 *
 * The Moon is left out. It changes sign every two and a half days, so
 * thirteen ingresses a month would bury everything a year is for.
 */
@Composable
fun YearScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenSpan: (String) -> Unit = {},
) {
    val viewModel: HorizonViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.year.collectAsState()
    val accent = LocalAccent.current
    val lexicon = LocalLexicon.current

    LaunchedEffect(Unit) { viewModel.loadYear() }

    NaveShell(
        context = "${lexicon.dashboardTitle} · the year",
        culture = culture,
        onNavigate = onNavigate,
        horizon = Horizon.YEAR,
        builtHorizons = ALL_HORIZONS,
        section = Section.TODAY,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when (val current = state) {
                is YearState.Loading -> item { Waiting(accent = accent) }

                is YearState.Error -> item { Failed(current.message) }

                is YearState.Ready -> {
                    item {
                        NaveHead(
                            kicker = "${lexicon.dashboardTitle} · the year",
                            culture = culture,
                            headline = "The year ahead",
                            sub = "${dayMonthYear(current.start)} onward · " +
                                "${current.events.size} turnings",
                        )
                    }
                    if (current.spine.isNotEmpty()) {
                        item { YearSpine(current.spine, current.culture, onOpenSpan) }
                    }
                    val byMonth = current.events.groupBy { monthKey(it.date) }
                    byMonth.forEach { (_, events) ->
                        val first = events.firstOrNull() ?: return@forEach
                        item {
                            SectionDivider(
                                label = monthYearLabel(first.date),
                                modifier = Modifier.padding(horizontal = Spacing.Gutter),
                            )
                        }
                        items(events, key = { "${it.kind}-${it.body}-${it.date.time}" }) {
                            EventRow(it, current.culture)
                        }
                    }
                    item { Tail("SIGN CHANGES AND STATIONS ONLY · THE MOON IS LEFT OUT, OR IT WOULD BURY THE REST") }
                }
            }
        }
    }
}

/**
 * The year's long transits, web's spine box on /year: six spans at most,
 * read against the reader's chart, each to its own page, with the month it
 * ends.
 */
@Composable
private fun YearSpine(spans: List<TransitSpan>, culture: AncientCulture, onOpenSpan: (String) -> Unit) {
    val accent = LocalAccent.current
    Panel(
        accented = true,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(Spacing.Snug)) {
            Text(
                text = "THE YEAR'S LONG TRANSITS · ITS SPINE",
                style = MaterialTheme.typography.labelSmall,
                color = accent,
            )
            spans.forEach { span ->
                val headline = LongTransits.spanHeadline(culture, span)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(
                            onClickLabel = "Read the long transit",
                            role = Role.Button,
                            onClick = { onOpenSpan(span.id) },
                        ),
                ) {
                    Text(
                        text = displayCase(headline),
                        style = MaterialTheme.typography.titleMedium,
                        color = Prose,
                    )
                    Text(
                        text = "→ ${monthYear(span.end)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                        modifier = Modifier.padding(top = Spacing.Tight),
                    )
                }
            }
        }
    }
}

/** One turning of the sky: who, what, and in which sign. */
@Composable
private fun EventRow(event: SkyEvent, culture: AncientCulture) {
    val accent = LocalAccent.current
    val deity = DeityRegistry.getDeity(culture, event.body).name
    val received = event.body.isReceived

    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
    ) {
        Text(
            text = dayMonth(event.date),
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.width(62.dp),
        )
        DeityGlyph(
            body = event.body,
            culture = culture,
            size = 16.dp,
            tint = if (received) accent else Bone,
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = describe(event, deity),
                style = MaterialTheme.typography.bodySmall,
                color = Prose,
            )
            Text(
                text = when (event.kind) {
                    SkyEventKind.INGRESS -> "SIGN CHANGE"
                    SkyEventKind.RETROGRADE -> "TURNS RETROGRADE"
                    SkyEventKind.DIRECT -> "TURNS DIRECT"
                    SkyEventKind.MOON_QUARTER -> "LUNAR QUARTER"
                },
                style = MaterialTheme.typography.labelSmall,
                color = if (event.kind == SkyEventKind.RETROGRADE) Conflict else Dim,
                modifier = Modifier.padding(top = Spacing.Tight),
            )
        }
    }
}

/**
 * The plain statement of a turning. No culture frame here: an ingress is a
 * fact about the sky, and the method page's promise is that facts are
 * reported and nothing else is invented around them.
 */
private fun describe(event: SkyEvent, deity: String): String = when (event.kind) {
    SkyEventKind.INGRESS ->
        "$deity leaves ${event.fromSign?.signName ?: "its sign"} and enters ${event.sign.signName}."
    SkyEventKind.RETROGRADE -> "$deity turns retrograde in ${event.sign.signName}."
    SkyEventKind.DIRECT -> "$deity turns direct again in ${event.sign.signName}."
    SkyEventKind.MOON_QUARTER -> "${event.quarter ?: "Quarter"} in ${event.sign.signName}."
}

@Composable
private fun Waiting(accent: androidx.compose.ui.graphics.Color) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) { CircularProgressIndicator(color = accent) }
}

@Composable
private fun Failed(message: String) {
    Text(
        text = message,
        style = MaterialTheme.typography.bodyMedium,
        color = Conflict,
        modifier = Modifier.padding(Spacing.Gutter),
    )
}

@Composable
private fun Quiet(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = Dim,
        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
    )
}

@Composable
private fun Tail(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = Dim,
        modifier = Modifier.padding(Spacing.Gutter),
    )
    Column(Modifier.padding(Spacing.Chapter)) {}
}

private val MONTHS = listOf(
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
)

private fun calendarOf(date: Date): Calendar = Calendar.getInstance().apply { time = date }

private fun dayMonth(date: Date): String {
    val calendar = calendarOf(date)
    return "${calendar.get(Calendar.DAY_OF_MONTH)} ${MONTHS[calendar.get(Calendar.MONTH)]}"
}

private fun dayMonthYear(date: Date): String {
    val calendar = calendarOf(date)
    return "${dayMonth(date)} ${calendar.get(Calendar.YEAR)}"
}

private fun monthKey(date: Date): Int {
    val calendar = calendarOf(date)
    return calendar.get(Calendar.YEAR) * 12 + calendar.get(Calendar.MONTH)
}

private fun monthYearLabel(date: Date): String {
    val calendar = calendarOf(date)
    return "${MONTHS[calendar.get(Calendar.MONTH)]} ${calendar.get(Calendar.YEAR)}"
}
