package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.hasAnyAncestor
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import kotlin.math.abs

/**
 * [NoLoneWordText]'s hand-broken path on a centred text: the lines centre in
 * the full box, not in the widest line's width, and the merged tree carries
 * the original string.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class NoLoneWordTextTest {

    @get:Rule
    val compose = createComposeRule()

    private val text = "AMUN ROWS IN TIME WITH YOUR ASCENDANT"

    // Greedy in a monospace face: at 16.5 characters it leaves ASCENDANT alone, and no measure from 70% does
    // better, so the fit breaks the lines by hand: AMUN ROWS / IN TIME WITH / YOUR ASCENDANT (14 characters wide).
    private val style = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 20.sp, lineBreak = LineBreak.Simple)

    @Test
    fun aHandBrokenCentredTextCentresItsLinesInTheBox() {
        compose.setContent {
            val char = rememberTextMeasurer().measure("A", style, softWrap = false).size.width
            val box = with(LocalDensity.current) { (char * 33 / 2).toDp() }
            NoLoneWordText(
                text,
                style = style,
                color = Color.White,
                minSize = 20.sp,
                modifier = Modifier.width(box),
                textModifier = Modifier.fillMaxWidth().testTag("t"),
                textAlign = TextAlign.Center,
            )
        }
        compose.waitForIdle()
        val box = compose.onNodeWithTag("t", useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
        val node = compose.onNode(
            SemanticsMatcher.keyIsDefined(SemanticsActions.GetTextLayoutResult) and hasAnyAncestor(hasTestTag("t")),
            useUnmergedTree = true,
        ).fetchSemanticsNode()
        val layouts = mutableListOf<TextLayoutResult>()
        node.config.getOrNull(SemanticsActions.GetTextLayoutResult)!!.action!!.invoke(layouts)
        val layout = layouts.single()
        val lines = (0 until layout.lineCount).map { layout.layoutInput.text.text.substring(layout.getLineStart(it), layout.getLineEnd(it)).trim() }
        assertEquals(listOf("AMUN ROWS", "IN TIME WITH", "YOUR ASCENDANT"), lines)
        val centre = box.left + box.width / 2
        (0 until layout.lineCount).forEach { i ->
            val mid = node.boundsInRoot.left + (layout.getLineLeft(i) + layout.getLineRight(i)) / 2
            assertTrue("line $i centred at $mid, the box at $centre", abs(mid - centre) <= 1.5f)
        }
        // The merged tree reads the original string, without the breaks.
        compose.onNode(hasTestTag("t") and hasText(text)).assertExists()
    }
}
