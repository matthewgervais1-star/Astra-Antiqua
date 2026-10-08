package com.astra.antiqua.domain

import java.io.File
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The three-letter sign labels. Web's /charts placements table
 * (`web/src/components/charts/chartFormat.ts`, `SIGN_ABBR3`) is the canonical
 * set; the parity case reads that table off disk the way
 * PlacementContentStoreTest reads `shared/content/`, from the Gradle test
 * task's working directory (`app/`), so the two surfaces cannot drift.
 */
class ZodiacSignAbbrTest {

    private val chartFormat = File("../../web/src/components/charts/chartFormat.ts")

    @Test
    fun `every sign carries the canonical abbreviation`() {
        val expected = mapOf(
            ZodiacSign.ARIES to "ARI",
            ZodiacSign.TAURUS to "TAU",
            ZodiacSign.GEMINI to "GEM",
            ZodiacSign.CANCER to "CNC",
            ZodiacSign.LEO to "LEO",
            ZodiacSign.VIRGO to "VIR",
            ZodiacSign.LIBRA to "LIB",
            ZodiacSign.SCORPIO to "SCO",
            ZodiacSign.SAGITTARIUS to "SAG",
            ZodiacSign.CAPRICORN to "CAP",
            ZodiacSign.AQUARIUS to "AQR",
            ZodiacSign.PISCES to "PSC",
        )
        assertEquals(expected, ZodiacSign.entries.associateWith { it.abbr })
    }

    @Test
    fun `the abbreviations match web's charts table`() {
        assertTrue("Expected to find ${chartFormat.path}", chartFormat.exists())
        val source = chartFormat.readText()
        val table = Regex("""SIGN_ABBR3[^=]*=\s*\{([^}]*)\}""").find(source)
            ?: error("SIGN_ABBR3 not found in ${chartFormat.path}")
        val web = Regex("""(\w+):\s*"([A-Z]{3})"""")
            .findAll(table.groupValues[1])
            .associate { it.groupValues[1] to it.groupValues[2] }

        assertEquals(12, web.size)
        assertEquals(web, ZodiacSign.entries.associate { it.signName to it.abbr })
    }
}
