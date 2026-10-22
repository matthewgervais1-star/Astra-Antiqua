package com.astra.antiqua.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.minimumInteractiveComponentSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.ScriptReveal
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase

/**
 * The chrome every reading screen sits inside, the Compose counterpart of
 * web/src/components/chrome/NaveShell: a lintel carrying the app's own mark
 * and its sections, a context row under it with the horizon control and the
 * culture in force, then the page.
 *
 * The app used to have no bar at all, so a screen was wherever the phase
 * machine had left you, with no way back and no way across. This is what
 * makes a second screen worth building.
 */

/**
 * The top bar: the drawn lockup, the sections under it, and ACCOUNT at the
 * lockup's right end, where web's lintel keeps it.
 */
@Composable
fun Lintel(
    active: Section?,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val accent = LocalAccent.current
    Column(modifier = modifier.fillMaxWidth()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.Gutter),
            contentAlignment = Alignment.Center,
        ) {
            Box(Modifier.padding(vertical = Spacing.Snug)) { Wordmark(capHeight = 11.dp) }
            val account = Section.ACCOUNT
            // A 48dp touch target around the label; the label is drawn as
            // the sections are.
            Text(
                text = account.label,
                style = MaterialTheme.typography.labelSmall,
                color = if (account == active) accent else Dim,
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .minimumInteractiveComponentSize()
                    .clickable(
                        onClickLabel = account.label,
                        role = Role.Tab,
                        onClick = { onNavigate(account.route) },
                    ),
            )
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.Gutter)
                .padding(bottom = Spacing.Snug),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            Section.entries.filter { it != Section.ACCOUNT }.forEach { section ->
                val isActive = section == active
                Text(
                    text = section.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isActive) accent else Dim,
                    modifier = Modifier.clickable(
                        onClickLabel = section.label,
                        role = Role.Tab,
                        onClick = { onNavigate(section.route) },
                    ),
                )
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
}

/**
 * The context row: where you are, the horizon control, and the culture whose
 * voice you are reading in.
 */
@Composable
fun SubBar(
    context: String,
    culture: AncientCulture,
    modifier: Modifier = Modifier,
    horizon: Horizon? = null,
    builtHorizons: Set<Horizon> = Horizon.entries.toSet(),
    onNavigate: (String) -> Unit = {},
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = Spacing.Gutter, vertical = Spacing.Snug),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = context.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )
            if (horizon != null) {
                HorizonControl(active = horizon, onNavigate = onNavigate, built = builtHorizons)
                Box(Modifier.width(Spacing.Snug))
            }
            CultureMark(culture)
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
}

/**
 * D · W · S · Y. The active cell takes the accent as ink, never as a fill,
 * because the accent is never a background.
 *
 * A horizon whose screen is not in the graph yet is drawn in the faint ink
 * and does not respond. Navigating to a route NavHost does not know throws,
 * so the control shows what exists rather than pretending and crashing, and
 * a reader can see the four horizons are coming.
 */
@Composable
fun HorizonControl(
    active: Horizon,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
    built: Set<Horizon> = Horizon.entries.toSet(),
) {
    val accent = LocalAccent.current
    Row(modifier = modifier.border(1.dp, Rule)) {
        Horizon.entries.forEach { horizon ->
            val isActive = horizon == active
            val isBuilt = horizon in built
            Box(
                modifier = Modifier
                    .then(
                        if (isBuilt) {
                            Modifier.clickable(
                                onClickLabel = horizon.name,
                                role = Role.Tab,
                                onClick = { onNavigate(horizon.route) },
                            )
                        } else {
                            Modifier
                        }
                    )
                    .padding(horizontal = Spacing.Snug, vertical = Spacing.Tight),
            ) {
                Text(
                    text = horizon.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = when {
                        isActive -> accent
                        isBuilt -> Dim
                        else -> FaintInk
                    },
                )
            }
        }
    }
}

/** The culture in force: its emblem and its name, in its accent. */
@Composable
fun CultureMark(culture: AncientCulture, modifier: Modifier = Modifier) {
    val accent = LocalAccent.current
    Row(
        modifier = modifier
            .border(1.dp, Rule)
            .padding(horizontal = Spacing.Tight, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.Tight),
    ) {
        CultureEmblem(culture = culture, size = 12.dp, tint = accent)
        Text(
            text = culture.label.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = accent,
        )
    }
}

