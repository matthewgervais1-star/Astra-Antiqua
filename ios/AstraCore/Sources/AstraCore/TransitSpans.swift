import Foundation

/// A natal point a transit can be measured against ("sun", "moon", "asc", "mc").
public struct NatalPoint: Sendable, Hashable {
    public let key: String
    public let longitude: Double

    public init(key: String, longitude: Double) {
        self.key = key
        self.longitude = longitude
    }
}

/// One exact pass of a transiting body over an angle to a natal point.
public struct TransitPeak: Sendable, Hashable {
    public let transitPlanet: Planet
    public let natalKey: String
    public let natalLongitude: Double
    public let kind: AspectKind
    public let date: Date
    public let transitSign: ZodiacSign
    public let transitDegree: Double

    public init(
        transitPlanet: Planet,
        natalKey: String,
        natalLongitude: Double,
        kind: AspectKind,
        date: Date,
        transitSign: ZodiacSign,
        transitDegree: Double
    ) {
        self.transitPlanet = transitPlanet
        self.natalKey = natalKey
        self.natalLongitude = natalLongitude
        self.kind = kind
        self.date = date
        self.transitSign = transitSign
        self.transitDegree = transitDegree
    }
}

/// A long transit as a span, not a moment: the stretch during which the
/// transiting body holds within `TransitSpans.spanOrb` degrees of exact, with
/// every exact pass, retrograde returns included, inside it. `id` is
/// "<transitPlanet>-<aspectKind>-<natalKey>", web's /transits/[id] param.
public struct TransitSpan: Sendable, Hashable, Identifiable {
    public let id: String
    public let transitPlanet: Planet
    public let natalKey: String
    public let natalLongitude: Double
    public let kind: AspectKind
    public let start: Date
    public let end: Date
    public let passes: [Date]
    public let transitSign: ZodiacSign
    public let transitDegree: Double

    public init(
        id: String,
        transitPlanet: Planet,
        natalKey: String,
        natalLongitude: Double,
        kind: AspectKind,
        start: Date,
        end: Date,
        passes: [Date],
        transitSign: ZodiacSign,
        transitDegree: Double
    ) {
        self.id = id
        self.transitPlanet = transitPlanet
        self.natalKey = natalKey
        self.natalLongitude = natalLongitude
        self.kind = kind
        self.start = start
        self.end = end
        self.passes = passes
        self.transitSign = transitSign
        self.transitDegree = transitDegree
    }
}

/// How a span reads: ease or tension (web's spanTone).
public enum SpanTone: Sendable, Hashable {
    case ease, tension
}

/// Port of web/src/lib/transitSpans.ts and findMajorTransits in
/// web/src/lib/yearForecast.ts, rule for rule, by way of the C# core's
/// TransitSpans. The three-degree rule is the one the method page publishes.
public enum TransitSpans {
    /// Degrees either side of exact that a span still counts inside.
    public static let spanOrb: Double = 3

    private static let walkStepDays = 5
    private static let walkCapDays = 700

    private static func separation(_ a: Double, _ b: Double) -> Double {
        let raw = abs(a - b).truncatingRemainder(dividingBy: 360)
        return raw > 180 ? 360 - raw : raw
    }

    private static func signedDiff(_ longitude: Double, _ target: Double) -> Double {
        var diff = longitude - target
        while diff > 180 { diff -= 360 }
        while diff < -180 { diff += 360 }
        return diff
    }

    /// Web's binarySearchLongitudeTarget: bisects on double milliseconds and
    /// reads the sky at the truncated instant. The low side's difference is
    /// read once and never refreshed, as on web.
    private static func binarySearchLongitudeTarget(_ planet: Planet, _ target: Double, _ lo: Double, _ hi: Double) -> Double {
        var loTime = lo
        var hiTime = hi
        let loDiff = signedDiff(Ephemeris.longitudeAtMs(planet, lo), target)
        for _ in 0..<32 {
            let mid = (loTime + hiTime) / 2
            let midDiff = signedDiff(Ephemeris.longitudeAtMs(planet, mid), target)
            if loDiff * midDiff <= 0 { hiTime = mid } else { loTime = mid }
            if hiTime - loTime < 60 * 1000 { break }
        }
        return (loTime + hiTime) / 2
    }

    /// Sorts by a date, keeping equal dates in their input order, as LINQ's
    /// OrderBy and JavaScript's Array.prototype.sort do.
    private static func stableSorted<T>(_ items: [T], by key: (T) -> Date) -> [T] {
        items.enumerated()
            .sorted { lhs, rhs in
                let a = key(lhs.element)
                let b = key(rhs.element)
                if a != b { return a < b }
                return lhs.offset < rhs.offset
            }
            .map { $0.element }
    }

