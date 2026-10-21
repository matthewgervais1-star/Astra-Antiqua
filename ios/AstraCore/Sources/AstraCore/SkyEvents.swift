import CAstronomy
import Foundation

/// A body crossing from one sign into the next.
public struct IngressEvent: Sendable, Hashable {
    public let planet: Planet
    public let date: Date
    public let fromSign: ZodiacSign
    public let toSign: ZodiacSign

    public init(planet: Planet, date: Date, fromSign: ZodiacSign, toSign: ZodiacSign) {
        self.planet = planet
        self.date = date
        self.fromSign = fromSign
        self.toSign = toSign
    }
}

/// Which way a body turns at a station. Raw values are web's StationKind.
public enum StationKind: String, CaseIterable, Sendable, Hashable {
    case retrograde, direct
}

/// A body turning retrograde or direct.
public struct StationEvent: Sendable, Hashable {
    public let planet: Planet
    public let kind: StationKind
    public let date: Date
    public let sign: ZodiacSign
    public let degree: Double

    public init(planet: Planet, kind: StationKind, date: Date, sign: ZodiacSign, degree: Double) {
        self.planet = planet
        self.kind = kind
        self.date = date
        self.sign = sign
        self.degree = degree
    }
}

/// One of the Moon's four quarters.
public struct MoonQuarterEvent: Sendable, Hashable {
    public let name: String
    public let date: Date
    public let sign: ZodiacSign
    public let degree: Double

    public init(name: String, date: Date, sign: ZodiacSign, degree: Double) {
        self.name = name
        self.date = date
        self.sign = sign
        self.degree = degree
    }
}

/// Whether an eclipse is of the Moon or of the Sun. Raw values are web's EclipseScope.
public enum EclipseScope: String, CaseIterable, Sendable, Hashable {
    case lunar, solar
}

/// An eclipse at its peak. `kind` is web's EclipseKindName: "penumbral",
/// "partial", "annular" or "total".
public struct EclipseEvent: Sendable, Hashable {
    public let date: Date
    public let scope: EclipseScope
    public let kind: String
    public let obscuration: Double
    public let sign: ZodiacSign
    public let degree: Double

    public init(date: Date, scope: EclipseScope, kind: String, obscuration: Double, sign: ZodiacSign, degree: Double) {
        self.date = date
        self.scope = scope
        self.kind = kind
        self.obscuration = obscuration
        self.sign = sign
        self.degree = degree
    }
}

/// The moment the Sun returns to its natal degree.
public struct SolarReturnEvent: Sendable, Hashable {
    public let date: Date
    public let natalSunLongitude: Double
    public let sign: ZodiacSign
    public let degree: Double

    public init(date: Date, natalSunLongitude: Double, sign: ZodiacSign, degree: Double) {
        self.date = date
        self.natalSunLongitude = natalSunLongitude
        self.sign = sign
        self.degree = degree
    }
}

/// What the sky does on its own, apart from any chart. A port of the finders
/// in web/src/lib/yearForecast.ts, step for step: each body is sampled at
/// web's cadence, because the cadence decides whether a fast body's ingress
/// is found at all, and each crossing is narrowed by web's bisection.
/// Port of the C# core's SkyEvents.
public enum SkyEvents {
    private static let quarterNames = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"]

    private static let retrogradePlanets: [Planet] = [
        .mercury, .venus, .mars, .jupiter,
        .saturn, .uranus, .neptune, .pluto,
    ]

    /// The five bodies slow enough that a transit reads as a span.
    public static let slowBodies: [Planet] = [.jupiter, .saturn, .uranus, .neptune, .pluto]

    /// Web's sign index: floor of the wrapped longitude over 30.
    private static func signIndex(_ longitude: Double) -> Int {
        let wrapped = (longitude.truncatingRemainder(dividingBy: 360) + 360).truncatingRemainder(dividingBy: 360)
        return Int((wrapped / 30).rounded(.down))
    }

    /// Days between samples when scanning a body for sign changes.
    private static func ingressSampleDays(_ planet: Planet) -> Int {
        switch planet {
        case .moon: return 1
        case .sun, .mercury, .venus: return 2
        case .mars: return 5
        case .uranus, .neptune, .pluto: return 20
        default: return 14
        }
    }

