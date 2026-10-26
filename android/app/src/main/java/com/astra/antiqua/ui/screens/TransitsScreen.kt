package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.AspectVerbs
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SpansState
import com.astra.antiqua.viewmodel.TransitsViewModel
import java.util.Calendar
import java.util.Date

/**
 * The long transits, web's /transits: every span the five slow bodies make
 * against the natal Sun, Moon, ascendant and midheaven, split into the ones
 * running now and the ones still to come.
 *
 * A transit here is a stretch, not a date. That is the claim the three-degree
 * rule on the method page makes, and it is why each row prints the window and
 * the number of exact passes rather than a single day.
 */
@Composable
fun TransitsScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenSpan: (String) -> Unit,
) {
    val viewModel: TransitsViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.state.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { viewModel.load() }

    NaveShell(
        context = "The long transits",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.TRANSITS,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(
                    kicker = "Read against your own sky",
                    headline = "The long transits",
                    culture = culture,
                )
            }
            when (val current = state) {
                is SpansState.Loading -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        CircularProgressIndicator(color = accent)
                        Text(
                            text = "COMPUTING THE SKY…",
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                            modifier = Modifier.padding(top = Spacing.Step),
                        )
                    }
                }

                is SpansState.NoChart -> item { NoChartNote() }

                is SpansState.Error -> item {
                    Text(
                        text = current.message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Conflict,
                        modifier = Modifier.padding(Spacing.Gutter),
                    )
                }

                is SpansState.Ready -> {
                    val running = current.spans.filter {
                        it.start.time <= current.now.time && it.end.time >= current.now.time
                    }
                    val coming = current.spans.filter { it.start.time > current.now.time }

                    item {
                        SectionDivider(
                            label = "Running now",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (running.isEmpty()) {
                        item { EmptyNote("NO LONG TRANSIT IS IN ORB TODAY") }
                    } else {
                        items(running, key = { it.id }) { span ->
                            SpanRow(span, culture, current.now, onOpenSpan)
                        }
                    }

                    item {
                        SectionDivider(
                            label = "Still to come",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (coming.isEmpty()) {
                        item { EmptyNote("NOTHING FURTHER INSIDE THE WINDOW") }
                    } else {
                        items(coming, key = { it.id }) { span ->
                            SpanRow(span, culture, current.now, onOpenSpan)
                        }
                    }
                }
            }
            item { Column(Modifier.padding(Spacing.Chapter)) {} }
        }
    }
}

@Composable
private fun EmptyNote(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
    )
}

@Composable
private fun NoChartNote() {
    Column(
        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "A long transit is scored against your own sky, the chart cast once at " +
                "the hour of your birth and kept. There is no chart on this device.",
            style = MaterialTheme.typography.bodyMedium,
            color = Prose,
            textAlign = TextAlign.Center,
        )
    }
}

/** One span: who is meeting what, over which months, in how many passes. */
@Composable
private fun SpanRow(
    span: TransitSpan,
    culture: AncientCulture,
    now: Date,
    onOpenSpan: (String) -> Unit,
) {
    val accent = LocalAccent.current
    val transitDeity = DeityRegistry.getDeity(culture, span.transitPlanet).name
    val verb = AspectVerbs.of(culture, span.aspect)
    val received = span.transitPlanet.isReceived
    val passWord = if (span.passes.size == 1) "PASS" else "PASSES"
    val remaining = span.passes.count { it.time > now.time }

    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                onClickLabel = transitDeity,
                role = Role.Button,
                onClick = { onOpenSpan(span.id) },
            )
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(modifier = Modifier.padding(end = Spacing.Snug)) {
            DeityGlyph(
                body = span.transitPlanet,
                culture = culture,
                size = 18.dp,
                tint = if (received) accent else Bone,
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = displayCase("${transitDeity.uppercase()} ${verb.uppercase()} ${natalPointLabel(culture, span.natalKey).uppercase()}"),
                style = MaterialTheme.typography.titleMedium,
                color = if (received) accent else Bone,
            )
            Text(
                text = "${monthYear(span.start)} → ${monthYear(span.end)} · " +
                    "${span.passes.size} EXACT $passWord · $remaining AHEAD",
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.padding(top = Spacing.Tight),
            )
        }
        Text(
            text = "READ →",
            style = MaterialTheme.typography.labelSmall,
            color = accent,
        )
    }
}

/**
 * sun and moon take the natal body's own deity name; the angles take a label.
 * Returned in its natural case, because a deity's name is a name: the caller
 * uppercases it where the design system sets a line in caps, and leaves it
 * alone inside a Spectral sentence, where caps read as shouting.
 */
internal fun natalPointLabel(culture: AncientCulture, key: String): String = when (key) {
    "sun" -> DeityRegistry.getDeity(culture, Planet.SUN).name
    "moon" -> DeityRegistry.getDeity(culture, Planet.MOON).name
    "asc" -> "your rising"
    "mc" -> "your midheaven"
    else -> key
}

private val MONTHS_SHORT = listOf(
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
)

internal fun monthYear(date: Date): String {
    val calendar = Calendar.getInstance()
    calendar.time = date
    val month = MONTHS_SHORT.getOrElse(calendar.get(Calendar.MONTH)) { "JAN" }
    return "$month ${calendar.get(Calendar.YEAR)}"
}
