package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.SkyYear
import com.astra.antiqua.domain.SkyYearComposer
import com.astra.antiqua.domain.SkyYearSlots
import com.astra.antiqua.domain.SlotMap
import com.astra.antiqua.domain.YearSegment
import com.astra.antiqua.domain.YearSpineRow
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.FeedbackRow
import com.astra.antiqua.ui.components.ScriptName
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalSmallCapsDisplay
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spectral
import com.astra.antiqua.ui.theme.SpectralSc
import com.astra.antiqua.ui.theme.glass.GlassScreen
import com.astra.antiqua.ui.theme.glass.GlassSection
import com.astra.antiqua.ui.theme.glass.focusOutline
import com.astra.antiqua.ui.theme.groundFor
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SkyYearViewModel

/**
 * SKY · YEAR on the glass chrome (canvas board Glass-Year; placement table
 * P43 to P52 in the design worktree's `.superpowers/sdd/glass-build/report-r3b.md`).
 * The board's sections in its order, filled with the web's year
 * (`lib/screens/year.ts`, YearNave.tsx, yearContent.ts): the kicker with the
 * institution, the title, the count line, then web's timeline of turnings
 * laid out as the board's spine: a month label where web's year.monthLabel
 * slot opens a month, a turning row per web row, and the TODAY marker. Web's
 * timeline starts at the instant, so TODAY leads its month's list, where the
 * board shows two past rows above it ([yearMonths]). Web's own sections
 * follow below.
 */
@Composable
fun SkyYearScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val model: SkyYearViewModel = viewModel(factory = AstraViewModelFactory)
    val year by model.year.collectAsState()
    LaunchedEffect(culture) { model.load(culture) }
    SkyYearFrame(culture = culture, year = year, onNavigate = onNavigate, onOpen = onOpen)
}

/** Sky Year inside its chrome, from a composed [year]; the screenshot test draws this. */
@Composable
fun SkyYearFrame(
    culture: AncientCulture,
    year: SkyYear?,
    onNavigate: (String) -> Unit = {},
    onOpen: (String) -> Unit = {},
    scrollState: ScrollState = rememberScrollState(),
) {
    GlassScreen(
        culture = culture,
        section = GlassSection.SKY,
        horizon = Horizon.YEAR,
        scrollState = scrollState,
        contentBottom = YearBoard.padBottom,
        onSection = { onNavigate(it.route()) },
        onHorizon = { onNavigate(it.route) },
        // The culture sheet is step 10; until then the menu opens the Voices list.
        onMenu = { onNavigate(Route.VOICES) },
    ) {
        if (year != null) SkyYearContent(culture, year, onNavigate, onOpen)
    }
}

/** The board's numbers, in points read as dp (Glass-Year's markup at default levers). */
private object YearBoard {
    val side = 24.dp
    val padBottom = 120.dp
    val sectionGap = 30.dp

    /** The month label's rules and the list's left border: bone 16%. */
    val rule = Color(0xFFE6DECC).copy(alpha = 0.16f)

    /** The list: a 1 px border at x 24, its rows 20 in from it (x 45), 20 apart. */
    val listInset = 21.dp
    val rowGap = 20.dp

    /** A turning's mark: 7x7 inside a 1 px border, at left -24, top 3 of its row. */
    val markLeft = 24.dp
    val markTop = 3.dp
    val markSize = 9.dp

    /** TODAY's mark: a filled 9x9 square at left -25, top 2; its rule bone 32%. */
    val todayLeft = 25.dp
    val todayTop = 2.dp
    val todayRule = Color(0xFFE6DECC).copy(alpha = 0.32f)
}

/** The board's ID for the [i]th turning row: P47 and P48, then P50 to P52 (P49 is TODAY); past them row-n. */
internal fun yearRowId(i: Int): String = when (i) {
    0 -> "P47"
    1 -> "P48"
    in 2..4 -> "P${48 + i}"
    else -> "row-${i + 1}"
}

