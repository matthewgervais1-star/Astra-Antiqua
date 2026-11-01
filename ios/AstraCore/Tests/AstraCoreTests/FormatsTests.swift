import AstraCore
import Foundation
import XCTest

/// Every named format against shared/goldens/formats.json, which web's
/// scripts/export-strings.mjs writes from web/src/strings/formats.ts. A case
/// names its format, its input, the zone the date is read in, and the text web
/// prints.
final class FormatsTests: XCTestCase {
    private struct Case {
        let name: String
        let input: Any
        let zone: String
        let out: String
        let note: String?
    }

    private func cases() throws -> [Case] {
        let data = try Data(contentsOf: Fixtures.goldensDirectory.appendingPathComponent("formats.json"))
        let root = try XCTUnwrap(try JSONSerialization.jsonObject(with: data) as? [String: Any])
        let rows = try XCTUnwrap(root["cases"] as? [[String: Any]])
        return try rows.map { row in
            Case(name: try XCTUnwrap(row["name"] as? String),
                 input: try XCTUnwrap(row["input"]),
                 zone: try XCTUnwrap(row["zone"] as? String),
                 out: try XCTUnwrap(row["out"] as? String),
                 note: row["note"] as? String)
        }
    }

    private func date(_ value: Any) throws -> Date {
        try Fixtures.instant(try XCTUnwrap(value as? String))
    }

    private func dates(_ value: Any) throws -> (Date, Date) {
        let pair = try XCTUnwrap(value as? [String])
        XCTAssertEqual(pair.count, 2)
        return (try Fixtures.instant(pair[0]), try Fixtures.instant(pair[1]))
    }

    private func number(_ value: Any) throws -> Double { try XCTUnwrap(value as? NSNumber).doubleValue }

    private func integer(_ value: Any) throws -> Int { Int(try number(value)) }

    /// The text this surface prints for one case.
    private func printed(_ c: Case, _ f: Formats) throws -> String {
        let zone = try XCTUnwrap(TimeZone(identifier: c.zone), c.zone)
        switch c.name {
        case "date.day": return f.dateDay(try date(c.input), zone: zone)
        case "date.dayMonth": return f.dayMonth(try date(c.input), zone: zone)
        case "date.dayMonthYear": return f.dayMonthYear(try date(c.input), zone: zone)
        case "date.monthYear": return f.monthYear(try date(c.input), zone: zone)
        case "date.weekday": return f.weekday(try date(c.input), zone: zone)
        case "date.dayOfMonth": return f.dayOfMonth(try date(c.input), zone: zone)
        case "date.year": return f.year(try date(c.input), zone: zone)
        case "time.hm": return f.timeHM(try date(c.input), zone: zone)
        case "range.days":
            let (a, b) = try dates(c.input)
            return f.rangeDays(a, b, zone: zone)
        case "range.months":
            let (a, b) = try dates(c.input)
            return f.rangeMonths(a, b, zone: zone)
        case "angle.degMin": return f.degMin(try number(c.input))
        case "angle.orbDecimal": return f.orbDecimal(try number(c.input))
        case "percent": return f.percent(try number(c.input))
        case "count.word": return f.countWord(try integer(c.input))
        case "count.digits": return f.countDigits(try integer(c.input))
        case "ordinal.word": return f.ordinalWord(try integer(c.input))
        case "ordinal.wordUpper": return f.ordinalWordUpper(try integer(c.input))
        case "ordinal.wordTitle": return f.ordinalWordTitle(try integer(c.input))
        case "house.roman": return f.houseRoman(try integer(c.input))
        case "year.roman": return f.yearRoman(try integer(c.input))
        case "sign.full": return f.signFull(try ZodiacSign.fromName(try XCTUnwrap(c.input as? String)))
        case "sign.abbr": return f.signAbbr(try ZodiacSign.fromName(try XCTUnwrap(c.input as? String)))
        case "sign.phrase": return f.signPhrase(try ZodiacSign.fromName(try XCTUnwrap(c.input as? String)))
        case "planet.name": return f.planetName(try Planet.fromId(try XCTUnwrap(c.input as? String)))
        case "tone.word": return f.toneWord(try AspectKind.fromId(try XCTUnwrap(c.input as? String)))
        case "motion.mark": return f.motionMark(try XCTUnwrap(c.input as? NSNumber).boolValue)
        default:
            XCTFail("formats.json names a format this surface does not implement: \(c.name)")
            return ""
        }
    }

    func test_everyFormatPrintsWhatWebPrints() throws {
        let f = try Fixtures.store().formats
        let all = try cases()
        XCTAssertGreaterThanOrEqual(all.count, 63, "formats.json lost cases")
        for c in all {
            let label = "\(c.name) \(c.input) in \(c.zone)\(c.note.map { " (\($0))" } ?? "")"
            XCTAssertEqual(try printed(c, f), c.out, label)
        }
    }

    /// Every format the exported rule list names has at least one golden case.
    func test_everyNamedFormatHasAGoldenCase() throws {
        let data = try Data(contentsOf: Fixtures.stringsDirectory.appendingPathComponent("formats.json"))
        let root = try XCTUnwrap(try JSONSerialization.jsonObject(with: data) as? [String: Any])
        let rules = try XCTUnwrap(root["rules"] as? [String: Any])
        let covered = Set(try cases().map(\.name))
        for name in rules.keys.sorted() {
            XCTAssertTrue(covered.contains(name), "no golden case for \(name)")
        }
    }

    func test_theSeparatorsAreTheHouseCharacters() throws {
        let f = try Fixtures.store().formats
        XCTAssertEqual(f.dot, " \u{00B7} ")
        XCTAssertEqual(f.arrow, " \u{2192} ")
    }
}
