import Foundation

// The domain's vocabulary. Port of dotnet/AstraAntiqua.Core/Model. The raw
// values are web's ids, so a value round-trips through shared/content.

/// The five ancient cultures, in web's CULTURES order.
public enum Culture: String, CaseIterable, Codable, Sendable, Hashable {
    case egypt, greece, canaan, carthage, rome

    public var id: String { rawValue }

    public static func fromId(_ id: String) throws -> Culture {
        guard let c = Culture(rawValue: id) else { throw ContentError.unknown("culture", id) }
        return c
    }
}

/// The ten bodies: the classical seven plus Uranus, Neptune and Pluto as
/// received bodies. Declaration order is canonical (web's PLANETS).
public enum Planet: String, CaseIterable, Codable, Sendable, Hashable {
    case sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto

    public var id: String { rawValue }

    /// Web's RECEIVED_BODIES: no ancient culture named these three.
    public var isReceived: Bool { self == .uranus || self == .neptune || self == .pluto }

    /// Position in canonical order (0 = Sun).
    public var index: Int { Planet.allCases.firstIndex(of: self)! }

    public static func fromId(_ id: String) throws -> Planet {
        guard let p = Planet(rawValue: id) else { throw ContentError.unknown("planet", id) }
        return p
    }
}

/// The twelve signs from 0° Aries. Raw values are web's capitalised names.
public enum ZodiacSign: String, CaseIterable, Codable, Sendable, Hashable {
    case aries = "Aries", taurus = "Taurus", gemini = "Gemini", cancer = "Cancer"
    case leo = "Leo", virgo = "Virgo", libra = "Libra", scorpio = "Scorpio"
    case sagittarius = "Sagittarius", capricorn = "Capricorn", aquarius = "Aquarius", pisces = "Pisces"

    public var name: String { rawValue }

    /// 0 for Aries … 11 for Pisces.
    public var index: Int { ZodiacSign.allCases.firstIndex(of: self)! }

    public init(index: Int) { self = ZodiacSign.allCases[((index % 12) + 12) % 12] }

    public static func fromName(_ name: String) throws -> ZodiacSign {
        guard let s = ZodiacSign(rawValue: name) else { throw ContentError.unknown("zodiac sign", name) }
        return s
    }
}

/// The five aspect kinds, in the documented orb table's order.
public enum AspectKind: String, CaseIterable, Codable, Sendable, Hashable {
    case conjunction, sextile, square, trine, opposition

    public var id: String { rawValue }

    /// The exact angle of each kind.
    public var angle: Double {
        switch self {
        case .conjunction: return 0
        case .sextile: return 60
        case .square: return 90
        case .trine: return 120
        case .opposition: return 180
        }
    }

    /// Square and opposition read hard; trine and sextile soft.
    public var isHard: Bool { self == .square || self == .opposition }
    public var isSoft: Bool { self == .trine || self == .sextile }

    public static func fromId(_ id: String) throws -> AspectKind {
        guard let k = AspectKind(rawValue: id) else { throw ContentError.unknown("aspect kind", id) }
        return k
    }
}

/// One deity: the cultural mask for a planet (web types/deity.ts).
public struct Deity: Sendable, Hashable {
    public let planet: Planet
    public let culture: Culture
    public let name: String
    public let epithet: String
    public let note: String
    public let contested: Bool
}

/// One of the twelve houses (web data/houses.ts).
public struct HouseMeaning: Sendable, Hashable {
    public let house: Int
    public let ordinal: String
    public let title: String
    public let domain: String
    public let arena: String
}

/// Reference data for one sign (web data/zodiacSigns.ts).
public struct ZodiacSignRecord: Sendable, Hashable {
    public let sign: ZodiacSign
    public let symbol: String
    public let dates: String
    public let element: String
    public let modality: String
    public let traits: String
    public let blurb: String
}

/// One row of the documented orb table (web ASPECT_RULES).
public struct AspectRule: Sendable, Hashable {
    public let kind: AspectKind
    public let angle: Double
    public let orb: Double
}

/// A detected aspect between two bodies of one chart. `orb` is the
/// deviation from exactness, as on web.
public struct Aspect: Sendable, Hashable {
    public let a: Planet
    public let b: Planet
    public let kind: AspectKind
    public let exactAngle: Double
    public let orb: Double

