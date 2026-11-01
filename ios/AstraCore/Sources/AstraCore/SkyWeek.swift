import Foundation

/// Everything Sky Week prints, in its order (the Glass-Week board): the
/// kicker, the title, the count line, the Moon band and the seven rows. Each
/// row's headline and line are the web's own strings (weekReading.ts); every
/// frame and label is a key of the shared catalog (shared/strings/en.json)
/// and every date and count a named format (formats.json), as the ruled table
/// docs/design/shared-strings-table-2026-11.md sets them. ScreenGoldenTests
/// holds the page to shared/goldens/screens/week.json.
public struct SkyWeekPage: Sendable, Hashable {
    public struct Row: Sendable, Hashable {
        /// "MON"
        public let weekday: String
        /// "19", with Rome's day flag after it ("19 F").
        public let dayNumber: String
        /// "♀ □ ♇ · TIGHT · TENSION", "☉ INTO SCORPIO" or "QUIET".
        public let shorthand: String
        public let shorthandKind: ShorthandKind
        /// A hard aspect's day: the shorthand prints in the tension colour.
        public let tension: Bool
        public let isToday: Bool
        /// "TODAY" on today's row, "" on the others.
        public let today: String
        /// The web's headline for the day, "" on an ingress day.
        public let headline: String
        /// The web's line: the decree's meaning and consequence, an ingress, or the quiet line.
        public let line: String
    }

    /// "19 → 25 OCT 2026 · THE HALL OF MA’AT"
    public let kicker: String
    /// "SEVEN DAYS WEIGHED", per culture (week.title, Matthew's ruling of 2026-11-01).
    public let headline: String
    /// "SEVEN DAYS · SIX WEIGHED · ONE QUIET"
    public let count: String
    /// The band's five lines: "MOON", "WAXING GIBBOUS", "74% LIT", "FULL MOON", "26 OCT 2026".
    public let moonLines: [String]
    /// The Moon's lit fraction, 0 to 1, and its side: the disc behind the text draws both.
    public let moonLit: Double
    public let moonWaxing: Bool
    public let rows: [Row]
    /// Web's slots the board hides: the culture's thesis and note, the votive
    /// of the week's hardest day, and the footer links.
    public let thesis: String
    public let note: String
    public let votive: String
    public let footer: [String]
}

public enum SkyWeekBuilder {
    /// "19 → 25 OCT 2026 · THE HALL OF MA’AT": the week's first and last
    /// local dates (F2, range.days) and the culture's institution.
    public static func boardKicker(_ culture: Culture, days: [WeekDay], store: ContentStore) -> String {
        let institution = store.strings.text("common.institution", culture)
        guard let first = days.first, let last = days.last else { return institution }
        let range = store.formats.rangeDays(a: first.localDate, b: last.localDate)
        return store.strings.fill("week.kicker", culture, ["range": range, "institution": institution])
    }

    /// "SEVEN DAYS · SIX WEIGHED · ONE QUIET": the days that carry a figure
    /// or an ingress are weighed; a part that counts none prints NONE (F7).
    public static func countLine(_ days: [WeekDay], culture: Culture, store: ContentStore) -> String {
        let quiet = days.filter { $0.tone == .quiet }.count
        let f = store.formats
        return store.strings.fill("week.countLine", culture, [
            "days": f.countWord(days.count),
            "weighed": f.countWord(days.count - quiet),
            "quiet": f.countWord(quiet),
        ])
    }

