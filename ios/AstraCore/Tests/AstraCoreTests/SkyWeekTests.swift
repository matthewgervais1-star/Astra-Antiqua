import AstraCore
import Foundation
import XCTest

/// Sky Week's words: the rows' lines are the web's week (horizons.json, key
/// `weeks`), and the board's forms built from them are pinned here for the
/// sample state Sky Day uses, Egypt at 2026-10-21 06:00 UTC, read in UTC.
final class SkyWeekTests: XCTestCase {
    private func samplePage() throws -> SkyWeekPage {
        let store = try Fixtures.store()
        return SkyWeekBuilder.build(
            culture: .egypt, now: try Fixtures.instant("2026-10-21T06:00:00.000Z"), zone: Fixtures.utc, store: store)
    }

    func test_theSampleWeekPrintsTheWebsHeadAndTheBoardsCount() throws {
        let page = try samplePage()
        XCTAssertEqual(page.kicker, "THE HALL OF MA’AT · THE WEEK")
        XCTAssertEqual(page.headline, "SEVEN DAYS WEIGHED")
        XCTAssertEqual(page.count, "SEVEN DAYS · SEVEN WEIGHED")
    }

    func test_theSampleWeekRowsCarryTheWebsLinesInTheBoardsForms() throws {
        let page = try samplePage()
        let golden = try XCTUnwrap(try Fixtures.horizons().weeks.first {
            $0.culture == "egypt" && $0.weekStart == "2026-10-19T00:00:00.000Z"
        })
        XCTAssertEqual(page.rows.count, 7)
        XCTAssertEqual(page.rows.map(\.line), golden.days.map(\.line))
        XCTAssertEqual(page.rows.map { "\($0.weekday) \($0.dayNumber)" }, golden.days.map(\.label))
        XCTAssertEqual(page.rows.map(\.shorthand), [
            "♀ □ ♇ · TENSION",
            "♀ □ ♇ · TIGHT · TENSION",
            "♀ □ ♇ · TIGHT · TENSION",
            "☽ □ ♅ · TENSION",
            "☉ → SCO",
            "☽ ☌ ♆ · TIGHT · ARIES · EASE",
            "☽ △ ♂ · EASE",
        ])
        XCTAssertEqual(page.rows.map(\.tension), [true, true, true, true, false, false, false])
        XCTAssertEqual(page.rows.map(\.isToday), [false, false, true, false, false, false, false])
    }

    func test_theMoonBandReadsTheMoonSkyDayReads() throws {
        let page = try samplePage()
        XCTAssertEqual(page.moonLines, ["MOON", "WAXING GIBBOUS", "74% LIT", "FULL MOON", "26 OCT 2026"])
        XCTAssertTrue(page.moonWaxing)
        XCTAssertEqual(page.moonLit, 0.74, accuracy: 0.005)
    }

    func test_aLateSundayInLosAngelesReadsTheLocalWeek() throws {
        let store = try Fixtures.store()
        let zone = try XCTUnwrap(TimeZone(identifier: "America/Los_Angeles"))
        // Sunday 25 Oct 2026, 23:00 PDT: already Monday 26 in UTC.
        let page = SkyWeekBuilder.build(
            culture: .egypt, now: try Fixtures.instant("2026-10-26T06:00:00.000Z"), zone: zone, store: store)
        XCTAssertEqual(page.rows.map { "\($0.weekday) \($0.dayNumber)" },
                       ["MON 19", "TUE 20", "WED 21", "THU 22", "FRI 23", "SAT 24", "SUN 25"])
        XCTAssertEqual(page.rows.map(\.isToday), [false, false, false, false, false, false, true])
        XCTAssertEqual(page.rows.firstIndex { $0.isToday }, 6)
    }

    func test_anEarlyMondayInAucklandReadsTheLocalWeek() throws {
        let store = try Fixtures.store()
        let zone = try XCTUnwrap(TimeZone(identifier: "Pacific/Auckland"))
        // Monday 26 Oct 2026, 01:00 NZDT: still Sunday 25 in UTC.
        let page = SkyWeekBuilder.build(
            culture: .egypt, now: try Fixtures.instant("2026-10-25T12:00:00.000Z"), zone: zone, store: store)
        XCTAssertEqual(page.rows.map { "\($0.weekday) \($0.dayNumber)" },
                       ["MON 26", "TUE 27", "WED 28", "THU 29", "FRI 30", "SAT 31", "SUN 1"])
        XCTAssertEqual(page.rows.map(\.isToday), [true, false, false, false, false, false, false])
        XCTAssertEqual(page.rows.firstIndex { $0.isToday }, 0)
    }

