import AstraCore
import Foundation
import XCTest

/// Parity with the web surface. goldens.json was produced by running the web
/// pipeline itself (web/scripts/export-goldens.mjs); these tests assert the
/// Swift port reproduces it, as the C# core's GoldenParityTests do. When they
/// pass, "the surfaces agree" is a machine-checked fact.
final class GoldenParityTests: XCTestCase {
    func test_theFixtureHasTheExpectedShape() throws {
        let goldens = try Fixtures.goldens()
        XCTAssertEqual(goldens.tolerance, 0.001)
        XCTAssertEqual(goldens.cases.count, 4)
        for golden in goldens.cases {
            XCTAssertEqual(golden.longitudes.count, 10, golden.name)
        }
    }

    func test_allTenLongitudesMatchWeb() throws {
        let goldens = try Fixtures.goldens()
        for golden in goldens.cases {
            let chart = Ephemeris.computeChart(try Fixtures.instant(golden.utc))
            let expected = try Fixtures.chart(golden.longitudes)
            for planet in Planet.allCases {
                let core = try XCTUnwrap(chart[planet], "\(golden.name): core has no \(planet.id)")
                let web = try XCTUnwrap(expected[planet], "\(golden.name): fixture has no \(planet.id)")
                var diff = abs(core - web)
                if diff > 180 { diff = 360 - diff } // seam-safe comparison
                XCTAssertLessThanOrEqual(
                    diff, goldens.tolerance,
                    "\(golden.name): \(planet.id) differs by \(diff) deg (web \(web), core \(core))")
            }
        }
    }

    func test_angularPointsAndAscendantSignMatchWeb() throws {
        let goldens = try Fixtures.goldens()
        for golden in goldens.cases {
            let utc = try Fixtures.instant(golden.utc)
            let angles = AscendantCalculator.compute(utc, latitude: golden.lat, longitude: golden.lon)
            XCTAssertLessThanOrEqual(
                abs(angles.ascendant - golden.ascendant), goldens.tolerance,
                "\(golden.name): ascendant differs (web \(golden.ascendant), core \(angles.ascendant))")
            XCTAssertLessThanOrEqual(
                abs(angles.midheaven - golden.midheaven), goldens.tolerance,
                "\(golden.name): midheaven differs (web \(golden.midheaven), core \(angles.midheaven))")
            let expectedSign = try ZodiacSign.fromName(golden.ascendantSign)
            XCTAssertEqual(ZodiacMath.longitudeToSign(angles.ascendant).sign, expectedSign, golden.name)
        }
    }

    func test_everyPlanetLandsInTheSameWholeSignHouse() throws {
        let goldens = try Fixtures.goldens()
        for golden in goldens.cases {
            let utc = try Fixtures.instant(golden.utc)
            let chart = Ephemeris.computeChart(utc)
            let angles = AscendantCalculator.compute(utc, latitude: golden.lat, longitude: golden.lon)
            let ascSignIndex = ZodiacMath.longitudeToSign(angles.ascendant).sign.index
            for planet in Planet.allCases {
                let expected = try XCTUnwrap(golden.houses[planet.id], "\(golden.name): fixture has no house for \(planet.id)")
                let longitude = try XCTUnwrap(chart[planet])
                XCTAssertEqual(
                    WholeSignHouses.houseOfLongitude(longitude, ascSignIndex: ascSignIndex), expected,
                    "\(golden.name): \(planet.id)")
            }
        }
    }

    func test_theDetectedAspectSetMatchesWebExactly() throws {
        let rules = try Fixtures.store().aspectRules
        let goldens = try Fixtures.goldens()
        for golden in goldens.cases {
            let chart = Ephemeris.computeChart(try Fixtures.instant(golden.utc))
            let detected = Set(AspectDetector.detect(chart, rules: rules).map { Fixtures.contactKey($0.a, $0.b, $0.kind) })
            let expected = Set(try golden.aspects.map { try Fixtures.contactKey(ids: $0.a, $0.b, $0.kind) })
            XCTAssertEqual(detected, expected, golden.name)
        }
    }
}

/// Parity with web past the bare chart. horizons.json is written by
/// web/scripts/export-goldens.mjs from web's own reading, week, season,
/// transit and synastry functions. Composed text must match web byte for
/// byte; computed instants must land within `instantTolerance`. Port of the
/// C# core's HorizonParityTests.
final class HorizonParityTests: XCTestCase {
    // MARK: Readings