    /// The web's shorthand (shorthandText): "☉ □ ♄ · TIGHT · TENSION",
    /// "☽ ☌ ♆ · TIGHT · ARIES · UNION", "☉ INTO SCORPIO", "QUIET".
    public static func shorthand(_ s: WeekShorthand, culture: Culture, store: ContentStore) -> String {
        let strings = store.strings
        let f = store.formats
        switch s.kind {
        case .aspect:
            guard let a = s.a, let b = s.b, let k = s.aspect else { return "" }
            // Unicode body symbols, as the board prints them; the web draws each body as a DeityGlyph image.
            var slots = [
                "a": store.planetCopy(a).symbol,
                "b": store.planetCopy(b).symbol,
                "aspectGlyph": store.banks.aspectGlyph(k),
                "tone": f.toneWord(k),
            ]
            if let sign = s.sign { slots["sign"] = f.signFull(sign) }
            let key: String
            if k == .conjunction {
                key = s.tight ? "week.row.shorthand.conjunctionTight" : "week.row.shorthand.conjunction"
            } else {
                key = s.tight ? "week.row.shorthand.aspectTight" : "week.row.shorthand.aspect"
            }
            return strings.fill(key, culture, slots)
        case .ingress:
            guard let p = s.planet, let sign = s.sign else { return "" }
            return strings.fill("week.row.shorthand.ingress", culture, [
                "symbol": store.planetCopy(p).symbol,
                "sign": f.signFull(sign),
            ])
        case .quiet:
            return strings.text("week.row.shorthand.quiet", culture)
        }
    }

    /// The five lines of the Moon band (P53) for an instant: the Moon's phase,
    /// its lit share, the next quarter and its date in the reader's calendar.
    public static func moonLines(_ moon: MoonPhase, culture: Culture, zone: TimeZone, store: ContentStore) -> [String] {
        let s = store.strings
        let f = store.formats
        return [
            s.text("week.moon.label", culture),
            s.fill("week.moon.phase", culture, ["phase": s.text(Strings.moonPhaseKey(moon.name), culture)]),
            s.fill("week.moon.lit", culture, ["percent": f.percent(moon.illuminationFraction)]),
            s.fill("week.moon.nextQuarter", culture, ["quarter": s.text(Strings.moonPhaseKey(moon.nextQuarterName), culture)]),
            s.fill("week.moon.nextQuarter.date", culture, ["date": f.dayMonthYear(moon.nextQuarterDate, zone: zone)]),
        ]
    }

    /// The day the week's votive follows: its first tension day, else its
    /// first harmony day, else its first day (web's pickHardestDay).
    public static func hardestDay(_ days: [WeekDay]) -> WeekDay? {
        days.first { $0.tone == .tension } ?? days.first { $0.tone == .harmony } ?? days.first
    }

    /// The page for the week `now` falls in, Monday to Sunday in `zone`.
    public static func build(culture: Culture, now: Date, zone: TimeZone, store: ContentStore) -> SkyWeekPage {
        let s = store.strings
        let f = store.formats
        let utc = TimeZone(identifier: "UTC")!
        let start = WeekReading.mondayOf(now, zone: zone)
        let days = WeekReading.build(culture: culture, weekStart: start, zone: zone, now: now, store: store)
        let rows = days.map { d -> SkyWeekPage.Row in
            // The row's local calendar date, read at its UTC noon so no zone shifts it.
            let noon = Instant.noonUTC(year: d.year, month: d.month, day: d.day)
            let number = s.fill("week.row.date", culture, ["d": f.dayOfMonth(noon, zone: utc)])
            return SkyWeekPage.Row(
                weekday: s.fill("week.row.weekday", culture, ["weekday": f.weekday(noon, zone: utc)]),
                dayNumber: d.flag.map { "\(number) \($0.rawValue)" } ?? number,
                shorthand: shorthand(d.shorthand, culture: culture, store: store),
                shorthandKind: d.shorthand.kind,
                tension: d.tone == .tension,
                isToday: d.isToday,
                today: d.isToday ? s.text("week.row.today", culture) : "",
                headline: d.headline ?? "",
                line: d.line)
        }
        let moon = MoonPhaseCalculator.compute(now)
        let votiveTone = hardestDay(days)?.tone ?? .quiet
        return SkyWeekPage(
            kicker: boardKicker(culture, days: days, store: store),
            headline: s.text("week.title", culture),
            count: countLine(days, culture: culture, store: store),
            moonLines: moonLines(moon, culture: culture, zone: zone, store: store),
            moonLit: moon.illuminationFraction,
            moonWaxing: moon.isWaxing,
            rows: rows,
            thesis: s.text("week.thesis", culture),
            note: s.text("week.note", culture),
            votive: s.text("week.votive.\(votiveTone.rawValue)", culture),
            footer: ["chrome.footer.toDay", "chrome.footer.toSeason", "chrome.footer.toTransits"].map { s.text($0) })
    }
}
