package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import com.astra.antiqua.model.label
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * ScriptForms.kt is generated from web/src/data/scriptForms.ts by
 * web/scripts/gen-android-script-forms.mjs. These pins hold a few entries per
 * culture by value, so a hand edit or a stale regeneration fails here, and
 * the registry checks hold the English forms to the names Android prints.
 */
class ScriptFormsParityTest {

    private fun pin(expected: ScriptForm, actual: ScriptForm) = assertEquals(expected, actual)

    @Test
    fun institutionTitlesMatchTheLexiconHeadings() {
        for (culture in AncientCulture.entries) {
            assertEquals(
                culture.name,
                ScriptForms.institution(culture).en,
                LexiconDictionary.forCulture(culture).dashboardTitle.uppercase(java.util.Locale.ENGLISH),
            )
        }
    }

    @Test
    fun egypt() {
        pin(ScriptForm("𓇋𓏠𓈖𓁩", "Amun", "Amon"), ScriptForms.deity(AncientCulture.EGYPT, Planet.JUPITER))
        pin(ScriptForm(null, "Horus the Red", "Horus le Rouge"), ScriptForms.deity(AncientCulture.EGYPT, Planet.MARS))
        pin(ScriptForm("𓆎𓅓𓏏𓊖", "Egypt", "Égypte"), ScriptForms.cultureName(AncientCulture.EGYPT))
    }

    @Test
    fun greece() {
        pin(ScriptForm("Ἥλιος", "Helios", "Hélios"), ScriptForms.deity(AncientCulture.GREECE, Planet.SUN))
        pin(ScriptForm("Ζεύς", "Zeus", "Zeus"), ScriptForms.deity(AncientCulture.GREECE, Planet.JUPITER))
        pin(ScriptForm("Ἑλλάς", "Greece", "Grèce"), ScriptForms.cultureName(AncientCulture.GREECE))
    }

    @Test
    fun canaan() {
        val el = ScriptForms.deity(AncientCulture.CANAAN, Planet.SATURN)
        assertEquals("El", el.en)
        assertEquals("𐎛𐎍", el.script)
        pin(ScriptForm("𐎋𐎐𐎓𐎐𐎊", "Canaan", "Canaan"), ScriptForms.cultureName(AncientCulture.CANAAN))
        pin(
            ScriptForm("𐎔𐎃𐎗𐎟𐎎𐎓𐎄", "THE COUNCIL OF EL", "LE CONSEIL D’EL"),
            ScriptForms.institution(AncientCulture.CANAAN),
        )
    }

    @Test
    fun carthage() {
        assertEquals("Tanit", ScriptForms.deity(AncientCulture.CARTHAGE, Planet.MOON).en)
        assertEquals("𐤕𐤍𐤕", ScriptForms.deity(AncientCulture.CARTHAGE, Planet.MOON).script)
        pin(ScriptForm("𐤒𐤓𐤕𐤇𐤃𐤔𐤕", "Carthage", "Carthage"), ScriptForms.cultureName(AncientCulture.CARTHAGE))
        assertEquals(null, ScriptForms.institution(AncientCulture.CARTHAGE).script)
    }

    @Test
    fun rome() {
        pin(ScriptForm("IVPPITER", "Iuppiter", "Jupiter"), ScriptForms.deity(AncientCulture.ROME, Planet.JUPITER))
        pin(ScriptForm("ROMA", "Rome", "Rome"), ScriptForms.cultureName(AncientCulture.ROME))
    }

    @Test
    fun everyEnglishFormIsTheNameAndroidPrints() {
        for (culture in AncientCulture.entries) {
            for (planet in Planet.entries) {
                assertEquals("$culture $planet", DeityRegistry.getDeity(culture, planet).name, ScriptForms.deity(culture, planet).en)
            }
            assertEquals(culture.label, ScriptForms.cultureName(culture).en)
        }
    }

    @Test
    fun theGeneratedFileMatchesTheWebData() {
        // Every script string in the generated file appears verbatim in the web source.
        val web = File("../../web/src/data/scriptForms.ts").readText()
        val kotlin = File("src/main/java/com/astra/antiqua/domain/ScriptForms.kt").readText()
        val scripts = Regex("ScriptForm\\(\"([^\"]+)\"").findAll(kotlin).map { it.groupValues[1] }.toList()
        assertEquals(57, scripts.size)
        for (s in scripts) assertTrue("$s is not in scriptForms.ts", web.contains("script: \"$s\""))
        val webScripts = Regex("script: \"([^\"]+)\"").findAll(web).count()
        assertEquals("web and Android carry the same number of script forms", webScripts, scripts.size)
    }
}
