package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.domain.LexiconDictionary
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.CultureEmblem
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.accentFor
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.components.Wordmark
import com.astra.antiqua.ui.theme.Spacing


@Composable
fun CultureSelectionScreen(
    onCultureSelected: (AncientCulture) -> Unit
) {
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
            items(AncientCulture.values(), key = { it.name }) { culture ->
                val institution = LexiconDictionary.forCulture(culture).dashboardTitle
                Panel(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = Spacing.Snug)
                        .clickable { onCultureSelected(culture) }
                        .semantics {
                            role = Role.Button
                            contentDescription = "${culture.label}, $institution"
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
                            Text(
                                text = culture.label.uppercase(),
                                style = MaterialTheme.typography.titleLarge,
                                color = Bone,
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
