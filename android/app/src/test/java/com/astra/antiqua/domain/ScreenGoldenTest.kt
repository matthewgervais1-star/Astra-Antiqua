package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.util.Date
import java.util.TimeZone

/**
 * Android's composers against web's screen goldens (shared/goldens/screens,
 * written by web/scripts/export-screen-goldens.mjs from web/src/lib/screens):
 * for every case in day.json, week.json and season.json, the slot map the
 * Sky screens draw from equals the golden, character for character.
 *
 * A slot Android has not built yet is listed in the builder's NOT_BUILT set
 * and skipped by name; the run prints the list. Any other difference fails,
 * a slot Android prints that the golden lacks included.
 */
class ScreenGoldenTest {

    private val engine = AstronomyEngine()

    private fun golden(screen: String): JsonObject {
        val text = javaClass.getResource("/screens/$screen.json")?.readText(Charsets.UTF_8)
            ?: error("screens/$screen.json is not on the test classpath (build.gradle.kts test resources)")
        return Json.parseToJsonElement(text).jsonObject
    }

    private fun value(e: JsonElement): Any = when (e) {
        is JsonArray -> e.map { it.jsonPrimitive.content }
        is JsonPrimitive -> e.content
        else -> error("unreadable slot $e")
    }

    private data class Case(val id: String, val culture: AncientCulture, val now: Date, val zone: ZoneId, val smoke: Boolean, val slots: Map<String, Any>)

    private fun cases(screen: String): List<Case> = golden(screen).getValue("cases").jsonArray.map { c ->
        val o = c.jsonObject
        Case(
            id = o.getValue("id").jsonPrimitive.content,
            culture = AncientCulture.valueOf(o.getValue("culture").jsonPrimitive.content.uppercase()),
            now = Date.from(Instant.parse(o.getValue("instant").jsonPrimitive.content)),
            zone = ZoneId.of(o.getValue("zone").jsonPrimitive.content),
            smoke = o["birth"].let { it is JsonPrimitive && it.isString && it.content == "smoke" },
            slots = o.getValue("slots").jsonObject.mapValues { value(it.value) },
        )
    }

    /** Runs [block] with the JVM's default zone set to [zone], as a reader there would see it. */
    private fun <T> inZone(zone: ZoneId, block: () -> T): T {
        val saved = TimeZone.getDefault()
        TimeZone.setDefault(TimeZone.getTimeZone(zone))
        return try {
            block()
        } finally {
            TimeZone.setDefault(saved)
        }
    }

    private fun smokeChart(): NatalChartData = CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth)

    private fun compare(screen: String, notBuilt: Set<String>, build: (Case) -> SlotMap) {
        val all = cases(screen)
        assertTrue("$screen.json holds the plan's ten cases", all.size >= 10)
        val failures = mutableListOf<String>()
        val skipped = sortedSetOf<String>()
        for (case in all) {
            val got = inZone(case.zone) { build(case) }.values
            for ((key, want) in case.slots) {
                if (key in notBuilt) {
                    skipped += key
                    continue
                }
                val have = got[key]
                if (have != want) failures += "${case.id} $key\n    golden:  $want\n    android: $have"
            }
            for (key in got.keys - case.slots.keys) {
                failures += "${case.id} $key: Android prints a slot the golden does not have: ${got[key]}"
            }
        }
        println("ScreenGoldenTest $screen: ${all.size} cases; skipped as not built on Android: ${if (skipped.isEmpty()) "none" else skipped.joinToString()}")
        assertEquals("$screen slots that differ from web's golden:\n" + failures.joinToString("\n"), 0, failures.size)
    }

    @Test
    fun `Sky Day prints web's day golden`() = compare("day", SkyDaySlots.NOT_BUILT) { c ->
        val chart = if (c.smoke) smokeChart() else null
        SkyDaySlots.build(SkyDayComposer.compose(engine, c.culture, c.now, chart), c.culture, c.zone)
    }

    @Test
    fun `Sky Week prints web's week golden`() = compare("week", SkyWeekSlots.NOT_BUILT) { c ->
        SkyWeekSlots.build(SkyWeekComposer.compose(engine, c.culture, c.now), c.culture, c.zone)
    }

    @Test
    fun `Sky Season prints web's season golden`() = compare("season", SkySeasonSlots.NOT_BUILT) { c ->
        val natal = if (c.smoke) {
            SkySeasonComposer.natal(engine, smokeChart(), SkyDayTest.smokeBirth.latitude, SkyDayTest.smokeBirth.longitude)
        } else {
            null
        }
        SkySeasonSlots.build(SkySeasonComposer.compose(engine, c.culture, c.now, natal), c.culture, c.zone)
    }

    @Test
    fun `the institution a script name reveals is the catalog's`() {
        AncientCulture.entries.forEach {
            assertEquals(SharedStrings.COMMON_INSTITUTION.getValue(it), ScriptForms.institution(it).en)
        }
    }
}
