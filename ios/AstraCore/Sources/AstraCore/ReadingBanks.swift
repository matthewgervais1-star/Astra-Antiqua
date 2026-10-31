import Foundation

/// The authored fragments the readings are composed from
/// (shared/content/reading-banks.json). Web writes several as functions; the
/// exporter turns each into a template with named slots, where "{a}" takes
/// the argument as given and "{A}" takes it with its first letter raised
/// (web's cap()). Filling a slot here reproduces web's sentence byte for
/// byte, which the horizon fixtures check. Port of the C# ReadingBanks.
public final class ReadingBanks: @unchecked Sendable {
    private let aspectVerbs: [CultureKind: String]
    private let plainAspectVerbs: [AspectKind: String]
    private let placementVerbs: [Culture: String]
    private let charges: [String: String]
    private let inscriptions: [String: String]
    private let ingressFrames: [Culture: String]
    private let ingressVerbs: [Culture: String]
    private let quietLines: [Culture: String]
    private let summaryIntros: [Culture: String]
    private let summaryTones: [String: String]
    private let summaryFusedOne: String
    private let summaryFusedMany: String
    private let planetDomains: [Planet: String]
    private let aspectReflections: [CultureKind: String]
    private let pairThemes: [String: String]
    private let pairThemeFallback: String
    private let signRegisters: [ZodiacSign: String]
    private let signPhrases: [ZodiacSign: String]
    private let signAbbreviations: [ZodiacSign: String]
    private let aspectGlyphs: [AspectKind: String]
    private let planetConcerns: [Planet: String]
    private let houseGroupNames: [String: String]
    private let seasonHouseLines: [String: String]

    /// The first character raised, as web's cap() does.
    public static func cap(_ s: String) -> String {
        guard let first = s.first else { return s }
        return first.uppercased() + s.dropFirst()
    }

    /// Fills a template's named slots: "{X}" (capitalised) then "{x}".
    public static func fill(_ template: String, _ values: [(Character, String)]) -> String {
        var result = template
        for (slot, value) in values {
            result = result.replacingOccurrences(of: "{\(String(slot).uppercased())}", with: cap(value))
            result = result.replacingOccurrences(of: "{\(slot)}", with: value)
        }
        return result
    }

    public func aspectVerb(_ culture: Culture, _ kind: AspectKind) -> String { aspectVerbs[CultureKind(culture, kind)]! }
    public func plainAspectVerb(_ kind: AspectKind) -> String { plainAspectVerbs[kind]! }
    public func placementVerb(_ culture: Culture) -> String { placementVerbs[culture]! }

    /// What a god brings before its institution: lowercase, written to sit mid-sentence.
    public func deityCharge(_ culture: Culture, _ planet: Planet) -> String { charges["\(culture.id)|\(planet.id)"]! }

    /// The line of myth under a deity's name in a natal reading.
    public func inscription(_ culture: Culture, _ planet: Planet) -> String { inscriptions["\(culture.id)|\(planet.id)"]! }

    public func ingressFrame(_ culture: Culture, _ charge: String) -> String {
        Self.fill(ingressFrames[culture]!, [("c", charge)])
    }

    public func ingressVerb(_ culture: Culture) -> String { ingressVerbs[culture]! }
    public func quietLine(_ culture: Culture) -> String { quietLines[culture]! }
    public func summaryIntro(_ culture: Culture) -> String { summaryIntros[culture]! }

    /// "tension", "harmony" or "even".
    public func summaryTone(_ key: String) -> String { summaryTones[key]! }

    public func summaryFused(_ count: Int) -> String {
        if count <= 0 { return "" }
        if count == 1 { return summaryFusedOne }
        return Self.fill(summaryFusedMany, [("n", String(count))])
    }

    public func planetDomain(_ planet: Planet) -> String { planetDomains[planet]! }
    public func aspectReflection(_ culture: Culture, _ kind: AspectKind) -> String { aspectReflections[CultureKind(culture, kind)]! }

    /// Web's getPairTheme: the pair keyed in sorted id order, with web's fallback.
    public func pairTheme(_ a: Planet, _ b: Planet) -> String {
        let ids = [a.id, b.id].sorted()
        return pairThemes["\(ids[0])|\(ids[1])"] ?? pairThemeFallback
    }

