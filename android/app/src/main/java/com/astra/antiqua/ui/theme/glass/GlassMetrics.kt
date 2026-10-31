package com.astra.antiqua.ui.theme.glass

import android.os.Build
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.theme.Bone

/**
 * The Liquid Glass chrome, from the approved canvas
 * (https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, page "Glass", the Round 7
 * spec boards; approved by the owner on 2026-10-31). Glass is the navigation
 * layer only: the tab bar, the top bar's capsules, the horizon control, the
 * bottom accessory, the back button, menus and sheets. Content stays flat on
 * the culture's ground with square corners and 1px rules.
 *
 * Every number here is a canvas lever at its default, in points on the 390x844
 * frame read as dp, and names the canvas ID it places. The iOS port keeps the
 * same names in ios/AstraAntiqua/Theme/Glass.swift (`Chrome`, `GlassInk`).
 */
object Chrome {
    /** P1, P3, P55: the top of their 44-tall row, the canvas frame's safe top. */
    val safeTop: Dp = 62.dp
    /** P17: the canvas frame's home line sits this far above the screen's bottom (844 - 810). */
    val safeBottom: Dp = 34.dp
    /** P1, P3, P55: the row's height. */
    val barH: Dp = 44.dp
    /** P17, P3, P55, P2, P56: distance from the screen's sides (lever inset). */
    val inset: Dp = 16.dp
    /** P1: left edge on a tab screen (lever contentSide). */
    val contentSide: Dp = 24.dp

    /** P17: the tab bar's height (lever tabH, 44 to 72). */
    val tabH: Dp = 56.dp
    /** P17: gap above the home line (lever homeGap, 0 to 24). */
    val homeGap: Dp = 6.dp
    /** P17: padding inside the capsule; four segments of 87.5x48. */
    val tabPadding: Dp = 4.dp

    /** P2: gap under the culture menu, so the control sits at y 113. */
    val horizonGap: Dp = 7.dp
    /** P2: the horizon control's height. */
    val horizonH: Dp = 44.dp
    /** P2: padding inside the capsule; four segments of 88x38. */
    val horizonPadding: Dp = 3.dp

    /** P3: horizontal padding inside the culture menu. */
    val menuPadding: Dp = 14.dp
    /** P3: the accent square and the gap after it. */
    val menuSquare: Dp = 8.dp
    val menuSquareGap: Dp = 8.dp

    /** P55: the round back button. */
    val backSize: Dp = 44.dp
    /** P55: lever backLabel; the canvas default is the chevron alone. */
    const val backTitled = false

    /** P56: the bottom accessory sits this far above the tab bar (692 = 748 - 8 - 48). */
    val accessoryGap: Dp = 8.dp
    /** P56: the accessory's height. */
    val accessoryH: Dp = 48.dp
    /** P56: padding inside the capsule; two sides of 174.5x40. */
    val accessoryPadding: Dp = 4.dp
    /** P56: horizontal padding inside each side. */
    val accessorySidePadding: Dp = 16.dp
    /** P56: the rule between the sides, 1x24. */
    val accessoryRuleH: Dp = 24.dp
    /** P56: the gap between a side's chevron and its label. */
    val accessoryChevronGap: Dp = 8.dp

    /** Content top: the chrome's bottom plus this (189 under P2, 138 without). */
    val contentGap: Dp = 32.dp
    /** P20: the scroll edge runs this far past the chrome's bottom (173, 122). */
    val edgeOverhang: Dp = 16.dp

    /**
     * P3: width by culture, whole points, never under Egypt's 104, right edge
     * at 374 (Round 6, `report-r6.md`).
     */
    fun menuWidth(culture: AncientCulture): Dp = when (culture) {
        AncientCulture.EGYPT, AncientCulture.ROME -> 104.dp
        AncientCulture.GREECE, AncientCulture.CANAAN -> 113.dp
        AncientCulture.CARTHAGE -> 129.dp
    }

    /** The bottom of the top chrome: 106 on a tab or pushed screen, 157 with P2. */
    fun chromeBottom(top: Dp, horizon: Boolean): Dp =
        top + barH + if (horizon) horizonGap + horizonH else 0.dp
}

/**
 * The glass and its states, as the canvas draws them. The lens tier adds the
 * library's refraction to these numbers; the other two tiers are these numbers.
 */
