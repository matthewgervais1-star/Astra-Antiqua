package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.requiredHeight
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
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
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.LongTransits
import com.astra.antiqua.domain.LongTransitsComposer
import com.astra.antiqua.domain.SpanTone
import com.astra.antiqua.domain.TransitBar
import com.astra.antiqua.domain.TransitSpan
import com.astra.antiqua.domain.TransitsSlots
import com.astra.antiqua.domain.spanTone
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalSmallCapsDisplay
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spectral
import com.astra.antiqua.ui.theme.SpectralSc
import com.astra.antiqua.ui.theme.glass.GlassScreen
import com.astra.antiqua.ui.theme.glass.GlassSection
import com.astra.antiqua.ui.theme.glass.focusOutline
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SpansState
import com.astra.antiqua.viewmodel.TransitsViewModel
import java.time.Instant
import java.time.ZoneId
import java.time.format.TextStyle as MonthStyle
import java.util.Locale

/**
 * TRANSITS on the glass chrome (canvas board Glass-Transits; placement table
 * P57 to P68 in the design worktree's `.superpowers/sdd/glass-build/report-r4.md`).
 * The board's sections in its order, filled with web's index
 * (`lib/screens/transits.ts`, TransitsIndex.tsx): the kicker, web's title,
 * the count line, the shared year axis with its NOW mark, then OPEN NOW and
 * AHEAD with every span web lists, each a bar on the axis over web's data
 * line. The whole row opens the transit, as on the board; web's READ → at
 * each row's right is left off (the board omits it). Without a birth record
 * the page prints web's TransitEmptyState. Lines and marks follow Matthew's
 * design round (2026-11-01, variant C): titles on two balanced lines, the
 * data on two deliberate lines, the axis and the bars on the text's left
 * edge, NOW a short mark on the axis and a tick on each bar.
 */
@Composable
fun LongTransitsScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val model: TransitsViewModel = viewModel(factory = AstraViewModelFactory)
    val state by model.state.collectAsState()
    // Each return to the page reads the profile again: a chart cast from the empty state, or a
    // recast chart, brings its own spans; the same profile keeps the spans on show.
    LaunchedEffect(Unit) { model.load() }
    LongTransitsFrame(culture = culture, state = state, onNavigate = onNavigate, onOpen = onOpen)
}

/** The index inside its chrome, from a spans [state]; the screenshot test draws this. */
@Composable
fun LongTransitsFrame(
    culture: AncientCulture,
    state: SpansState,
    onNavigate: (String) -> Unit = {},
    onOpen: (String) -> Unit = {},
    scrollState: ScrollState = rememberScrollState(),
    zone: ZoneId = ZoneId.systemDefault(),
) {
    GlassScreen(
        culture = culture,
        section = GlassSection.TRANSITS,
        scrollState = scrollState,
        contentBottom = TransitsBoard.padBottom,
        onSection = { onNavigate(it.route()) },
        // The culture sheet is step 10; until then the menu opens the Voices list.
        onMenu = { onNavigate(Route.VOICES) },
    ) {
        when (state) {
            is SpansState.Loading -> LoadingLine()
            is SpansState.NoChart -> TransitEmptyState(onOpen)
            is SpansState.Error -> Text(
                state.message,
                style = TextStyle(fontFamily = Spectral, fontSize = 15.sp, lineHeight = 15.sp * 1.65f, lineHeightStyle = CssLeading),
                color = Conflict,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(horizontal = TransitsBoard.side).testTag("transits-error"),
            )
            is SpansState.Ready -> {
                val transits = remember(state) { LongTransits(state.now, state.spans) }
                LongTransitsContent(culture, transits, zone, onOpen)
            }
        }
    }
}

/** The board's numbers, in points read as dp (Glass-Transits' markup at default levers). */
private object TransitsBoard {
    val side = 24.dp
    val padBottom = 120.dp

    /** The lever sectionGap: above AHEAD. */
    val sectionGap = 22.dp