    public func signRegister(_ sign: ZodiacSign) -> String { signRegisters[sign]! }

    /// The sign's culture-neutral noun, in capitals as web stores it ("WATER-BEARER").
    public func signPhrase(_ sign: ZodiacSign) -> String { signPhrases[sign]! }
    public func signAbbreviation(_ sign: ZodiacSign) -> String { signAbbreviations[sign]! }
    public func aspectGlyph(_ kind: AspectKind) -> String { aspectGlyphs[kind]! }

    /// What a body brings into whatever house it lands in.
    public func planetConcern(_ planet: Planet) -> String { planetConcerns[planet]! }

    /// Web's houseReading: "{deity} turns {concern} toward {arena}."
    public func houseReading(deityName: String, planet: Planet, arena: String) -> String {
        "\(deityName) turns \(planetConcern(planet)) toward \(arena)."
    }

    /// The name a culture keeps a house's group under.
    public func houseGroupName(_ culture: Culture, _ house: Int) -> String { houseGroupNames["\(culture.id)|\(house)"]! }

    /// Web's line for the house the season's sign occupies in a chart.
    public func seasonHouseLine(_ culture: Culture, _ house: Int) -> String { seasonHouseLines["\(culture.id)|\(house)"]! }

    // MARK: Loading

    private struct DTO: Decodable {
        let aspectVerbs: [String: [String: String]]
        let plainAspectVerbs: [String: String]
        let placementVerbs: [String: String]
        let deityCharges: [String: [String: String]]
        let deityInscriptions: [String: [String: String]]
        let ingressFrames: [String: String]
        let ingressVerbs: [String: String]
        let quietLines: [String: String]
        let summaryIntros: [String: String]
        let summaryTones: [String: String]
        let summaryFused: Fused
        let planetDomains: [String: String]
        let aspectReflections: [String: [String: String]]
        let pairThemes: [String: String]
        let pairThemeFallback: String
        let signRegisters: [String: String]
        let signPhrases: [String: String]
        let signAbbreviations: [String: String]
        let aspectGlyphs: [String: String]
        let planetConcerns: [String: String]
        let houseGroupNames: [String: [String: String]]
        let seasonHouseLines: [String: [String: String]]
        struct Fused: Decodable { let one: String; let many: String }
    }

