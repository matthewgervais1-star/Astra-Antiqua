package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.assertIsFocused
import androidx.compose.ui.test.getUnclippedBoundsInRoot
import androidx.compose.ui.test.performSemanticsAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Assert.assertTrue
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode
import java.io.File
import kotlin.math.abs

/**
 * Sky Season at 390x844 dp for the canvas's sample state (2026-10-21 06:00 UTC,
 * read in Rome, the smoke birth), at rest and at Glass-Season-scrolled's 256,
 * checked against the board's table (report-r3b.md, P32 to P42 and P54). The
 * chrome must sit within 1 dp; every gap between blocks must equal the board's;
 * the boxes are listed with every difference, since web's copy is not the board's.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class SkySeasonScreenshotTest {

    companion object {
        private val out = File("build/outputs/roborazzi/sky-season")

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

    /** Glass-Season's content at rest (report-r3b.md). */
    private val content = mapOf(
        "P32" to Rect(24f, 189f, 342f, 17.6f),
        "P33" to Rect(178f, 230.6f, 34f, 34f),
        "P34" to Rect(24f, 280.6f, 342f, 35.1f),
        "P35" to Rect(24f, 337.7f, 342f, 23f),
        "P36" to Rect(24f, 386.7f, 342f, 59.4f),
        "P37" to Rect(24f, 482.1f, 342f, 11f),
        "P38" to Rect(24f, 509.1f, 342f, 23.2f),
        "P39" to Rect(24f, 542.3f, 342f, 112.2f),
        "P54" to Rect(135f, 670.4f, 120f, 120f),
        "P40" to Rect(24f, 826.4f, 342f, 11f),
        "P41" to Rect(24f, 841.4f, 342f, 79.9f),
        "P42" to Rect(24f, 921.3f, 342f, 156.4f),
    )

    /** The board's gap from each block's bottom to the next one's top (report-r3b.md, "Gap below"). */
    private val boardGaps = listOf(
        Triple("P32", "P33", 24f), Triple("P33", "P34", 16f), Triple("P34", "P35", 22f),
        Triple("P35", "P36", 26f), Triple("P36", "P37", 36f), Triple("P37", "P38", 16f),
        Triple("P38", "P39", 10f), Triple("P39", "P54", 15.9f), Triple("P54", "P40", 36f),
        Triple("P40", "P41", 4f), Triple("P41", "P42", 0f),
    )

    private lateinit var state: ScrollState

    private fun render(name: String, culture: AncientCulture, scroll: Int, withChart: Boolean = true, fontScale: Float = 1f) {
        val engine = AstronomyEngine()
        val asc = if (withChart) CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth).ascendant else null
        val season = SkySeasonComposer.compose(engine, culture, SkyDayTest.sampleNow, asc)
        compose.setContent {
            val base = LocalDensity.current
            androidx.compose.runtime.CompositionLocalProvider(LocalDensity provides androidx.compose.ui.unit.Density(base.density, fontScale)) {
                AstraAntiquaTheme(selectedCulture = culture) {
                    state = rememberScrollState(with(LocalDensity.current) { scroll.dp.roundToPx() })
                    SkySeasonFrame(culture = culture, season = season, scrollState = state)
                }
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

    private fun note(text: String) = File(out, "placement.txt").appendText("$text\n")

    private fun gaps(name: String, pairs: List<Triple<String, String, Float>> = boardGaps): List<String> = pairs.mapNotNull { (a, b, want) ->
        val got = compose.onNodeWithTag(b).getUnclippedBoundsInRoot().top.value -
            compose.onNodeWithTag(a).getUnclippedBoundsInRoot().bottom.value
        "%s gap %s to %s want %.1f got %.1f".format(name, a, b, want, got)
            .also { note(it) }
            .takeIf { abs(got - want) > 1f }
    }

    private fun assertChrome(name: String) {
        val misses = measure(name, chrome)
        assertTrue("chrome off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    @Test
    fun skySeasonAtRest() {
        render("sky-season", AncientCulture.EGYPT, 0)
        assertChrome("sky-season")
        measure("sky-season", content)
        // The season's third row (the close) has no board ID.
        val third = compose.onNodeWithTag("row-3").getUnclippedBoundsInRoot()
        note("sky-season row-3 (no board ID) got %.1f, %.1f · %.1fx%.1f".format(third.left.value, third.top.value, (third.right - third.left).value, (third.bottom - third.top).value))
        val density = RuntimeEnvironment.getApplication().resources.displayMetrics.density
        note("sky-season page scrolls to %.1f (board 352)".format(state.maxValue / density))
        val misses = gaps("sky-season") + gaps("sky-season", listOf(Triple("P42", "row-3", 0f)))
        assertTrue("gaps off the board's by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
        compose.onNodeWithText("THE SEASON OF THE SCALES").assertExists()
        compose.onNodeWithText("DAY 29 OF 31 · CLOSING").assertExists()
        compose.onNodeWithText("The eleventh house · The Assembly").assertExists()
        compose.onNode(hasContentDescription("Your houses: the Sun in the eleventh house, The Assembly")).assertExists()
        // The wheel keeps the board's box: centred, 120 across.
        val wheel = compose.onNodeWithTag("P54").getUnclippedBoundsInRoot()
        assertTrue(
            "$wheel",
            abs(wheel.left.value - 135f) <= 1f && abs((wheel.right - wheel.left).value - 120f) <= 1f && abs((wheel.bottom - wheel.top).value - 120f) <= 1f,
        )
        compose.onNode(hasContentDescription("3 oct isis stationed retrograde")).assertExists()
    }

    @Test
    fun skySeasonLargeFont() {
        // At 1.3 the day line wraps inside the width the dates leave and its row grows;
        // the gaps around the bar still hold, so nothing draws over the bar or the blurb.
        render("sky-season-font-130", AncientCulture.EGYPT, 0, fontScale = 1.3f)
        val misses = gaps("sky-season-font-130", boardGaps.take(4))
        assertTrue("gaps off the board's by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
        val status = compose.onNodeWithTag("season-status").getUnclippedBoundsInRoot()
        val bar = compose.onNodeWithTag("P35").getUnclippedBoundsInRoot()
        note("sky-season-font-130 P35 height %.1f, day line %.1f tall".format((bar.bottom - bar.top).value, (status.bottom - status.top).value))
        assertTrue("the day line overflows the bar's block", status.bottom <= bar.bottom)
    }

    @Test
    fun aDpadReachesTheLastRow() {
        // Nothing on the page is tappable; each block takes D-pad focus and the scroll
        // brings the focused one into view, so the season's last row can be reached.
        render("sky-season-focus", AncientCulture.EGYPT, 0)
        compose.onNodeWithTag("row-3").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.RequestFocus)
        compose.waitForIdle()
        compose.onNodeWithTag("row-3").assertIsFocused()
        val row = compose.onNodeWithTag("row-3").getUnclippedBoundsInRoot()
        val density = RuntimeEnvironment.getApplication().resources.displayMetrics.density
        note("sky-season-focus scrolled to %.1f, row-3 bottom %.1f".format(state.value / density, row.bottom.value))
        assertTrue("the focused row is still under the tab bar: ${row.bottom}", state.value > 0 && row.bottom.value <= 748f)
    }

    @Test
    fun skySeasonScrolled() {
        render("sky-season-scrolled", AncientCulture.EGYPT, 256)
        assertChrome("sky-season-scrolled")
        measure("sky-season-scrolled", content.mapValues { (_, r) -> r.copy(y = r.y - 256f) })
        val misses = gaps("sky-season-scrolled")
        assertTrue("gaps off the board's by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    @Test
    fun skySeasonRome() {
        // Rome sets the title in Cinzel and keeps its house group, "via", in web's sentence.
        render("sky-season-rome", AncientCulture.ROME, 0)
        assertChrome("sky-season-rome")
        compose.onNode(hasContentDescription("23 sep sol into the scales, season opens")).assertExists()
        compose.onNodeWithText(
            "The season sits in your eleventh house, which this culture keeps under via. It works on your allies, your assembly, and the things you hope for.",
        ).assertExists()
    }

    @Test
    fun skySeasonWithoutAChart() {
        // No birth record: web's WHAT IT TOUCHES sentence for the sky, no house and no wheel.
        render("sky-season-no-chart", AncientCulture.EGYPT, 0, withChart = false)
        assertChrome("sky-season-no-chart")
        compose.onNodeWithText("WHAT IT TOUCHES").assertExists()
        compose.onNodeWithText("Horus the Red enters the Lion on 28 SEP. Sebegu enters the Scorpion on 30 SEP.").assertExists()
        compose.onNodeWithTag("P54").assertDoesNotExist()
        val misses = gaps("sky-season-no-chart", listOf(Triple("P37", "P39", 16f), Triple("P39", "P40", 36f), Triple("P40", "P41", 4f)))
        assertTrue("gaps off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }
}
