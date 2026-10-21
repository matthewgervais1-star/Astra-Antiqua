import Foundation

/// One body in a cast chart.
public struct BodyPosition: Sendable, Hashable {
    public let planet: Planet
    public let longitude: Double
    public let sign: ZodiacSign
    public let degreeInSign: Double
    public let house: Int
    public let retrograde: Bool

    public init(planet: Planet, longitude: Double, sign: ZodiacSign, degreeInSign: Double, house: Int, retrograde: Bool) {
        self.planet = planet
        self.longitude = longitude
        self.sign = sign
        self.degreeInSign = degreeInSign
        self.house = house
        self.retrograde = retrograde
    }
}

/// A chart cast for an instant and a place: the ten longitudes, the angles,
/// whole-sign houses and the aspects, every rule the one web documents.
/// Port of the C# core's NatalChart; build one with `cast`.
public struct NatalChart: Sendable, Hashable {
    public let utc: Date
    public let latitude: Double
    public let longitude: Double
    public let longitudes: [Planet: Double]
    public let ascendant: Double
    public let midheaven: Double
    /// The ten bodies in canonical order (Planet.allCases).
    public let bodies: [BodyPosition]
    public let aspects: [Aspect]

    private init(
        utc: Date,
        latitude: Double,
        longitude: Double,
        longitudes: [Planet: Double],
        ascendant: Double,
        midheaven: Double,
        bodies: [BodyPosition],
        aspects: [Aspect]
    ) {
        self.utc = utc
        self.latitude = latitude
        self.longitude = longitude
        self.longitudes = longitudes
        self.ascendant = ascendant
        self.midheaven = midheaven
        self.bodies = bodies
        self.aspects = aspects
    }

    public var ascendantSign: ZodiacSign { ZodiacMath.longitudeToSign(ascendant).sign }

    public subscript(planet: Planet) -> BodyPosition { bodies[planet.index] }

    /// The houses 1...12 and the sign each holds.
    public var houses: [(house: Int, sign: ZodiacSign)] { WholeSignHouses.fromAscendant(ascendant) }

    /// The points long transits are read against: Sun, Moon, Ascendant.
    public var transitPoints: [NatalPoint] {
        [
            NatalPoint(key: "sun", longitude: longitudes[.sun]!),
            NatalPoint(key: "moon", longitude: longitudes[.moon]!),
            NatalPoint(key: "asc", longitude: ascendant),
        ]
    }

    public static func cast(_ utc: Date, latitude: Double, longitude: Double, rules: [AspectRule]) -> NatalChart {
        let longitudes = Ephemeris.computeChart(utc)
        let angles = AscendantCalculator.compute(utc, latitude: latitude, longitude: longitude)
        let ascIndex = ZodiacMath.longitudeToSign(angles.ascendant).sign.index
        let ms = Instant.toMs(utc)
        let bodies: [BodyPosition] = Planet.allCases.map { planet in
            let lon = longitudes[planet]!
            let placed = ZodiacMath.longitudeToSign(lon)
            let retrograde = planet != .sun && planet != .moon && Ephemeris.velocity(planet, ms: ms) < 0
            return BodyPosition(
                planet: planet,
                longitude: lon,
                sign: placed.sign,
                degreeInSign: placed.degree,
                house: WholeSignHouses.houseOfLongitude(lon, ascSignIndex: ascIndex),
                retrograde: retrograde)
        }
        return NatalChart(
            utc: utc,
            latitude: latitude,
            longitude: longitude,
            longitudes: longitudes,
            ascendant: angles.ascendant,
            midheaven: angles.midheaven,
            bodies: bodies,
            aspects: AspectDetector.detect(longitudes, rules: rules))
    }
}
