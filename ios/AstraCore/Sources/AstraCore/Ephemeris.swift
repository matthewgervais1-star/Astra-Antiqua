import CAstronomy
import Foundation

/// Every call into the C ephemeris goes through this lock. The C library keeps
/// process-wide caches (Pluto's among them) that are not safe to fill from two
/// threads at once, and the app computes off the main thread.
let astronomyLock = NSLock()

@inline(__always)
func withAstronomy<T>(_ body: () -> T) -> T {
    astronomyLock.lock()
    defer { astronomyLock.unlock() }
    return body()
}

/// Geocentric ecliptic longitudes for the ten bodies: a port of
/// web/src/lib/ephemeris.ts against the same upstream engine.
///
/// Frame contract: the library's heliocentric ecliptic-longitude helper is
/// never used. Sun and Moon come from their dedicated geocentric functions;
/// planets from an aberration-corrected geocentric vector turned ecliptic.
public enum Ephemeris {
    /// 2000-01-01T12:00:00Z in Unix milliseconds: the engine's day zero.
    static let j2000Ms: Double = 946_728_000_000

    /// The engine's time for a JavaScript-style millisecond instant.
    static func astroTime(ms: Double) -> astro_time_t {
        Astronomy_TimeFromDays((ms.rounded(.towardZero) - j2000Ms) / Instant.msPerDay)
    }

    static func astroTime(_ date: Date) -> astro_time_t { astroTime(ms: Instant.toMs(date)) }

    /// The instant JavaScript's AstroTime.date carries: J2000 plus ut days,
    /// truncated to a whole millisecond.
    static func jsDate(_ time: astro_time_t) -> Date {
        Instant.fromMs(j2000Ms + time.ut * Instant.msPerDay)
    }

    static func body(_ planet: Planet) -> astro_body_t {
        switch planet {
        case .sun: return BODY_SUN
        case .moon: return BODY_MOON
        case .mercury: return BODY_MERCURY
        case .venus: return BODY_VENUS
        case .mars: return BODY_MARS
        case .jupiter: return BODY_JUPITER
        case .saturn: return BODY_SATURN
        case .uranus: return BODY_URANUS
        case .neptune: return BODY_NEPTUNE
        case .pluto: return BODY_PLUTO
        }
    }

    /// The longitude at a JavaScript-style millisecond instant.
    public static func longitudeAtMs(_ planet: Planet, _ ms: Double) -> Double {
        let time = astroTime(ms: ms)
        return withAstronomy { () -> Double in
            switch planet {
            case .sun:
                return ZodiacMath.normalize(Astronomy_SunPosition(time).elon)
            case .moon:
                return ZodiacMath.normalize(Astronomy_EclipticGeoMoon(time).lon)
            default:
                let vector = Astronomy_GeoVector(body(planet), time, ABERRATION)
                return ZodiacMath.normalize(Astronomy_Ecliptic(vector).elon)
            }
        }
    }

    public static func geocentricLongitude(_ planet: Planet, _ date: Date) -> Double {
        longitudeAtMs(planet, Instant.toMs(date))
    }

    /// Signed motion in degrees per day, measured as web's planetVelocity
    /// does: the longitude an hour either side, unwrapped across 0°.
    /// Negative means retrograde.
    public static func velocity(_ planet: Planet, ms: Double) -> Double {
        let before = longitudeAtMs(planet, ms - Instant.msPerHour)
        let after = longitudeAtMs(planet, ms + Instant.msPerHour)
        var delta = after - before
        if delta > 180 { delta -= 360 }
        if delta < -180 { delta += 360 }
        return delta * (24.0 / 2.0)
    }

    public static func velocity(_ planet: Planet, _ date: Date) -> Double {
        velocity(planet, ms: Instant.toMs(date))
    }

    /// All ten longitudes at an instant.
    public static func computeChart(_ date: Date) -> [Planet: Double] {
        let ms = Instant.toMs(date)
        var chart: [Planet: Double] = [:]
        for planet in Planet.allCases { chart[planet] = longitudeAtMs(planet, ms) }
        return chart
    }

    /// Greenwich apparent sidereal time in hours.
    static func siderealTime(_ date: Date) -> Double {
        var time = astroTime(date)
        return withAstronomy { Astronomy_SiderealTime(&time) }
    }
}

