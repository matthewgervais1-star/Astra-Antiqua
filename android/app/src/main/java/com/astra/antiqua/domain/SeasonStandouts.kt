package com.astra.antiqua.domain

import com.astra.antiqua.data.AstronomyEngine
import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import io.github.cosinekitty.astronomy.Time
import io.github.cosinekitty.astronomy.nextGlobalSolarEclipse
import io.github.cosinekitty.astronomy.nextLunarEclipse
import io.github.cosinekitty.astronomy.searchGlobalSolarEclipse
import io.github.cosinekitty.astronomy.searchLunarEclipse
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.Date
import kotlin.math.ceil
import kotlin.math.floor

/** An eclipse inside the window: of the Moon or of the Sun, and how much of the disc it covers. */
data class Eclipse(val date: Date, val lunar: Boolean, val obscuration: Double)

/** A body turning retrograde or direct, at the degree it turns on. */
data class Station(
    val date: Date,
    val body: Planet,
    val retrograde: Boolean,
    val sign: ZodiacSign,
    val degree: Double,
)

/**
 * Everything dated inside a season, web's SeasonEvents: the moving sky's
 * passes over the reader's chart (empty without one), the eclipses, the
 * Moon's quarters, the stations and the inner planets' sign changes.
 */
data class SeasonEvents(
    val transits: List<TransitPeak>,
    val eclipses: List<Eclipse>,
    val moonQuarters: List<SkyEvent>,
    val stations: List<Station>,
    val ingresses: List<SkyEvent>,
)

/** One dated beat, scored. Web's SeasonStandout, less the tag no screen prints. */
data class SeasonStandout(
    val date: Date,
    val title: String,
    val body: String,
    val significance: Double,
)

/**
 * The season's standouts and its WHAT IS CHANGING, ported from
 * buildSeasonStandouts and getSeasonEvents in web/src/lib/season.ts and
 * composeWhatIsChanging in web/src/components/horizons/seasonContent.ts.
 *
 * Every beat is scored and the strongest two are told in date order. A pass
 * of a slow body over the reader's chart outweighs almost anything else the
 * sky does in a month, which is how the reader's own transits come to lead
 * the paragraph; only an eclipse competes with them. The lines are web's,
 * generated into HorizonBanks, and HorizonParityTest pins the composition to
 * web's output.
 */
object SeasonStandouts {
    private const val MS_PER_DAY = 86_400_000L

    /** The inner planets whose sign changes over a month are worth naming. */
    private val INGRESS_PLANETS = listOf(Planet.MERCURY, Planet.VENUS, Planet.MARS)

    /** The bodies whose passes over the chart count; the Sun, Moon and Mercury pass too often. */
    private val TRANSIT_PLANETS = listOf(
        Planet.VENUS,
        Planet.MARS,
        Planet.JUPITER,
        Planet.SATURN,
        Planet.URANUS,
        Planet.NEPTUNE,
        Planet.PLUTO,
    )

    /**
     * Every finder walks this many days past the window, as web's do, so its
     * last sample lands beyond the window's end and nothing in the season's
     * tail is missed. The coarsest step is eight days (the outers' passes
     * over the chart); a season never runs past thirty-two days, so six is
     * margin enough. The overshoot is trimmed at the window's end.
     */
    private const val SAMPLING_PAD_DAYS = 6

    /** How many days a finder walks from the window's start: web's windowDays. */
    fun scanDays(window: SkyEvents.SeasonWindow): Int =
        ceil((window.end.time - window.start.time) / MS_PER_DAY.toDouble()).toInt() + SAMPLING_PAD_DAYS