    func test_aNatalReadingComposesExactlyWhatWebComposes() throws {
        let store = try Fixtures.store()
        let readings = try Fixtures.horizons().readings
        XCTAssertFalse(readings.isEmpty)
        for golden in readings {
            let label = "\(golden.chart)/\(golden.culture)"
            let culture = try Culture.fromId(golden.culture)
            let reading = NatalReadingBuilder.build(culture: culture, chart: try Fixtures.chart(golden.longitudes), store: store)

            XCTAssertEqual(reading.placements.count, golden.placements.count, label)
            for (g, p) in zip(golden.placements, reading.placements) {
                let planet = try Planet.fromId(g.planet)
                let sign = try ZodiacSign.fromName(g.sign)
                XCTAssertEqual(p.planet, planet, label)
                XCTAssertEqual(p.sign, sign, "\(label) \(g.planet)")
                XCTAssertLessThan(abs(g.degreeInSign - p.degreeInSign), degreeTolerance, "\(label) \(g.planet)")
                XCTAssertEqual(p.deityName, g.deityName, "\(label) \(g.planet)")
                XCTAssertEqual(p.deityEpithet, g.deityEpithet, "\(label) \(g.planet)")
                XCTAssertEqual(p.domain, g.domain, "\(label) \(g.planet)")
                XCTAssertEqual(p.culturalLine, g.culturalLine, "\(label) \(g.planet)")
                XCTAssertEqual(p.signReading, g.signReading, "\(label) \(g.planet)")
            }

            XCTAssertEqual(reading.aspects.count, golden.aspects.count, label)
            for (g, a) in zip(golden.aspects, reading.aspects) {
                let pair = "\(label) \(g.a)-\(g.b)"
                let planetA = try Planet.fromId(g.a)
                let planetB = try Planet.fromId(g.b)
                let kind = try AspectKind.fromId(g.kind)
                XCTAssertEqual(a.aspect.a, planetA, pair)
                XCTAssertEqual(a.aspect.b, planetB, pair)
                XCTAssertEqual(a.aspect.kind, kind, pair)
                XCTAssertEqual(a.verbLine, g.verbLine, pair)
                XCTAssertEqual(a.pairTheme, g.pairTheme, pair)
                XCTAssertEqual(a.culturalReflection, g.culturalReflection, pair)
            }

            XCTAssertEqual(reading.summary, golden.summary, label)
        }
    }

    func test_theReadingFixturesCoverEverySummaryBranch() throws {
        let banks = try Fixtures.store().banks
        let summaries = try Fixtures.horizons().readings.map(\.summary)
        let tension = banks.summaryTone("tension")
        let harmony = banks.summaryTone("harmony")
        let even = banks.summaryTone("even")
        let fusedOne = banks.summaryFused(1)
        XCTAssertTrue(summaries.contains { $0.contains(tension) }, "no summary reads as tension")
        XCTAssertTrue(summaries.contains { $0.contains(harmony) }, "no summary reads as harmony")
        XCTAssertTrue(summaries.contains { $0.contains(even) }, "no summary reads as even")
        XCTAssertTrue(summaries.contains { $0.hasSuffix(fusedOne) }, "no summary ends on one fused pair")
        XCTAssertTrue(summaries.contains { $0.contains("pairs of powers sit fused") }, "no summary has several fused pairs")
    }

    // MARK: The week

