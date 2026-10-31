package com.astra.antiqua.ui.components

import androidx.compose.ui.text.TextStyle
import androidx.compose.foundation.background
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.InteractionSource
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase

/**
 * The identity's component vocabulary, the Compose half of what
 * docs/design/system/components/specs describes and web/src/components/chrome
 * builds. A component that exists on both surfaces is named and shaped the
 * same on both, so a change to the system lands in one place per platform
 * rather than in every screen.
 *
 * Geometry is fixed and shared: square corners, no shadow, no gradient, 1px
 * rules. Anything that needs to stand out does it with the culture's accent
 * or with a rule, never with elevation.
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
            text = displayCase(text.uppercase()),
            style = MaterialTheme.typography.headlineSmall,
            color = accent,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Step),
        )
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
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
 * The three weights of action
 * (docs/design/system/components/specs/Button.prompt.md).
 *
 * PRIMARY is a hairline on the incised rule. GHOST has no rule at all, for a
 * secondary way out. VOTIVE carries the accent rule and the accent ink, and
 * is for the one instruction on a screen that asks something of the reader:
 * the accent has three jobs and this is the second of them, so a screen
 * carries at most one votive.
 */
enum class ActionWeight { PRIMARY, GHOST, VOTIVE }

/**
 * A mono-caps action. The label is set in the data face rather than Cinzel,
 * which is what the Button spec asks for and what the web surface now does:
 * a button is a label, and labels are mono here.
 */
@Composable
fun ActionButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    weight: ActionWeight = ActionWeight.PRIMARY,
    enabled: Boolean = true,
) {
    val accent = LocalAccent.current
    val edge = when {
        !enabled -> Rule
        weight == ActionWeight.VOTIVE -> accent
        weight == ActionWeight.GHOST -> Color.Transparent
        else -> Rule
    }
    val ink = when {
        !enabled -> Dim
        weight == ActionWeight.VOTIVE -> accent
        weight == ActionWeight.GHOST -> Dim
        else -> Bone
    }
    Box(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, edge)
            .then(
                if (enabled) {
                    Modifier.clickable(onClickLabel = label, role = Role.Button, onClick = onClick)
                } else {
                    Modifier
                }
            )
            .padding(vertical = Spacing.Step, horizontal = Spacing.Gutter),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            color = ink,
            textAlign = TextAlign.Center,
        )
    }
}

/** The votive weight, the name the screens already call it by. */
@Composable
fun PrimaryAction(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) = ActionButton(label, onClick, modifier, ActionWeight.VOTIVE, enabled)

/**
 * The tones a badge carries
 * (docs/design/system/components/specs/Badge.prompt.md).
 *
 * OUTLINE is the resting chip, on the incised rule in the dim ink. ACCENT is
 * reserved for what the accent marks: a received body, the record in force,
 * the culture chosen. DIM drops the rule for a fact that only needs stating.
 * CONFLICT is the signal ink, for a warning and nothing else.
 */
enum class BadgeTone { OUTLINE, ACCENT, DIM, CONFLICT }

/** A small mono-caps label chip for status, tier and reception markers. */
@Composable
fun Badge(
    text: String,
    modifier: Modifier = Modifier,
    tone: BadgeTone = BadgeTone.OUTLINE,
) {
    val accent = LocalAccent.current
    val edge = when (tone) {
        BadgeTone.OUTLINE -> Rule
        BadgeTone.ACCENT -> accent
        BadgeTone.DIM -> Color.Transparent
        BadgeTone.CONFLICT -> Conflict
    }
    val ink = when (tone) {
        BadgeTone.OUTLINE -> Dim
        BadgeTone.ACCENT -> accent
        BadgeTone.DIM -> FaintInk
        BadgeTone.CONFLICT -> Conflict
    }
    Box(
        modifier = modifier
            .border(1.dp, edge)
            .padding(horizontal = Spacing.Tight, vertical = 2.dp),
    ) {
        Text(text.uppercase(), style = MaterialTheme.typography.labelSmall, color = ink)
    }
}

/** What a row has to report about itself, where it has anything. */
enum class RowQuality { NONE, HARMONY, CONFLICT }

