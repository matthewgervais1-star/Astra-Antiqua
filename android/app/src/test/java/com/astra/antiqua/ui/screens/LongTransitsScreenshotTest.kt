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
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.LongTransitsComposer
import com.astra.antiqua.domain.NatalPoints
import com.astra.antiqua.domain.RomeZoneRule
import com.astra.antiqua.domain.SkyDayTest
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.theme.AstraAntiquaTheme
import com.astra.antiqua.viewmodel.SpansState
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
 * TRANSITS at 390x844 dp for the canvas's sample state (2026-10-21 06:00 UTC,
 * read in Rome, the smoke birth), at rest and at the board's scrolled frame
 * (134), checked against the board's table (report-r4.md, "Transits", P57 to
 * P68; report-r7.md "Section divider", "Span timeline"). The chrome must sit
 * within 1 dp; every gap between blocks must equal the board's; the boxes are
 * listed with every difference, since web's title and web's nine spans are
 * not the board's.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [35], qualifiers = "w390dp-h844dp-xxhdpi")
class LongTransitsScreenshotTest {

    companion object {
        private val out = File("build/outputs/roborazzi/transits")

        @JvmStatic
        @BeforeClass
        fun clearTable() {
            out.mkdirs()
            File(out, "placement.txt").delete()
        }

        private val engine = AstronomyEngine()

        /** The sample's spans, walked once for every test in the class. */
        private val ready: SpansState.Ready by lazy {
            val now = SkyDayTest.sampleNow
            val chart = CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth)
            val natal = SkySeasonComposer.natal(engine, chart, SkyDayTest.smokeBirth.latitude, SkyDayTest.smokeBirth.longitude)
            SpansState.Ready(LongTransitsComposer.readerSpans(engine, natal, now), now, NatalPoints.of(chart), DayDecreeComposer.chartAt(engine, now))
        }
    }

    @get:Rule
    val compose = createComposeRule()

    @get:Rule
    val zone = RomeZoneRule()

    private data class Rect(val x: Float, val y: Float, val w: Float, val h: Float)

    /** The chrome, within 1 dp (report-r4.md lines 7 to 17): no horizon control on this page. */
    private val chrome = mapOf(
        "P1" to Rect(24f, 75f, 153.8f, 18f),
        "P3" to Rect(270f, 62f, 104f, 44f),
        "P17" to Rect(16f, 748f, 358f, 56f),
        "P20" to Rect(0f, 0f, 390f, 122f),
    )

    /** Glass-Transits' content at rest (report-r4.md). */
    private val content = linkedMapOf(
        "P57" to Rect(24f, 138f, 342f, 17.6f),
        "P58" to Rect(24f, 171.6f, 342f, 35.1f),
        "P59" to Rect(24f, 216.7f, 342f, 17.6f),
        "P60" to Rect(24f, 264.3f, 342f, 23f),
        "P61" to Rect(33.9f, 286.3f, 1f, 573.3f),
        "P62" to Rect(24f, 305.3f, 342f, 11f),
        "P63" to Rect(24f, 316.3f, 342f, 107.8f),
        "P64" to Rect(24f, 446.1f, 342f, 11f),
        "P65" to Rect(24f, 457.1f, 342f, 92.4f),
        "P66" to Rect(24f, 549.5f, 342f, 96.4f),
        "P67" to Rect(24f, 645.8f, 342f, 96.4f),
        "P68" to Rect(24f, 742.2f, 342f, 117.4f),
    )

    /**
     * The gaps between blocks in the page's order, each the board's: 16 under
     * the kicker, 10 under the title, 30 above the axis, 18 under it to OPEN
     * NOW, the rows flush under a label and under each other, 22 (sectionGap)
     * above AHEAD.
     */
    private val boardGaps = listOf(
        Triple("P57", "P58", 16f), Triple("P58", "P59", 10f), Triple("P59", "P60", 30f),
        Triple("P60", "P62", 18f), Triple("P62", "P63", 0f), Triple("P63", "P64", 22f),
        Triple("P64", "P65", 0f), Triple("P65", "P66", 0f), Triple("P66", "P67", 0f),
        Triple("P67", "P68", 0f), Triple("P68", "row-6", 0f),
    )

    /** Inside a span: 12 (first of its group) or 16 above the title, 12 to the bar, 10 to the data line, 18 and the rule below. */
    private fun rowGaps(id: String, first: Boolean) = listOf(
        Gap("$id top to $id-title", { box(id).y }, { box("$id-title").y }, if (first) 12f else 16f),
        Gap("$id-title to $id-bar", { bottom("$id-title") }, { box("$id-bar").y }, 12f),
        Gap("$id-bar to $id-data", { bottom("$id-bar") }, { box("$id-data").y }, 10f),
        Gap("$id-data to $id end (18 and the 1 px rule)", { bottom("$id-data") }, { bottom(id) }, 19f),
    )

    private class Gap(val name: String, val from: () -> Float, val to: () -> Float, val want: Float)

    /** Why each content box differs from the board's, written under the at-rest table. */
    private val reasons = linkedMapOf(
        "P57" to "web's kicker READ AGAINST YOUR OWN SKY, the board's words; no institution, so no script reveal on this page",
        "P58" to "web's title \"WHAT DOES NOT PASS IN A DAY\" (catalog transits.title, Matthew's \"Web headlines\") in its own case on two lines, each 37.6 for Spectral SC's capitals; the board's \"The long transits\" takes one line of 35.1",
        "P59" to "web's count \"NINE SPANS · OCT 2026 → JAN 2029\" (all nine spans, the Midheaven's two included) against the board's SIX SPANS · OCT 2026 → AUG 2028; sits lower by P58's second line",
        "P60" to "web's axis 2026 to 2029 over 28 months (OCT 2026 to JAN 2029) against the board's 23; 2027 at 10.7%, 2028 at 53.6%, 2029 at 96.4% with its label set to the left of its rule so it stays on the page",
        "P61" to "NOW at (21/31)/28 = 2.4% of 342 (x 32.3) against the board's 2.9% of 23 months (x 33.9); it runs to the end of nine rows, not five",
        "P62" to "OPEN NOW, the board's label and words; lower by P58's second line",
        "P63" to "web's AMUN ROWS IN TIME WITH YOUR RISING in capitals (web's case) takes two lines (RISING wraps), and its data line two (· EASE wraps at 328, as the board's own P63 data line wraps): 131.3 against 107.8",
        "P64" to "AHEAD, the board's label",
        "P65" to "web's first ahead span is GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN (web walks the Midheaven; the board has no Midheaven row); title and data line each on two lines: 131.3 against 92.4",
        "P66" to "web's GEB ROWS IN TIME WITH YOUR RISING (the board's P65) on one line; its data line \"… · 3 EXACT · 3 AHEAD · EASE\" (web's spanRowText counts passes ahead on ahead rows too, the board prints \"3 EXACT · EASE\") wraps to two: 114.3 against 96.4",
        "P67" to "web's GEB TIPS THE SCALES AGAINST RA (the board's P66); the data line wraps for its AHEAD count: 114.3 against 96.4",
        "P68" to "web's AMUN JOINS THE BARQUE OF KHONSU (the board's P67), title on one line, data on two: 114.3 against the board's P68 117.4; four more rows follow (row-6 to row-9), the board's P68 among them, then JUN 2028 NUT and OCT 2028 AMUN against YOUR MIDHEAVEN",
    )

    private lateinit var state: ScrollState
    private val routes = mutableListOf<String>()
    private val opened = mutableListOf<String>()
    private lateinit var focus: androidx.compose.ui.focus.FocusManager
    private lateinit var inputMode: androidx.compose.ui.input.InputModeManager

    private val density get() = RuntimeEnvironment.getApplication().resources.displayMetrics.density

    private fun render(name: String, culture: AncientCulture, scroll: Int, spans: SpansState = ready, fontScale: Float = 1f, capture: Boolean = true) {
        compose.setContent {
            val base = LocalDensity.current
            androidx.compose.runtime.CompositionLocalProvider(LocalDensity provides androidx.compose.ui.unit.Density(base.density, fontScale)) {
                AstraAntiquaTheme(selectedCulture = culture) {
                    state = rememberScrollState(with(LocalDensity.current) { scroll.dp.roundToPx() })
                    focus = androidx.compose.ui.platform.LocalFocusManager.current
                    inputMode = androidx.compose.ui.platform.LocalInputModeManager.current
                    LongTransitsFrame(culture = culture, state = spans, onNavigate = { routes += it }, onOpen = { opened += it }, scrollState = state)
                }
            }
        }
        compose.waitForIdle()
        if (capture) compose.onRoot().captureRoboImage(File(out, "$name.png").path)
    }

    private fun box(id: String): Rect {
        val b = compose.onNodeWithTag(id, useUnmergedTree = true).getUnclippedBoundsInRoot()
        return Rect(b.left.value, b.top.value, (b.right - b.left).value, (b.bottom - b.top).value)
    }

    private fun bottom(id: String) = box(id).let { it.y + it.h }

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

    private fun assertChrome(name: String) {
        val misses = measure(name, chrome)
        assertTrue("chrome off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    private fun assertGaps(name: String, pairs: List<Triple<String, String, Float>> = boardGaps, inner: List<Gap> = innerGaps()) {
        val misses = mutableListOf<String>()
        pairs.forEach { (a, b, want) ->
            val got = box(b).y - bottom(a)
            "%s gap %s to %s want %.1f got %.1f".format(name, a, b, want, got).also { note(it) }.also { if (abs(got - want) > 1f) misses += it }
        }
        inner.forEach { g ->
            val got = g.to() - g.from()
            "%s gap %s want %.1f got %.1f".format(name, g.name, g.want, got).also { note(it) }.also { if (abs(got - g.want) > 1f) misses += it }
        }
        assertTrue("gaps off by more than 1 dp:\n" + misses.joinToString("\n"), misses.isEmpty())
    }

    private fun innerGaps() = rowGaps("P63", first = true) + rowGaps("P65", first = true) + rowGaps("P66", first = false)

    @Test
    fun transitsAtRest() {
        render("transits", AncientCulture.EGYPT, 0)
        assertChrome("transits")
        measure("transits", content)
        reasons.forEach { (id, why) -> note("transits $id reason: $why") }
        listOf("row-6", "row-7", "row-8", "row-9").forEach { noteBox("transits", it) }
        note("transits page scrolls to %.1f (board 134)".format(state.maxValue / density))
        assertGaps("transits")
        compose.onNodeWithText("WHAT DOES NOT PASS IN A DAY").assertExists()
        compose.onNodeWithText("NINE SPANS · OCT 2026 → JAN 2029").assertExists()
        compose.onNodeWithText("OPEN NOW").assertExists()
        compose.onNodeWithText("AHEAD").assertExists()
        compose.onNodeWithText("GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN", useUnmergedTree = true).assertExists()
        compose.onNodeWithText("READ →", useUnmergedTree = true).assertDoesNotExist()
        // Spoken without the arrow or the dots.
        compose.onNode(hasContentDescription("amun rows in time with your rising, october 2026 to june 2027, 3 exact, 2 ahead, ease")).assertExists()
        // NOW at (21/31)/28 of the axis's 342.
        val now = box("P61")
        assertTrue("$now", abs(now.x - (24f + 342f * (21f / 31f) / 28f)) <= 0.5f && abs(now.w - 1f) <= 0.5f)
        assertTrue("NOW starts under the axis's 22: $now", abs(now.y - (box("P60").y + 22f)) <= 0.5f)
        assertTrue("NOW runs to the list's end: $now", abs(now.y + now.h - bottom("row-9")) <= 0.5f)
        // The bars follow the axis: Geb's Midheaven span FEB to APR 2027 is 4/28 in and 3/28 wide.
        val bar = compose.onNodeWithTag("P65-bar", useUnmergedTree = true).getUnclippedBoundsInRoot()
        note("transits P65-bar track %.1f wide at %.1f".format((bar.right - bar.left).value, bar.left.value))
        // Every row takes a 48 dp or taller touch.
        listOf("P63", "P65", "P66", "P67", "P68", "row-6", "row-7", "row-8", "row-9").forEach {
            assertTrue("$it", box(it).h >= 48f)
            compose.onNodeWithTag(it).assert(hasClickAction())
        }
    }

    @Test
    fun transitsScrolled() {
        // Glass-Transits-scrolled: the page 134 up.
        render("transits-scrolled", AncientCulture.EGYPT, 134)
        assertChrome("transits-scrolled")
        val at = state.value / density
        note("transits-scrolled scrolled to %.1f".format(at))
        assertTrue("the page did not scroll to 134: $at", abs(at - 134f) <= 1f)
        assertGaps("transits-scrolled")
        assertTrue(abs(box("P57").y - (138f - 134f)) <= 1f)
    }

    @Test
    fun transitsRome() {
        // Rome sets the title and the rows in Cinzel; the spans are the same sky in Rome's gods.
        render("transits-rome", AncientCulture.ROME, 0)
        assertChrome("transits-rome")
        compose.onNodeWithText("IUPPITER CLASPS THE RIGHT HAND OF YOUR RISING", useUnmergedTree = true).assertExists()
        assertGaps("transits-rome")
    }

    @Test
    fun transitsWithoutAChart() {
        // No birth record: web's TransitEmptyState; CAST THE FIRST CHART opens the cast screen on top.
        render("transits-no-chart", AncientCulture.EGYPT, 0, spans = SpansState.NoChart)
        assertChrome("transits-no-chart")
        listOf("transits-cast", "transits-cast-link").forEach { noteBox("transits-no-chart", it) }
        compose.onNodeWithText("THE LONG TRANSITS ARE READ AGAINST A CHART").assertExists()
        compose.onNodeWithText("A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept.").assertExists()
        compose.onNodeWithText("KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC").assertExists()
        val link = box("transits-cast-link")
        note("transits-no-chart CAST THE FIRST CHART %.1f tall".format(link.h))
        // The button is at least 48 tall, its words centred in it.
        assertTrue("$link", link.h >= 48f - 0.05f)
        compose.onNode(hasContentDescription("Cast the first chart") and hasClickAction())
            .performTouchInput { click(Offset(centerX, 2.dp.toPx())) }
        assertTrue("$opened $routes", opened == listOf(Route.READING) && routes.isEmpty())
    }

    @Test
    fun transitsLoading() {
        render("transits-loading", AncientCulture.EGYPT, 0, spans = SpansState.Loading)
        assertChrome("transits-loading")
        compose.onNodeWithText("COMPUTING THE SKY…").assertExists()
        noteBox("transits-loading", "transits-loading")
    }

    @Test
    fun transitsLargeFont() {
        // At 1.3 the title, the count, the labels and the rows grow; the gaps between them hold.
        render("transits-font-130", AncientCulture.EGYPT, 0, fontScale = 1.3f)
        assertGaps("transits-font-130")
        note("transits-font-130 P58 %.1f tall, P59 %.1f, P63 %.1f, P65 %.1f".format(box("P58").h, box("P59").h, box("P63").h, box("P65").h))
    }

    @Test
    @Config(qualifiers = "w360dp-h780dp-xxhdpi")
    fun transitsOnA360DpPhone() {
        // 312 dp of content: the axis, the bars and NOW scale to it.
        render("transits-360", AncientCulture.EGYPT, 0)
        assertGaps("transits-360")
        val axis = box("P60")
        note("transits-360 P60 got %.1f, %.1f · %.1fx%.1f".format(axis.x, axis.y, axis.w, axis.h))
        assertTrue("$axis", abs(axis.w - 312f) <= 1f)
        // 2029's label stays inside the axis.
        compose.onNodeWithText("2029", useUnmergedTree = true).getUnclippedBoundsInRoot().let {
            assertTrue("2029 runs off the axis: ${it.right}", it.right.value <= axis.x + axis.w + 0.5f)
        }
    }

    @Test
    fun transitsEnd() {
        // The page's foot: the last row, 120 above the content's end.
        render("transits-end", AncientCulture.EGYPT, 6000)
        assertChrome("transits-end")
        val last = box("row-9")
        note("transits-end scrolled to %.1f; row-9 bottom %.1f (page end 120 below: %.1f)".format(state.value / density, last.y + last.h, 844f - (last.y + last.h)))
        assertTrue("$last", abs(844f - (last.y + last.h) - 120f) <= 1f)
        compose.onNodeWithText("AMUN JOINS THE BARQUE OF YOUR MIDHEAVEN", useUnmergedTree = true).assertExists()
    }

    @Test
    fun aRowOpensItsTransitAndShowsThePressedFill() {
        render("transits-tap", AncientCulture.EGYPT, 0, capture = false)
        // A held press draws P170 under the finger; photographed, then released, which opens the detail on top.
        compose.onNodeWithTag("P65").performTouchInput { down(center) }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "transits-pressed.png").path)
        compose.onNodeWithTag("P65").performTouchInput { up() }
        compose.waitForIdle()
        assertTrue("$opened", opened == listOf(Route.transitDetail("saturn-opposition-mc")))
        compose.onNodeWithTag("P63").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.OnClick)
        assertTrue("$opened", opened.last() == Route.transitDetail("jupiter-trine-asc"))
    }

    @Test
    fun aDpadWalksTheRowsClearOfTheGlass() {
        // Each row opens a transit, so it takes focus outside touch mode; D-pad Down walks them in order,
        // and the scroll brings the focused one clear of the glass (173 above, 96 below).
        render("transits-focus", AncientCulture.EGYPT, 0, capture = false)
        compose.runOnIdle { inputMode.requestInputMode(androidx.compose.ui.input.InputMode.Keyboard) }
        compose.onNodeWithTag("P63").performSemanticsAction(androidx.compose.ui.semantics.SemanticsActions.RequestFocus)
        compose.waitForIdle()
        compose.onNodeWithTag("P63").assertIsFocused()
        listOf("P65", "P66", "P67", "P68", "row-6", "row-7").forEach { id ->
            compose.runOnIdle { focus.moveFocus(androidx.compose.ui.focus.FocusDirection.Down) }
            compose.waitForIdle()
            compose.onNodeWithTag(id).assertIsFocused()
        }
        compose.onRoot().captureRoboImage(File(out, "transits-focus.png").path)
        val row = box("row-7")
        note("transits-focus scrolled to %.1f, row-7 top %.1f bottom %.1f".format(state.value / density, row.y, row.y + row.h))
        assertTrue("the focused row is under the tab bar: $row", state.value > 0 && row.y + row.h <= 748f + 0.5f)
        assertTrue("the focused row is under the top glass: $row", row.y >= 173f - 0.5f)
    }

    @Test
    fun theFlatDetailOpensAMidheavenSpan() {
        // The flat transit detail (step 9 builds the glass one) finds a Midheaven span among the spans
        // and composes it as the Ascendant's: no crash, "your midheaven" in its line.
        compose.setContent {
            AstraAntiquaTheme(selectedCulture = AncientCulture.EGYPT) {
                // The app's Surface paints the flat screens' ground (MainActivity).
                androidx.compose.material3.Surface(color = androidx.compose.material3.MaterialTheme.colorScheme.background) {
                    TransitDetailBody(spanId = "jupiter-conjunction-mc", culture = AncientCulture.EGYPT, state = ready, onNavigate = {})
                }
            }
        }
        compose.waitForIdle()
        compose.onRoot().captureRoboImage(File(out, "transit-detail-mc.png").path)
        compose.onNodeWithText("This transit is not in the window").assertDoesNotExist()
        compose.onNodeWithText("joins the barque of your midheaven", substring = true, ignoreCase = true, useUnmergedTree = true).assertExists()
    }

    private fun span(id: String, from: String, to: String) = com.astra.antiqua.domain.TransitSpan(
        id = id, transitPlanet = com.astra.antiqua.model.Planet.SATURN, natalKey = "sun", natalLongitude = 0.0,
        aspect = com.astra.antiqua.domain.AspectType.TRINE, start = java.util.Date.from(java.time.Instant.parse(from)),
        end = java.util.Date.from(java.time.Instant.parse(to)), passes = listOf(java.util.Date.from(java.time.Instant.parse(from))),
        transitSign = com.astra.antiqua.domain.ZodiacSign.ARIES, transitDegree = 0.0,
    )

    /** Asserts the axis's labels do not overlap; returns the years drawn. */
    private fun assertAxisLabelsApart(name: String, years: List<String>): List<String> {
        val drawn = years.filter { compose.onAllNodes(androidx.compose.ui.test.hasTestTag("axis-$it"), useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty() }
        val boxes = drawn.map { box("axis-$it") }
        note("$name axis " + drawn.zip(boxes).joinToString { (y, b) -> "%s at %.1f to %.1f".format(y, b.x, b.x + b.w) })
        boxes.zipWithNext().forEach { (a, b) -> assertTrue("$name labels overlap: $a $b", b.x >= a.x + a.w + 7.5f) }
        val axis = box("P60")
        boxes.forEach { assertTrue("$name label off the axis: $it", it.x >= axis.x - 0.5f && it.x + it.w <= axis.x + axis.w + 0.5f) }
        return drawn
    }

    @Test
    fun aDecemberFirstMonthDropsTheFirstYearLabel() {
        // The first listed month DEC 2026 puts JAN 2027 one month in: 2027 wins, 2026 and its place go.
        val spans = listOf(span("saturn-trine-sun", "2026-12-05T12:00:00Z", "2027-09-10T12:00:00Z"), span("jupiter-trine-sun", "2027-03-01T12:00:00Z", "2028-07-20T12:00:00Z"))
        render("transits-axis-dec", AncientCulture.EGYPT, 0, spans = SpansState.Ready(spans, SkyDayTest.sampleNow))
        val drawn = assertAxisLabelsApart("transits-axis-dec", listOf("2026", "2027", "2028"))
        assertTrue("$drawn", drawn == listOf("2027", "2028"))
    }

    @Test
    @Config(qualifiers = "w360dp-h780dp-xxhdpi")
    fun aNovemberFirstMonthOnA360DpPhoneKeepsTheLabelsApart() {
        val spans = listOf(span("saturn-trine-sun", "2026-11-05T12:00:00Z", "2027-09-10T12:00:00Z"), span("jupiter-trine-sun", "2027-03-01T12:00:00Z", "2028-06-20T12:00:00Z"))
        render("transits-axis-nov-360", AncientCulture.EGYPT, 0, spans = SpansState.Ready(spans, SkyDayTest.sampleNow))
        val drawn = assertAxisLabelsApart("transits-axis-nov-360", listOf("2026", "2027", "2028"))
        assertTrue("$drawn", drawn.containsAll(listOf("2027", "2028")))
    }

    @Test
    fun theSampleAxisKeepsItsLabelsApartAtEveryScale() {
        render("transits-axis-130", AncientCulture.EGYPT, 0, fontScale = 1.3f, capture = false)
        assertAxisLabelsApart("transits-axis-130", listOf("2026", "2027", "2028", "2029"))
    }
}
