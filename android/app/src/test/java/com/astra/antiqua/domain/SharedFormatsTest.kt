package com.astra.antiqua.domain

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.util.Date

/**
 * [SharedFormat] over every pair in shared/goldens/formats.json (web's
 * `fmt`, exported by web/scripts/export-strings.mjs): the month end, the
 * year end, the local day against the UTC day, and the zero and plural counts
 * of the plan's Review Focus 1, 2 and 4.
 */
class SharedFormatsTest {

    private fun golden(): JsonObject {
        val text = javaClass.getResource("/formats.json")?.readText(Charsets.UTF_8)
            ?: error("formats.json is not on the test classpath (build.gradle.kts test resources)")
        return Json.parseToJsonElement(text).jsonObject
    }

    private val isoInstant = Regex("""^\d{4}-\d{2}-\d{2}T""")

    private fun input(e: JsonElement): Any = when (e) {
        is JsonArray -> e.map { input(it) }
        is JsonPrimitive -> when {
            e.isString && isoInstant.containsMatchIn(e.content) -> Date.from(Instant.parse(e.content))
            e.isString -> e.content
            e.booleanOrNull != null -> e.booleanOrNull!!
            else -> e.doubleOrNull ?: error("unreadable input $e")
        }
        else -> error("unreadable input $e")
    }

    @Test
    fun `every format pair in the golden prints as web prints it`() {
        val cases = golden().getValue("cases").jsonArray
        assertTrue("the golden holds cases", cases.size > 50)
        val failures = mutableListOf<String>()
        for (c in cases) {
            val o = c.jsonObject
            val name = o.getValue("name").jsonPrimitive.content
            val zone = ZoneId.of(o.getValue("zone").jsonPrimitive.content)
            val expected = o.getValue("out").jsonPrimitive.content
            val got = SharedFormat.format(name, input(o.getValue("input")), zone)
            if (got != expected) failures += "$name ${o.getValue("input")} in $zone: expected \"$expected\", got \"$got\""
        }
        assertEquals(failures.joinToString("\n"), 0, failures.size)
    }
}
