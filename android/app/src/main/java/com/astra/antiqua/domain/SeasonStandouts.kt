package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Time
import io.github.cosinekitty.astronomy.nextGlobalSolarEclipse
import io.github.cosinekitty.astronomy.nextLunarEclipse
import io.github.cosinekitty.astronomy.nextMoonQuarter
import io.github.cosinekitty.astronomy.searchGlobalSolarEclipse
import io.github.cosinekitty.astronomy.searchLunarEclipse
import io.github.cosinekitty.astronomy.searchMoonQuarter
import java.util.Date
import java.util.Locale
import kotlin.math.abs
import kotlin.math.ceil

/** The four natal points web's season reads transits against: Sun, Moon, Ascendant, Midheaven. */
data class SeasonNatal(val sun: Double, val moon: Double, val ascendant: Double, val midheaven: Double)

/** web's Tone (`lib/tone.ts`). */
enum class StandoutTone { HARMONY, TENSION, UNION }

/** web's SeasonStandout, the parts the page prints. */
data class SeasonStandout(
    val date: Date,
    val title: String,
    val body: String,
    val tone: StandoutTone?,
    val significance: Double,
)

/**
 * Ports of web's `buildSeasonStandouts` (`lib/season.ts`) with the finders it
 * reads (`lib/yearForecast.ts`: findMajorTransits, findEclipses,
 * findMoonPhases, findRetrogradeStations, findYearIngresses), the story beats
 * it names (`data/yearNarrative.ts`), and the season page's prose
 * (`components/horizons/seasonContent.ts`).
 */
object SeasonStandouts {

    private const val DAY_MS = 86_400_000L

    /** web's TRANSIT_PRINCIPLE (`lib/personalReading.ts`). */
    private val PRINCIPLE: Map<Planet, String> = mapOf(
        Planet.SUN to "the push to be seen and to lead",
        Planet.MOON to "the tide of feeling and need",
        Planet.MERCURY to "the traffic of words and ideas",
        Planet.VENUS to "the pull toward closeness and pleasure",
        Planet.MARS to "the drive to act and to fight",
        Planet.JUPITER to "the urge to expand and to trust",
        Planet.SATURN to "the demand for discipline and limit",
        Planet.URANUS to "the shock of sudden change and the break for freedom",
        Planet.NEPTUNE to "the pull to dissolve, to dream, to blur the edges",
        Planet.PLUTO to "the demand that what is buried be brought up and counted",
    )

    /** web's transitPlanetWeight (`lib/transits.ts`). */
    private fun weight(planet: Planet): Double = when (planet) {
        Planet.PLUTO -> 5.0
        Planet.URANUS, Planet.NEPTUNE -> 4.5
        Planet.SATURN -> 4.0
        Planet.JUPITER -> 3.0
        Planet.MARS -> 2.0
        Planet.VENUS, Planet.MERCURY -> 1.5
        else -> 1.0
    }

