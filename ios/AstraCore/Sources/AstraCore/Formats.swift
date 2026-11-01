import Foundation

/// The named formats of shared/strings/formats.json (rules F1 to F14 of the
/// ruled table, docs/design/shared-strings-table-2026-11.md), ported from
/// web/src/strings/formats.ts. The word lists (months, weekdays, counts,
/// ordinals, signs, planets, tones) are read from the file; the numeric rules
/// (degrees, roman numerals) live in `Format`. `FormatsTests` holds every
/// format to shared/goldens/formats.json.
///
/// Zone rule: a date format reads the calendar day in the zone the caller
/// passes. The Day screen passes UTC (F1); Week and Season pass the reader's
/// zone (F2). Every output is in the case the reader sees (F14).
public struct Formats: Sendable {
    public let monthAbbr: [String]
    public let monthFull: [String]
    /// Sunday first, as Gregorian weekday 1 is Sunday.
    public let weekdayAbbr: [String]
    public let countWords: [String]
    /// Index 0 unused.
    public let ordinalWords: [String]
    private let signFullNames: [ZodiacSign: String]
    private let signAbbrNames: [ZodiacSign: String]
    private let signPhrases: [ZodiacSign: String]
    private let planetNames: [Planet: String]
    private let toneWords: [AspectKind: String]
    private let spanToneWords: [SpanTone: String]
    public let retrogradeMark: String
    /// " · "
    public let dot: String
    /// " → "
    public let arrow: String

    /// The UTC zone the Day screen reads its date in (F1).
    public static let utc = TimeZone(identifier: "UTC")!

    // MARK: Dates

    private struct Parts {
        let year, month, day, weekday, hour, minute: Int
    }

    private func parts(_ date: Date, _ zone: TimeZone) -> Parts {
        let c = Instant.calendar(zone).dateComponents([.year, .month, .day, .weekday, .hour, .minute], from: date)
        return Parts(year: c.year!, month: c.month!, day: c.day!, weekday: c.weekday!, hour: c.hour!, minute: c.minute!)
    }

    private func month(_ m: Int) -> String { monthAbbr.indices.contains(m - 1) ? monthAbbr[m - 1] : monthAbbr[0] }

    /// F1 `date.day`: "WED 21 OCT 2026". The Day screen passes UTC.
    public func dateDay(_ date: Date, zone: TimeZone = Formats.utc) -> String {
        let p = parts(date, zone)
        return "\(weekdayAbbr[p.weekday - 1]) \(p.day) \(month(p.month)) \(p.year)"
    }

    /// F3 `date.dayMonth`: "23 SEP".
    public func dayMonth(_ date: Date, zone: TimeZone) -> String {
        let p = parts(date, zone)
        return "\(p.day) \(month(p.month))"
    }

    /// F3 `date.dayMonthYear`: "26 OCT 2026".
    public func dayMonthYear(_ date: Date, zone: TimeZone) -> String {
        let p = parts(date, zone)
        return "\(p.day) \(month(p.month)) \(p.year)"
    }

    /// F3 `date.monthYear`: "JUN 2027".
    public func monthYear(_ date: Date, zone: TimeZone) -> String {
        let p = parts(date, zone)
        return "\(month(p.month)) \(p.year)"
    }

    /// The month abbreviation alone: "OCT".
    public func monthAbbreviation(_ date: Date, zone: TimeZone) -> String { month(parts(date, zone).month) }

    /// F1 `date.weekday`: "MON".
    public func weekday(_ date: Date, zone: TimeZone) -> String { weekdayAbbr[parts(date, zone).weekday - 1] }

    /// F3 `date.dayOfMonth`: "19".
    public func dayOfMonth(_ date: Date, zone: TimeZone) -> String { String(parts(date, zone).day) }

    /// F3 `date.year`: "2027".
    public func year(_ date: Date, zone: TimeZone) -> String { String(parts(date, zone).year) }

    /// F3 `time.hm`: "05:30", 24 hour.
    public func timeHM(_ date: Date, zone: TimeZone) -> String {
        let p = parts(date, zone)
        return "\(Formats.pad2(p.hour)):\(Formats.pad2(p.minute))"
    }

