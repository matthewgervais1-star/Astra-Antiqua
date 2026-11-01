package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.ui.semantics.Role
import com.astra.antiqua.ui.components.FeedbackRow
import com.astra.antiqua.ui.theme.Rule
import androidx.compose.foundation.focusable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.relocation.bringIntoViewRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.layout.onSizeChanged
import kotlinx.coroutines.launch
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineBreak
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.SeasonRowTone
import com.astra.antiqua.domain.SeasonSkyRow
import com.astra.antiqua.domain.SkySeason
import com.astra.antiqua.domain.SkySeasonComposer
import com.astra.antiqua.domain.SkySeasonSlots
import com.astra.antiqua.domain.SlotMap
import com.astra.antiqua.domain.generated.SharedStrings
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.components.DeityGlyph
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
import com.astra.antiqua.ui.theme.Spectral
import com.astra.antiqua.ui.theme.SpectralSc
import com.astra.antiqua.ui.theme.glass.GlassScreen
import com.astra.antiqua.ui.theme.glass.GlassSection
import com.astra.antiqua.ui.theme.glass.focusOutline
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SkySeasonViewModel
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.sin

/**
 * SKY · SEASON on the glass chrome (canvas boards Glass-Season and
 * Glass-Season-scrolled; placement table P32 to P42 and P54 in the design
 * worktree's `.superpowers/sdd/glass-build/report-r3b.md`). The board's
 * sections in its order, filled with the web's season (SeasonNave.tsx,
 * seasonContent.ts, lib/season.ts): the institution, the title, the bar's
 * fill and its day line, the sign's blurb, the house sentence, the season's
 * sky rows. The kicker's date range, the bar's end dates, the house title and
 * the wheel are the board's own forms.
 */
@Composable
fun SkySeasonScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val model: SkySeasonViewModel = viewModel(factory = AstraViewModelFactory)
    val season by model.season.collectAsState()
    LaunchedEffect(culture) { model.load(culture) }
    SkySeasonFrame(culture = culture, season = season, onNavigate = onNavigate, onOpen = onOpen)
}

/** Sky Season inside its chrome, from a composed [season]; the screenshot test draws this. */
@Composable
fun SkySeasonFrame(
    culture: AncientCulture,
    season: SkySeason?,
    onNavigate: (String) -> Unit = {},
    onOpen: (String) -> Unit = {},
    scrollState: ScrollState = rememberScrollState(),
) {
    GlassScreen(
        culture = culture,
        section = GlassSection.SKY,
        horizon = Horizon.SEASON,
        scrollState = scrollState,
        contentBottom = SeasonBoard.padBottom,
        onSection = { onNavigate(it.route()) },
        onHorizon = { onNavigate(it.route) },
        // The culture sheet is step 10; until then the menu opens the Voices list.
        onMenu = { onNavigate(Route.VOICES) },
    ) {
        if (season != null) SkySeasonContent(culture, season, onNavigate, onOpen)
    }
}

/** The board's numbers, in points read as dp (Glass-Season's markup at default levers). */
private object SeasonBoard {
    val side = 24.dp
    val padBottom = 120.dp
    val sectionGap = 36.dp
    val ruleSection = Color(0xFFE6DECC).copy(alpha = 0.16f)
    val ruleRow = Color(0xFFE6DECC).copy(alpha = 0.10f)
    val track = Color(0xFFE6DECC).copy(alpha = 0.14f)

    /** P54: the wheel, 120 across in a 120 view box; radii 56, 30 and the Sun's ring on 43. */
    val wheelSize = 120.dp
    const val outer = 56f
    const val inner = 30f
    const val mark = 43f
    val houseFill = Color(0xFFE6DECC).copy(alpha = 0.14f)

    /** The glass over the page: P20's 173 at the top, the tab bar's 96 at the foot. */
    val glassTop = 173.dp
    val glassFoot = 96.dp
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SkySeasonContent(culture: AncientCulture, season: SkySeason, onNavigate: (String) -> Unit, onOpen: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = SeasonBoard.side)
    val window = season.window
    val slots = remember(season, culture) { SkySeasonSlots.build(season, culture) }

