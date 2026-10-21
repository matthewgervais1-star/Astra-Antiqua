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
/// and its glyph, an ingress's body and sign, or nothing on a quiet day.
public struct WeekShorthand: Sendable, Hashable {
    public let kind: ShorthandKind
    public let a: Planet?
    public let aspect: AspectKind?
    public let b: Planet?
    public let exact: Bool
    public let planet: Planet?
    public let sign: ZodiacSign?

    public init(kind: ShorthandKind, a: Planet? = nil, aspect: AspectKind? = nil, b: Planet? = nil,
                exact: Bool = false, planet: Planet? = nil, sign: ZodiacSign? = nil) {
        self.kind = kind
        self.a = a
        self.aspect = aspect
        self.b = b
        self.exact = exact
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
    public let line: String
    public let shorthand: WeekShorthand
    public let tone: WeekTone
    /// Rome only: fastus, nefastus or comitialis. Nil for every other culture.
    public let flag: RomeDayFlag?

    /// The local calendar date as one value, shaped like Instant.localYMD's result.
    public var localDate: (year: Int, month: Int, day: Int) { (year, month, day) }

    public init(date: Date, year: Int, month: Int, day: Int, label: String, isToday: Bool, line: String,
                shorthand: WeekShorthand, tone: WeekTone, flag: RomeDayFlag?) {
        self.date = date
        self.year = year
        self.month = month
        self.day = day
        self.label = label
        self.isToday = isToday
        self.line = line
        self.shorthand = shorthand
        self.tone = tone
        self.flag = flag
    }
}

/// Port of buildWeekDays and composeAspectSentence in web/src/lib/weekReading.ts.
/// Each day's headline is the tightest sky aspect touching a fast mover,
/// inside 1.2°, marked exact under 0.35°; a pair that headlined earlier in
/// the week speaks again only when exact. Without one, an ingress that day;
/// without that, the culture's plain quiet line, and nothing invented.
public enum WeekReading {
    private static let eventOrb = 1.2
    private static let exactOrb = 0.35

    /// One ingress scan for the week, buffered past its end for the coarsest step.
    private static let ingressScanDays = 9

    private static let fastBodies: Set<Planet> = [.sun, .moon, .mercury, .venus, .mars]

    private static let utc = TimeZone(secondsFromGMT: 0)!

    private struct PlanetPair: Hashable {
        let a: Planet
        let b: Planet
    }

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

    /// "Hermes challenges Ares." A conjunction names the sign it happens in.
    /// `variant` picks the culture's exactness instrument and wraps, so two
    /// exact figures on one page do not carry the same marker.
    public static func composeAspectSentence(
        culture: Culture,
        a: Planet,
        b: Planet,
        kind: AspectKind,
        exact: Bool,
        chart: [Planet: Double],
        store: ContentStore,
        variant: Int = 0
    ) -> String {
        let banks = store.banks
        let deityA = store.deity(culture, a).name
        let deityB = store.deity(culture, b).name
        var signClause = ""
        if kind == .conjunction {
            let sign = ZodiacMath.longitudeToSign(chart[a]!).sign
            signClause = " in the " + Format.properCase(banks.signPhrase(sign))
        }
        let predicate = "\(banks.aspectVerb(culture, kind)) \(deityB)\(signClause)"
        if exact {
            return banks.exactForm(culture, variant: variant, subject: deityA, predicate: predicate)
        }
        return "\(deityA) \(predicate)."
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
        var usedPairs = Set<PlanetPair>()
        for i in 0..<7 {
            let dateLocal = addCalendarDays(startLocal, i)
            let noon = Instant.noonUTC(year: dateLocal.year, month: dateLocal.month, day: dateLocal.day)
            let chart = Ephemeris.computeChart(noon)

            let candidates = sortedByOrb(
                AspectDetector.detect(chart, rules: store.aspectRules).filter {
                    $0.orb < eventOrb && (fastBodies.contains($0.a) || fastBodies.contains($0.b))
                })
            var tightest: Aspect? = nil
            for aspect in candidates {
                let pair = PlanetPair(a: aspect.a, b: aspect.b)
                if usedPairs.contains(pair) && aspect.orb >= exactOrb { continue }
                tightest = aspect
                usedPairs.insert(pair)
                break
            }

            let dayStart = Instant.localMidnight(year: dateLocal.year, month: dateLocal.month, day: dateLocal.day, zone)
            let dayEnd = Instant.addDays(dayStart, 1)
            let dayIngress = weekIngresses.first { $0.date >= dayStart && $0.date < dayEnd }

            let line: String
            let shorthand: WeekShorthand
            let tone: WeekTone
            var exact = false

            if let figure = tightest {
                exact = figure.orb < exactOrb
                tone = figure.kind.isHard ? .tension : .harmony
                let astro = composeAspectSentence(
                    culture: culture, a: figure.a, b: figure.b, kind: figure.kind,
                    exact: exact, chart: chart, store: store)
                let ruling = banks.aspectFrame(
                    culture,
                    figure.kind,
                    banks.deityCharge(culture, figure.a),
                    banks.deityCharge(culture, figure.b))
                line = "\(astro) \(ruling)"
                shorthand = WeekShorthand(kind: .aspect, a: figure.a, aspect: figure.kind, b: figure.b, exact: exact)
            } else if let ingress = dayIngress {
                tone = .harmony
                let deity = store.deity(culture, ingress.planet).name
                let signWord = Format.properCase(banks.signPhrase(ingress.toSign))
                line = "\(deity) \(banks.ingressVerb(culture)) the \(signWord). "
                    + banks.ingressFrame(culture, banks.deityCharge(culture, ingress.planet))
                shorthand = WeekShorthand(kind: .ingress, planet: ingress.planet, sign: ingress.toSign)
            } else {
                tone = .quiet
                line = banks.quietLine(culture)
                shorthand = WeekShorthand(kind: .quiet)
            }

            let flag: RomeDayFlag?
            if culture == .rome {
                flag = tone == .tension ? (exact ? RomeDayFlag.N : RomeDayFlag.C) : RomeDayFlag.F
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
                label: "\(Format.weekday(noon, zone: utc)) \(dateLocal.day)",
                isToday: isToday,
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

    /// Ascending orb, ties kept in detection order (web's sort and C#'s
    /// OrderBy are both stable; Swift's sort is not promised to be).
    private static func sortedByOrb(_ aspects: [Aspect]) -> [Aspect] {
        aspects.enumerated()
            .sorted { lhs, rhs in
                lhs.element.orb != rhs.element.orb ? lhs.element.orb < rhs.element.orb : lhs.offset < rhs.offset
            }
            .map { $0.element }
    }
}
