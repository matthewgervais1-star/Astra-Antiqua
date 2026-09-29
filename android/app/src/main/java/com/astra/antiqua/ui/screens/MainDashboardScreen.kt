package com.astra.antiqua.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.AccuratePlanetPosition
import com.astra.antiqua.domain.AspectType
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.NatalPlacementReading
import com.astra.antiqua.model.Planet
import com.astra.antiqua.ui.components.DeityGlyph
import com.astra.antiqua.ui.glyphs.deityGlyph
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.AccentRule
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.Kicker
import com.astra.antiqua.ui.components.Panel
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.SectionDivider
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.Harmony
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Rule
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DashboardViewModel
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun MainDashboardScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
    onOpenMethod: () -> Unit = {},
) {
    val dashboardViewModel: DashboardViewModel = viewModel(factory = AstraViewModelFactory)

    val chartState by dashboardViewModel.chartState.collectAsState()
    val lexicon = LocalLexicon.current
    val accent = LocalAccent.current

    LaunchedEffect(Unit) { dashboardViewModel.calculateChart() }

    NaveShell(
        context = lexicon.dashboardTitle,
        culture = culture,
        onNavigate = onNavigate,
        section = Section.TODAY,
        horizon = Horizon.DAY,
    ) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = Spacing.Gutter),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Spacer(modifier = Modifier.height(Spacing.Step))
            Text(
                text = lexicon.dashboardTitle,
                style = MaterialTheme.typography.displayMedium,
                color = Bone,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = Spacing.Step)
            )
            Spacer(modifier = Modifier.height(Spacing.Snug))
            AccentRule()
            Spacer(modifier = Modifier.height(Spacing.Step))
        }

        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(360.dp),
                contentAlignment = Alignment.Center
            ) {
                when (val state = chartState) {
                    is ChartState.Loading -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = accent)
                            Spacer(modifier = Modifier.height(Spacing.Snug))
                            Text(
                                text = "Consulting the Ephemeris...",
                                style = MaterialTheme.typography.labelMedium,
                                color = Dim,
                            )
                        }
                    }
                    is ChartState.Success -> {
                        NatalWheel(chartData = state.chartData, culture = culture)
                    }
                    is ChartState.Error -> {
                        Text(
                            text = "Error: ${state.message}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Conflict,
                        )
                    }
                }
            }
        }

        if (chartState is ChartState.Success) {
            item {
                // The claim and the page that backs it. A reader who wants to
                // know why three bodies the ancients never saw are in their
                // chart can reach the answer from the claim itself.
                Kicker(
                    text = "Modern bodies, received in the ancient manner · read the method",
                    modifier = Modifier
                        .padding(bottom = Spacing.Step)
                        .clickable(
                            onClickLabel = "Read how the sky is computed",
                            role = Role.Button,
                            onClick = onOpenMethod,
                        ),
                )
            }

            item {
                SectionDivider(label = "Decrees of the Oracle")
            }

            val successState = chartState as ChartState.Success
            val placements = successState.bigThreePlacements
            items(placements, key = { it.planetPosition.planet.name }) { reading ->
                OracleDecreeCard(reading = reading, culture = culture)
                Spacer(modifier = Modifier.height(Spacing.Step))
            }

            item {
                SectionDivider(label = lexicon.highPriestSummaryTitle)
                HighPriestSummaryCard(summary = successState.highPriestSummary)
            }
        }

        item {
            Spacer(modifier = Modifier.height(Spacing.Section))
        }
    }
    }
}

