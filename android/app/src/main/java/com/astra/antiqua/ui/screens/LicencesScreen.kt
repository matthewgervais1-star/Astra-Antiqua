package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.astra.antiqua.R
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.AccentRule
import com.astra.antiqua.ui.components.Kicker
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase

/**
 * Open-source licences: the fonts with their copyright lines, the SIL OFL 1.1
 * text once, then the other material the app carries. The licence texts live
 * in res/raw so they are not written into Kotlin.
 */
@Composable
fun LicencesScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
) {
    val oflText = rawText(R.raw.ofl_1_1)
    val mitText = rawText(R.raw.mit_astronomy_engine)

    NaveShell(
        context = stringResource(R.string.licences_context),
        culture = culture,
        onNavigate = onNavigate,
        section = Section.ACCOUNT,
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = Spacing.Gutter, vertical = Spacing.Section),
        ) {
            Kicker(stringResource(R.string.licences_kicker))
            Text(
                text = displayCase(stringResource(R.string.licences_headline)),
                style = MaterialTheme.typography.displayMedium,
                color = MaterialTheme.colorScheme.onBackground,
                modifier = Modifier.padding(top = Spacing.Snug),
            )
            AccentRule(Modifier.padding(top = Spacing.Step))

            SectionDivider(stringResource(R.string.licences_fonts))
            Column(verticalArrangement = Arrangement.spacedBy(Spacing.Step)) {
                for (font in FontLicences) {
                    Column(Modifier.fillMaxWidth()) {
                        Text(
                            text = font.family,
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                        Text(
                            text = stringResource(font.copyright),
                            style = MaterialTheme.typography.bodySmall,
                            color = Prose,
                        )
                        Text(
                            text = stringResource(R.string.licences_ofl_name),
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                        )
                    }
                }
            }

            SectionDivider(stringResource(R.string.licences_ofl_heading))
            LicenceText(oflText)

            SectionDivider(stringResource(R.string.licences_data))
            ProseNote(stringResource(R.string.licences_tz_lookup))

            SectionDivider(stringResource(R.string.licences_libraries))
            ProseNote(stringResource(R.string.licences_astronomy))
            LicenceText(mitText, Modifier.padding(top = Spacing.Snug))
            ProseNote(stringResource(R.string.licences_apache), Modifier.padding(top = Spacing.Step))
        }
    }
}

@Composable
private fun rawText(id: Int): String {
    val context = LocalContext.current
    return remember(id) {
        context.resources.openRawResource(id).bufferedReader().use { it.readText() }
    }
}

@Composable
private fun ProseNote(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodySmall,
        color = Prose,
        modifier = modifier.fillMaxWidth(),
    )
}

@Composable
private fun LicenceText(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text,
        style = MaterialTheme.typography.labelSmall,
        color = Dim,
        modifier = modifier.fillMaxWidth(),
    )
}
