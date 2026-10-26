package com.astra.antiqua.domain

import com.astra.antiqua.model.AncientCulture
import com.astra.antiqua.model.DeityRegistry
import com.astra.antiqua.model.Planet
import java.util.Date
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The season's standouts and WHAT IS CHANGING, composed from hand-built
 * events so each rule of web's buildSeasonStandouts is checked on its own.
 * HorizonParityTest checks the whole against web's output.
 */
class SeasonStandoutsTest {
    private val culture = AncientCulture.ROME
    private fun name(planet: Planet) = DeityRegistry.getDeity(culture, planet).name
    private fun day(n: Int) = Date(1_800_000_000_000L + n * 86_400_000L)

    private val none = SeasonEvents(emptyList(), emptyList(), emptyList(), emptyList(), emptyList())

    private fun peak(planet: Planet, aspect: AspectType, natalKey: String, date: Date) =
        TransitPeak(planet, natalKey, 102.4, aspect, date, ZodiacSign.LEO, 12.0)

    private fun fullMoon(date: Date) =
        SkyEvent(SkyEventKind.MOON_QUARTER, date, Planet.MOON, ZodiacSign.TAURUS, quarter = "Full Moon")

    @Test
    fun `a season with nothing dated reads the culture's quiet line`() {
        assertTrue(SeasonStandouts.standouts(culture, none).isEmpty())
        assertEquals(HorizonBanks.quietSkyLine(culture), SeasonStandouts.whatIsChanging(culture, emptyList()))
    }

    @Test
    fun `the strongest two beats are kept and told in date order`() {
        val events = none.copy(
            transits = listOf(peak(Planet.PLUTO, AspectType.SQUARE, "mc", day(9))),
            moonQuarters = listOf(fullMoon(day(3))),
            ingresses = listOf(SkyEvent(SkyEventKind.INGRESS, day(1), Planet.MARS, ZodiacSign.VIRGO, fromSign = ZodiacSign.LEO)),
        )

        val standouts = SeasonStandouts.standouts(culture, events)

        assertEquals(listOf(day(3), day(9)), standouts.map { it.date })
        assertEquals("Full Moon in Taurus.", standouts[0].title)
        assertEquals("${name(Planet.PLUTO)} ${AspectVerbs.of(culture, AspectType.SQUARE)} your Midheaven.", standouts[1].title)
        assertEquals(
            "The demand that what is buried be brought up and counted is contested on this date. " +
                "Decide what gives before the date decides it.",
            standouts[1].body,
        )
    }

    @Test
    fun `a tense pass weighs two and a half times its body, any other twice`() {
        val square = SeasonStandouts.standouts(culture, none.copy(transits = listOf(peak(Planet.JUPITER, AspectType.SQUARE, "sun", day(2)))))
        val trine = SeasonStandouts.standouts(culture, none.copy(transits = listOf(peak(Planet.JUPITER, AspectType.TRINE, "asc", day(2)))))
        val union = SeasonStandouts.standouts(culture, none.copy(transits = listOf(peak(Planet.JUPITER, AspectType.CONJUNCTION, "moon", day(2)))))

        assertEquals(7.5, square.single().significance, 0.0)
        assertEquals(6.0, trine.single().significance, 0.0)
        assertTrue(square.single().title.endsWith("your ${name(Planet.SUN)}."))
        assertTrue(trine.single().title.endsWith("your Ascendant."))
        assertTrue(trine.single().body.endsWith("runs with the current on this date. Nothing is asked in return."))
        assertTrue(union.single().body.endsWith("gathers to one point on this date. Spend it on one thing."))
    }

    @Test
    fun `an eclipse speaks in its beat and outranks a Full Moon`() {
        val events = none.copy(
            eclipses = listOf(Eclipse(day(5), lunar = true, obscuration = 0.4)),
            moonQuarters = listOf(fullMoon(day(5)), SkyEvent(SkyEventKind.MOON_QUARTER, day(12), Planet.MOON, ZodiacSign.SCORPIO, quarter = "First Quarter")),
        )

        val top = SeasonStandouts.standouts(culture, events, count = 1).single()

        assertEquals(HorizonBanks.eclipseBeat(lunar = true).headline, top.title)
        assertEquals(5.8, top.significance, 1e-9)
        // Only the New and Full Moons stand out.
        assertEquals(2, SeasonStandouts.standouts(culture, events, count = 9).size)
    }

    @Test
    fun `a station without a beat prints its degree as web's toFixed does`() {
        val events = none.copy(
            stations = listOf(
                Station(day(4), Planet.MARS, retrograde = false, sign = ZodiacSign.LEO, degree = 12.25),
                Station(day(6), Planet.SATURN, retrograde = true, sign = ZodiacSign.ARIES, degree = 3.0),
            ),
        )

        val (direct, retrograde) = SeasonStandouts.standouts(culture, events)

        assertEquals("${name(Planet.MARS)} turns direct at 12.3° Leo.", direct.title)
        assertEquals("The doubling-back ends and held work starts moving forward again.", direct.body)
        assertEquals(HorizonBanks.retrogradeBeat(Planet.SATURN)!!.headline, retrograde.title)
        // The exact binary value rounds, as JavaScript's does: 1.45 is a hair under.
        assertEquals("1.4", SeasonStandouts.toFixed1(1.45))
        assertEquals("0.1", SeasonStandouts.toFixed1(0.05))
    }

    @Test
    fun `the second beat stands behind the first, its first letter lowered`() {
        val first = SeasonStandout(day(1), "Full Moon in Taurus.", "The month's full light.", 2.4)
        val second = SeasonStandout(day(2), "${name(Planet.MARS)} enters Virgo.", "Body.", 1.0)

        assertEquals(
            "Full Moon in Taurus. The month's full light. Behind it: ${name(Planet.MARS).replaceFirstChar { it.lowercase() }} enters Virgo.",
            SeasonStandouts.whatIsChanging(culture, listOf(first, second)),
        )
        // A second beat with the same title is not repeated.
        assertEquals(
            "Full Moon in Taurus. The month's full light.",
            SeasonStandouts.whatIsChanging(culture, listOf(first, first.copy(date = day(3)))),
        )
    }
}
