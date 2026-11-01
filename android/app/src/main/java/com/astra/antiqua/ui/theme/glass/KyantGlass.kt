package com.astra.antiqua.ui.theme.glass

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Shape
import com.kyant.backdrop.backdrops.LayerBackdrop
import com.kyant.backdrop.backdrops.layerBackdrop
import com.kyant.backdrop.backdrops.rememberLayerBackdrop
import com.kyant.backdrop.drawBackdrop
import com.kyant.backdrop.effects.blur
import com.kyant.backdrop.effects.lens
import com.kyant.backdrop.effects.vibrancy

/**
 * Kyant0/AndroidLiquidGlass (io.github.kyant0:backdrop, Apache-2.0): the lens
 * over blur 24 and saturate 1.5 on API 33+, the blur and saturation alone on
 * 31 and 32, under the canvas fill rgba(24,21,16,.80).
 */
private class KyantBackdrop(private val layer: LayerBackdrop) : GlassBackdrop {
    override fun Modifier.source(): Modifier = layerBackdrop(layer)

    override fun Modifier.surface(shape: Shape, tier: GlassTier): Modifier = drawBackdrop(
        backdrop = layer,
        shape = { shape },
        effects = {
            vibrancy()
            blur(GlassInk.blurRadius.toPx())
            if (tier == GlassTier.LENS) lens(GlassInk.lensHeight.toPx(), GlassInk.lensAmount.toPx())
        },
        highlight = null,
        shadow = null,
        onDrawSurface = { drawRect(GlassInk.fill) },
    )
}

@Composable
internal fun rememberKyantBackdrop(): GlassBackdrop {
    val layer = rememberLayerBackdrop()
    return remember(layer) { KyantBackdrop(layer) }
}
