package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.HouseMeanings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.components.Votive
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DashboardViewModel

/**
 * One standing placement read in full, web's /charts/[id]/[body]: what the
 * body is in its sign, where the house puts it, and the one instruction the
 * culture's institution gives about it.
 *
 * The prose is the universal planet-in-sign paragraph from
 * `shared/content/planet-in-sign.json` with the culture's mask composed over
 * it, the same arrangement the decree cards use. Nothing is authored per
 * culture per body per sign, so there is no corpus here to fall out of step
 * with web's.
 */
@Composable
fun PlacementScreen(
    body: Planet,
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenPlacement: (Planet) -> Unit,
) {
    val viewModel: DashboardViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.chartState.collectAsState()
    val accent = LocalAccent.current
    val lexicon = LocalLexicon.current

    LaunchedEffect(Unit) { viewModel.calculateChart() }

    val bodies = Planet.entries
    val index = bodies.indexOf(body)
    val previous = bodies[(index - 1 + bodies.size) % bodies.size]
    val next = bodies[(index + 1) % bodies.size]
    val deity = DeityRegistry.getDeity(culture, body)

    NaveShell(
        context = "Your chart · ${deity.name}",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.CHART,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when (val current = state) {
                is ChartState.Loading -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) { CircularProgressIndicator(color = accent) }
                }

                is ChartState.Error -> item {
                    Text(
                        text = current.message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Conflict,
                        modifier = Modifier.padding(Spacing.Gutter),
                    )
                }

                is ChartState.Success -> {
                    val position = current.chartData.planets[body]
                    if (position == null) {
                        item {
                            Text(
                                text = "This body is not in the chart.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Dim,
                                modifier = Modifier.padding(Spacing.Gutter),
                            )
                        }
                    } else {
                        val house = HouseMeanings.get(position.house)
                        item {
                            NaveHead(
                                kicker = "${lexicon.dashboardTitle} · your standing placement",
                                headline = "Your ${deity.name} in ${position.zodiacSign.signName}",
                                emblem = {
                                    DeityGlyph(
                                        body = body,
                                        culture = culture,
                                        size = 34.dp,
                                        tint = accent,
                                    )
                                },
                                sub = "%s %s · the %s house · fixed at your birth".format(
                                    position.degMin,
                                    position.zodiacSign.signName,
                                    house.ordinal,
                                ),
                            )
                            if (body.isReceived) {
                                Box(
                                    modifier = Modifier.fillMaxWidth(),
                                    contentAlignment = Alignment.Center,
                                ) { Badge(text = "Received", tone = BadgeTone.ACCENT) }
                            }
                        }
                        item {
                            SectionDivider(
                                label = "What it is",
                                modifier = Modifier.padding(horizontal = Spacing.Gutter),
                            )
                            Text(
                                text = "${deity.name}, ${deity.epithet.lowercase()}. " +
                                    placementTextFor(current, body),
                                style = MaterialTheme.typography.bodyMedium,
                                color = Prose,
                                modifier = Modifier.padding(horizontal = Spacing.Gutter),
                            )
                        }
                        item {
                            SectionDivider(
                                label = "How it shows",
                                modifier = Modifier.padding(horizontal = Spacing.Gutter),
                            )
                            Text(
                                text = "${house.title}. ${house.domain}",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Prose,
                                modifier = Modifier.padding(horizontal = Spacing.Gutter),
                            )
                        }
                        item {
                            Box(modifier = Modifier.padding(Spacing.Gutter)) {
                                Votive(text = votiveFor(culture, deity.name))
                            }
                        }
                        if (body.isReceived) {
                            item {
                                Panel(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = Spacing.Gutter),
                                ) {
                                    Text(
                                        text = "THIS IS A MODERN BODY, RECEIVED INTO THE " +
                                            "ANCIENT MANNER. THE METHOD PAGE STATES IT PLAINLY.",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = Dim,
                                    )
                                }
                            }
                        }
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(Spacing.Gutter),
                                horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
                            ) {
                                Box(modifier = Modifier.weight(1f)) {
                                    ActionButton(
                                        label = "← ${DeityRegistry.getDeity(culture, previous).name}",
                                        weight = ActionWeight.PRIMARY,
                                        onClick = { onOpenPlacement(previous) },
                                    )
                                }
                                Box(modifier = Modifier.weight(1f)) {
                                    ActionButton(
                                        label = "${DeityRegistry.getDeity(culture, next).name} →",
                                        weight = ActionWeight.PRIMARY,
                                        onClick = { onOpenPlacement(next) },
                                    )
                                }
                            }
                            Column(Modifier.padding(Spacing.Chapter)) {}
                        }
                    }
                }
            }
        }
    }
}

/**
 * The composed reading for this body. Every one of the ten resolves, because
 * the shared corpus covers all of them; the fallback exists so a hole in the
 * corpus drops one paragraph rather than the screen.
 */
private fun placementTextFor(state: ChartState.Success, body: Planet): String =
    state.placements[body]?.placementText
        ?: "The position is computed and stated above. Its paragraph could not be read."

/**
 * One two-line imperative per culture, taking only the deity's name, from
 * web/src/components/charts/placementVotives.ts. Five templates cover every
 * placement on every chart, so the votive stays register-true without being
 * authored per body or per sign.
 */
private fun votiveFor(culture: AncientCulture, deity: String): String {
    val name = deity.uppercase()
    return when (culture) {
        AncientCulture.EGYPT -> "WEIGH WHAT $name SHOWS YOU,\nBEFORE THE SCALE CLOSES"
        AncientCulture.GREECE -> "ASK $name THE PLAIN QUESTION,\nAND PAY WHAT THE ANSWER COSTS"
        AncientCulture.CANAAN -> "BRING $name BEFORE THE COUNCIL,\nAND LET THE WORD STAND AS VOW"
        AncientCulture.CARTHAGE ->
            "ENTER WHAT $name SHOWS IN THE LEDGER,\nAND CLOSE THE ACCOUNT HONEST"
        AncientCulture.ROME -> "TAKE THE AUSPICE OF $name,\nAND RULE YOURSELF BY IT"
    }
}
