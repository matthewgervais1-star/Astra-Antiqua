import Foundation

/// How a day of the week strip reads. Raw values are web's tone strings.
public enum WeekTone: String, CaseIterable, Sendable, Hashable {
    case harmony, tension, quiet
}

/// Rome alone flags its days: fastus (F), nefastus (N), comitialis (C).
/// Raw values are web's letters.
public enum RomeDayFlag: String, CaseIterable, Sendable, Hashable {
    case F, N, C
}

/// What a day's shorthand shows. Raw values are web's kind strings.
public enum ShorthandKind: String, CaseIterable, Sendable, Hashable {
    case aspect, ingress, quiet
}

/// The day's shorthand as data, for the screen to draw: an aspect's two bodies
/// and its glyph (flagged tight under half a degree) with the sign the first
/// body stands in, an ingress's body and sign, or nothing on a quiet day.
public struct WeekShorthand: Sendable, Hashable {
    public let kind: ShorthandKind
    public let a: Planet?
    public let aspect: AspectKind?
    public let b: Planet?
    public let tight: Bool
    public let planet: Planet?
    public let sign: ZodiacSign?

    public init(kind: ShorthandKind, a: Planet? = nil, aspect: AspectKind? = nil, b: Planet? = nil,
                tight: Bool = false, planet: Planet? = nil, sign: ZodiacSign? = nil) {
        self.kind = kind
        self.a = a
        self.aspect = aspect
        self.b = b
        self.tight = tight
        self.planet = planet
        self.sign = sign
    }
}

/// One day of the week strip.
public struct WeekDay: Sendable, Hashable {
    /// The UTC instant of the day's local midnight in the week's zone.
    public let date: Date
    /// The local calendar date the day stands for.
    public let year: Int
    public let month: Int
    public let day: Int
    /// "MON 11"
    public let label: String
    public let isToday: Bool
    /// The decree's headline for the day's figure, the culture's holds line
    /// when the figure is the row above's, the quiet headline on a quiet
    /// day, or nil on an ingress day.
    public let headline: String?
    public let line: String
    public let shorthand: WeekShorthand
    public let tone: WeekTone
    /// Rome only: fastus, nefastus or comitialis. Nil for every other culture.
    public let flag: RomeDayFlag?

    /// The local calendar date as one value, shaped like Instant.localYMD's result.
    public var localDate: (year: Int, month: Int, day: Int) { (year, month, day) }

    public init(date: Date, year: Int, month: Int, day: Int, label: String, isToday: Bool, headline: String?,
                line: String, shorthand: WeekShorthand, tone: WeekTone, flag: RomeDayFlag?) {
        self.date = date
        self.year = year
        self.month = month
        self.day = day
        self.label = label
        self.isToday = isToday
        self.headline = headline
        self.line = line
        self.shorthand = shorthand
        self.tone = tone
        self.flag = flag
    }
}

/// Port of buildWeekDays in web/src/lib/weekReading.ts. Each row reads the
/// sky at 00:00 UTC on its calendar date, the instant the day page reads.
/// The day's figure is the tightest aspect touching a fast mover inside
/// 1.2°, always; a figure that holds from the row above prints the
/// culture's holds line in place of a second headline. The line is the
/// decree's meaning and consequence. Without a figure, an ingress that day;
/// without that, the culture's quiet headline and line.
public enum WeekReading {
    private static let eventOrb = 1.2

    /// One ingress scan for the week, buffered past its end for the coarsest step.
    private static let ingressScanDays = 9

    private static let utc = TimeZone(secondsFromGMT: 0)!

    /// The Monday, local calendar in `zone`, of the week `date` falls in
    /// (web's mondayOf), returned as the UTC instant of that Monday's local
    /// midnight.
    public static func mondayOf(_ date: Date, zone: TimeZone) -> Date {
        let local = Instant.localYMD(date, zone)
        // Gregorian weekday is 1 for Sunday; web's getDay() is 0 for Sunday.
        let day = Instant.calendar(zone).component(.weekday, from: date) - 1
        let diff = day == 0 ? -6 : 1 - day
        let monday = addCalendarDays(local, diff)
        return Instant.localMidnight(year: monday.year, month: monday.month, day: monday.day, zone)
    }

