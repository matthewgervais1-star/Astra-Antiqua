package com.astra.antiqua.ui.theme.glass

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.displayCutout
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.max
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.theme.groundFor

/**
 * One glass screen: the culture's ground, the content scrolling under the
 * chrome, the scroll edge, the top bar (with the horizon control on the Sky
 * screens), an optional bottom accessory and the floating tab bar.
 *
 * Positions follow the canvas: the top row at the larger of the status bar's
 * bottom and 62, content from 189 under P2 and from 138 without it, the tab
 * bar 6 above the larger of the navigation bar's top and the canvas home line
 * 34 from the bottom. On the 390x844 frame with no system bars these are the
 * canvas's numbers to the point.
 *
 * The ground, the content and the edge are recorded as the backdrop the
 * chrome's glass refracts and blurs; the chrome itself is not, so no capsule
 * samples another.
 */
@Composable
fun GlassScreen(
    culture: AncientCulture,
    section: GlassSection,
    modifier: Modifier = Modifier,
    horizon: Horizon? = null,
    back: String? = null,
    scrollState: ScrollState = rememberScrollState(),
    /** Room under the content for the tab bar (the boards' padBottom). */
    contentBottom: Dp = 120.dp,
    accessory: (@Composable () -> Unit)? = null,
    onSection: (GlassSection) -> Unit = {},
    onHorizon: (Horizon) -> Unit = {},
    onBack: () -> Unit = {},
    onMenu: () -> Unit = {},
    content: @Composable ColumnScope.() -> Unit,
) {
    // The system bars and display cutouts on every side (not the keyboard, which
    // would lift the tab bar on a screen that never opens one). The
    // ground and the scroll edge run under all of it; the chrome and the
    // content keep inside its sides, and inside the canvas's 62 and 34.
    val density = LocalDensity.current
    val layout = LocalLayoutDirection.current
    val safe = WindowInsets.systemBars.union(WindowInsets.displayCutout)
    val safeTop = with(density) { safe.getTop(this).toDp() }
    val safeBottom = with(density) { safe.getBottom(this).toDp() }
    val safeStart = with(density) { safe.getLeft(this, layout).toDp() }
    val safeEnd = with(density) { safe.getRight(this, layout).toDp() }
    val sides = Modifier.padding(start = safeStart, end = safeEnd)
    val top = max(safeTop, Chrome.safeTop)
    val bottom = max(safeBottom, Chrome.safeBottom)
    val chromeBottom = Chrome.chromeBottom(top, horizon = horizon != null)
    val ground = groundFor(culture)
    val tier = LocalGlassTier.current
    val backdrop = rememberGlassBackdrop()

    Box(modifier.fillMaxSize()) {
        Box(
            Modifier
                .fillMaxSize()
                .then(if (tier != GlassTier.TINT) with(backdrop) { Modifier.source() } else Modifier)
                .background(ground),
        ) {
            Column(
                Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
                    .then(sides)
                    .padding(top = chromeBottom + Chrome.contentGap, bottom = contentBottom),
                content = content,
            )
            ScrollEdge(ground, chromeBottom + Chrome.edgeOverhang)
        }
        CompositionLocalProvider(LocalGlassBackdrop provides if (tier != GlassTier.TINT) backdrop else null) {
            Column(
                Modifier.fillMaxWidth().then(sides).padding(top = top),
                verticalArrangement = Arrangement.spacedBy(Chrome.horizonGap),
            ) {
                GlassTopBar(culture, back = back, onBack = onBack, onMenu = onMenu)
                if (horizon != null) {
                    GlassHorizonControl(horizon, Modifier.padding(horizontal = Chrome.inset), onSelect = onHorizon)
                }
            }
            Column(
                Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .then(sides)
                    .padding(horizontal = Chrome.inset)
                    .padding(bottom = bottom + Chrome.homeGap),
                verticalArrangement = Arrangement.spacedBy(Chrome.accessoryGap),
            ) {
                accessory?.invoke()
                GlassTabBar(section, onSelect = onSection)
            }
        }
    }
}