    /// Web's bisection on double milliseconds: stops within half an hour and
    /// returns the later bound, the first instant found in the new sign.
    private static func findIngressBetween(_ planet: Planet, _ lo: Double, _ hi: Double) -> Double {
        var loTime = lo
        var hiTime = hi
        let loIdx = signIndex(Ephemeris.longitudeAtMs(planet, lo))
        for _ in 0..<40 {
            let mid = (loTime + hiTime) / 2
            if signIndex(Ephemeris.longitudeAtMs(planet, mid)) == loIdx {
                loTime = mid
            } else {
                hiTime = mid
            }
            if hiTime - loTime < 30 * 60 * 1000 { break }
        }
        return hiTime
    }

    /// Every sign change in the window, for the bodies asked about (web's
    /// findYearIngresses). With no bodies given, all ten in canonical order.
    public static func ingresses(_ start: Date, days: Int, planets: [Planet]? = nil) -> [IngressEvent] {
        let startMs = Instant.toMs(start)
        var output: [IngressEvent] = []
        for planet in planets ?? Planet.allCases {
            let step = ingressSampleDays(planet)
            var prev = startMs
            var prevIdx = signIndex(Ephemeris.longitudeAtMs(planet, prev))
            var d = step
            while d <= days {
                let next = startMs + Double(d) * Instant.msPerDay
                let nextIdx = signIndex(Ephemeris.longitudeAtMs(planet, next))
                if nextIdx != prevIdx {
                    let exact = findIngressBetween(planet, prev, next)
                    output.append(IngressEvent(
                        planet: planet,
                        date: Instant.fromMs(exact),
                        fromSign: ZodiacMath.longitudeToSign(Ephemeris.longitudeAtMs(planet, prev)).sign,
                        toSign: ZodiacMath.longitudeToSign(Ephemeris.longitudeAtMs(planet, next)).sign))
                }
                prev = next
                prevIdx = nextIdx
                d += step
            }
        }
        return sortedByDate(output) { $0.date }
    }

    /// Web's bisection for a station: velocity read at truncated instants,
    /// stopping within a minute, returning the midpoint of the last bracket.
    private static func binarySearchStation(_ planet: Planet, _ lo: Double, _ hi: Double) -> Double {
        var loT = lo
        var hiT = hi
        var loV = Ephemeris.velocity(planet, ms: lo.rounded(.towardZero))
        for _ in 0..<32 {
            let midT = (loT + hiT) / 2
            let midV = Ephemeris.velocity(planet, ms: midT.rounded(.towardZero))
            if loV * midV <= 0 {
                hiT = midT
            } else {
                loT = midT
                loV = midV
            }
            if hiT - loT < 60 * 1000 { break }
        }
        return (loT + hiT) / 2
    }

    /// Every turn retrograde or direct in the window (web's findRetrogradeStations).
    public static func stations(_ start: Date, days: Int) -> [StationEvent] {
        let startMs = Instant.toMs(start)
        var output: [StationEvent] = []
        for planet in retrogradePlanets {
            let step: Int
            switch planet {
            case .uranus, .neptune, .pluto: step = 5
            case .saturn, .jupiter: step = 3
            default: step = 1
            }
            var prev = startMs
            var prevVel = Ephemeris.velocity(planet, ms: prev)
            var d = step
            while d <= days {
                let dateMs = startMs + Double(d) * Instant.msPerDay
                let vel = Ephemeris.velocity(planet, ms: dateMs)
                if prevVel * vel < 0 {
                    let exact = Instant.fromMs(binarySearchStation(planet, prev, dateMs))
                    let (sign, degree) = ZodiacMath.longitudeToSign(Ephemeris.geocentricLongitude(planet, exact))
                    output.append(StationEvent(
                        planet: planet,
                        kind: prevVel > 0 ? .retrograde : .direct,
                        date: exact,
                        sign: sign,
                        degree: degree))
                }
                prev = dateMs
                prevVel = vel
                d += step
            }
        }
        return sortedByDate(output) { $0.date }
    }

