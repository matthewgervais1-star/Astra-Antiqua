package com.astra.antiqua.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.EmojiSupportMatch
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.domain.AspectType
import com.astra.antiqua.domain.HouseMeanings
import com.astra.antiqua.domain.Learn
import com.astra.antiqua.domain.LearnBlock
import com.astra.antiqua.domain.LearnSection
import com.astra.antiqua.domain.LearnTable
import com.astra.antiqua.domain.aspectGeometry
import com.astra.antiqua.domain.aspectRuling
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.components.AccentRule
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.NotoSymbols
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.TypeScale
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase

/**
 * One Learn section, web's /learn and its six siblings.
 *
 * The prose is not authored here. web/scripts/gen-android-learn.mjs reads it
 * out of the pages themselves, so an explainer edited once is edited for both
 * surfaces and neither can drift from the other by a sentence. Where a page's
 * body is a reference table, the table travels as data and is drawn after the
 * prose.
 */
@Composable
fun LearnScreen(
    href: String,
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenSection: (String) -> Unit,
) {
    val section = Learn.byHref(href) ?: Learn.SECTIONS.first()

    NaveShell(
        context = "Learn · ${section.title}",
        culture = culture,
        onNavigate = onNavigate,
        section = Section.LEARN,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            items(section.blocks.size) { index ->
                BlockView(section.blocks[index], culture)
            }
            if (section.table != null) {
                item { TableView(section.table, culture) }
            }
            item {
                SectionDivider(
                    label = "All sections",
                    modifier = Modifier.padding(horizontal = Spacing.Gutter),
                )
            }
            items(Learn.SECTIONS) { each -> TocRow(each, current = section.href, onOpenSection) }
            item { Column(Modifier.padding(Spacing.Chapter)) {} }
        }
    }
}

@Composable
private fun BlockView(block: LearnBlock, culture: AncientCulture) {
    when (block) {
        is LearnBlock.Head -> Column(
            modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Step),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                // The aspects glossary names the culture in force in its
                // kicker; every other head carries no substitution at all.
                text = block.kicker.replace("%s", culture.label.uppercase()).uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = Spacing.Gutter),
            )
            Box(Modifier.padding(vertical = Spacing.Step)) { AccentRule() }
            Text(
                text = displayCase(block.headline.uppercase()),
                style = MaterialTheme.typography.displaySmall,
                color = Bone,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = Spacing.Gutter),
            )
            Box(Modifier.padding(top = Spacing.Step)) { AccentRule() }
        }

        is LearnBlock.Divider -> SectionDivider(
            label = block.label,
            modifier = Modifier.padding(horizontal = Spacing.Gutter),
        )

        is LearnBlock.Heading -> Text(
            text = displayCase(block.text),
            style = MaterialTheme.typography.headlineSmall,
            color = Bone,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.Gutter)
                .padding(top = Spacing.Step, bottom = Spacing.Snug),
        )

        is LearnBlock.Para -> Text(
            text = block.text,
            style = MaterialTheme.typography.bodyMedium,
            color = Prose,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.Gutter)
                .padding(bottom = Spacing.Step),
        )
    }
}