    /** web's dated beats for eclipses and retrograde turns (`data/yearNarrative.ts`), headline to body. */
    private val BEATS: Map<String, Pair<String, String>> = mapOf(
        "eclipse-lunar" to ("What you buried comes up now." to "A feeling you have kept under the floor gets dragged into the open. The thing you would not say to your partner, the resentment you keep calling patience, it crests now and stops letting you ignore it. This is the ending you have been postponing. Name it out loud, to the right person, and let what is already over actually close."),
        "eclipse-solar" to ("A new version of you starts here." to "Who you are begins a new line today. An old self ends, and a chapter you cannot yet name opens in its place. Stop gripping the role that quit fitting years ago: the title you outgrew, the version of you everyone still expects. Let it go and walk into the room cleared out for who you are becoming. This is a beginning, so begin."),
        "retrograde-saturn" to ("Reread what you signed." to "A structure you live inside goes under review for months: the contract, the role, the arrangement you agreed to without reading closely. This is the stretch to reopen it and fix what is cracked. Renegotiate the terms, redraw the line that stopped working, repair the thing you have been tolerating. Do not launch the new venture yet. This window is for mending what you already have, not building what you do not."),
        "retrograde-jupiter" to ("The growth is inward this season." to "Your growth turns inward for a while. The real opportunity is not the outside break you keep scanning for: the promotion, the lucky introduction, the offer that rescues you. It is in what you finally understand and what you are ready to quit doing. Stop refreshing your inbox for rescue. Sharpen what you already know and drop the habit that has been quietly costing you. The expansion this season is quiet, and it is closer than you think."),
        "retrograde-mercury" to ("Double-check, do not launch." to "Plans, messages, and machines go sideways for a few weeks. Read the contract twice before you sign. Say the thing you left unsaid to the person who took your last message wrong. Back up the files and confirm the times. This is a window for finishing, fixing, and clearing the backlog, not for launching the product or making the big commitment. Tie off loose ends now; start the new thing when the noise clears."),
        "retrograde-uranus" to ("The revolution turns inward for a stretch." to "The urge to break free goes underground for months. Outside, things look stable again; do not call the change canceled. This stretch is for rebellion with a plan: work out which cage is real and which is furniture, save the money, learn the skill the exit requires. Do not blow anything up right now. Draw the map. The next opening is coming, and this time you leave packed."),
        "retrograde-neptune" to ("The water clears for a while. Look down." to "The fog pulls back for a few months, and what it covered sits in plain view: the promise that was never going to be kept, the dream that was mostly avoidance, the person you painted over. Do not look away; this clarity is the window. Cancel the illusion while you can see it. Keep the dream that survives sober daylight. That one is real, and it is worth the work."),
        "retrograde-pluto" to ("The excavation pauses. Sort what came up." to "The deep pressure eases for a few months, and the digging turns inward. This stretch is for sorting what the year has already unearthed: the motive you finally saw, the pattern you caught in the act, the power you did not know you had. Name them plainly, at least to yourself. Do not restart the buried habit just because the weight lifted. The pressure comes back. It checks your work."),
    )

    /** web's SEASON_TRANSIT_PLANETS. */
    private val TRANSIT_BODIES = listOf(Planet.VENUS, Planet.MARS, Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO)

    /** web's SLOW_BODIES. */
    private val SLOW_BODIES = listOf(Planet.JUPITER, Planet.SATURN, Planet.URANUS, Planet.NEPTUNE, Planet.PLUTO)

    private val ASPECTS = listOf(
        AspectType.CONJUNCTION to 0.0,
        AspectType.SEXTILE to 60.0,
        AspectType.SQUARE to 90.0,
        AspectType.TRINE to 120.0,
        AspectType.OPPOSITION to 180.0,
    )

    private fun cap(s: String) = s.replaceFirstChar { it.uppercase() }

    private fun deity(culture: AncientCulture, planet: Planet) = DeityRegistry.getDeity(culture, planet).name

    private fun julianDay(date: Date) = date.time / 86_400_000.0 + 2440587.5

