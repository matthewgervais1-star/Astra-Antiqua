import AstraCore
import Foundation
import XCTest

/// The screens AstraCore composes, slot for slot, against the screen goldens
/// web writes (shared/goldens/screens/<screen>.json, from
/// web/scripts/export-screen-goldens.mjs). A slot prints one string, or one
/// string per row; stacked lines join with "\n" as web's `lines` joins them.
///
/// AstraCore composes Day and Week. Season is composed in the SwiftUI head
/// (HorizonsView), which does not build on this machine, so season.json is not
/// read here. The slots each screen leaves to web are listed in `skipped`;
/// every other golden slot must be composed, and the model must print nothing
/// the golden lacks.
final class ScreenGoldenTests: XCTestCase {
    private enum Slot: Equatable, CustomStringConvertible {
        case one(String)
        case many([String])

        var description: String {
            switch self {
            case let .one(s): return String(reflecting: s)
            case let .many(a): return String(reflecting: a)
            }
        }
    }

    private struct ScreenCase {
        let id: String
        let culture: Culture
        let instant: Date
        let zone: TimeZone
        let birth: String?
        let slots: [String: Slot]
    }

    private struct ScreenFile {
        let declared: [String]
        let births: [String: [String: Any]]
        let cases: [ScreenCase]
    }

    /// Day slots AstraCore leaves to web: the votive is composed by web's
    /// decree.ts votive bank, which the Swift port does not carry (hidden on
    /// the ports by the ruled table).
    private static let skippedDay: Set<String> = ["day.votive"]

    /// Week slots AstraCore leaves to web: none.
    private static let skippedWeek: Set<String> = []

    private func load(_ screen: String) throws -> ScreenFile {
        let url = Fixtures.goldensDirectory.appendingPathComponent("screens").appendingPathComponent("\(screen).json")
        let data = try Data(contentsOf: url)
        let root = try XCTUnwrap(try JSONSerialization.jsonObject(with: data) as? [String: Any])
        let declared = try XCTUnwrap(root["slots"] as? [String])
        let births = (root["births"] as? [String: [String: Any]]) ?? [:]
        let rows = try XCTUnwrap(root["cases"] as? [[String: Any]])
        let cases = try rows.map { row -> ScreenCase in
            let raw = try XCTUnwrap(row["slots"] as? [String: Any])
            var slots: [String: Slot] = [:]
            for (key, value) in raw {
                if let s = value as? String {
                    slots[key] = .one(s)
                } else {
                    slots[key] = .many(try XCTUnwrap(value as? [String], "\(key) is neither a string nor a list"))
                }
            }
            return ScreenCase(
                id: try XCTUnwrap(row["id"] as? String),
                culture: try Culture.fromId(try XCTUnwrap(row["culture"] as? String)),
                instant: try Fixtures.instant(try XCTUnwrap(row["instant"] as? String)),
                zone: try XCTUnwrap(TimeZone(identifier: try XCTUnwrap(row["zone"] as? String))),
                birth: row["birth"] as? String,
                slots: slots)
        }
        return ScreenFile(declared: declared, births: births, cases: cases)
    }

    /// The smoke birth the goldens name, cast from the C# core's fixture after
    /// checking that the two records agree.
    private func natal(_ file: ScreenFile, _ name: String?, store: ContentStore) throws -> NatalChart? {
        guard let name else { return nil }
        XCTAssertEqual(name, "smoke", "the goldens name a birth this test does not know")
        let record = try XCTUnwrap(file.births[name])
        let birth = try XCTUnwrap(SavedBirth.fromJSON(try Fixtures.text("smoke-birth.v1.json")))
        XCTAssertEqual(record["name"] as? String, birth.name)
        XCTAssertEqual(record["date"] as? String, String(format: "%04d-%02d-%02d", birth.year, birth.month, birth.day))
        XCTAssertEqual(record["time"] as? String, String(format: "%02d:%02d", birth.hour, birth.minute))
        XCTAssertEqual(record["cityLabel"] as? String, birth.placeName)
        XCTAssertEqual((record["latitude"] as? NSNumber)?.doubleValue, birth.latitude)
        XCTAssertEqual((record["longitude"] as? NSNumber)?.doubleValue, birth.longitude)
        return birth.cast(rules: store.aspectRules)
    }

