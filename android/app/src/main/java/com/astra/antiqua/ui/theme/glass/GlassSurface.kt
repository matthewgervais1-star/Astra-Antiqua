package com.astra.antiqua.ui.theme.glass

import android.graphics.Paint
import androidx.compose.foundation.background
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.ClipOp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathOperation
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.ui.theme.LocalAccent

/** Every glass surface on the canvas is a capsule (corner 999). */
val CapsuleShape = RoundedCornerShape(percent = 50)

/**
 * The seam between the chrome and a glass library. [GlassScreen] marks its
 * ground and content with [source]; each capsule draws itself with [surface].
 * One implementation per library (KyantGlass.kt, HazeGlass.kt), so the one
 * not kept comes out with its file, its [GlassEngine] entry and its dependency.
 */
interface GlassBackdrop {
    /** Records what scrolls beneath the chrome. */
    fun Modifier.source(): Modifier

    /** Draws a capsule's glass over the recorded content, in [tier] (never [GlassTier.TINT]). */
    fun Modifier.surface(shape: Shape, tier: GlassTier): Modifier
}

/** The glass libraries under comparison (Matthew, 2026-10-31: "Compare both"). */
enum class GlassEngine {
    /** Kyant0/AndroidLiquidGlass: lens refraction on API 33+ (KyantGlass.kt). */
    KYANT,

    /** chrisbanes/haze: frosted blur, no lens (HazeGlass.kt). */
    HAZE,
}

/** The library the chrome draws with. A screenshot test sets it to compare the two. */
val LocalGlassEngine = staticCompositionLocalOf { GlassEngine.KYANT }

@Composable
fun rememberGlassBackdrop(engine: GlassEngine = LocalGlassEngine.current): GlassBackdrop = when (engine) {
    GlassEngine.KYANT -> rememberKyantBackdrop()
    GlassEngine.HAZE -> rememberHazeBackdrop()
}

/**
 * What the glass blurs: the screen's ground and content, recorded by
 * [GlassScreen]. Null outside a glass screen, where the chrome draws the tint.
 */
val LocalGlassBackdrop = staticCompositionLocalOf<GlassBackdrop?> { null }

/** A shape's outline as a path, in this draw scope's size. */
private fun DrawScope.outlinePath(shape: Shape, size: Size = this.size, at: Offset = Offset.Zero): Path {
    val path = Path()
    when (val outline = shape.createOutline(size, layoutDirection, this)) {
        is Outline.Rectangle -> path.addRect(outline.rect)
        is Outline.Rounded -> path.addRoundRect(outline.roundRect)
        is Outline.Generic -> path.addPath(outline.path)
    }
    if (at != Offset.Zero) path.translate(at)
    return path
}

/**
 * The 1px highlight along the top inner edge, inset 0 1px 0: the shape less
 * itself moved down one point.
 */
fun DrawScope.drawTopHighlight(shape: Shape, color: Color) {
    val outline = outlinePath(shape)
    val lower = outlinePath(shape, at = Offset(0f, 1.dp.toPx()))
    drawPath(Path.combine(PathOperation.Difference, outline, lower), color)
}

/**
 * The 1px hairline inside the edge, inset 0 0 0 1px: the shape less the
 * shape inset by a point on every side (a capsule's radius shrinks with it).
 */
fun DrawScope.drawHairline(shape: Shape, color: Color) {
    val one = 1.dp.toPx()
    val outline = outlinePath(shape)
    val inner = outlinePath(shape, Size(size.width - 2 * one, size.height - 2 * one), Offset(one, one))
    drawPath(Path.combine(PathOperation.Difference, outline, inner), color)
}

/**
 * 0 10px 30px rgba(0,0,0,.45), drawn outside the shape only: a CSS outer
 * shadow does not show through a translucent box, so the shape is clipped out
 * before the shadow layer draws. Hardware canvases draw shadow layers on paths
 * from API 28; on 26 and 27 the shadow is absent.
 */
private fun DrawScope.drawGlassShadow(shape: Shape) {
    val outline = outlinePath(shape)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.Black.toArgb()
        setShadowLayer(GlassInk.shadowRadius.toPx(), 0f, GlassInk.shadowY.toPx(), GlassInk.shadow.toArgb())
    }
    clipPath(outline, ClipOp.Difference) {
        drawIntoCanvas { it.nativeCanvas.drawPath(outline.asAndroidPath(), paint) }
    }
}

/**
 * Puts a view on glass, in the tier this phone draws ([LocalGlassTier]): on
 * API 31+ the library's blur (and, with Kyant on 33+, its lens), on 26 to 30
 * the tint fill. Every tier then draws the canvas's 1px inset highlight and
 * hairline, and the shadow.
 */
fun Modifier.glassSurface(shape: Shape = CapsuleShape): Modifier = composed {
    val tier = LocalGlassTier.current
    val backdrop = LocalGlassBackdrop.current
    val surface = if (tier != GlassTier.TINT && backdrop != null) {
        with(backdrop) { Modifier.surface(shape, tier) }
    } else {
        Modifier.background(GlassInk.tintFill, shape)
    }
    Modifier
        .drawBehind { drawGlassShadow(shape) }
        .then(surface)
        .drawBehind {
            drawTopHighlight(shape, GlassInk.highlight)
            drawHairline(shape, GlassInk.hairline)
        }
}

/** A fill with the 1px top highlight: the lit thumb, or the pressed fill. */
fun DrawScope.drawLitFill(shape: Shape, fill: Color, highlight: Color) {
    drawPath(outlinePath(shape), fill)
    drawTopHighlight(shape, highlight)
}

/**
 * Web's `:focus-visible` (globals.css): a 1px outline in the culture's accent,
 * 2px outside the box, square. Compose focuses a clickable only from a key or
 * D-pad, never from a touch, so this shows exactly when web's would.
 */
@Composable
fun Modifier.focusOutline(interactionSource: MutableInteractionSource): Modifier {
    val focused by interactionSource.collectIsFocusedAsState()
    val accent = LocalAccent.current
    return drawWithContent {
        drawContent()
        if (focused) drawFocusOutline(accent, GlassInk.focusWidth, GlassInk.focusOffset)
    }
}

private fun DrawScope.drawFocusOutline(color: Color, width: Dp, offset: Dp) {
    val w = width.toPx()
    val o = offset.toPx() + w / 2
    drawRect(
        color = color,
        topLeft = Offset(-o, -o),
        size = Size(size.width + 2 * o, size.height + 2 * o),
        style = Stroke(w),
    )
}