    // P32: the kicker, the season's dates and the institution, the institution as a script name.
    val kicker = mono(11.sp, 1.6f, 0.16f)
    FlowRow(modifier = side.testTag("P32"), horizontalArrangement = Arrangement.Center) {
        val range = slots.text("season.kicker").removeSuffix(SharedStrings.COMMON_INSTITUTION.getValue(culture))
        Text(
            range,
            style = kicker,
            color = Dim,
            modifier = Modifier.semantics { contentDescription = range.removeSuffix(" · ").replace("→", "to") },
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

    // P33: the Sun's god.
    Box(Modifier.fillMaxWidth().padding(top = 24.dp), contentAlignment = Alignment.Center) {
        DeityGlyph(body = Planet.SUN, culture = culture, size = 34.dp, modifier = Modifier.testTag("P33"))
    }

    // P34: web's title in its own case; Rome keeps Cinzel at .08em.
    val smallCaps = LocalSmallCapsDisplay.current
    Text(
        text = slots.text("season.title"),
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
        modifier = side.padding(top = 16.dp).testTag("P34").semantics { heading() },
    )

    // P35: the bar at web's fill, the board's end dates and web's day line between them.
    Column(side.padding(top = 22.dp).testTag("P35")) {
        Box(Modifier.fillMaxWidth().height(3.dp).background(SeasonBoard.track)) {
            Box(Modifier.fillMaxWidth(season.barPercent / 100f).fillMaxHeight().background(Bone))
        }
        // CSS line-height 1: at the default font scale the row is 11 tall and the glyphs
        // overflow it, as on the board. Past it, or when the day line wraps in the width the
        // dates leave (a 360 dp phone), the row takes the text's own height.
        Row(Modifier.fillMaxWidth().padding(top = 9.dp), verticalAlignment = Alignment.CenterVertically) {
            val small = mono(11.sp, 1f, 0.1f)
            val dayLine = slots.text("season.dayLine")
            var lines by remember(dayLine) { mutableIntStateOf(1) }
            val box = if (LocalDensity.current.fontScale <= 1f && lines == 1) Modifier.height(11.dp).wrapContentHeight(unbounded = true) else Modifier
            Text(SkySeasonComposer.dayMonth(window.start), style = small, color = Dim, modifier = box)
            Text(
                dayLine,
                style = small,
                color = Bone,
                textAlign = TextAlign.Center,
                onTextLayout = { lines = it.lineCount },
                modifier = box.weight(1f).testTag("season-status"),
            )
            Text(SkySeasonComposer.dayMonth(window.end), style = small, color = Dim, modifier = box)
        }
    }

    // P36: the sign's blurb.
    Text(
        slots.text("season.signProse"),
        style = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 18.sp, lineHeight = 18.sp * 1.65f, lineHeightStyle = CssLeading),
        color = Prose,
        modifier = side.padding(top = 26.dp).testTag("P36").dpadStop(),
    )

    // P37 to P39 and P54: the house the season walks through, centred; with no
    // birth record, web's WHAT IT TOUCHES sentence for the sky alone.
    val house = season.house
    val ascendant = season.ascendant
    if (house != null && ascendant != null) {
        SeasonLabel(slots.text("season.chart.label"), "P37", bottom = 16.dp)
        Text(
            slots.text("season.chart.houseHeading"),
            style = TextStyle(fontFamily = SpectralSc, fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 16.sp * 1.45f, letterSpacing = 0.06.em, lineHeightStyle = CssLeading, lineBreak = LineBreak.Heading),
            color = Bone,
            textAlign = TextAlign.Center,
            modifier = side.testTag("P38").semantics { heading() },
        )
        Text(
            slots.text("season.chart.prose"),
            style = lessonProse,
            color = Prose,
            textAlign = TextAlign.Center,
            modifier = side.padding(top = 10.dp).testTag("P39").dpadStop(),
        )
        Box(Modifier.fillMaxWidth().padding(top = 16.dp), contentAlignment = Alignment.Center) {
            HouseWheel(ascendant, season.sun, house)
        }
    } else {
        // Without a chart web's WHAT IT TOUCHES section stands where the house block would.
        val touches = slots.list("season.sections")[2].split("\n", limit = 2)
        SeasonLabel(touches[0], "P37", bottom = 16.dp)
        Text(touches[1], style = lessonProse, color = Prose, textAlign = TextAlign.Center, modifier = side.testTag("P39").dpadStop())
    }

    // P40 to P42: the season's sky, web's rows in the board's ruled rows.
    SeasonLabel(slots.text("season.sky.label"), "P40", bottom = 4.dp)
    val rowText = slots.list("season.sky.row")
    season.rows.forEachIndexed { i, row ->
        // The board draws two rows, P41 and P42; a season with more adds rows past them.
        SkyRow(row, rowText[i], if (i < 2) "P${41 + i}" else "row-${i + 1}")
    }

    WebSeasonSections(season, slots, onNavigate, onOpen)
}

/**
 * The web season's own sections, not on the board, flat on the ground below
 * the season's sky in the web's order (Matthew, 2026-10-31, "Below the board,
 * as Week"): WHAT IS CHANGING, WHERE IT BEGINS and WHAT IT LEAVES BEHIND
 * (WHAT IT TOUCHES is P37 to P39 above), the votive, the feedback row, the
 * call to cast a chart when there is none, and the four links. Spacing is the
 * web's (gap-7 between sections, gap-2.5 under each label, mt-8, mt-6, mt-9);
 * the first section opens 40 under the rows, as Week's thesis does.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun WebSeasonSections(season: SkySeason, slots: SlotMap, onNavigate: (String) -> Unit, onOpen: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = SeasonBoard.side)
    // season.sections: each a label over its sentence; WHAT IT TOUCHES (no chart) is drawn above as P37 to P39.
    val sections = slots.list("season.sections").map { it.split("\n", limit = 2) }
    val ids = listOf("season-changing", "season-begins", "season-leaves")
    listOf(sections.first(), sections[1], sections.last()).forEachIndexed { i, (label, body) ->
        val id = ids[i]
        SeasonLabel(label, "$id-label", bottom = 10.dp, top = if (i == 0) 40.dp else 28.dp)
        Text(
            body,
            style = TextStyle(fontFamily = Spectral, fontSize = 17.sp, lineHeight = 17.sp * 1.65f, lineHeightStyle = CssLeading),
            color = Prose,
            modifier = side.testTag(id).dpadStop(),
        )
    }
    // web's Votive: a rule above and below, 16 inside them, centred, font-display at
    // display-xs 18 with leading 1.6 and tracking .14em, in the accent, its line break kept.
    Column(side.padding(top = 32.dp).testTag("season-votive").dpadStop()) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        Text(
            slots.text("season.votive"),
            style = TextStyle(
                fontFamily = if (LocalSmallCapsDisplay.current) SpectralSc else Cinzel,
                fontSize = 18.sp,
                lineHeight = 18.sp * 1.6f,
                letterSpacing = 0.14.em,
                lineHeightStyle = CssLeading,
                lineBreak = LineBreak.Heading,
            ),
            color = LocalAccent.current,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
        )
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
    val label = mono(11.sp, 1.6f, 0.14f)
    FeedbackRow(
        readingId = season.readingId,
        noun = SharedStrings.SEASON_FEEDBACK_NOUN,
        style = label,
        modifier = side.padding(top = 24.dp).testTag("season-feedback"),
    )
    if (slots.has("season.noChart")) {
        // web: CAST A CHART TO SEE WHAT THE SEASON TOUCHES IN YOUR OWN HOUSES → READING.
        val (castLine, castLink) = slots.list("season.noChart")
        FlowRow(side.padding(top = 32.dp).testTag("season-cast"), horizontalArrangement = Arrangement.Center) {
            Text(
                "$castLine ",
                style = label,
                color = Dim,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { contentDescription = "Cast a chart to see what the season touches in your own houses" },
            )
            // Opened on top of the season, as the app's other ways to the cast screen are,
            // so saving the chart comes back here.
            FootLink(castLink, "Cast a chart", Route.READING, LocalAccent.current, label, onOpen)
        }
    }
    val link = mono(11.sp, 1.6f, 0.18f)
    FlowRow(
        side.padding(top = 36.dp).testTag("season-links"),
        horizontalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterHorizontally),
    ) {
        val footer = slots.list("season.footer")
        listOf(
            Triple(footer[0], Route.DAY, Bone.copy(alpha = 0.65f)),
            Triple(footer[1], Route.WEEK, Bone.copy(alpha = 0.65f)),
            Triple(footer[2], Route.YEAR, Bone.copy(alpha = 0.65f)),
            Triple(footer[3], Route.TRANSITS, LocalAccent.current),
        ).forEach { (text, route, ink) ->
            // Spoken without the arrows.
            val spoken = text.replace("←", "").replace("→", "").trim().lowercase().replaceFirstChar { it.uppercase() }
            FootLink(text, spoken, route, ink, link, onNavigate)
        }
    }
}

/** A small link in the foot, as on Week: web's 18 dp line, widened to a 48 dp touch by Compose's hit test. */
@Composable
internal fun FootLink(text: String, spoken: String, route: String, ink: Color, style: TextStyle, onNavigate: (String) -> Unit) {
    val source = remember { MutableInteractionSource() }
    Text(
        text,
        style = style,
        color = ink,
        modifier = Modifier
            .focusOutline(source)
            .semantics { contentDescription = spoken }
            .clickable(source, indication = null, role = Role.Button, onClickLabel = "Open") { onNavigate(route) },
    )
}

private val lessonProse = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 17.sp, lineHeight = 17.sp * 1.65f, lineHeightStyle = CssLeading)