    func test_theWeekReadsDayForDayAsWebReadsIt() throws {
        let store = try Fixtures.store()
        let utc = Fixtures.utc
        let weeks = try Fixtures.horizons().weeks
        XCTAssertFalse(weeks.isEmpty)
        for golden in weeks {
            let culture = try Culture.fromId(golden.culture)
            let start = try Fixtures.instant(golden.weekStart)
            let days = WeekReading.build(
                culture: culture, weekStart: Instant.startOfLocalDay(start, utc), zone: utc, now: start, store: store)

            XCTAssertEqual(days.count, 7, golden.culture)
            XCTAssertEqual(golden.days.count, 7, golden.culture)
            for (g, d) in zip(golden.days, days) {
                let label = "\(golden.culture) \(g.label)"
                assertSameInstant(try Fixtures.instant(g.date), d.date, label)
                XCTAssertEqual(d.label, g.label, label)
                XCTAssertEqual(d.line, g.line, label)
                XCTAssertEqual(d.tone.rawValue, g.tone, label)
                XCTAssertEqual(d.flag?.rawValue, g.flag, label)

                let sh = g.shorthand
                XCTAssertEqual(d.shorthand.kind.rawValue, sh.kind, label)
                switch d.shorthand.kind {
                case .aspect:
                    let a = try Planet.fromId(try XCTUnwrap(sh.a, label))
                    let b = try Planet.fromId(try XCTUnwrap(sh.b, label))
                    let aspect = try AspectKind.fromId(try XCTUnwrap(sh.aspect, label))
                    let exact = try XCTUnwrap(sh.exact, label)
                    XCTAssertEqual(d.shorthand.a, a, label)
                    XCTAssertEqual(d.shorthand.b, b, label)
                    XCTAssertEqual(d.shorthand.aspect, aspect, label)
                    XCTAssertEqual(d.shorthand.exact, exact, label)
                case .ingress:
                    let planet = try Planet.fromId(try XCTUnwrap(sh.planet, label))
                    let sign = try ZodiacSign.fromName(try XCTUnwrap(sh.sign, label))
                    XCTAssertEqual(d.shorthand.planet, planet, label)
                    XCTAssertEqual(d.shorthand.sign, sign, label)
                case .quiet:
                    break
                }
            }
        }
    }

    func test_theWeekFixturesIncludeAnExactDayAndAnIngressDay() throws {
        let days = try Fixtures.horizons().weeks.flatMap { $0.days }
        XCTAssertTrue(days.contains { $0.shorthand.exact == true }, "no week day is exact")
        XCTAssertTrue(days.contains { $0.shorthand.kind == "ingress" }, "no week day is an ingress")
    }

    // MARK: The sky's own events

    func test_ingressesLandWhereWebFindsThem() throws {
        let g = try Fixtures.horizons().ingresses
        let found = SkyEvents.ingresses(try Fixtures.instant(g.start), days: g.days)
        XCTAssertEqual(found.count, g.events.count)
        for (i, (e, f)) in zip(g.events, found).enumerated() {
            let what = "ingress \(i) \(f.planet.id)"
            let planet = try Planet.fromId(e.planet)
            let fromSign = try ZodiacSign.fromName(e.fromSign)
            let toSign = try ZodiacSign.fromName(e.toSign)
            XCTAssertEqual(f.planet, planet, what)
            XCTAssertEqual(f.fromSign, fromSign, what)
            XCTAssertEqual(f.toSign, toSign, what)
            assertNear(try Fixtures.instant(e.date), f.date, what)
        }
    }

    func test_stationsLandWhereWebFindsThem() throws {
        let g = try Fixtures.horizons().stations
        let found = SkyEvents.stations(try Fixtures.instant(g.start), days: g.days)
        XCTAssertEqual(found.count, g.events.count)
        for (i, (e, f)) in zip(g.events, found).enumerated() {
            let what = "station \(i) \(f.planet.id)"
            let planet = try Planet.fromId(e.planet)
            let sign = try ZodiacSign.fromName(e.sign)
            XCTAssertEqual(f.planet, planet, what)
            XCTAssertEqual(f.kind.rawValue, e.kind, what)
            XCTAssertEqual(f.sign, sign, what)
            assertNear(try Fixtures.instant(e.date), f.date, what)
        }
    }

    func test_moonQuartersLandWhereWebFindsThem() throws {
        let g = try Fixtures.horizons().moonQuarters
        let found = SkyEvents.moonQuarters(try Fixtures.instant(g.start), days: g.days)
        XCTAssertEqual(found.count, g.events.count)
        for (i, (e, f)) in zip(g.events, found).enumerated() {
            let what = "quarter \(i)"
            let sign = try ZodiacSign.fromName(e.sign)
            XCTAssertEqual(f.name, e.name, what)
            XCTAssertEqual(f.sign, sign, what)
            assertNear(try Fixtures.instant(e.date), f.date, what)
        }
    }