    /** Every dated beat inside [window], read against [natal] when there is a chart. */
    fun events(engine: AstronomyEngine, window: SkyEvents.SeasonWindow, natal: List<NatalPoint>?): SeasonEvents {
        val start = window.start
        val end = window.end.time
        val days = scanDays(window)
        return SeasonEvents(
            transits = natal
                ?.let { TransitSpans.peaks(engine, it, TRANSIT_PLANETS, start, days) }
                .orEmpty()
                .filter { it.date.time <= end },
            eclipses = eclipses(start, days).filter { it.date.time <= end },
            moonQuarters = SkyEvents.moonQuarters(engine, start, days).filter { it.date.time <= end },
            stations = SkyEvents.stations(engine, start, days)
                .filter { it.date.time <= end }
                .map { station ->
                    val longitude = longitudeAt(engine, station.body, station.date)
                    Station(
                        date = station.date,
                        body = station.body,
                        retrograde = station.kind == SkyEventKind.RETROGRADE,
                        sign = station.sign,
                        degree = longitude - floor(longitude / 30.0) * 30.0,
                    )
                },
            ingresses = SkyEvents.ingresses(engine, start, days, INGRESS_PLANETS).filter { it.date.time <= end },
        )
    }

    /**
     * The eclipses of the Moon and of the Sun that peak in the window, web's
     * findEclipses: twelve of each at most, from the library's own search. A
     * partial eclipse of the Sun has no obscuration figure, which web reads
     * as none.
     */
    fun eclipses(start: Date, days: Int): List<Eclipse> {
        val end = start.time + days.toLong() * MS_PER_DAY
        val out = mutableListOf<Eclipse>()

        var lunar = searchLunarEclipse(timeOf(start))
        for (i in 0 until 12) {
            val date = dateOf(lunar.peak)
            if (date.time >= end) break
            out += Eclipse(date, lunar = true, obscuration = lunar.obscuration)
            lunar = nextLunarEclipse(lunar.peak)
        }

        var solar = searchGlobalSolarEclipse(timeOf(start))
        for (i in 0 until 12) {
            val date = dateOf(solar.peak)
            if (date.time >= end) break
            out += Eclipse(date, lunar = false, obscuration = solar.obscuration.takeUnless { it.isNaN() } ?: 0.0)
            solar = nextGlobalSolarEclipse(solar.peak)
        }
        return out.sortedBy { it.date.time }
    }

    /**
     * Score every beat, keep the strongest [count] and tell them in date
     * order. Ties keep the order the beats were gathered in, transits first,
     * as web's stable sort does.
     */
    fun standouts(culture: AncientCulture, events: SeasonEvents, count: Int = 2): List<SeasonStandout> {
        val out = mutableListOf<SeasonStandout>()

        for (t in events.transits) {
            val transit = deity(culture, t.transitPlanet)
            val natal = when (t.natalKey) {
                "asc" -> "your Ascendant"
                "mc" -> "your Midheaven"
                else -> "your ${deity(culture, Planet.valueOf(t.natalKey.uppercase()))}"
            }
            val principle = cap(HorizonBanks.transitPrinciple(t.transitPlanet))
            val tension = t.aspect == AspectType.SQUARE || t.aspect == AspectType.OPPOSITION
            val body = when (t.aspect) {
                AspectType.TRINE, AspectType.SEXTILE ->
                    "$principle runs with the current on this date. Nothing is asked in return."
                AspectType.SQUARE, AspectType.OPPOSITION ->
                    "$principle is contested on this date. Decide what gives before the date decides it."
                AspectType.CONJUNCTION ->
                    "$principle gathers to one point on this date. Spend it on one thing."
            }
            out += SeasonStandout(
                date = t.date,
                title = "$transit ${AspectVerbs.of(culture, t.aspect)} $natal.",
                body = body,
                significance = transitPlanetWeight(t.transitPlanet) * (if (tension) 2.5 else 2.0),
            )
        }

        for (e in events.eclipses) {
            val beat = HorizonBanks.eclipseBeat(e.lunar)
            out += SeasonStandout(e.date, beat.headline, beat.body, 5 + e.obscuration * 2)
        }

        for (q in events.moonQuarters) {
            val isNew = q.quarter == "New Moon"
            if (!isNew && q.quarter != "Full Moon") continue
            out += SeasonStandout(
                date = q.date,
                title = "${q.quarter} in ${q.sign.signName}.",
                body = if (isNew) {
                    "The month's clean page. Start the thing here and it inherits the whole cycle's momentum."
                } else {
                    "The month's full light. What was building since the New Moon shows its results, ready or not."
                },
                significance = if (isNew) 2.2 else 2.4,
            )
        }

        for (s in events.stations) {
            val name = deity(culture, s.body)
            val beat = if (s.retrograde) HorizonBanks.retrogradeBeat(s.body) else null
            val turn = if (s.retrograde) "retrograde" else "direct"
            out += SeasonStandout(
                date = s.date,
                title = beat?.headline ?: "$name turns $turn at ${toFixed1(s.degree)}° ${s.sign.signName}.",
                body = beat?.body ?: if (s.retrograde) {
                    "This planet's work slows and doubles back for a stretch. Review and revise rather than launch."
                } else {
                    "The doubling-back ends and held work starts moving forward again."
                },
                significance = if (s.body == Planet.MERCURY) 2.0 else 1.5,
            )
        }

        for (i in events.ingresses) {
            val name = deity(culture, i.body)
            out += SeasonStandout(
                date = i.date,
                title = "$name enters ${i.sign.signName}.",
                body = "${cap(HorizonBanks.transitPrinciple(i.body))} changes register for the weeks ahead " +
                    "as $name crosses into ${i.sign.signName}.",
                significance = 1.0,
            )
        }

        return out.sortedByDescending { it.significance }.take(count).sortedBy { it.date.time }
    }

