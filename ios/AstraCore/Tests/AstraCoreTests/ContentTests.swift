import AstraCore
import Foundation
import XCTest

/// The banks and reference files added for the iOS surface load whole and say
/// what web says. Port of the C# core's ContentBanksTests.
final class ContentBanksTests: XCTestCase {
    func test_theHouseReadingIsWebsSentence() throws {
        let store = try Fixtures.store()
        let cases = try Fixtures.horizons().houseReadings
        XCTAssertFalse(cases.isEmpty)
        for c in cases {
            let culture = try Culture.fromId(c.culture)
            let planet = try Planet.fromId(c.planet)
            let line = store.banks.houseReading(
                deityName: store.deity(culture, planet).name, planet: planet, arena: store.house(c.house).arena)
            XCTAssertEqual(line, c.line, "\(c.culture)/\(c.planet) in house \(c.house)")
        }
    }

    func test_theGlyphsKeepTheStatusTallyTheResearchSettled() throws {
        let store = try Fixtures.store()
        let all = Culture.allCases.flatMap { culture in Planet.allCases.map { planet in store.glyph(culture, planet) } }
        XCTAssertEqual(all.count, 50)
        XCTAssertEqual(all.filter { $0.status == .attested }.count, 28)
        XCTAssertEqual(all.filter { $0.status == .composed }.count, 21)
        XCTAssertEqual(all.filter { $0.status == .invented }.count, 1)
        for glyph in all {
            let label = "\(glyph.culture.id)/\(glyph.planet.id)"
            XCTAssertFalse(glyph.paths.isEmpty, label)
            XCTAssertEqual(
                firstWord(store.deity(glyph.culture, glyph.planet).name), firstWord(glyph.deity), label)
        }
    }

    func test_everyCultureHasItsCopyPaletteAndSeasonLines() throws {
        let store = try Fixtures.store()
        for culture in Culture.allCases {
            let tagline = store.cultureCopy(culture).tagline
            XCTAssertFalse(tagline.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty, culture.id)
            XCTAssertTrue(store.palette(culture).accent.hasPrefix("#"), culture.id)
            for house in 1...12 {
                XCTAssertTrue(
                    store.banks.seasonHouseLine(culture, house).hasPrefix("The season sits in your"),
                    "\(culture.id) house \(house)")
            }
        }
        XCTAssertFalse(store.method.sections.isEmpty)
        XCTAssertFalse(store.method.sources.isEmpty)
    }

    func test_templatesFillTheirSlotsAndCapitaliseWhereWebDoes() throws {
        XCTAssertEqual(ReadingBanks.fill("{A} and {b}.", [("a", "abc"), ("b", "def")]), "Abc and def.")
        XCTAssertEqual(ReadingBanks.cap(""), "")
        XCTAssertEqual(ReadingBanks.cap("ra"), "Ra")
        let store = try Fixtures.store()
        XCTAssertEqual(
            store.banks.ingressFrame(.canaan, "the count of the nights"),
            "The count of the nights moves to the house of another god, where no envoy has announced it.")
    }

    func test_citySearchMatchesWebsSearch() throws {
        let store = try Fixtures.store()
        XCTAssertEqual(store.searchCities("").count, store.cities.filter(\.popular).count)
        XCTAssertTrue(store.searchCities("tor").contains { $0.name == "Toronto" })
        XCTAssertLessThanOrEqual(store.searchCities("a").count, 8)
        XCTAssertTrue(store.searchCities("zzzz").isEmpty)
    }

    func test_theSevenLearnSectionsArriveWithTheirTables() throws {
        let learn = try Fixtures.store().learn
        XCTAssertEqual(learn.sections.count, 7)
        for section in learn.sections {
            XCTAssertFalse(section.blocks.isEmpty, section.title)
        }
        XCTAssertEqual(learn.planetVerbs.count, 11)
        XCTAssertEqual(learn.houseSystems.count, 3)
        XCTAssertEqual(learn.houseSystems.filter(\.ours).count, 1)
        XCTAssertEqual(learn.aspectRulings.count, 25)
        XCTAssertEqual(learn.aspectGeometry.count, 5)
        let tables = Set(learn.sections.compactMap(\.table))
        XCTAssertEqual(tables, ["PLANET_VERBS", "ZODIAC_SIGNS", "HOUSES", "HOUSE_SYSTEMS", "ASPECTS"])
    }

