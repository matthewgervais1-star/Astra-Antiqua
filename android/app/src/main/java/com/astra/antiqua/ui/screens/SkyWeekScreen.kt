package com.astra.antiqua.ui.screens

import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.ui.semantics.Role
import com.astra.antiqua.ui.components.FeedbackRow
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.glass.focusOutline
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.DayTone
import com.astra.antiqua.domain.MoonToday
import com.astra.antiqua.domain.ScriptNameKey
import com.astra.antiqua.domain.SkyWeek
import com.astra.antiqua.domain.SkyWeekComposer
import com.astra.antiqua.domain.WeekDay
import com.astra.antiqua.domain.WeekShorthand
import com.astra.antiqua.domain.WeekVoice
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.ScriptName
import com.astra.antiqua.ui.components.rememberAnimationsOff
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Cinzel
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalSmallCapsDisplay
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spectral
import com.astra.antiqua.ui.theme.SpectralSc
import com.astra.antiqua.ui.theme.glass.GlassScreen
import com.astra.antiqua.ui.theme.glass.GlassSection
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.SkyWeekViewModel
import java.util.Calendar
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * SKY · WEEK on the glass chrome (canvas boards Glass-Week and
 * Glass-Week-scrolled; placement table P21 to P31 and P53 in the design
 * worktree's `.superpowers/sdd/glass-build/report-r3b.md`, P171 in
 * `docs/design/ios-layout-2026-10-21.md`, 2026-10-31). The board's sections in
 * its order, filled with the web's week (WeekNave.tsx, lib/weekReading.ts):
 * the institution, the voice's week title, each row's line and shorthand. The
 * kicker's date range, the count line, the Moon band's five facts and the
 * TODAY frame are the board's own forms. The thesis, the note, the votive,
 * the feedback row and the links stay off, as the votive did on Sky Day.
 *
 * The Moon (P171) is a layer on the ground under the scrolling text: at rest
 * its centre sits on the band's, 60 from the left, and it rises 0.5 dp for
 * every dp of scroll (Matthew, 2026-10-31, "Behind, slower than text"). With
 * animations off it scrolls with the text.
 */
@Composable
fun SkyWeekScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val model: SkyWeekViewModel = viewModel(factory = AstraViewModelFactory)
    val week by model.week.collectAsState()
    LaunchedEffect(culture) { model.load(culture) }
    SkyWeekFrame(culture = culture, week = week, onNavigate = onNavigate, onOpen = onOpen)
}

/** Sky Week inside its chrome, from a composed [week]; the screenshot test draws this. */
@Composable
fun SkyWeekFrame(
    culture: AncientCulture,
    week: SkyWeek?,
    onNavigate: (String) -> Unit = {},
    onOpen: (String) -> Unit = {},
    scrollState: ScrollState = rememberScrollState(),
) {
    // The band's centre at scroll 0 in root pixels, and the ground's top left in root
    // pixels; the Moon is placed by their difference, so it holds wherever the screen
    // sits. A new culture's band may sit elsewhere, so the anchor starts over with it.
    val anchor = remember(culture) { mutableStateOf<Offset?>(null) }
    val ground = remember(culture) { mutableStateOf(Offset.Zero) }
    val rate = if (rememberAnimationsOff()) 1f else WeekBoard.moonRate
    GlassScreen(
        culture = culture,
        section = GlassSection.SKY,
        horizon = Horizon.WEEK,
        scrollState = scrollState,
        contentBottom = WeekBoard.padBottom,
        behind = week?.let { w ->
            {
                Box(Modifier.matchParentSize().onGloballyPositioned { ground.value = it.positionInRoot() })
                MoonLayer(w.moon, anchor.value?.minus(ground.value), scrollState, rate)
            }
        },
        onSection = { onNavigate(it.route()) },
        onHorizon = { onNavigate(it.route) },
        // The culture sheet is step 10; until then the menu opens the Voices list.
        onMenu = { onNavigate(Route.VOICES) },
    ) {
        if (week != null) SkyWeekContent(culture, week, scrollState, anchor, onNavigate, onOpen)
    }
}

/** The board's numbers, in points read as dp (Glass-Week's markup at default levers). */
private object WeekBoard {
    val side = 24.dp
    val padBottom = 120.dp
    val ruleRow = Color(0xFFE6DECC).copy(alpha = 0.10f)
    val ruleShort = Color(0xFFE6DECC).copy(alpha = 0.32f)
    val todayBorder = Color(0xFFE6DECC).copy(alpha = 0.32f)

    /** P53: the band. */
    val bandHeight = 136.dp

    /** P171: the disc 220 across, 170 of it shown, the label 24 past what shows. */
    val discSize = 220.dp
    val discShow = 170.dp
    val labelLeft = discShow + side
    const val moonRate = 0.5f
    val discStroke = Color(0xFFE6DECC).copy(alpha = 0.24f)

