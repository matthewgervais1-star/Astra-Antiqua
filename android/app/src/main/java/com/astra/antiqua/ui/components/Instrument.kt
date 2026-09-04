package com.astra.antiqua.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spacing

/**
 * The identity's component vocabulary.
 *
 * Geometry is fixed and shared: square corners, no shadow, no gradient, 1px
 * rules. Anything that needs to stand out does it with the culture's accent
 * or with a rule, never with elevation. These replace GlassCard, which was
 * the app's entire component library and drew a rounded translucent panel
 * belonging to the previous identity.
 */

/** A bordered surface. The plain container for anything that needs an edge. */
@Composable
fun Panel(
    modifier: Modifier = Modifier,
    accented: Boolean = false,
    content: @Composable () -> Unit,
) {
    val edge = if (accented) LocalAccent.current else Rule
    Box(
        modifier = modifier
            .border(1.dp, edge)
            .padding(Spacing.Step)
    ) { content() }
}

/** A rule with a caption set into it, the way a section is titled. */
@Composable
fun SectionDivider(label: String, modifier: Modifier = Modifier) {
    val accent = LocalAccent.current
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = Spacing.Step),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(Spacing.Step),
    ) {
        Box(Modifier.weight(1f).height(1.dp).background(Rule))
        Text(label.uppercase(), style = MaterialTheme.typography.titleSmall, color = accent)
        Box(Modifier.weight(1f).height(1.dp).background(Rule))
    }
}

/**
 * The votive: an instruction set between two rules, centred and in caps. The
 * one place a reading raises its voice, so it is never more than two lines.
 */
@Composable
fun Votive(text: String, modifier: Modifier = Modifier) {
    val accent = LocalAccent.current
    Column(modifier = modifier.fillMaxWidth()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        Text(
            text = text.uppercase(),
            style = MaterialTheme.typography.headlineSmall,
            color = accent,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Step),
        )
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
}

/** A label and its value on one line, the ephemeris row shape. */
@Composable
fun DataRow(
    label: String,
    value: String,
    modifier: Modifier = Modifier,
    valueColor: androidx.compose.ui.graphics.Color = Dim,
) {
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = Spacing.Snug),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = Bone)
        Text(value, style = MaterialTheme.typography.labelMedium, color = valueColor)
    }
}

/** A mono kicker: the small line that says where you are. */
@Composable
fun Kicker(text: String, modifier: Modifier = Modifier) {
    Text(
        text = text.uppercase(),
        style = MaterialTheme.typography.labelMedium,
        color = Dim,
        modifier = modifier,
    )
}

/**
 * The primary action. A bordered rule of a button, filled with the accent
 * only when it is the one thing to do next.
 */
@Composable
fun PrimaryAction(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val accent = LocalAccent.current
    val edge = if (enabled) accent else Rule
    Box(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, edge)
            .then(if (enabled) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = Spacing.Step),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.titleMedium,
            color = if (enabled) accent else Dim,
        )
    }
}

/** A 64x1 accent rule, the mark under a heading. */
@Composable
fun AccentRule(modifier: Modifier = Modifier) {
    Box(
        modifier
            .width(64.dp)
            .height(1.dp)
            .background(LocalAccent.current)
    )
}
