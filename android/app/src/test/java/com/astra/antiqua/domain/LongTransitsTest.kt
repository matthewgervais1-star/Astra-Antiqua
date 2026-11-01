package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.screens.spokenRow
import com.astra.antiqua.ui.screens.transitsRowId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.Instant
import java.time.ZoneId
import java.util.Date
import kotlin.math.abs
import androidx.compose.ui.unit.dp

/**
 * The long transits index (step 6) at the canvas's sample state (2026-10-21
 * 06:00 UTC, read in Rome, the smoke birth), for Rome's voice and at
 * 2025-03-01. Every row literal is web's, from a node run of `readerSpans`,
 * `groupSpans` and `spanRowText` (`web/src/lib/screens/transits.ts`) with
 * `process.env.TZ = "Europe/Rome"` on 2026-11-01: group, id, title, data
 * line, start, end and the number of exact passes. ScreenGoldenTest pins the
 * slots against the ten golden cases; this pins the spans under them, the
 * bar geometry against the board's formula and the Midheaven detail.
 */
class LongTransitsTest {

    @get:org.junit.Rule
    val zone = RomeZoneRule()

    private val engine = AstronomyEngine()
    private val rome: ZoneId = ZoneId.of("Europe/Rome")

    private val natal by lazy {
        SkySeasonComposer.natal(engine, CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth), SkyDayTest.smokeBirth.latitude, SkyDayTest.smokeBirth.longitude)
    }

    private fun at(iso: String): Date = Date.from(Instant.parse(iso))

    private fun transits(now: Date) = LongTransits(now, LongTransitsComposer.readerSpans(engine, natal, now))

    private val egyptSample = listOf(
        "open | jupiter-trine-asc | AMUN ROWS IN TIME WITH YOUR RISING | OCT 2026 → JUN 2027 · 3 EXACT · 2 AHEAD · EASE | 2026-10-02T22:24:01.406Z | 2027-06-29T19:01:31.406Z | 3",
        "ahead | saturn-opposition-mc | GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN | FEB 2027 → APR 2027 · 1 EXACT · 1 AHEAD · TENSION | 2027-02-25T05:42:46.406Z | 2027-04-11T05:42:46.406Z | 1",
        "ahead | saturn-trine-asc | GEB ROWS IN TIME WITH YOUR RISING | APR 2027 → MAR 2028 · 3 EXACT · 3 AHEAD · EASE | 2027-04-21T14:35:44.531Z | 2028-03-02T07:12:46.406Z | 3",
        "ahead | saturn-square-sun | GEB TIPS THE SCALES AGAINST RA | MAY 2027 → MAR 2028 · 3 EXACT · 3 AHEAD · TENSION | 2027-05-14T10:23:19.218Z | 2028-03-24T16:14:10.781Z | 3",
        "ahead | jupiter-conjunction-moon | AMUN JOINS THE BARQUE OF KHONSU | SEP 2027 → OCT 2027 · 1 EXACT · 1 AHEAD · EASE | 2027-09-17T17:28:00.468Z | 2027-10-07T17:28:00.468Z | 1",
        "ahead | jupiter-square-asc | AMUN TIPS THE SCALES AGAINST YOUR RISING | OCT 2027 → JUL 2028 · 3 EXACT · 3 AHEAD · TENSION | 2027-10-29T16:25:25.781Z | 2028-07-27T15:50:16.406Z | 3",
        "ahead | jupiter-trine-sun | AMUN ROWS IN TIME WITH RA | NOV 2027 → AUG 2028 · 3 EXACT · 3 AHEAD · EASE | 2027-11-10T13:52:51.093Z | 2028-08-11T08:37:08.906Z | 3",
        "ahead | uranus-square-moon | NUT TIPS THE SCALES AGAINST KHONSU | JUN 2028 → JAN 2029 · 2 EXACT · 2 AHEAD · TENSION | 2028-06-11T08:58:14.531Z | 2029-01-17T05:07:37.031Z | 2",
        "ahead | jupiter-conjunction-mc | AMUN JOINS THE BARQUE OF YOUR MIDHEAVEN | OCT 2028 → NOV 2028 · 1 EXACT · 1 AHEAD · EASE | 2028-10-26T21:09:29.531Z | 2028-11-20T21:09:29.531Z | 1",
    )

    private val romeSample = listOf(
        "open | jupiter-trine-asc | IUPPITER CLASPS THE RIGHT HAND OF YOUR RISING | OCT 2026 → JUN 2027 · 3 EXACT · 2 AHEAD · EASE | 2026-10-02T22:24:01.406Z | 2027-06-29T19:01:31.406Z | 3",
        "ahead | saturn-opposition-mc | SATURNUS SITS ON THE OPPOSITE BENCH FROM YOUR MIDHEAVEN | FEB 2027 → APR 2027 · 1 EXACT · 1 AHEAD · TENSION | 2027-02-25T05:42:46.406Z | 2027-04-11T05:42:46.406Z | 1",
        "ahead | saturn-trine-asc | SATURNUS CLASPS THE RIGHT HAND OF YOUR RISING | APR 2027 → MAR 2028 · 3 EXACT · 3 AHEAD · EASE | 2027-04-21T14:35:44.531Z | 2028-03-02T07:12:46.406Z | 3",
        "ahead | saturn-square-sun | SATURNUS RAISES THE SPEAR AGAINST SOL | MAY 2027 → MAR 2028 · 3 EXACT · 3 AHEAD · TENSION | 2027-05-14T10:23:19.218Z | 2028-03-24T16:14:10.781Z | 3",
        "ahead | jupiter-conjunction-moon | IUPPITER MARCHES UNDER THE SAME EAGLE AS LUNA | SEP 2027 → OCT 2027 · 1 EXACT · 1 AHEAD · EASE | 2027-09-17T17:28:00.468Z | 2027-10-07T17:28:00.468Z | 1",
        "ahead | jupiter-square-asc | IUPPITER RAISES THE SPEAR AGAINST YOUR RISING | OCT 2027 → JUL 2028 · 3 EXACT · 3 AHEAD · TENSION | 2027-10-29T16:25:25.781Z | 2028-07-27T15:50:16.406Z | 3",
        "ahead | jupiter-trine-sun | IUPPITER CLASPS THE RIGHT HAND OF SOL | NOV 2027 → AUG 2028 · 3 EXACT · 3 AHEAD · EASE | 2027-11-10T13:52:51.093Z | 2028-08-11T08:37:08.906Z | 3",
        "ahead | uranus-square-moon | CAELUS RAISES THE SPEAR AGAINST LUNA | JUN 2028 → JAN 2029 · 2 EXACT · 2 AHEAD · TENSION | 2028-06-11T08:58:14.531Z | 2029-01-17T05:07:37.031Z | 2",
        "ahead | jupiter-conjunction-mc | IUPPITER MARCHES UNDER THE SAME EAGLE AS YOUR MIDHEAVEN | OCT 2028 → NOV 2028 · 1 EXACT · 1 AHEAD · EASE | 2028-10-26T21:09:29.531Z | 2028-11-20T21:09:29.531Z | 1",
    )

    private val egypt20250301 = listOf(
        "open | uranus-trine-sun | NUT ROWS IN TIME WITH RA | APR 2024 → MAY 2025 · 3 EXACT · 1 AHEAD · EASE | 2024-04-22T16:29:38.906Z | 2025-05-21T02:01:17.343Z | 3",
        "open | jupiter-square-moon | AMUN TIPS THE SCALES AGAINST KHONSU | JUL 2024 → APR 2025 · 3 EXACT · 1 AHEAD · TENSION | 2024-07-12T12:22:08.906Z | 2025-04-03T09:24:15.468Z | 3",
        "open | jupiter-trine-mc | AMUN ROWS IN TIME WITH YOUR MIDHEAVEN | JUL 2024 → APR 2025 · 3 EXACT · 1 AHEAD · EASE | 2024-07-23T22:31:45.468Z | 2025-04-13T12:21:26.718Z | 3",
        "open | saturn-square-asc | GEB TIPS THE SCALES AGAINST YOUR RISING | FEB 2025 → APR 2025 · 1 EXACT · 1 AHEAD · TENSION | 2025-02-22T21:33:23.906Z | 2025-04-03T21:33:23.906Z | 1",
        "ahead | saturn-sextile-sun | GEB OFFERS A STEADY HAND TO RA | MAR 2025 → APR 2025 · 1 EXACT · 1 AHEAD · EASE | 2025-03-14T06:39:43.593Z | 2025-04-28T06:39:43.593Z | 1",
        "ahead | jupiter-opposition-asc | AMUN BARS THE DOOR AGAINST YOUR RISING | APR 2025 → MAY 2025 · 1 EXACT · 1 AHEAD · TENSION | 2025-04-21T01:35:16.406Z | 2025-05-16T01:35:16.406Z | 1",
        "ahead | jupiter-sextile-moon | AMUN OFFERS A STEADY HAND TO KHONSU | JUL 2025 → AUG 2025 · 1 EXACT · 1 AHEAD · EASE | 2025-07-30T21:30:35.156Z | 2025-08-24T21:30:35.156Z | 1",
        "ahead | jupiter-square-mc | AMUN TIPS THE SCALES AGAINST YOUR MIDHEAVEN | AUG 2025 → APR 2026 · 3 EXACT · 3 AHEAD · TENSION | 2025-08-09T21:50:16.406Z | 2026-04-28T00:23:33.281Z | 3",
        "ahead | jupiter-opposition-sun | AMUN BARS THE DOOR AGAINST RA | SEP 2025 → JUN 2026 · 3 EXACT · 3 AHEAD · TENSION | 2025-09-27T04:47:55.781Z | 2026-06-14T15:09:29.531Z | 3",
        "ahead | jupiter-sextile-mc | AMUN OFFERS A STEADY HAND TO YOUR MIDHEAVEN | AUG 2026 → SEP 2026 · 1 EXACT · 1 AHEAD · EASE | 2026-08-31T04:35:16.406Z | 2026-09-25T04:35:16.406Z | 1",
        "ahead | jupiter-trine-asc | AMUN ROWS IN TIME WITH YOUR RISING | OCT 2026 → FEB 2027 · 2 EXACT · 2 AHEAD · EASE | 2026-10-02T22:24:01.406Z | 2027-02-28T07:34:34.218Z | 2",
        "ahead | saturn-opposition-mc | GEB BARS THE DOOR AGAINST YOUR MIDHEAVEN | FEB 2027 → APR 2027 · 1 EXACT · 1 AHEAD · TENSION | 2027-02-25T05:42:46.406Z | 2027-04-11T05:42:46.406Z | 1",
    )

    /** Each listed row as web's dump prints it; start and end compared to two minutes (both bisect to 60 s). */
    private fun assertRows(culture: AncientCulture, now: Date, want: List<String>) {
        val t = transits(now)
        val got = t.open.map { "open" to it } + t.ahead.map { "ahead" to it }
        assertEquals(want.size, got.size)
        want.zip(got).forEach { (line, pair) ->
            val (group, span) = pair
            val w = line.split(" | ")
            assertEquals(w[0], group)
            assertEquals(w[1], span.id)
            assertEquals(w[2], LongTransitsComposer.rowTitle(culture, span))
            assertEquals(w[3], LongTransitsComposer.rowData(span, now, rome))
            assertTrue("${span.id} start ${span.start.toInstant()} against ${w[4]}", abs(span.start.time - at(w[4]).time) <= 120_000)
            assertTrue("${span.id} end ${span.end.toInstant()} against ${w[5]}", abs(span.end.time - at(w[5]).time) <= 120_000)
            assertEquals(w[6].toInt(), span.passes.size)
        }
    }

    @Test
    fun `the sample's nine rows equal web's, two against the Midheaven`() {
        assertRows(AncientCulture.EGYPT, SkyDayTest.sampleNow, egyptSample)
        val t = transits(SkyDayTest.sampleNow)
        assertEquals(listOf("jupiter-trine-asc"), t.open.map { it.id })
        assertEquals(listOf("saturn-opposition-mc", "jupiter-conjunction-mc"), t.listed.filter { it.natalKey == "mc" }.map { it.id })
        // web's window holds three spans already closed; neither group lists them.
        assertEquals(12, t.spans.size)
    }

    @Test
    fun `Rome's rows equal web's`() = assertRows(AncientCulture.ROME, SkyDayTest.sampleNow, romeSample)

    @Test
    fun `the rows on 2025-03-01 equal web's`() = assertRows(AncientCulture.EGYPT, at("2025-03-01T06:00:00Z"), egypt20250301)

    @Test
    fun `an ahead row counts its passes still to come, as web's spanRowText`() {
        // web prints AHEAD on ahead rows too: "3 EXACT · 3 AHEAD"; a span with none to come takes dataNoAhead.
        val t = transits(SkyDayTest.sampleNow)
        assertEquals("APR 2027 → MAR 2028 · 3 EXACT · 3 AHEAD · EASE", LongTransitsComposer.rowData(t.ahead[1], t.now, rome))
        val past = t.spans.first { it.end.time < t.now.time }
        assertTrue(LongTransitsComposer.rowData(past, t.now, rome).matches(Regex(""".* · \d+ EXACT · (EASE|TENSION)""")))
    }

    @Test
    fun `the sample's bars follow the board's month formula`() {
        val t = transits(SkyDayTest.sampleNow)
        val axis = LongTransitsComposer.axis(t.listed, t.now, rome)!!
        // OCT 2026 to JAN 2029 inclusive.
        assertEquals(28, axis.months)
        assertEquals(listOf(2026, 2027, 2028, 2029), axis.years.map { it.first })
        near(listOf(0f, 3 / 28f, 15 / 28f, 27 / 28f), axis.years.map { it.second })
        near(listOf((21f / 31f) / 28f), listOf(axis.now))
        // (start month index, months covered inclusive) over 28, in the listed order.
        val want = listOf(0 to 9, 4 to 3, 6 to 12, 7 to 11, 11 to 2, 12 to 10, 13 to 10, 20 to 8, 24 to 2)
        near(want.map { it.first / 28f }, axis.bars.map { it.left })
        near(want.map { it.second / 28f }, axis.bars.map { it.width })
    }

    private fun span(id: String, from: String, to: String) = TransitSpan(
        id = id, transitPlanet = Planet.SATURN, natalKey = "sun", natalLongitude = 0.0, aspect = AspectType.TRINE,
        start = at(from), end = at(to), passes = listOf(at(from)), transitSign = ZodiacSign.ARIES, transitDegree = 0.0,
    )

    @Test
    fun `the board's own spans give the board's percentages`() {
        // Glass-Transits: OCT 2026 to AUG 2028, 23 months; its markup's lefts, widths, years and NOW.
        val board = listOf(
            span("amun", "2026-10-02T12:00:00Z", "2027-06-29T12:00:00Z"),
            span("geb-asc", "2027-04-21T12:00:00Z", "2028-03-02T12:00:00Z"),
            span("geb-sun", "2027-05-14T12:00:00Z", "2028-03-24T12:00:00Z"),
            span("amun-moon", "2027-09-17T12:00:00Z", "2027-10-07T12:00:00Z"),
            span("amun-asc", "2027-10-29T12:00:00Z", "2028-07-27T12:00:00Z"),
            span("amun-sun", "2027-11-10T12:00:00Z", "2028-08-11T12:00:00Z"),
        )
        val axis = LongTransitsComposer.axis(board, SkyDayTest.sampleNow, rome)!!
        assertEquals(23, axis.months)
        near(listOf(0f, 0.1304f, 0.6522f), axis.years.map { it.second }, 0.0001f)
        near(listOf(0.029f), listOf(axis.now), 0.0005f)
        near(listOf(0f, 0.2609f, 0.3043f, 0.4783f, 0.5217f), axis.bars.take(5).map { it.left }, 0.0001f)
        near(listOf(0.3913f, 0.5217f, 0.4783f, 0.087f, 0.4348f), axis.bars.take(5).map { it.width }, 0.0001f)
    }

    private fun near(want: List<Float>, got: List<Float>, tol: Float = 1e-5f) {
        assertEquals(want.size, got.size)
        want.zip(got).forEach { (w, g) -> assertTrue("$g against $w", abs(w - g) <= tol) }
    }

    @Test
    fun `the slots group and count as web's model`() {
        val slots = TransitsSlots.build(transits(SkyDayTest.sampleNow), AncientCulture.EGYPT, rome)
        assertEquals("NINE SPANS · OCT 2026 → JAN 2029", slots.text("transits.countLine"))
        assertEquals(listOf("2026", "2027", "2028", "2029"), slots.list("transits.axis"))
        assertEquals(1, slots.list("transits.row.title.open").size)
        assertEquals(8, slots.list("transits.row.title.ahead").size)
        assertTrue(!slots.has("transits.empty.open") && !slots.has("transits.empty.ahead"))
        val none = TransitsSlots.build(null, AncientCulture.EGYPT, rome)
        assertEquals(setOf("transits.loading"), none.values.keys)
        assertEquals("COMPUTING THE SKY…", none.text("transits.loading"))
    }

    @Test
    fun `an empty group prints its catalog line`() {
        val t = transits(SkyDayTest.sampleNow)
        val slots = TransitsSlots.build(LongTransits(t.now, t.ahead), AncientCulture.EGYPT, rome)
        assertEquals("NOTHING HOLDS WITHIN ORB TODAY", slots.text("transits.empty.open"))
        assertTrue(!slots.has("transits.row.title.open"))
        // No span open: NOW sits before the axis's first month and is not drawn.
        assertTrue(LongTransitsComposer.axis(t.ahead, t.now, rome)!!.now < 0f)
        assertNull(LongTransitsComposer.axis(emptyList(), t.now, rome))
    }

    @Test
    fun `rows are spoken without glyphs and carry the board's IDs`() {
        val t = transits(SkyDayTest.sampleNow)
        val span = t.open.first()
        val spoken = spokenRow(LongTransitsComposer.rowTitle(AncientCulture.EGYPT, span), span, LongTransitsComposer.rowData(span, t.now, rome), rome)
        assertEquals("amun rows in time with your rising, october 2026 to june 2027, 3 exact, 2 ahead, ease", spoken)
        assertEquals(listOf("P63", "P65", "P66", "P67", "P68", "row-6", "row-7", "row-8", "row-9"), (0 until 9).map { transitsRowId(it, 1) })
        assertEquals(listOf("P65", "P66", "P67", "P68", "row-5"), (0 until 5).map { transitsRowId(it, 0) })
    }

    @Test
    fun `the transit detail composes a Midheaven span`() {
        // The flat detail wraps a span in FigureReadingComposer.composeSpan; a Midheaven span reads as
        // the Ascendant's do, with web's angle domain and the YOUR MIDHEAVEN label.
        val t = transits(SkyDayTest.sampleNow)
        val chart = CalculateNatalChartUseCase(engine).execute(SkyDayTest.smokeBirth)
        val sky = DayDecreeComposer.chartAt(engine, t.now)
        for (id in listOf("saturn-opposition-mc", "jupiter-conjunction-mc")) {
            val mc = t.spans.first { it.id == id }
            AncientCulture.entries.forEach { culture ->
                val (headline, anatomy) = FigureReadingComposer.composeSpan(culture, mc, NatalPoints.of(chart), sky.getValue(mc.transitPlanet), t.now)
                assertTrue(headline.isNotBlank())
                assertEquals("YOUR MIDHEAVEN", anatomy.to.label)
                assertNull(anatomy.to.body)
                assertTrue(anatomy.parts.last().tag.startsWith("YOUR MIDHEAVEN IN "))
            }
        }
        assertEquals("YOUR MIDHEAVEN", LongTransitsComposer.natalLabel(AncientCulture.EGYPT, "mc"))
    }

    @Test
    fun `a year label that would overlap the one before it drops the earlier`() {
        // 342 wide, labels 31 wide. DEC first month over 20 months: 2027 at 1/20 (17.1), so 2026 goes.
        val w = 31.dp
        val dec = com.astra.antiqua.ui.screens.axisMarks(listOf(0f, 1 / 20f, 13 / 20f), listOf(w, w, w), 342.dp)
        assertEquals(listOf(1, 2), dec.map { it.index })
        // The sample: 2027 at 3/28 (36.6) leaves 2026 its place; 2029 at 27/28 sets its label left of its rule.
        val sample = com.astra.antiqua.ui.screens.axisMarks(listOf(0f, 3 / 28f, 15 / 28f, 27 / 28f), listOf(w, w, w, w), 342.dp)
        assertEquals(listOf(0, 1, 2, 3), sample.map { it.index })
        assertTrue(sample[3].left + w <= sample[3].rule!!)
        sample.zipWithNext().forEach { (a, b) -> assertTrue(b.left >= a.left + a.width + 8.dp) }
    }
}