    func test_eclipsesLandWhereWebFindsThem() throws {
        let g = try Fixtures.horizons().eclipses
        let found = SkyEvents.eclipses(try Fixtures.instant(g.start), days: g.days)
        XCTAssertEqual(found.count, g.events.count)
        for (i, (e, f)) in zip(g.events, found).enumerated() {
            let what = "eclipse \(i)"
            let sign = try ZodiacSign.fromName(e.sign)
            XCTAssertEqual(f.scope.rawValue, e.scope, what)
            XCTAssertEqual(f.kind, e.kind, what)
            XCTAssertEqual(f.sign, sign, what)
            XCTAssertLessThan(abs(e.obscuration - f.obscuration), 1e-6, "\(what): web \(e.obscuration), core \(f.obscuration)")
            assertNear(try Fixtures.instant(e.date), f.date, what)
        }
    }

    func test_theSeasonWindowMatchesWeb() throws {
        let seasons = try Fixtures.horizons().seasons
        XCTAssertFalse(seasons.isEmpty)
        for g in seasons {
            let w = Season.current(try Fixtures.instant(g.at), zone: Fixtures.utc)
            let sign = try ZodiacSign.fromName(g.sign)
            XCTAssertEqual(w.sign, sign, g.at)
            assertNear(try Fixtures.instant(g.start), w.start, "season start at \(g.at)")
            assertNear(try Fixtures.instant(g.end), w.end, "season end at \(g.at)")
            XCTAssertEqual(w.dayOfSeason, g.dayOfSeason, g.at)
            XCTAssertEqual(w.totalDays, g.totalDays, g.at)
            XCTAssertEqual(w.daysRemaining, g.daysRemaining, g.at)
        }
    }

    func test_theSeasonListsTheEventsWebLists() throws {
        let g = try Fixtures.horizons().seasonEvents
        let sky = Season.skyEventsIn(Season.current(try Fixtures.instant(g.at), zone: Fixtures.utc))
        XCTAssertEqual(sky.moonQuarters.map(\.name), g.moonPhases.map(\.name))
        XCTAssertEqual(sky.stations.map(\.planet.id), g.retrogrades.map(\.planet))
        XCTAssertEqual(sky.ingresses.map(\.planet.id), g.ingresses.map(\.planet))
        XCTAssertEqual(sky.eclipses.count, g.eclipses.count)
    }

    func test_theMoonPhaseMatchesWeb() throws {
        let phases = try Fixtures.horizons().moonPhases
        XCTAssertFalse(phases.isEmpty)
        for g in phases {
            let m = MoonPhaseCalculator.compute(try Fixtures.instant(g.at))
            XCTAssertLessThan(abs(g.angle - m.angle), degreeTolerance, "\(g.at): web \(g.angle), core \(m.angle)")
            XCTAssertLessThan(
                abs(g.illuminationFraction - m.illuminationFraction), 1e-9,
                "\(g.at): web \(g.illuminationFraction), core \(m.illuminationFraction)")
            XCTAssertEqual(m.name, g.name, g.at)
            XCTAssertEqual(m.isWaxing, g.isWaxing, g.at)
            XCTAssertEqual(m.nextQuarterName, g.nextQuarterName, g.at)
            assertNear(try Fixtures.instant(g.nextQuarterDate), m.nextQuarterDate, "next quarter after \(g.at)")
        }
    }

    func test_theSolarReturnMatchesWeb() throws {
        let returns = try Fixtures.horizons().solarReturns
        XCTAssertFalse(returns.isEmpty)
        for g in returns {
            let what = "solar return \(g.natal)"
            let found = SkyEvents.solarReturn(g.natalSunLongitude, from: try Fixtures.instant(g.from))
            let r = try XCTUnwrap(found, what)
            let sign = try ZodiacSign.fromName(g.sign)
            XCTAssertEqual(r.sign, sign, what)
            XCTAssertLessThan(abs(g.degree - r.degree), degreeTolerance, what)
            assertNear(try Fixtures.instant(g.date), r.date, what)
        }
    }

    // MARK: Charts against charts

