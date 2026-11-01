import Foundation

/// Everything Sky Week prints, in its order (the Glass-Week board): the
/// kicker, the title, the count line, the Moon band and the seven rows. The
/// kicker, the title and each row's line are the web's own strings
/// (WeekNave.tsx, weekReading.ts); the count line, the shorthand's tone and
/// conjunction sign, and the Moon band are the board's forms built from the
/// web's numbers and the Moon ports.
public struct SkyWeekPage: Sendable, Hashable {
    public struct Row: Sendable, Hashable {
        /// "MON", with Rome's day flag after it ("MON F").
        public let weekday: String
        /// "19"
        public let dayNumber: String
        /// "♀ □ ♇ · TIGHT · TENSION", "☉ → SCO" or "QUIET".
        public let shorthand: String
        /// A hard aspect's day: the shorthand prints in the tension colour.
        public let tension: Bool
        public let isToday: Bool
        /// The web's line: the decree's meaning and consequence, an ingress, or the quiet line.
        public let line: String
    }

    /// "THE HALL OF MA’AT · THE WEEK"
    public let kicker: String
    /// "SEVEN DAYS WEIGHED"
    public let headline: String
    /// "SEVEN DAYS · SIX WEIGHED · ONE QUIET"
    public let count: String
    /// The band's five lines: "MOON", "WAXING GIBBOUS", "74% LIT", "FULL MOON", "26 OCT 2026".
    public let moonLines: [String]
    /// The Moon's lit fraction, 0 to 1, and its side: the disc behind the text draws both.
    public let moonLit: Double
    public let moonWaxing: Bool
    public let rows: [Row]
}

public enum SkyWeekBuilder {
    private static let utc = TimeZone(secondsFromGMT: 0)!
    private static let numberWords = ["NO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"]

    /// "THE HALL OF MA’AT · THE WEEK": the web's head kicker (WeekNave.tsx).
    public static func kicker(_ culture: Culture, store: ContentStore) -> String {
        "\(store.day.institution(culture)) · THE WEEK"
    }

    /// "19 → 25 OCT 2026 · THE HALL OF MA’AT": the board's kicker, the week's
    /// first and last local dates. Kept for Matthew's ruling; the page prints
    /// the web's kicker.
    public static func boardKicker(_ culture: Culture, days: [WeekDay], store: ContentStore) -> String {
        guard let first = days.first, let last = days.last else { return store.day.institution(culture) }
        let lastNoon = Instant.noonUTC(year: last.year, month: last.month, day: last.day)
        let month = Format.month(lastNoon, zone: utc)
        let range: String
        if first.month == last.month && first.year == last.year {
            range = "\(first.day) → \(last.day) \(month) \(last.year)"
        } else {
            let firstNoon = Instant.noonUTC(year: first.year, month: first.month, day: first.day)
            range = "\(first.day) \(Format.month(firstNoon, zone: utc)) → \(last.day) \(month) \(last.year)"
        }
        return "\(range) · \(store.day.institution(culture))"
    }

    /// "SEVEN DAYS · SIX WEIGHED · ONE QUIET": the days that carry a figure
    /// or an ingress are weighed; a part that counts none is left out.
    public static func countLine(_ days: [WeekDay]) -> String {
        let quiet = days.filter { $0.tone == .quiet }.count
        let weighed = days.count - quiet
        var parts = ["\(word(days.count)) DAYS"]
        if weighed > 0 { parts.append("\(word(weighed)) WEIGHED") }
        if quiet > 0 { parts.append("\(word(quiet)) QUIET") }
        return parts.joined(separator: " · ")
    }

    private static func word(_ n: Int) -> String {
        n >= 0 && n < numberWords.count ? numberWords[n] : String(n)
    }

    /// The web's shorthand ("☉ □ ♄ · TIGHT", "♂ → SCO", "QUIET") with the
    /// board's additions on an aspect day: a conjunction's sign and the tone
    /// word, "☽ ☌ ♆ · TIGHT · PISCES · EASE". `conjunctionSign` is the sign
    /// the first body stands in at the row's instant.
    public static func shorthand(_ s: WeekShorthand, tone: WeekTone, conjunctionSign: ZodiacSign?,
                                 store: ContentStore) -> String {
        switch s.kind {
        case .aspect:
            guard let a = s.a, let b = s.b, let k = s.aspect else { return "" }
            var parts = ["\(store.planetCopy(a).symbol) \(store.banks.aspectGlyph(k)) \(store.planetCopy(b).symbol)"]
            if s.tight { parts.append("TIGHT") }
            if k == .conjunction, let sign = conjunctionSign { parts.append(sign.name.uppercased()) }
            parts.append(tone == .tension ? "TENSION" : "EASE")
            return parts.joined(separator: " · ")
        case .ingress:
            guard let p = s.planet, let sign = s.sign else { return "" }
            return "\(store.planetCopy(p).symbol) \u{2192} \(store.banks.signAbbreviation(sign))"
        case .quiet:
            return "QUIET"
        }
    }

    /// The five lines of the Moon band (P53) for an instant: the Moon's phase,
    /// its lit share, the next quarter and its date in the reader's calendar.
    public static func moonLines(_ moon: MoonPhase, zone: TimeZone) -> [String] {
        let lit = Int(DayDecreeComposer.jsRound(moon.illuminationFraction * 100))
        let nq = moon.nextQuarterDate
        return [
            "MOON",
            moon.name.uppercased(),
            "\(lit)% LIT",
            moon.nextQuarterName.uppercased(),
            "\(Format.dayMonth(nq, zone: zone)) \(Instant.localYMD(nq, zone).year)",
        ]
    }

    /// The page for the week `now` falls in, Monday to Sunday in `zone`.
    public static func build(culture: Culture, now: Date, zone: TimeZone, store: ContentStore) -> SkyWeekPage {
        let start = WeekReading.mondayOf(now, zone: zone)
        let days = WeekReading.build(culture: culture, weekStart: start, zone: zone, now: now, store: store)
        let rows = days.map { d -> SkyWeekPage.Row in
            var sign: ZodiacSign? = nil
            if d.shorthand.aspect == .conjunction, let a = d.shorthand.a {
                // 00:00 UTC on the row's date, the instant the row's figure was read at.
                let instant = Instant.localMidnight(year: d.year, month: d.month, day: d.day, utc)
                if let lon = Ephemeris.computeChart(instant)[a] {
                    sign = ZodiacMath.longitudeToSign(lon).sign
                }
            }
            let parts = d.label.split(separator: " ", maxSplits: 1).map(String.init)
            let weekday = parts.first ?? d.label
            return SkyWeekPage.Row(
                weekday: d.flag.map { "\(weekday) \($0.rawValue)" } ?? weekday,
                dayNumber: parts.count > 1 ? parts[1] : String(d.day),
                shorthand: shorthand(d.shorthand, tone: d.tone, conjunctionSign: sign, store: store),
                tension: d.tone == .tension,
                isToday: d.isToday,
                line: d.line)
        }
        let moon = MoonPhaseCalculator.compute(now)
        return SkyWeekPage(
            kicker: kicker(culture, store: store),
            headline: store.day.weekTitle(culture),
            count: countLine(days),
            moonLines: moonLines(moon, zone: zone),
            moonLit: moon.illuminationFraction,
            moonWaxing: moon.isWaxing,
            rows: rows)
    }
}