/**
 * The column template, shared with the head so the two cannot drift.
 * Body, position, sign, house, motion, signal.
 */
private val POSITION_WIDTH = 74.dp
private val SIGN_WIDTH = 40.dp
private val HOUSE_WIDTH = 28.dp
/** Wide enough for the head's "MOT" at the data size, or it wraps to two lines. */
private val MOTION_WIDTH = 30.dp
private val SIGNAL_WIDTH = 10.dp

/** The column labels, in the faint ink a table interior takes. */
@Composable
fun DataRowHead(modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.fillMaxWidth().padding(vertical = Spacing.Tight),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val style = MaterialTheme.typography.labelSmall
        Text("BODY", style = style, color = FaintInk, modifier = Modifier.weight(1f))
        Text("LONG", style = style, color = FaintInk, modifier = Modifier.width(POSITION_WIDTH))
        Text("SIGN", style = style, color = FaintInk, modifier = Modifier.width(SIGN_WIDTH))
        Text("HSE", style = style, color = FaintInk, modifier = Modifier.width(HOUSE_WIDTH))
        Text("MOT", style = style, color = FaintInk, maxLines = 1, modifier = Modifier.width(MOTION_WIDTH))
        Box(Modifier.width(SIGNAL_WIDTH))
    }
}

/**
 * One ephemeris row
 * (docs/design/system/components/specs/DataRow.prompt.md): body, position,
 * house, motion, with a quality mark; a received body takes the accent.
 *
 * Motion is read rather than computed here: the ephemeris already reports
 * each body's velocity, so a retrograde is a fact carried down from the
 * engine rather than a second derivation that could disagree with the wheel.
 * The quality mark is a square, because this system has square corners
 * everywhere.
 */
@Composable
fun DataRow(
    name: String,
    position: String,
    sign: String,
    house: Int,
    retrograde: Boolean,
    modifier: Modifier = Modifier,
    quality: RowQuality = RowQuality.NONE,
    received: Boolean = false,
    leading: (@Composable () -> Unit)? = null,
    onClick: (() -> Unit)? = null,
    /**
     * Draws the name in place of the plain text, given the row's style, ink and
     * interaction source (a ScriptName, which resolves when the row takes focus).
     */
    nameContent: (@Composable (style: TextStyle, ink: Color, interactionSource: InteractionSource) -> Unit)? = null,
) {
    val accent = LocalAccent.current
    val ink = if (received) accent else Bone
    val interactionSource = remember { MutableInteractionSource() }
    Row(
        modifier = modifier
            .fillMaxWidth()
            .then(
                if (onClick != null) {
                    Modifier.clickable(
                        interactionSource = interactionSource,
                        indication = LocalIndication.current,
                        onClickLabel = name,
                        role = Role.Button,
                        onClick = onClick,
                    )
                } else {
                    Modifier
                }
            )
            .padding(vertical = Spacing.Snug),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val style = MaterialTheme.typography.labelMedium
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.Tight),
        ) {
            if (leading != null) leading()
            if (nameContent != null) {
                nameContent(style, ink, interactionSource)
            } else {
                Text(name.uppercase(), style = style, color = ink, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Text(position, style = style, color = Dim, modifier = Modifier.width(POSITION_WIDTH))
        Text(sign.uppercase(), style = style, color = Dim, modifier = Modifier.width(SIGN_WIDTH))
        Text(
            text = house.toString().padStart(2, '0'),
            style = style,
            color = Dim,
            modifier = Modifier.width(HOUSE_WIDTH),
        )
        Text(
            text = if (retrograde) "R" else "D",
            style = style,
            color = if (retrograde) Bone else FaintInk,
            modifier = Modifier.width(MOTION_WIDTH),
        )
        Box(Modifier.width(SIGNAL_WIDTH), contentAlignment = Alignment.Center) {
            if (quality != RowQuality.NONE) {
                Box(
                    Modifier
                        .size(6.dp)
                        .background(if (quality == RowQuality.HARMONY) Harmony else Conflict)
                )
            }
        }
    }
}

/** The faint rule that separates one data row from the next. */
@Composable
fun RowRule(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(1.dp).background(RuleRow))
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