    /** The axis: 22 tall over a 1 px rule; a year's rule 1 px, its label 6 right of it. */
    val axisH = 22.dp
    val axisRule = Color(0xFFE6DECC).copy(alpha = 0.16f)
    val yearPad = 6.dp

    /** P61: 1 wide, in the axis's lower band, from 14 under its top through its rule. */
    val nowInk = Color(0xFFE6DECC).copy(alpha = 0.4f)
    val nowTop = 14.dp

    /** NOW on a bar: 1 by 7, bone, centred on the 3 tall track (the detail's span timeline marks the present so). */
    val nowTick = 7.dp

    /** A span: its title, data lines and labels 14 in, the axis and the bars on the same edge; bar track and row rule bone 10%. */
    val inset = 14.dp
    val track = Color(0xFFE6DECC).copy(alpha = 0.10f)
    val ruleRow = Color(0xFFE6DECC).copy(alpha = 0.10f)
}

/** The board's ID for the listed row [i] (open first, then ahead): P63 the first open, P65 to P68 the first four ahead, past them row-n. */
internal fun transitsRowId(i: Int, openCount: Int): String = when {
    i == 0 && openCount > 0 -> "P63"
    i >= openCount && i - openCount < 4 -> "P${65 + i - openCount}"
    else -> "row-${i + 1}"
}

private val labelStyle = mono(11.sp, 1f, 0.2f)

@Composable
private fun LoadingLine() {
    Text(
        TransitsSlots.build(null, AncientCulture.EGYPT).text("transits.loading"),
        style = mono(11.sp, 1.6f, 0.16f),
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = Modifier.fillMaxWidth().padding(horizontal = TransitsBoard.side).testTag("transits-loading")
            .semantics { contentDescription = "Computing the sky" },
    )
}

@Composable
private fun LongTransitsContent(culture: AncientCulture, transits: LongTransits, zone: ZoneId, onOpen: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = TransitsBoard.side)
    val slots = remember(transits, culture, zone) { TransitsSlots.build(transits, culture, zone) }
    val open = transits.open
    val ahead = transits.ahead
    val listed = open + ahead
    val axis = remember(transits, zone) { LongTransitsComposer.axis(listed, transits.now, zone) }

    // P57: the kicker (no institution on this page, so no script reveal).
    Text(
        slots.text("transits.kicker"),
        style = mono(11.sp, 1.6f, 0.16f),
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = side.testTag("P57"),
    )

    // P58: web's title in its own case; Rome keeps Cinzel at .08em.
    val smallCaps = LocalSmallCapsDisplay.current
    Text(
        slots.text("transits.title"),
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
        modifier = side.padding(top = 16.dp).testTag("P58").semantics { heading() },
    )

    // P59: the count line.
    slots.textOrNull("transits.countLine")?.let {
        Text(
            it,
            style = mono(11.sp, 1.6f, 0.14f),
            color = Dim,
            textAlign = TextAlign.Center,
            modifier = side.padding(top = 10.dp).testTag("P59"),
        )
    }

    // P60 to P68: the axis with its NOW mark, the groups. The axis and the bars span the text's
    // column, from 14 in on the rows' edge to their right end.
    BoxWithConstraints(side.padding(top = 30.dp)) {
        val track = maxWidth - TransitsBoard.inset
        // NOW is marked only where it lies inside the axis.
        val now = axis?.now?.takeIf { it in 0f..1f }
        Column(Modifier.fillMaxWidth()) {
            if (axis != null) YearAxis(slots.list("transits.axis"), axis.years.map { it.second }, track, now)
            val bars = axis?.bars.orEmpty()
            GroupLabel(slots.text("transits.group.open"), Bone, top = 18.dp, id = "P62")
            if (open.isEmpty()) {
                EmptyGroup(slots.text("transits.empty.open"), "transits-empty-open")
            } else {
                val titles = slots.list("transits.row.title.open")
                val data = slots.list("transits.row.data.open")
                open.forEachIndexed { i, span ->
                    SpanRow(span, titles[i], data[i], bars[i], now, first = i == 0, id = transitsRowId(i, open.size), zone = zone, onOpen = onOpen)
                }
            }
            GroupLabel(slots.text("transits.group.ahead"), Dim, top = TransitsBoard.sectionGap, id = "P64")
            if (ahead.isEmpty()) {
                EmptyGroup(slots.text("transits.empty.ahead"), "transits-empty-ahead")
            } else {
                val titles = slots.list("transits.row.title.ahead")
                val data = slots.list("transits.row.data.ahead")
                ahead.forEachIndexed { j, span ->
                    val i = open.size + j
                    SpanRow(span, titles[j], data[j], bars[i], now, first = j == 0, id = transitsRowId(i, open.size), zone = zone, onOpen = onOpen)
                }
            }
        }
    }
}