    /// Every glyph path reaches the renderers in explicit form: one command
    /// letter per segment, followed by exactly that command's count of
    /// separated numbers. Microsoft.Maui.Graphics drew nothing for SVG's
    /// implicit line-to ("M1 2 3 4"), which blanked Carthage's Mercury on iOS.
    func test_everyGlyphPathIsInExplicitForm() throws {
        let arity: [String: Int] = [
            "m": 2, "l": 2, "h": 1, "v": 1, "c": 6, "s": 4,
            "q": 4, "t": 2, "a": 7, "z": 0,
        ]
        let store = try Fixtures.store()
        for culture in Culture.allCases {
            for planet in Planet.allCases {
                let label = "\(culture.id)/\(planet.id)"
                for path in store.glyph(culture, planet).paths {
                    guard let segments = ExplicitPathForm.segments(path.data) else {
                        XCTFail("\(label): path does not open with a command letter: '\(path.data)'")
                        continue
                    }
                    for segment in segments {
                        guard let parsed = ExplicitPathForm.parse(segment) else {
                            XCTFail("\(label): malformed segment '\(segment)'")
                            continue
                        }
                        XCTAssertEqual(
                            arity[String(parsed.command).lowercased()], parsed.numbers,
                            "\(label): '\(segment)' has \(parsed.numbers) numbers")
                    }
                }
            }
        }
    }

    /// C#'s Split(' ')[0]: everything before the first space, the whole
    /// string when there is none.
    private func firstWord(_ s: String) -> String {
        s.components(separatedBy: " ")[0]
    }
}

/// The C# test's segment grammar, matched by scanning instead of a regular
/// expression. A segment is a command letter and then zero or more numbers,
/// each an optional single space, an optional minus, then digits with an
/// optional point and fraction (or a point and digits), then an optional
/// exponent. Numbers may abut ("1.5.5" reads as "1.5" and ".5"), so the
/// match tracks every position a run of numbers can reach, as the regular
/// expression's backtracking does. The count of numbers is the count of
/// space-separated pieces after the letter, as the C# counts them.
private enum ExplicitPathForm {
    private static let commands = Set("MmLlHhVvCcSsQqTtAaZz".utf8)
    private static let space = UInt8(ascii: " ")
    private static let minus = UInt8(ascii: "-")
    private static let plus = UInt8(ascii: "+")
    private static let dot = UInt8(ascii: ".")
    private static let lowerE = UInt8(ascii: "e")
    private static let upperE = UInt8(ascii: "E")

    /// Splits path data on single spaces and regroups the tokens: a token
    /// opening with a letter starts a segment, any other token (an empty one
    /// included) joins the segment before it after a space. Nil when the data
    /// does not open with a letter, where the C# grouping throws.
    static func segments(_ data: String) -> [String]? {
        var segments: [String] = []
        for token in data.components(separatedBy: " ") {
            if let first = token.first, first.isLetter {
                segments.append(token)
            } else {
                guard !segments.isEmpty else { return nil }
                segments[segments.count - 1] += " " + token
            }
        }
        return segments
    }

    /// The segment's command letter and its count of numbers, or nil when the
    /// segment does not fit the grammar.
    static func parse(_ segment: String) -> (command: Character, numbers: Int)? {
        let bytes = Array(segment.utf8)
        guard let head = bytes.first, commands.contains(head) else { return nil }

        // reachable[p]: the numbers read so far can end exactly at byte p.
        var reachable = [Bool](repeating: false, count: bytes.count + 1)
        reachable[1] = true
        for position in 1..<bytes.count where reachable[position] {
            for end in numberEnds(bytes, from: position) { reachable[end] = true }
        }
        guard reachable[bytes.count] else { return nil }

        let numbers = segment.dropFirst().split(separator: " ").count
        return (Character(Unicode.Scalar(head)), numbers)
    }

    /// Every position where one number of the grammar, read from `start`, can end.
    private static func numberEnds(_ bytes: [UInt8], from start: Int) -> [Int] {
        func isDigit(_ p: Int) -> Bool { p < bytes.count && bytes[p] >= 0x30 && bytes[p] <= 0x39 }
        func isByte(_ p: Int, _ b: UInt8) -> Bool { p < bytes.count && bytes[p] == b }
        func digitRun(_ p: Int) -> Int {
            var end = p
            while isDigit(end) { end += 1 }
            return end - p
        }

        var at = start
        if isByte(at, space) { at += 1 }
        if isByte(at, minus) { at += 1 }

        var mantissaEnds: [Int] = []
        let whole = digitRun(at)
        if whole > 0 {
            // Digits, then an optional point and fraction digits.
            for k in 1...whole { mantissaEnds.append(at + k) }
            let pointAt = at + whole
            if isByte(pointAt, dot) {
                let fraction = digitRun(pointAt + 1)
                for k in 0...fraction { mantissaEnds.append(pointAt + 1 + k) }
            }
        } else if isByte(at, dot) {
            // A point, then at least one digit.
            let fraction = digitRun(at + 1)
            if fraction > 0 {
                for k in 1...fraction { mantissaEnds.append(at + 1 + k) }
            }
        }

        var ends: [Int] = []
        for end in mantissaEnds {
            ends.append(end)
            if isByte(end, lowerE) || isByte(end, upperE) {
                var digitsAt = end + 1
                if isByte(digitsAt, plus) || isByte(digitsAt, minus) { digitsAt += 1 }
                let exponent = digitRun(digitsAt)
                if exponent > 0 {
                    for k in 1...exponent { ends.append(digitsAt + k) }
                }
            }
        }
        return ends
    }
}