    private init(_ d: DTO) throws {
        func byCulture(_ m: [String: String]) throws -> [Culture: String] {
            var out: [Culture: String] = [:]
            for (k, v) in m {
                let key = try Culture.fromId(k)
                out[key] = v
            }
            return out
        }
        func byKind(_ m: [String: String]) throws -> [AspectKind: String] {
            var out: [AspectKind: String] = [:]
            for (k, v) in m {
                let key = try AspectKind.fromId(k)
                out[key] = v
            }
            return out
        }
        func byPlanet(_ m: [String: String]) throws -> [Planet: String] {
            var out: [Planet: String] = [:]
            for (k, v) in m {
                let key = try Planet.fromId(k)
                out[key] = v
            }
            return out
        }
        func bySign(_ m: [String: String]) throws -> [ZodiacSign: String] {
            var out: [ZodiacSign: String] = [:]
            for (k, v) in m {
                let key = try ZodiacSign.fromName(k)
                out[key] = v
            }
            return out
        }
        func cultureKind(_ m: [String: [String: String]]) throws -> [CultureKind: String] {
            var out: [CultureKind: String] = [:]
            for (c, inner) in m {
                let culture = try Culture.fromId(c)
                for (k, v) in inner {
                    let kind = try AspectKind.fromId(k)
                    out[CultureKind(culture, kind)] = v
                }
            }
            return out
        }
        func culturePlanet(_ m: [String: [String: String]]) throws -> [String: String] {
            var out: [String: String] = [:]
            for (c, inner) in m {
                let culture = try Culture.fromId(c)
                for (p, v) in inner {
                    let planet = try Planet.fromId(p)
                    out["\(culture.id)|\(planet.id)"] = v
                }
            }
            return out
        }
        func cultureHouse(_ m: [String: [String: String]]) throws -> [String: String] {
            var out: [String: String] = [:]
            for (c, inner) in m {
                let culture = try Culture.fromId(c)
                for (h, v) in inner { out["\(culture.id)|\(h)"] = v }
            }
            return out
        }

        aspectVerbs = try cultureKind(d.aspectVerbs)
        plainAspectVerbs = try byKind(d.plainAspectVerbs)
        placementVerbs = try byCulture(d.placementVerbs)
        charges = try culturePlanet(d.deityCharges)
        inscriptions = try culturePlanet(d.deityInscriptions)
        ingressFrames = try byCulture(d.ingressFrames)
        ingressVerbs = try byCulture(d.ingressVerbs)
        quietLines = try byCulture(d.quietLines)
        summaryIntros = try byCulture(d.summaryIntros)
        summaryTones = d.summaryTones
        summaryFusedOne = d.summaryFused.one
        summaryFusedMany = d.summaryFused.many
        planetDomains = try byPlanet(d.planetDomains)
        aspectReflections = try cultureKind(d.aspectReflections)
        pairThemes = d.pairThemes
        pairThemeFallback = d.pairThemeFallback
        signRegisters = try bySign(d.signRegisters)
        signPhrases = try bySign(d.signPhrases)
        signAbbreviations = try bySign(d.signAbbreviations)
        aspectGlyphs = try byKind(d.aspectGlyphs)
        planetConcerns = try byPlanet(d.planetConcerns)
        houseGroupNames = try cultureHouse(d.houseGroupNames)
        seasonHouseLines = try cultureHouse(d.seasonHouseLines)

        var missing: [String] = []
        for c in Culture.allCases {
            for p in Planet.allCases {
                if charges["\(c.id)|\(p.id)"] == nil { missing.append("charge \(c.id)/\(p.id)") }
                if inscriptions["\(c.id)|\(p.id)"] == nil { missing.append("inscription \(c.id)/\(p.id)") }
            }
            for k in AspectKind.allCases {
                let ck = CultureKind(c, k)
                if aspectVerbs[ck] == nil { missing.append("verb \(c.id)/\(k.id)") }
                if aspectReflections[ck] == nil { missing.append("reflection \(c.id)/\(k.id)") }
            }
            for (name, table) in [("ingress frame", ingressFrames), ("ingress verb", ingressVerbs), ("quiet line", quietLines),
                                  ("summary intro", summaryIntros), ("placement verb", placementVerbs)] where table[c] == nil {
                missing.append("\(name) \(c.id)")
            }
            for h in 1...12 {
                if houseGroupNames["\(c.id)|\(h)"] == nil { missing.append("house group \(c.id)/\(h)") }
                if seasonHouseLines["\(c.id)|\(h)"] == nil { missing.append("season line \(c.id)/\(h)") }
            }
        }
        for p in Planet.allCases {
            if planetDomains[p] == nil { missing.append("domain \(p.id)") }
            if planetConcerns[p] == nil { missing.append("concern \(p.id)") }
        }
        for s in ZodiacSign.allCases {
            if signPhrases[s] == nil { missing.append("sign phrase \(s.name)") }
            if signAbbreviations[s] == nil { missing.append("sign abbreviation \(s.name)") }
            if signRegisters[s] == nil { missing.append("sign register \(s.name)") }
        }
        for key in ["tension", "harmony", "even"] where summaryTones[key] == nil { missing.append("summary tone \(key)") }
        if pairThemes.count != 45 { missing.append("pair themes: expected 45, got \(pairThemes.count)") }
        if !missing.isEmpty { throw ContentError.incomplete("reading-banks.json", missing) }
    }

    static func load(from directory: URL) throws -> ReadingBanks {
        let url = directory.appendingPathComponent("reading-banks.json")
        guard let data = try? Data(contentsOf: url) else { throw ContentError.missingFile("reading-banks.json") }
        let dto: DTO
        do { dto = try JSONDecoder().decode(DTO.self, from: data) } catch {
            throw ContentError.malformed("reading-banks.json", String(describing: error))
        }
        return try ReadingBanks(dto)
    }
}