    private fun longitude(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(julianDay(date), TransitSpans.bodyOf(body)).longitude

    private fun norm(a: Double) = ((a % 360.0) + 360.0) % 360.0

    private fun sign(longitude: Double) = ZodiacSign.entries[(norm(longitude) / 30.0).toInt() % 12]

    private fun dateOf(time: Time) = Date(Math.round((time.ut + 2451545.0 - 2440587.5) * 86_400_000.0))

    private fun timeOf(date: Date) = Time(julianDay(date) - 2451545.0)

    private fun toneOf(aspect: AspectType): StandoutTone = when (aspect) {
        AspectType.TRINE, AspectType.SEXTILE -> StandoutTone.HARMONY
        AspectType.SQUARE, AspectType.OPPOSITION -> StandoutTone.TENSION
        else -> StandoutTone.UNION
    }

    /** The beats the window holds, web's whole list before trimming; [count] keeps web's top ones by date. */
    fun build(
        engine: AstronomyEngine,
        culture: AncientCulture,
        window: SkyEvents.SeasonWindow,
        natal: SeasonNatal?,
        count: Int = 2,
    ): List<SeasonStandout> {
        val days = ceil((window.end.time - window.start.time).toDouble() / DAY_MS).toInt() + 6
        val end = window.end.time
        val out = mutableListOf<SeasonStandout>()

        if (natal != null) {
            transits(engine, natal, window.start, days).filter { it.date.time <= end }.forEach { t ->
                val tLabel = deity(culture, t.planet)
                val nLabel = when (t.key) {
                    "asc" -> "your Ascendant"
                    "mc" -> "your Midheaven"
                    "sun" -> "your ${deity(culture, Planet.SUN)}"
                    else -> "your ${deity(culture, Planet.MOON)}"
                }
                val tone = toneOf(t.aspect)
                val principle = cap(PRINCIPLE.getValue(t.planet))
                val body = when (tone) {
                    StandoutTone.HARMONY -> "$principle runs with the current on this date. Nothing is asked in return."
                    StandoutTone.TENSION -> "$principle is contested on this date. Decide what gives before the date decides it."
                    StandoutTone.UNION -> "$principle gathers to one point on this date. Spend it on one thing."
                }
                out += SeasonStandout(
                    t.date,
                    "$tLabel ${AspectVerbs.of(culture, t.aspect)} $nLabel.",
                    body,
                    tone,
                    weight(t.planet) * (if (tone == StandoutTone.TENSION) 2.5 else 2.0),
                )
            }
        }

        eclipses(window.start, days).filter { it.first.time <= end }.forEach { (date, lunar, obscuration) ->
            val (headline, body) = BEATS.getValue(if (lunar) "eclipse-lunar" else "eclipse-solar")
            out += SeasonStandout(date, headline, body, StandoutTone.TENSION, 5 + obscuration * 2)
        }

        moonPhases(engine, window.start, days).filter { it.first.time <= end }.forEach { (date, quarter, s) ->
            if (quarter != 0 && quarter != 2) return@forEach
            val isNew = quarter == 0
            val name = if (isNew) "New Moon" else "Full Moon"
            out += SeasonStandout(
                date,
                "$name in ${s.signName}.",
                if (isNew) {
                    "The month's clean page. Start the thing here and it inherits the whole cycle's momentum."
                } else {
                    "The month's full light. What was building since the New Moon shows its results, ready or not."
                },
                null,
                if (isNew) 2.2 else 2.4,
            )
        }

        SkyEvents.stations(engine, window.start, days).filter { it.date.time <= end }.forEach { r ->
            val label = deity(culture, r.body)
            val retro = r.kind == SkyEventKind.RETROGRADE
            val beat = if (retro) BEATS["retrograde-${r.body.name.lowercase()}"] else null
            val degree = String.format(Locale.US, "%.1f", norm(longitude(engine, r.body, r.date)) % 30.0)
            val astro = "$label turns ${if (retro) "retrograde" else "direct"} at $degree° ${r.sign.signName}"
            out += SeasonStandout(
                r.date,
                beat?.first ?: "$astro.",
                beat?.second ?: if (retro) {
                    "This planet's work slows and doubles back for a stretch. Review and revise rather than launch."
                } else {
                    "The doubling-back ends and held work starts moving forward again."
                },
                if (retro) StandoutTone.TENSION else StandoutTone.HARMONY,
                if (r.body == Planet.MERCURY) 2.0 else 1.5,
            )
        }

        SkyEvents.ingresses(engine, window.start, days, listOf(Planet.MERCURY, Planet.VENUS, Planet.MARS))
            .filter { it.date.time <= end }
            .forEach { ing ->
                out += SeasonStandout(
                    ing.date,
                    "${deity(culture, ing.body)} enters ${ing.sign.signName}.",
                    "${cap(PRINCIPLE.getValue(ing.body))} changes register for the weeks ahead as ${deity(culture, ing.body)} crosses into ${ing.sign.signName}.",
                    null,
                    1.0,
                )
            }

        // web sorts by significance (a stable sort), keeps the top [count], then orders them by date.
        return out.sortedByDescending { it.significance }.take(count).sortedBy { it.date.time }
    }

    private data class Peak(val planet: Planet, val key: String, val aspect: AspectType, val date: Date)

    private fun signedDiff(longitude: Double, target: Double): Double {
        var d = longitude - target
        while (d > 180) d -= 360
        while (d < -180) d += 360
        return d
    }

    private fun separation(a: Double, b: Double): Double {
        val raw = abs(a - b) % 360.0
        return if (raw > 180) 360 - raw else raw
    }

    /** web's findMajorTransits: each crossing of an exact aspect, found by bisection, kept if within 0.5°. */
    private fun transits(engine: AstronomyEngine, natal: SeasonNatal, start: Date, days: Int): List<Peak> {
        val points = listOf("sun" to natal.sun, "moon" to natal.moon, "asc" to natal.ascendant, "mc" to natal.midheaven)
        val out = mutableListOf<Peak>()
        for (planet in TRANSIT_BODIES) {
            val step = if (planet == Planet.URANUS || planet == Planet.NEPTUNE || planet == Planet.PLUTO) 8 else 2
            for ((key, natalLon) in points) {
                for ((aspect, angle) in ASPECTS) {
                    val targets = if (angle == 0.0 || angle == 180.0) {
                        listOf(norm(natalLon + angle))
                    } else {
                        listOf(norm(natalLon + angle), norm(natalLon - angle))
                    }
                    for (target in targets) {
                        var prevDate = start
                        var prevDiff = signedDiff(longitude(engine, planet, prevDate), target)
                        var d = step
                        while (d <= days) {
                            val date = Date(start.time + d * DAY_MS)
                            val diff = signedDiff(longitude(engine, planet, date), target)
                            if (prevDiff * diff < 0 && abs(prevDiff - diff) < 30) {
                                val exact = bisect(engine, planet, target, prevDate, date)
                                if (abs(separation(longitude(engine, planet, exact), natalLon) - angle) < 0.5) {
                                    out += Peak(planet, key, aspect, exact)
                                }
                            }
                            prevDate = date
                            prevDiff = diff
                            d += step
                        }
                    }
                }
            }
        }
        return out.sortedBy { it.date.time }
    }

    /** web's binarySearchLongitudeTarget, with its fixed low-end sign as written there. */
    private fun bisect(engine: AstronomyEngine, planet: Planet, target: Double, lo: Date, hi: Date): Date {
        var loT = lo.time.toDouble()
        var hiT = hi.time.toDouble()
        val loDiff = signedDiff(longitude(engine, planet, lo), target)
        for (i in 0 until 32) {
            val mid = (loT + hiT) / 2
            val midDiff = signedDiff(longitude(engine, planet, Date(mid.toLong())), target)
            if (loDiff * midDiff <= 0) hiT = mid else loT = mid
            if (hiT - loT < 60_000) break
        }
        return Date(((loT + hiT) / 2).toLong())
    }

    /** web's findEclipses: lunar and global solar eclipses by peak, with the obscuration (0 where none is given). */
    private fun eclipses(start: Date, days: Int): List<Triple<Date, Boolean, Double>> {
        val end = start.time + days * DAY_MS
        val out = mutableListOf<Triple<Date, Boolean, Double>>()
        var lunar = searchLunarEclipse(timeOf(start))
        for (i in 0 until 12) {
            val peak = dateOf(lunar.peak)
            if (peak.time >= end) break
            out += Triple(peak, true, lunar.obscuration.takeUnless { it.isNaN() } ?: 0.0)
            lunar = nextLunarEclipse(lunar.peak)
        }
        var solar = searchGlobalSolarEclipse(timeOf(start))
        for (i in 0 until 12) {
            val peak = dateOf(solar.peak)
            if (peak.time >= end) break
            out += Triple(peak, false, solar.obscuration.takeUnless { it.isNaN() } ?: 0.0)
            solar = nextGlobalSolarEclipse(solar.peak)
        }
        return out.sortedBy { it.first.time }
    }

    /** web's findMoonPhases: each quarter from the library's search, with the Moon's sign then. */
    private fun moonPhases(engine: AstronomyEngine, start: Date, days: Int): List<Triple<Date, Int, ZodiacSign>> {
        val end = start.time + days * DAY_MS
        val out = mutableListOf<Triple<Date, Int, ZodiacSign>>()
        var q = searchMoonQuarter(timeOf(start))
        for (i in 0 until ceil(days / 7.0).toInt() + 4) {
            val date = dateOf(q.time)
            if (date.time >= end) break
            out += Triple(date, q.quarter, sign(longitude(engine, Planet.MOON, date)))
            q = nextMoonQuarter(q)
        }
        return out
    }

    // ---------- the page's prose (seasonContent.ts) ----------

    private val QUIET_SKY_LINE = mapOf(
        AncientCulture.EGYPT to "No beat stands out this month. Ma'at reads the stillness as its own report.",
        AncientCulture.GREECE to "No oracle raises its voice this month. Silence is also counsel.",
        AncientCulture.CANAAN to "No matter comes to the council's floor this month. The tent stands regardless.",
        AncientCulture.CARTHAGE to "No entry posts to the ledger this month. A quiet month still closes clean.",
        AncientCulture.ROME to "No omen stands out this month. The auspices are taken all the same.",
    )

    /** web's composeWhatIsChanging. */
    fun whatIsChanging(culture: AncientCulture, standouts: List<SeasonStandout>): String {
        val primary = standouts.firstOrNull() ?: return QUIET_SKY_LINE.getValue(culture)
        val secondary = standouts.getOrNull(1)
        val behind = if (secondary != null && secondary.title != primary.title) {
            " Behind it: ${secondary.title.replaceFirstChar { it.lowercase() }}"
        } else {
            ""
        }
        return "${primary.title} ${primary.body}$behind"
    }

    private val STATUS_SENTENCE = mapOf(
        "OPENING" to "It has only just begun.",
        "MIDPOINT PASSED" to "Its middle is now, past the crossing point.",
        "CLOSING" to "It closes soon.",
    )

    /** web's companionInSign: the first slow body standing in the season's sign now. */
    fun companion(engine: AstronomyEngine, window: SkyEvents.SeasonWindow, now: Date): Planet? =
        SLOW_BODIES.firstOrNull { sign(longitude(engine, it, now)) == window.sign }

    /** web's composeWhereItBegins. */
    fun whereItBegins(culture: AncientCulture, window: SkyEvents.SeasonWindow, status: String, companion: Planet?): String {
        val signWord = SkySeasonComposer.properCase(SkySeasonComposer.SIGN_PHRASES.getValue(window.sign))
        val day = window.dayOfSeason
        val opened = "It opened when the $signWord received ${deity(culture, Planet.SUN)}, $day day${if (day == 1) "" else "s"} past."
        val with = companion?.let { " ${deity(culture, it)} stands with it this month." } ?: ""
        return "$opened ${STATUS_SENTENCE.getValue(status)}$with"
    }

    /** web's composeWhatItLeavesBehind. */
    fun whatItLeavesBehind(culture: AncientCulture, window: SkyEvents.SeasonWindow): String {
        val out = SkySeasonComposer.properCase(SkySeasonComposer.SIGN_PHRASES.getValue(window.sign))
        val into = SkySeasonComposer.properCase(SkySeasonComposer.SIGN_PHRASES.getValue(ZodiacSign.entries[(window.sign.ordinal + 1) % 12]))
        return when (culture) {
            AncientCulture.EGYPT -> "The scale does not carry $out's excuses into $into."
            AncientCulture.GREECE -> "The oracle does not carry $out's unanswered question into $into."
            AncientCulture.CANAAN -> "What the council did not seal in $out, it does not reopen in $into."
            AncientCulture.CARTHAGE -> "The ledger does not carry $out's promises unwitnessed into $into."
            AncientCulture.ROME -> "The censor does not re-hear what this month already judged."
        }
    }

    /** web's SEASON_VOTIVE, keyed by seasonVotiveTone: the first standout's tone (by date). */
    fun votive(culture: AncientCulture, standouts: List<SeasonStandout>): String {
        val tone = when (standouts.firstOrNull()?.tone) {
            null -> 2
            StandoutTone.TENSION -> 0
            else -> 1
        }
        return VOTIVE.getValue(culture)[tone]
    }

    /** Tension, harmony, quiet. */
    private val VOTIVE: Map<AncientCulture, List<String>> = mapOf(
        AncientCulture.EGYPT to listOf("BRING WHAT IS HEAVY\nTO THE SCALE NOW", "LET THE RIVER CARRY IT;\nDO NOT ROW AGAINST THE MONTH", "THE ORDINARY MONTH\nSTILL FEEDS THE GRANARY"),
        AncientCulture.GREECE to listOf("ASK THE SEASON'S HARD QUESTION\nBEFORE IT ASKS YOU FIRST", "TAKE WHAT THE MONTH\nOFFERS FREELY", "A QUIET MONTH\nIS STILL AN ANSWER"),
        AncientCulture.CANAAN to listOf("BRING THE CONTESTED MATTER\nBEFORE THE COUNCIL NOW", "WORK THE FIELD WHILE\nTHE RAINS STILL FAVOR YOU", "THE TENT STANDS\nTHROUGH ORDINARY MONTHS TOO"),
        AncientCulture.CARTHAGE to listOf("SETTLE THE ACCOUNT\nBEFORE THE MONTH CLOSES IT FOR YOU", "SAIL WHILE THE SEASON\nKEEPS THE LANE OPEN", "A STEADY MONTH IS\nSTILL A PROFITABLE ONE"),
        AncientCulture.ROME to listOf("TAKE THE AUSPICES AGAIN\nBEFORE YOU ACT ON THIS MONTH", "PROCEED; THE MONTH HOLDS\nTHE RIGHT HAND OUT", "AN ORDINARY MONTH\nIS STILL GOVERNED BY LAW"),
    )
}
