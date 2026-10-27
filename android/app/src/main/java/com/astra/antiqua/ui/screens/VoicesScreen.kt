package com.astra.antiqua.ui.screens

import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.ui.components.ScriptName
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.content.CultureContentStore
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.CultureEmblem
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.accentFor
import com.astra.antiqua.ui.theme.displayCase

/**
 * The five doorways, the counterpart of web's /voices.
 *
 * Each row is the culture's tier-2 emblem in its own accent beside its name
 * and the institution it speaks from. Five accents on one screen is the same
 * exception the culture picker takes: no one culture is being marked as
 * active here, the screen exists to tell the five apart, and the marks differ
 * by form first so the hue only confirms.
 */
@Composable
fun VoicesScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenVoice: (AncientCulture) -> Unit,
) {
    val context = LocalContext.current
    val store = remember(context) { CultureContentStore.forContext(context) }

    NaveShell(
        context = "The five voices",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.VOICES,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(kicker = "One sky · five theologies", headline = "The five voices")
                Text(
                    text = "Every culture reads the same computed sky. What changes is the " +
                        "theology it must pass through.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Prose,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter)
                        .padding(bottom = Spacing.Section),
                )
            }
            items(AncientCulture.entries.toTypedArray(), key = { it.name }) { each ->
                val copy = runCatching { store.copyFor(each) }.getOrNull()
                // The row and the name share one source, so focus on the row resolves the name.
                val interactionSource = remember { MutableInteractionSource() }
                RowRule()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(
                            interactionSource = interactionSource,
                            indication = LocalIndication.current,
                            onClickLabel = each.label,
                            role = Role.Button,
                            onClick = { onOpenVoice(each) },
                        )
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
                ) {
                    CultureEmblem(culture = each, size = 22.dp, tint = accentFor(each))
                    Column(modifier = Modifier.weight(1f)) {
                        ScriptName(
                            culture = each,
                            key = ScriptNameKey.CultureName,
                            style = MaterialTheme.typography.titleLarge,
                            color = Bone,
                            upper = true,
                            displayFace = true,
                            interactionSource = interactionSource,
                        )
                        if (copy != null) {
                            Text(
                                text = copy.tagline.lowercase(),
                                style = MaterialTheme.typography.labelSmall,
                                color = Dim,
                            )
                        }
                    }
                }
            }
            item {
                RowRule()
                Column(Modifier.padding(Spacing.Chapter)) {}
            }
        }
    }
}
