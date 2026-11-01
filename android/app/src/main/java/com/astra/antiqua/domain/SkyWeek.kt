package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.domain.generated.SharedStrings
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
 * and the Moon at the instant itself, as Sky Day reads it. The printed forms
 * (the kicker's date range, the count line) come from the shared catalog and
 * [SharedFormat]; [SkyWeekSlots] builds the screen's slots from these days.
 */
object SkyWeekComposer {

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

    /** F2 `range.days` on the local calendar the rows use: "19 → 25 OCT 2026". */
    fun range(start: Date, end: Date): String = SharedFormat.rangeDays(start, end)

    /** F3 `date.dayMonthYear` on the local calendar: the band's date for the next quarter. */
    fun dayMonthYear(date: Date): String = SharedFormat.dayMonthYear(date)

    /**
     * The board's count line, "SEVEN DAYS · SIX WEIGHED · ONE QUIET": a day
     * with a figure or an ingress is weighed, a day with nothing is quiet.
     */
    fun countLine(days: List<WeekDay>): String {
        val quiet = days.count { it.tone == DayTone.QUIET }
        return SharedStrings.fill(
            SharedStrings.WEEK_COUNT_LINE,
            mapOf(
                "days" to SharedFormat.countWord(days.size),
                "weighed" to SharedFormat.countWord(days.size - quiet),
                "quiet" to SharedFormat.countWord(quiet),
            ),
        )
    }
}

/**
 * The week's voice from the shared catalog (week.title, week.thesis,
 * week.note, week.votive.*), web's CULTURE_VOICES and WEEK_VOTIVE.
 */
object WeekVoice {
    fun title(culture: AncientCulture): String = SharedStrings.WEEK_TITLE.getValue(culture)

    /** web weekThesis, the paragraph under the title on web; below the rows here (Matthew, 2026-10-31). */
    fun thesis(culture: AncientCulture): String = SharedStrings.WEEK_THESIS.getValue(culture)

    /** web weekNote, Rome's with its key to the day flags. */
    fun note(culture: AncientCulture): String = SharedStrings.WEEK_NOTE.getValue(culture)

    /** The day the votive follows: the first tension day, else the first harmony day, else the first. */
    fun hardestTone(days: List<WeekDay>): DayTone =
        (days.firstOrNull { it.tone == DayTone.TENSION } ?: days.firstOrNull { it.tone == DayTone.HARMONY } ?: days.firstOrNull())
            ?.tone ?: DayTone.QUIET

    /** web WEEK_VOTIVE (week.votive.*), keyed by the tone of the week's hardest day. */
    fun votive(culture: AncientCulture, days: List<WeekDay>): String = when (hardestTone(days)) {
        DayTone.TENSION -> SharedStrings.WEEK_VOTIVE_TENSION
        DayTone.HARMONY -> SharedStrings.WEEK_VOTIVE_HARMONY
        DayTone.QUIET -> SharedStrings.WEEK_VOTIVE_QUIET
    }.getValue(culture)

    /** web weekReadingId: "week-2026-W43", the ISO week of the Monday. */
    fun readingId(start: Date): String {
        val d = java.time.Instant.ofEpochMilli(start.time).atZone(java.time.ZoneId.systemDefault()).toLocalDate()
        val week = d.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR)
        val year = d.get(java.time.temporal.IsoFields.WEEK_BASED_YEAR)
        return "week-$year-W${week.toString().padStart(2, '0')}"
    }
}
