package com.astra.antiqua.domain

import com.astra.antiqua.domain.generated.SharedFormats
import com.astra.antiqua.model.Planet
import java.time.Instant
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.ZonedDateTime
import java.util.Date
import java.util.Locale
import kotlin.math.abs
import kotlin.math.floor

/**
 * The one formatter over [SharedFormats] (rules F1 to F14 of
 * docs/design/shared-strings-table-2026-11.md), a port of web's `fmt`
 * (web/src/strings/formats.ts). Every date, range, angle, count and name a
 * screen prints goes through here; SharedFormatsTest runs it over
 * shared/goldens/formats.json.
 *
 * Zone rule: each date format takes the zone the slot names. Day reads the
 * UTC day ([UTC]); Week and Season read local days, the device's zone by
 * default. Rounding follows JavaScript's Math.round (half up).
 */
object SharedFormat {
    val UTC: ZoneId = ZoneOffset.UTC

    private fun local(): ZoneId = ZoneId.systemDefault()

    /** JavaScript's Math.round: half up, toward positive infinity. */
    private fun jsRound(x: Double): Long = floor(x + 0.5).toLong()

    private fun parts(date: Date, zone: ZoneId): ZonedDateTime = Instant.ofEpochMilli(date.time).atZone(zone)

    private fun month(z: ZonedDateTime): String = SharedFormats.MONTH_ABBR[z.monthValue - 1]

    /** java.time counts Monday 1 to Sunday 7; the list is Sunday first. */
    private fun weekdayOf(z: ZonedDateTime): String = SharedFormats.WEEKDAY_ABBR[z.dayOfWeek.value % 7]

    private fun pad2(n: Int): String = n.toString().padStart(2, '0')

    // ---- dates (F1 to F4) ----

    /** F1 `date.day`: "WED 21 OCT 2026". */
    fun dateDay(date: Date, zone: ZoneId = UTC): String {
        val z = parts(date, zone)
        return "${weekdayOf(z)} ${z.dayOfMonth} ${month(z)} ${z.year}"
    }

    /** F3 `date.dayMonth`: "23 SEP". */
    fun dayMonth(date: Date, zone: ZoneId = local()): String {
        val z = parts(date, zone)
        return "${z.dayOfMonth} ${month(z)}"
    }

    /** F3 `date.dayMonthYear`: "26 OCT 2026". */
    fun dayMonthYear(date: Date, zone: ZoneId = local()): String {
        val z = parts(date, zone)
        return "${z.dayOfMonth} ${month(z)} ${z.year}"
    }

    /** F3 `date.monthYear`: "OCT 2026". */
    fun monthYear(date: Date, zone: ZoneId = local()): String {
        val z = parts(date, zone)
        return "${month(z)} ${z.year}"
    }

    /** F1 `date.weekday`: "MON". */
    fun weekday(date: Date, zone: ZoneId = local()): String = weekdayOf(parts(date, zone))

    /** F3 `date.dayOfMonth`: "19". */
    fun dayOfMonth(date: Date, zone: ZoneId = local()): String = parts(date, zone).dayOfMonth.toString()

    /** F3 `date.year`: "2026". */
    fun year(date: Date, zone: ZoneId = local()): String = parts(date, zone).year.toString()

    /** F3 `time.hm`: "05:30", 24 hour. */
    fun timeHm(date: Date, zone: ZoneId = local()): String {
        val z = parts(date, zone)
        return "${pad2(z.hour)}:${pad2(z.minute)}"
    }

    /**
     * F2 `range.days`: same month "19 → 25 OCT 2026", across months
     * "29 SEP → 5 OCT 2026", across years "28 DEC 2026 → 3 JAN 2027".
     */
    fun rangeDays(from: Date, to: Date, zone: ZoneId = local()): String {
        val a = parts(from, zone)
        val b = parts(to, zone)
        val arrow = SharedFormats.ARROW
        return when {
            a.year != b.year -> "${a.dayOfMonth} ${month(a)} ${a.year}$arrow${b.dayOfMonth} ${month(b)} ${b.year}"
            a.monthValue != b.monthValue -> "${a.dayOfMonth} ${month(a)}$arrow${b.dayOfMonth} ${month(b)} ${b.year}"
            else -> "${a.dayOfMonth}$arrow${b.dayOfMonth} ${month(b)} ${b.year}"
        }
    }

    /** F4 `range.months`: "OCT 2026 → JUN 2027". */
    fun rangeMonths(from: Date, to: Date, zone: ZoneId = local()): String =
        "${monthYear(from, zone)}${SharedFormats.ARROW}${monthYear(to, zone)}"

    // ---- numbers (F5 to F7, F12) ----

    /** F5 `angle.degMin`: "3°37′", minutes rounded; under 30 never prints 30°00′. */
    fun degMin(degrees: Double): String {
        val v = maxOf(0.0, degrees)
        val total = jsRound(v * 60)
        var deg = total / 60
        var min = total - deg * 60
        if (v < 30 && deg >= 30) {
            deg = 29
            min = 59
        }
        return "$deg°${pad2(min.toInt())}′"
    }

    /** F6 `angle.orbDecimal`: "3.0°". */
    fun orbDecimal(degrees: Double): String =
        "%.1f°".format(Locale.ROOT, jsRound(abs(degrees) * 10) / 10.0)

    /** F6 `percent`: a 0 to 1 fraction, "74%". */
    fun percent(fraction: Double): String = "${jsRound(fraction * 100)}%"