    func test_longTransitSpansMatchWeb() throws {
        let g = try Fixtures.horizons().spans
        let points = g.natalPoints.map { NatalPoint(key: $0.key, longitude: $0.longitude) }
        let spans = TransitSpans.compute(
            natalPoints: points, transitPlanets: SkyEvents.slowBodies,
            start: try Fixtures.instant(g.start), days: g.days)

        XCTAssertEqual(spans.map(\.id), g.spans.map(\.id))
        for (e, s) in zip(g.spans, spans) {
            assertNear(try Fixtures.instant(e.start), s.start, "\(s.id) start")
            assertNear(try Fixtures.instant(e.end), s.end, "\(s.id) end")
            let passes = try e.passes.map { try Fixtures.instant($0) }
            XCTAssertEqual(s.passes.count, passes.count, s.id)
            for (p, (expected, actual)) in zip(passes, s.passes).enumerated() {
                assertNear(expected, actual, "\(s.id) pass \(p)")
            }
            let sign = try ZodiacSign.fromName(e.transitSign)
            XCTAssertEqual(s.transitSign, sign, s.id)
            XCTAssertLessThan(
                abs(e.transitDegree - s.transitDegree), 1e-4,
                "\(s.id): web \(e.transitDegree), core \(s.transitDegree)")
        }
    }

    func test_synastryFindsTheContactsWebFindsInTheSameOrder() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.horizons().synastry
        let aspects = CrossAspects.compute(
            try Fixtures.goldenChart(g.chartA), try Fixtures.goldenChart(g.chartB), rules: store.aspectRules)

        let expected = try g.aspects.map { try Fixtures.contactKey(ids: $0.a, $0.b, $0.kind) }
        XCTAssertEqual(aspects.map { Fixtures.contactKey($0.from, $0.to, $0.kind) }, expected)
        for (e, a) in zip(g.aspects, aspects) {
            let orb = try XCTUnwrap(e.orb, "synastry \(e.a)-\(e.b) has no orb")
            XCTAssertLessThan(abs(orb - a.orb), 1e-9, "synastry \(e.a)-\(e.b): web \(orb), core \(a.orb)")
        }

