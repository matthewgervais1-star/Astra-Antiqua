import Foundation

/// The banks the day page speaks with (shared/content/day-banks.json),
/// exported from web/src/data/decreeBanks.ts, deityDomains.ts,
/// cultureVoice.ts, scriptForms.ts, aspectRulings.ts, lib/decree.ts and
/// components/home/format.ts. The composer in DayDecree.swift fills them the
/// way web's lib/decree.ts does, so a figure prints the same sentence here as
/// on web. Only the parts the day page reads are decoded; the figure banks in
/// the same file wait for the figure page.
public final class DayBanks: @unchecked Sendable {
    /// One culture's decree bank (web's DecreeBank).
    public struct Decree: Sendable {
        public let headlines: [AspectKind: [Planet: String]]
        public let relations: [AspectKind: [String]]
        public let tightTails: [String]
        public let consequences: [AspectKind: [Planet: String]]
        public let images: [AspectKind: [Planet: String]]
        public let instructions: [AspectKind: [Planet: String]]
        public let secondFigure: [String]
        public let secondFigurePlain: [String]
        public let noSecondFigure: String
        public let comeBack: String
        public let holds: String
    }

    /// One of a culture's four house groups, fixed order.
    public struct HouseGroup: Sendable, Hashable {
        public let name: String
        public let sub: String
    }

    /// Fast bodies, fastest first: when both bodies of a figure are fast, the
    /// faster one headlines.
    public let fastOrder: [Planet]
    /// Under this orb a figure is tight (lib/decree.ts TIGHT_ORB).
    public let tightOrb: Double

    private let decrees: [Culture: Decree]
    private let quietHeadlines: [Culture: String]
    private let quietLines: [Culture: String]
    private let domains: [Culture: [Planet: String]]
    private let institutions: [Culture: String]
    private let weekTitles: [Culture: String]
    private let houseGroups: [Culture: [HouseGroup]]
    private let signImages: [ZodiacSign: String]
    private let aspectGlyphs: [AspectKind: String]

    public func decree(_ culture: Culture) -> Decree { decrees[culture]! }
    public func quietHeadline(_ culture: Culture) -> String { quietHeadlines[culture]! }
    public func quietLine(_ culture: Culture) -> String { quietLines[culture]! }

    /// What a body governs in the reader's life, in the culture's nouns.
    public func domain(_ culture: Culture, _ planet: Planet) -> String { domains[culture]![planet]! }

    /// "THE HALL OF MA’AT": the heading the day page's kicker carries.
    public func institution(_ culture: Culture) -> String { institutions[culture]! }

    /// "SEVEN DAYS WEIGHED": the week page's title (web's cultureVoice weekTitle).
    public func weekTitle(_ culture: Culture) -> String { weekTitles[culture]! }

    /// The culture's four house groups: work and substance, home and kin,
    /// words and errands, the inner court.
    public func houseGroups(_ culture: Culture) -> [HouseGroup] { houseGroups[culture]! }

    /// "LION": the figure a sign is named for, in capitals.
    public func signImage(_ sign: ZodiacSign) -> String { signImages[sign]! }

    /// The aspect's glyph as the decree's evidence line prints it.
    public func aspectGlyph(_ kind: AspectKind) -> String { aspectGlyphs[kind]! }

    // MARK: Loading

    private struct DecreeDTO: Decodable {
        let headlines: [String: [String: String]]
        let relations: [String: [String]]
        let tightTails: [String]
        let consequences: [String: [String: String]]
        let images: [String: [String: String]]
        let instructions: [String: [String: String]]
        let secondFigure: [String]
        let secondFigurePlain: [String]
        let noSecondFigure: String
        let comeBack: String
        let holds: String
    }

    private struct VoiceDTO: Decodable {
        struct Group: Decodable { let name, sub: String }
        let institution: String
        let weekTitle: String
        let houseGroups: [Group]
    }

    private struct DTO: Decodable {
        let fastOrder: [String]
        let tightOrb: Double
        let aspectGlyphs: [String: String]
        let decree: [String: DecreeDTO]
        let quietHeadlines: [String: String]
        let quietLines: [String: String]
        let deityDomains: [String: [String: String]]
        let cultureVoices: [String: VoiceDTO]
        let signImages: [String: String]
    }

