package com.astra.antiqua.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.text
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp

/*
 * The no-lone-word rule (Matthew, 2026-11-01): a display title, label or
 * data line that wraps never leaves one word alone on a line. LineBreak.Heading
 * balances most; a text whose balanced lines still leave a word alone is set
 * here by a measured rule: first a narrower measure (the breaker then moves a
 * word down beside the lone one), then breaks chosen here, then a tighter
 * tracking, then a smaller size.
 */

/** A word: a space-separated token holding a letter or a digit; "·" and "→" are not words. */
internal fun wordCount(line: String) = line.split(' ', '\u00A0').count { t -> t.any { it.isLetterOrDigit() } }

/** True when a paragraph of [layout] wraps and one of its lines holds one word ("\n" is a deliberate break, not a wrap). */
internal fun hasLoneWord(layout: TextLayoutResult): Boolean {
    if (layout.lineCount < 2) return false
    val text = layout.layoutInput.text.text
    return (0 until layout.lineCount)
        .groupBy({ i -> text.substring(0, layout.getLineStart(i)).count { it == '\n' } }, { i -> text.substring(layout.getLineStart(i), layout.getLineEnd(i)) })
        .values
        .any { para -> para.size > 1 && para.any { wordCount(it) == 1 } }
}

/** The tracking floor, as for the votives (Matthew's popup, 2026-11-01, "Tighten tracking"). */
private const val MIN_TRACKING = 0.04f

/** A style, the measure (px) it sets in when narrowed, and the lines when [breakLines] chose them. */
internal data class LoneWordFit(val style: TextStyle, val width: Int?, val lines: List<String>? = null)

/**
 * Breaks [text] by hand into the fewest lines, from [from] up to one more,
 * that each fit [maxWidth] px and hold two words or more, the longest line
 * as short as it can be (balanced). Null when no such break exists. Used when
 * the platform's balanced breaker still leaves a word alone though a line of
 * two would fit (3 lines of 7 words: "AMUN ROWS IN / TIME WITH YOUR /
 * ASCENDANT" where "YOUR ASCENDANT" fits).
 */
internal fun breakLines(measurer: TextMeasurer, text: String, style: TextStyle, maxWidth: Int, from: Int): List<String>? {
    if (text.contains('\n')) return null
    val words = text.split(' ').filter { it.isNotEmpty() }
    if (words.size < 4 || words.size > 14) return null
    val widths = HashMap<Pair<Int, Int>, Int>()
    fun width(a: Int, b: Int) = widths.getOrPut(a to b) { measurer.measure(words.subList(a, b).joinToString(" "), style, softWrap = false).size.width }
    for (k in from..from + 1) {
        var best: List<Int>? = null
        var bestMax = Int.MAX_VALUE
        // Every way to cut the words into k runs of two or more (the cut indices).
        fun walk(start: Int, left: Int, cuts: List<Int>, worst: Int) {
            if (left == 1) {
                if (words.size - start < 2 || wordCount(words.subList(start, words.size).joinToString(" ")) < 2) return
                val w = width(start, words.size)
                if (w > maxWidth) return
                val m = maxOf(worst, w)
                if (m < bestMax) { bestMax = m; best = cuts }
                return
            }
            for (end in start + 2..words.size - 2 * (left - 1)) {
                if (wordCount(words.subList(start, end).joinToString(" ")) < 2) continue
                val w = width(start, end)
                if (w > maxWidth) break
                walk(end, left - 1, cuts + end, maxOf(worst, w))
            }
        }
        if (k >= 2) walk(0, k, emptyList(), 0)
        best?.let { cuts ->
            val bounds = listOf(0) + cuts + words.size
            return bounds.zipWithNext().map { (a, b) -> words.subList(a, b).joinToString(" ") }
        }
    }
    return null
}

/**
 * The widest measure, in px, between 70% of [maxWidth] and [maxWidth], at
 * which [fits] holds, found by bisection from 70% (which must fit) toward
 * [maxWidth] (which does not); null when 70% does not fit, or [text] has three
 * words or fewer (a narrower measure cannot give each of its lines two).
 */
internal fun narrowerMeasure(text: String, maxWidth: Int, fits: (Int) -> Boolean): Int? {
    if (wordCount(text) <= 3) return null
    var lo = maxWidth * 70 / 100
    if (lo <= 0 || !fits(lo)) return null
    var hi = maxWidth
    while (hi - lo > 1) {
        val mid = (lo + hi) / 2
        if (fits(mid)) lo = mid else hi = mid
    }
    return lo
}