/** A section label between two rules, the board's section gap above it (P37, P40). */
@Composable
internal fun SeasonLabel(text: String, id: String, bottom: Dp, top: Dp = SeasonBoard.sectionGap) {
    Row(
        // CSS line-height 1: the box is 11 tall and the glyphs overflow it, as on the board.
        modifier = Modifier.fillMaxWidth().padding(horizontal = SeasonBoard.side)
            .padding(top = top, bottom = bottom).heightIn(min = 11.dp).testTag(id),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(Modifier.weight(1f).height(1.dp).background(SeasonBoard.ruleSection))
        Text(text, style = mono(11.sp, 1f, 0.2f), color = Dim, modifier = Modifier.height(11.dp).wrapContentHeight(unbounded = true).semantics { heading() })
        Box(Modifier.weight(1f).height(1.dp).background(SeasonBoard.ruleSection))
    }
}

/**
 * One of the season-sky rows, season.sky.row: "28 SEP 2026 · MARS INTO LEO"
 * with web's ingress sentence under it, the date in its tone's ink (conflict,
 * accent or dim), inside the board's row: 16 above and below, a rule at bone
 * .10 under it.
 */
@Composable
private fun SkyRow(row: SeasonSkyRow, text: String, id: String) {
    val ink = when (row.tone) {
        SeasonRowTone.CONFLICT -> Conflict
        SeasonRowTone.HARMONY -> LocalAccent.current
        SeasonRowTone.DIM -> Dim
    }
    // Spoken without the glyphs, which TalkBack would read by their names.
    val head = text.substringBefore("\n")
    val prose = text.substringAfter("\n", "")
    val date = head.substringBefore(" · ")
    val spoken = text.replace("\n", ". ").replace(" · ", ", ").lowercase()
    Column(Modifier.padding(horizontal = SeasonBoard.side).fillMaxWidth().testTag(id).dpadStop().clearAndSetSemantics { contentDescription = spoken }) {
        Column(Modifier.padding(vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                buildAnnotatedString {
                    withStyle(SpanStyle(color = ink)) { append(date) }
                    append(head.removePrefix(date))
                },
                style = mono(11.sp, 1.4f, 0.1f).copy(lineBreak = LineBreak.Heading),
                color = Prose,
            )
            if (prose.isNotEmpty()) {
                Text(prose, style = lessonProse, color = Prose)
            }
        }
        Box(Modifier.fillMaxWidth().height(1.dp).background(SeasonBoard.ruleRow))
    }
}

