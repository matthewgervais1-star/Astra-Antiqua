package com.astra.antiqua.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.R
import com.astra.antiqua.domain.DayDecreeComposer
import com.astra.antiqua.domain.FigureAnatomy
import com.astra.antiqua.domain.FigureReadingComposer
import com.astra.antiqua.domain.Recurrence
import com.astra.antiqua.domain.Timeline
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.ActionButton
import com.astra.antiqua.ui.components.ActionWeight
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.components.InstitutionKicker
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Route
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.FaintInk
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.RuleRow
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.ui.theme.displayCase
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.FigureState
import com.astra.antiqua.viewmodel.FigureViewModel
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

/**
 * One day's figure, web's /day/[date]/figure/[id]: the headline, the hero
 * glyph, the paragraph in two moves, the figure in space and its sentence
 * taken apart, how often it returns, how it plays out, three things to try
 * and the lesson.
 */
@Composable
fun FigureScreen(
    date: String,
    id: String,
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpen: (String) -> Unit,
) {
    val viewModel: FigureViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.state.collectAsState()
    val accent = LocalAccent.current

    LaunchedEffect(culture, date, id) { viewModel.load(culture, date, id) }

    NaveShell(context = "The figure · $date", culture = culture, onNavigate = onNavigate, section = Section.TODAY) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when (val current = state) {
                FigureState.Loading -> item {
                    Column(Modifier.fillMaxWidth().padding(Spacing.Chapter), horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = accent)
                    }
                }

                is FigureState.Missing -> item {
                    val headline = when (current.reason) {
                        FigureReadingComposer.Missing.MALFORMED -> "This address does not name a day and a figure"
                        FigureReadingComposer.Missing.SLOW -> "Two slow bodies make a long transit, not a day's figure"
                        FigureReadingComposer.Missing.ABSENT -> "The sky did not hold this figure that day"
                    }
                    NaveHead(
                        headline = headline,
                        kickerContent = { InstitutionKicker(culture, after = "the figure") },
                    )
                    FigureLinks(onNavigate)
                }

                FigureState.Failed -> item {
                    NaveHead(
                        headline = stringResource(R.string.figure_failed),
                        kickerContent = { InstitutionKicker(culture, after = "the figure") },
                    )
                    Box(modifier = Modifier.padding(horizontal = Spacing.Gutter)) {
                        ActionButton(
                            label = stringResource(R.string.figure_try_again),
                            weight = ActionWeight.PRIMARY,
                            onClick = { viewModel.load(culture, date, id) },
                        )
                    }
                    FigureLinks(onNavigate)
                }

                is FigureState.Ready -> {
                    val page = current.page
                    val window = page.window
                    item {
                        NaveHead(
                            culture = culture,
                            kickerContent = { InstitutionKicker(culture, before = longDate(page.instant)) },
                            headline = page.headline,
                            sub = page.evidence,
                        )
                        page.bridge?.let { bridge ->
                            // The contact the page reads from here down, under the sky figure's evidence.
                            Text(
                                text = bridge,
                                style = MaterialTheme.typography.labelSmall,
                                color = accent,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.fillMaxWidth().padding(bottom = Spacing.Step),
                            )
                        }
                    }
                    item {
                        val timeline = window?.let { Recurrence.timeline(it, current.now, page.instant) }
                        FigureAnatomySection(
                            culture = culture,
                            anatomy = page.anatomy,
                            timeline = timeline,
                            caption = if (timeline?.presentInside == true) "NOW" else longDate(page.instant),
                            centerLabel = if (page.natal) "YOU" else null,
                            onOpenGlossary = { onOpen(Route.learn("/learn/aspects")) },
                        )
                    }
                    item { FigureLinks(onNavigate) }
                }
            }
        }
    }
}

private fun longDate(instant: java.util.Date): String =
    instant.toInstant().atZone(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("EEEE · MMMM d, yyyy", Locale.US)).uppercase()

@Composable
private fun FigureLinks(onNavigate: (String) -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().padding(Spacing.Gutter),
        horizontalArrangement = Arrangement.SpaceEvenly,
    ) {
        listOf("← The day" to Route.DAY, "The week" to Route.WEEK, "All transits →" to Route.TRANSITS).forEach { (label, route) ->
            Text(
                text = label.uppercase(),
                style = MaterialTheme.typography.labelMedium,
                color = Dim,
                modifier = Modifier.clickable(role = Role.Button) { onNavigate(route) },
            )
        }
    }
}

