package com.astra.antiqua.ui

import com.astra.antiqua.domain.ScriptForms
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.nio.ByteBuffer

/**
 * Every code point of every script form has a glyph in the face that draws
 * it (ui/components/ScriptName.kt picks the face). A missing glyph would fall
 * through to the platform font, or to a tofu box, mid-name. Reads each TTF's
 * cmap directly: format 4 for the BMP, format 12 for the supplementary planes
 * where the hieroglyphs, Ugaritic and Phoenician live.
 */
class ScriptFontCoverageTest {

    private val fontDir = File("src/main/res/font")

    private val faces = mapOf(
        AncientCulture.EGYPT to "noto_sans_egyptian_hieroglyphs.ttf",
        AncientCulture.GREECE to "gfs_didot.ttf",
        AncientCulture.CANAAN to "noto_sans_ugaritic.ttf",
        AncientCulture.CARTHAGE to "noto_sans_phoenician.ttf",
        AncientCulture.ROME to "cinzel_regular.ttf",
    )

    private fun scriptsOf(culture: AncientCulture): List<String> =
        (Planet.entries.map { ScriptForms.deity(culture, it) } +
            ScriptForms.cultureName(culture) +
            ScriptForms.institution(culture)).mapNotNull { it.script }

    @Test
    fun everyScriptCodePointHasAGlyph() {
        for ((culture, file) in faces) {
            val mapped = cmapOf(File(fontDir, file).readBytes())
            val codePoints = scriptsOf(culture).flatMap { s -> s.codePoints().toArray().toList() }.toSortedSet()
            assertTrue("$culture has no script forms", codePoints.isNotEmpty())
            val missing = codePoints.filterNot { it in mapped }.map { "U+%04X".format(it) }
            assertEquals("$culture code points missing from $file", emptyList<String>(), missing)
        }
    }

    @Test
    fun theDidotCoversPolytonicGreek() {
        val mapped = cmapOf(File(fontDir, "gfs_didot.ttf").readBytes())
        // Ἥ (U+1F2D) and ῆ (U+1FC6) from Ἥλιος and Ἑρμῆς, the letters web's greek subset lacked.
        assertTrue(0x1F2D in mapped)
        assertTrue(0x1FC6 in mapped)
    }

    /** The code points with a non-zero glyph in a TrueType font's cmap. */
    private fun cmapOf(bytes: ByteArray): Set<Int> {
        val buf = ByteBuffer.wrap(bytes)
        val numTables = buf.getShort(4).toInt() and 0xFFFF
        var cmap = -1
        for (i in 0 until numTables) {
            val record = 12 + 16 * i
            val tag = String(bytes, record, 4, Charsets.ISO_8859_1)
            if (tag == "cmap") cmap = buf.getInt(record + 8)
        }
        check(cmap >= 0) { "no cmap table" }
        val out = HashSet<Int>()
        val subtables = buf.getShort(cmap + 2).toInt() and 0xFFFF
        for (i in 0 until subtables) {
            val sub = cmap + buf.getInt(cmap + 4 + 8 * i + 4)
            when (buf.getShort(sub).toInt() and 0xFFFF) {
                4 -> readFormat4(buf, sub, out)
                12 -> readFormat12(buf, sub, out)
            }
        }
        return out
    }

    private fun readFormat4(buf: ByteBuffer, sub: Int, out: MutableSet<Int>) {
        val segX2 = buf.getShort(sub + 6).toInt() and 0xFFFF
        val ends = sub + 14
        val starts = ends + segX2 + 2
        val deltas = starts + segX2
        val rangeOffsets = deltas + segX2
        for (s in 0 until segX2 / 2) {
            val end = buf.getShort(ends + 2 * s).toInt() and 0xFFFF
            val start = buf.getShort(starts + 2 * s).toInt() and 0xFFFF
            val delta = buf.getShort(deltas + 2 * s).toInt()
            val rangeOffset = buf.getShort(rangeOffsets + 2 * s).toInt() and 0xFFFF
            for (c in start..end) {
                if (c == 0xFFFF) break
                val glyph = if (rangeOffset == 0) {
                    (c + delta) and 0xFFFF
                } else {
                    val raw = buf.getShort(rangeOffsets + 2 * s + rangeOffset + 2 * (c - start)).toInt() and 0xFFFF
                    if (raw == 0) 0 else (raw + delta) and 0xFFFF
                }
                if (glyph != 0) out += c
            }
        }
    }

    private fun readFormat12(buf: ByteBuffer, sub: Int, out: MutableSet<Int>) {
        val groups = buf.getInt(sub + 12)
        for (g in 0 until groups) {
            val base = sub + 16 + 12 * g
            val start = buf.getInt(base)
            val end = buf.getInt(base + 4)
            val startGlyph = buf.getInt(base + 8)
            for (c in start..end) if (startGlyph + (c - start) != 0) out += c
        }
    }
}
