package com.astra.antiqua.ui.theme.glass

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.PlatformTextStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.label
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.PlexMono
import com.astra.antiqua.ui.theme.accentFor

// The chrome's type is fixed at the canvas sizes and does not follow the
// phone's font scale, as on iOS (Matthew, 2026-10-31: "Fixed at 11 pt"). Each
// size is a dp turned into sp at the current scale, so 11 stays 11.

@Composable
private fun chromeType(
    family: FontFamily,
    weight: FontWeight,
    size: Dp,
    tracking: Float,
    lineHeight: Dp = size,
): TextStyle {
    val density = LocalDensity.current
    return with(density) {
        TextStyle(
            fontFamily = family,
            fontWeight = weight,
            fontSize = size.toSp(),
            letterSpacing = tracking.em,
            lineHeight = lineHeight.toSp(),
            lineHeightStyle = LineHeightStyle(LineHeightStyle.Alignment.Center, LineHeightStyle.Trim.None),
            platformStyle = PlatformTextStyle(includeFontPadding = false),
        )
    }
}

/**
 * One line of chrome type. CSS adds letter-spacing after the last letter too
 * and Android does not, so every canvas box is one letter-space wider than
 * Android's text (3.64 for the wordmark); the end padding restores it, which
 * keeps the canvas's boxes and its centring (P1 at 88.1 on a pushed screen).
 */
@Composable
private fun ChromeText(
    text: String,
    family: FontFamily,
    weight: FontWeight,
    size: Dp,
    tracking: Float,
    color: Color,
    modifier: Modifier = Modifier,
    lineHeight: Dp = size,
) {
    Text(
        text = text,
        style = chromeType(family, weight, size, tracking, lineHeight),
        color = if (LocalChromeLabelsHidden.current) Color.Transparent else color,
        maxLines = 1,
        softWrap = false,
        modifier = modifier.padding(end = size * tracking),
    )
}

/** A chevron as the canvas draws it: 10x6 pointing down (P3), 6x10 left or right (P55, P56). */
enum class ChevronDirection { DOWN, LEFT, RIGHT }

@Composable
fun Chevron(direction: ChevronDirection, color: Color, modifier: Modifier = Modifier) {
    val box = if (direction == ChevronDirection.DOWN) Pair(10.dp, 6.dp) else Pair(6.dp, 10.dp)
    Canvas(modifier.size(box.first, box.second)) {
        // The canvas paths, in their own viewBoxes: M1 1L5 5L9 1 (10x6),
        // M5 1L1 5L5 9 (6x10), M1 1L5 5L1 9 (6x10).
        val points = when (direction) {
            ChevronDirection.DOWN -> listOf(1f to 1f, 5f to 5f, 9f to 1f)
            ChevronDirection.LEFT -> listOf(5f to 1f, 1f to 5f, 5f to 9f)
            ChevronDirection.RIGHT -> listOf(1f to 1f, 5f to 5f, 1f to 9f)
        }
        val unit = 1.dp.toPx()
        val path = Path()
        points.forEachIndexed { i, (x, y) ->
            if (i == 0) path.moveTo(x * unit, y * unit) else path.lineTo(x * unit, y * unit)
        }
        drawPath(path, color, style = Stroke(GlassInk.chevronStroke.toPx(), cap = StrokeCap.Butt, join = StrokeJoin.Miter))
    }
}

/**
 * One tappable part of a glass capsule: a tab, a horizon, a switcher side.
 * [lit] draws the thumb; a press (or [id] in [LocalPressedPreview]) draws the
 * pressed fill over it, P163, P166, P167.
 */
@Composable
private fun GlassSegment(
    id: String,
    lit: Boolean,
    role: Role,
    onClickLabel: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    contentAlignment: Alignment = Alignment.Center,
    content: @Composable BoxScope.() -> Unit,
) {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val preview = id in LocalPressedPreview.current
    Box(
        modifier = modifier
            .focusOutline(source)
            .drawBehind {
                if (lit) drawLitFill(CapsuleShape, GlassInk.thumb, GlassInk.thumbHighlight)
                if (pressed || preview) drawLitFill(CapsuleShape, GlassInk.pressed, GlassInk.pressedHighlight)
            }
            .clickable(
                interactionSource = source,
                indication = null,
                enabled = enabled,
                role = role,
                onClickLabel = onClickLabel,
                onClick = onClick,
            )
            .semantics { if (role == Role.Tab) selected = lit },
        contentAlignment = contentAlignment,
        content = content,
    )
}

// The tab bar (P17)

/** The four sections of the tab bar. */
enum class GlassSection(val title: String) { SKY("SKY"), TRANSITS("TRANSITS"), CHART("CHART"), MORE("MORE") }

/**
 * P17: a floating glass capsule with four text tabs. The lit tab is the
 * screen's section; a pushed screen keeps its parent lit.
 */
