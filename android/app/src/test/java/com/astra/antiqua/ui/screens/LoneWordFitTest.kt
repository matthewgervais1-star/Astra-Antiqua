package com.astra.antiqua.ui.screens

import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.createFontFamilyResolver
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * The no-lone-word helpers on a real TextMeasurer, in a monospace face so a
 * line's width is its length: [hasLoneWord], [breakLines], [narrowerMeasure],
 * [fitWithoutLoneWord] and LongTransitsScreen's [twoLineWidth].
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35])
class LoneWordFitTest {

    private val measurer = TextMeasurer(createFontFamilyResolver(RuntimeEnvironment.getApplication()), Density(3f), LayoutDirection.Ltr)
    private val greedy = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 20.sp, lineBreak = LineBreak.Simple)
    private val balanced = greedy.copy(lineBreak = LineBreak.Heading)

    private fun width(text: String, style: TextStyle = greedy) = measurer.measure(text, style, softWrap = false).size.width
    private fun layout(text: String, style: TextStyle, maxWidth: Int) = measurer.measure(text, style, constraints = Constraints(maxWidth = maxWidth))
    private fun lines(text: String, style: TextStyle, maxWidth: Int) = layout(text, style, maxWidth).let { l -> (0 until l.lineCount).map { text.substring(l.getLineStart(it), l.getLineEnd(it)).trim() } }

    @Test
    fun `a word is a token with a letter or a digit`() {
        assertEquals(1, wordCount("· EASE"))
        assertEquals(4, wordCount("3 EXACT · 2 AHEAD"))
        assertEquals(0, wordCount("→ ·"))
    }

    @Test
    fun `hasLoneWord reads wrapped paragraphs only`() {
        // One line: no wrap, nothing alone.
        assertFalse(hasLoneWord(layout("AAAA BBBB CCCC", greedy, 10_000)))
        // Greedy at the width of two words: CCCC alone on line 2.
        assertTrue(hasLoneWord(layout("AAAA BBBB CCCC", greedy, width("AAAA BBBB") + 2)))
        // A "\n" is a deliberate break: one-line paragraphs pass, even of one word.
        assertFalse(hasLoneWord(layout("AAAA\nBBBB CCCC", greedy, 10_000)))
        // A wrapped paragraph after a "\n" is still checked.
        assertTrue(hasLoneWord(layout("AAAA\nBBBB CCCC DDDD", greedy, width("BBBB CCCC") + 2)))
    }

    @Test
    fun `breakLines keeps two words a line or gives up`() {
        val text = "AMUN ROWS IN TIME WITH YOUR ASCENDANT"
        val max = width("YOUR ASCENDANT") + 2
        val got = breakLines(measurer, text, greedy, max, from = 3)
        assertNotNull(got)
        got!!
        assertEquals(text, got.joinToString(" "))
        assertTrue("$got", got.all { wordCount(it) >= 2 && width(it) <= max })
        assertEquals(3, got.size)
        // The range: from 1 it tries one and two lines only, and seven words need three here.
        assertNull(breakLines(measurer, text, greedy, max, from = 1))
        // The word-count gate: three words or fewer, more than fourteen, or a "\n", are left to the caller.
        assertNull(breakLines(measurer, "SEVEN DAYS WEIGHED", greedy, 10, from = 2))
        assertNull(breakLines(measurer, (1..15).joinToString(" ") { "W$it" }, greedy, 10_000, from = 2))
        assertNull(breakLines(measurer, "AMUN ROWS\nIN TIME WITH", greedy, 10_000, from = 2))
    }

    @Test
    fun `narrowerMeasure bisects to the widest fitting measure`() {
        var calls = 0
        assertEquals(500, narrowerMeasure("A B C D", 600) { calls++; it <= 500 })
        assertTrue("bisection, not a scan: $calls", calls <= 10)
        // 70% must fit; three words or fewer are skipped.
        assertNull(narrowerMeasure("A B C D", 600) { it <= 400 })
        assertNull(narrowerMeasure("A B C", 600) { true })
    }

    @Test
    fun `fitWithoutLoneWord keeps a style that fits, tightens one that does not`() {
        val title = "SEVEN DAYS WEIGHED"
        val style = balanced.copy(letterSpacing = 0.06.em)
        // Room for one line: the style as it is.
        val wide = fitWithoutLoneWord(measurer, title, style, 10_000, minSize = 18.sp)
        assertEquals(style, wide.style)
        assertNull(wide.width)
        assertNull(wide.lines)
        // Room for the line at 19sp and .04em only: three words cannot wrap without a lone word, so it shrinks.
        val max = width(title, style.copy(fontSize = 19.sp, letterSpacing = 0.04.em))
        val tight = fitWithoutLoneWord(measurer, title, style, max, minSize = 18.sp)
        assertTrue("${tight.style.fontSize}", tight.style.fontSize.value < 20f && tight.style.fontSize.value >= 18f)
        assertEquals(0.04f, tight.style.letterSpacing.value, 1e-4f)
        assertFalse(hasLoneWord(layout(title, tight.style, max)))
        // No room even at its floor: the style is given back unchanged.
        val none = fitWithoutLoneWord(measurer, title, style, max, minSize = 20.sp)
        assertEquals(style, none.style)
        assertNull(none.lines)
    }

    @Test
    fun `twoLineWidth sets a one-line title on two lines of two words or more`() {
        val title = "AMUN ROWS IN TIME WITH RA"
        val w = twoLineWidth(measurer, title, balanced, 10_000)
        assertNotNull(w)
        val got = lines(title, balanced, w!!)
        assertEquals(2, got.size)
        assertTrue("$got", got.all { wordCount(it) >= 2 })
        // A title that already wraps is left to LineBreak.Heading.
        assertNull(twoLineWidth(measurer, title, balanced, width("AMUN ROWS IN") + 2))
        // Two lines that would leave a word alone: kept on one.
        assertNull(twoLineWidth(measurer, "AA BB CCCCCCCCCCCCCCCC", balanced, 10_000))
    }
}
