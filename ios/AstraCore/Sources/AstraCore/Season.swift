import CAstronomy
import Foundation

/// The zodiac season: the window during which the Sun transits one whole
/// sign, bounded by the exact solar ingresses either side.
public struct SeasonWindow: Sendable, Hashable {
    public let sign: ZodiacSign
    public let start: Date
    public let end: Date
    public let dayOfSeason: Int
    public let totalDays: Int
    public let daysRemaining: Int

    public init(sign: ZodiacSign, start: Date, end: Date, dayOfSeason: Int, totalDays: Int, daysRemaining: Int) {
        self.sign = sign
        self.start = start
        self.end = end
        self.dayOfSeason = dayOfSeason
        self.totalDays = totalDays
        self.daysRemaining = daysRemaining
    }
}

/// The culture- and chart-independent beats of a season.
public struct SeasonSkyEvents: Sendable, Hashable {
    public let moonQuarters: [MoonQuarterEvent]
    public let eclipses: [EclipseEvent]
    public let stations: [StationEvent]
    public let ingresses: [IngressEvent]

    public init(moonQuarters: [MoonQuarterEvent], eclipses: [EclipseEvent], stations: [StationEvent], ingresses: [IngressEvent]) {
        self.moonQuarters = moonQuarters
        self.eclipses = eclipses
        self.stations = stations
        self.ingresses = ingresses
    }
}

/// Port of getCurrentSeason and getSeasonSkyEvents in web/src/lib/season.ts,
/// by way of the C# core's Season.
public enum Season {
    /// Over a season these are the bodies whose sign changes are worth naming.
    public static let ingressPlanets: [Planet] = [.mercury, .venus, .mars]

    /// Days past the window every finder scans, so the coarsest sampling step
    /// (Mars, five days) still lands beyond the end. The overshoot is trimmed.
    private static let samplingPadDays = 6

    /// The season `utc` falls in. Day counting uses LOCAL calendar days in
    /// `zone`, because the screen prints the counter beside local dates: day
    /// one is the calendar day the ingress renders as, not the first
    /// twenty-four hours after it.
    public static func current(_ utc: Date, zone: TimeZone) -> SeasonWindow {
        let ms = Instant.toMs(utc)
        let sign = ZodiacMath.longitudeToSign(Ephemeris.longitudeAtMs(.sun, ms)).sign
        let signIdx = sign.index
        let startTarget = Double(signIdx) * 30.0
        let endTarget = Double((signIdx + 1) % 12) * 30.0

        let searchFrom = Ephemeris.astroTime(Instant.fromMs(ms - 40 * Instant.msPerDay))
        let searchAt = Ephemeris.astroTime(Instant.fromMs(ms))
        let startHit = withAstronomy { Astronomy_SearchSunLongitude(startTarget, searchFrom, 45) }
        let endHit = withAstronomy { Astronomy_SearchSunLongitude(endTarget, searchAt, 45) }

        let start = startHit.status == ASTRO_SUCCESS
            ? Ephemeris.jsDate(startHit.time)
            : Instant.fromMs(ms - 15 * Instant.msPerDay)
        let end = endHit.status == ASTRO_SUCCESS
            ? Ephemeris.jsDate(endHit.time)
            : Instant.fromMs(ms + 15 * Instant.msPerDay)
        let at = Instant.fromMs(ms)

        let totalDays = max(1, localDayIndex(start, end, zone: zone) + 1)
        let dayOfSeason = min(totalDays, max(1, localDayIndex(start, at, zone: zone) + 1))
        return SeasonWindow(
            sign: sign,
            start: start,
            end: end,
            dayOfSeason: dayOfSeason,
            totalDays: totalDays,
            daysRemaining: max(0, totalDays - dayOfSeason))
    }

    /// Whole local calendar days from one instant's date to another's.
    ///
    /// Each instant is read as a wall-clock date in `zone`, and the two dates
    /// are differenced as dates (noon UTC of each), so a clock change between
    /// them, or a midnight the zone skips, never shortens the count.
    public static func localDayIndex(_ from: Date, _ to: Date, zone: TimeZone) -> Int {
        let a = Instant.localYMD(from, zone)
        let b = Instant.localYMD(to, zone)
        let aMs = Instant.toMs(Instant.noonUTC(year: a.year, month: a.month, day: a.day))
        let bMs = Instant.toMs(Instant.noonUTC(year: b.year, month: b.month, day: b.day))
        return Int(((bMs - aMs) / Instant.msPerDay).rounded())
    }

    /// One scan of the sky across the window, trimmed to its end.
    public static func skyEventsIn(_ window: SeasonWindow) -> SeasonSkyEvents {
        let spanMs = Instant.toMs(window.end) - Instant.toMs(window.start)
        let days = Int((spanMs / Instant.msPerDay).rounded(.up)) + samplingPadDays
        return SeasonSkyEvents(
            moonQuarters: SkyEvents.moonQuarters(window.start, days: days).filter { $0.date <= window.end },
            eclipses: SkyEvents.eclipses(window.start, days: days).filter { $0.date <= window.end },
            stations: SkyEvents.stations(window.start, days: days).filter { $0.date <= window.end },
            ingresses: SkyEvents.ingresses(window.start, days: days, planets: ingressPlanets)
                .filter { $0.date <= window.end })
    }
}