    /// The seven days from `weekStart`, the UTC instant of local midnight on
    /// the first day in `zone` (normally a Monday, from `mondayOf`). `now`
    /// decides which day reads as today.
    public static func build(
        culture: Culture,
        weekStart: Date,
        zone: TimeZone,
        now: Date,
        store: ContentStore
    ) -> [WeekDay] {
        let banks = store.banks
        let startLocal = Instant.localYMD(weekStart, zone)
        let todayLocal = Instant.localYMD(now, zone)
        let scanStart = Instant.localMidnight(year: startLocal.year, month: startLocal.month, day: startLocal.day, zone)
        let weekIngresses = SkyEvents.ingresses(scanStart, days: ingressScanDays)

        var days: [WeekDay] = []
        var previous: DayFigure? = nil
        for i in 0..<7 {
            let dateLocal = addCalendarDays(startLocal, i)
            // 00:00 UTC on the row's calendar date, the instant the day page reads.
            let instant = Instant.localMidnight(year: dateLocal.year, month: dateLocal.month, day: dateLocal.day, utc)
            let chart = Ephemeris.computeChart(instant)

            let tightest = DayDecreeComposer.dayFigures(chart, store: store).first { $0.orb < eventOrb }
            var holds = false
            if let t = tightest, let p = previous {
                holds = t.a == p.a && t.b == p.b && t.kind == p.kind
            }
            previous = tightest

            let dayStart = Instant.localMidnight(year: dateLocal.year, month: dateLocal.month, day: dateLocal.day, zone)
            let dayEnd = Instant.addDays(dayStart, 1)
            let dayIngress = weekIngresses.first { $0.date >= dayStart && $0.date < dayEnd }

            let headline: String?
            let line: String
            let shorthand: WeekShorthand
            let tone: WeekTone
            var tight = false

            if let figure = tightest {
                tight = figure.orb < store.day.tightOrb
                tone = figure.kind.isHard ? .tension : .harmony
                headline = holds
                    ? store.day.decree(culture).holds
                    : DayDecreeComposer.headline(culture, figure, store: store)
                let dayNumber = DayDecreeComposer.utcDayNumber(instant)
                line = DayDecreeComposer.meaning(culture, figure, day: dayNumber, store: store) + " "
                    + DayDecreeComposer.consequence(culture, figure, store: store)
                // The first body's sign at the row's instant, as web's shorthand carries it.
                let sign = chart[figure.a].map { ZodiacMath.longitudeToSign($0).sign }
                shorthand = WeekShorthand(kind: .aspect, a: figure.a, aspect: figure.kind, b: figure.b, tight: tight,
                                          sign: sign)
            } else if let ingress = dayIngress {
                tone = .harmony
                headline = nil
                let deity = store.deity(culture, ingress.planet).name
                let signWord = Format.properCase(banks.signPhrase(ingress.toSign))
                line = "\(deity) \(banks.ingressVerb(culture)) the \(signWord). "
                    + banks.ingressFrame(culture, banks.deityCharge(culture, ingress.planet))
                shorthand = WeekShorthand(kind: .ingress, planet: ingress.planet, sign: ingress.toSign)
            } else {
                tone = .quiet
                headline = store.day.quietHeadline(culture)
                line = store.day.quietLine(culture)
                shorthand = WeekShorthand(kind: .quiet)
            }

            let flag: RomeDayFlag?
            if culture == .rome {
                flag = tone == .tension ? (tight ? RomeDayFlag.N : RomeDayFlag.C) : RomeDayFlag.F
            } else {
                flag = nil
            }

            let isToday = dateLocal.year == todayLocal.year
                && dateLocal.month == todayLocal.month
                && dateLocal.day == todayLocal.day

            days.append(WeekDay(
                date: dayStart,
                year: dateLocal.year,
                month: dateLocal.month,
                day: dateLocal.day,
                label: "\(store.formats.weekday(instant, zone: utc)) \(dateLocal.day)",
                isToday: isToday,
                headline: headline,
                line: line,
                shorthand: shorthand,
                tone: tone,
                flag: flag))
        }
        return days
    }

    /// The UTC instant of local midnight on a calendar date in a zone. A
    /// midnight skipped by a clock change does not exist; JavaScript's Date
    /// then moves forward to the first valid instant, and so does this.
    public static func localMidnightUtc(year: Int, month: Int, day: Int, zone: TimeZone) -> Date {
        Instant.localMidnight(year: year, month: month, day: day, zone)
    }

    /// The calendar date `days` after a calendar date: pure date arithmetic,
    /// as C#'s DateTime.AddDays on a date, with no zone to shift it.
    private static func addCalendarDays(
        _ date: (year: Int, month: Int, day: Int),
        _ days: Int
    ) -> (year: Int, month: Int, day: Int) {
        let noon = Instant.noonUTC(year: date.year, month: date.month, day: date.day)
        return Instant.localYMD(noon.addingTimeInterval(Double(days) * 86_400), utc)
    }
}
