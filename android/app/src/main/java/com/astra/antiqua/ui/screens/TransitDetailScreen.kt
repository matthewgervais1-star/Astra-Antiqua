package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.AspectVerbs
import com.astra.antiqua.domain.SpanTone
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.domain.TransitSpans
import com.astra.antiqua.domain.spanTone
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
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SpansState
import com.astra.antiqua.viewmodel.TransitsViewModel
import java.util.Calendar
import java.util.Date

/**
 * One long transit read in full, web's /transits/[id]: who is meeting what,
 * how far through the stretch today sits, and when each exact pass falls.
 *
 * The progress bar is the honest part. A transit is a window, and a reader
 * who is told only "Saturn squares your Sun" cannot tell whether that began
 * last spring or begins next year. The marker says where today is.
 */
@Composable
fun TransitDetailScreen(
    spanId: String,
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit,
) {
    val viewModel: TransitsViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.state.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { viewModel.load() }

    val current = state
    val span = (current as? SpansState.Ready)?.spans?.firstOrNull { it.id == spanId }
    val now = (current as? SpansState.Ready)?.now ?: Date()

    NaveShell(
        context = "The long transits",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.TRANSITS,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when {
                current is SpansState.Loading -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) { CircularProgressIndicator(color = accent) }
                }

                span == null -> item {
                    NaveHead(
                        kicker = "The long transits",
                        headline = "This transit is not in the window",
                    )
                    Text(
                        text = "The window runs from a year back to roughly two years ahead. " +
                            "A transit outside it is real but not yet readable here.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Prose,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
                    )
                }

                else -> {
                    val deity = DeityRegistry.getDeity(culture, span.transitPlanet)
                    val verb = AspectVerbs.of(culture, span.aspect)
                    val natal = natalPointLabel(culture, span.natalKey)
                    item {
                        NaveHead(
                            kicker = "${LocalLexicon.current.dashboardTitle} · A LONG TRANSIT",
                            headline = "${deity.name} $verb $natal",
                            emblem = {
                                DeityGlyph(
                                    body = span.transitPlanet,
                                    culture = culture,
                                    size = 34.dp,
                                    tint = accent,
                                )
                            },
                        )
                    }
                    item { SpanProgress(span, now) }
                    item {
                        SectionDivider(
                            label = "What is meeting what",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                        Text(
                            text = "${deity.name}, ${deity.epithet.lowercase()}, holds within " +
                                "${TransitSpans.SPAN_ORB.toInt()} degrees of exact against " +
                                "$natal from ${monthYear(span.start)} to " +
                                "${monthYear(span.end)}. Nothing here is forecast: the dates " +
                                "are the ephemeris read forward.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Prose,
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    item {
                        SectionDivider(
                            label = "The exact passes",
                            modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        )
                    }
                    items(span.passes, key = { it.time }) { pass ->
                        PassRow(pass = pass, now = now)
                    }
                    item {
                        Panel(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(Spacing.Gutter),
                        ) {
                            Text(
                                text = "A SLOW BODY CROSSES A DEGREE THREE TIMES WHERE IT " +
                                    "RETROGRADES. THOSE PASSES BELONG TO ONE TRANSIT, WHICH IS " +
                                    "WHY THIS IS READ AS A STRETCH AND NOT A DATE.",
                                style = MaterialTheme.typography.labelSmall,
                                color = Dim,
                            )
                        }
                        Column(Modifier.padding(Spacing.Chapter)) {}
                    }
                }
            }
        }
    }
}

/** Where today sits inside the stretch, as a bar with a square marker. */
@Composable
private fun SpanProgress(span: TransitSpan, now: Date) {
    val accent = LocalAccent.current
    val total = (span.end.time - span.start.time).coerceAtLeast(1L)
    val elapsed = (now.time - span.start.time).coerceIn(0L, total)
    val fraction = elapsed.toFloat() / total.toFloat()
    val tone = spanTone(span)

    Column(modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.Gutter)) {
        Box(modifier = Modifier.fillMaxWidth().height(3.dp).background(RuleRow)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(fraction)
                    .height(3.dp)
                    .background(accent)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug),
            horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "${monthYear(span.start)} → ${monthYear(span.end)}",
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.weight(1f),
            )
            Badge(
                text = if (tone == SpanTone.EASE) "Ease" else "Tension",
                tone = if (tone == SpanTone.EASE) BadgeTone.OUTLINE else BadgeTone.CONFLICT,
            )
            if (span.transitPlanet.isReceived) {
                Badge(text = "Received", tone = BadgeTone.ACCENT)
            }
        }
    }
}

/** One exact pass, and whether it is behind the reader or ahead. */
@Composable
private fun PassRow(pass: Date, now: Date) {
    val done = pass.time <= now.time
    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = fullDate(pass),
            style = MaterialTheme.typography.labelMedium,
            color = if (done) Dim else Bone,
            modifier = Modifier.weight(1f),
        )
        Text(
            text = if (done) "PASSED" else "AHEAD",
            style = MaterialTheme.typography.labelSmall,
            color = if (done) Dim else Harmony,
        )
    }
}

private val MONTHS_FULL = listOf(
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
)

private fun fullDate(date: Date): String {
    val calendar = Calendar.getInstance()
    calendar.time = date
    val month = MONTHS_FULL.getOrElse(calendar.get(Calendar.MONTH)) { "JANUARY" }
    return "${calendar.get(Calendar.DAY_OF_MONTH)} $month ${calendar.get(Calendar.YEAR)}"
}