        let expectedTop = try g.top5.map { try Fixtures.contactKey(ids: $0.a, $0.b, $0.kind) }
        XCTAssertEqual(
            CrossAspects.tightest(aspects, count: 5).map { Fixtures.contactKey($0.from, $0.to, $0.kind) },
            expectedTop)
    }

    func test_transitsToANatalChartMatchWeb() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.horizons().transits
        let hits = CrossAspects.compute(
            try Fixtures.goldenChart(g.transitChart), try Fixtures.goldenChart(g.natalChart), rules: store.aspectRules)

        let expected = try g.hits.map { try Fixtures.contactKey(ids: $0.transit, $0.natal, $0.kind) }
        XCTAssertEqual(hits.map { Fixtures.contactKey($0.from, $0.to, $0.kind) }, expected)

        let expectedTop = try g.top5.map { try Fixtures.contactKey(ids: $0.transit, $0.natal, $0.kind) }
        XCTAssertEqual(
            CrossAspects.topTransits(hits).map { Fixtures.contactKey($0.from, $0.to, $0.kind) },
            expectedTop)
    }

    // MARK: Births

    /// iOS and Linux read the IANA zone history, as web does, but a runtime's
    /// copy of it can lag or trim history (Windows has no daylight saving for
    /// Tunis in any year, where IANA has it in 1978 and 2006 to 2008). A case
    /// whose zone data disagrees with web's offset at web's own instant is
    /// therefore not a test of this code, and is left out; at least three
    /// cases must still run.
    func test_aBirthResolvesToTheInstantWebResolvesItTo() throws {
        var checkedCases = 0
        var skipped: [String] = []
        for g in try Fixtures.horizons().births {
            let i = g.input
            let input = BirthInput(
                year: i.year, month: i.month, day: i.day, hour: i.hour, minute: i.minute,
                latitude: i.latitude, longitude: i.longitude)
            guard let zone = BirthResolver.findZone(g.timezone) else {
                XCTFail("this runtime cannot load the zone \(g.timezone)")
                continue
            }
            let expectedUtc = try Fixtures.instant(g.utc)

            if zone.secondsFromGMT(for: expectedUtc) / 60 != g.offsetMinutes {
                skipped.append("\(g.timezone) at \(g.utc)")
                continue
            }

            let resolved = BirthResolver.resolve(input, zone: zone)
            assertSameInstant(expectedUtc, resolved.utc, g.timezone)
            XCTAssertEqual(resolved.offsetMinutes, g.offsetMinutes, g.timezone)
            checkedCases += 1
        }
        if !skipped.isEmpty {
            print("Birth cases left out because this runtime's zone data disagrees with web's: \(skipped)")
        }
        XCTAssertGreaterThanOrEqual(checkedCases, 3, "only \(checkedCases) birth cases ran; left out: \(skipped)")
    }

    func test_aWallClockHourThatNeverHappenedMovesForwardAsWebMovesIt() throws {
        // 02:30 on 2021-03-28 does not exist in London: the clocks jumped from
        // 01:00 to 02:00 UTC. Web reads it at the new offset, 01:30 UTC.
        let zone = try XCTUnwrap(BirthResolver.findZone("Europe/London"))
        let resolved = BirthResolver.resolve(
            BirthInput(year: 2021, month: 3, day: 28, hour: 2, minute: 30, latitude: 51.5074, longitude: -0.1278),
            zone: zone)
        assertSameInstant(try Fixtures.instant("2021-03-28T01:30:00Z"), resolved.utc, "London spring-forward")
        XCTAssertEqual(resolved.offsetMinutes, 60)
    }

    func test_aSavedBirthRoundTripsAndCastsTheChartItDescribes() throws {
        let store = try Fixtures.store()
        let saved = SavedBirth(
            name: "Test", culture: .rome, year: 1990, month: 1, day: 15, hour: 5, minute: 30,
            latitude: 41.9028, longitude: 12.4964, placeName: "Rome, Italy",
            timeZone: "Europe/Rome", zoneEstimated: false)
        let back = SavedBirth.fromJSON(saved.toJSON())
        XCTAssertEqual(back, saved)

        // 05:30 in Rome in January is 04:30 UTC: the rome-1990 golden.
        let chart = try XCTUnwrap(back).cast(rules: store.aspectRules)
        assertSameInstant(try Fixtures.instant("1990-01-15T04:30:00Z"), chart.utc, "rome-1990")
        let golden = try Fixtures.goldenChart("rome-1990")
        for planet in Planet.allCases {
            let web = try XCTUnwrap(golden[planet], planet.id)
            let core = try XCTUnwrap(chart.longitudes[planet], planet.id)
            XCTAssertLessThan(abs(web - core), 0.001, "\(planet.id): web \(web), core \(core)")
        }
        XCTAssertNil(SavedBirth.fromJSON("{not json"))
        XCTAssertNil(SavedBirth.fromJSON(nil))
    }

    /// The CI smoke run seeds this file into the iOS simulator's app
    /// container, so its format is pinned here: if SavedBirth's JSON shape
    /// changes, this fails before the simulator run silently shows onboarding.
    func test_theSmokeRunsSeedRecordReadsAsTheRome1990Birth() throws {
        let json = try Fixtures.text("smoke-birth.v1.json")
        let birth = try XCTUnwrap(SavedBirth.fromJSON(json))
        XCTAssertEqual(birth.culture, .egypt)
        assertSameInstant(try Fixtures.instant("1990-01-15T04:30:00Z"), birth.resolve().utc, "smoke seed")
        XCTAssertEqual(birth.toJSON(), json.trimmingCharacters(in: .whitespacesAndNewlines))
    }

    func test_aZoneEstimatedFromLongitudeIsAWholeHourBand() {
        XCTAssertEqual(BirthResolver.estimateZoneForLongitude(72.88).secondsFromGMT(), 5 * 3_600)
        XCTAssertEqual(BirthResolver.estimateZoneForLongitude(-74.0).secondsFromGMT(), -5 * 3_600)
        XCTAssertEqual(BirthResolver.estimateZoneForLongitude(-0.13).secondsFromGMT(), 0)
        // The C# core names the same bands with POSIX-signed Etc ids.
        XCTAssertEqual(BirthResolver.estimatedZoneId(forLongitude: 72.88), "Etc/GMT-5")
        XCTAssertEqual(BirthResolver.estimatedZoneId(forLongitude: -74.0), "Etc/GMT+5")
        XCTAssertEqual(BirthResolver.estimatedZoneId(forLongitude: -0.13), "Etc/GMT")
        XCTAssertEqual(BirthResolver.formatOffset(330), "UTC+05:30")
        XCTAssertEqual(BirthResolver.formatOffset(-240), "UTC-04:00")
    }

    func test_everyOfflineCityCarriesAZoneThisRuntimeCanLoad() throws {
        let cities = try Fixtures.store().cities
        XCTAssertFalse(cities.isEmpty)
        for city in cities {
            XCTAssertNotNil(BirthResolver.findZone(city.timeZone), "\(city.name), \(city.country): \(city.timeZone)")
        }
    }
}