    /** The lit part at bone 10%, where the dim labels over it hold 4.5:1 (moonAlpha). */
    val discLit = Color(0xFFE6DECC).copy(alpha = 0.10f)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun SkyWeekContent(
    culture: AncientCulture,
    week: SkyWeek,
    scrollState: ScrollState,
    anchor: MutableState<Offset?>,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val side = Modifier.fillMaxWidth().padding(horizontal = WeekBoard.side)

    // P21: the kicker, the week's dates and the institution, the institution as a script name.
    val kicker = mono(11.sp, 1.6f, 0.16f)
    FlowRow(modifier = side.testTag("P21"), horizontalArrangement = Arrangement.Center) {
        Text("${SkyWeekComposer.range(week.start, week.end)} · ", style = kicker, color = Dim)
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

    // P22: the voice's week title in its own case; Rome keeps Cinzel at .08em.
    val smallCaps = LocalSmallCapsDisplay.current
    Text(
        text = WeekVoice.title(culture),
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
        modifier = side.padding(top = 18.dp).testTag("P22").semantics { heading() },
    )

    // P23: the count line.
    Text(
        text = SkyWeekComposer.countLine(week.days),
        style = mono(11.sp, 1.6f, 0.14f),
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = side.padding(top = 10.dp).testTag("P23"),
    )

    // P24: the short rule, 24 above and 8 below.
    Box(Modifier.fillMaxWidth().padding(top = 24.dp, bottom = 8.dp), contentAlignment = Alignment.Center) {
        Box(Modifier.width(44.dp).height(1.dp).background(WeekBoard.ruleShort).testTag("P24"))
    }

    // P53: the band, full width on the ground; the Moon behind it is P171.
    MoonBand(
        week.moon,
        Modifier.onGloballyPositioned { c ->
            val p = c.positionInRoot()
            anchor.value = Offset(p.x, p.y + scrollState.value + c.size.height / 2f)
        },
    )

    // P25 to P31: the seven rows.
    week.days.forEachIndexed { i, day ->
        WeekRow(culture, day, "P${25 + i}", onOpen)
    }

    WebWeekSections(culture, week, onNavigate)
}

/**
 * The web week's own sections, not on the board, flat on the ground below
 * the seven rows in the web's order (Matthew, 2026-10-31, "Below the seven
 * rows"): the thesis, the note (Rome's with its key to F, N and C), the
 * votive for the week's hardest day, the feedback row and the three links.
 * Spacing is the web's (mt-6, mt-8, mt-9); the thesis opens 40 under the
 * rows, as the old Day sections do under Sky Day.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun WebWeekSections(culture: AncientCulture, week: SkyWeek, onNavigate: (String) -> Unit) {
    val side = Modifier.fillMaxWidth().padding(horizontal = WeekBoard.side)
    Text(
        WeekVoice.thesis(culture),
        style = TextStyle(fontFamily = Spectral, fontSize = 17.sp, lineHeight = 17.sp * 1.65f, lineHeightStyle = CssLeading),
        color = Prose,
        modifier = side.padding(top = 40.dp).testTag("week-thesis"),
    )
    val label = mono(11.sp, 1.6f, 0.14f)
    Text(
        WeekVoice.note(culture),
        style = label,
        color = Dim,
        textAlign = TextAlign.Center,
        modifier = side.padding(top = 24.dp).testTag("week-note"),
    )
    // web's Votive: a rule above and below, 16 inside them, centred, font-display at
    // display-xs 18 with leading 1.6 and tracking .14em, in the accent, its line break kept.
    Column(side.padding(top = 32.dp).testTag("week-votive")) {
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
        Text(
            WeekVoice.votive(culture, week.days),
            style = TextStyle(
                fontFamily = if (LocalSmallCapsDisplay.current) SpectralSc else Cinzel,
                fontSize = 18.sp,
                lineHeight = 18.sp * 1.6f,
                letterSpacing = 0.14.em,
                lineHeightStyle = CssLeading,
            ),
            color = LocalAccent.current,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
        )
        Box(Modifier.fillMaxWidth().height(1.dp).background(Rule))
    }
    FeedbackRow(
        readingId = WeekVoice.readingId(week.start),
        noun = "WEEK",
        style = label,
        modifier = side.padding(top = 24.dp).testTag("week-feedback"),
    )
    val link = mono(11.sp, 1.6f, 0.18f)
    FlowRow(
        side.padding(top = 36.dp).testTag("week-links"),
        horizontalArrangement = Arrangement.spacedBy(32.dp, Alignment.CenterHorizontally),
    ) {
        listOf(
            Triple("← THE DAY", Route.DAY, Bone.copy(alpha = 0.65f)),
            Triple("THE SEASON →", Route.SEASON, Bone.copy(alpha = 0.65f)),
            Triple("THE LONG TRANSITS →", Route.TRANSITS, LocalAccent.current),
        ).forEach { (text, route, ink) ->
            // Spoken without the arrows.
            val spoken = text.replace("←", "").replace("→", "").trim().lowercase().replaceFirstChar { it.uppercase() }
            val source = remember { MutableInteractionSource() }
            Text(
                text,
                style = link,
                color = ink,
                modifier = Modifier
                    .focusOutline(source)
                    .semantics { contentDescription = spoken }
                    .clickable(source, indication = null, role = Role.Button, onClickLabel = "Open") { onNavigate(route) },
            )
        }
    }
}

/** P53: the five facts at x 194, centred in the 136-tall band. */
@Composable
private fun MoonBand(moon: MoonToday, modifier: Modifier) {
    // At least the board's 136; a large font scale grows it, and the Moon follows its centre.
    Box(
        modifier.fillMaxWidth().heightIn(min = WeekBoard.bandHeight).testTag("P53"),
        contentAlignment = Alignment.CenterStart,
    ) {
        val style = mono(11.sp, 1.8f, 0.14f)
        // One stop for a screen reader; the disc behind it is decorative.
        // In sentence case, since some speech engines spell short capitals letter by letter.
        val spoken = buildString {
            append("Moon, ${moon.phase.lowercase()}, ${moon.percentLit} percent lit")
            moon.nextDate?.let {
                append(", ${moon.nextName.lowercase()} ")
                append(java.text.SimpleDateFormat("d MMMM yyyy", java.util.Locale.ENGLISH).format(it))
            }
        }
        Column(Modifier.padding(start = WeekBoard.labelLeft).clearAndSetSemantics { contentDescription = spoken }) {
            Text("MOON", style = style, color = Dim)
            Text(moon.phase.uppercase(), style = style, color = Bone)
            Text("${moon.percentLit}% LIT", style = style, color = Bone)
            moon.nextDate?.let { next ->
                Text(moon.nextName.uppercase(), style = style, color = Dim)
                Text(SkyWeekComposer.dayMonthYear(next), style = style, color = Dim)
            }
        }
    }
}

/**
 * P171: the disc, 170 of its 220 shown at the content's left edge. Its box sits
 * on the band's centre at rest and rises [rate] dp per dp of scroll; the
 * offset reads the scroll in the layout phase, so scrolling moves it without
 * composing again.
 */
@Composable
private fun BoxScope.MoonLayer(moon: MoonToday, anchor: Offset?, scroll: ScrollState, rate: Float) {
    if (anchor == null) return
    Box(
        Modifier
            .offset {
                val r = WeekBoard.discSize.toPx() / 2
                IntOffset(anchor.x.roundToInt(), (anchor.y - r - scroll.value * rate).roundToInt())
            }
            .size(WeekBoard.discShow, WeekBoard.discSize)
            // Decorative: the band states the Moon, and this box drifts from it as the page scrolls.
            // The tag only, which a screen reader does not read.
            .clearAndSetSemantics { testTag = "P171" }
            .drawBehind {
                drawCircle(WeekBoard.discStroke, radius = size.height / 2, center = Offset(size.width - size.height / 2, size.height / 2), style = Stroke(width = 1.dp.toPx()))
                drawPath(discPath(size.height / 2, size.width, moon.percentLit / 100f, moon.waxing), WeekBoard.discLit)
            },
    )
}

/**
 * The disc as the board draws it: the outline at bone .24, and the lit part,
 * a half circle on the lit side closed by the terminator, an ellipse of
 * semi-axis R × |2k − 1| (bulging into the dark half past half lit, into the
 * lit half before). [r] is the radius and [show] the box's width, so the
 * centre sits show − r in from the box's left edge (60 on the board).
 */
internal fun discPath(r: Float, show: Float, lit: Float, waxing: Boolean): Path {
    val c = Offset(show - r, r)
    val rx = r * abs(2 * lit - 1)
    val circle = Rect(c.x - r, c.y - r, c.x + r, c.y + r)
    val ellipse = Rect(c.x - rx, c.y - r, c.x + rx, c.y + r)
    // Angles run clockwise from the right with y down: -90 is the top, 90 the bottom.
    val side = if (waxing) 1f else -1f
    val gibbous = lit > 0.5f
    return Path().apply {
        moveTo(c.x, c.y - r)
        arcTo(circle, -90f, 180f * side, false)
        arcTo(ellipse, 90f, 180f * side * (if (gibbous) 1f else -1f), false)
        close()
    }
}

/**
 * One day: the weekday and the date, the web's shorthand in the row's tone,
 * and the web's line. Today's row is framed as on the board; a row with a
 * figure opens the figure's page, as the web's headline link does, with the
 * pressed fill P170 and web's focus outline.
 */
@Composable
private fun WeekRow(culture: AncientCulture, day: WeekDay, id: String, onOpen: (String) -> Unit) {
    val open = day.figure?.let { (date, figureId) -> { onOpen(Route.figure(date, figureId)) } }
    // The label names the day, so TalkBack's actions tell the seven rows apart.
    val press = if (open != null) Modifier.rowPress("Read the figure for ${day.label}", open) else Modifier
    if (day.isToday) {
        // The frame: 14 out from the margins, 10 above and below, a 1 dp border at bone .32.
        // The tag sits on its own layout node: a tag merged with the click would take the inner bounds.
        Box(
            Modifier
                .padding(horizontal = WeekBoard.side - 14.dp, vertical = 10.dp)
                .fillMaxWidth()
                .testTag(id)
                .border(1.dp, WeekBoard.todayBorder)
                .padding(1.dp),
        ) {
            Box(Modifier.fillMaxWidth().then(press).padding(horizontal = 14.dp, vertical = 18.dp)) { RowBody(culture, day) }
        }
    } else {
        Column(Modifier.padding(horizontal = WeekBoard.side).fillMaxWidth().testTag(id)) {
            Box(Modifier.fillMaxWidth().then(press).padding(vertical = 18.dp)) { RowBody(culture, day) }
            Box(Modifier.fillMaxWidth().height(1.dp).background(WeekBoard.ruleRow))
        }
    }
}

/** The row's two columns: 48 for the date, 16 between, the rest for the reading. */
@Composable
private fun RowBody(culture: AncientCulture, day: WeekDay) {
    val c = Calendar.getInstance().apply { time = day.date }
    val dow = day.label.substringBefore(' ')
    Row {
        Column(Modifier.width(48.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            // Rome's day flag rides beside the weekday, as the web prints it beside the label.
            Text(dow + (day.flag?.let { " ${it.name}" } ?: ""), style = mono(11.sp, 1f, 0.14f), color = Dim)
            Text(
                "${c.get(Calendar.DAY_OF_MONTH)}",
                style = TextStyle(fontFamily = SpectralSc, fontWeight = FontWeight.Medium, fontSize = 24.sp, lineHeight = 24.sp, lineHeightStyle = CssLeading),
                color = Bone,
            )
        }
        Spacer(Modifier.width(16.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            val ink = if (day.tone == DayTone.TENSION) Conflict else Dim
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Shorthand(day.shorthand, culture, ink)
                }
                if (day.isToday) Text("TODAY", style = mono(11.sp, 1.4f, 0.1f), color = Bone)
            }
            // The web's headline above the line (Matthew, 2026-10-31, "Add the web's headline"):
            // font-display at display-xs 18 with leading 1.1, in its own case, 4 above the line
            // as web's gap-1; none on an ingress day, as on web.
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                day.headline?.let { headline ->
                    Text(
                        headline,
                        style = TextStyle(
                            fontFamily = if (LocalSmallCapsDisplay.current) SpectralSc else Cinzel,
                            fontSize = 18.sp,
                            lineHeight = 18.sp * 1.1f,
                            lineHeightStyle = CssLeading,
                        ),
                        color = Bone,
                    )
                }
                Text(
                    day.line,
                    style = TextStyle(fontFamily = Spectral, fontWeight = FontWeight.Light, fontSize = 16.5.sp, lineHeight = 16.5.sp * 1.6f, lineHeightStyle = CssLeading),
                    color = Prose,
                )
            }
        }
    }
}

/**
 * Web's WeekNave shorthand: the bodies as deity glyphs in the culture in
 * force, the aspect glyph between them and TIGHT after; on an ingress the
 * body, the arrow and the sign's abbreviation; QUIET on a day with nothing in orb.
 */
@Composable
private fun Shorthand(shorthand: WeekShorthand, culture: AncientCulture, ink: Color) {
    val style = mono(11.sp, 1.4f, 0.1f)
    when (shorthand) {
        is WeekShorthand.Aspect -> {
            DeityGlyph(body = shorthand.a, culture = culture, size = 16.dp)
            Text(
                shorthand.glyph,
                style = style,
                color = ink,
                modifier = Modifier.semantics { contentDescription = shorthand.aspect.name.lowercase() },
            )
            DeityGlyph(body = shorthand.b, culture = culture, size = 16.dp)
            shorthand.tail?.let { Text(it, style = style, color = ink) }
        }

        is WeekShorthand.Ingress -> {
            DeityGlyph(body = shorthand.planet, culture = culture, size = 16.dp)
            Text(shorthand.tail, style = style, color = ink)
        }

        WeekShorthand.Quiet -> Text("QUIET", style = style, color = ink)
    }
}
