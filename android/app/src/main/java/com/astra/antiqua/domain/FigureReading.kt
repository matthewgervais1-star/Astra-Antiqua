package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.time.LocalDate
import java.time.ZoneOffset
import java.time.format.DateTimeParseException
import java.util.Date
import kotlin.math.abs

/** One part of the decomposed sentence: a plain phrase, its fact in mono, the glyph beside it (null for the relation or an angle). */
data class FigurePart(val phrase: String, val tag: String, val body: Planet?)

/** One end of the two-body diagram. */
data class DiagramPoint(val body: Planet?, val longitude: Double, val label: String)

/** What the figure page prints under its headline: the paragraph and every section below it. */
data class FigureAnatomy(
    val heroBody: Planet,
    val moveOne: String,
    val moveTwo: String,
    val parts: List<FigurePart>,
    val from: DiagramPoint,
    val to: DiagramPoint,
    val aspect: AspectType,
    val recurrence: String,
    val playsOutTitle: String,
    val actLine: String,
    val manifestations: List<String>,
    val cards: List<TryThisCard>,
    val lesson: String,
)

/** The figure page for one day's figure. [window] is filled by [FigureReadingComposer.withWindow]. */
data class FigurePage(
    val date: String,
    val id: String,
    val headline: String,
    val evidence: String,
    val instant: Date,
    val natal: Boolean,
    /** With a chart, the line under the evidence naming the contact the page reads; null for the sky reading. */
    val bridge: String?,
    val feedbackId: String,
    val anatomy: FigureAnatomy,
    /** The natal longitude the displayed figure reads against, or null for the sky figure. */
    val natalTarget: Double?,
    val window: OrbWindow? = null,
)

/** The reader's chart, as the figure page needs it. */
data class NatalPoints(val chart: Map<Planet, Double>, val ascendant: Double)

/** The natal point a figure touches: the transiting body, the natal planet, the kind and the orb. */
data class NatalContact(val body: Planet, val point: Planet, val aspect: AspectType, val orb: Double)

/**
 * The figure page's composer, ported from web/src/lib/figureReading.ts. The
 * banks are generated (FigureBanks.kt), and FigureParityTest pins this to
 * web's text for one figure per culture, with a chart and without.
 */
object FigureReadingComposer {
    private const val DAY_MS = 86_400_000L

    private fun name(culture: AncientCulture, body: Planet): String = DeityRegistry.getDeity(culture, body).name

