package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.ScriptReveal
import com.astra.antiqua.ui.components.ScriptName
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.CultureEmblem
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.accentFor
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.ShellType
import com.astra.antiqua.ui.components.Wordmark
import com.astra.antiqua.ui.theme.Spacing


/**
 * The doorway is the app shell: no culture is chosen yet, so its display type
 * stays Cinzel through [ShellType] whatever culture the theme holds.
 */
@Composable
fun CultureSelectionScreen(
    onCultureSelected: (AncientCulture) -> Unit
) = ShellType {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Section),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Before a culture is chosen the app speaks in its own name, so the
        // lockup is drawn here rather than typed anywhere.
        Wordmark(capHeight = 16.dp)
        Spacer(modifier = Modifier.height(Spacing.Section))

        Text(
            text = "Choose Your Doorway",
            style = MaterialTheme.typography.displaySmall,
            color = Bone,
            textAlign = TextAlign.Center,
        )
        Spacer(modifier = Modifier.height(Spacing.Step))
        Text(
            text = "One sky is computed. Five ancient cultures read it, each in its own " +
                "theology. Choose yours: the app renders in that culture's voice until you " +
                "change it.",
            style = MaterialTheme.typography.bodyMedium,
            color = Prose,
            textAlign = TextAlign.Center,
        )
        Spacer(modifier = Modifier.height(Spacing.Chapter))

        LazyColumn(modifier = Modifier.fillMaxWidth()) {
            itemsIndexed(AncientCulture.entries, key = { _, it -> it.name }) { index, culture ->
                val institution = com.astra.antiqua.domain.generated.SharedStrings.COMMON_INSTITUTION.getValue(culture)
                // The panel and the name share one source, so focus on the panel resolves the name.
                val interactionSource = remember { MutableInteractionSource() }
                Panel(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = Spacing.Snug)
                        .clickable(
                            interactionSource = interactionSource,
                            indication = LocalIndication.current,
                        ) { onCultureSelected(culture) }
                        .semantics {
                            role = Role.Button
                        },
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // The culture's own tier-2 emblem, in its own accent.
                        // Five accents on one screen is the exception the
                        // design system allows here: no culture is active yet,
                        // and this screen exists to tell the five apart.
                        CultureEmblem(
                            culture = culture,
                            size = 28.dp,
                            tint = accentFor(culture),
                        )
                        Spacer(modifier = Modifier.width(Spacing.Step))
                        Column {
                            // The culture's own name, large, in its script first; the five
                            // resolve in turn (1.2 s, then 200 ms apart, once the phase fade has
                            // passed) and a tap or focus resolves one at once. Canaan has no
                            // attested script for its name and stays Latin.
                            ScriptName(
                                culture = culture,
                                key = ScriptNameKey.CultureName,
                                style = MaterialTheme.typography.displaySmall,
                                color = Bone,
                                intro = true,
                                introDelayMillis = ScriptReveal.pickerDelayFor(index),
                                upper = true,
                                interactionSource = interactionSource,
                            )
                            Spacer(modifier = Modifier.height(Spacing.Tight))
                            Text(
                                text = institution.lowercase(),
                                style = MaterialTheme.typography.labelMedium,
                                color = Dim,
                            )
                        }
                    }
                }
            }
        }
    }
}