    /**
     * The season's first section: the strongest beat, its paragraph, and the
     * second beat introduced as what stands behind it rather than dropped in
     * as a new claim.
     */
    fun whatIsChanging(culture: AncientCulture, standouts: List<SeasonStandout>): String {
        val primary = standouts.firstOrNull() ?: return HorizonBanks.quietSkyLine(culture)
        val secondary = standouts.getOrNull(1)
        // Web lowers the first letter whatever it is, a deity's name included.
        val behind = if (secondary != null && secondary.title != primary.title) {
            " Behind it: ${secondary.title.take(1).lowercase()}${secondary.title.drop(1)}"
        } else {
            ""
        }
        return "${primary.title} ${primary.body}$behind"
    }

    /** How much a moving body's pass matters, slowest heaviest: web's transitPlanetWeight. */
    private fun transitPlanetWeight(planet: Planet): Double = when (planet) {
        Planet.PLUTO -> 5.0
        Planet.URANUS, Planet.NEPTUNE -> 4.5
        Planet.SATURN -> 4.0
        Planet.JUPITER -> 3.0
        Planet.MARS -> 2.0
        Planet.VENUS, Planet.MERCURY -> 1.5
        Planet.SUN, Planet.MOON -> 1.0
    }

    private fun deity(culture: AncientCulture, planet: Planet): String =
        DeityRegistry.getDeity(culture, planet).name

    private fun cap(s: String) = if (s.isEmpty()) s else s.replaceFirstChar { it.uppercase() }

    /**
     * JavaScript's toFixed(1): the exact binary value rounded half up, so a
     * station degree prints as web prints it.
     */
    internal fun toFixed1(value: Double): String =
        BigDecimal(value).setScale(1, RoundingMode.HALF_UP).toPlainString()

    private fun longitudeAt(engine: AstronomyEngine, body: Planet, date: Date): Double =
        engine.getPlanetPosition(date.time / 86_400_000.0 + 2440587.5, TransitSpans.bodyOf(body)).longitude

    private fun timeOf(date: Date): Time = Time(date.time / 86_400_000.0 + 2440587.5 - 2451545.0)

    private fun dateOf(time: Time): Date = Date((((time.ut + 2451545.0) - 2440587.5) * 86_400_000.0).toLong())
}
