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

    /** web weekThesis, the paragraph under the title on web; below the rows here (Matthew, 2026-10-31). */
    fun thesis(culture: AncientCulture): String = when (culture) {
        AncientCulture.EGYPT -> "The day is laid on the scale at evening and the pans settle overnight. Seven weighings make the week."
        AncientCulture.GREECE -> "One question goes up to Delphi each day; the week is the art of asking them in order."
        AncientCulture.CANAAN -> "The council convenes each day on one matter; El presides at the seventh and closes the session."
        AncientCulture.CARTHAGE -> "Seven entries, debits and credits of the sky; the ledger is balanced before the next crossing."
        AncientCulture.ROME -> "Each day is marked lawful or unlawful for business before it begins; act on the F days."
    }

    /** web weekNote, with Rome's key to its day flags (dayFlags) as WeekNave appends it. */
    fun note(culture: AncientCulture): String = when (culture) {
        AncientCulture.EGYPT -> "DAYS TALLIED AGAINST THE FEATHER"
        AncientCulture.GREECE -> "EACH DAY NAMES ITS QUESTION"
        AncientCulture.CANAAN -> "THE SEVENTH DAY SEALS THE SIX"
        AncientCulture.CARTHAGE -> "ENTRIES CARRY FORWARD, VOWS DO NOT"
        AncientCulture.ROME -> "DAYS FLAGGED F · N · C IN THE LIST · F LAWFUL · N UNLAWFUL · C MIXED"
    }

    /**
     * web WEEK_VOTIVE (WeekNave.tsx), keyed by the tone of the week's hardest
     * day: the first tension day, else the first harmony day, else the first.
     */
    fun votive(culture: AncientCulture, days: List<WeekDay>): String {
        val tone = (days.firstOrNull { it.tone == DayTone.TENSION } ?: days.firstOrNull { it.tone == DayTone.HARMONY } ?: days.firstOrNull())
            ?.tone ?: DayTone.QUIET
        return when (culture) {
            AncientCulture.EGYPT -> when (tone) {
                DayTone.TENSION -> "WEIGH WHAT IS HEAVY BEFORE\nYOU CARRY IT INTO FRIDAY"
                DayTone.HARMONY -> "TAKE THE CURRENT WHILE\nIT RUNS WITH YOU"
                DayTone.QUIET -> "ORDINARY DAYS ARE NOT\nEMPTY DAYS"
            }
            AncientCulture.GREECE -> when (tone) {
                DayTone.TENSION -> "ASK THE HARD QUESTION\nBEFORE THE WEEK ASKS IT FOR YOU"
                DayTone.HARMONY -> "TAKE THE ANSWER GIVEN FREELY,\nWITHOUT A SECOND ASKING"
                DayTone.QUIET -> "SILENCE FROM THE SHRINE\nIS ALSO AN ANSWER"
            }
            AncientCulture.CANAAN -> when (tone) {
                DayTone.TENSION -> "LET THE WITNESS SPEAK\nBEFORE THE COUNCIL CLOSES"
                DayTone.HARMONY -> "SEAL THE VOW WHILE\nTHE RAINS STILL FAVOR IT"
                DayTone.QUIET -> "THE TENT STANDS EVEN ON\nA DAY WITH NO MATTER BEFORE IT"
            }
            AncientCulture.CARTHAGE -> when (tone) {
                DayTone.TENSION -> "LEAVE THE BOOKS OPEN\nUNTIL THE ACCOUNT IS TRUE"
                DayTone.HARMONY -> "LOAD WHILE THE HARBOR\nIS STILL OPEN TO YOU"
                DayTone.QUIET -> "A STEADY LEDGER IS\nSTILL A PROFITABLE ONE"
            }
            AncientCulture.ROME -> when (tone) {
                DayTone.TENSION -> "PROCEED, BUT KEEP\nTHE DEFENSE READY"
                DayTone.HARMONY -> "TAKE THE RIGHT HAND OFFERED\nWITHOUT A SECOND READING"
                DayTone.QUIET -> "AN ORDINARY DAY IS STILL\nTAKEN UNDER AUSPICES"
            }
        }
    }

    /** web weekReadingId: "week-2026-W43", the ISO week of the Monday. */
    fun readingId(start: Date): String {
        val d = java.time.Instant.ofEpochMilli(start.time).atZone(java.time.ZoneId.systemDefault()).toLocalDate()
        val week = d.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR)
        val year = d.get(java.time.temporal.IsoFields.WEEK_BASED_YEAR)
        return "week-$year-W${week.toString().padStart(2, '0')}"
    }
}
