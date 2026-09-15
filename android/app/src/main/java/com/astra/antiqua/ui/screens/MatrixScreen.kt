package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.CultureEmblem
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.accentFor

private val BODY_COLUMN = 74.dp
private val CULTURE_COLUMN = 104.dp

/**
 * The translation matrix, web's /matrix: ten bodies across five theologies,
 * the seven each culture named and the three every culture received.
 *
 * Each column head carries its culture's emblem in its culture's accent, and
 * the gold rule runs above the received three, the same shape the web table
 * has. A phone is narrower than ten columns of names, so the grid scrolls
 * sideways inside its own container rather than squeezing the type.
 */
@Composable
fun MatrixScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
) {
    val scroll = rememberScrollState()
    val classical = ClassicalPlanet.entries.filterNot { it.isReceived }
    val received = ClassicalPlanet.entries.filter { it.isReceived }

    NaveShell(
        context = "The translation matrix",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.MATRIX,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(
                    kicker = "One sky · ten bodies · five theologies",
                    headline = "The matrix",
                )
            }
            item {
                Column(modifier = Modifier.horizontalScroll(scroll)) {
                    Row(
                        modifier = Modifier.padding(horizontal = Spacing.Gutter),
                        verticalAlignment = Alignment.Bottom,
                    ) {
                        Text(
                            text = "BODY",
                            style = MaterialTheme.typography.labelSmall,
                            color = FaintInk,
                            modifier = Modifier.width(BODY_COLUMN),
                        )
                        AncientCulture.entries.forEach { each ->
                            Row(
                                modifier = Modifier.width(CULTURE_COLUMN),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(Spacing.Tight),
                            ) {
                                CultureEmblem(
                                    culture = each,
                                    size = 14.dp,
                                    tint = accentFor(each),
                                )
                                Text(
                                    text = each.label.uppercase(),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = accentFor(each),
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                        }
                    }
                    classical.forEach { body -> MatrixRow(body) }
                    // The gold rule above the three the modern age received.
                    Box(
                        Modifier
                            .padding(horizontal = Spacing.Gutter)
                            .padding(top = Spacing.Snug)
                            .width(BODY_COLUMN + CULTURE_COLUMN * 5)
                            .height(1.dp)
                            .background(Harmony)
                    )
                    received.forEach { body -> MatrixRow(body) }
                }
            }
            item {
                Text(
                    text = "THE THREE BELOW THE RULE ARE RECEIVED: NO ANCIENT CULTURE NAMED " +
                        "THEM, AND EACH IS ADMITTED UNDER A NATIVE NAME.",
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                    modifier = Modifier.padding(Spacing.Gutter),
                )
                Column(Modifier.padding(Spacing.Chapter)) {}
            }
        }
    }
}

@Composable
private fun MatrixRow(body: ClassicalPlanet) {
    Column {
        Box(
            Modifier
                .padding(horizontal = Spacing.Gutter)
                .width(BODY_COLUMN + CULTURE_COLUMN * 5)
        ) { RowRule() }
        Row(
            modifier = Modifier.padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = body.name,
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.width(BODY_COLUMN),
            )
            AncientCulture.entries.forEach { each ->
                Text(
                    text = DeityRegistry.getDeity(each, body).name,
                    style = MaterialTheme.typography.titleMedium,
                    color = if (body.isReceived) accentFor(each) else Bone,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.width(CULTURE_COLUMN),
                )
            }
        }
    }
}