    private fun cap(s: String) = if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }
    private fun lower(s: String) = if (s.isEmpty()) s else s.replaceFirstChar { it.lowercase() }

    private fun fill(template: String, slots: Map<String, String>): String =
        Regex("""\{(\w+)\}""").replace(template) { m -> slots[m.groupValues[1]] ?: m.value }

    private fun separation(x: Double, y: Double): Double {
        val raw = abs(x - y) % 360.0
        return if (raw > 180.0) 360.0 - raw else raw
    }

    // --- ids and dates -------------------------------------------------------

    private fun key(p: Planet) = p.name.lowercase()

    /** "mars-trine-neptune", the two bodies in canonical planet order. */
    fun figureId(a: Planet, aspect: AspectType, b: Planet): String {
        val (x, y) = if (a.ordinal <= b.ordinal) a to b else b to a
        return "${key(x)}-${aspect.name.lowercase()}-${key(y)}"
    }

    fun figureId(f: SkyFigure): String = figureId(f.a, f.aspect, f.b)

    fun parseFigureId(id: String): Triple<Planet, AspectType, Planet>? {
        val parts = id.split("-")
        if (parts.size != 3) return null
        val a = Planet.entries.firstOrNull { key(it) == parts[0] } ?: return null
        val aspect = AspectType.entries.firstOrNull { it.name.lowercase() == parts[1] } ?: return null
        val b = Planet.entries.firstOrNull { key(it) == parts[2] } ?: return null
        if (a == b) return null
        return Triple(a, aspect, b)
    }

    /** YYYY-MM-DD of the UTC day containing [date]. */
    fun isoDateUtc(date: Date): String = date.toInstant().atZone(ZoneOffset.UTC).toLocalDate().toString()

    /** The dates a page will read; far from the present the ephemeris is too slow to walk. */
    const val FIRST_READABLE_DATE = "1900-01-01"
    const val LAST_READABLE_DATE = "2100-12-31"

    /** 00:00 UTC on a YYYY-MM-DD date from 1900 to 2100, or null. */
    fun parseIsoDate(date: String): Date? = try {
        if (!Regex("""\d{4}-\d{2}-\d{2}""").matches(date) || date < FIRST_READABLE_DATE || date > LAST_READABLE_DATE) null
        else Date.from(LocalDate.parse(date).atStartOfDay(ZoneOffset.UTC).toInstant())
    } catch (_: DateTimeParseException) {
        null
    }

    // --- the pieces -----------------------------------------------------------

    /** The partner body's house group when the reader has no chart, by what the body governs. */
    fun domainGroup(body: Planet): Int = when (body) {
        Planet.SUN, Planet.JUPITER, Planet.SATURN -> 0
        Planet.MOON, Planet.VENUS, Planet.PLUTO -> 1
        Planet.MERCURY, Planet.URANUS -> 2
        Planet.MARS, Planet.NEPTUNE -> 3
    }

    /** Whole-sign house, 1 to 12, of a longitude from the ascendant. */
    fun wholeSignHouse(longitude: Double, ascendant: Double): Int {
        val asc = Math.floorMod((((ascendant % 360.0) + 360.0) % 360.0 / 30.0).toInt(), 12)
        val point = Math.floorMod((((longitude % 360.0) + 360.0) % 360.0 / 30.0).toInt(), 12)
        return Math.floorMod(point - asc, 12) + 1
    }

    /** Work and coin, house and kin, letters and crossings, the inner room. */
    fun houseGroupIndex(house: Int): Int = when (house) {
        2, 6, 10 -> 0
        4, 8 -> 1
        3, 7, 11 -> 2
        else -> 3
    }

    /** Move one for a natal planet: the culture's frame around the placement's authored clause. */
    fun natalMoveOne(culture: AncientCulture, point: Planet, longitude: Double): String {
        val sign = ZodiacUtils.getZodiacSign(longitude)
        return fill(
            FigureBanks.natalFrame(culture),
            mapOf("deity" to name(culture, point), "sign" to FigureBanks.signPhrase(sign), "clause" to FigureBanks.placementClause(point, sign)),
        )
    }

    private fun skyMoveOne(culture: AncientCulture, body: Planet, longitude: Double): String =
        fill(
            FigureBanks.skyMoveOne(culture),
            mapOf(
                "god" to name(culture, body),
                "sign" to FigureBanks.signPhrase(ZodiacUtils.getZodiacSign(longitude)),
                "domain" to deityDomain(culture, body),
            ),
        )

    /** "Right now {two domains and a relation}: {the consequence}." The colon keeps two "and"s from stacking. */
    private fun moveTwo(clause: String, consequence: String?) =
        if (consequence != null) "Right now $clause: ${lower(consequence)}" else "Right now $clause."

    private fun relationPart(culture: AncientCulture, aspect: AspectType) = FigurePart(
        FigureBanks.shortRelation(culture, aspect),
        "${aspect.name} (${aspect.degree.toInt()}°)",
        null,
    )

    private fun nowTag(culture: AncientCulture, body: Planet) = "${name(culture, body).uppercase()} NOW"
    private fun natalTag(culture: AncientCulture, body: Planet, longitude: Double) =
        "YOUR ${name(culture, body).uppercase()} IN ${ZodiacUtils.getZodiacSign(longitude).signName.uppercase()}"

    private fun harmony(aspect: AspectType) = DayDecreeComposer.toneFor(aspect) == DayTone.HARMONY

    private fun lesson(culture: AncientCulture, aspect: AspectType, god: Planet) =
        fill(FigureBanks.lesson(culture, aspect), mapOf("god" to name(culture, god)))

    /** A contact in mono, the transiting god against the reader's: "MARS ⚹ YOUR MERCURIUS · 0°41′". */
    fun bridge(culture: AncientCulture, body: Planet, point: Planet, aspect: AspectType, orb: Double): String =
        "${name(culture, body).uppercase()} ${DayDecreeComposer.glyph(aspect)} " +
            "YOUR ${name(culture, point).uppercase()} · ${DayDecreeComposer.orbMeasure(orb)}"

    /** The tightest aspect from the headline body to a natal planet; from the partner when the headline body touches none. */
    fun natalContact(sky: Map<Planet, Double>, natal: NatalPoints, headline: Planet, partner: Planet): NatalContact? {
        // A body against itself is left out: the page reads one domain against
        // another, and a body against its own natal place would read one domain twice.
        fun contactsOf(body: Planet): List<NatalContact> = Planet.entries.filter { it != body }.mapNotNull { point ->
            val angle = separation(sky.getValue(body), natal.chart.getValue(point))
            AspectType.entries.firstOrNull { abs(angle - it.degree) <= it.orb }
                ?.let { NatalContact(body, point, it, abs(angle - it.degree)) }
        }.sortedBy { it.orb }
        return contactsOf(headline).firstOrNull() ?: contactsOf(partner).firstOrNull()
    }

    // --- the day's figure -------------------------------------------------------

    /** Why a figure page has nothing to read. */
    enum class Missing { MALFORMED, SLOW, ABSENT }

    /** The reason [compose] returns null for this sky, or null when it would compose. */
    fun missing(date: String, sky: Map<Planet, Double>?, id: String): Missing? {
        if (parseIsoDate(date) == null) return Missing.MALFORMED
        val (a, aspect, b) = parseFigureId(id) ?: return Missing.MALFORMED
        if (a !in DayDecreeComposer.FAST_ORDER && b !in DayDecreeComposer.FAST_ORDER) return Missing.SLOW
        if (sky == null) return null
        val angle = separation(sky.getValue(a), sky.getValue(b))
        val matched = AspectType.entries.firstOrNull { abs(angle - it.degree) <= it.orb }
        return if (matched == aspect) null else Missing.ABSENT
    }

    /**
     * The page for a day's figure from the sky at 00:00 UTC on [date]. Null
     * when the date or id does not parse, or the sky does not hold the figure.
     */
    fun compose(
        culture: AncientCulture,
        date: String,
        sky: Map<Planet, Double>,
        id: String,
        natal: NatalPoints?,
    ): FigurePage? {
        val instant = parseIsoDate(date) ?: return null
        val parsed = parseFigureId(id) ?: return null
        val (a, aspect, b) = if (parsed.first.ordinal < parsed.third.ordinal) parsed else Triple(parsed.third, parsed.second, parsed.first)
        val angle = separation(sky.getValue(a), sky.getValue(b))
        val matched = AspectType.entries.firstOrNull { abs(angle - it.degree) <= it.orb } ?: return null
        if (matched != aspect) return null
        if (a !in DayDecreeComposer.FAST_ORDER && b !in DayDecreeComposer.FAST_ORDER) return null

        val figure = SkyFigure(a, b, aspect, abs(angle - aspect.degree))
        val (headline, partner) = DayDecreeComposer.headlineBody(a, b)
        val day = Math.floorDiv(instant.time, DAY_MS)
        val contact = natal?.let { natalContact(sky, it, headline, partner) }

        val anatomy = if (natal != null && contact != null) {
            val natalLon = natal.chart.getValue(contact.point)
            val group = houseGroupIndex(wholeSignHouse(natalLon, natal.ascendant))
            // Move two reads the contact; its consequence is keyed by the point
            // it touches, or by the transiting body when that point is the Moon.
            val consequence = DecreeBanks.consequence(
                culture,
                contact.aspect,
                if (contact.point == Planet.MOON) contact.body else contact.point,
            )
            // The act names the contact's god, so hero, act and cards agree.
            val act = if (contact.body in DayDecreeComposer.FAST_ORDER) {
                fill(DecreeBanks.image(culture, contact.aspect, contact.body), mapOf("god" to name(culture, contact.body)))
            } else {
                fill(FigureBanks.slowAct(culture, contact.body), mapOf("god" to name(culture, contact.body)))
            }
            FigureAnatomy(
                heroBody = contact.body,
                moveOne = natalMoveOne(culture, contact.point, natalLon),
                moveTwo = moveTwo(
                    DayDecreeComposer.pairClause(
                        culture,
                        deityDomain(culture, contact.body),
                        deityDomain(culture, contact.point),
                        contact.aspect,
                        day,
                    ),
                    consequence,
                ),
                parts = listOf(
                    FigurePart(cap(deityDomain(culture, contact.body)), nowTag(culture, contact.body), contact.body),
                    relationPart(culture, contact.aspect),
                    FigurePart("${deityDomain(culture, contact.point)}.", natalTag(culture, contact.point, natalLon), contact.point),
                ),
                from = DiagramPoint(contact.body, sky.getValue(contact.body), nowTag(culture, contact.body)),
                to = DiagramPoint(contact.point, natalLon, "YOUR ${name(culture, contact.point).uppercase()}"),
                aspect = contact.aspect,
                recurrence = Recurrence.compose(culture, Recurrence.natalDays(contact.body, contact.aspect)),
                playsOutTitle = FigureBanks.playsOutTitle(culture),
                actLine = act,
                manifestations = FigureBanks.manifestations(culture, group, harmony(contact.aspect)),
                cards = FigureBanks.tryThis(culture, contact.body),
                lesson = lesson(culture, contact.aspect, contact.body),
            )
        } else {
            FigureAnatomy(
                heroBody = headline,
                moveOne = skyMoveOne(culture, headline, sky.getValue(headline)),
                moveTwo = moveTwo(
                    DayDecreeComposer.meaningClause(culture, figure, day),
                    DayDecreeComposer.composeConsequence(culture, figure),
                ),
                parts = listOf(
                    FigurePart(cap(deityDomain(culture, headline)), nowTag(culture, headline), headline),
                    relationPart(culture, aspect),
                    FigurePart("${deityDomain(culture, partner)}.", nowTag(culture, partner), partner),
                ),
                from = DiagramPoint(headline, sky.getValue(headline), nowTag(culture, headline)),
                to = DiagramPoint(partner, sky.getValue(partner), nowTag(culture, partner)),
                aspect = aspect,
                recurrence = Recurrence.compose(culture, Recurrence.skyDays(a, b, aspect)),
                playsOutTitle = FigureBanks.playsOutTitle(culture),
                actLine = DayDecreeComposer.composeImage(culture, figure),
                manifestations = FigureBanks.manifestations(culture, domainGroup(partner), harmony(aspect)),
                cards = FigureBanks.tryThis(culture, headline),
                lesson = lesson(culture, aspect, headline),
            )
        }

        val canonical = figureId(figure)
        return FigurePage(
            date = date,
            id = canonical,
            headline = DayDecreeComposer.composeHeadline(culture, figure),
            evidence = DayDecreeComposer.composeEvidence(culture, figure),
            instant = instant,
            natal = natal != null && contact != null,
            bridge = if (natal != null && contact != null) {
                bridge(culture, contact.body, contact.point, contact.aspect, contact.orb)
            } else {
                null
            },
            feedbackId = "figure-$date-$canonical",
            anatomy = anatomy,
            natalTarget = if (natal != null && contact != null) natal.chart.getValue(contact.point) else null,
        )
    }

    /** The page with the sky read by Android's engine at 00:00 UTC, and its window in orb. */
    fun composePage(engine: AstronomyEngine, culture: AncientCulture, date: String, id: String, natal: NatalPoints?): FigurePage? {
        val instant = parseIsoDate(date) ?: return null
        val page = compose(culture, date, DayDecreeComposer.chartAt(engine, instant), id, natal) ?: return null
        return withWindow(engine, page)
    }

    fun withWindow(engine: AstronomyEngine, page: FigurePage): FigurePage {
        val a = page.anatomy
        val window = if (page.natalTarget != null) {
            Recurrence.natalWindow(engine, a.heroBody, page.natalTarget, a.aspect, page.instant)
        } else {
            val other = a.to.body ?: a.heroBody
            Recurrence.skyWindow(engine, a.heroBody, other, a.aspect, page.instant)
        }
        return page.copy(window = window)
    }

    // --- the long transit -------------------------------------------------------

    /** The anatomy around a long transit's spine: a slow body against the natal Sun, Moon, rising or midheaven. */
    fun composeSpan(
        culture: AncientCulture,
        span: TransitSpan,
        natal: NatalPoints,
        transitLongitude: Double,
        now: Date,
    ): Pair<String, FigureAnatomy> {
        val body = span.transitPlanet
        val aspect = span.aspect
        val day = Math.floorDiv(now.time, DAY_MS)
        val sign = ZodiacUtils.getZodiacSign(span.natalLongitude)
        val isAngle = span.natalKey == "asc" || span.natalKey == "mc"
        val point = if (isAngle) null else Planet.entries.first { key(it) == span.natalKey }
        val pointDomain = if (point == null) FigureBanks.angleDomain(culture, span.natalKey) else deityDomain(culture, point)
        val angleLabel = if (span.natalKey == "asc") "RISING" else "MIDHEAVEN"
        val one = if (point == null) {
            fill(FigureBanks.angleMoveOne(culture, span.natalKey), mapOf("sign" to FigureBanks.signPhrase(sign)))
        } else {
            natalMoveOne(culture, point, span.natalLongitude)
        }
        val house = wholeSignHouse(span.natalLongitude, natal.ascendant)
        val pointTag = if (point == null) "YOUR $angleLabel IN ${sign.signName.uppercase()}" else natalTag(culture, point, span.natalLongitude)
        val anatomy = FigureAnatomy(
            heroBody = body,
            moveOne = one,
            moveTwo = moveTwo(
                DayDecreeComposer.pairClause(culture, deityDomain(culture, body), pointDomain, aspect, day),
                DecreeBanks.consequence(culture, aspect, body),
            ),
            parts = listOf(
                FigurePart(cap(deityDomain(culture, body)), nowTag(culture, body), body),
                relationPart(culture, aspect),
                FigurePart("$pointDomain.", pointTag, point),
            ),
            from = DiagramPoint(body, transitLongitude, nowTag(culture, body)),
            to = DiagramPoint(
                point,
                span.natalLongitude,
                if (point == null) "YOUR $angleLabel" else "YOUR ${name(culture, point).uppercase()}",
            ),
            aspect = aspect,
            recurrence = Recurrence.compose(culture, Recurrence.natalDays(body, aspect)),
            playsOutTitle = FigureBanks.playsOutTitle(culture),
            actLine = fill(FigureBanks.slowAct(culture, body), mapOf("god" to name(culture, body))),
            manifestations = FigureBanks.manifestations(culture, houseGroupIndex(house), spanTone(span) == SpanTone.EASE),
            cards = FigureBanks.tryThis(culture, body),
            lesson = lesson(culture, aspect, body),
        )
        return FigureBanks.slowHeadline(culture, aspect, body) to anatomy
    }
}
