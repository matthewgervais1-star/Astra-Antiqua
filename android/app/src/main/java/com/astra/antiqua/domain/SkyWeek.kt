package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import java.util.Calendar
import java.util.Date

/** Everything Sky Week prints, for one culture at one instant. */
data class SkyWeek(
    /** Local midnight on the week's Monday, as web's mondayOf. */
    val start: Date,
    /** The Sunday. */
    val end: Date,
    val days: List<WeekDay>,
    /** The Moon now: the band's five facts (the Day screen's) and the disc behind the text. */
    val moon: MoonToday,
)

/**
 * Sky Week's content: web's week (lib/weekReading.ts, ported in [WeekReading])
 * and the Moon at the instant itself, as Sky Day reads it. The board's own
 * forms (the kicker's date range, the count line) are built here from the
 * same days, so a test can read them.
 */
object SkyWeekComposer {
    internal val MONTHS = listOf("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC")
    private val COUNTS = listOf("NONE", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN")

    fun compose(engine: AstronomyEngine, culture: AncientCulture, now: Date): SkyWeek {
        val start = WeekReading.weekStart(now)
        val end = Calendar.getInstance().apply {
            time = start
            add(Calendar.DAY_OF_MONTH, 6)
        }.time
        return SkyWeek(
            start = start,
            end = end,
            days = WeekReading.build(engine, culture, start, now),
            moon = SkyDayComposer.moonToday(engine, now),
        )
    }

    /**
     * The board's kicker date form, "19 → 25 OCT 2026", on the local calendar
     * the rows use; across a month "29 SEP → 5 OCT 2026", across a year
     * "29 DEC 2025 → 4 JAN 2026".
     */
    fun range(start: Date, end: Date): String {
        val a = Calendar.getInstance().apply { time = start }
        val b = Calendar.getInstance().apply { time = end }
        val day = { c: Calendar -> c.get(Calendar.DAY_OF_MONTH) }
        val month = { c: Calendar -> MONTHS[c.get(Calendar.MONTH)] }
        val year = { c: Calendar -> c.get(Calendar.YEAR) }
        val tail = "${day(b)} ${month(b)} ${year(b)}"
        return when {
            year(a) != year(b) -> "${day(a)} ${month(a)} ${year(a)} → $tail"
            month(a) != month(b) -> "${day(a)} ${month(a)} → $tail"
            else -> "${day(a)} → $tail"
        }
    }

    /** "26 OCT 2026", on the local calendar: the band's date for the next quarter. */
    fun dayMonthYear(date: Date): String {
        val c = Calendar.getInstance().apply { time = date }
        return "${c.get(Calendar.DAY_OF_MONTH)} ${MONTHS[c.get(Calendar.MONTH)]} ${c.get(Calendar.YEAR)}"
    }

    /**
     * The board's count line, "SEVEN DAYS · SIX WEIGHED · ONE QUIET": a day
     * with a figure or an ingress is weighed, a day with nothing is quiet.
     */
    fun countLine(days: List<WeekDay>): String {
        val quiet = days.count { it.shorthand == WeekShorthand.Quiet }
        val count = { n: Int -> COUNTS.getOrElse(n) { n.toString() } }
        return "${count(days.size)} DAYS · ${count(days.size - quiet)} WEIGHED · ${count(quiet)} QUIET"
    }
}

/**
 * The week's title in each voice, web's CULTURE_VOICES weekTitle
 * (web/src/data/cultureVoice.ts), set in its own case as the web sets it.
 */
object WeekVoice {
    fun title(culture: AncientCulture): String = when (culture) {
        AncientCulture.EGYPT -> "SEVEN DAYS WEIGHED"
        AncientCulture.GREECE -> "SEVEN QUESTIONS"
        AncientCulture.CANAAN -> "SEVEN SITTINGS"
        AncientCulture.CARTHAGE -> "THE WEEK'S LEDGER"
        AncientCulture.ROME -> "FASTUS AND NEFASTUS"
    }
}
