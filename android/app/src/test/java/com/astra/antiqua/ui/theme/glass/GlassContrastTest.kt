package com.astra.antiqua.ui.theme.glass

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.compositeOver
import androidx.compose.ui.graphics.luminance
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.GroundCanaan
import com.astra.antiqua.ui.theme.GroundCarthage
import com.astra.antiqua.ui.theme.GroundEgypt
import com.astra.antiqua.ui.theme.GroundGreece
import com.astra.antiqua.ui.theme.GroundRome
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Text on glass holds 4.5:1 in every tier. The lens and blur tiers blur what
 * scrolls beneath, so the canvas's Round 1 table holds for them: dim 4.61 over
 * heavy text, modelled as 50% bone under the fill (report.md, "Contrast on
 * glass"). The tint tier does not blur, so its worst case is a bone stroke
 * directly beneath a dim label.
 */
class GlassContrastTest {

    private fun contrast(a: Color, b: Color): Double {
        val la = a.luminance().toDouble()
        val lb = b.luminance().toDouble()
        return (maxOf(la, lb) + 0.05) / (minOf(la, lb) + 0.05)
    }

    private val grounds = listOf(GroundEgypt, GroundGreece, GroundCanaan, GroundCarthage, GroundRome)

    @Test
    fun blurredTiersHoldTheCanvasTable() {
        // 50% bone over the ground, the canvas's "heavy text" under blur 24.
        grounds.forEach { ground ->
            val beneath = Bone.copy(alpha = 0.5f).compositeOver(ground)
            val glass = GlassInk.fill.compositeOver(beneath)
            val dim = contrast(Dim, glass)
            assertTrue("dim over blurred heavy text on $ground: $dim", dim >= 4.5)
        }
    }

    @Test
    fun tintTierHoldsOverABoneStroke() {
        val glass = GlassInk.tintFill.compositeOver(Bone)
        val dim = contrast(Dim, glass)
        println("tint tier: dim over a bone stroke at ${GlassInk.tintAlpha}: ${"%.2f".format(dim)}")
        assertTrue("dim over a bone stroke under the tint: $dim", dim >= 4.5)
    }

    @Test
    fun canvasFillAloneFailsUnblurred() {
        // Why the tint tier does not use the canvas's .80: unblurred, it fails.
        val glass = GlassInk.fill.compositeOver(Bone)
        val dim = contrast(Dim, glass)
        println("canvas fill .80 unblurred: dim over a bone stroke: ${"%.2f".format(dim)}")
        assertTrue(dim < 4.5)
    }
}