@Composable
fun GlassTabBar(selection: GlassSection, modifier: Modifier = Modifier, onSelect: (GlassSection) -> Unit = {}) {
    Row(
        modifier = modifier
            .testTag("P17")
            .fillMaxWidth()
            .height(Chrome.tabH)
            .glassSurface()
            .padding(Chrome.tabPadding)
            .semantics { contentDescription = "Sections" },
    ) {
        GlassSection.entries.forEach { section ->
            val isLit = section == selection
            GlassSegment(
                id = "P163.${section.name.lowercase()}",
                lit = isLit,
                role = Role.Tab,
                onClickLabel = section.title,
                onClick = { onSelect(section) },
                modifier = Modifier.weight(1f).fillMaxHeight(),
            ) {
                ChromeText(section.title, PlexMono, if (isLit) FontWeight.Medium else FontWeight.Normal, 11.dp, 0.18f, if (isLit) Bone else Dim)
            }
        }
    }
}

// The top bar (P1, P3, P55)

/** P1: the wordmark, on the ground. Cinzel 500 13, tracking .28em, its box 18 tall. */
@Composable
fun GlassWordmark(modifier: Modifier = Modifier) {
    ChromeText(
        text = "ASTRA ANTIQVA",
        family = Cinzel,
        weight = FontWeight.Medium,
        size = 13.dp,
        tracking = 0.28f,
        color = Bone,
        lineHeight = 18.dp,
        modifier = modifier.testTag("P1").semantics { heading() },
    )
}

/**
 * P3: the culture menu, a glass capsule at the right of the top bar: the
 * accent square, the culture's name and a chevron. It opens the culture sheet.
 */
@Composable
fun CultureMenu(culture: AncientCulture, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val preview = "P164" in LocalPressedPreview.current
    val name = culture.label
    Row(
        modifier = modifier
            .testTag("P3")
            .width(Chrome.menuWidth(culture))
            .height(Chrome.barH)
            .focusOutline(source)
            .glassSurface()
            .drawBehind { if (pressed || preview) drawLitFill(CapsuleShape, GlassInk.pressed, GlassInk.pressedHighlight) }
            .clickable(source, indication = null, role = Role.Button, onClickLabel = "Change culture", onClick = onClick)
            .clearAndSetSemantics {
                role = Role.Button
                contentDescription = "Culture: $name. Change culture"
            }
            .padding(horizontal = Chrome.menuPadding),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(Chrome.menuSquare).background(accentFor(culture)))
        Spacer(Modifier.width(Chrome.menuSquareGap))
        ChromeText(name.uppercase(), PlexMono, FontWeight.Normal, 11.dp, 0.14f, Bone)
        Spacer(Modifier.weight(1f))
        Chevron(ChevronDirection.DOWN, Dim)
    }
}

/**
 * P55: the round glass back button of a pushed screen. [title] names the
 * parent ("CHART"); the canvas shows the chevron alone (lever backLabel).
 */
@Composable
fun GlassBackButton(title: String, modifier: Modifier = Modifier, onClick: () -> Unit = {}) {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    val preview = "P165" in LocalPressedPreview.current
    val spoken = title.lowercase().replaceFirstChar { it.uppercase() }
    Row(
        modifier = modifier
            .testTag("P55")
            .height(Chrome.backSize)
            .then(if (Chrome.backTitled) Modifier.padding(horizontal = Chrome.menuPadding) else Modifier.width(Chrome.backSize))
            .focusOutline(source)
            .glassSurface()
            .drawBehind { if (pressed || preview) drawLitFill(CapsuleShape, GlassInk.pressed, GlassInk.pressedHighlight) }
            .clickable(source, indication = null, role = Role.Button, onClickLabel = "Back to $spoken", onClick = onClick)
            .clearAndSetSemantics {
                role = Role.Button
                contentDescription = "Back to $spoken"
            },
        horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Chevron(ChevronDirection.LEFT, Bone)
        if (Chrome.backTitled) {
            ChromeText(title, PlexMono, FontWeight.Normal, 11.dp, 0.14f, Bone)
        }
    }
}

/**
 * The top bar: no bar, the wordmark on the ground and the culture menu at the
 * right; a pushed screen adds the back button at the left and centres the
 * wordmark between the two capsules (P1 at 88.1).
 */
@Composable
fun GlassTopBar(
    culture: AncientCulture,
    modifier: Modifier = Modifier,
    back: String? = null,
    onBack: () -> Unit = {},
    onMenu: () -> Unit = {},
) {
    Row(
        modifier = modifier.fillMaxWidth().height(Chrome.barH).padding(horizontal = Chrome.inset),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (back != null) {
            GlassBackButton(back, onClick = onBack)
            Box(Modifier.weight(1f), contentAlignment = Alignment.Center) { GlassWordmark() }
        } else {
            Spacer(Modifier.width(Chrome.contentSide - Chrome.inset))
            GlassWordmark()
            Spacer(Modifier.weight(1f))
        }
        CultureMenu(culture, onClick = onMenu)
    }
}