/** P60's type: mono 11/1 at .1em. */
private val axisStyle = mono(11.sp, 1f, 0.1f)

/** The gap a year label keeps from the next year's rule and from the label before it. */
private val axisLabelGap = 8.dp

/**
 * Where each year of P60 stands: the year's index, its rule's x (null for the
 * first year, which has none) and its label's left edge (null when the label
 * is dropped), every value in dp from the axis's left end. The first year's
 * label stands at the axis's start; a later year's rule at its January, its
 * label 6 right of the rule. A label is dropped, its rule kept, when it
 * cannot end before the axis's end, or when it would end within
 * [axisLabelGap] of the next year's rule (the count line carries the first
 * month, so a first label crowded by the next January goes). When a label
 * would still start within the kept one before it plus [axisLabelGap], the
 * earlier label goes.
 */
internal data class AxisMark(val index: Int, val rule: Dp?, val left: Dp?, val width: Dp)

internal fun axisMarks(positions: List<Float>, widths: List<Dp>, width: Dp): List<AxisMark> {
    val rules = positions.mapIndexed { i, p -> if (i == 0) null else width * p }
    val marks = positions.indices.map { i ->
        val left = rules[i]?.let { it + 1.dp + TransitsBoard.yearPad } ?: 0.dp
        val end = left + widths[i]
        val next = rules.getOrNull(i + 1)
        val shown = end <= width && (next == null || end <= next - axisLabelGap)
        AxisMark(i, rules[i], if (shown) left else null, widths[i])
    }.toMutableList()
    var before: Int? = null
    marks.indices.forEach { i ->
        val left = marks[i].left ?: return@forEach
        before?.let { b ->
            val prev = marks[b]
            if (left < prev.left!! + prev.width + axisLabelGap) marks[b] = prev.copy(left = null)
        }
        before = i
    }
    return marks
}

/**
 * P60: the years over a 1 px rule, mono 11/1 at .1em, dim, placed by
 * [axisMarks] on the [track] (the rows' text column, 14 in), and P61, NOW's
 * short mark in its lower band.
 */
@Composable
private fun YearAxis(labels: List<String>, positions: List<Float>, track: Dp, now: Float?) {
    val measurer = rememberTextMeasurer()
    val density = LocalDensity.current
    val widths = remember(labels, density) {
        labels.map { with(density) { measurer.measure(it, axisStyle).size.width.toDp() } }
    }
    val marks = remember(positions, widths, track) { axisMarks(positions, widths, track) }
    val first = labels.firstOrNull().orEmpty()
    val last = labels.lastOrNull().orEmpty()
    Box(
        Modifier
            .fillMaxWidth()
            .height(TransitsBoard.axisH + 1.dp)
            .testTag("P60")
            .clearAndSetSemantics { contentDescription = if (labels.size > 1) "The years $first to $last" else "The year $first" },
    ) {
        Box(Modifier.padding(start = TransitsBoard.inset).width(track).fillMaxHeight().testTag("axis-track")) {
            marks.forEach { mark ->
                mark.rule?.let { Box(Modifier.offset(x = it).width(1.dp).height(TransitsBoard.axisH).background(TransitsBoard.axisRule).testTag("axis-rule-${labels[mark.index]}")) }
                mark.left?.let { AxisLabel(labels[mark.index], axisStyle, Modifier.offset(x = it).testTag("axis-${labels[mark.index]}")) }
            }
            Box(Modifier.align(Alignment.BottomStart).fillMaxWidth().height(1.dp).background(TransitsBoard.axisRule))
            now?.let {
                Box(
                    Modifier
                        // At 1.0 the mark stays on the axis: its last dp, not one past it.
                        .offset(x = minOf(track * it, track - 1.dp), y = TransitsBoard.nowTop)
                        .width(1.dp)
                        .height(TransitsBoard.axisH + 1.dp - TransitsBoard.nowTop)
                        .background(TransitsBoard.nowInk)
                        .testTag("P61"),
                )
            }
        }
    }
}