/**
 * Everything under the figure page's headline, shared with the long transit
 * screen, which slips its spine in after the paragraph.
 */
@Composable
fun FigureAnatomySection(
    culture: AncientCulture,
    anatomy: FigureAnatomy,
    timeline: Timeline?,
    caption: String,
    centerLabel: String?,
    onOpenGlossary: () -> Unit,
    afterParagraph: @Composable () -> Unit = {},
) {
    val accent = LocalAccent.current
    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = Spacing.Gutter),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        DeityGlyph(body = anatomy.heroBody, culture = culture, size = 88.dp)
        Box(Modifier.height(Spacing.Step))
        Text(anatomy.moveOne, style = MaterialTheme.typography.bodyLarge, color = Prose, modifier = Modifier.fillMaxWidth())
        Box(Modifier.height(Spacing.Snug))
        Text(anatomy.moveTwo, style = MaterialTheme.typography.bodyLarge, color = Prose, modifier = Modifier.fillMaxWidth())

        afterParagraph()

        SectionDivider(label = "What it looks like in space")
        FigureDiagram(culture, anatomy, centerLabel)
        Box(Modifier.height(Spacing.Step))
        anatomy.parts.forEachIndexed { i, part ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Tight), verticalAlignment = Alignment.Top) {
                Box(Modifier.width(32.dp), contentAlignment = Alignment.Center) {
                    when {
                        part.body != null -> DeityGlyph(body = part.body, culture = culture, size = 22.dp)
                        i == 1 -> Text(DayDecreeComposer.glyph(anatomy.aspect), style = MaterialTheme.typography.titleMedium, color = Dim)
                        else -> Box(Modifier.size(7.dp).background(Bone))
                    }
                }
                Column(Modifier.weight(1f)) {
                    Text(displayCase(part.phrase), style = MaterialTheme.typography.titleMedium, color = Bone)
                    Text(part.tag, style = MaterialTheme.typography.labelSmall, color = Dim)
                }
            }
        }

        Box(Modifier.height(Spacing.Step))
        Text(anatomy.recurrence, style = MaterialTheme.typography.bodyLarge, color = Prose, modifier = Modifier.fillMaxWidth())
        if (timeline != null) {
            Box(Modifier.height(Spacing.Snug))
            FigureTimeline(timeline)
            Text(caption, style = MaterialTheme.typography.labelSmall, color = Dim, modifier = Modifier.padding(top = Spacing.Tight))
        }
        Text(
            text = "WHAT IS THIS? →",
            style = MaterialTheme.typography.labelMedium,
            color = Bone,
            modifier = Modifier
                .padding(vertical = Spacing.Snug)
                .clickable(onClickLabel = "Open the aspects glossary", role = Role.Button, onClick = onOpenGlossary),
        )

        SectionDivider(label = anatomy.playsOutTitle)
        Text(displayCase(anatomy.actLine), style = MaterialTheme.typography.titleMedium, color = Bone, modifier = Modifier.fillMaxWidth())
        Box(Modifier.height(Spacing.Snug))
        anatomy.manifestations.forEach { item ->
            Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
                Text("✓", style = MaterialTheme.typography.bodyMedium, color = accent, modifier = Modifier.width(20.dp))
                Text(item, style = MaterialTheme.typography.bodyMedium, color = Prose)
            }
        }

        SectionDivider(label = "Try this")
        anatomy.cards.forEach { card ->
            Panel(modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.Tight)) {
                Column {
                    Text(card.kind.uppercase(), style = MaterialTheme.typography.labelSmall, color = accent)
                    Text(card.title, style = MaterialTheme.typography.bodyMedium, color = Prose, modifier = Modifier.padding(vertical = Spacing.Tight))
                    Text(card.source, style = MaterialTheme.typography.labelSmall, color = Dim)
                }
            }
        }

        SectionDivider(label = "The lesson")
        Text(
            displayCase(anatomy.lesson),
            style = MaterialTheme.typography.titleMedium,
            color = Bone,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(bottom = Spacing.Step),
        )
    }
}

