import Foundation

/// One line of the sky's own calendar, whatever kind of event it is.
public struct SkyLine: Sendable, Hashable {
    public let date: Date
    public let kind: String
    public let body: Planet
    public let sign: ZodiacSign
    public let text: String

    public init(date: Date, kind: String, body: Planet, sign: ZodiacSign, text: String) {
        self.date = date
        self.kind = kind
        self.body = body
        self.sign = sign
        self.text = text
    }
}

/// The year ahead read against one chart (web's /forecast).
public struct ForecastYear: Sendable, Hashable {
    public let now: Date
    public let solarReturn: SolarReturnEvent?
    public let spans: [TransitSpan]
    public let stations: [StationEvent]

    public init(now: Date, solarReturn: SolarReturnEvent?, spans: [TransitSpan], stations: [StationEvent]) {
        self.now = now
        self.solarReturn = solarReturn
        self.spans = spans
        self.stations = stations
    }
}

/// The windows each horizon reads, in one place. They are the windows the
/// Android surface and web's hooks use, so the surfaces list the same events
/// for the same day. Port of the C# core's Horizons.
public enum Horizons {
    /// Long transits start this far behind today, so a span already under way is found.
    public static let spanLookbackDays = 420

    /// And cover this many days from there (web's useSpans window).
    public static let spanWindowDays = 1200

    public static let yearDays = 365

    /// Every long-transit span: the five slow bodies against Sun, Moon and Ascendant.
    public static func spans(chart: NatalChart, now: Date) -> [TransitSpan] {
        TransitSpans.compute(
            natalPoints: chart.transitPoints,
            transitPlanets: SkyEvents.slowBodies,
            start: Instant.addDays(now, -Double(spanLookbackDays)),
            days: spanWindowDays)
    }

    /// The year ahead: spans open at any point in the next twelve months,
    /// the stations inside them, and the solar return that opens the year.
    public static func forecast(chart: NatalChart, now: Date) -> ForecastYear {
        let yearEnd = Instant.addDays(now, Double(yearDays))
        let openSpans = spans(chart: chart, now: now).filter { $0.end >= now && $0.start <= yearEnd }
        guard let natalSun = chart.longitudes[.sun] else {
            preconditionFailure("Horizons.forecast: the chart has no longitude for the Sun")
        }
        return ForecastYear(
            now: now,
            solarReturn: SkyEvents.solarReturn(natalSun, from: now, limitDays: 400),
            spans: openSpans,
            stations: SkyEvents.stations(now, days: yearDays))
    }

    /// The sky's year from the first of this local month: every sign change but
    /// the Moon's (thirteen a year would bury the rest), every station and
    /// every eclipse. `start` is local midnight on the first of the month in
    /// `zone`; a midnight skipped by a clock change moves to the first valid
    /// instant, as JavaScript's Date does.
    public static func year(now: Date, zone: TimeZone) -> (
        start: Date,
        ingresses: [IngressEvent],
        stations: [StationEvent],
        eclipses: [EclipseEvent]
    ) {
        let local = Instant.localYMD(now, zone)
        let start = Instant.localMidnight(year: local.year, month: local.month, day: 1, zone)
        let bodies = Planet.allCases.filter { $0 != .moon }
        return (
            start: start,
            ingresses: SkyEvents.ingresses(start, days: yearDays, planets: bodies),
            stations: SkyEvents.stations(start, days: yearDays),
            eclipses: SkyEvents.eclipses(start, days: yearDays)
        )
    }
}