/** One month of the list: its label, whether TODAY leads it, and the turnings' indices in it. */
internal data class YearMonth(val label: String, val today: Boolean, val rows: IntRange)

/**
 * The list's months from web's year.monthLabel slot (a label opens a month).
 * TODAY leads the first month when the instant falls in it, as on the board.
 * Web's timeline starts at the instant, so no turning ever sits above TODAY;
 * when today's month holds no turning (29 SEP, 30 DEC) TODAY takes a month of
 * its own under [todayMonth], the catalog's year.monthLabel for the instant,
 * which web prints only as the no-chart box's heading.
 */
internal fun yearMonths(labels: List<String>, todayMonth: String): List<YearMonth> {
    val starts = labels.indices.filter { labels[it].isNotEmpty() }
    val months = starts.mapIndexed { g, first ->
        YearMonth(labels[first], false, first until (starts.getOrNull(g + 1) ?: labels.size))
    }
    return if (months.firstOrNull()?.label == todayMonth) {
        listOf(months.first().copy(today = true)) + months.drop(1)
    } else {
        listOf(YearMonth(todayMonth, true, IntRange.EMPTY)) + months
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SkyYearContent(culture: AncientCulture, year: SkyYear, onNavigate: (String) -> Unit, onOpen: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = YearBoard.side)
    val slots = remember(year, culture) { SkyYearSlots.build(year, culture) }

    // P43: the kicker, the day the year is read from and the institution, the institution as a script name.
    val kicker = mono(11.sp, 1.6f, 0.16f)
    FlowRow(modifier = side.testTag("P43"), horizontalArrangement = Arrangement.Center) {
        val from = slots.text("year.kicker").removeSuffix(SharedStrings.COMMON_INSTITUTION.getValue(culture))
        Text(
            from,
            style = kicker,
            color = Dim,
            modifier = Modifier.semantics { contentDescription = from.removeSuffix(" · ").lowercase().replaceFirstChar { it.uppercase() } },
        )
        ScriptName(
            culture = culture,
            key = ScriptNameKey.Institution,
            style = kicker,
            color = Dim,
            upper = true,
            textAlign = TextAlign.Center,
            contentAlignment = Alignment.Center,
        )
    }

    // P44: web's title in its own case; Rome keeps Cinzel at .08em.
    val smallCaps = LocalSmallCapsDisplay.current
    Text(
        text = slots.text("year.title"),
        style = TextStyle(
            fontFamily = if (smallCaps) SpectralSc else Cinzel,
            fontWeight = FontWeight.Medium,
            fontSize = 26.sp,
            lineHeight = 26.sp * 1.35f,
            letterSpacing = if (smallCaps) 0.06.em else 0.08.em,
            lineHeightStyle = CssLeading,
        ),
        color = Bone,
        textAlign = TextAlign.Center,
        modifier = side.padding(top = 18.dp).testTag("P44").semantics { heading() },
    )

    // P45: the count line.
    Text(
        slots.text("year.countLine"),
        style = mono(11.sp, 1.6f, 0.14f),
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = side.padding(top = 10.dp).testTag("P45"),
    )

    // P46 to P52: the turnings by month, each month a label over its own ruled list.
    // With a chart web prints neither the count line nor this timeline (YearNave shows them
    // only without one); Android prints both in both states because the board does.
    val heads = slots.list("year.row.head")
    val prose = slots.list("year.row.prose")
    val ground = groundFor(culture)
    yearMonths(slots.list("year.monthLabel"), SkyYearSlots.todayMonth(year)).forEachIndexed { g, month ->
        SeasonLabel(month.label, if (g == 0) "P46" else "month-${g + 1}", bottom = 18.dp, top = YearBoard.sectionGap)
        Column(
            side
                .drawBehind { drawRect(YearBoard.rule, size = Size(1.dp.toPx(), size.height)) }
                .padding(start = YearBoard.listInset),
            verticalArrangement = Arrangement.spacedBy(YearBoard.rowGap),
        ) {
            if (month.today) TodayMarker(slots.text("year.today"))
            for (i in month.rows) {
                TurningRow(heads[i], prose[i], year.turnings[i].conflict, yearRowId(i), ground)
            }
        }
    }

    WebYearSections(year, slots, onNavigate, onOpen)
}

/**
 * P49: "TODAY · 21 OCT" in bone, mono 500 at .14em, a flex rule 10 after it
 * at bone 32%, the board's filled square on the list's border.
 */
@Composable
private fun TodayMarker(text: String) {
    Row(
        Modifier
            .fillMaxWidth()
            .testTag("P49")
            .drawBehind {
                drawRect(Bone, Offset(-YearBoard.todayLeft.toPx(), YearBoard.todayTop.toPx()), Size(YearBoard.markSize.toPx(), YearBoard.markSize.toPx()))
            }
            .dpadStop()
            .clearAndSetSemantics { contentDescription = text.replace(" · ", ", ").lowercase().replaceFirstChar { it.uppercase() } },
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(text, style = mono(11.sp, 1.4f, 0.14f, FontWeight.Medium), color = Bone)
        Box(Modifier.weight(1f).height(1.dp).background(YearBoard.todayRule))
    }
}

/**
 * A turning row (P47, P48, P50 to P52): web's year.row.head in mono 11/1.4 at
 * .1em, dim, the words after the date in the conflict ink on a turn to
 * retrograde as the board's span does; web's year.row.prose 5 below in
 * Spectral 17/1.5 when the row has one (an ingress). The board's mark sits on
 * the list's border: 7x7 on the ground inside a 1 px dim border.
 */
@Composable
private fun TurningRow(head: String, prose: String, conflict: Boolean, id: String, ground: Color) {
    val date = head.substringBefore(" · ")
    // Spoken without the dot: "24 oct mercury turns retrograde".
    val spoken = (head.replace(" · ", " ") + if (prose.isNotEmpty()) ". $prose" else "").lowercase()
    Column(
        Modifier
            .fillMaxWidth()
            .testTag(id)
            .drawBehind {
                val at = Offset(-YearBoard.markLeft.toPx(), YearBoard.markTop.toPx())
                val box = YearBoard.markSize.toPx()
                val line = 1.dp.toPx()
                drawRect(ground, at, Size(box, box))
                drawRect(Dim, at + Offset(line / 2, line / 2), Size(box - line, box - line), style = Stroke(line))
            }
            .dpadStop()
            .clearAndSetSemantics { contentDescription = spoken },
    ) {
        Text(
            buildAnnotatedString {
                if (conflict && head.length > date.length) {
                    append(head.substring(0, date.length + 3))
                    withStyle(SpanStyle(color = Conflict)) { append(head.substring(date.length + 3)) }
                } else {
                    append(head)
                }
            },
            style = mono(11.sp, 1.4f, 0.1f),
            color = Dim,
        )
        if (prose.isNotEmpty()) {
            Text(
                prose,
                style = TextStyle(fontFamily = Spectral, fontSize = 17.sp, lineHeight = 17.sp * 1.5f, lineHeightStyle = CssLeading),
                color = Bone,
                modifier = Modifier.padding(top = 5.dp),
            )
        }
    }
}

/**
 * The web year's own sections, not on the board, flat on the ground below the
 * turnings in YearNave's order, as Week's and Season's are: the opening
 * paragraph (40 under the list, as Week's thesis), then with a chart the
 * segments (mt-8), Greece's festivals note (mt-3), the spine (mt-8) and the
 * votive (mt-8); without one the CAST A CHART box (mt-8). Then the feedback
 * row (mt-6) and the two links (mt-9). Web's no-chart timeline box is the
 * board's list above and is not drawn twice.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun WebYearSections(year: SkyYear, slots: SlotMap, onNavigate: (String) -> Unit, onOpen: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = YearBoard.side)
    val accent = LocalAccent.current
    val strongBorder = accent.copy(alpha = 0.48f)
    val display = if (LocalSmallCapsDisplay.current) SpectralSc else Cinzel

    // web's <p>: the theme's body or SKY_ONLY_OPENING; HTML folds its paragraph break into a space.
    Text(
        year.opening.replace(Regex("\\s+"), " "),
        style = TextStyle(fontFamily = Spectral, fontSize = 17.sp, lineHeight = 17.sp * 1.65f, lineHeightStyle = CssLeading),
        color = Prose,
        modifier = side.padding(top = 40.dp).testTag("year-opening").dpadStop(),
    )

    if (year.report != null) {
        Column(side.padding(top = 32.dp).testTag("year-segments")) {
            year.segments.forEachIndexed { i, seg ->
                SegmentRow(seg, last = i == year.segments.lastIndex, id = "segment-${i + 1}")
            }
        }
        if (year.festivals) {
            Text(
                SkyYearComposer.FESTIVALS_NOTE,
                style = mono(11.sp, 1.65f, 0.14f),
                color = Dim,
                textAlign = TextAlign.Center,
                modifier = side.padding(top = 12.dp).testTag("year-festivals"),
            )
        }
        if (year.spine.isNotEmpty()) {
            Column(
                side.padding(top = 32.dp).testTag("year-spine")
                    .border(1.dp, strongBorder)
                    .padding(horizontal = 26.dp, vertical = 18.dp),
            ) {
                Text(
                    SharedStrings.YEAR_SPINE_LABEL,
                    style = mono(11.sp, 1.65f, 0.14f),
                    color = accent,
                    modifier = Modifier.padding(bottom = 12.dp).semantics {
                        heading()
                        contentDescription = "The year's long transits, its spine"
                    },
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    year.spine.forEachIndexed { i, row -> SpineRow(row, display, "spine-${i + 1}", onOpen) }
                }
            }
        }
        // web's Votive: a rule above and below, 16 inside them, centred, display-xs 18/1.6 at .14em in the accent.
        Column(side.padding(top = 32.dp).testTag("year-votive").dpadStop()) {
            Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
            Text(
                slots.text("year.votive"),
                style = TextStyle(fontFamily = display, fontSize = 18.sp, lineHeight = 18.sp * 1.6f, letterSpacing = 0.14.em, lineHeightStyle = CssLeading),
                color = accent,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
            )
            Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        }
    } else if (slots.has("year.noChart")) {
        val (title, link) = slots.list("year.noChart")
        Column(
            side.padding(top = 32.dp).testTag("year-cast")
                .border(1.dp, strongBorder)
                .padding(horizontal = 26.dp, vertical = 18.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                title,
                style = TextStyle(fontFamily = display, fontSize = 18.sp, lineHeight = 18.sp * 1.65f, letterSpacing = 0.1.em, lineHeightStyle = CssLeading),
                color = Bone,
                textAlign = TextAlign.Center,
            )
            // web's bordered link; it opens the cast screen on top of the year, as Season's READING does,
            // so saving a chart comes back here. Compose widens its 38 dp box to a 48 dp touch.
            val source = remember { MutableInteractionSource() }
            Box(
                Modifier
                    .padding(top = 16.dp)
                    .focusOutline(source)
                    .semantics { contentDescription = "Cast a chart" }
                    .clickable(source, indication = null, role = Role.Button, onClickLabel = "Open") { onOpen(Route.READING) }
                    .border(1.dp, strongBorder)
                    .padding(horizontal = 20.dp, vertical = 10.dp)
                    .testTag("year-cast-link"),
            ) {
                Text(link, style = mono(11.sp, 1.65f, 0.14f), color = accent)
            }
        }
    }

    FeedbackRow(
        readingId = year.readingId,
        noun = SharedStrings.YEAR_FEEDBACK_NOUN,
        style = mono(11.sp, 1.6f, 0.14f),
        modifier = side.padding(top = 24.dp).testTag("year-feedback"),
    )

    val linkStyle = mono(11.sp, 1.6f, 0.18f)
    val ink = Bone.copy(alpha = 0.65f)
    val footer = slots.list("year.footer")
    FlowRow(
        side.padding(top = 36.dp).testTag("year-links"),
        horizontalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterHorizontally),
    ) {
        FootLink(footer[0], "The season", Route.SEASON, ink, linkStyle, onNavigate)
        // The forecast is a page inside the chart, opened on top as Placements opens it.
        FootLink(footer[1], "The year ahead", Route.FORECAST, ink, linkStyle, onOpen)
    }
}

/**
 * web's SegmentRow: a rule above (and under the last), 12 across and 14 down
 * inside, the segment the instant falls in on the accent at 7% with its words
 * lit. web sets label, summary and status in three columns (150, the rest,
 * the status); at 342 the summary column would be some 70 wide, so here the
 * label and its dates sit left of the status and the summary runs under both.
 */
@Composable
private fun SegmentRow(seg: YearSegment, last: Boolean, id: String) {
    val accent = LocalAccent.current
    val ink = if (seg.current) accent else Dim
    Column(
        Modifier
            .fillMaxWidth()
            .testTag(id)
            .dpadStop()
            .clearAndSetSemantics {
                // "akhet, the flood, 21 oct to 20 jan, day 1 of 92": lowercase as the rows, no glyphs.
                val status = seg.status.replace(" / ", " of ").lowercase()
                contentDescription = "${seg.label.replace(" · ", ", ").lowercase()}, ${seg.dateRange.replace(" → ", " to ").lowercase()}, $status. ${seg.summary}"
            },
    ) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        Column(
            Modifier
                .fillMaxWidth()
                .then(if (seg.current) Modifier.background(accent.copy(alpha = 0.07f)) else Modifier)
                .padding(horizontal = 12.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Text("${seg.label}\n${seg.dateRange}", style = mono(11.sp, 2f, 0f), color = ink, modifier = Modifier.weight(1f))
                Text(seg.status, style = mono(11.sp, 2f, 0f), color = ink, softWrap = false)
            }
            Text(
                seg.summary,
                style = TextStyle(fontFamily = Spectral, fontSize = 15.sp, lineHeight = 15.sp * 1.65f, lineHeightStyle = CssLeading),
                color = if (seg.current) Bone else Bone.copy(alpha = 0.7f),
            )
        }
        if (last) Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
}

/**
 * One row of web's spine: spanHeadline in the display face at .08em, the end
 * month in mono, dim. web links each row to /transits/{id}. Android's
 * transit detail finds a span among TransitsViewModel's spans, walked against
 * the Sun, Moon and Ascendant (natalPointsOf), so a Midheaven span would open
 * on nothing: those rows stay D-pad stops; the rest open the detail on top.
 */
@Composable
private fun SpineRow(row: YearSpineRow, display: androidx.compose.ui.text.font.FontFamily, id: String, onOpen: (String) -> Unit) {
    val spoken = "${row.headline.lowercase()}, until ${row.end.removePrefix("→ ").lowercase()}"
    val opens = !row.id.endsWith("-mc")
    val source = remember { MutableInteractionSource() }
    Row(
        Modifier
            .fillMaxWidth()
            .testTag(id)
            .then(
                if (opens) {
                    Modifier
                        .glassClearFocus()
                        .focusOutline(source)
                        .clickable(source, indication = null, role = Role.Button, onClickLabel = "Open") { onOpen(Route.transitDetail(row.id)) }
                        .clearAndSetSemantics { contentDescription = spoken }
                } else {
                    Modifier.dpadStop().clearAndSetSemantics { contentDescription = spoken }
                },
            ),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            row.headline,
            style = TextStyle(fontFamily = display, fontSize = 18.sp, lineHeight = 18.sp * 1.65f, letterSpacing = 0.08.em, lineHeightStyle = CssLeading),
            color = Prose,
            modifier = Modifier.weight(1f).alignByBaseline(),
        )
        Text(row.end, style = mono(11.sp, 1.65f, 0f), color = Dim, softWrap = false, modifier = Modifier.alignByBaseline())
    }
}