/**
 * A reading page: the lintel, the context row, and the content between them.
 * Every screen past the first-run flow uses this, so a reader is never
 * anywhere without a way back and a way across.
 */
@Composable
fun NaveShell(
    context: String,
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier,
    section: Section? = null,
    horizon: Horizon? = null,
    builtHorizons: Set<Horizon> = Horizon.entries.toSet(),
    content: @Composable () -> Unit,
) {
    Column(modifier = modifier.fillMaxSize()) {
        Lintel(active = section, onNavigate = onNavigate)
        SubBar(
            context = context,
            culture = culture,
            horizon = horizon,
            builtHorizons = builtHorizons,
            onNavigate = onNavigate,
        )
        Box(Modifier.weight(1f)) { content() }
    }
}

/** The line every reading closes with: what computed it, and where that is stated. */
@Composable
fun MethodFooter(onOpenMethod: () -> Unit, modifier: Modifier = Modifier) {
    Column(modifier = modifier.fillMaxWidth()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        Text(
            text = "ASTRONOMY-ENGINE EPHEMERIS · WHOLE-SIGN · ORBS DOCUMENTED → METHOD",
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            modifier = Modifier
                .clickable(
                    onClickLabel = "Read how the sky is computed",
                    role = Role.Button,
                    onClick = onOpenMethod,
                )
                .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
        )
    }
}

/**
 * A centred page head: kicker, accent rule, headline, closing rule.
 *
 * With [culture], the culture's own name stands large above the kicker, in
 * its script first, resolving to Latin after the intro hold (web's NaveHead
 * culture, docs/superpowers/specs/2026-10-20-script-reveal.md). With
 * [headlineContent], that composable takes the headline's place, for a page
 * whose title is itself a name.
 */
@Composable
fun NaveHead(
    kicker: String,
    headline: String,
    modifier: Modifier = Modifier,
    emblem: (@Composable () -> Unit)? = null,
    sub: String? = null,
    culture: AncientCulture? = null,
    headlineContent: (@Composable () -> Unit)? = null,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(vertical = Spacing.Step),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        if (emblem != null) {
            emblem()
            Box(Modifier.height(Spacing.Step))
        }
        if (culture != null) {
            CultureNameHead(culture)
            Box(Modifier.height(Spacing.Snug))
        }
        Text(
            text = kicker.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = Dim,
            textAlign = TextAlign.Center,
            // A long institution line has to keep the screen's gutter, or it
            // runs to both edges and stops looking set.
            modifier = Modifier.padding(horizontal = Spacing.Gutter),
        )
        Box(Modifier.height(Spacing.Step))
        AccentRule()
        Box(Modifier.height(Spacing.Step))
        if (headlineContent != null) {
            headlineContent()
        } else {
            Text(
                text = displayCase(headline.uppercase()),
                style = MaterialTheme.typography.displaySmall,
                color = Bone,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = Spacing.Gutter),
            )
        }
        if (sub != null) {
            Box(Modifier.height(Spacing.Snug))
            Text(
                text = sub.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = Spacing.Gutter),
            )
        }
        Box(Modifier.height(Spacing.Step))
        AccentRule()
    }
}

/**
 * The culture's name large at the head of a culture screen, in the accent:
 * script on arrival, Latin after [ScriptReveal.INTRO_HOLD_MILLIS], then the
 * band rule. Canaan has no attested script for its own name, so it shows Latin.
 */
@Composable
fun CultureNameHead(culture: AncientCulture, modifier: Modifier = Modifier) {
    ScriptName(
        culture = culture,
        key = ScriptNameKey.CultureName,
        style = MaterialTheme.typography.displayMedium,
        color = LocalAccent.current,
        intro = true,
        upper = true,
        displayFace = true,
        textAlign = TextAlign.Center,
        contentAlignment = Alignment.Center,
        modifier = modifier.padding(horizontal = Spacing.Gutter),
    )
}