    /// Every exact pass of each transit planet over each angle to each natal
    /// point in the window, confirmed to half a degree (web's findMajorTransits).
    /// The received bodies are sampled every eight days, the rest every two.
    public static func findExactPasses(
        natalPoints: [NatalPoint],
        transitPlanets: [Planet],
        start: Date,
        days: Int
    ) -> [TransitPeak] {
        let startMs = Instant.toMs(start)
        var output: [TransitPeak] = []
        for planet in transitPlanets {
            let sampleDays = planet.isReceived ? 8 : 2
            for point in natalPoints {
                for kind in AspectKind.allCases {
                    let angle = kind.angle
                    let targets: [Double] = (angle == 0 || angle == 180)
                        ? [ZodiacMath.normalize(point.longitude + angle)]
                        : [
                            ZodiacMath.normalize(point.longitude + angle),
                            ZodiacMath.normalize(point.longitude - angle),
                        ]
                    for target in targets {
                        var prev = startMs
                        var prevDiff = signedDiff(Ephemeris.longitudeAtMs(planet, prev), target)
                        var d = sampleDays
                        while d <= days {
                            let date = startMs + Double(d) * Instant.msPerDay
                            let diff = signedDiff(Ephemeris.longitudeAtMs(planet, date), target)
                            if prevDiff * diff < 0 && abs(prevDiff - diff) < 30 {
                                let exact = Instant.fromMs(binarySearchLongitudeTarget(planet, target, prev, date))
                                let lonAtExact = Ephemeris.geocentricLongitude(planet, exact)
                                if abs(separation(lonAtExact, point.longitude) - angle) < 0.5 {
                                    let placed = ZodiacMath.longitudeToSign(lonAtExact)
                                    output.append(TransitPeak(
                                        transitPlanet: planet,
                                        natalKey: point.key,
                                        natalLongitude: point.longitude,
                                        kind: kind,
                                        date: exact,
                                        transitSign: placed.sign,
                                        transitDegree: placed.degree))
                                }
                            }
                            prev = date
                            prevDiff = diff
                            d += sampleDays
                        }
                    }
                }
            }
        }
        return stableSorted(output) { $0.date }
    }

    /// Walks from an exact pass in five-day steps until the body leaves
    /// `spanOrb`, capped at 700 days (web's walkEdge).
    private static func walkEdge(_ planet: Planet, _ natalLongitude: Double, _ kind: AspectKind, _ from: Date, _ direction: Int) -> Date {
        let fromMs = Instant.toMs(from)
        let angle = kind.angle
        var edge = from
        var step = 1
        while step * walkStepDays <= walkCapDays {
            let probe = Instant.fromMs(fromMs + Double(direction * step * walkStepDays) * Instant.msPerDay)
            let distance = abs(separation(Ephemeris.geocentricLongitude(planet, probe), natalLongitude) - angle)
            if distance > spanOrb { break }
            edge = probe
            step += 1
        }
        return edge
    }

    /// Groups the exact passes into spans (web's computeTransitSpans). Slow
    /// bodies triple-hit a degree across retrogradation; those passes share
    /// one span. Groups keep the order their first pass was seen in, then the
    /// spans sort by start.
    public static func compute(
        natalPoints: [NatalPoint],
        transitPlanets: [Planet],
        start: Date,
        days: Int
    ) -> [TransitSpan] {
        let peaks = findExactPasses(natalPoints: natalPoints, transitPlanets: transitPlanets, start: start, days: days)
        var groups: [(id: String, peaks: [TransitPeak])] = []
        var index: [String: Int] = [:]
        for peak in peaks {
            let id = "\(peak.transitPlanet.id)-\(peak.kind.id)-\(peak.natalKey)"
            if let at = index[id] {
                groups[at].peaks.append(peak)
            } else {
                index[id] = groups.count
                groups.append((id: id, peaks: [peak]))
            }
        }

        var spans: [TransitSpan] = []
        for group in groups {
            let ordered = stableSorted(group.peaks) { $0.date }
            let first = ordered[0]
            let last = ordered[ordered.count - 1]
            spans.append(TransitSpan(
                id: group.id,
                transitPlanet: first.transitPlanet,
                natalKey: first.natalKey,
                natalLongitude: first.natalLongitude,
                kind: first.kind,
                start: walkEdge(first.transitPlanet, first.natalLongitude, first.kind, first.date, -1),
                end: walkEdge(last.transitPlanet, last.natalLongitude, last.kind, last.date, 1),
                passes: ordered.map { $0.date },
                transitSign: first.transitSign,
                transitDegree: first.transitDegree))
        }
        return stableSorted(spans) { $0.start }
    }

    /// Trine and sextile read as ease, square and opposition as tension. A
    /// conjunction is ease only for Jupiter (web's spanTone).
    public static func tone(_ span: TransitSpan) -> SpanTone {
        switch span.kind {
        case .trine, .sextile: return .ease
        case .square, .opposition: return .tension
        case .conjunction: return span.transitPlanet == .jupiter ? .ease : .tension
        }
    }
}
