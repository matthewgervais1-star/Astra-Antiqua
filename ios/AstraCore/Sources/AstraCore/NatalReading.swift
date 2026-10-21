import Foundation

/// One body's placement, masked by the culture in force.
public struct PlanetPlacement: Sendable, Hashable {
    public let planet: Planet
    public let longitude: Double
    public let sign: ZodiacSign
    public let degreeInSign: Double
    public let deityName: String
    public let deityEpithet: String
    public let domain: String
    public let culturalLine: String
    public let signReading: String

    public init(planet: Planet, longitude: Double, sign: ZodiacSign, degreeInSign: Double,
                deityName: String, deityEpithet: String, domain: String,
                culturalLine: String, signReading: String) {
        self.planet = planet
        self.longitude = longitude
        self.sign = sign
        self.degreeInSign = degreeInSign
        self.deityName = deityName
        self.deityEpithet = deityEpithet
        self.domain = domain
        self.culturalLine = culturalLine
        self.signReading = signReading
    }
}

/// One aspect of the chart, voiced by the two deities it joins.
public struct AspectReading: Sendable, Hashable {
    public let aspect: Aspect
    public let deityA: String
    public let deityB: String
    public let verbLine: String
    public let pairTheme: String
    public let culturalReflection: String

    public init(aspect: Aspect, deityA: String, deityB: String, verbLine: String,
                pairTheme: String, culturalReflection: String) {
        self.aspect = aspect
        self.deityA = deityA
        self.deityB = deityB
        self.verbLine = verbLine
        self.pairTheme = pairTheme
        self.culturalReflection = culturalReflection
    }
}

/// A natal reading in one culture's voice (web lib/reading.ts Reading).
public struct NatalReading: Sendable, Hashable {
    public let culture: Culture
    public let placements: [PlanetPlacement]
    public let aspects: [AspectReading]
    public let summary: String

    public init(culture: Culture, placements: [PlanetPlacement], aspects: [AspectReading], summary: String) {
        self.culture = culture
        self.placements = placements
        self.aspects = aspects
        self.summary = summary
    }
}

/// Port of buildReading in web/src/lib/reading.ts: the universal placement
/// text with the culture laid over it as a render-time mask (deity names, the
/// myth line, the aspect verbs and reflections), plus the one-paragraph
/// summary. Every fragment comes from the shared corpus.
public enum NatalReadingBuilder {
    /// Builds the reading for a chart of longitudes. The chart must hold all
    /// ten bodies; a missing body is a programming error and traps.
    public static func build(culture: Culture, chart: [Planet: Double], store: ContentStore) -> NatalReading {
        let banks = store.banks

        let placements: [PlanetPlacement] = Planet.allCases.map { planet in
            let longitude = chart[planet]!
            let (sign, degree) = ZodiacMath.longitudeToSign(longitude)
            let deity = store.deity(culture, planet)
            return PlanetPlacement(
                planet: planet,
                longitude: longitude,
                sign: sign,
                degreeInSign: degree,
                deityName: deity.name,
                deityEpithet: deity.epithet,
                domain: banks.planetDomain(planet),
                culturalLine: banks.inscription(culture, planet),
                signReading: store.placementText(planet, sign))
        }

        let aspects: [AspectReading] = AspectDetector.detect(chart, rules: store.aspectRules).map { a in
            let deityA = store.deity(culture, a.a).name
            let deityB = store.deity(culture, a.b).name
            return AspectReading(
                aspect: a,
                deityA: deityA,
                deityB: deityB,
                verbLine: "\(deityA) \(banks.aspectVerb(culture, a.kind)) \(deityB).",
                pairTheme: banks.pairTheme(a.a, a.b),
                culturalReflection: banks.aspectReflection(culture, a.kind))
        }

        let harmony = aspects.filter { $0.aspect.kind.isSoft }.count
        let tension = aspects.filter { $0.aspect.kind.isHard }.count
        let fused = aspects.filter { $0.aspect.kind == .conjunction }.count
        let tone: String
        if tension > harmony {
            tone = banks.summaryTone("tension")
        } else if harmony > tension {
            tone = banks.summaryTone("harmony")
        } else {
            tone = banks.summaryTone("even")
        }
        let summary = "\(banks.summaryIntro(culture)) \(tone)\(banks.summaryFused(fused))"

        return NatalReading(culture: culture, placements: placements, aspects: aspects, summary: summary)
    }
}