/**
 * P54: twelve whole-sign houses counter-clockwise from the Ascendant on the
 * left, the season's house filled at bone 14%, the Sun's mark (a ring and a
 * dot) at its longitude, a short tick at the Ascendant. A longitude λ sits at
 * screen angle 180° − (λ − Ascendant), measured clockwise from the right as
 * Compose draws arcs, which puts the Ascendant at the left and the houses
 * running down from it.
 */
@Composable
private fun HouseWheel(ascendant: Double, sun: Double, house: com.astra.antiqua.domain.SeasonHouse) {
    Box(
        Modifier
            .size(SeasonBoard.wheelSize)
            .testTag("P54")
            .dpadStop()
            .clearAndSetSemantics { contentDescription = "Your houses: the Sun in the ${house.ordinal} house, ${house.title.substringAfter(" · ")}" }
            .drawBehind { drawWheel(ascendant, sun, house.house) },
    )
}

/**
 * A stop for a D-pad or keyboard: the content has nothing to tap, and the
 * scroll brings a focused block into view, so each block that can sit below
 * the fold takes focus, with web's focus outline. A touch never focuses it.
 * The glass covers the page's top 173 (P20 under P2) and its foot from the
 * tab bar's top (P17 at 748, 96 above the 844 frame), so a focused block asks
 * to be shown with that much room above and below it.
 */
