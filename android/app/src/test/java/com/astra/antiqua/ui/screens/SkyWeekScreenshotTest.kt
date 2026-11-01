package com.astra.antiqua.ui.screens

import android.provider.Settings
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.hasAnyAncestor
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.getUnclippedBoundsInRoot
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.domain.SkyWeekComposer
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.After
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
 * Sky Week at 390x844 dp for the canvas's sample state (2026-10-21 06:00 UTC,
 * read in Rome), at rest and at Glass-Week-scrolled's 556, checked against the
 * board's table (report-r3b.md, P21 to P31 and P53; P171 from the design record
 * of 2026-10-31). The chrome must sit within 1 dp; the content is listed with
 * every difference, since the web's copy for this week is not the board's.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class SkyWeekScreenshotTest {

    companion object {
        private val out = File("build/outputs/roborazzi/sky-week")

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

    /** Glass-Week's content at rest (report-r3b.md); P171 is the Moon's box. */
    private val content = mapOf(
        "P21" to Rect(24f, 189f, 342f, 17.6f),
        "P22" to Rect(24f, 224.6f, 342f, 35.1f),
        "P23" to Rect(24f, 269.7f, 342f, 17.6f),
        "P24" to Rect(173f, 311.3f, 44f, 1f),
        "P53" to Rect(0f, 320.3f, 390f, 136f),
        "P171" to Rect(0f, 278.3f, 170f, 220f),
        "P25" to Rect(24f, 456.3f, 342f, 192.3f),
        "P26" to Rect(24f, 648.6f, 342f, 218.7f),
        "P27" to Rect(10f, 877.4f, 370f, 167f),
        "P28" to Rect(24f, 1054.3f, 342f, 166f),
        "P29" to Rect(24f, 1220.3f, 342f, 192.3f),
        "P30" to Rect(24f, 1412.6f, 342f, 192.3f),
        "P31" to Rect(24f, 1605f, 342f, 166f),
    )

    /** The same boxes [scroll] down: the text moves by all of it, the Moon by [rate] of it. */
    private fun scrolled(scroll: Float, rate: Float) = content.mapValues { (id, r) ->
        r.copy(y = r.y - scroll * (if (id == "P171") rate else 1f))
    }

    private lateinit var state: ScrollState

    private fun render(name: String, culture: AncientCulture, scroll: Int) {
        val week = SkyWeekComposer.compose(AstronomyEngine(), culture, SkyDayTest.sampleNow)
        compose.setContent {
            AstraAntiquaTheme(selectedCulture = culture) {
                state = rememberScrollState(with(LocalDensity.current) { scroll.dp.roundToPx() })
                SkyWeekFrame(culture = culture, week = week, scrollState = state)
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

    private fun setAnimationsOff(off: Boolean) = Settings.Global.putFloat(
        RuntimeEnvironment.getApplication().contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        if (off) 0f else 1f,
    )

    @After
    fun animationsOn() {
        setAnimationsOff(false)
    }

    @Test
    fun skyWeekAtRest() {
        render("sky-week", AncientCulture.EGYPT, 0)
        val chromeMisses = measure("sky-week", chrome)
        measure("sky-week", content)
        val density = RuntimeEnvironment.getApplication().resources.displayMetrics.density
        note("sky-week page scrolls to %.1f (board 1046)".format(state.maxValue / density))
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
        // The rows' heights follow the web's copy; every gap between blocks is the board's.
        val gapMisses = gaps("sky-week")
        assertTrue("gaps off the board's by more than 1 dp:\n" + gapMisses.joinToString("\n"), gapMisses.isEmpty())
        assertTrue("the Moon is not centred on the band at rest", abs(moonLead() + 42f) <= 1f)
        // A row with a figure opens it (web's headline link); an ingress row (Friday) does not.
        compose.onAllNodes(hasClickAction() and hasAnyAncestor(hasTestTag("P26"))).assertCountEquals(1)
        compose.onAllNodes(hasClickAction() and hasAnyAncestor(hasTestTag("P27"))).assertCountEquals(1)
        compose.onAllNodes(hasClickAction() and hasAnyAncestor(hasTestTag("P29"))).assertCountEquals(0)
    }

    /** The board's gap from each block's bottom to the next one's top (report-r3b.md, "Gap below"). */
    private val boardGaps = listOf(
        Triple("P21", "P22", 18f), Triple("P22", "P23", 10f), Triple("P23", "P24", 24f),
        Triple("P24", "P53", 8f), Triple("P53", "P25", 0f), Triple("P25", "P26", 0f),
        Triple("P26", "P27", 10f), Triple("P27", "P28", 10f), Triple("P28", "P29", 0f),
        Triple("P29", "P30", 0f), Triple("P30", "P31", 0f),
    )

    private fun gaps(name: String): List<String> = boardGaps.mapNotNull { (a, b, want) ->
        val got = compose.onNodeWithTag(b).getUnclippedBoundsInRoot().top.value -
            compose.onNodeWithTag(a).getUnclippedBoundsInRoot().bottom.value
        "%s gap %s to %s want %.1f got %.1f".format(name, a, b, want, got)
            .also { note(it) }
            .takeIf { abs(got - want) > 1f }
    }

    /** The Moon's top against the band's: at rest 42 above it (centre on centre, 220 against 136). */
    private fun moonLead(): Float {
        val moon = compose.onNodeWithTag("P171").getUnclippedBoundsInRoot().top.value
        val band = compose.onNodeWithTag("P53").getUnclippedBoundsInRoot().top.value
        return moon - band
    }

    @Test
    fun skyWeekScrolled() {
        render("sky-week-scrolled", AncientCulture.EGYPT, 556)
        val chromeMisses = measure("sky-week-scrolled", chrome)
        measure("sky-week-scrolled", scrolled(556f, 0.5f))
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
        // The text moved 556 and the Moon 278: it leads the band by 278 less than at rest.
        note("sky-week-scrolled P171 top minus P53 top %.1f (want -42 + 278 = 236)".format(moonLead()))
        assertTrue(abs(moonLead() - 236f) <= 1f)
    }

    @Test
    fun skyWeekMidway() {
        // The proposal's middle frame: the lit part reaches Tuesday's line.
        render("sky-week-280", AncientCulture.EGYPT, 280)
        measure("sky-week-280", mapOf("P171" to scrolled(280f, 0.5f).getValue("P171")))
        // The text moved 280 and the Moon 140, so the Moon now leads the band by 140 less.
        note("sky-week-280 P171 top minus P53 top %.1f (want -42 + 140 = 98)".format(moonLead()))
        assertTrue(abs(moonLead() - 98f) <= 1f)
    }

    @Test
    fun skyWeekReducedMotion() {
        // Animator duration scale 0: the Moon scrolls with the text.
        setAnimationsOff(true)
        render("sky-week-280-reduced-motion", AncientCulture.EGYPT, 280)
        measure("sky-week-280-reduced-motion", mapOf("P171" to scrolled(280f, 1f).getValue("P171"), "P53" to scrolled(280f, 1f).getValue("P53")))
        note("sky-week-280-reduced-motion P171 top minus P53 top %.1f (want -42)".format(moonLead()))
        assertTrue("the Moon left the text under reduced motion", abs(moonLead() + 42f) <= 1f)
    }

    @Test
    fun skyWeekRome() {
        // Rome sets the title in Cinzel and flags its days F, N and C.
        render("sky-week-rome", AncientCulture.ROME, 0)
        val chromeMisses = measure("sky-week-rome", chrome)
        assertTrue("chrome off by more than 1 dp:\n" + chromeMisses.joinToString("\n"), chromeMisses.isEmpty())
        // web's flags for the sample week: C, N, N, C, F, F, F.
        listOf("MON C", "TUE N", "WED N", "THU C", "FRI F", "SAT F", "SUN F").forEach {
            compose.onNodeWithText(it).assertExists()
        }
        compose.onNodeWithText("FASTUS AND NEFASTUS").assertExists()
    }

    @Test
    fun theDiscLightsTheRightSide() {
        // R 110 in a 170-wide box: the centre at x 60, the edges at -50 and 170.
        fun bounds(lit: Float, waxing: Boolean) = discPath(110f, 170f, lit, waxing).getBounds()
        val near = { a: Float, b: Float -> abs(a - b) < 0.5f }
        // Waxing gibbous 74%: from the terminator at 60 − 52.8 to the right edge.
        bounds(0.74f, true).let { assertTrue("$it", near(it.left, 7.2f) && near(it.right, 170f)) }
        // Waxing crescent 26%: right of the centre only.
        bounds(0.26f, true).let { assertTrue("$it", near(it.left, 60f) && near(it.right, 170f)) }
        // Waning: the mirror, the left edge at -50.
        bounds(0.74f, false).let { assertTrue("$it", near(it.left, -50f) && near(it.right, 112.8f)) }
        bounds(0.26f, false).let { assertTrue("$it", near(it.left, -50f) && near(it.right, 60f)) }
        // Half lit: a half disc; full: the whole disc; new: nothing wider than the centre line.
        bounds(0.5f, true).let { assertTrue("$it", near(it.left, 60f) && near(it.right, 170f)) }
        bounds(1f, true).let { assertTrue("$it", near(it.left, -50f) && near(it.right, 170f)) }
        // Bounds cannot tell a full half from an empty one: test points inside the disc.
        fun lit(lit: Float, waxing: Boolean, x: Float) = discPath(110f, 170f, lit, waxing).asAndroidPath().let { p ->
            val dot = android.graphics.Path().apply { addRect(x - 0.5f, 109.5f, x + 0.5f, 110.5f, android.graphics.Path.Direction.CW) }
            dot.op(p, android.graphics.Path.Op.INTERSECT)
            !dot.isEmpty
        }
        assertTrue(!lit(0f, true, 165f) && !lit(0f, true, 115f))
        assertTrue(lit(0.05f, true, 165f) && !lit(0.05f, true, 115f) && !lit(0.05f, true, -45f))
        assertTrue(lit(0.05f, false, -45f) && !lit(0.05f, false, 165f))
        assertTrue(lit(0.74f, true, 20f) && !lit(0.74f, true, 0f))
    }
}
