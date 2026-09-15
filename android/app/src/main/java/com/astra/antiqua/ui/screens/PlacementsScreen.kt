package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.DataRow
import com.astra.antiqua.ui.components.DataRowHead
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DashboardViewModel

/**
 * The saved chart as a table, web's /charts placements panel: every body with
 * its longitude, sign, whole-sign house and motion, the received three in the
 * culture accent.
 *
 * This is the screen the DataRow spec was written for. Everything on it comes
 * from the chart the dashboard already computes, so it costs one more reading
 * of the same state rather than a second pass over the ephemeris.
 */
@Composable
fun PlacementsScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenPlacement: (ClassicalPlanet) -> Unit = {},
    onOpenForecast: () -> Unit = {},
    onRecast: () -> Unit = {},
    onOpenSynastry: () -> Unit = {},
) {
    val viewModel: DashboardViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.chartState.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { viewModel.calculateChart() }

    NaveShell(
        context = "Your chart · the placements",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.CHART,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(
                    kicker = "Fixed at the hour of your birth",
                    headline = "The placements",
                )
            }
            when (val current = state) {
                is ChartState.Loading -> item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        contentAlignment = Alignment.Center,
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
                    item {
                        Box(Modifier.padding(horizontal = Spacing.Gutter)) { DataRowHead() }
                    }
                    items(ClassicalPlanet.entries.size) { index ->
                        val body = ClassicalPlanet.entries[index]
                        val position = current.chartData.planets[body]
                        if (position != null) {
                            Column(Modifier.padding(horizontal = Spacing.Gutter)) {
                                RowRule()
                                DataRow(
                                    name = DeityRegistry.getDeity(culture, body).name,
                                    position = "%02d°%02d′".format(
                                        position.degreeInSign,
                                        position.minuteInSign,
                                    ),
                                    sign = position.zodiacSign.signName.take(3),
                                    house = position.house,
                                    retrograde = position.isRetrograde,
                                    received = body.isReceived,
                                    leading = {
                                        DeityGlyph(body = body, culture = culture, size = 14.dp)
                                    },
                                    onClick = { onOpenPlacement(body) },
                                )
                            }
                        }
                    }
                    item {
                        Text(
                            text = "WHOLE-SIGN HOUSES · R IS RETROGRADE, READ FROM THE BODY'S " +
                                "OWN VELOCITY · NOTHING HERE IS ESTIMATED",
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                            modifier = Modifier.padding(Spacing.Gutter),
                        )
                        Box(modifier = Modifier.padding(horizontal = Spacing.Gutter)) {
                            ActionButton(
                                label = "Read the year ahead",
                                weight = ActionWeight.VOTIVE,
                                onClick = onOpenForecast,
                            )
                        }
                        Box(
                            modifier = Modifier
                                .padding(horizontal = Spacing.Gutter)
                                .padding(top = Spacing.Snug),
                        ) {
                            ActionButton(
                                label = "Read against another chart",
                                weight = ActionWeight.PRIMARY,
                                onClick = onOpenSynastry,
                            )
                        }
                        Box(
                            modifier = Modifier
                                .padding(horizontal = Spacing.Gutter)
                                .padding(top = Spacing.Snug),
                        ) {
                            ActionButton(
                                label = "Cast this chart again",
                                weight = ActionWeight.GHOST,
                                onClick = onRecast,
                            )
                        }
                    }
                }
            }
            item { Column(Modifier.padding(Spacing.Chapter)) {} }
        }
    }
}