/// Ascendant and Midheaven: a port of web/src/lib/ascendant.ts (Meeus chapter
/// 13 with the mean obliquity of J2000).
public enum AscendantCalculator {
    private static let meanObliquityDeg = 23.4392911
    private static let degToRad = Double.pi / 180
    private static let radToDeg = 180 / Double.pi

    public static func compute(_ date: Date, latitude: Double, longitude: Double) -> (ascendant: Double, midheaven: Double) {
        let gstHours = Ephemeris.siderealTime(date)
        let lstHours = ((gstHours + longitude / 15.0).truncatingRemainder(dividingBy: 24) + 24).truncatingRemainder(dividingBy: 24)
        let ramc = lstHours * 15.0 * degToRad
        let obl = meanObliquityDeg * degToRad
        let lat = latitude * degToRad

        let mc = ZodiacMath.normalize(atan2(sin(ramc), cos(ramc) * cos(obl)) * radToDeg)
        let numer = -cos(ramc)
        let denom = sin(ramc) * cos(obl) + tan(lat) * sin(obl)
        var asc = ZodiacMath.normalize(atan2(numer, denom) * radToDeg)
        // atan2 can land on the western horizon; the Ascendant must be east.
        if ZodiacMath.normalize(asc - mc) > 180 { asc = ZodiacMath.normalize(asc + 180) }
        return (asc, mc)
    }
}

/// 30-degree blocks from 0° Aries (web's longitudeToSign).
public enum ZodiacMath {
    /// Into [0, 360), as web does.
    public static func normalize(_ longitude: Double) -> Double {
        let wrapped = longitude.truncatingRemainder(dividingBy: 360)
        return wrapped < 0 ? wrapped + 360 : wrapped
    }

    /// The sign and the degree within it. Non-finite input is a programming
    /// error (web throws); it traps here rather than inventing an Aries.
    public static func longitudeToSign(_ longitude: Double) -> (sign: ZodiacSign, degree: Double) {
        precondition(longitude.isFinite, "longitudeToSign received a non-finite longitude: \(longitude)")
        let normalized = normalize(longitude)
        var index = Int((normalized / 30).rounded(.down))
        if index > 11 { index = 11 }
        return (ZodiacSign(index: index), normalized - Double(index) * 30)
    }
}

/// Whole-sign houses (web/src/lib/houses.ts): the whole rising sign is the
/// first house and each following sign the next.
public enum WholeSignHouses {
    public static func fromAscendant(_ ascendant: Double) -> [(house: Int, sign: ZodiacSign)] {
        let ascIndex = ZodiacMath.longitudeToSign(ascendant).sign.index
        return (0..<12).map { (house: $0 + 1, sign: ZodiacSign(index: ascIndex + $0)) }
    }

    public static func houseOfSign(_ sign: ZodiacSign, ascSignIndex: Int) -> Int {
        ((sign.index - ascSignIndex + 12) % 12) + 1
    }

    public static func houseOfLongitude(_ longitude: Double, ascSignIndex: Int) -> Int {
        houseOfSign(ZodiacMath.longitudeToSign(longitude).sign, ascSignIndex: ascSignIndex)
    }
}

/// Port of web's computeAspects: pairs in canonical order, each taking the
/// first matching rule and stopping there.
public enum AspectDetector {
    public static func separation(_ a: Double, _ b: Double) -> Double {
        let raw = abs(a - b).truncatingRemainder(dividingBy: 360)
        return raw > 180 ? 360 - raw : raw
    }

    public static func detect(_ chart: [Planet: Double], rules: [AspectRule]) -> [Aspect] {
        let planets = Planet.allCases.filter { chart[$0] != nil }
        var aspects: [Aspect] = []
        for i in 0..<planets.count {
            for j in (i + 1)..<planets.count where j < planets.count {
                let a = planets[i], b = planets[j]
                let angle = separation(chart[a]!, chart[b]!)
                for rule in rules {
                    let delta = abs(angle - rule.angle)
                    if delta <= rule.orb {
                        aspects.append(Aspect(a: a, b: b, kind: rule.kind, exactAngle: angle, orb: delta))
                        break
                    }
                }
            }
        }
        return aspects
    }
}
