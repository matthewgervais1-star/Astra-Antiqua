package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.RectangleShape
import com.astra.antiqua.ui.theme.glass.GlassInk
import com.astra.antiqua.ui.theme.glass.drawLitFill
import com.astra.antiqua.ui.theme.glass.focusOutline
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.ChartContact
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.DayTone
import com.astra.antiqua.domain.LongTransitPick
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.SkyDay
import com.astra.antiqua.domain.SkyDaySlots
import com.astra.antiqua.domain.SlotMap
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.MethodFooter
import com.astra.antiqua.ui.components.ScriptName
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalSmallCapsDisplay
import com.astra.antiqua.ui.theme.PlexMono
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spectral
import com.astra.antiqua.ui.theme.SpectralSc
import com.astra.antiqua.ui.theme.glass.GlassScreen
import com.astra.antiqua.ui.theme.glass.GlassSection
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SkyDayViewModel
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DashboardViewModel
import com.astra.antiqua.viewmodel.DayExtras
import com.astra.antiqua.ui.components.SectionDivider
import java.util.Calendar
import java.util.Date

/**
 * SKY · DAY on the glass chrome (canvas board Glass-Day; placement table
 * P4 to P16 in the design worktree's `.superpowers/sdd/glass-build/report.md`).
 * The board's sections in its order, filled with the web's composition
 * (Matthew's popup answers of 2026-10-31 for the iPhone, carried to Android):
 * the kicker with the institution, the day page's headline, evidence line and
 * paragraph, the Moon and the season, web's "where the day falls" contacts,
 * and web's long-transit pick. Every printed string comes from the slot map
 * [SkyDaySlots] builds over the shared catalog (shared/strings/en.json), the
 * map ScreenGoldenTest holds to web's day golden. The votive, the footer
 * links, the feedback row, the lists, the dive deeper and the come-back line
 * stay off Sky Day (layout).
 */
@Composable
fun SkyDayScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val model: SkyDayViewModel = viewModel(factory = AstraViewModelFactory)
    val day by model.day.collectAsState()
    LaunchedEffect(culture) { model.load(culture) }

    // The old Day page's sections, below Sky Day (Matthew, 2026-10-31: "Keep them
    // below Sky Day"), from the view model that has always composed them.
    val dashboard: DashboardViewModel = viewModel(factory = AstraViewModelFactory)
    val chartState by dashboard.chartState.collectAsState()
    val extras by dashboard.dayExtras.collectAsState()
    LaunchedEffect(culture) { dashboard.calculateChart() }

    SkyDayFrame(
        culture = culture,
        day = day,
        onNavigate = onNavigate,
        onOpen = onOpen,
    ) {
        OldDaySections(culture, chartState, extras)
    }
}

/**
 * The old Day page's natal wheel, Sun and Moon readings, Do and Don't lists
 * and dive deeper, flat on the ground under the board's sections. Not on the
 * canvas: drawn with the components they always had, inside the board's margins.
 */