    private init(_ d: DTO) throws {
        func kindPlanet(_ m: [String: [String: String]]) throws -> [AspectKind: [Planet: String]] {
            var out: [AspectKind: [Planet: String]] = [:]
            for (k, inner) in m {
                var row: [Planet: String] = [:]
                for (p, v) in inner { row[try Planet.fromId(p)] = v }
                out[try AspectKind.fromId(k)] = row
            }
            return out
        }
        func byCulture(_ m: [String: String]) throws -> [Culture: String] {
            var out: [Culture: String] = [:]
            for (k, v) in m { out[try Culture.fromId(k)] = v }
            return out
        }

        fastOrder = try d.fastOrder.map { try Planet.fromId($0) }
        tightOrb = d.tightOrb
        var glyphs: [AspectKind: String] = [:]
        for (k, v) in d.aspectGlyphs { glyphs[try AspectKind.fromId(k)] = v }
        aspectGlyphs = glyphs

        var decrees: [Culture: Decree] = [:]
        for (c, b) in d.decree {
            var relations: [AspectKind: [String]] = [:]
            for (k, list) in b.relations { relations[try AspectKind.fromId(k)] = list }
            decrees[try Culture.fromId(c)] = Decree(
                headlines: try kindPlanet(b.headlines),
                relations: relations,
                tightTails: b.tightTails,
                consequences: try kindPlanet(b.consequences),
                images: try kindPlanet(b.images),
                instructions: try kindPlanet(b.instructions),
                secondFigure: b.secondFigure,
                secondFigurePlain: b.secondFigurePlain,
                noSecondFigure: b.noSecondFigure,
                comeBack: b.comeBack,
                holds: b.holds)
        }
        self.decrees = decrees
        quietHeadlines = try byCulture(d.quietHeadlines)
        quietLines = try byCulture(d.quietLines)

        var domains: [Culture: [Planet: String]] = [:]
        for (c, inner) in d.deityDomains {
            var row: [Planet: String] = [:]
            for (p, v) in inner { row[try Planet.fromId(p)] = v }
            domains[try Culture.fromId(c)] = row
        }
        self.domains = domains

        var institutions: [Culture: String] = [:]
        var weekTitles: [Culture: String] = [:]
        var groups: [Culture: [HouseGroup]] = [:]
        for (c, voice) in d.cultureVoices {
            let culture = try Culture.fromId(c)
            institutions[culture] = voice.institution
            weekTitles[culture] = voice.weekTitle
            groups[culture] = voice.houseGroups.map { HouseGroup(name: $0.name, sub: $0.sub) }
        }
        self.institutions = institutions
        self.weekTitles = weekTitles
        houseGroups = groups

        var images: [ZodiacSign: String] = [:]
        for (s, v) in d.signImages { images[try ZodiacSign.fromName(s)] = v }
        signImages = images

        var missing: [String] = []
        let fast: [Planet] = [.sun, .moon, .mercury, .venus, .mars]
        if Set(fastOrder) != Set(fast) { missing.append("fast order") }
        for c in Culture.allCases {
            if let bank = decrees[c] {
                for k in AspectKind.allCases {
                    for p in fast {
                        if bank.headlines[k]?[p] == nil { missing.append("headline \(c.id)/\(k.id)/\(p.id)") }
                        if bank.images[k]?[p] == nil { missing.append("image \(c.id)/\(k.id)/\(p.id)") }
                        if bank.instructions[k]?[p] == nil { missing.append("instruction \(c.id)/\(k.id)/\(p.id)") }
                    }
                    for p in Planet.allCases where p != .moon && bank.consequences[k]?[p] == nil {
                        missing.append("consequence \(c.id)/\(k.id)/\(p.id)")
                    }
                    if bank.relations[k]?.count != 3 { missing.append("relations \(c.id)/\(k.id)") }
                }
                for (name, list) in [("tight tails", bank.tightTails), ("second figure", bank.secondFigure),
                                     ("plain second figure", bank.secondFigurePlain)] where list.count != 3 {
                    missing.append("\(name) \(c.id)")
                }
            } else {
                missing.append("decree \(c.id)")
            }
            if quietHeadlines[c] == nil { missing.append("quiet headline \(c.id)") }
            if quietLines[c] == nil { missing.append("quiet line \(c.id)") }
            if institutions[c] == nil { missing.append("institution \(c.id)") }
            if weekTitles[c] == nil { missing.append("week title \(c.id)") }
            if groups[c]?.count != 4 { missing.append("house groups \(c.id)") }
            for p in Planet.allCases where domains[c]?[p] == nil { missing.append("domain \(c.id)/\(p.id)") }
        }
        for s in ZodiacSign.allCases where images[s] == nil { missing.append("sign image \(s.name)") }
        for k in AspectKind.allCases where glyphs[k] == nil { missing.append("aspect glyph \(k.id)") }
        if !missing.isEmpty { throw ContentError.incomplete("day-banks.json", missing) }
    }

    static func load(from directory: URL) throws -> DayBanks {
        let url = directory.appendingPathComponent("day-banks.json")
        guard let data = try? Data(contentsOf: url) else { throw ContentError.missingFile("day-banks.json") }
        let dto: DTO
        do { dto = try JSONDecoder().decode(DTO.self, from: data) } catch {
            throw ContentError.malformed("day-banks.json", String(describing: error))
        }
        return try DayBanks(dto)
    }
}