    /// Compares one case: every golden slot not skipped must match, and the
    /// model must print no slot the golden lacks.
    private func compare(_ model: [String: Slot], _ c: ScreenCase, skipped: Set<String>,
                         file: StaticString = #filePath, line: UInt = #line) {
        for key in c.slots.keys.sorted() where !skipped.contains(key) {
            guard let printed = model[key] else {
                XCTFail("\(c.id): \(key) is not composed", file: file, line: line)
                continue
            }
            XCTAssertEqual(printed, c.slots[key], "\(c.id): \(key)", file: file, line: line)
        }
        for key in model.keys.sorted() where c.slots[key] == nil {
            XCTFail("\(c.id): \(key) prints \(model[key]!) where web prints nothing", file: file, line: line)
        }
    }

    // MARK: Day

    private func dayModel(_ page: SkyDayPage) -> [String: Slot] {
        var m: [String: Slot] = [
            "day.kicker": .one(page.kicker),
            "day.headline": .one(page.headline),
            "day.paragraph": .many([page.paragraph]),
            "day.sky.label": .one(page.skyLabel),
            "day.sky.moon": .one("\(page.moonLabel)\n\(page.moon)"),
            "day.sky.nextQuarter": .one("\(page.nextQuarterName)\n\(page.nextQuarterDate)"),
            "day.sky.season": .one("\(page.seasonLabel)\n\(page.season)"),
            "day.sky.bar": .many([page.seasonStart, page.seasonToGo, page.seasonEnd]),
            "day.footer": .many(page.footer),
            "day.feedback": .many(page.feedback),
        ]
        if !page.evidence.isEmpty { m["day.evidence"] = .one(page.evidence) }
        if let rows = page.chartRows {
            m["day.chart.label"] = .one(page.chartLabel)
            m["day.chart.row.sentence"] = .many(rows.map(\.sentence))
            m["day.chart.row.data"] = .many(rows.map { $0.dataLine ?? "" })
        }
        if let card = page.longTransit {
            m["day.longTransit.label"] = .one(page.longTransitLabel)
            m["day.longTransit.meta"] = .one(card.meta)
            m["day.longTransit.title"] = .one("\(card.title1)\n\(card.title2)")
            m["day.longTransit.footer"] = .one(card.footer)
            m["day.longTransit.link"] = .one(card.link)
        }
        return m
    }

    func test_theDayPagePrintsEveryGoldenSlot() throws {
        let store = try Fixtures.store()
        let file = try load("day")
        XCTAssertGreaterThanOrEqual(file.cases.count, 10)
        XCTAssertTrue(file.cases.contains { $0.birth == nil }, "day.json lost its no-chart case")
        XCTAssertTrue(file.cases.contains { $0.zone.identifier == "America/Montreal" }, "day.json lost its Montreal case")
        for key in Self.skippedDay { XCTAssertTrue(file.declared.contains(key), "skipped slot \(key) is not declared") }
        for c in file.cases {
            let chart = try natal(file, c.birth, store: store)
            let spans = chart.map {
                LongTransitPick.spans(natal: $0.longitudes, ascendant: $0.ascendant, midheaven: $0.midheaven, now: c.instant)
            }
            let page = SkyDayBuilder.build(
                culture: c.culture, now: c.instant, zone: c.zone, natal: chart, spans: spans, store: store)
            compare(dayModel(page), c, skipped: Self.skippedDay)
        }
    }

    // MARK: Week

    private func weekModel(_ page: SkyWeekPage) -> [String: Slot] {
        func column(_ kind: ShorthandKind) -> Slot {
            .many(page.rows.map { $0.shorthandKind == kind ? $0.shorthand : "" })
        }
        return [
            "week.kicker": .one(page.kicker),
            "week.title": .one(page.headline),
            "week.countLine": .one(page.count),
            "week.thesis": .one(page.thesis),
            "week.moon": .one(page.moonLines.joined(separator: "\n")),
            "week.row.weekday": .many(page.rows.map { "\($0.weekday)\n\($0.dayNumber)" }),
            "week.row.today": .many(page.rows.map(\.today)),
            "week.row.headline": .many(page.rows.map(\.headline)),
            "week.row.line": .many(page.rows.map(\.line)),
            "week.row.shorthand.aspect": column(.aspect),
            "week.row.shorthand.ingress": column(.ingress),
            "week.row.shorthand.quiet": column(.quiet),
            "week.note": .one(page.note),
            "week.votive": .one(page.votive),
            "week.footer": .many(page.footer),
        ]
    }

