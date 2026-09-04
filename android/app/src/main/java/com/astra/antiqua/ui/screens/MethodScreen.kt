package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.astra.antiqua.domain.AspectType
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.AccentRule
import com.astra.antiqua.ui.components.Kicker
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.PrimaryAction
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing

/**
 * How the sky is computed, said plainly.
 *
 * This screen exists because the app makes two claims it has to be able to
 * back: that nothing is estimated, and that the three outer bodies are a
 * modern reception rather than something the ancients watched. The dashboard
 * carries the second as one mono line; this is where that line leads.
 *
 * The prose is the web /method page's, kept word for word so the two surfaces
 * cannot end up promising different things.
 */
@Composable
fun MethodScreen(onBack: () -> Unit) {
    val accent = LocalAccent.current

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Section),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Kicker("How the sky is computed")
        Text(
            text = "The Method",
            style = MaterialTheme.typography.displayMedium,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = Spacing.Snug),
        )
        AccentRule(Modifier.padding(top = Spacing.Step))

        Section(
            "The ephemeris",
            "Positions come from the astronomy-engine ephemeris, the cosinekitty/astronomy " +
                "library. They are geocentric ecliptic longitudes, computed for your place and " +
                "hour. Nothing is estimated. Nothing is randomized.",
        )

        Section(
            "Houses",
            "Whole-sign houses, the oldest system on record. Your rising sign is your first " +
                "house. Every house is exactly one sign.",
        )

        Section(
            "Orbs",
            "An aspect counts only inside these distances. When nothing is in orb, we say the " +
                "day is quiet. We do not invent weather.",
        )
        // Rendered from the enum the detector actually runs on, so this table
        // cannot drift away from the numbers in use.
        Panel(modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug)) {
            Column {
                for (type in AspectType.values()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Tight),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            text = type.name.lowercase().replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                        Text(
                            text = "${type.degree.toInt()}\u00B0 within ${type.orb.toInt()}\u00B0",
                            style = MaterialTheme.typography.labelMedium,
                            color = Dim,
                        )
                    }
                }
            }
        }
        Text(
            text = "TIGHTER = LOUDER",
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier.padding(top = Spacing.Snug),
        )

        Section(
            "The five cultures",
            "Every culture reads the same computed sky. A placement keeps its core meaning " +
                "everywhere. What changes is the theology it must pass through, and that change " +
                "is real: Egypt weighs, Greece questions, Canaan convenes, Carthage audits, " +
                "Rome rules.",
        )

        Section(
            "The three received bodies",
            "No ancient culture knew Uranus, Neptune, or Pluto. We admit them the way Rome " +
                "admitted foreign gods: formally, and under native names. The receptions are " +
                "modern work, made in the ancient manner. This page will always say so.",
        )
        Panel(modifier = Modifier.fillMaxWidth().padding(top = Spacing.Snug)) {
            Column {
                for (planet in ClassicalPlanet.values().filter { it.isReceived }) {
                    Text(
                        text = planet.name.lowercase().replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.labelMedium,
                        color = accent,
                        modifier = Modifier.padding(top = Spacing.Snug),
                    )
                    Text(
                        text = AncientCulture.values().joinToString(" · ") {
                            DeityRegistry.getDeity(it, planet).name
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Prose,
                    )
                }
            }
        }

        Section(
            "Your data",
            "Everything works without an account. Your culture, chart, and readings live on " +
                "this device.",
        )

        PrimaryAction(
            label = "Back to the reading",
            onClick = onBack,
            modifier = Modifier.padding(top = Spacing.Chapter),
        )
    }
}

@Composable
private fun Section(title: String, body: String) {
    SectionDivider(title)
    Text(
        text = body,
        style = MaterialTheme.typography.bodyMedium,
        color = Prose,
        modifier = Modifier.fillMaxWidth(),
    )
}