    public init(a: Planet, b: Planet, kind: AspectKind, exactAngle: Double, orb: Double) {
        self.a = a; self.b = b; self.kind = kind; self.exactAngle = exactAngle; self.orb = orb
    }
}

/// What a culture's doorway prints under its name.
public struct CultureCopy: Sendable, Hashable {
    public let culture: Culture
    public let label: String
    public let tagline: String
    public let subtitle: String
}

/// A body's printed name and glyph character.
public struct PlanetCopy: Sendable, Hashable {
    public let planet: Planet
    public let label: String
    public let symbol: String
    public let received: Bool
}

/// One city of the offline birthplace list, with the IANA zone tz-lookup
/// gave it at export time.
public struct City: Sendable, Hashable, Identifiable {
    public let name: String
    public let country: String
    public let latitude: Double
    public let longitude: Double
    public let popular: Bool
    public let timeZone: String
    public var id: String { "\(name)|\(country)" }
}

/// One culture's flat ground and muted accent, as "#rrggbb".
public struct Palette: Sendable, Hashable {
    public let ground: String
    public let accent: String
}

public struct MethodSection: Sendable, Hashable {
    public let heading: String
    public let paragraphs: [String]
}

public struct InterpretiveNote: Sendable, Hashable {
    public let id: String
    public let cultures: [Culture]
    public let title: String
    public let body: String
}

public struct SourceReference: Sendable, Hashable {
    public let author: String
    public let title: String
    public let detail: String
}

public struct MethodContent: Sendable, Hashable {
    public let sections: [MethodSection]
    public let notes: [InterpretiveNote]
    public let sources: [SourceReference]
}

public enum GlyphStatus: String, Sendable, Hashable {
    case attested, composed, invented
}

/// One stroke or fill of a glyph on its 24-unit grid. `data` is SVG path
/// data in explicit form (one command letter per segment).
public struct GlyphPath: Sendable, Hashable {
    public let data: String
    public let fill: Bool
    public let stroke: Bool
    public let strokeWidth: Double
    public let lineCap: String
    public let lineJoin: String
}

/// The glyph a culture draws for a body, with its honesty status.
public struct DeityGlyph: Sendable, Hashable {
    public let culture: Culture
    public let planet: Planet
    public let deity: String
    public let status: GlyphStatus
    public let paths: [GlyphPath]
}

/// One block of a Learn section: "head", "divider", "heading" or "para".
public struct LearnBlock: Sendable, Hashable {
    public let kind: String
    public let text: String
    public let kicker: String?
}

public struct LearnSection: Sendable, Hashable, Identifiable {
    public let n: Int
    public let title: String
    public let href: String
    public let blurb: String
    public let table: String?
    public let blocks: [LearnBlock]
    public var id: Int { n }
}

public struct PlanetVerb: Sendable, Hashable {
    public let symbol: String
    public let name: String
    public let verb: String
}

public struct HouseSystem: Sendable, Hashable {
    public let name: String
    public let age: String
    public let body: String
    public let ours: Bool
}

public struct CultureKind: Hashable, Sendable {
    public let culture: Culture
    public let kind: AspectKind
    public init(_ culture: Culture, _ kind: AspectKind) { self.culture = culture; self.kind = kind }
}

public struct LearnContent: Sendable {
    public let sections: [LearnSection]
    public let planetVerbs: [PlanetVerb]
    public let houseSystems: [HouseSystem]
    public let aspectRulings: [CultureKind: String]
    public let aspectGeometry: [AspectKind: String]
}

/// A missing or malformed piece of shared/content, named precisely.
public enum ContentError: Error, CustomStringConvertible {
    case unknown(String, String)
    case missingFile(String)
    case malformed(String, String)
    case incomplete(String, [String])

    public var description: String {
        switch self {
        case let .unknown(what, value): return "Unknown \(what): '\(value)'"
        case let .missingFile(name): return "shared/content file not found: \(name)"
        case let .malformed(file, detail): return "\(file) is malformed: \(detail)"
        case let .incomplete(file, gaps): return "\(file) is incomplete (\(gaps.count) cells): \(gaps.joined(separator: ", "))"
        }
    }
}
