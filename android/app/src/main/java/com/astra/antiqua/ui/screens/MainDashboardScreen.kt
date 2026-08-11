package com.astra.antiqua.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.HouseMeanings
import com.astra.antiqua.domain.NatalChartData
import com.astra.antiqua.domain.OracleContent
import com.astra.antiqua.model.ClassicalPlanet
import com.astra.antiqua.ui.components.GlassCard
import com.astra.antiqua.ui.theme.Gold
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Red
import com.astra.antiqua.viewmodel.AppViewModel
import com.astra.antiqua.viewmodel.ChartState
import com.astra.antiqua.viewmodel.DashboardViewModel
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun MainDashboardScreen() {
    val appViewModel: AppViewModel = viewModel()
    val dashboardViewModel: DashboardViewModel = viewModel()
    
    val chartState by dashboardViewModel.chartState.collectAsState()
    val context = LocalContext.current
    val lexicon = LocalLexicon.current

    LaunchedEffect(Unit) {
        dashboardViewModel.calculateChart(context)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = lexicon.dashboardTitle,
                style = MaterialTheme.typography.displayLarge,
                modifier = Modifier.padding(vertical = 16.dp)
            )
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
                            CircularProgressIndicator(color = Color.White)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Consulting the Ephemeris...", color = Color.Gray)
                        }
                    }
                    is ChartState.Success -> {
                        NatalWheel(chartData = state.chartData)
                    }
                    is ChartState.Error -> {
                        Text("Error: ${state.message}", color = Red)
                    }
                }
            }
        }

        item {
            Text(
                text = "Decrees of the Oracle",
                style = MaterialTheme.typography.headlineMedium,
                color = Gold,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 32.dp, bottom = 16.dp)
            )
        }

        if (chartState is ChartState.Success) {
            val successState = chartState as ChartState.Success
            val decrees = successState.bigThreeDecrees
            items(decrees) { content ->
                OracleDecreeCard(content = content)
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            item {
                Text(
                    text = lexicon.highPriestSummaryTitle,
                    style = MaterialTheme.typography.headlineMedium,
                    color = Gold,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp, bottom = 16.dp)
                )
                
                HighPriestSummaryCard(summary = successState.highPriestSummary)
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun OracleDecreeCard(content: OracleContent) {
    val lexicon = LocalLexicon.current
    val planet = content.planetPosition?.planet
    val deityName = content.deity_name
    val officerRole = lexicon.officerRole

    GlassCard(
        modifier = Modifier.fillMaxWidth()
    ) {
        Box {
            // Deity Glyph Placeholder
            Text(
                text = deityName.take(1),
                style = MaterialTheme.typography.displayLarge.copy(
                    fontSize = 140.sp,
                    fontWeight = FontWeight.Black
                ),
                color = Gold.copy(alpha = 0.05f),
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .offset(x = (-30).dp)
            )

            Row(
                modifier = Modifier.height(IntrinsicSize.Min),
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = deityName.uppercase(),
                        style = MaterialTheme.typography.displaySmall.copy(
                            letterSpacing = 2.sp
                        ),
                        color = Gold,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "As interpreted by $officerRole",
                        style = MaterialTheme.typography.bodySmall.copy(
                            fontSize = 10.sp,
                            letterSpacing = 0.5.sp
                        ),
                        color = Color.Gray.copy(alpha = 0.7f)
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    Text(
                        text = "\"${content.decree}\"",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                            lineHeight = 24.sp
                        ),
                        color = Color.White
                    )
                    
                    if (content.interpretation != null) {
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "PRIESTLY INTERPRETATION",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                letterSpacing = 1.5.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            color = Gold.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = content.interpretation,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                lineHeight = 20.sp
                            ),
                            color = Color.White.copy(alpha = 0.85f)
                        )
                    }

                    content.planetPosition?.let { pos ->
                        val houseMeaning = HouseMeanings.get(pos.house)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "IN THE ${houseMeaning.ordinal.uppercase()} HOUSE · ${houseMeaning.title.uppercase()}",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontSize = 9.sp,
                                letterSpacing = 1.5.sp,
                                fontWeight = FontWeight.Bold
                            ),
                            color = Gold.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = houseMeaning.domain,
                            style = MaterialTheme.typography.bodyMedium.copy(
                                lineHeight = 20.sp
                            ),
                            color = Color.White.copy(alpha = 0.7f)
                        )
                    }
                }

                content.planetPosition?.let { pos ->
                    ScribeMargin(planetData = pos)
                }
            }
        }
    }
}