@Composable
private fun AxisLabel(text: String, style: TextStyle, modifier: Modifier) {
    // CSS line-height 1: an 11 box with the glyphs overflowing it, as on the board.
    Text(text, style = style, color = Dim, softWrap = false, modifier = modifier.height(11.dp).wrapContentHeight(unbounded = true))
}

/** P62, P64: the plain section label, mono 11/1 at .2em, 14 in; OPEN NOW in bone, AHEAD dim. */
@Composable
private fun GroupLabel(text: String, ink: Color, top: Dp, id: String) {
    Text(
        text,
        style = labelStyle,
        color = ink,
        // CSS line-height 1: the box is 11 tall, the glyphs overflow it, as on the board.
        modifier = Modifier
            .padding(top = top)
            .fillMaxWidth()
            .height(11.dp)
            .testTag(id)
            .wrapContentHeight(unbounded = true)
            .padding(start = TransitsBoard.inset)
            .semantics { heading() },
    )
}

/** web's empty group line (`transits.empty.*`): mono, dim, centred, 24 above and below, the row's rule under it. */
@Composable
private fun EmptyGroup(text: String, id: String) {
    Column(Modifier.fillMaxWidth().testTag(id).dpadStop()) {
        Text(
            text,
            style = mono(11.sp, 1.4f, 0.08f),
            color = Dim,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
        )
        Box(Modifier.fillMaxWidth().height(1.dp).background(TransitsBoard.ruleRow))
    }
}

/**
 * P63, P65 to P68: a span. 12 above the first of its group, 16 above the
 * rest, 18 below, a 1 px rule under it. Web's title (Spectral SC 500 15/1.4
 * at .06em, the accent for a received body as web's isReceived) on two
 * balanced lines ([twoLineWidth]), 12 above the bar: a 3 tall track on the
 * text's edge with the span's months filled, harmony for ease, conflict for
 * tension, and NOW's tick. Web's data 10 under it on two lines
 * ([rowDataLines]): the months, then the counts and the tone word, the
 * tension word in the conflict ink. The whole row opens the transit on top, with the pressed fill
 * P170 under the finger and web's focus outline for a D-pad, shown clear of
 * the glass.
 */
