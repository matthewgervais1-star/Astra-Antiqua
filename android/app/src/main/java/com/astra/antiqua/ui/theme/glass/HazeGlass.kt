package com.astra.antiqua.ui.theme.glass

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import dev.chrisbanes.haze.HazeState
import dev.chrisbanes.haze.HazeStyle
import dev.chrisbanes.haze.HazeTint
import dev.chrisbanes.haze.hazeEffect
import dev.chrisbanes.haze.hazeSource
import dev.chrisbanes.haze.rememberHazeState

/**
 * chrisbanes/haze (dev.chrisbanes.haze:haze, Apache-2.0): a frosted blur 24
 * under the canvas fill on API 31+. Haze 1.7 has no saturation control, so
 * saturate 1.5 is not drawn, and it has no lens. Below API 31 the chrome does
 * not call it: the tint tier draws the fill Haze's own scrim would.
 */
private class HazeBackdrop(private val state: HazeState) : GlassBackdrop {
    override fun Modifier.source(): Modifier = hazeSource(state)

    override fun Modifier.surface(shape: Shape, tier: GlassTier): Modifier = clip(shape).hazeEffect(
        state = state,
        style = HazeStyle(
            tints = listOf(HazeTint(GlassInk.fill)),
            blurRadius = GlassInk.blurRadius,
            noiseFactor = 0f,
            fallbackTint = HazeTint(GlassInk.tintFill),
        ),
    )
}

@Composable
internal fun rememberHazeBackdrop(): GlassBackdrop {
    val state = rememberHazeState(blurEnabled = true)
    return remember(state) { HazeBackdrop(state) }
}
