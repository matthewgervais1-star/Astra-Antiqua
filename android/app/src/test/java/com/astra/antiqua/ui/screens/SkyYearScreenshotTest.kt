package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertIsFocused
import androidx.compose.ui.test.click
import androidx.compose.ui.test.getUnclippedBoundsInRoot
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performSemanticsAction
import androidx.compose.ui.test.performTouchInput
import androidx.compose.ui.unit.dp
import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.CalculateNatalChartUseCase
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.domain.SkyYear
import com.astra.antiqua.domain.SkyYearComposer
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Route
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
 * Sky Year at 390x844 dp for the canvas's sample state (2026-10-21 06:00 UTC,
 * read in Rome, the smoke birth), at rest and at the board's scrolled frame
 * (100), checked against the board's table (report-r3b.md, "Year", P43 to
 * P52). The chrome must sit within 1 dp; every gap between blocks must equal
 * the board's; the boxes are listed with every difference, since web's copy
 * and web's timeline are not the board's.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class SkyYearScreenshotTest {

    companion object {
        private val out = File("build/outputs/roborazzi/sky-year")

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

    /** Glass-Year's content at rest (report-r3b.md). */
    private val content = mapOf(
        "P43" to Rect(24f, 189f, 342f, 17.6f),
        "P44" to Rect(24f, 224.6f, 342f, 35.1f),
        "P45" to Rect(24f, 269.7f, 342f, 35.2f),
        "P46" to Rect(24f, 334.9f, 342f, 11f),
        "P47" to Rect(45f, 363.9f, 321f, 45.9f),
        "P48" to Rect(45f, 429.8f, 321f, 45.9f),
        "P49" to Rect(45f, 495.7f, 321f, 15.4f),
        "P50" to Rect(45f, 531f, 321f, 122.4f),
        "P51" to Rect(45f, 673.4f, 321f, 45.9f),
        "P52" to Rect(45f, 739.3f, 321f, 122.4f),
    )

    /**
     * The gaps between blocks in the page's order, each the board's: 18 under
     * the kicker, 10 under the title, the section gap 30 above a month label,
     * 18 under it, 19.9 under TODAY and 20 between rows. Web's timeline puts
     * TODAY first and opens NOV and DEC between the board's rows, so a month
     * label (30 above, 18 below) stands where the board has a row gap.
     */
    private val boardGaps = listOf(
        Triple("P43", "P44", 18f), Triple("P44", "P45", 10f), Triple("P45", "P46", 30f),
        Triple("P46", "P49", 18f), Triple("P49", "P47", 19.9f), Triple("P47", "month-2", 30f),
        Triple("month-2", "P48", 18f), Triple("P48", "P50", 20f), Triple("P50", "month-3", 30f),
        Triple("month-3", "P51", 18f), Triple("P51", "P52", 20f), Triple("P52", "row-6", 20f),
    )

    /** Why each content box differs from the board's, written under the at-rest table. */
    private val reasons = linkedMapOf(
        "P43" to "18.3 against 17.6: the script face's line, as Day's P4; web's kicker \"FROM 21 OCT 2026 · THE HALL OF MA’AT\" on one line as the board's",
        "P44" to "75.3 against 35.1: web's title \"MMXXVI · THE YEAR OF THE RIVER\" on two lines, each 37.6 for Spectral SC's glyphs (as Season's P34); the board's \"The year ahead\" takes one",
        "P45" to "web's count \"70 TURNINGS · …\" on two lines as the board's \"72 TURNINGS\"; sits 41.0 lower, under P44's second line",
        "P46" to "web's first month label \"OCT 2026\", as the board's; 41.1 lower",
        "P49" to "TODAY leads October: web's timeline starts at the instant, so no row sits above it (the board shows 3 OCT and 16 OCT above); 15.7 for IBM Plex Mono's glyphs at 11 over CSS's 15.4 line",
        "P47" to "web's first row, 24 OCT MERCURY TURNS RETROGRADE: a station, so no prose line (the board's station sentence has no web source, CANNOT CONFIRM in the catalog); 15.7 against 45.9",
        "P48" to "web's 13 NOV MERCURY TURNS DIRECT under its own NOV 2026 label (30 above, 18 below); no prose line",
        "P50" to "web's 14 NOV VENUS TURNS DIRECT: no prose line, 15.7 against the board's two-line ingress 122.4",
        "P51" to "web's 11 DEC SATURN TURNS DIRECT under DEC 2026; no prose line",
        "P52" to "web's 12 DEC NEPTUNE TURNS DIRECT: no prose line, 15.7 against 122.4; 16 more rows follow (row-6 to row-21), one ingress among them with web's prose",
    )

    private lateinit var state: ScrollState
    private lateinit var shown: SkyYear
    private val routes = mutableListOf<String>()
    private val opened = mutableListOf<String>()
    private lateinit var focus: androidx.compose.ui.focus.FocusManager
    private lateinit var inputMode: androidx.compose.ui.input.InputModeManager

    private val density get() = RuntimeEnvironment.getApplication().resources.displayMetrics.density

    private fun composeYear(culture: AncientCulture, withChart: Boolean, now: java.util.Date = SkyDayTest.sampleNow): SkyYear {
        val engine = AstronomyEngine()
        val natal = if (withChart) {
            SkySeasonComposer.natal(engine, CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth), SkyDayTest.smokeBirth.latitude, SkyDayTest.smokeBirth.longitude)
        } else {
            null
        }
        return SkyYearComposer.compose(engine, culture, now, natal)
    }

    private fun render(name: String, culture: AncientCulture, scroll: Int, withChart: Boolean = true, fontScale: Float = 1f) {
        shown = composeYear(culture, withChart)
        compose.setContent {
            val base = LocalDensity.current
            androidx.compose.runtime.CompositionLocalProvider(LocalDensity provides androidx.compose.ui.unit.Density(base.density, fontScale)) {
                AstraAntiquaTheme(selectedCulture = culture) {
                    state = rememberScrollState(with(LocalDensity.current) { scroll.dp.roundToPx() })
                    focus = androidx.compose.ui.platform.LocalFocusManager.current
                    inputMode = androidx.compose.ui.platform.LocalInputModeManager.current
                    SkyYearFrame(culture = culture, year = shown, onNavigate = { routes += it }, onOpen = { opened += it }, scrollState = state)
                }
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "$name.png").path)
    }

    private fun box(id: String): Rect {
        val b = compose.onNodeWithTag(id).getUnclippedBoundsInRoot()
        return Rect(b.left.value, b.top.value, (b.right - b.left).value, (b.bottom - b.top).value)
    }

    /** Writes each ID's measured box beside the table's; returns those off by more than 1 dp. */
    private fun measure(name: String, table: Map<String, Rect>): List<String> {
        val misses = mutableListOf<String>()
        val lines = table.map { (id, want) ->
            val got = box(id)
            val off = maxOf(abs(got.x - want.x), abs(got.y - want.y), abs(got.w - want.w), abs(got.h - want.h))
            "%s %s want %.1f, %.1f · %.1fx%.1f got %.1f, %.1f · %.1fx%.1f off %.1f".format(
                name, id, want.x, want.y, want.w, want.h, got.x, got.y, got.w, got.h, off,
            ).also { if (off > 1f) misses += it }
        }
        File(out, "placement.txt").appendText(lines.joinToString("\n", postfix = "\n"))
        return misses
    }

    private fun note(text: String) = File(out, "placement.txt").appendText("$text\n")

    private fun noteBox(name: String, id: String) {
        val b = box(id)
        note("%s %s (no board ID) got %.1f, %.1f · %.1fx%.1f".format(name, id, b.x, b.y, b.w, b.h))
    }

    private fun gaps(name: String, pairs: List<Triple<String, String, Float>> = boardGaps): List<String> = pairs.mapNotNull { (a, b, want) ->
        val got = box(b).y - (box(a).y + box(a).h)
        "%s gap %s to %s want %.1f got %.1f".format(name, a, b, want, got)
            .also { note(it) }
            .takeIf { abs(got - want) > 1f }
    }

    private fun assertChrome(name: String) {
        val misses = measure(name, chrome)
        assertTrue("chrome off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    private fun assertGaps(name: String, pairs: List<Triple<String, String, Float>> = boardGaps) {
        val misses = gaps(name, pairs)
        assertTrue("gaps off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    @Test
    fun skyYearAtRest() {
        render("sky-year", AncientCulture.EGYPT, 0)
        assertChrome("sky-year")
        measure("sky-year", content)
        reasons.forEach { (id, why) -> note("sky-year $id reason: $why") }
        note("sky-year note: with a chart web prints neither the count line (P45) nor the timeline (P46 to P52); YearNave shows them only without one. Android prints both in both states because the board does.")
        listOf("month-2", "month-3", "row-6").forEach { noteBox("sky-year", it) }
        note("sky-year page scrolls to %.1f (board 136)".format(state.maxValue / density))
        assertGaps("sky-year")
        compose.onNodeWithText("MMXXVI · THE YEAR OF THE RIVER").assertExists()
        compose.onNodeWithText("70 TURNINGS · STATIONS, INGRESSES, LUNATIONS").assertExists()
        compose.onNodeWithText("TODAY · 21 OCT", useUnmergedTree = true).assertExists()
        compose.onNodeWithText("OCT 2026").assertExists()
        // Spoken without the dot or a glyph.
        compose.onNode(hasContentDescription("24 oct mercury turns retrograde")).assertExists()
        compose.onNode(hasContentDescription("Today, 21 oct")).assertExists()
        // The rows sit on the list's x 45, 321 wide, as the board's.
        listOf("P47", "P48", "P49", "P50", "P51", "P52").forEach {
            val b = box(it)
            assertTrue("$it $b", abs(b.x - 45f) <= 1f && abs(b.w - 321f) <= 1f)
        }
    }

    @Test
    fun skyYearScrolled() {
        // Glass-Year's scrolled frame: the page 100 up.
        render("sky-year-scrolled", AncientCulture.EGYPT, 100)
        assertChrome("sky-year-scrolled")
        val at = (state.value / density)
        note("sky-year-scrolled scrolled to %.1f".format(at))
        assertTrue("the page did not scroll to 100: $at", abs(at - 100f) <= 1f)
        assertGaps("sky-year-scrolled")
        assertTrue(abs(box("P43").y - (189f - 100f)) <= 1f)
    }

    @Test
    fun skyYearRome() {
        // Rome sets the title in Cinzel; the rows are the same sky, the ingress prose its own gods.
        render("sky-year-rome", AncientCulture.ROME, 0)
        assertChrome("sky-year-rome")
        compose.onNodeWithText("MMXXVI · THE GREAT CIRCUIT").assertExists()
        assertGaps("sky-year-rome", boardGaps.take(6))
    }

    @Test
    fun skyYearWithoutAChart() {
        // No birth record: the board's part is the same; web's opening is the sky-only one.
        render("sky-year-no-chart", AncientCulture.EGYPT, 0, withChart = false)
        assertChrome("sky-year-no-chart")
        assertGaps("sky-year-no-chart")
        compose.onNodeWithTag("year-segments").assertDoesNotExist()
    }

    @Test
    fun skyYearLargeFont() {
        // At 1.3 the title, the count line and the rows grow; the gaps between them hold.
        render("sky-year-font-130", AncientCulture.EGYPT, 0, fontScale = 1.3f)
        assertGaps("sky-year-font-130", boardGaps.take(7))
        note("sky-year-font-130 P44 %.1f tall, P45 %.1f, P47 %.1f".format(box("P44").h, box("P45").h, box("P47").h))
    }

    @Test
    @Config(qualifiers = "w360dp-h780dp-xxhdpi")
    fun skyYearOnA360DpPhone() {
        // 312 dp of content: the rows take 291 from x 45.
        render("sky-year-360", AncientCulture.EGYPT, 0)
        assertGaps("sky-year-360", boardGaps.take(7))
        val row = box("P47")
        note("sky-year-360 P47 got %.1f, %.1f · %.1fx%.1f".format(row.x, row.y, row.w, row.h))
        assertTrue("$row", abs(row.x - 45f) <= 1f && abs(row.w - 291f) <= 1f)
    }

    /** The web sections' order and spacing at the page's foot (YearNave's mt-8, mt-3, mt-6, mt-9; 40 under the list). */
    private fun footGaps(withChart: Boolean): List<Triple<String, String, Float>> {
        val last = yearRowId(shown.turnings.lastIndex)
        return if (withChart) {
            listOf(
                Triple(last, "year-opening", 40f), Triple("year-opening", "year-segments", 32f),
                Triple("year-segments", "year-spine", 32f), Triple("year-spine", "year-votive", 32f),
                Triple("year-votive", "year-feedback", 24f), Triple("year-feedback", "year-links", 36f),
            )
        } else {
            listOf(
                Triple(last, "year-opening", 40f), Triple("year-opening", "year-cast", 32f),
                Triple("year-cast", "year-feedback", 24f), Triple("year-feedback", "year-links", 36f),
            )
        }
    }

    @Test
    fun skyYearEnd() {
        // The page's foot: web's opening, the segments, the spine, the votive, the feedback row and the links.
        render("sky-year-end", AncientCulture.EGYPT, 6000)
        assertChrome("sky-year-end")
        listOf("year-opening", "year-segments", "segment-1", "segment-2", "segment-3", "year-spine", "year-votive", "year-feedback", "year-links").forEach {
            noteBox("sky-year-end", it)
        }
        note("sky-year-end page scrolls to %.1f".format(state.maxValue / density))
        assertGaps("sky-year-end", footGaps(withChart = true))
        compose.onNodeWithText("WEIGH THIS YEAR BEFORE\nTHE FLOOD WEIGHS IT FOR YOU").assertExists()
        compose.onNodeWithText("THE YEAR’S LONG TRANSITS · ITS SPINE").assertExists()
        compose.onNodeWithText("GEB TIPS THE SCALES AGAINST YOUR NATAL RA", useUnmergedTree = true).assertExists()
        compose.onNode(hasContentDescription("geb tips the scales against your natal ra, until nov 2027")).assertExists()
        compose.onNodeWithTag("year-cast").assertDoesNotExist()
        compose.onNodeWithTag("year-festivals").assertDoesNotExist()
        listOf("The season", "The year ahead").forEach {
            compose.onNode(hasContentDescription(it) and hasClickAction()).assertExists()
        }
        // A tap 10 dp above THE YEAR AHEAD lands (Compose widens the 18 dp line to a 48 dp touch);
        // the forecast opens on top of the year, the season is switched to.
        compose.onNode(hasContentDescription("The year ahead") and hasClickAction())
            .performTouchInput { click(Offset(centerX, -10.dp.toPx())) }
        compose.onNode(hasContentDescription("The season") and hasClickAction())
            .performTouchInput { click(Offset(centerX, -10.dp.toPx())) }
        assertTrue("$opened $routes", opened == listOf(Route.FORECAST) && routes == listOf(Route.SEASON))
        // web links each spine row to its transit. Jupiter trine the Ascendant opens its detail on
        // top; Saturn opposite the Midheaven stays a D-pad stop, as Android's transit detail walks
        // the Sun, Moon and Ascendant only.
        opened.clear()
        compose.onNodeWithTag("spine-1").assert(hasClickAction())
        compose.onNodeWithTag("spine-2").assert(androidx.compose.ui.test.hasNoClickAction())
        compose.onNodeWithTag("spine-1").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.OnClick)
        assertTrue("$opened", opened == listOf(Route.transitDetail("jupiter-trine-asc")))
        compose.onNode(hasContentDescription("The year's long transits, its spine")).assertExists()
        compose.onNode(hasContentDescription("akhet, the flood, 21 oct to 20 jan, day 1 of 92.", substring = true)).assertExists()
    }

    @Test
    fun skyYearWithoutAChartEnd() {
        // No birth record: web's CAST A CHART box, whose link opens the cast screen on top.
        render("sky-year-no-chart-end", AncientCulture.EGYPT, 6000, withChart = false)
        assertChrome("sky-year-no-chart-end")
        listOf("year-opening", "year-cast", "year-cast-link", "year-feedback", "year-links").forEach { noteBox("sky-year-no-chart-end", it) }
        note("sky-year-no-chart-end page scrolls to %.1f".format(state.maxValue / density))
        assertGaps("sky-year-no-chart-end", footGaps(withChart = false))
        compose.onNodeWithText("This is the sky alone, without a chart to carry it. Cast one, and the year gains a thread the flood can follow.").assertExists()
        compose.onNodeWithText("CAST A CHART TO READ THE YEAR AGAINST YOUR OWN SKY").assertExists()
        // The link's box is 38 tall; a tap 4 dp above it lands inside the 48 dp touch.
        val link = box("year-cast-link")
        assertTrue("$link", link.h < 48f)
        compose.onNode(hasContentDescription("Cast a chart") and hasClickAction())
            .performTouchInput { click(Offset(centerX, -4.dp.toPx())) }
        assertTrue("$opened $routes", opened == listOf(Route.READING) && routes.isEmpty())
    }

    @Test
    fun skyYearGreeceEnd() {
        // Greece's year is cut by its festivals, and web's note says so under the segments.
        render("sky-year-greece-end", AncientCulture.GREECE, 6000)
        compose.onNodeWithText(SkyYearComposer.FESTIVALS_NOTE).assertExists()
        assertGaps("sky-year-greece-end", listOf(Triple("year-segments", "year-festivals", 12f), Triple("year-festivals", "year-spine", 32f)))
    }

    @Test
    fun aDpadWalksTheTurnings() {
        // Nothing in the list is tappable; each block takes D-pad focus and the scroll brings
        // the focused one clear of the glass. From TODAY, D-pad Down walks the rows in order.
        render("sky-year-focus", AncientCulture.EGYPT, 0)
        compose.onNodeWithTag("P49").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.RequestFocus)
        compose.waitForIdle()
        val order = listOf("P47", "P48", "P50", "P51", "P52", "row-6", "row-7")
        order.forEach { id ->
            compose.runOnIdle { focus.moveFocus(androidx.compose.ui.focus.FocusDirection.Down) }
            compose.waitForIdle()
            compose.onNodeWithTag(id).assertIsFocused()
        }
        compose.onRoot().captureRoboImage(File(out, "sky-year-focus.png").path)
        val row = box("row-7")
        note("sky-year-focus scrolled to %.1f, row-7 top %.1f bottom %.1f".format(state.value / density, row.y, row.y + row.h))
        assertTrue("the focused row is still under the tab bar: $row", state.value > 0 && row.y + row.h <= 748f)
        assertTrue("the focused row is under the top glass: $row", row.y >= 173f - 1f)
    }

    @Test
    fun aDpadReachesTheSpineClearOfTheGlass() {
        // The spine rows that open a transit take focus through their click; they still ask the
        // scroll to show them clear of the glass. From the last segment, D-pad Down lands on spine-1.
        render("sky-year-spine-focus", AncientCulture.EGYPT, 0)
        // A D-pad press leaves touch mode; a clickable takes focus only outside it.
        compose.runOnIdle { inputMode.requestInputMode(androidx.compose.ui.input.InputMode.Keyboard) }
        compose.onNodeWithTag("segment-3").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.RequestFocus)
        compose.waitForIdle()
        compose.runOnIdle { focus.moveFocus(androidx.compose.ui.focus.FocusDirection.Down) }
        compose.waitForIdle()
        compose.onNodeWithTag("spine-1").assertIsFocused()
        val row = box("spine-1")
        note("sky-year-spine-focus scrolled to %.1f, spine-1 top %.1f bottom %.1f".format(state.value / density, row.y, row.y + row.h))
        assertTrue("spine-1 sits under the tab bar: $row", row.y + row.h <= 748f + 0.5f)
        assertTrue("spine-1 sits under the top glass: $row", row.y >= 173f - 0.5f)
    }
}