    func test_aWaningMoonIsReadAsWaning() throws {
        let store = try Fixtures.store()
        // Ten days after the full Moon of 26 Oct 2026.
        let page = SkyWeekBuilder.build(
            culture: .egypt, now: try Fixtures.instant("2026-11-05T06:00:00.000Z"), zone: Fixtures.utc, store: store)
        XCTAssertFalse(page.moonWaxing)
        XCTAssertEqual(page.moonLines[1], "WANING CRESCENT")
        XCTAssertEqual(page.moonLines[3], "NEW MOON")
        XCTAssertLessThan(page.moonLit, 0.5)
    }

    func test_everyGoldenWeekKeepsTheWebsLinesAndRomesFlags() throws {
        let store = try Fixtures.store()
        for golden in try Fixtures.horizons().weeks {
            let culture = try Culture.fromId(golden.culture)
            let start = try Fixtures.instant(golden.weekStart)
            let page = SkyWeekBuilder.build(culture: culture, now: start, zone: Fixtures.utc, store: store)
            XCTAssertEqual(page.rows.map(\.line), golden.days.map(\.line), golden.culture)
            XCTAssertEqual(page.rows.map(\.tension), golden.days.map { $0.tone == "tension" }, golden.culture)
            XCTAssertEqual(page.headline, store.day.weekTitle(culture), golden.culture)
            for (row, day) in zip(page.rows, golden.days) {
                let label = day.label.split(separator: " ").map(String.init)
                let weekday = day.flag.map { "\(label[0]) \($0)" } ?? label[0]
                XCTAssertEqual(row.weekday, weekday, "\(golden.culture) \(day.label)")
                XCTAssertEqual(row.dayNumber, label[1], "\(golden.culture) \(day.label)")
                if day.tone == "quiet" { XCTAssertEqual(row.shorthand, "QUIET") }
            }
        }
    }

    func test_theCountLineLeavesOutAPartThatCountsNone() {
        func days(_ tones: [WeekTone]) -> [WeekDay] {
            tones.enumerated().map { i, tone in
                WeekDay(date: Date(timeIntervalSince1970: 0), year: 2026, month: 10, day: 19 + i, label: "MON \(19 + i)",
                        isToday: false, headline: nil, line: "", shorthand: WeekShorthand(kind: .quiet), tone: tone, flag: nil)
            }
        }
        XCTAssertEqual(SkyWeekBuilder.countLine(days([.harmony, .tension, .harmony, .quiet, .harmony, .harmony, .harmony])),
                       "SEVEN DAYS · SIX WEIGHED · ONE QUIET")
        XCTAssertEqual(SkyWeekBuilder.countLine(days(Array(repeating: .quiet, count: 7))), "SEVEN DAYS · SEVEN QUIET")
    }

    func test_theBoardsKickerSpansTheWeeksDates() throws {
        let store = try Fixtures.store()
        func week(_ y: Int, _ m: Int, _ d: Int) -> [WeekDay] {
            (0..<7).map { i in
                let date = Date(timeIntervalSince1970: 0)
                let noon = Instant.noonUTC(year: y, month: m, day: d).addingTimeInterval(Double(i) * 86_400)
                let ymd = Instant.localYMD(noon, Fixtures.utc)
                return WeekDay(date: date, year: ymd.year, month: ymd.month, day: ymd.day, label: "", isToday: false,
                               headline: nil, line: "", shorthand: WeekShorthand(kind: .quiet), tone: .quiet, flag: nil)
            }
        }
        XCTAssertEqual(SkyWeekBuilder.boardKicker(.egypt, days: week(2026, 10, 19), store: store),
                       "19 → 25 OCT 2026 · THE HALL OF MA’AT")
        XCTAssertEqual(SkyWeekBuilder.boardKicker(.egypt, days: week(2026, 10, 26), store: store),
                       "26 OCT → 1 NOV 2026 · THE HALL OF MA’AT")
    }
}