    /// The Moon's quarters in the window, from the library's own search
    /// (web's findMoonPhases). A failed search ends the list.
    public static func moonQuarters(_ start: Date, days: Int) -> [MoonQuarterEvent] {
        let end = Instant.addDays(start, Double(days))
        var output: [MoonQuarterEvent] = []
        let startTime = Ephemeris.astroTime(start)
        var q = withAstronomy { Astronomy_SearchMoonQuarter(startTime) }
        let maxIter = Int((Double(days) / 7.0).rounded(.up)) + 4
        for _ in 0..<max(0, maxIter) {
            guard q.status == ASTRO_SUCCESS else { break }
            let date = Ephemeris.jsDate(q.time)
            if date >= end { break }
            let (sign, degree) = ZodiacMath.longitudeToSign(Ephemeris.geocentricLongitude(.moon, date))
            let quarter = Int(q.quarter)
            let name = quarter >= 0 && quarter < quarterNames.count ? quarterNames[quarter] : "New Moon"
            output.append(MoonQuarterEvent(name: name, date: date, sign: sign, degree: degree))
            let current = q
            q = withAstronomy { Astronomy_NextMoonQuarter(current) }
        }
        return output
    }

    /// Web's kindToName; anything unrecognised reads as partial.
    private static func eclipseKindName(_ kind: astro_eclipse_kind_t) -> String {
        if kind == ECLIPSE_PENUMBRAL { return "penumbral" }
        if kind == ECLIPSE_PARTIAL { return "partial" }
        if kind == ECLIPSE_ANNULAR { return "annular" }
        if kind == ECLIPSE_TOTAL { return "total" }
        return "partial"
    }

    /// Lunar and global solar eclipses in the window (web's findEclipses).
    /// A failed search ends that scope's list.
    public static func eclipses(_ start: Date, days: Int) -> [EclipseEvent] {
        let end = Instant.addDays(start, Double(days))
        var output: [EclipseEvent] = []
        let startTime = Ephemeris.astroTime(start)

        var lunar = withAstronomy { Astronomy_SearchLunarEclipse(startTime) }
        for _ in 0..<12 {
            guard lunar.status == ASTRO_SUCCESS else { break }
            let date = Ephemeris.jsDate(lunar.peak)
            if date >= end { break }
            let (sign, degree) = ZodiacMath.longitudeToSign(Ephemeris.geocentricLongitude(.moon, date))
            output.append(EclipseEvent(
                date: date,
                scope: .lunar,
                kind: eclipseKindName(lunar.kind),
                obscuration: finite(lunar.obscuration),
                sign: sign,
                degree: degree))
            let peak = lunar.peak
            lunar = withAstronomy { Astronomy_NextLunarEclipse(peak) }
        }

        var solar = withAstronomy { Astronomy_SearchGlobalSolarEclipse(startTime) }
        for _ in 0..<12 {
            guard solar.status == ASTRO_SUCCESS else { break }
            let date = Ephemeris.jsDate(solar.peak)
            if date >= end { break }
            let (sign, degree) = ZodiacMath.longitudeToSign(Ephemeris.geocentricLongitude(.sun, date))
            output.append(EclipseEvent(
                date: date,
                scope: .solar,
                kind: eclipseKindName(solar.kind),
                obscuration: finite(solar.obscuration),
                sign: sign,
                degree: degree))
            let peak = solar.peak
            solar = withAstronomy { Astronomy_NextGlobalSolarEclipse(peak) }
        }

        return sortedByDate(output) { $0.date }
    }

    /// The next time the Sun stands at the natal degree (web's
    /// findSolarReturn), or nil when the search finds none within `limitDays`.
    public static func solarReturn(_ natalSunLongitude: Double, from: Date, limitDays: Double = 400) -> SolarReturnEvent? {
        let target = ZodiacMath.normalize(natalSunLongitude)
        let startTime = Ephemeris.astroTime(from)
        let hit = withAstronomy { Astronomy_SearchSunLongitude(target, startTime, limitDays) }
        guard hit.status == ASTRO_SUCCESS else { return nil }
        let (sign, degree) = ZodiacMath.longitudeToSign(target)
        return SolarReturnEvent(date: Ephemeris.jsDate(hit.time), natalSunLongitude: target, sign: sign, degree: degree)
    }

    /// NaN and infinities read as zero: web's `obscuration ?? 0`, and the
    /// engine leaves a partial solar eclipse's obscuration undefined.
    private static func finite(_ value: Double) -> Double {
        value.isFinite ? value : 0
    }

    /// A stable sort on the date, as LINQ's OrderBy is: events on the same
    /// instant keep the order they were found in.
    private static func sortedByDate<T>(_ items: [T], _ date: (T) -> Date) -> [T] {
        items.enumerated()
            .sorted { lhs, rhs in
                let l = date(lhs.element), r = date(rhs.element)
                if l != r { return l < r }
                return lhs.offset < rhs.offset
            }
            .map { $0.element }
    }
}
