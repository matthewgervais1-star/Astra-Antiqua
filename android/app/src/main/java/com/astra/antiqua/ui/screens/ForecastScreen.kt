package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.AspectVerbs
import com.astra.antiqua.domain.SkyEvent
import com.astra.antiqua.domain.SkyEventKind
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
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
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.ForecastState
import com.astra.antiqua.viewmodel.ForecastViewModel
import java.util.Calendar
import java.util.Date

/**
 * The year ahead against the reader's own chart, web's /forecast.
 *
 * Where the year horizon reports what the sky does, this reports what it does
 * to one chart: the long transits open in the coming twelve months, each with
 * where today sits inside it, the stations that fall in the same window, and
 * the solar return that opens the personal year.
 *
 * Nothing is predicted. Every date here is the ephemeris read forward, which
 * is the promise the method page makes and the reason this screen prints
 * windows rather than verdicts.
 */
@Composable
fun ForecastScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenSpan: (String) -> Unit,
) {
    val viewModel: ForecastViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.state.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { viewModel.load() }

    NaveShell(
        context = "Your year ahead",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.CHART,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(kicker = "Read against your own sky", headline = "The year ahead")
            }
            when (val current = state) {
                is ForecastState.Loading -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        CircularProgressIndicator(color = accent)
                        Text(
                            text = "READING THE YEAR…",
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                            modifier = Modifier.padding(top = Spacing.Step),
                        )
                    }
                }

                is ForecastState.NoChart -> item {
                    Text(
                        text = "A forecast is scored against your own sky, the chart cast once " +
                            "at the hour of your birth and kept. There is no chart on this device.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Prose,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
                    )
                }

                is ForecastState.Error -> item {
                    Text(
                        text = current.message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Conflict,
                        modifier = Modifier.padding(Spacing.Gutter),
                    )
                }

                is ForecastState.Ready -> {
                    current.solarReturn?.let { solarReturn ->
                        item {
                            Panel(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = Spacing.Gutter),
                                accented = true,
                            ) {
                                Column {
                                    Text(
                                        text = "THE SOLAR RETURN",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = accent,
                                    )
                                    Text(
                                        text = fullDateOf(solarReturn.date),
                                        style = MaterialTheme.typography.headlineSmall,
                                        color = Bone,
                                        modifier = Modifier.padding(top = Spacing.Tight),
                                    )
                                    Text(
                                        text = "The Sun stands again at %02d°%02d′ %s, the degree it held at your birth. Computed, not counted from the calendar: the return drifts against the date."
                                            .format(
                                                solarReturn.degree.toInt(),
                                                ((solarReturn.degree % 1.0) * 60).toInt(),
                                                solarReturn.sign.signName,
                                            ),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Prose,
                                        modifier = Modifier.padding(top = Spacing.Snug),
                                    )
                                }
                            }
                        }
                    }

                    item {
                        SectionDivider(
                            label = "The long transits of this year",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (current.spans.isEmpty()) {
                        item { ForecastNote("NO SLOW BODY REACHES YOUR CHART INSIDE THE YEAR") }
                    } else {
                        items(current.spans, key = { it.id }) { span ->
                            ForecastSpanRow(span, current.culture, current.now, onOpenSpan)
                        }
                    }

                    item {
                        SectionDivider(
                            label = "Stations inside the year",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    if (current.stations.isEmpty()) {
                        item { ForecastNote("NOTHING TURNS INSIDE THE YEAR") }
                    } else {
                        items(
                            current.stations,
                            key = { "${it.kind}-${it.body}-${it.date.time}" },
                        ) { station -> StationRow(station, current.culture) }
                    }

                    item {
                        ForecastNote(
                            "EVERY DATE HERE IS THE EPHEMERIS READ FORWARD · NOTHING IS PREDICTED"
                        )
                        Column(Modifier.padding(Spacing.Chapter)) {}
                    }
                }
            }
        }
    }
}

/** One span, with where today sits inside it. */
@Composable
private fun ForecastSpanRow(
    span: TransitSpan,
    culture: AncientCulture,
    now: Date,
    onOpenSpan: (String) -> Unit,
) {
    val accent = LocalAccent.current
    val deity = DeityRegistry.getDeity(culture, span.transitPlanet).name
    val verb = AspectVerbs.of(culture, span.aspect)
    val natal = natalPointLabel(culture, span.natalKey)
    val received = span.transitPlanet.isReceived
    val total = (span.end.time - span.start.time).coerceAtLeast(1L)
    val elapsed = (now.time - span.start.time).coerceIn(0L, total)
    val running = span.start.time <= now.time

    RowRule()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                onClickLabel = deity,
                role = Role.Button,
                onClick = { onOpenSpan(span.id) },
            )
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
        ) {
            DeityGlyph(
                body = span.transitPlanet,
                culture = culture,
                size = 18.dp,
                tint = if (received) accent else Bone,
            )
            Text(
                text = "${deity.uppercase()} ${verb.uppercase()} ${natal.uppercase()}",
                style = MaterialTheme.typography.titleMedium,
                color = if (received) accent else Bone,
                modifier = Modifier.weight(1f),
            )
            Badge(
                text = if (running) "Running" else "Ahead",
                tone = if (running) BadgeTone.ACCENT else BadgeTone.OUTLINE,
            )
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = Spacing.Snug)
                .height(3.dp)
                .background(RuleRow),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(elapsed.toFloat() / total.toFloat())
                    .height(3.dp)
                    .background(accent)
            )
        }
        Text(
            text = "${monthYear(span.start)} → ${monthYear(span.end)} · " +
                "${span.passes.size} EXACT · ${span.passes.count { it.time > now.time }} AHEAD",
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.padding(top = Spacing.Snug),
        )
    }
}

/** One turning, in the plain statement an ingress or a station gets. */
@Composable
private fun StationRow(station: SkyEvent, culture: AncientCulture) {
    val deity = DeityRegistry.getDeity(culture, station.body).name
    val retrograde = station.kind == SkyEventKind.RETROGRADE
    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
    ) {
        Text(
            text = dayMonthOf(station.date),
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.width(62.dp),
        )
        Text(
            text = if (retrograde) {
                "$deity turns retrograde in ${station.sign.signName}."
            } else {
                "$deity turns direct again in ${station.sign.signName}."
            },
            style = MaterialTheme.typography.bodySmall,
            color = if (retrograde) Bone else Prose,
            modifier = Modifier.weight(1f),
        )
    }
}

@Composable
private fun ForecastNote(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = Dim,
        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
    )
}

private val MONTHS_SHORT = listOf(
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
)

private val MONTHS_FULL = listOf(
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)

private fun dayMonthOf(date: Date): String {
    val calendar = Calendar.getInstance().apply { time = date }
    return "${calendar.get(Calendar.DAY_OF_MONTH)} ${MONTHS_SHORT[calendar.get(Calendar.MONTH)]}"
}

private fun fullDateOf(date: Date): String {
    val calendar = Calendar.getInstance().apply { time = date }
    return "${calendar.get(Calendar.DAY_OF_MONTH)} " +
        "${MONTHS_FULL[calendar.get(Calendar.MONTH)]} ${calendar.get(Calendar.YEAR)}"
}