@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
internal fun Modifier.dpadStop(): Modifier {
    val source = remember { MutableInteractionSource() }
    return glassClearFocus().focusOutline(source).focusable(interactionSource = source)
}

/**
 * The bring-into-view half of [dpadStop] alone, for a block that takes focus
 * some other way (Sky Year's spine rows are clickable): when it gains focus
 * the scroll shows it with the glass's 173 above and 96 below.
 */
@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
internal fun Modifier.glassClearFocus(): Modifier {
    val requester = remember { androidx.compose.foundation.relocation.BringIntoViewRequester() }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    val density = LocalDensity.current
    val height = remember { floatArrayOf(0f) }
    return this
        .bringIntoViewRequester(requester)
        .onFocusChanged { state ->
            if (!state.isFocused) return@onFocusChanged
            scope.launch {
                with(density) {
                    // The block's own bounds, grown by the glass above and below it.
                    requester.bringIntoView(Rect(0f, -SeasonBoard.glassTop.toPx(), 1f, height[0] + SeasonBoard.glassFoot.toPx()))
                }
            }
        }
        .onSizeChanged { height[0] = it.height.toFloat() }
}

/** The season's house on the wheel: the outer arc's start and sweep, in Compose's degrees. */
internal fun houseSector(ascendant: Double, house: Int): Pair<Float, Float> =
    wheelAngle(floor(ascendant / 30.0) * 30.0 + 30.0 * (house - 1), ascendant) to -30f

internal fun wheelAngle(longitude: Double, ascendant: Double): Float = (180.0 - (longitude - ascendant)).toFloat()

private fun DrawScope.drawWheel(ascendant: Double, sun: Double, house: Int) {
    val k = size.width / 120f
    val c = Offset(size.width / 2, size.height / 2)
    val stroke = Stroke(width = 1.5.dp.toPx())
    fun at(angle: Float, r: Float) = Offset(
        c.x + r * k * cos(Math.toRadians(angle.toDouble())).toFloat(),
        c.y + r * k * sin(Math.toRadians(angle.toDouble())).toFloat(),
    )
    fun circle(r: Float) = Rect(c.x - r * k, c.y - r * k, c.x + r * k, c.y + r * k)

    val first = floor(ascendant / 30.0) * 30.0
    val (lo, sweep) = houseSector(ascendant, house)
    val sector = Path().apply {
        arcTo(circle(SeasonBoard.outer), lo, sweep, forceMoveTo = true)
        arcTo(circle(SeasonBoard.inner), lo + sweep, -sweep, forceMoveTo = false)
        close()
    }
    drawPath(sector, SeasonBoard.houseFill)
    drawCircle(Bone, SeasonBoard.outer * k, c, style = stroke)
    drawCircle(Bone, SeasonBoard.inner * k, c, style = stroke)
    for (i in 0 until 12) {
        val a = wheelAngle(first + 30.0 * i, ascendant)
        drawLine(Bone, at(a, SeasonBoard.inner), at(a, SeasonBoard.outer), strokeWidth = stroke.width)
    }
    drawLine(Bone, at(180f, SeasonBoard.outer), at(180f, 60f), strokeWidth = stroke.width)
    val mark = at(wheelAngle(sun, ascendant), SeasonBoard.mark)
    drawCircle(Bone, 4f * k, mark, style = stroke)
    drawCircle(Bone, 1.25f * k, mark)
}