@Composable
internal fun OldDaySections(culture: AncientCulture, chartState: ChartState, extras: DayExtras?) {
    Column(
        Modifier.fillMaxWidth().padding(horizontal = Board.side).padding(top = 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        extras?.let {
            DayListsCard(culture = culture, permissions = it.permissions, fromChart = it.listsFromChart)
            DiveDeeperSection(diveDeeper = it.diveDeeper)
        }
        if (chartState is ChartState.Success) {
            Box(Modifier.fillMaxWidth().height(360.dp), contentAlignment = Alignment.Center) {
                NatalWheel(chartData = chartState.chartData, culture = culture)
            }
            SectionDivider(label = "Decrees of the Oracle")
            chartState.bigThreePlacements.forEach { reading ->
                OracleDecreeCard(reading = reading, culture = culture)
                Spacer(Modifier.height(18.dp))
            }
        }
    }
}

/** The tab a section opens; MORE opens the Learn hub until step 10 builds More (Matthew, 2026-10-31). */
fun GlassSection.route(): String = when (this) {
    GlassSection.SKY -> Route.DAY
    GlassSection.TRANSITS -> Route.TRANSITS
    GlassSection.CHART -> Route.PLACEMENTS
    GlassSection.MORE -> Route.learn("/learn")
}

/** Sky Day inside its chrome, from a composed [day]; the screenshot test draws this. */
@Composable
fun SkyDayFrame(
    culture: AncientCulture,
    day: SkyDay?,
    onNavigate: (String) -> Unit = {},
    onOpen: (String) -> Unit = {},
    scrollState: androidx.compose.foundation.ScrollState = androidx.compose.foundation.rememberScrollState(),
    /** Sections under the board's, before the method line. */
    below: @Composable () -> Unit = {},
) {
    GlassScreen(
        culture = culture,
        section = GlassSection.SKY,
        horizon = Horizon.DAY,
        scrollState = scrollState,
        contentBottom = Board.padBottom,
        onSection = { onNavigate(it.route()) },
        onHorizon = { onNavigate(it.route) },
        // The culture sheet is step 10; until then the menu opens the Voices list,
        // where the account's "change culture" already goes.
        onMenu = { onNavigate(Route.VOICES) },
    ) {
        if (day != null) SkyDayContent(culture, day, onNavigate, onOpen, below)
    }
}

/** The board's numbers, in points read as dp (Glass-Day's markup at default levers). */
private object Board {
    val side = 24.dp
    val padBottom = 140.dp
    val ruleSection = Color(0xFFE6DECC).copy(alpha = 0.16f)
    val ruleRow = Color(0xFFE6DECC).copy(alpha = 0.10f)
    val ruleShort = Color(0xFFE6DECC).copy(alpha = 0.32f)
    val cardBorder = Color(0xFFE6DECC).copy(alpha = 0.24f)
    val track = Color(0xFFE6DECC).copy(alpha = 0.14f)
}

/**
 * CSS line boxes: the leading split evenly above and below every line, the
 * first and last included, so a box is its line-height times its lines as on
 * the board. Compose trims the outer half-leadings by default.
 */
internal val CssLeading = LineHeightStyle(LineHeightStyle.Alignment.Center, LineHeightStyle.Trim.None)

internal fun mono(size: TextUnit, lineHeight: Float, tracking: Float, weight: FontWeight = FontWeight.Normal) = TextStyle(
    fontFamily = PlexMono,
    fontWeight = weight,
    fontSize = size,
    lineHeight = size * lineHeight,
    letterSpacing = tracking.em,
    lineHeightStyle = CssLeading,
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SkyDayContent(
    culture: AncientCulture,
    day: SkyDay,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
    below: @Composable () -> Unit,
) {
    val side = Modifier.fillMaxWidth().padding(horizontal = Board.side)
    val slots = remember(day, culture) { SkyDaySlots.build(day, culture) }

    // P4: the kicker, the date and the institution, the institution as a script name
    // (its Latin form is the catalog's common.institution).
    val kicker = mono(11.sp, 1.6f, 0.16f)
    FlowRow(
        modifier = side.testTag("P4"),
        horizontalArrangement = Arrangement.Center,
    ) {
        Text(slots.text("day.kicker").removeSuffix(SharedStrings.COMMON_INSTITUTION.getValue(culture)), style = kicker, color = Dim)
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

    // P5: the god the headline speaks of.
    day.headlineBody?.let { body ->
        Box(Modifier.fillMaxWidth().padding(top = 24.dp), contentAlignment = Alignment.Center) {
            DeityGlyph(body = body, culture = culture, size = 34.dp, modifier = Modifier.testTag("P5"))
        }
    }

    // P6: the headline in its own case, as the board sets it: Spectral SC draws
    // the capitals full and the rest as small capitals; Rome keeps Cinzel at
    // .08em (Round 6), which has capitals only.
    val smallCaps = LocalSmallCapsDisplay.current
    Text(
        text = slots.text("day.headline"),
        style = TextStyle(
            fontFamily = if (smallCaps) SpectralSc else Cinzel,
            fontWeight = FontWeight.Medium,
            fontSize = 26.sp,
            lineHeight = 26.sp * 1.35f,
            letterSpacing = if (smallCaps) 0.06.em else 0.08.em,
            lineHeightStyle = CssLeading,
            lineBreak = LineBreak.Heading,
        ),
        color = Bone,
        textAlign = TextAlign.Center,
        modifier = side.padding(top = 16.dp).testTag("P6").semantics { heading() },
    )

    // P7: the evidence line.
    slots.textOrNull("day.evidence")?.let { evidence ->
        Text(
            text = evidence,
            style = mono(11.sp, 1.6f, 0.14f),
            color = Dim,
            textAlign = TextAlign.Center,
            modifier = side.padding(top = 10.dp).testTag("P7"),
        )
    }

    // P8: the short rule.
    Box(Modifier.fillMaxWidth().padding(vertical = 24.dp), contentAlignment = Alignment.Center) {
        Box(Modifier.width(44.dp).height(1.dp).background(Board.ruleShort).testTag("P8"))
    }

    // P9: the paragraph.
    Text(
        text = slots.list("day.paragraph").joinToString("\n\n"),
        style = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 18.sp, lineHeight = 18.sp * 1.65f, lineHeightStyle = CssLeading),
        color = Prose,
        modifier = side.testTag("P9"),
    )

    SectionLabel(slots.text("day.sky.label"), "P10", bottom = 14.dp)
    SkyBox(day, slots, Modifier.padding(horizontal = Board.side).testTag("P11"))

    day.contacts?.takeIf { it.isNotEmpty() }?.let { contacts ->
        SectionLabel(slots.text("day.chart.label"), "P12", bottom = 4.dp)
        val sentences = slots.list("day.chart.row.sentence")
        val data = slots.list("day.chart.row.data")
        contacts.forEachIndexed { i, contact ->
            // The board draws two rows, P13 and P14; a day with more contacts adds rows past them.
            val id = if (i < 2) "P${13 + i}" else "row-${i + 1}"
            ContactRow(culture, contact, sentences[i], data[i], onClick = { onNavigate(Route.TRANSITS) }, modifier = Modifier.testTag(id))
        }
    }

    day.longTransit?.let { pick ->
        SectionLabel(slots.text("day.longTransit.label"), "P15", bottom = 14.dp)
        LongTransitCard(pick, slots, onClick = { onOpen(Route.transitDetail(pick.span.id)) })
    }

    below()

    // The line every reading closes with, and the only way to the Method page
    // until More (step 10). Not on the board.
    MethodFooter(onOpenMethod = { onOpen(Route.METHOD) }, modifier = Modifier.padding(top = 40.dp))
}

/** A section label between two rules, 40 above it (P10, P12, P15). */
@Composable
private fun SectionLabel(text: String, id: String, bottom: Dp) {
    Row(
        // CSS line-height 1: the label's box is 11 tall and the glyphs overflow it,
        // as on the board; at a large font scale they overflow further, into the
        // margin under the label.
        modifier = Modifier.fillMaxWidth().padding(horizontal = Board.side).padding(top = 40.dp, bottom = bottom).heightIn(min = 11.dp).testTag(id),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(Modifier.weight(1f).height(1.dp).background(Board.ruleSection))
        Text(text, style = mono(11.sp, 1f, 0.2f), color = Dim, modifier = Modifier.height(11.dp).wrapContentHeight(unbounded = true).semantics { heading() })
        Box(Modifier.weight(1f).height(1.dp).background(Board.ruleSection))
    }
}

/** P11: the Moon, the next quarter and the season, with the season's bar; each slot's lines are label then value. */
@Composable
private fun SkyBox(day: SkyDay, slots: SlotMap, modifier: Modifier) {
    val data = mono(12.sp, 1.4f, 0.06f)
    @Composable
    fun line(label: String, value: String, ruled: Boolean, bottom: Dp = 13.dp) {
        Column {
            Row(
                Modifier.fillMaxWidth().padding(top = 13.dp, bottom = bottom),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text(label, style = data, color = Dim)
                Text(value, style = data, color = Bone, textAlign = TextAlign.End, modifier = Modifier.weight(1f))
            }
            if (ruled) Box(Modifier.fillMaxWidth().height(1.dp).background(Board.ruleRow))
        }
    }
    val season = day.season
    Column(modifier.fillMaxWidth().border(1.dp, Board.ruleSection).padding(horizontal = 16.dp, vertical = 4.dp)) {
        val (moonLabel, moonValue) = slots.lines("day.sky.moon")
        line(moonLabel, moonValue, ruled = true)
        slots.textOrNull("day.sky.nextQuarter")?.split("\n")?.let { (quarter, date) -> line(quarter, date, ruled = true) }
        val (seasonLabel, seasonValue) = slots.lines("day.sky.season")
        line(seasonLabel, seasonValue, ruled = false, bottom = 10.dp)
        Column(Modifier.padding(top = 4.dp, bottom = 14.dp)) {
            Bar(season.dayOfSeason.toFloat() / season.totalDays, Bone)
            Row(Modifier.fillMaxWidth().padding(top = 9.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                val small = mono(11.sp, 1f, 0.1f)
                slots.list("day.sky.bar").forEach { Text(it, style = small, color = Dim) }
            }
        }
    }
}

/**
 * A tappable content block: square, flat. A list row takes the approved
 * pressed fill under the finger (P170, rgba(230,222,204,.26) with the .24
 * highlight); the long-transit card, a data box, has no pressed state on the
 * canvas and takes none. Both draw web's focus outline for a D-pad.
 */
@Composable
internal fun Modifier.rowPress(label: String, onClick: () -> Unit, pressFill: Boolean = true): Modifier {
    val source = remember { MutableInteractionSource() }
    val pressed by source.collectIsPressedAsState()
    return this
        .focusOutline(source)
        .drawBehind { if (pressFill && pressed) drawLitFill(RectangleShape, GlassInk.pressed, GlassInk.pressedHighlight) }
        .clickable(source, indication = null, role = Role.Button, onClickLabel = label, onClick = onClick)
}

/** A 3-tall track with its fill. */
@Composable
private fun Bar(fraction: Float, fill: Color) {
    Box(Modifier.fillMaxWidth().height(3.dp).background(Board.track)) {
        Box(Modifier.fillMaxWidth(fraction.coerceIn(0f, 1f)).fillMaxHeight().background(fill))
    }
}

/** One contact: the glyph, the web's sentence, and the board's data line, its tension word in the conflict ink. */
@Composable
private fun ContactRow(culture: AncientCulture, contact: ChartContact, sentence: String, dataLine: String, onClick: () -> Unit, modifier: Modifier) {
    val tense = DayDecreeComposer.toneFor(contact.aspect) == DayTone.TENSION
    val toneAt = dataLine.lastIndexOf(" · ") + 3
    val data = buildAnnotatedString {
        append(dataLine.substring(0, toneAt))
        if (tense) withStyle(SpanStyle(color = Conflict)) { append(dataLine.substring(toneAt)) } else append(dataLine.substring(toneAt))
    }
    Column(Modifier.padding(horizontal = Board.side).then(modifier)) {
        Row(
            Modifier
                .fillMaxWidth()
                .rowPress("Open Transits", onClick)
                .padding(vertical = 16.dp),
        ) {
            Box(Modifier.width(26.dp).padding(top = 3.dp)) {
                DeityGlyph(body = contact.transit, culture = culture, size = 24.dp)
            }
            Spacer(Modifier.width(14.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    sentence,
                    style = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Normal, fontSize = 17.sp, lineHeight = 17.sp * 1.5f, lineHeightStyle = CssLeading),
                    color = Bone,
                )
                Text(data, style = mono(11.sp, 1.4f, 0.1f).copy(lineBreak = LineBreak.Heading), color = Dim)
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(Board.ruleRow))
    }
}

/** P16: the long transit, from web's pick, in the board's card: web's two title lines, the board's meta and footer. */
@Composable
private fun LongTransitCard(pick: LongTransitPick, slots: SlotMap, onClick: () -> Unit) {
    Column(
        Modifier
            .padding(horizontal = Board.side)
            .fillMaxWidth()
            .testTag("P16")
            .border(1.dp, Board.cardBorder)
            .rowPress("Read the long transit", onClick, pressFill = false)
            .padding(start = 18.dp, end = 18.dp, top = 18.dp, bottom = 16.dp),
    ) {
        Text(slots.text("day.longTransit.meta"), style = mono(11.sp, 1.4f, 0.14f).copy(lineBreak = LineBreak.Heading), color = Dim)
        Text(
            slots.text("day.longTransit.title"),
            style = TextStyle(fontFamily = SpectralSc, fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 16.sp * 1.45f, letterSpacing = 0.06.em, lineHeightStyle = CssLeading),
            color = Bone,
            modifier = Modifier.padding(top = 10.dp, bottom = 16.dp),
        )
        Bar(pick.progress, LocalAccent.current)
        Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            val small = mono(11.sp, 1f, 0.1f)
            Text(slots.text("day.longTransit.footer"), style = small, color = Dim)
            Text(slots.text("day.longTransit.link"), style = small, color = Bone)
        }
    }
}
