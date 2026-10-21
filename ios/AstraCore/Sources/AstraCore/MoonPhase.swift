import CAstronomy
import Foundation

/// The Moon's phase at an instant and the next quarter after it.
public struct MoonPhase: Sendable, Hashable {
    public let angle: Double
    public let illuminationFraction: Double
    public let name: String
    public let isWaxing: Bool
    public let nextQuarterName: String
    public let nextQuarterDate: Date

    public init(angle: Double, illuminationFraction: Double, name: String, isWaxing: Bool,
                nextQuarterName: String, nextQuarterDate: Date) {
        self.angle = angle
        self.illuminationFraction = illuminationFraction
        self.name = name
        self.isWaxing = isWaxing
        self.nextQuarterName = nextQuarterName
        self.nextQuarterDate = nextQuarterDate
    }
}

/// Port of web/src/lib/moonPhase.ts, by way of the C# core's MoonPhaseCalculator.
public enum MoonPhaseCalculator {
    /// The Moon's elongation from the Sun in [0, 360), read at the truncated
    /// instant of a JavaScript-style millisecond double.
    private static func phaseAngleAt(_ ms: Double) -> Double {
        let time = Ephemeris.astroTime(ms: ms)
        let longitudes: (sun: Double, moon: Double) = withAstronomy {
            let sun = Astronomy_SunPosition(time).elon
            let moon = Astronomy_EclipticGeoMoon(time).lon
            return (sun: sun, moon: moon)
        }
        return ZodiacMath.normalize(longitudes.moon - longitudes.sun)
    }

    private static func nameForAngle(_ angle: Double) -> String {
        let a = ZodiacMath.normalize(angle)
        if a < 22.5 { return "New Moon" }
        if a < 67.5 { return "Waxing Crescent" }
        if a < 112.5 { return "First Quarter" }
        if a < 157.5 { return "Waxing Gibbous" }
        if a < 202.5 { return "Full Moon" }
        if a < 247.5 { return "Waning Gibbous" }
        if a < 292.5 { return "Last Quarter" }
        if a < 337.5 { return "Waning Crescent" }
        return "New Moon"
    }

    private static func nextQuarterAngle(_ currentAngle: Double) -> (angle: Double, name: String) {
        let a = ZodiacMath.normalize(currentAngle)
        if a < 90 { return (90, "First Quarter") }
        if a < 180 { return (180, "Full Moon") }
        if a < 270 { return (270, "Last Quarter") }
        return (360, "New Moon")
    }

    /// Six-hour steps to the crossing, then thirty halvings: web's searchForAngle.
    /// The halvings run on double milliseconds and read the sky at the
    /// truncated instant, as web's do.
    private static func searchForAngle(_ startMs: Double, _ targetAngle: Double) -> Double {
        let stepMs = 6 * Instant.msPerHour
        let maxIterations = 4 * 40
        var prev = startMs
        var prevDelta = ZodiacMath.normalize(phaseAngleAt(prev) - targetAngle)
        for _ in 0..<maxIterations {
            let next = prev.rounded(.towardZero) + stepMs
            let nextDelta = ZodiacMath.normalize(phaseAngleAt(next) - targetAngle)
            if prevDelta > 270 && nextDelta < 90 {
                var lo = prev.rounded(.towardZero)
                var hi = next
                for _ in 0..<30 {
                    let mid = (lo + hi) / 2
                    let midDelta = ZodiacMath.normalize(phaseAngleAt(mid) - targetAngle)
                    if midDelta > 270 {
                        lo = mid
                    } else {
                        hi = mid
                    }
                }
                return hi
            }
            prev = next
            prevDelta = nextDelta
        }
        return prev
    }

    /// The phase at `utc` and the first quarter crossing after it
    /// (web's computeMoonPhase).
    public static func compute(_ utc: Date) -> MoonPhase {
        let ms = Instant.toMs(utc)
        let angle = phaseAngleAt(ms)
        let illumination = (1 - cos(angle * Double.pi / 180.0)) / 2
        let next = nextQuarterAngle(angle)
        let nextMs = searchForAngle(ms, next.angle)
        return MoonPhase(
            angle: angle,
            illuminationFraction: illumination,
            name: nameForAngle(angle),
            isWaxing: angle < 180,
            nextQuarterName: next.name,
            nextQuarterDate: Instant.fromMs(nextMs))
    }
}