/**
 * How [text] sets in [maxWidth] px with no lone word, the first that works of:
 * [style] as it is; a narrower measure ([narrowerMeasure]); the lines broken by [breakLines]; then, each with the
 * platform's break or [breakLines], the tracking stepped down by .01em to
 * .04em and, at the tightest tracking, the size stepped down by .5 to
 * [minSize] (the leading kept in proportion). [style] at [maxWidth] when
 * none does.
 */
internal fun fitWithoutLoneWord(measurer: TextMeasurer, text: String, style: TextStyle, maxWidth: Int, minSize: TextUnit): LoneWordFit {
    fun fits(s: TextStyle, w: Int = maxWidth) = !hasLoneWord(measurer.measure(text, s, constraints = Constraints(maxWidth = w)))
    // The platform's balanced break, else breaks chosen by hand, at a style.
    fun set(s: TextStyle): LoneWordFit? {
        if (fits(s)) return LoneWordFit(s, null)
        val lines = measurer.measure(text, s, constraints = Constraints(maxWidth = maxWidth)).lineCount
        return breakLines(measurer, text, s, maxWidth, lines)?.let { LoneWordFit(s, null, it) }
    }
    if (fits(style)) return LoneWordFit(style, null)
    narrowerMeasure(text, maxWidth) { w -> fits(style, w) }?.let { return LoneWordFit(style, it) }
    set(style)?.let { return it }
    val tracking = if (style.letterSpacing.isEm) style.letterSpacing.value else 0f
    var t = tracking - 0.01f
    while (t >= MIN_TRACKING - 1e-4f) {
        set(style.copy(letterSpacing = t.em))?.let { return it }
        t -= 0.01f
    }
    val tight = if (tracking > MIN_TRACKING) style.copy(letterSpacing = MIN_TRACKING.em) else style
    val base = style.fontSize.value
    var size = base - 0.5f
    while (size >= minSize.value - 1e-4f) {
        val lead = if (style.lineHeight.isSp) (style.lineHeight.value * size / base).sp else style.lineHeight
        set(tight.copy(fontSize = size.sp, lineHeight = lead))?.let { return it }
        size -= 0.5f
    }
    return LoneWordFit(style, null)
}

/**
 * A [Text] set by [fitWithoutLoneWord] in the width its [modifier] leaves;
 * [textModifier] goes on the text itself (its tag and semantics). When the
 * lines are broken by hand, the text is drawn with "\n" between them, and its
 * semantics carry the original [text] instead, so TalkBack and the default
 * (merged) finders never see the breaks. Such a text exposes no text layout
 * in the merged tree either: a check that reads the drawn lines (the
 * lone-word sweep, a centring test) must use the unmerged tree.
 */
@Composable
internal fun NoLoneWordText(
    text: String,
    style: TextStyle,
    color: Color,
    minSize: TextUnit,
    modifier: Modifier = Modifier,
    textModifier: Modifier = Modifier,
    textAlign: TextAlign = TextAlign.Unspecified,
) {
    BoxWithConstraints(modifier) {
        val measurer = rememberTextMeasurer()
        val maxPx = constraints.maxWidth
        // Measured as the Text sets it: the theme's LocalTextStyle under [style].
        val aligned = LocalTextStyle.current.merge(if (textAlign != TextAlign.Unspecified) style.copy(textAlign = textAlign) else style)
        val fit = remember(text, aligned, maxPx, minSize, measurer) { fitWithoutLoneWord(measurer, text, aligned, maxPx, minSize) }
        val measure = fit.width?.let { with(LocalDensity.current) { Modifier.widthIn(max = it.toDp()) } } ?: Modifier
        // A narrowed centred text stays centred in the full measure.
        val at = if (textAlign == TextAlign.Center) Alignment.TopCenter else Alignment.TopStart
        val place = Modifier.align(at).then(measure).then(textModifier)
        val lines = fit.lines
        if (lines == null) {
            Text(text, style = fit.style, color = color, modifier = place)
        } else {
            // A centred text fills the box, so its lines centre in the box's width, not in the widest line's.
            val centred = textAlign == TextAlign.Center
            Box(place.clearAndSetSemantics { this.text = AnnotatedString(text) }, contentAlignment = at) {
                Text(lines.joinToString("\n"), style = fit.style, color = color, modifier = if (centred) Modifier.fillMaxWidth() else Modifier)
            }
        }
    }
}