    /// F2 `range.days`: "19 → 25 OCT 2026", "29 SEP → 5 OCT 2026",
    /// "28 DEC 2026 → 3 JAN 2027", days read in `zone`.
    public func rangeDays(_ from: Date, _ to: Date, zone: TimeZone) -> String {
        let a = parts(from, zone)
        let b = parts(to, zone)
        return rangeDays(a: (a.year, a.month, a.day), b: (b.year, b.month, b.day))
    }

    /// F2 `range.days` for two calendar dates already read in their zone.
    public func rangeDays(a: (year: Int, month: Int, day: Int), b: (year: Int, month: Int, day: Int)) -> String {
        if a.year != b.year {
            return "\(a.day) \(month(a.month)) \(a.year)\(arrow)\(b.day) \(month(b.month)) \(b.year)"
        }
        if a.month != b.month {
            return "\(a.day) \(month(a.month))\(arrow)\(b.day) \(month(b.month)) \(b.year)"
        }
        return "\(a.day)\(arrow)\(b.day) \(month(b.month)) \(b.year)"
    }

    /// F4 `range.months`: "OCT 2026 → JUN 2027".
    public func rangeMonths(_ from: Date, _ to: Date, zone: TimeZone) -> String {
        "\(monthYear(from, zone: zone))\(arrow)\(monthYear(to, zone: zone))"
    }

    // MARK: Numbers

    /// F5 `angle.degMin`: "24°45′", "3°37′"; minutes rounded, never 30°00′ inside a sign.
    public func degMin(_ degrees: Double) -> String { Format.degree(degrees) }

    /// F6 `angle.orbDecimal`: "3.0°".
    public func orbDecimal(_ degrees: Double) -> String {
        String(format: "%.1f°", Formats.jsRound(abs(degrees) * 10) / 10)
    }

    /// F6 `percent`: "74%".
    public func percent(_ fraction: Double) -> String { "\(Int(Formats.jsRound(fraction * 100)))%" }

    /// F7 `count.word`: "NONE", "ONE" to "TWELVE", digits above.
    public func countWord(_ n: Int) -> String { countWords.indices.contains(n) ? countWords[n] : String(n) }

    /// F7 `count.digits`: "72".
    public func countDigits(_ n: Int) -> String { String(n) }

    /// F12 `ordinal.word`: "eleventh"; digits outside 1 to 12.
    public func ordinalWord(_ n: Int) -> String {
        (1...12).contains(n) && ordinalWords.indices.contains(n) ? ordinalWords[n] : String(n)
    }

    /// F12 `ordinal.wordUpper`: "SECOND".
    public func ordinalWordUpper(_ n: Int) -> String { ordinalWord(n).uppercased() }

    /// F12 `ordinal.wordTitle`: "Eleventh".
    public func ordinalWordTitle(_ n: Int) -> String {
        let w = ordinalWord(n)
        return w.prefix(1).uppercased() + w.dropFirst()
    }

    /// F12 `house.roman`: "II".
    public func houseRoman(_ house: Int) -> String { Format.toRoman(house) }

    /// F12 `year.roman`: "MMXXVI".
    public func yearRoman(_ year: Int) -> String { Format.toRoman(year) }

    // MARK: Words

    /// F8 `sign.full`: "CAPRICORN".
    public func signFull(_ sign: ZodiacSign) -> String { signFullNames[sign]! }

    /// F8 `sign.abbr`: "CAP".
    public func signAbbr(_ sign: ZodiacSign) -> String { signAbbrNames[sign]! }

    /// F8 `sign.phrase`: "FISHES".
    public func signPhrase(_ sign: ZodiacSign) -> String { signPhrases[sign]! }

    /// F8 `planet.name`: "MERCURY".
    public func planetName(_ planet: Planet) -> String { planetNames[planet]! }

    /// F9 `tone.word`: "EASE", "TENSION", "UNION".
    public func toneWord(_ kind: AspectKind) -> String { toneWords[kind]! }