    func test_theWeekPagePrintsEveryGoldenSlot() throws {
        let store = try Fixtures.store()
        let file = try load("week")
        XCTAssertGreaterThanOrEqual(file.cases.count, 10)
        XCTAssertTrue(file.cases.contains { $0.zone.identifier == "America/Montreal" }, "week.json lost its Montreal case")
        for c in file.cases {
            // The week is sky-only: the birth record changes nothing (web's buildWeekModel).
            let page = SkyWeekBuilder.build(culture: c.culture, now: c.instant, zone: c.zone, store: store)
            compare(weekModel(page), c, skipped: Self.skippedWeek)
        }
    }

    // MARK: The catalog

    /// Every key the AstraCore builders read is in the catalog, so none
    /// prints as its own key.
    func test_everyKeyTheBuildersReadIsInTheCatalog() throws {
        let strings = try Fixtures.store().strings
        let keys = [
            "common.institution", "day.kicker", "day.evidence", "day.sky.label", "day.sky.moon.label",
            "day.sky.moon.line", "day.sky.nextQuarter", "day.sky.nextQuarter.date", "day.sky.season.label",
            "day.sky.season.line", "day.sky.bar.toGo", "day.chart.label", "day.chart.row.data",
            "day.longTransit.label", "day.longTransit.meta", "day.longTransit.open", "day.longTransit.next",
            "day.longTransit.title1", "day.longTransit.title2", "day.longTransit.footer", "day.longTransit.link",
            "day.feedback.noun", "week.kicker", "week.title", "week.countLine", "week.thesis", "week.moon.label",
            "week.moon.phase", "week.moon.lit", "week.moon.nextQuarter", "week.moon.nextQuarter.date",
            "week.row.weekday", "week.row.date", "week.row.today", "week.row.shorthand.aspect",
            "week.row.shorthand.aspectTight", "week.row.shorthand.conjunction",
            "week.row.shorthand.conjunctionTight", "week.row.shorthand.ingress", "week.row.shorthand.quiet",
            "week.note", "week.votive.tension", "week.votive.harmony", "week.votive.quiet",
            "chrome.footer.toDay", "chrome.footer.toWeek", "chrome.footer.toSeason", "chrome.footer.toYear",
            "chrome.footer.toTransits", "chrome.feedback.lead", "chrome.feedback.so", "chrome.feedback.notSo",
            "chrome.feedback.kept", "chrome.wordmark", "chrome.cultureChip.a11y",
        ]
        for key in keys { XCTAssertTrue(strings.has(key), "the catalog has no \(key)") }
        for name in ["New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous", "Full Moon",
                     "Waning Gibbous", "Last Quarter", "Waning Crescent"] {
            XCTAssertTrue(strings.has(Strings.moonPhaseKey(name)), "the catalog has no phase \(name)")
        }
    }

    func test_aMissingKeyPrintsTheKeyAndAFillLeavesUnknownSlots() throws {
        let strings = try Fixtures.store().strings
        XCTAssertEqual(strings.text("no.such.key"), "no.such.key")
        XCTAssertEqual(strings.text("week.title"), "week.title", "a per-culture key needs its culture")
        XCTAssertEqual(strings.text("week.title", .carthage), "THE WEEK\u{2019}S LEDGER")
        XCTAssertEqual(Strings.fill("{a} and {b}", ["a": "x"]), "x and {b}")
        XCTAssertEqual(Strings.moonPhaseKey("Waxing Gibbous"), "common.moon.waxingGibbous")
    }

    /// F10 and F13: no catalog value carries an ASCII apostrophe or an en dash.
    func test_theCatalogKeepsTheHouseCharacters() throws {
        let strings = try Fixtures.store().strings
        for key in strings.keys {
            let values = strings.isPerCulture(key) ? Culture.allCases.map { strings.text(key, $0) } : [strings.text(key)]
            for v in values {
                XCTAssertFalse(v.contains("'"), "\(key) carries an ASCII apostrophe")
                XCTAssertFalse(v.contains("\u{2013}"), "\(key) carries an en dash")
                XCTAssertFalse(v.contains("\u{2014}"), "\(key) carries an em dash")
            }
        }
    }
}