// The horizon control (P2)

/**
 * P2: DAY · WEEK · SEASON · YEAR, a glass capsule under the top bar on the
 * four Sky screens, the screen's horizon lit.
 */
@Composable
fun GlassHorizonControl(selection: Horizon, modifier: Modifier = Modifier, onSelect: (Horizon) -> Unit = {}) {
    Row(
        modifier = modifier
            .testTag("P2")
            .fillMaxWidth()
            .height(Chrome.horizonH)
            .glassSurface()
            .padding(Chrome.horizonPadding)
            .semantics { contentDescription = "Horizon" },
    ) {
        Horizon.entries.forEach { horizon ->
            val isLit = horizon == selection
            GlassSegment(
                id = "P166.${horizon.name.lowercase()}",
                lit = isLit,
                role = Role.Tab,
                onClickLabel = horizon.name,
                onClick = { onSelect(horizon) },
                modifier = Modifier.weight(1f).fillMaxHeight(),
            ) {
                ChromeText(horizon.name, PlexMono, if (isLit) FontWeight.Medium else FontWeight.Normal, 11.dp, 0.12f, if (isLit) Bone else Dim)
            }
        }
    }
}

// The bottom accessory (P56)

/**
 * A glass capsule 8 above the tab bar, 48 tall: the bottom accessory. On
 * Placement it holds the body switcher ([BodySwitcher]).
 */
@Composable
fun GlassAccessory(modifier: Modifier = Modifier, content: @Composable RowScope.() -> Unit) {
    Row(
        modifier = modifier
            .testTag("P56")
            .fillMaxWidth()
            .height(Chrome.accessoryH)
            .glassSurface()
            .padding(Chrome.accessoryPadding),
        verticalAlignment = Alignment.CenterVertically,
        content = content,
    )
}

/**
 * P56: previous and next body, the next in bone and the previous in dim (as
 * the flat Placement drew them). A side at the first or last body drops to
 * 40% and takes no tap (P168); the side under the finger takes the pressed
 * fill (P167).
 */
@Composable
fun BodySwitcher(
    previous: String,
    next: String,
    modifier: Modifier = Modifier,
    previousEnabled: Boolean = true,
    nextEnabled: Boolean = true,
    onPrevious: () -> Unit = {},
    onNext: () -> Unit = {},
) {
    GlassAccessory(modifier) {
        GlassSegment(
            id = "P167.previous",
            lit = false,
            role = Role.Button,
            onClickLabel = "Previous body, $previous",
            onClick = onPrevious,
            enabled = previousEnabled,
            contentAlignment = Alignment.CenterStart,
            modifier = Modifier.weight(1f).fillMaxHeight().alpha(if (previousEnabled) 1f else GlassInk.disabledAlpha),
        ) {
            Row(Modifier.padding(horizontal = Chrome.accessorySidePadding), verticalAlignment = Alignment.CenterVertically) {
                Chevron(ChevronDirection.LEFT, Dim)
                Spacer(Modifier.width(Chrome.accessoryChevronGap))
                ChromeText(previous.uppercase(), PlexMono, FontWeight.Normal, 11.dp, 0.14f, Dim)
            }
        }
        Box(
            Modifier
                .padding(vertical = (Chrome.accessoryH - Chrome.accessoryPadding * 2 - Chrome.accessoryRuleH) / 2)
                .width(1.dp)
                .height(Chrome.accessoryRuleH)
                .background(GlassInk.accessoryRule),
        )
        GlassSegment(
            id = "P167.next",
            lit = false,
            role = Role.Button,
            onClickLabel = "Next body, $next",
            onClick = onNext,
            enabled = nextEnabled,
            contentAlignment = Alignment.CenterEnd,
            modifier = Modifier.weight(1f).fillMaxHeight().alpha(if (nextEnabled) 1f else GlassInk.disabledAlpha),
        ) {
            Row(Modifier.padding(horizontal = Chrome.accessorySidePadding), verticalAlignment = Alignment.CenterVertically) {
                ChromeText(next.uppercase(), PlexMono, FontWeight.Normal, 11.dp, 0.14f, Bone)
                Spacer(Modifier.width(Chrome.accessoryChevronGap))
                Chevron(ChevronDirection.RIGHT, Bone)
            }
        }
    }
}

// The scroll edge (P20)

/**
 * P20: the fade under the top chrome, ground at .94, .86 at 55%, clear at the
 * bottom. It is not glass. Over the bare ground it draws nothing visible.
 */
@Composable
fun ScrollEdge(ground: Color, height: Dp, modifier: Modifier = Modifier) {
    Box(
        modifier
            .testTag("P20")
            .fillMaxWidth()
            .height(height)
            .background(
                Brush.verticalGradient(
                    0f to ground.copy(alpha = 0.94f),
                    0.55f to ground.copy(alpha = 0.86f),
                    1f to ground.copy(alpha = 0f),
                ),
            ),
    )
}