    /// F9: a span's tone word, "EASE" or "TENSION".
    public func spanToneWord(_ tone: SpanTone) -> String { spanToneWords[tone]! }

    /// F11 `motion.mark`: "R" when retrograde, nothing when direct.
    public func motionMark(_ retrograde: Bool) -> String { retrograde ? retrogradeMark : "" }

    // MARK: Helpers

    /// JavaScript's Math.round: half up.
    static func jsRound(_ x: Double) -> Double { (x + 0.5).rounded(.down) }

    private static func pad2(_ n: Int) -> String { n < 10 ? "0\(n)" : String(n) }

    // MARK: Loading

    private struct WordsDTO: Decodable {
        let monthAbbr: [String]
        let monthFull: [String]
        let weekdayAbbr: [String]
        let countWords: [String]
        let ordinalWords: [String]
        let signFull: [String: String]
        let signAbbr: [String: String]
        let signPhrases: [String: String]
        let planetNames: [String: String]
        let toneWords: [String: String]
        let spanToneWords: [String: String]
        let retrogradeMark: String
    }

    private struct FileDTO: Decodable {
        struct Separators: Decodable { let dot, arrow: String }
        let separators: Separators
        let words: WordsDTO
    }

    /// Loads formats.json from a directory holding the shared/strings files,
    /// naming every missing word.
    public init(directory: URL) throws {
        let name = "formats.json"
        let url = directory.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else { throw ContentError.missingFile("strings/\(name)") }
        let file: FileDTO
        do {
            file = try JSONDecoder().decode(FileDTO.self, from: data)
        } catch {
            throw ContentError.malformed("strings/\(name)", String(describing: error))
        }
        let w = file.words
        var gaps: [String] = []
        if w.monthAbbr.count != 12 { gaps.append("monthAbbr: expected 12, got \(w.monthAbbr.count)") }
        if w.monthFull.count != 12 { gaps.append("monthFull: expected 12, got \(w.monthFull.count)") }
        if w.weekdayAbbr.count != 7 { gaps.append("weekdayAbbr: expected 7, got \(w.weekdayAbbr.count)") }
        if w.countWords.count != 13 { gaps.append("countWords: expected 13, got \(w.countWords.count)") }
        if w.ordinalWords.count != 13 { gaps.append("ordinalWords: expected 13, got \(w.ordinalWords.count)") }

        func bySign(_ map: [String: String], _ what: String) -> [ZodiacSign: String] {
            var out: [ZodiacSign: String] = [:]
            for sign in ZodiacSign.allCases {
                if let v = map[sign.name] { out[sign] = v } else { gaps.append("\(what).\(sign.name)") }
            }
            return out
        }
        let signFull = bySign(w.signFull, "signFull")
        let signAbbr = bySign(w.signAbbr, "signAbbr")
        let signPhrases = bySign(w.signPhrases, "signPhrases")
        var planets: [Planet: String] = [:]
        for planet in Planet.allCases {
            if let v = w.planetNames[planet.id] { planets[planet] = v } else { gaps.append("planetNames.\(planet.id)") }
        }
        var tones: [AspectKind: String] = [:]
        for kind in AspectKind.allCases {
            if let v = w.toneWords[kind.id] { tones[kind] = v } else { gaps.append("toneWords.\(kind.id)") }
        }
        var spanTones: [SpanTone: String] = [:]
        for tone in SpanTone.allCases {
            if let v = w.spanToneWords[tone.rawValue] { spanTones[tone] = v } else { gaps.append("spanToneWords.\(tone.rawValue)") }
        }
        if !gaps.isEmpty { throw ContentError.incomplete("shared/strings/\(name)", gaps) }

        monthAbbr = w.monthAbbr
        monthFull = w.monthFull
        weekdayAbbr = w.weekdayAbbr
        countWords = w.countWords
        ordinalWords = w.ordinalWords
        signFullNames = signFull
        signAbbrNames = signAbbr
        self.signPhrases = signPhrases
        planetNames = planets
        toneWords = tones
        spanToneWords = spanTones
        retrogradeMark = w.retrogradeMark
        dot = file.separators.dot
        arrow = file.separators.arrow
    }
}