object GlassInk {
    /** Glass fill rgba(24,21,16,.80) (lever glassAlpha, .4 to .95). */
    const val glassAlpha = 0.80f
    val fill = Color(24, 21, 16).copy(alpha = glassAlpha)

    /**
     * The tint tier's fill. With no blur beneath, a dim label can sit over a
     * bone stroke of the content: at .80 that is 3.45:1, at .90 it is 4.64:1
     * (GlassContrastTest). The canvas measured .80 over blurred text only.
     */
    const val tintAlpha = 0.90f
    val tintFill = Color(24, 21, 16).copy(alpha = tintAlpha)

    /**
     * Backdrop blur 24 is a CSS standard deviation; Android's blur radius
     * becomes a deviation of 0.57735 * r + 0.5 (Skia), so r = (24 - 0.5) / 0.57735.
     */
    val blurRadius: Dp = 40.7.dp
    /** Saturate 1.5: the library's vibrancy() is exactly this. */
    const val saturation = 1.5f

    /**
     * The lens on API 33+. The canvas has no refraction (CSS cannot draw one);
     * these are the library catalog's LiquidButton values, a starting point
     * for the owner to steer.
     */
    val lensHeight: Dp = 12.dp
    val lensAmount: Dp = 24.dp

    /** Inset 0 1px 0 rgba(255,255,255,.16). */
    val highlight = Color.White.copy(alpha = 0.16f)
    /** Inset 0 0 0 1px rgba(230,222,204,.14). */
    val hairline = Bone.copy(alpha = 0.14f)
    /**
     * 0 10px 30px rgba(0,0,0,.45). A CSS blur of 30 is a deviation of 15;
     * as an Android shadow-layer radius that is (15 - 0.5) / 0.57735.
     */
    val shadow = Color.Black.copy(alpha = 0.45f)
    val shadowRadius: Dp = 25.1.dp
    val shadowY: Dp = 10.dp

    /** The lit tab and lit segment: rgba(230,222,204,.14), highlight .18. */
    val thumb = Bone.copy(alpha = 0.14f)
    val thumbHighlight = Color.White.copy(alpha = 0.18f)
    /** P163 to P167, P169, P170: rgba(230,222,204,.26), highlight .24. */
    val pressed = Bone.copy(alpha = 0.26f)
    val pressedHighlight = Color.White.copy(alpha = 0.24f)
    /** P168: a side that cannot be tapped. */
    const val disabledAlpha = 0.4f
    /** P3's chevron stroke; P55's and P56's chevrons stroke the same. */
    val chevronStroke: Dp = 1.2.dp
    /** P56: the rule between the switcher's sides, rgba(230,222,204,.16). */
    val accessoryRule = Bone.copy(alpha = 0.16f)

    /** Web's `:focus-visible`: a 1px accent outline, 2px out (globals.css). */
    val focusWidth: Dp = 1.dp
    val focusOffset: Dp = 2.dp
}

/**
 * How the glass is drawn on this phone. Android has no system glass, so the
 * look comes from Kyant0/AndroidLiquidGlass where the platform can run it.
 */
enum class GlassTier {
    /** API 33+: the library's lens (an AGSL shader) over blur 24 and saturate 1.5. */
    LENS,
    /** API 31 and 32: RenderEffect blur 24 and saturate 1.5, no lens. */
    BLUR,
    /** API 26 to 30: no backdrop effect; the fill at [GlassInk.tintAlpha]. */
    TINT;

    companion object {
        fun forSdk(sdk: Int): GlassTier = when {
            sdk >= Build.VERSION_CODES.TIRAMISU -> LENS
            sdk >= Build.VERSION_CODES.S -> BLUR
            else -> TINT
        }
    }
}

/**
 * The tier the chrome draws. The phone's own by default; a screenshot test
 * sets it to render each tier on one JVM.
 */
val LocalGlassTier = staticCompositionLocalOf { GlassTier.forSdk(Build.VERSION.SDK_INT) }

/**
 * The canvas IDs drawn pressed, for the screenshot run that photographs the
 * proposed states P163 to P170 as the spec boards show them. A tab is
 * "P163.sky", a segment "P166.week", a switcher side "P167.next".
 */
val LocalPressedPreview = staticCompositionLocalOf { emptySet<String>() }