@Composable
fun OracleDecreeCard(reading: NatalPlacementReading, culture: AncientCulture) {
    val lexicon = LocalLexicon.current
    val accent = LocalAccent.current

    Panel(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min),
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Kicker(text = "As interpreted by ${lexicon.officerRole}")
                Spacer(modifier = Modifier.height(Spacing.Snug))

                // The glyph is this culture's own drawing of the body, beside
                // the name the culture gives it. Received bodies take the
                // accent through DeityGlyph's own rule.
                Row(verticalAlignment = Alignment.CenterVertically) {
                    DeityGlyph(
                        body = reading.planetPosition.planet,
                        culture = culture,
                        size = 20.dp,
                    )
                    Spacer(modifier = Modifier.width(Spacing.Tight))
                    Text(
                        text = reading.deityName.uppercase(),
                        style = MaterialTheme.typography.headlineSmall,
                        color = accent,
                    )
                    // A body the ancients never saw says so where it is named,
                    // not only on the method page. The accent is already this
                    // card's, so the chip takes the rule and no second colour.
                    if (reading.planetPosition.planet.isReceived) {
                        Spacer(modifier = Modifier.width(Spacing.Tight))
                        Badge(text = "Received", tone = BadgeTone.ACCENT)
                    }
                }
                Text(
                    text = reading.deityEpithet,
                    style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                    color = Dim,
                )

                Spacer(modifier = Modifier.height(Spacing.Step))

                Text(
                    text = "\"${reading.decreeLine}\"",
                    style = MaterialTheme.typography.bodyLarge.copy(fontStyle = FontStyle.Italic),
                    color = Bone,
                )

                Spacer(modifier = Modifier.height(Spacing.Step))
                Kicker(text = "Priestly interpretation")
                Spacer(modifier = Modifier.height(Spacing.Tight))
                Text(
                    text = reading.placementText,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Prose,
                )

                val houseMeaning = reading.houseMeaning
                Spacer(modifier = Modifier.height(Spacing.Step))
                Kicker(text = "In the ${houseMeaning.ordinal} house · ${houseMeaning.title}")
                Spacer(modifier = Modifier.height(Spacing.Tight))
                Text(
                    text = houseMeaning.domain,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Dim,
                )
            }

            ScribeMargin(planetData = reading.planetPosition)
        }
    }
}

@Composable
fun ScribeMargin(planetData: AccuratePlanetPosition) {
    val accent = LocalAccent.current
    Row(verticalAlignment = Alignment.CenterVertically) {
        Spacer(modifier = Modifier.width(Spacing.Step))
        VerticalDivider(
            modifier = Modifier.fillMaxHeight(),
            thickness = 1.dp,
            color = Rule,
        )
        Spacer(modifier = Modifier.width(Spacing.Snug))

        Column(horizontalAlignment = Alignment.End) {
            // Babylonian sexagesimal format, set in the mono scale.
            val d = planetData.degreeInSign.toString().padStart(2, '0')
            val m = planetData.minuteInSign.toString().padStart(2, '0')
            val s = planetData.secondInSign.toString().padStart(2, '0')

            Text(
                text = planetData.zodiacSign.signName.uppercase(),
                style = MaterialTheme.typography.labelMedium,
                color = accent,
                textAlign = TextAlign.End,
            )
            Text(
                text = "$d°$m'$s\"",
                style = MaterialTheme.typography.labelMedium,
                color = Bone,
                textAlign = TextAlign.End,
            )
            Text(
                text = "HOUSE ${planetData.house}",
                style = MaterialTheme.typography.labelMedium,
                color = Dim,
                textAlign = TextAlign.End,
            )
            val velocityText = when {
                planetData.velocity == 0.0 -> "STATIC"
                planetData.velocity < 0 -> "RETROGRADE"
                else -> "DIRECT"
            }
            Text(
                text = velocityText,
                style = MaterialTheme.typography.labelMedium,
                color = if (planetData.isRetrograde) Conflict else Dim,
                textAlign = TextAlign.End,
            )
        }
    }
}

