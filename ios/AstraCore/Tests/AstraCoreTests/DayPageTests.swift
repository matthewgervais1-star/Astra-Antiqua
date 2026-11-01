import AstraCore
import Foundation
import XCTest

/// Sky Day's words against web's: day.json holds what web's composeDayPage,
/// dayPressure and the home bundle's long transit print for the smoke birth
/// (TestData/smoke-birth.v1.json) at 2026-10-21 06:00 UTC, in all five
/// cultures. The strings must match byte for byte; the orbs to a thousandth
/// of a degree, the tolerance the chart goldens hold the ephemeris to.
final class DayPageTests: XCTestCase {
    private let orbTolerance = 0.001

    private func smokeChart(_ store: ContentStore) throws -> NatalChart {
        let birth = try XCTUnwrap(SavedBirth.fromJSON(try Fixtures.text("smoke-birth.v1.json")))
        return birth.cast(rules: store.aspectRules)
    }

    func test_theSmokeBirthCastsTheChartWebCasts() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.day()
        let chart = try smokeChart(store)
        let golden = try Fixtures.chart(g.natal.longitudes)
        for planet in Planet.allCases {
            let web = try XCTUnwrap(golden[planet], planet.id)
            XCTAssertLessThan(abs(web - chart.longitudes[planet]!), 0.001, planet.id)
        }
        XCTAssertLessThan(abs(g.natal.ascendant - chart.ascendant), 0.001, "ascendant")
        XCTAssertLessThan(abs(g.natal.midheaven - chart.midheaven), 0.001, "midheaven")
    }

    func test_theDecreeComposesWhatWebComposes() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.day()
        let at = try Fixtures.instant(g.at)
        XCTAssertEqual(DayDecreeComposer.utcDayNumber(at), g.utcDay)
        XCTAssertEqual(g.cultures.count, 5)
        for c in g.cultures {
            let culture = try Culture.fromId(c.culture)
            let page = DayDecreeComposer.composeDayPage(culture, date: at, store: store)
            XCTAssertEqual(store.day.institution(culture), c.institution, c.culture)
            XCTAssertEqual(page.headline, c.headline, c.culture)
            XCTAssertEqual(page.evidence, c.evidence, c.culture)
            XCTAssertEqual(page.sentences, c.sentences, c.culture)
            XCTAssertEqual(page.paragraph, c.paragraph, c.culture)
            XCTAssertEqual(page.tone.rawValue, c.tone, c.culture)
            XCTAssertEqual(page.figures.count, c.figures.count, c.culture)
            for (f, e) in zip(page.figures, c.figures) {
                XCTAssertEqual(Fixtures.contactKey(f.a, f.b, f.kind), try Fixtures.contactKey(ids: e.a, e.b, e.kind), c.culture)
                XCTAssertLessThan(abs(f.orb - e.orb), orbTolerance, "\(c.culture) \(e.a)-\(e.b)")
            }
        }
    }

    func test_whereTheDayFallsReadsTheContactsWebReads() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.day()
        let at = try Fixtures.instant(g.at)
        let natal = try smokeChart(store)
        let today = Ephemeris.computeChart(DayDecreeComposer.utcDayStart(at))
        for c in g.cultures {
            let culture = try Culture.fromId(c.culture)
            let groups = DayPressure.compute(
                natal: natal.longitudes, ascendant: natal.ascendant, today: today, culture: culture, store: store)
            XCTAssertEqual(groups.count, 4, c.culture)
            XCTAssertEqual(c.pressure.count, 4, c.culture)
            for (i, (group, e)) in zip(groups, c.pressure).enumerated() {
                let label = "\(c.culture) group \(i)"
                XCTAssertEqual(group.name, e.name, label)
                XCTAssertEqual(group.sub, e.sub, label)
                XCTAssertEqual(group.level.rawValue, e.level, label)
                XCTAssertEqual(group.level.label, e.levelLabel, label)
                XCTAssertEqual(group.sentence, e.sentence, label)
                XCTAssertEqual(group.maxOrb, e.maxOrb, label)
                if let lead = e.lead {
                    let mine = try XCTUnwrap(group.lead, label)
                    XCTAssertEqual(mine.transit.id, lead.transit, label)
                    XCTAssertEqual(mine.natal.id, lead.natal, label)
                    XCTAssertEqual(mine.kind.id, lead.kind, label)
                    XCTAssertLessThan(abs(mine.orb - lead.orb), orbTolerance, label)
                    XCTAssertLessThan(abs(try XCTUnwrap(group.orb, label) - lead.orb), orbTolerance, label)
                } else {
                    XCTAssertNil(group.lead, label)
                    XCTAssertNil(group.orb, label)
                }
            }
        }
    }

    func test_theLongTransitIsTheSpanWebPicks() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.day()
        let at = try Fixtures.instant(g.at)
        let natal = try smokeChart(store)
        let today = Ephemeris.computeChart(DayDecreeComposer.utcDayStart(at))
        let spans = LongTransitPick.spans(
            natal: natal.longitudes, ascendant: natal.ascendant, midheaven: natal.midheaven, now: at)
        for c in g.cultures {
            let culture = try Culture.fromId(c.culture)
            let e = c.longTransit
            let pick = LongTransitPick.pick(spans: spans, now: at, today: today, culture: culture, store: store)
            guard e.status == "active" || e.status == "upcoming" else {
                XCTAssertNil(pick, c.culture)
                continue
            }
            let lt = try XCTUnwrap(pick, c.culture)
            XCTAssertEqual(lt.active, e.status == "active", c.culture)
            XCTAssertEqual(lt.span.id, e.id, c.culture)
            XCTAssertEqual(lt.title1, e.title1, c.culture)
            XCTAssertEqual(lt.title2, e.title2, c.culture)
            XCTAssertEqual(lt.rangeLabel, e.rangeLabel, c.culture)
            XCTAssertLessThan(abs(lt.progressPct - (e.progressPct ?? -1)), 0.01, c.culture)
            assertNear(try Fixtures.instant(try XCTUnwrap(e.start)), lt.span.start, "\(c.culture) start")
            assertNear(try Fixtures.instant(try XCTUnwrap(e.end)), lt.span.end, "\(c.culture) end")
            XCTAssertEqual(lt.span.passes.count, e.passes.count, c.culture)
            for (expected, actual) in zip(e.passes, lt.span.passes) {
                assertNear(try Fixtures.instant(expected), actual, "\(c.culture) pass")
            }
        }
    }

    func test_orbsPrintAsWebPrintsThem() {
        XCTAssertEqual(DayDecreeComposer.formatOrb(0.4218831632206559), "0°25′")
        XCTAssertEqual(DayDecreeComposer.formatOrb(1.9999), "2°00′")
        XCTAssertEqual(DayDecreeComposer.orbMeasure(0.01), "EXACT")
        XCTAssertEqual(DayDecreeComposer.variant(-1), 2)
    }

    /// Sky Day's page for the sample state in Egypt: the board's forms
    /// (kicker date, the Moon and season lines, the chart rows' data lines,
    /// the long transit's meta and footer) filled from the web's numbers.
    func test_skyDayPrintsTheBoardsFormsWithTheWebsNumbers() throws {
        let store = try Fixtures.store()
        let g = try Fixtures.day()
        let at = try Fixtures.instant(g.at)
        let natal = try smokeChart(store)
        let spans = LongTransitPick.spans(
            natal: natal.longitudes, ascendant: natal.ascendant, midheaven: natal.midheaven, now: at)
        let page = SkyDayBuilder.build(
            culture: .egypt, now: at, zone: Fixtures.utc, natal: natal, spans: spans, store: store)
        let egypt = try XCTUnwrap(g.cultures.first { $0.culture == "egypt" })
        XCTAssertEqual(page.kicker, "WED 21 OCT 2026 · THE HALL OF MA’AT")
        XCTAssertEqual(page.heroPlanet, .venus)
        XCTAssertEqual(page.headline, egypt.headline)
        XCTAssertEqual(page.evidence, egypt.evidence)
        XCTAssertEqual(page.paragraph, egypt.paragraph)
        XCTAssertEqual(page.moon, "WAXING GIBBOUS · 74% LIT")
        XCTAssertEqual(page.nextQuarterName, "FULL MOON")
        XCTAssertEqual(page.nextQuarterDate, "26 OCT 2026")
        XCTAssertEqual(page.season, "SUN IN LIBRA · DAY 29 OF 31")
        XCTAssertEqual([page.seasonStart, page.seasonToGo, page.seasonEnd], ["23 SEP", "2 TO GO", "23 OCT"])
        let rows = try XCTUnwrap(page.chartRows)
        XCTAssertEqual(rows.map(\.sentence), egypt.pressure.map(\.sentence))
        XCTAssertEqual(rows[1].data, "VENUS △ NATAL JUPITER · 0.8° FROM EXACT · ")
        XCTAssertEqual(rows[1].tone, "EASE")
        let card = try XCTUnwrap(page.longTransit)
        XCTAssertEqual(card.meta, "OPEN NOW · OCT 2026 → JUN 2027")
        XCTAssertEqual(card.title1, "AMUN IN THE LION")
        XCTAssertEqual(card.title2, "ROWS IN TIME WITH YOUR NATAL ASCENDANT")
        XCTAssertEqual(card.footer, "3 EXACT · 2 AHEAD · EASE")
        for row in rows { print("SKYDAY row:", row.sentence, "|", row.data ?? "", row.tone ?? "") }
    }
    /// Web's day model prints one chart row per house group, a group nothing
    /// touches included: its "Nothing exact touches your ..." sentence with an
    /// empty data line (web/src/lib/screens/day.ts). The screen goldens hold no
    /// such day yet, so this test finds a birth with a group no natal body
    /// stands in, a group that is empty on every day, and checks its row.
    func test_aGroupNothingTouchesStillPrintsItsRow() throws {
        let store = try Fixtures.store()
        let now = try Fixtures.instant("2026-10-21T06:00:00.000Z")
        let today = Ephemeris.computeChart(DayDecreeComposer.utcDayStart(now))
        var found: (NatalChart, [PressureGroup])?
        search: for day in 1...28 {
            for hour in stride(from: 0, to: 24, by: 2) {
                let birth = SavedBirth(
                    name: "Quiet group", culture: .egypt, year: 1990, month: 1, day: day, hour: hour, minute: 0,
                    latitude: 41.9028, longitude: 12.4964, placeName: "Rome, Italy",
                    timeZone: "Europe/Rome", zoneEstimated: false)
                let chart = birth.cast(rules: store.aspectRules)
                let groups = DayPressure.compute(
                    natal: chart.longitudes, ascendant: chart.ascendant, today: today, culture: .egypt, store: store)
                if groups.contains(where: { $0.lead == nil }) {
                    found = (chart, groups)
                    break search
                }
            }
        }
        let (chart, groups) = try XCTUnwrap(found, "no birth in the search has a group nothing touches")
        let page = SkyDayBuilder.build(
            culture: .egypt, now: now, zone: TimeZone(identifier: "Europe/Rome")!, natal: chart, spans: nil, store: store)
        let rows = try XCTUnwrap(page.chartRows, "the chart section is gone")
        XCTAssertEqual(rows.count, groups.count)
        XCTAssertEqual(rows.map(\.sentence), groups.map(\.sentence))
        for (row, group) in zip(rows, groups) where group.lead == nil {
            XCTAssertTrue(row.sentence.hasPrefix("Nothing exact touches your "), row.sentence)
            XCTAssertNil(row.planet)
            XCTAssertNil(row.data)
            XCTAssertNil(row.tone)
            XCTAssertFalse(row.tension)
            XCTAssertEqual(row.dataLine ?? "", "")
        }
    }
}
