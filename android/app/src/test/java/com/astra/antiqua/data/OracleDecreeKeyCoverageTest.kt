package com.astra.antiqua.data

import com.astra.antiqua.domain.ZodiacSign
import com.astra.antiqua.model.ClassicalPlanet
import java.io.File
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Coverage test for `assets/oracle_decrees.json`, the JSON store
 * `OracleRepository.getDecree` reads a "PLANET_SIGN" entry from and silently
 * returns null for on a miss.
 *
 * The asset needs a `Context` to open via `context.assets`, which a plain JVM
 * test doesn't have. Rather than moving this to `androidTest` (an emulator/
 * device dependency just to read a bundled JSON file), `OracleRepository` was
 * refactored to take an `InputStream` (`decreeFromStream`) so this test can
 * feed it the packaged file straight off disk. Gradle's `Test` task runs with
 * the module directory (`app/`) as its working directory, so the asset is
 * reachable at the relative path below without any sourceSet changes.
 */
class OracleDecreeKeyCoverageTest {

    private val assetFile = File("src/main/assets/oracle_decrees.json")

    private val pantheons = listOf("GREECE", "EGYPT", "CANAAN", "CARTHAGE", "ROME")

    @Test
    fun `every planet by sign by pantheon combination resolves to non-blank content`() {
        assertTrue("Expected to find ${assetFile.path}", assetFile.exists())

        for (planet in ClassicalPlanet.values()) {
            for (sign in ZodiacSign.values()) {
                // Mid-sign degree so ZodiacUtils.getZodiacSign(degree) inside
                // decreeFromStream resolves back to this exact sign.
                val degree = sign.ordinal * 30.0 + 15.0

                for (pantheon in pantheons) {
                    val content = assetFile.inputStream().use { inputStream ->
                        OracleRepository.decreeFromStream(inputStream, planet, degree, pantheon)
                    }

                    val label = "$pantheon/${planet.name}_${sign.name}"
                    assertTrue("Missing decree for $label", content != null)
                    assertTrue("Blank deity_name for $label", content!!.deity_name.isNotBlank())
                    assertTrue("Blank epitheton for $label", content.epitheton.isNotBlank())
                    assertTrue("Blank decree for $label", content.decree.isNotBlank())
                }
            }
        }
    }
}