/** The reference table a section closes on, where it has one. */
@Composable
private fun TableView(table: LearnTable, culture: AncientCulture) {
    Column(modifier = Modifier.fillMaxWidth().padding(top = Spacing.Step)) {
        when (table) {
            LearnTable.PLANET_VERBS -> Learn.PLANET_VERBS.forEach { verb ->
                RowRule()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
                    horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
                ) {
                    Text(
                        text = verb.symbol,
                        style = SIGN_SYMBOL,
                        color = Dim,
                        modifier = Modifier.padding(end = Spacing.Snug),
                    )
                    Text(
                        text = displayCase(verb.name),
                        style = MaterialTheme.typography.titleMedium,
                        color = Bone,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        text = verb.verb,
                        style = MaterialTheme.typography.bodySmall,
                        color = Dim,
                    )
                }
            }

            LearnTable.ZODIAC_SIGNS -> Learn.SIGNS.forEach { sign ->
                RowRule()
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = sign.symbol,
                            style = SIGN_SYMBOL,
                            color = Bone,
                            modifier = Modifier.padding(end = Spacing.Snug),
                        )
                        Text(
                            text = displayCase(sign.sign.uppercase()),
                            style = MaterialTheme.typography.headlineSmall,
                            color = Bone,
                            modifier = Modifier.weight(1f),
                        )
                        Text(
                            text = sign.dates.uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                        )
                    }
                    Text(
                        text = "${sign.element.uppercase()} · ${sign.modality.uppercase()}",
                        style = MaterialTheme.typography.labelSmall,
                        color = FaintInk,
                        modifier = Modifier.padding(top = Spacing.Tight),
                    )
                    Text(
                        text = sign.traits,
                        style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                        color = Prose,
                        modifier = Modifier.padding(top = Spacing.Snug),
                    )
                    Text(
                        text = sign.blurb,
                        style = MaterialTheme.typography.bodySmall,
                        color = Bone,
                        modifier = Modifier.padding(top = Spacing.Tight),
                    )
                }
            }

            LearnTable.HOUSES -> (1..12).forEach { number ->
                val house = HouseMeanings.get(number)
                RowRule()
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = house.ordinal.uppercase(),
                            style = MaterialTheme.typography.labelSmall,
                            color = FaintInk,
                            modifier = Modifier.width(78.dp),
                        )
                        Text(
                            text = displayCase(house.title),
                            style = MaterialTheme.typography.headlineSmall,
                            color = Bone,
                        )
                    }
                    Text(
                        text = house.domain,
                        style = MaterialTheme.typography.bodySmall,
                        color = Prose,
                        modifier = Modifier.padding(top = Spacing.Snug),
                    )
                }
            }

            LearnTable.HOUSE_SYSTEMS -> Learn.HOUSE_SYSTEMS.forEach { system ->
                RowRule()
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = displayCase(system.name.uppercase()),
                            style = MaterialTheme.typography.headlineSmall,
                            color = Bone,
                            modifier = Modifier.weight(1f),
                        )
                        if (system.ours) {
                            Text(
                                text = "OURS",
                                style = MaterialTheme.typography.labelSmall,
                                color = LocalAccent.current,
                            )
                        }
                    }
                    Text(
                        text = system.age.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = Dim,
                        modifier = Modifier.padding(top = Spacing.Tight),
                    )
                    Text(
                        text = system.body,
                        style = MaterialTheme.typography.bodySmall,
                        color = Prose,
                        modifier = Modifier.padding(top = Spacing.Snug),
                    )
                }
            }

            LearnTable.ASPECTS -> AspectType.entries.forEach { aspect ->
                RowRule()
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "${aspect.degree.toInt()}°",
                            style = MaterialTheme.typography.labelMedium,
                            color = Dim,
                            modifier = Modifier.width(56.dp),
                        )
                        Text(
                            text = displayCase(aspect.name),
                            style = MaterialTheme.typography.headlineSmall,
                            color = Bone,
                        )
                    }
                    Text(
                        text = aspectRuling(culture, aspect),
                        style = MaterialTheme.typography.bodySmall,
                        color = Prose,
                        modifier = Modifier.padding(top = Spacing.Snug),
                    )
                    Text(
                        text = aspectGeometry(aspect),
                        style = MaterialTheme.typography.labelSmall,
                        color = FaintInk,
                        modifier = Modifier.padding(top = Spacing.Tight),
                    )
                }
            }
        }
    }
}

/** One row of the table of contents every section closes with. */
@Composable
private fun TocRow(section: LearnSection, current: String, onOpenSection: (String) -> Unit) {
    val accent = LocalAccent.current
    val isCurrent = section.href == current
    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                onClickLabel = section.title,
                role = Role.Button,
                onClick = { onOpenSection(section.href) },
            )
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
        horizontalArrangement = Arrangement.spacedBy(Spacing.Snug),
    ) {
        Text(
            text = section.n.toString().padStart(2, '0'),
            style = MaterialTheme.typography.labelSmall,
            color = FaintInk,
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = displayCase(section.title.uppercase()),
                style = MaterialTheme.typography.titleMedium,
                color = if (isCurrent) accent else Bone,
            )
            Text(
                text = section.blurb,
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.padding(top = Spacing.Tight),
            )
        }
    }
}

/**
 * The zodiac and planet signs, set as text rather than handed to the emoji
 * font.
 *
 * Android's emoji font claims these codepoints and paints them as coloured
 * pictographs: orange discs where the palette has bone ink. That is two
 * dozen hues the design system does not own, on a screen that is supposed to
 * separate by form. EmojiSupportMatch.None tells the text layer to leave them
 * to the product face, so they render as the line drawings they are.
 */
private val SIGN_SYMBOL = TextStyle(
    fontFamily = NotoSymbols,
    fontSize = TypeScale.DataM,
    platformStyle = PlatformTextStyle(emojiSupportMatch = EmojiSupportMatch.None),
)

/** The route each Learn section is reached at. */
fun learnRouteFor(href: String): String = Route.learn(href)