@Composable
fun HighPriestSummaryCard(summary: String) {
    Panel(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = Spacing.Step),
        accented = true,
    ) {
        Text(
            text = summary,
            style = MaterialTheme.typography.bodyLarge.copy(fontStyle = FontStyle.Italic),
            color = Bone,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

/**
 * The wheel budget: Phase 2 widened the orb table (roughly doubling how many
 * pairs qualify as an aspect on a typical chart -- 3 to 4 on the golden
 * fixture's 7 bodies, and Phase 4's ten-body chart raises the pair count
 * from 21 to 45), and NatalWheel draws one chord per aspect with no budget
 * before this change. Left unbounded, a dense chart becomes an unreadable
 * tangle of lines. Two rules keep it legible:
 *  1. Budget: only the [MAX_WHEEL_ASPECTS] tightest (most exact) aspects are
 *     drawn. A loose, barely-in-orb aspect is the least astrologically
 *     significant and the first thing that should drop off as the chart
 *     gets busier.
 *  2. Z-order: within the kept set, soft aspects (sextile, trine) are drawn
 *     first and hard aspects (square, opposition) drawn last, so the more
 *     visually "important" hard lines sit on top instead of being buried
 *     under a pile of softer ones.
 * Phase 4 revisits this budget once ten bodies are live (see the rollout
 * plan's Phase 4 item 7).
 */
private const val MAX_WHEEL_ASPECTS = 12

/**
 * Planets are drawn just inside the rim rather than sitting on it, so the
 * dot doesn't visually fuse with the wheel's outer stroke. Tap hit-testing
 * targets this same ring so what a reader sees is what a reader can touch.
 */
private const val PLANET_RING_FRACTION = 0.92f

private fun isHardAspect(type: AspectType) =
    type == AspectType.SQUARE || type == AspectType.OPPOSITION

@Composable
fun NatalWheel(chartData: NatalChartData, culture: AncientCulture) {
    val haptic = LocalHapticFeedback.current
    val accent = LocalAccent.current
    val ground = MaterialTheme.colorScheme.background

    // The culture's own drawing of each body, rendered into the wheel rather
    // than a coloured disc. The ten hues this used to carry were the previous
    // identity's and broke the rule that separates by form and only confirms
    // by hue: five of them were brighter than any ink in the palette, and a
    // colour-deficient reader got nothing from them. The glyphs differ by
    // drawing hand, which is what tells them apart at this size.
    val glyphs = Planet.entries.associateWith {
        rememberVectorPainter(deityGlyph(culture, it))
    }

    // See the MAX_WHEEL_ASPECTS doc above: budget to the tightest aspects,
    // then order soft-before-hard so hard aspects draw on top.
    val visibleAspects = remember(chartData) {
        val budgeted = chartData.aspects.sortedBy { it.exactness }.take(MAX_WHEEL_ASPECTS)
        val (soft, hard) = budgeted.partition { !isHardAspect(it.type) }
        soft + hard
    }

    Canvas(
        modifier = Modifier
            .size(320.dp)
            .aspectRatio(1f)
            .padding(Spacing.Step)
            .pointerInput(chartData, visibleAspects) {
                // Real hit-testing against the drawn planet dots, replacing a
                // placeholder that fired on `longitude % 60.0 < 5.0` -- a
                // condition unrelated to where the tap landed and unrelated
                // to the aspects actually drawn. A tap now has to land near a
                // planet's dot (on the same PLANET_RING_FRACTION ring used to
                // draw it) before anything fires, and the feedback reflects
                // whether THAT planet sits in a hard aspect from the visible,
                // budgeted set.
                detectTapGestures(
                    onTap = { tapOffset ->
                        // PointerInputScope.size is an IntSize (pixel grid),
                        // not the Size DrawScope exposes, so the radius is
                        // built from width/height rather than minDimension.
                        val radius = minOf(size.width, size.height) / 2f
                        val center = Offset(size.width / 2f, size.height / 2f)
                        val hitRadiusPx = 20.dp.toPx()

                        var tappedPlanet: Planet? = null
                        var closestDistance = Float.MAX_VALUE
                        chartData.planets.forEach { (planet, pos) ->
                            val angle = ((pos.longitude - 90) * PI / 180).toFloat()
                            val point = Offset(
                                center.x + radius * PLANET_RING_FRACTION * cos(angle),
                                center.y + radius * PLANET_RING_FRACTION * sin(angle),
                            )
                            val distance = (point - tapOffset).getDistance()
                            if (distance < hitRadiusPx && distance < closestDistance) {
                                closestDistance = distance
                                tappedPlanet = planet
                            }
                        }

                        val planet = tappedPlanet ?: return@detectTapGestures
                        val hasHardAspect = visibleAspects.any {
                            (it.p1 == planet || it.p2 == planet) && isHardAspect(it.type)
                        }
                        if (hasHardAspect) {
                            haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        } else {
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        }
                    }
                )
            }
    ) {
        val radius = size.minDimension / 2
        val center = Offset(size.width / 2, size.height / 2)

        drawCircle(
            color = Bone,
            radius = radius,
            center = center,
            style = Stroke(width = 1.dp.toPx())
        )

        chartData.houseCusps.drop(1).forEach { cusp ->
            val angle = (cusp - 90) * (PI / 180).toFloat()
            val end = Offset(
                (center.x + radius * cos(angle)).toFloat(),
                (center.y + radius * sin(angle)).toFloat()
            )
            drawLine(
                color = Rule,
                start = center,
                end = end,
                strokeWidth = 1.dp.toPx()
            )
        }

        visibleAspects.forEach { aspect ->
            val pos1 = chartData.planets[aspect.p1] ?: return@forEach
            val pos2 = chartData.planets[aspect.p2] ?: return@forEach

            val color = when {
                aspect.type == AspectType.TRINE || aspect.type == AspectType.SEXTILE -> Harmony
                isHardAspect(aspect.type) -> Conflict
                else -> accent
            }

            val angle1 = (pos1.longitude - 90) * (PI / 180).toFloat()
            val angle2 = (pos2.longitude - 90) * (PI / 180).toFloat()

            val start = Offset(
                (center.x + (radius * 0.7f) * cos(angle1)).toFloat(),
                (center.y + (radius * 0.7f) * sin(angle1)).toFloat()
            )
            val end = Offset(
                (center.x + (radius * 0.7f) * cos(angle2)).toFloat(),
                (center.y + (radius * 0.7f) * sin(angle2)).toFloat()
            )

            drawLine(
                color = color.copy(alpha = (0.5f * (1.0f - aspect.exactness.toFloat())).coerceAtLeast(0.1f)),
                start = start,
                end = end,
                strokeWidth = 1.dp.toPx()
            )
        }

        chartData.planets.forEach { (planet, pos) ->
            val angle = (pos.longitude - 90) * (PI / 180).toFloat()
            val x = (center.x + radius * PLANET_RING_FRACTION * cos(angle)).toFloat()
            val y = (center.y + radius * PLANET_RING_FRACTION * sin(angle)).toFloat()

            // The ground behind the glyph, so an aspect chord does not run
            // through the mark it connects.
            drawCircle(
                color = ground,
                radius = GLYPH_PX.dp.toPx() * 0.62f,
                center = Offset(x, y)
            )

            if (pos.isRetrograde) {
                drawCircle(
                    color = Conflict,
                    radius = 12.dp.toPx(),
                    center = Offset(x, y),
                    style = Stroke(width = 1.dp.toPx())
                )
            }

            // The received three carry a quiet ring as well as the accent, so
            // the marker does not depend on hue alone.
            if (planet.isReceived) {
                drawCircle(
                    color = Dim,
                    radius = 10.dp.toPx(),
                    center = Offset(x, y),
                    style = Stroke(width = 1.dp.toPx())
                )
            }

            val painter = glyphs[planet]
            if (painter != null) {
                val side = GLYPH_PX.dp.toPx()
                translate(left = x - side / 2f, top = y - side / 2f) {
                    with(painter) {
                        draw(
                            size = Size(side, side),
                            colorFilter = ColorFilter.tint(
                                if (planet.isReceived) accent else Bone
                            ),
                        )
                    }
                }
            }
        }
    }
}

/** The wheel's glyph size, the design system's --glyph-size-wheel. */
private const val GLYPH_PX = 24