@Composable
fun ScribeMargin(planetData: com.astra.antiqua.domain.AccuratePlanetPosition) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Spacer(modifier = Modifier.width(16.dp))
        VerticalDivider(
            modifier = Modifier.fillMaxHeight(),
            thickness = 0.5.dp,
            color = Color.White.copy(alpha = 0.15f)
        )
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(
            modifier = Modifier.width(90.dp),
            horizontalAlignment = Alignment.End
        ) {
            // Babylonian sexagesimal format with SF Mono style (Monospace)
            val d = planetData.degreeInSign.toString().padStart(2, '0')
            val m = planetData.minuteInSign.toString().padStart(2, '0')
            val s = planetData.secondInSign.toString().padStart(2, '0')

            Text(
                text = planetData.zodiacSign.signName.uppercase(),
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    letterSpacing = 1.sp,
                    fontWeight = FontWeight.Bold
                ),
                color = Gold.copy(alpha = 0.8f),
                textAlign = TextAlign.End
            )
            Text(
                text = "$d°$m'$s\"",
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 11.sp,
                    letterSpacing = 0.5.sp
                ),
                color = Gold,
                textAlign = TextAlign.End
            )
            Text(
                text = "HOUSE ${planetData.house}",
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    letterSpacing = 1.sp
                ),
                color = Color.Gray,
                textAlign = TextAlign.End
            )
            val velocityText = if (planetData.velocity == 0.0) {
                "STATIC"
            } else if (planetData.velocity < 0) {
                "RETROGRADE"
            } else {
                "DIRECT"
            }
            Text(
                text = velocityText,
                style = MaterialTheme.typography.bodySmall.copy(
                    fontFamily = FontFamily.Monospace,
                    fontSize = 9.sp,
                    letterSpacing = 1.sp
                ),
                color = if (planetData.isRetrograde) Red else Color.Gray,
                textAlign = TextAlign.End
            )
        }
    }
}

@Composable
fun HighPriestSummaryCard(summary: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp)
            .background(
                color = Color.White.copy(alpha = 0.05f),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
            )
            .padding(1.dp)
            .background(
                color = Color.Black.copy(alpha = 0.8f),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
            )
            .border(
                width = 0.5.dp,
                color = Gold.copy(alpha = 0.4f),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(16.dp)
            )
            .padding(32.dp)
    ) {
        Text(
            text = summary,
            style = MaterialTheme.typography.headlineSmall.copy(
                fontWeight = FontWeight.Medium,
                lineHeight = 32.sp,
                fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
            ),
            color = Color.White,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
fun NatalWheel(chartData: NatalChartData) {
    val haptic = LocalHapticFeedback.current
    val lexicon = LocalLexicon.current
    
    Canvas(
        modifier = Modifier
            .size(320.dp)
            .aspectRatio(1f)
            .padding(16.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onTap = {
                        val hasHarmony = chartData.planets.values.any { it.longitude % 60.0 < 5.0 }
                        if (hasHarmony) {
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
            color = Color.White,
            radius = radius,
            center = center,
            style = Stroke(width = 2.dp.toPx())
        )

        chartData.houseCusps.drop(1).forEach { cusp ->
            val angle = (cusp - 90) * (PI / 180).toFloat()
            val start = center
            val end = Offset(
                (center.x + radius * cos(angle)).toFloat(),
                (center.y + radius * sin(angle)).toFloat()
            )
            drawLine(
                color = Color.Gray.copy(alpha = 0.3f),
                start = start,
                end = end,
                strokeWidth = 1.dp.toPx()
            )
        }

        chartData.aspects.forEach { aspect ->
            val pos1 = chartData.planets[aspect.p1] ?: return@forEach
            val pos2 = chartData.planets[aspect.p2] ?: return@forEach
            
            val color = if (aspect.type == com.astra.antiqua.domain.AspectType.TRINE || 
                            aspect.type == com.astra.antiqua.domain.AspectType.SEXTILE) {
                Gold
            } else if (aspect.type == com.astra.antiqua.domain.AspectType.SQUARE || 
                       aspect.type == com.astra.antiqua.domain.AspectType.OPPOSITION) {
                Color.White
            } else {
                Gold.copy(alpha = 0.8f)
            }

            val angle1 = (pos1.longitude - 90) * (PI / 180).toFloat()
            val angle2 = (pos2.longitude - 90) * (PI / 180).toFloat()
            
            val start = Offset(
                (center.x + (radius * 0.7f) * cos(angle1.toFloat())).toFloat(),
                (center.y + (radius * 0.7f) * sin(angle1.toFloat())).toFloat()
            )
            val end = Offset(
                (center.x + (radius * 0.7f) * cos(angle2.toFloat())).toFloat(),
                (center.y + (radius * 0.7f) * sin(angle2.toFloat())).toFloat()
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
            val x = (center.x + radius * cos(angle.toFloat())).toFloat()
            val y = (center.y + radius * sin(angle.toFloat())).toFloat()

            drawCircle(
                color = Color.White,
                radius = 8.dp.toPx(),
                center = Offset(x, y)
            )
            
            if (pos.isRetrograde) {
                drawCircle(
                    color = Red.copy(alpha = 0.5f),
                    radius = 12.dp.toPx(),
                    center = Offset(x, y),
                    style = Stroke(width = 2.dp.toPx())
                )
            }

            drawCircle(
                color = getPlanetColor(planet),
                radius = 5.dp.toPx(),
                center = Offset(x, y)
            )
        }
    }
}

fun getPlanetColor(planet: ClassicalPlanet): Color {
    if (planet == ClassicalPlanet.SUN) return Color(0xFFFFCC33)
    if (planet == ClassicalPlanet.MOON) return Color(0xFFC0C0C0)
    if (planet == ClassicalPlanet.MERCURY) return Color(0xFF8A2BE2)
    if (planet == ClassicalPlanet.VENUS) return Color(0xFF00FF7F)
    if (planet == ClassicalPlanet.MARS) return Color(0xFFFF4500)
    if (planet == ClassicalPlanet.JUPITER) return Color(0xFF4169E1)
    if (planet == ClassicalPlanet.SATURN) return Color(0xFF708090)
    return Color.White
}
