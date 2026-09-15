package com.astra.antiqua.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.astra.antiqua.domain.DayTone
import com.astra.antiqua.domain.WeekDay
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.ui.components.Badge
import com.astra.antiqua.ui.components.BadgeTone
import com.astra.antiqua.ui.components.NaveHead
import com.astra.antiqua.ui.components.NaveShell
import com.astra.antiqua.ui.components.RowRule
import com.astra.antiqua.ui.nav.Horizon
import com.astra.antiqua.ui.nav.Section
import com.astra.antiqua.ui.theme.Bone
import com.astra.antiqua.ui.theme.Conflict
import com.astra.antiqua.ui.theme.Dim
import com.astra.antiqua.ui.theme.LocalAccent
import com.astra.antiqua.ui.theme.LocalLexicon
import com.astra.antiqua.ui.theme.Prose
import com.astra.antiqua.ui.theme.Spacing
import com.astra.antiqua.viewmodel.AstraViewModelFactory
import com.astra.antiqua.viewmodel.HorizonViewModel
import com.astra.antiqua.viewmodel.WeekState
import java.util.Calendar
import java.util.Date

/**
 * The week, web's /week: seven days, each with the tightest figure the sky
 * makes that day, read in the culture's own institution.
 *
 * Today's row is marked with the accent, which is the accent doing its first
 * job: saying where the reader is. A day with nothing in orb says so, because
 * a week that always has something to report is a week that is inventing.
 */
@Composable
fun WeekScreen(
    culture: AncientCulture,
    onNavigate: (String) -> Unit,
) {
    val viewModel: HorizonViewModel = viewModel(factory = AstraViewModelFactory)
    val state by viewModel.week.collectAsState()
    val accent = LocalAccent.current
    val lexicon = LocalLexicon.current

    LaunchedEffect(Unit) { viewModel.loadWeek() }

    NaveShell(
        context = "${lexicon.dashboardTitle} · the week",
        culture = culture,
        onNavigate = onNavigate,
        horizon = Horizon.WEEK,
        section = Section.TODAY,
    ) {
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            when (val current = state) {
                is WeekState.Loading -> item {
                    Column(
                        modifier = Modifier.fillMaxWidth().padding(Spacing.Chapter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) { CircularProgressIndicator(color = accent) }
                }

                is WeekState.Error -> item {
                    Text(
                        text = current.message,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Conflict,
                        modifier = Modifier.padding(Spacing.Gutter),
                    )
                }

                is WeekState.Ready -> {
                    item {
                        NaveHead(
                            kicker = "${lexicon.dashboardTitle} · the week",
                            headline = "Seven days",
                            sub = "${dayMonth(current.start)} – ${dayMonth(current.end)} " +
                                "${year(current.end)}",
                        )
                    }
                    items(current.days, key = { it.date.time }) { day -> DayRow(day) }
                    item {
                        Text(
                            text = "EACH DAY TAKES THE TIGHTEST FIGURE THE SKY MAKES INSIDE " +
                                "ONE DEGREE · A DAY WITH NOTHING IN ORB SAYS SO",
                            style = MaterialTheme.typography.labelSmall,
                            color = Dim,
                            modifier = Modifier.padding(Spacing.Gutter),
                        )
                        Column(Modifier.padding(Spacing.Chapter)) {}
                    }
                }
            }
        }
    }
}

@Composable
private fun DayRow(day: WeekDay) {
    val accent = LocalAccent.current
    RowRule()
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (day.isToday) {
                    Modifier.background(accent.copy(alpha = 0.07f))
                } else {
                    Modifier
                }
            )
            .padding(horizontal = Spacing.Gutter, vertical = Spacing.Step),
    ) {
        // Wide enough for "MON 14 F" on one line: Rome's day flag rides
        // beside the date, not under it.
        Column(modifier = Modifier.width(78.dp)) {
            Text(
                text = day.label + (day.flag?.let { " ${it.name}" } ?: ""),
                style = MaterialTheme.typography.labelSmall,
                color = if (day.isToday) accent else Dim,
            )
            if (day.isToday) {
                Text(
                    text = "TODAY",
                    style = MaterialTheme.typography.labelSmall,
                    color = accent,
                )
            }
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = day.line,
                style = MaterialTheme.typography.bodySmall,
                color = if (day.tone == DayTone.QUIET) Dim else Prose,
            )
            Row(
                modifier = Modifier.padding(top = Spacing.Tight),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = day.shorthand,
                    style = MaterialTheme.typography.labelSmall,
                    color = toneInk(day.tone),
                )
            }
        }
    }
}

private fun toneInk(tone: DayTone): Color = when (tone) {
    DayTone.TENSION -> Conflict
    DayTone.HARMONY -> Bone
    DayTone.QUIET -> Dim
}

private val MONTHS_SHORT = listOf(
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
)

private fun dayMonth(date: Date): String {
    val calendar = Calendar.getInstance().apply { time = date }
    val month = MONTHS_SHORT.getOrElse(calendar.get(Calendar.MONTH)) { "JAN" }
    return "${calendar.get(Calendar.DAY_OF_MONTH)} $month"
}

private fun year(date: Date): String {
    val calendar = Calendar.getInstance().apply { time = date }
    return calendar.get(Calendar.YEAR).toString()
}
