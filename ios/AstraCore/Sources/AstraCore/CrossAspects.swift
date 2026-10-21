import Foundation

/// A contact between a body in one chart and a body in another.
public struct CrossAspect: Sendable, Hashable {
    public let from: Planet
    public let to: Planet
    public let kind: AspectKind
    public let exactAngle: Double
    public let orb: Double

    public init(from: Planet, to: Planet, kind: AspectKind, exactAngle: Double, orb: Double) {
        self.from = from
        self.to = to
        self.kind = kind
        self.exactAngle = exactAngle
        self.orb = orb
    }
}

/// Aspects between two charts: synastry (web/src/lib/synastry.ts) and the
/// day's sky against a natal chart (web/src/lib/transits.ts). Both directions
/// count, so the pair is ordered: your Sun on their Saturn is not their Sun
/// on yours. Each pair takes the first matching rule of the one orb table.
/// Port of the C# core's CrossAspects.
public enum CrossAspects {
    private static func separation(_ a: Double, _ b: Double) -> Double {
        let raw = abs(a - b).truncatingRemainder(dividingBy: 360)
        return raw > 180 ? 360 - raw : raw
    }

    /// Every body of `from` against every body of `to`, both in canonical
    /// order, each pair taking the first matching rule and stopping there.
    /// Both charts must hold all ten bodies (the C# throws on a missing key).
    public static func compute(_ from: [Planet: Double], _ to: [Planet: Double], rules: [AspectRule]) -> [CrossAspect] {
        var output: [CrossAspect] = []
        for a in Planet.allCases {
            guard let fromLongitude = from[a] else {
                preconditionFailure("CrossAspects.compute: the first chart has no longitude for \(a.id)")
            }
            for b in Planet.allCases {
                guard let toLongitude = to[b] else {
                    preconditionFailure("CrossAspects.compute: the second chart has no longitude for \(b.id)")
                }
                let sep = separation(fromLongitude, toLongitude)
                for rule in rules {
                    let delta = abs(sep - rule.angle)
                    if delta <= rule.orb {
                        output.append(CrossAspect(from: a, to: b, kind: rule.kind, exactAngle: sep, orb: delta))
                        break
                    }
                }
            }
        }
        return output
    }

    /// Ascending by orb, ties kept in input order (the C#'s stable OrderBy).
    /// The index breaks ties so the order does not rest on the standard
    /// library's sort being stable.
    private static func byOrbStable(_ aspects: [CrossAspect]) -> [CrossAspect] {
        aspects.enumerated()
            .sorted { lhs, rhs in
                if lhs.element.orb != rhs.element.orb { return lhs.element.orb < rhs.element.orb }
                return lhs.offset < rhs.offset
            }
            .map { $0.element }
    }

    /// The tightest `count`, stable on ties (web's topSynastry).
    public static func tightest(_ aspects: [CrossAspect], count: Int) -> [CrossAspect] {
        Array(byOrbStable(aspects).prefix(max(0, count)))
    }

    /// The day's headline transits: the tightest hits, by default leaving out
    /// a body against its own natal place (web's topTransits).
    public static func topTransits(_ transits: [CrossAspect], count: Int = 5, excludeSelfPairs: Bool = true) -> [CrossAspect] {
        let pool = excludeSelfPairs ? transits.filter { $0.from != $0.to } : transits
        return Array(byOrbStable(pool).prefix(max(0, count)))
    }

    /// How much a moving body's touch matters, slowest heaviest (web's transitPlanetWeight).
    public static func transitWeight(_ planet: Planet) -> Double {
        switch planet {
        case .pluto: return 5
        case .uranus, .neptune: return 4.5
        case .saturn: return 4
        case .jupiter: return 3
        case .mars: return 2
        case .venus, .mercury: return 1.5
        default: return 1
        }
    }
}
