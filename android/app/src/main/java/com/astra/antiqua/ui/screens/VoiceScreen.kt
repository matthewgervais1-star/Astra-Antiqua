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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.content.CultureContentStore
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.CultureEmblem
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.AstraAntiquaTheme

/**
 * One culture's doorway, the counterpart of web's /voices/[culture]: the
 * culture's emblem over its name, then its pantheon seated, the seven it
 * named above the rule and the three it received below it.
 *
 * This page IS one culture, so the whole page becomes that culture: the
 * ground, the accent and the display face all swap for the length of it,
 * which is what VoiceScope does on the web surface. Without that the page
 * would wear two accents at once, the doorway's and the reader's, and the
 * design system allows exactly one on a screen.
 */
@Composable
fun VoiceScreen(
    voice: AncientCulture,
    onNavigate: (String) -> Unit,
    onEnterVoice: (AncientCulture) -> Unit,
) {
    AstraAntiquaTheme(selectedCulture = voice) {
        VoiceScreenContent(voice, onNavigate, onEnterVoice)
    }
}

@Composable
private fun VoiceScreenContent(
    voice: AncientCulture,
    onNavigate: (String) -> Unit,
    onEnterVoice: (AncientCulture) -> Unit,
) {
    val context = LocalContext.current
    val store = remember(context) { CultureContentStore.forContext(context) }
    val copy = remember(voice) { runCatching { store.copyFor(voice) }.getOrNull() }
    val accent = LocalAccent.current
    val classical = ClassicalPlanet.entries.filterNot { it.isReceived }
    val received = ClassicalPlanet.entries.filter { it.isReceived }

    NaveShell(
        context = "The ${voice.label} doorway",
        culture = voice,
        onNavigate = onNavigate,
        section = Section.VOICES,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            item {
                NaveHead(
                    kicker = copy?.tagline ?: "The ${voice.label} doorway",
                    headline = voice.label,
                    emblem = { CultureEmblem(culture = voice, size = 64.dp, tint = accent) },
                    sub = copy?.subtitle,
                )
            }
            item {
                SectionDivider(
                    label = "The pantheon seated",
                    modifier = Modifier.padding(horizontal = Spacing.Gutter),
                )
            }
            items(classical, key = { it.name }) { body ->
                DeityRow(body = body, voice = voice, accent = accent)
            }
            item {
                // The rule the three received bodies sit below, in the signal
                // that marks a boundary rather than in the culture accent.
                Box(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter)
                        .padding(top = Spacing.Step)
                        .height(1.dp)
                        .background(Harmony)
                )
                Text(
                    text = "BELOW THE RULE: THE THREE RECEIVED",
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Snug),
                )
            }
            items(received, key = { it.name }) { body ->
                DeityRow(body = body, voice = voice, accent = accent)
            }
            item {
                Panel(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter)
                        .padding(top = Spacing.Section),
                ) {
                    Text(
                        text = "THE OUTER PLANETS ARE AN EXTENSION MADE IN THE ANCIENT WAY. " +
                            "THE METHOD PAGE STATES IT PLAINLY.",
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                    )
                }
            }
            item {
                Box(
                    Modifier
                        .fillMaxWidth()
                        .padding(Spacing.Gutter)
                ) {
                    ActionButton(
                        label = "Enter · read today in the ${voice.label} voice",
                        weight = ActionWeight.VOTIVE,
                        onClick = { onEnterVoice(voice) },
                    )
                }
                Column(Modifier.padding(Spacing.Chapter)) {}
            }
        }
    }
}

/** One seat in the pantheon: the body, the name this culture gives it, the epithet. */
@Composable
private fun DeityRow(
    body: ClassicalPlanet,
    voice: AncientCulture,
    accent: androidx.compose.ui.graphics.Color,
) {
    val deity = DeityRegistry.getDeity(voice, body)
    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
    ) {
        DeityGlyph(
            body = body,
            culture = voice,
            size = 18.dp,
            tint = if (body.isReceived) accent else Bone,
        )
        Text(
            text = body.name,
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.width(62.dp),
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = deity.name,
                style = MaterialTheme.typography.titleMedium,
                color = if (body.isReceived) accent else Bone,
            )
            Text(
                text = deity.epithet,
                style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                color = Prose,
            )
        }
    }
}
