package com.astra.antiqua.ui.screens

import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.semantics.SemanticsNode
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.semantics.getOrNull
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.junit4.ComposeTestRule
import androidx.compose.ui.text.TextLayoutResult
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.theme.Spectral
import org.junit.Assert.assertTrue
import java.io.File

/**
 * The no-lone-word rule (Matthew, 2026-11-01): a text that wraps must not
 * leave one word alone on any of its lines. Every laid-out text of the screen
 * is read from its TextLayoutResult, so the check sees the lines as drawn. A
 * word is a space-separated token holding a letter or a digit; separators such
 * as "·" and "→" are not words. A "\n" in the string is a deliberate break: each
 * paragraph is checked on its own, and a paragraph on one line passes. Prose
 * (Spectral body) may end on a short line, so its hits are listed and not
 * failed.
 */
internal object LoneWords {

    /** A lone [line] among the [lines] of its paragraph, in the text tagged (or nearest above) [tag]. */
    data class Hit(val tag: String, val line: String, val lines: List<String>, val prose: Boolean, val set: String = "") {
        override fun toString() = "${if (prose) "prose " else ""}[$tag] \"$line\" in " + lines.joinToString(" / ") { "\"${it.trim()}\"" } + " ($set)"
    }

    private fun words(line: String) = line.split(' ', '\u00A0', '\n').filter { t -> t.any { it.isLetterOrDigit() } }

    /** The nearest test tag at or above [node], for the report. */
    private fun tagOf(node: SemanticsNode): String {
        var n: SemanticsNode? = node
        while (n != null) {
            n.config.getOrNull(SemanticsProperties.TestTag)?.let { return it }
            n = n.parent
        }
        return "untagged"
    }

    /** The lone-word lines in one layout. */
    fun hitsIn(layout: TextLayoutResult, tag: String): List<Hit> {
        val text = layout.layoutInput.text.text
        if (layout.lineCount < 2) return emptyList()
        val prose = layout.layoutInput.style.fontFamily == Spectral
        val set = "%s %s in %d px".format(layout.layoutInput.style.fontSize, layout.layoutInput.style.letterSpacing, layout.layoutInput.constraints.maxWidth)
        val lines = (0 until layout.lineCount).map { i ->
            val start = layout.getLineStart(i)
            val end = layout.getLineEnd(i)
            // The paragraph a line belongs to: the "\n"s before its start.
            text.substring(0, start).count { it == '\n' } to text.substring(start, end)
        }
        return lines.groupBy({ it.first }, { it.second })
            .filterValues { it.size > 1 }
            .values.flatMap { para -> para.filter { words(it).size == 1 }.map { Hit(tag, it.trim(), para, prose, set) } }
    }

    /** Every lone-word line among the composed texts of the screen. */
    fun find(compose: ComposeTestRule): List<Hit> =
        compose.onAllNodes(SemanticsMatcher.keyIsDefined(SemanticsActions.GetTextLayoutResult), useUnmergedTree = true)
            .fetchSemanticsNodes()
            .flatMap { node ->
                val results = mutableListOf<TextLayoutResult>()
                node.config.getOrNull(SemanticsActions.GetTextLayoutResult)?.action?.invoke(results)
                results.flatMap { hitsIn(it, tagOf(node)) }
            }
            .distinct()

    /**
     * Walks [cultures] on a screen already set: for each, [select] it, then
     * check it at rest and at its end ([scroll] false, then true). Every hit is
     * written to [out]'s placement.txt under "[screen] CULTURE frame"; a hit
     * outside prose fails unless [allowed] names it by its key
     * "[screen] CULTURE [tag] line" (the value is the reason, written beside it).
     */
    fun sweep(
        compose: ComposeTestRule,
        out: File,
        screen: String,
        cultures: List<AncientCulture>,
        select: (AncientCulture) -> Unit,
        scroll: (Boolean) -> Unit,
        allowed: Map<String, String> = emptyMap(),
    ) {
        val table = File(out, "placement.txt")
        val failing = linkedSetOf<String>()
        cultures.forEach { c ->
            compose.runOnIdle { select(c) }
            compose.waitForIdle()
            listOf(false to "rest", true to "end").forEach { (end, frame) ->
                compose.runOnIdle { scroll(end) }
                compose.waitForIdle()
                val hits = find(compose)
                if (hits.isEmpty()) table.appendText("$screen ${c.name} $frame lone words: none\n")
                hits.forEach { h ->
                    val key = "$screen ${c.name} [${h.tag}] ${h.line}"
                    val why = allowed[key]
                    table.appendText("$screen ${c.name} $frame lone word $h" + (why?.let { " EXCEPTION: $it" } ?: "") + "\n")
                    if (!h.prose && why == null) failing += "$key  ($h)"
                }
            }
        }
        assertTrue("$screen: a wrapped line holds one word:\n" + failing.joinToString("\n"), failing.isEmpty())
    }
}
