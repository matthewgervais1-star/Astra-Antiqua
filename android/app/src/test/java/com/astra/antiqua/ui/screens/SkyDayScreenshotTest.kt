package com.astra.antiqua.ui.screens

import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.getUnclippedBoundsInRoot
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayComposer
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Assert.assertTrue
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import kotlin.math.abs

/**
 * Sky Day at 390x844 dp for the canvas's sample state (2026-10-21 06:00 UTC,
 * the smoke birth, read in Rome), at rest and scrolled 420 (Glass-Day's
 * scrolled frame), checked against the board's table. The chrome must sit
 * within 1 dp; the content is listed with every difference, since the web's
 * copy for this day is not the board's (Round 6, "Phase B follows the web's
 * reading").
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class SkyDayScreenshotTest {

    companion object {
        private val out = File("build/outputs/roborazzi/sky-day")

        @JvmStatic
        @BeforeClass
        fun clearTable() {
            out.mkdirs()
            File(out, "placement.txt").delete()
        }
    }

    @get:Rule
    val compose = createComposeRule()

    @get:Rule
    val zone = RomeZoneRule()

    private data class Rect(val x: Float, val y: Float, val w: Float, val h: Float)

    /** The chrome, within 1 dp (report-r7.md). */
    private val chrome = mapOf(
        "P1" to Rect(24f, 75f, 153.8f, 18f),
        "P3" to Rect(270f, 62f, 104f, 44f),
        "P2" to Rect(16f, 113f, 358f, 44f),
        "P17" to Rect(16f, 748f, 358f, 56f),
        "P20" to Rect(0f, 0f, 390f, 173f),
    )

    /** Glass-Day's content at rest (report.md, P4 to P16). */
    private val content = mapOf(
        "P4" to Rect(24f, 189f, 342f, 17.6f),
        "P5" to Rect(178f, 230.6f, 34f, 34f),
        "P6" to Rect(24f, 280.6f, 342f, 70.2f),
        "P7" to Rect(24f, 360.8f, 342f, 17.6f),
        "P8" to Rect(173f, 402.4f, 44f, 1f),
        "P9" to Rect(24f, 427.4f, 342f, 89.1f),
        "P10" to Rect(24f, 556.4f, 342f, 11f),
        "P11" to Rect(24f, 581.4f, 342f, 178.4f),
        "P12" to Rect(24f, 799.8f, 342f, 11f),
        "P13" to Rect(24f, 814.8f, 342f, 95.3f),
        "P14" to Rect(24f, 910.1f, 342f, 95.3f),
        "P15" to Rect(24f, 1045.4f, 342f, 11f),
        "P16" to Rect(24f, 1070.4f, 342f, 147.8f),
    )

    private fun render(name: String, culture: AncientCulture, scroll: Int) {
        val engine = AstronomyEngine()
        val chart = CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth)
        val day = SkyDayComposer.compose(engine, culture, SkyDayTest.sampleNow, chart)
        compose.setContent {
            AstraAntiquaTheme(selectedCulture = culture) {
                val state = rememberScrollState(with(LocalDensity.current) { scroll.dp.roundToPx() })
                SkyDayFrame(culture = culture, day = day, scrollState = state)
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "$name.png").path)
    }

    /** Writes each ID's measured box beside the table's; returns those off by more than 1 dp. */
    private fun measure(name: String, table: Map<String, Rect>): List<String> {
        val misses = mutableListOf<String>()
        val lines = table.map { (id, want) ->
            val b = compose.onNodeWithTag(id).getUnclippedBoundsInRoot()
            val got = Rect(b.left.value, b.top.value, (b.right - b.left).value, (b.bottom - b.top).value)
            val off = maxOf(abs(got.x - want.x), abs(got.y - want.y), abs(got.w - want.w), abs(got.h - want.h))
            "%s %s want %.1f, %.1f · %.1fx%.1f got %.1f, %.1f · %.1fx%.1f off %.1f".format(
                name, id, want.x, want.y, want.w, want.h, got.x, got.y, got.w, got.h, off,
            ).also { if (off > 1f) misses += it }
        }
        File(out, "placement.txt").appendText(lines.joinToString("\n", postfix = "\n"))
        return misses
    }

    @Test
    fun skyDayAtRest() {
        render("sky-day", AncientCulture.EGYPT, 0)
        val chromeMisses = measure("sky-day", chrome)
        measure("sky-day", content)
        // Rows past the board's two, when the day has them.
        listOf("row-3", "row-4").forEach { id ->
            runCatching { compose.onNodeWithTag(id).getUnclippedBoundsInRoot() }.getOrNull()?.let { b ->
                File(out, "placement.txt").appendText(
                    "sky-day %s (no board ID) got %.1f, %.1f · %.1fx%.1f\n".format(
                        id, b.left.value, b.top.value, (b.right - b.left).value, (b.bottom - b.top).value,
                    ),
                )
            }
        }
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
    }

    @Test
    fun skyDayScrolled() {
        render("sky-day-scrolled", AncientCulture.EGYPT, 420)
        val chromeMisses = measure("sky-day-scrolled", chrome)
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
    }

    @Test
    fun skyDayEnd() {
        // Scrolled past the end: the page's foot, the long transit over the tab bar.
        render("sky-day-end", AncientCulture.EGYPT, 4000)
        val chromeMisses = measure("sky-day-end", chrome)
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
    }

    @Test
    fun skyDayRome() {
        // Rome sets the headline in Cinzel (Round 6); the rest of the five cultures are step 11.
        render("sky-day-rome", AncientCulture.ROME, 0)
        val chromeMisses = measure("sky-day-rome", chrome)
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
    }
}