@Composable
private fun SpanRow(
    span: TransitSpan,
    title: String,
    data: String,
    bar: TransitBar,
    now: Float?,
    first: Boolean,
    id: String,
    zone: ZoneId,
    onOpen: (String) -> Unit,
) {
    val tense = spanTone(span) == SpanTone.TENSION
    val smallCaps = LocalSmallCapsDisplay.current
    val (range, counts) = rowDataLines(data)
    // The tone word, inked: after the counts' last separator; the whole line when it is the tone word alone; none
    // when the line has no separator and is not the tone word.
    val toneAt = counts.lastIndexOf(" · ").let { at ->
        when {
            at >= 0 -> at + 3
            counts == LongTransitsComposer.toneWord(span) -> 0
            else -> counts.length
        }
    }
    val spoken = remember(title, data, span, zone) { spokenRow(title, span, data, zone) }
    Column(
        Modifier
            .fillMaxWidth()
            .testTag(id)
            .glassClearFocus()
            .rowPress("Read the transit", onClick = { onOpen(Route.transitDetail(span.id)) })
            .clearAndSetSemantics { contentDescription = spoken },
    ) {
        Column(Modifier.fillMaxWidth().padding(top = if (first) 12.dp else 16.dp, bottom = 18.dp)) {
            TwoLineTitle(
                title,
                TextStyle(
                    fontFamily = if (smallCaps) SpectralSc else Cinzel,
                    fontWeight = FontWeight.Medium,
                    fontSize = 15.sp,
                    lineHeight = 15.sp * 1.4f,
                    letterSpacing = if (smallCaps) 0.06.em else 0.08.em,
                    lineHeightStyle = CssLeading,
                    lineBreak = LineBreak.Heading,
                ),
                color = if (span.transitPlanet.isReceived) LocalAccent.current else Bone,
                modifier = Modifier.padding(start = TransitsBoard.inset).testTag("$id-title"),
            )
            SpanBar(bar, now, if (tense) Conflict else Harmony, Modifier.padding(top = 12.dp, start = TransitsBoard.inset).testTag("$id-bar"), "$id-now")
            Column(Modifier.padding(top = 10.dp, start = TransitsBoard.inset).testTag("$id-data")) {
                val style = mono(11.sp, 1.4f, 0.08f)
                Text(range, style = style, color = Dim)
                if (counts.isNotEmpty()) {
                    Text(
                        buildAnnotatedString {
                            append(counts.substring(0, toneAt))
                            if (tense) withStyle(SpanStyle(color = Conflict)) { append(counts.substring(toneAt)) } else append(counts.substring(toneAt))
                        },
                        style = style,
                        color = Dim,
                    )
                }
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(TransitsBoard.ruleRow))
    }
}

/**
 * The 3 tall track across the axis's width, its fill from the span's start
 * month over the months it covers, and NOW's 1 by 7 bone tick centred on it
 * when [now] lies inside the axis.
 */
@Composable
private fun SpanBar(bar: TransitBar, now: Float?, fill: Color, modifier: Modifier, nowTag: String) {
    BoxWithConstraints(modifier.fillMaxWidth().height(3.dp).background(TransitsBoard.track)) {
        Box(
            Modifier
                .offset(x = maxWidth * bar.left)
                .width(maxWidth * bar.width.coerceAtMost(1f - bar.left))
                .fillMaxHeight()
                .background(fill),
        )
        now?.let {
            // requiredHeight centres the 7 on the 3 tall track.
            Box(Modifier.offset(x = minOf(maxWidth * it, maxWidth - 1.dp)).width(1.dp).requiredHeight(TransitsBoard.nowTick).background(Bone).testTag(nowTag))
        }
    }
}

/**
 * The row's data on its two lines: the catalog's formatted `transits.row.data`
 * (or `dataNoAhead`) split at its first " · ", after the range. "OCT 2026 →
 * JUN 2027 · 3 EXACT · 2 AHEAD · EASE" gives "OCT 2026 → JUN 2027" and "3
 * EXACT · 2 AHEAD · EASE"; a string without the separator stays on one line.
 */
internal fun rowDataLines(data: String): Pair<String, String> {
    val at = data.indexOf(" · ")
    return if (at < 0) data to "" else data.substring(0, at) to data.substring(at + 3)
}

/**
 * The width, in px, that sets a [text] which fits on one line of [maxWidth]
 * on two balanced lines (Matthew, 2026-11-01): one pixel under its one-line
 * width, so [style]'s LineBreak.Heading balances the break. Null keeps
 * [maxWidth]: the title already wraps (LineBreak.Heading balances it), or
 * two lines would leave a word alone.
 */
internal fun twoLineWidth(measurer: TextMeasurer, text: String, style: TextStyle, maxWidth: Int): Int? {
    val one = measurer.measure(text, style, constraints = Constraints(maxWidth = maxWidth))
    if (one.lineCount != 1) return null
    // The line's own width (the layout's is the whole measure), less a pixel.
    val narrow = kotlin.math.ceil(one.getLineRight(0) - one.getLineLeft(0)).toInt() - 1
    if (narrow <= 0) return null
    val two = measurer.measure(text, style, constraints = Constraints(maxWidth = narrow))
    if (two.lineCount != 2) return null
    val lines = (0 until 2).map { text.substring(two.getLineStart(it), two.getLineEnd(it)) }
    return narrow.takeIf { lines.all { wordCount(it) >= 2 } }
}

/** A row title on two balanced lines at every width ([twoLineWidth]). */
@Composable
private fun TwoLineTitle(text: String, style: TextStyle, color: Color, modifier: Modifier) {
    BoxWithConstraints(modifier) {
        val measurer = rememberTextMeasurer()
        val maxPx = constraints.maxWidth
        val set = LocalTextStyle.current.merge(style)
        val narrow = remember(text, set, maxPx, measurer) { twoLineWidth(measurer, text, set, maxPx) }
        val width = narrow?.let { with(LocalDensity.current) { Modifier.widthIn(max = it.toDp()) } } ?: Modifier
        Text(text, style = style, color = color, modifier = width)
    }
}

/**
 * The row as TalkBack reads it, without the arrow or the dots: "amun rows in
 * time with your rising, october 2026 to june 2027, 3 exact, 2 ahead, ease".
 */
internal fun spokenRow(title: String, span: TransitSpan, data: String, zone: ZoneId): String {
    fun month(d: java.util.Date): String {
        val z = Instant.ofEpochMilli(d.time).atZone(zone)
        return "${z.month.getDisplayName(MonthStyle.FULL, Locale.ENGLISH).lowercase()} ${z.year}"
    }
    val counts = data.split(" · ").drop(1).joinToString(", ") { it.lowercase() }
    return "${title.lowercase()}, ${month(span.start)} to ${month(span.end)}, $counts"
}

/**
 * Web's TransitEmptyState, its words as web hard-codes them (no catalog key):
 * the kicker, the 44 wide accent rule, the headline, the sentence, the votive
 * button CAST THE FIRST CHART (opens the cast screen on top, so saving a
 * chart comes back here), and the device note. Web centres it in 400 with 40
 * above.
 */
@Composable
private fun TransitEmptyState(onOpen: (String) -> Unit) {
    val accent = LocalAccent.current
    val smallCaps = LocalSmallCapsDisplay.current
    Column(
        Modifier.fillMaxWidth().padding(horizontal = TransitsBoard.side).padding(top = 40.dp).testTag("transits-cast"),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("THE LONG TRANSITS", style = mono(11.sp, 1.65f, 0.18f), color = Dim, textAlign = TextAlign.Center)
        Box(Modifier.padding(vertical = 20.dp).width(44.dp).height(1.dp).background(accent))
        Text(
            "THE LONG TRANSITS ARE READ AGAINST A CHART",
            style = TextStyle(
                fontFamily = if (smallCaps) SpectralSc else Cinzel,
                fontSize = 22.sp,
                lineHeight = 22.sp * 1.1f,
                letterSpacing = if (smallCaps) 0.06.em else 0.16.em,
                lineHeightStyle = CssLeading,
            ),
            color = Bone,
            textAlign = TextAlign.Center,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            "A long transit is scored against your own sky, the chart cast once at the hour of your birth and kept.",
            style = TextStyle(fontFamily = Spectral, fontSize = 15.sp, lineHeight = 15.sp * 1.65f, lineHeightStyle = CssLeading),
            color = Prose,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 14.dp).widthIn(max = 360.dp),
        )
        val source = remember { MutableInteractionSource() }
        Box(
            Modifier
                .padding(top = 26.dp)
                .glassClearFocus()
                .focusOutline(source)
                .semantics { contentDescription = "Cast the first chart" }
                .clickable(source, indication = null, role = Role.Button, onClickLabel = "Open") { onOpen(Route.READING) }
                .border(1.dp, accent)
                .testTag("transits-cast-link")
                .heightIn(min = 48.dp)
                .padding(horizontal = 26.dp, vertical = 12.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text("CAST THE FIRST CHART", style = mono(12.sp, 1.65f, 0.18f), color = accent)
        }
        Text(
            "KEPT ON THIS DEVICE · AN ACCOUNT ADDS SYNC",
            style = mono(11.sp, 1.65f, 0.04f),
            color = Dim,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 14.dp).semantics { contentDescription = "Kept on this device; an account adds sync" },
        )
    }
}