/** The span the figure holds: a 3dp track, the elapsed part in the accent, four ticks and the present's square. */
@Composable
private fun FigureTimeline(timeline: Timeline) {
    val accent = LocalAccent.current
    Column(Modifier.fillMaxWidth()) {
        BoxWithConstraints(Modifier.fillMaxWidth().height(12.dp)) {
            val w = maxWidth
            Box(Modifier.align(Alignment.CenterStart).fillMaxWidth().height(3.dp).background(RuleRow))
            Box(Modifier.align(Alignment.CenterStart).fillMaxWidth(timeline.presentPct / 100f).height(3.dp).background(accent))
            timeline.ticks.forEach { tick ->
                Box(Modifier.align(Alignment.CenterStart).offset(x = w * (tick.pct / 100f) - 0.5.dp).width(1.dp).height(7.dp).background(Bone))
            }
            Box(Modifier.align(Alignment.CenterStart).offset(x = w * (timeline.presentPct / 100f) - 4.5.dp).size(9.dp).background(accent))
        }
        Row(Modifier.fillMaxWidth().padding(top = Spacing.Tight)) {
            timeline.ticks.forEachIndexed { i, tick ->
                Text(
                    text = if (tick.sub.isEmpty()) tick.label else "${tick.label}\n${tick.sub}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Dim,
                    textAlign = when (i) {
                        0 -> TextAlign.Start
                        timeline.ticks.lastIndex -> TextAlign.End
                        else -> TextAlign.Center
                    },
                    modifier = Modifier.weight(1f),
                )
            }
        }
    }
}

/** The figure in space: one ring, the reader at the center, a radius to each end and the angle's arc. */
@Composable
private fun FigureDiagram(culture: AncientCulture, anatomy: FigureAnatomy, centerLabel: String?) {
    val from = anatomy.from
    val to = anatomy.to
    BoxWithConstraints(Modifier.widthIn(max = 280.dp).fillMaxWidth().aspectRatio(1f)) {
        val side = maxWidth
        val r = 0.39f
        fun at(longitude: Double, radius: Float): Offset {
            val rad = Math.toRadians(180.0 - longitude)
            return Offset(0.5f + (cos(rad) * radius).toFloat(), 0.5f - (sin(rad) * radius).toFloat())
        }
        Canvas(Modifier.fillMaxSize()) {
            val s = size.width
            val c = Offset(s / 2f, s / 2f)
            val stroke = 1.dp.toPx()
            drawCircle(color = Rule, radius = s * r, center = c, style = Stroke(stroke))
            listOf(from, to).forEach { p ->
                val e = at(p.longitude, r)
                drawLine(Rule, c, Offset(e.x * s, e.y * s), stroke)
            }
            if (anatomy.aspect.degree > 0) {
                val arcR = s * 0.13f
                val delta = Math.floorMod(Math.round(to.longitude - from.longitude).toInt(), 360)
                // Longitude grows clockwise on the page, which is Compose's positive sweep.
                val sweep = if (delta <= 180) delta.toFloat() else (delta - 360).toFloat()
                drawArc(
                    color = Rule,
                    startAngle = (180.0 - from.longitude).let { -it.toFloat() },
                    sweepAngle = sweep,
                    useCenter = false,
                    topLeft = Offset(c.x - arcR, c.y - arcR),
                    size = Size(arcR * 2, arcR * 2),
                    style = Stroke(stroke, pathEffect = PathEffect.dashPathEffect(floatArrayOf(4f, 6f))),
                )
            }
            drawRect(Bone, topLeft = Offset(c.x - 2.dp.toPx(), c.y - 2.dp.toPx()), size = Size(4.dp.toPx(), 4.dp.toPx()))
        }
        listOf(from, to).forEach { p ->
            val e = at(p.longitude, r)
            Column(
                modifier = Modifier.offset(x = side * e.x - 40.dp, y = side * e.y - 14.dp).width(80.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                if (p.body != null) DeityGlyph(body = p.body, culture = culture, size = 22.dp) else Box(Modifier.size(7.dp).background(Bone))
                Text(p.label, style = MaterialTheme.typography.labelSmall, color = Dim, textAlign = TextAlign.Center)
            }
        }
        if (anatomy.aspect.degree > 0) {
            val mid = at(from.longitude + (Math.floorMod(Math.round(to.longitude - from.longitude).toInt(), 360).let { if (it <= 180) it / 2.0 else (it - 360) / 2.0 }), 0.2f)
            Text(
                "${anatomy.aspect.degree.toInt()}°",
                style = MaterialTheme.typography.labelSmall,
                color = Dim,
                modifier = Modifier.offset(x = side * mid.x - 12.dp, y = side * mid.y - 8.dp),
            )
        }
        if (centerLabel != null) {
            Text(
                centerLabel,
                style = MaterialTheme.typography.labelSmall,
                color = FaintInk,
                modifier = Modifier.offset(x = side * 0.5f - 12.dp, y = side * 0.53f),
            )
        }
    }
}