    /** F7 `count.word`: NONE, ONE to TWELVE, digits above. */
    fun countWord(n: Int): String = SharedFormats.COUNT_WORDS.getOrNull(n) ?: n.toString()

    /** F7 `count.digits`. */
    fun countDigits(n: Int): String = n.toString()

    /** F12 `ordinal.word`: "eleventh"; digits outside 1 to 12. */
    fun ordinalWord(n: Int): String = if (n in 1..12) SharedFormats.ORDINAL_WORDS[n] else n.toString()

    /** F12 `ordinal.wordUpper`: "SECOND". */
    fun ordinalWordUpper(n: Int): String = ordinalWord(n).uppercase(Locale.ROOT)

    /** F12 `ordinal.wordTitle`: "Eleventh". */
    fun ordinalWordTitle(n: Int): String = ordinalWord(n).replaceFirstChar { it.uppercase(Locale.ROOT) }

    private val ROMAN = listOf(
        1000 to "M", 900 to "CM", 500 to "D", 400 to "CD", 100 to "C", 90 to "XC",
        50 to "L", 40 to "XL", 10 to "X", 9 to "IX", 5 to "V", 4 to "IV", 1 to "I",
    )

    /** F12 `house.roman` and `year.roman`: "II", "MMXXVI". */
    fun roman(value: Int): String {
        var n = maxOf(1, value)
        val out = StringBuilder()
        for ((amount, symbol) in ROMAN) {
            while (n >= amount) {
                out.append(symbol)
                n -= amount
            }
        }
        return out.toString()
    }

    // ---- names (F8, F9, F11) ----

    /** F8 `sign.full`: "CAPRICORN". */
    fun signFull(sign: ZodiacSign): String = SharedFormats.SIGN_FULL.getValue(sign.signName)

    /** F8 `sign.abbr`: "CAP". */
    fun signAbbr(sign: ZodiacSign): String = SharedFormats.SIGN_ABBR.getValue(sign.signName)

    /** F8 `sign.phrase`: "SCALES". */
    fun signPhrase(sign: ZodiacSign): String = SharedFormats.SIGN_PHRASES.getValue(sign.signName)

    /** F8 `planet.name`: "MERCURY". */
    fun planetName(planet: Planet): String = SharedFormats.PLANET_NAMES.getValue(planet.name.lowercase(Locale.ROOT))

    /** F9 `tone.word`: EASE (trine, sextile), TENSION (square, opposition), UNION (conjunction). */
    fun toneWord(aspect: AspectType): String = SharedFormats.TONE_WORDS.getValue(aspect.name.lowercase(Locale.ROOT))

    /** F9 the spans' two tones: EASE or TENSION, a conjunction reading as ease. */
    fun spanToneWord(aspect: AspectType): String = SharedFormats.SPAN_TONE_WORDS.getValue(
        if (aspect == AspectType.SQUARE || aspect == AspectType.OPPOSITION) "tension" else "ease",
    )

    /** F11 `motion.mark`: "R" when retrograde, nothing otherwise. */
    fun motionMark(retrograde: Boolean): String = if (retrograde) SharedFormats.RETROGRADE_MARK else ""

    private fun signNamed(name: String): ZodiacSign = ZodiacSign.entries.first { it.signName == name }

    /**
     * A format by its name in formats.json, for the golden test: [input] is a
     * Date, a pair of Dates, a number, a boolean or a name as the golden gives it.
     */
    fun format(name: String, input: Any, zone: ZoneId): String = when (name) {
        "date.day" -> dateDay(input as Date, zone)
        "date.dayMonth" -> dayMonth(input as Date, zone)
        "date.dayMonthYear" -> dayMonthYear(input as Date, zone)
        "date.monthYear" -> monthYear(input as Date, zone)
        "date.weekday" -> weekday(input as Date, zone)
        "date.dayOfMonth" -> dayOfMonth(input as Date, zone)
        "date.year" -> year(input as Date, zone)
        "time.hm" -> timeHm(input as Date, zone)
        "range.days" -> (input as List<*>).let { rangeDays(it[0] as Date, it[1] as Date, zone) }
        "range.months" -> (input as List<*>).let { rangeMonths(it[0] as Date, it[1] as Date, zone) }
        "angle.degMin" -> degMin((input as Number).toDouble())
        "angle.orbDecimal" -> orbDecimal((input as Number).toDouble())
        "percent" -> percent((input as Number).toDouble())
        "count.word" -> countWord((input as Number).toInt())
        "count.digits" -> countDigits((input as Number).toInt())
        "ordinal.word" -> ordinalWord((input as Number).toInt())
        "ordinal.wordUpper" -> ordinalWordUpper((input as Number).toInt())
        "ordinal.wordTitle" -> ordinalWordTitle((input as Number).toInt())
        "house.roman", "year.roman" -> roman((input as Number).toInt())
        "sign.full" -> signFull(signNamed(input as String))
        "sign.abbr" -> signAbbr(signNamed(input as String))
        "sign.phrase" -> signPhrase(signNamed(input as String))
        "planet.name" -> planetName(Planet.valueOf((input as String).uppercase(Locale.ROOT)))
        "tone.word" -> toneWord(AspectType.valueOf((input as String).uppercase(Locale.ROOT)))
        "motion.mark" -> motionMark(input as Boolean)
        else -> error("SharedFormat: unknown format $name")
    }
}
