import Foundation

/// Loads shared/content and exposes typed lookups. Every invariant is checked
/// at load, so a hole in the corpus (a missing deity, paragraph, bank cell or
/// glyph) throws once at startup, naming every missing cell, instead of
/// failing quietly at lookup time. Port of the C# core's ContentStore.
///
/// The store reads from a directory it is handed: the app passes its bundle's
/// resource folder (where the build copies shared/content), the tests pass
/// the repository's shared/content. The strings catalog and the formats
/// (shared/strings) are read from the sibling folder "strings", where the
/// repository keeps them and where the app bundle copies them.
public final class ContentStore: @unchecked Sendable {
    public let aspectRules: [AspectRule]
    public let banks: ReadingBanks
    /// The day page's banks (day-banks.json).
    public let day: DayBanks
    public let cities: [City]
    public let method: MethodContent
    public let learn: LearnContent
    public let neutralPalette: Palette
    /// The shared strings catalog (shared/strings/en.json).
    public let strings: Strings
    /// The named formats and their word lists (shared/strings/formats.json).
    public let formats: Formats

    private let deities: [String: Deity]
    private let placements: [String: String]
    private let houses: [Int: HouseMeaning]
    private let signs: [ZodiacSign: ZodiacSignRecord]
    private let cultureCopies: [Culture: CultureCopy]
    private let planetCopies: [Planet: PlanetCopy]
    private let palettes: [Culture: Palette]
    private let glyphs: [String: DeityGlyph]

    public func deity(_ culture: Culture, _ planet: Planet) -> Deity { deities["\(culture.id)|\(planet.id)"]! }

    public func placementText(_ planet: Planet, _ sign: ZodiacSign) -> String { placements["\(planet.id)|\(sign.name)"]! }

    public func house(_ house: Int) -> HouseMeaning {
        precondition((1...12).contains(house), "House must be 1..12, got \(house)")
        return houses[house]!
    }

    public func signInfo(_ sign: ZodiacSign) -> ZodiacSignRecord { signs[sign]! }
    public func cultureCopy(_ culture: Culture) -> CultureCopy { cultureCopies[culture]! }
    public func planetCopy(_ planet: Planet) -> PlanetCopy { planetCopies[planet]! }
    public func palette(_ culture: Culture) -> Palette { palettes[culture]! }
    public func glyph(_ culture: Culture, _ planet: Planet) -> DeityGlyph { glyphs["\(culture.id)|\(planet.id)"]! }

    /// The cities whose name or country contains the query, or every popular
    /// city when the query is empty. Web's searchCities.
    public func searchCities(_ query: String, limit: Int = 8) -> [City] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if q.isEmpty { return cities.filter(\.popular) }
        // The C#'s Take(limit): no room, no matches.
        guard limit > 0 else { return [] }
        var matches: [City] = []
        for c in cities where c.name.lowercased().contains(q) || c.country.lowercased().contains(q) {
            matches.append(c)
            if matches.count >= limit { break }
        }
        return matches
    }

    // MARK: Loading

    private struct DeityDTO: Decodable { let planet, culture, name, epithet, note: String; let contested: Bool? }
    private struct HouseDTO: Decodable { let house: Int; let ordinal, title, domain, arena: String }
    private struct SignDTO: Decodable { let sign, symbol, dates, element, modality, traits, blurb: String }
    private struct RuleDTO: Decodable { let kind: String; let angle, orb: Double }
    private struct CulturesDTO: Decodable {
        struct C: Decodable { let id, label, tagline, subtitle: String }
        struct P: Decodable { let id, label, symbol: String; let received: Bool }
        let cultures: [C]
        let planets: [P]
    }
    private struct CityDTO: Decodable { let name, country: String; let latitude, longitude: Double; let popular: Bool; let timeZone: String }
    private struct PaletteDTO: Decodable { let ground, accent: String }
    private struct PalettesDTO: Decodable { let neutral: PaletteDTO; let cultures: [String: PaletteDTO] }
    private struct MethodDTO: Decodable {
        struct S: Decodable { let heading: String; let paragraphs: [String] }
        struct N: Decodable { let id: String; let cultures: [String]; let title, body: String }
        struct R: Decodable { let author, title, detail: String }
        let sections: [S]; let notes: [N]; let sources: [R]
    }
    private struct GlyphDTO: Decodable {
        struct P: Decodable { let d: String; let fill, stroke: Bool; let strokeWidth: Double; let lineCap, lineJoin: String }
        let culture, planet, deity, status: String
        let paths: [P]
    }
    private struct LearnDTO: Decodable {
        struct B: Decodable { let kind, text: String; let kicker: String? }
        struct S: Decodable { let n: Int; let title, href, blurb: String; let table: String?; let blocks: [B] }
        struct V: Decodable { let symbol, name, verb: String }
        struct H: Decodable { let name, age, body: String; let ours: Bool }
        let sections: [S]; let planetVerbs: [V]; let houseSystems: [H]
        let aspectRulings: [String: [String: String]]
        let aspectGeometry: [String: String]
    }

    private static func read<T: Decodable>(_ type: T.Type, _ name: String, in directory: URL) throws -> T {
        let url = directory.appendingPathComponent(name)
        guard let data = try? Data(contentsOf: url) else { throw ContentError.missingFile(name) }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw ContentError.malformed(name, String(describing: error))
        }
    }

    /// Loads and checks the whole corpus from a directory holding the
    /// shared/content files, and the strings from `stringsDirectory`
    /// (by default the sibling folder "strings").
    public convenience init(directory: URL) throws {
        try self.init(
            directory: directory,
            stringsDirectory: directory.deletingLastPathComponent().appendingPathComponent("strings"))
    }

    public init(directory: URL, stringsDirectory: URL) throws {
        let strings = try Strings(directory: stringsDirectory)
        let formats = try Formats(directory: stringsDirectory)
        var gaps: [String] = []

        var deities: [String: Deity] = [:]
        for d in try Self.read([DeityDTO].self, "deities.json", in: directory) {
            let deity = Deity(planet: try Planet.fromId(d.planet), culture: try Culture.fromId(d.culture),
                              name: d.name, epithet: d.epithet, note: d.note, contested: d.contested ?? false)
            deities["\(deity.culture.id)|\(deity.planet.id)"] = deity
        }

        var placements: [String: String] = [:]
        for (planet, bySign) in try Self.read([String: [String: String]].self, "planet-in-sign.json", in: directory) {
            let p = try Planet.fromId(planet)
            for (sign, text) in bySign {
                let s = try ZodiacSign.fromName(sign)
                placements["\(p.id)|\(s.name)"] = text
            }
        }

        var houses: [Int: HouseMeaning] = [:]
        for h in try Self.read([HouseDTO].self, "houses.json", in: directory) {
            houses[h.house] = HouseMeaning(house: h.house, ordinal: h.ordinal, title: h.title, domain: h.domain, arena: h.arena)
        }

        var signs: [ZodiacSign: ZodiacSignRecord] = [:]
        for s in try Self.read([SignDTO].self, "zodiac-signs.json", in: directory) {
            let sign = try ZodiacSign.fromName(s.sign)
            signs[sign] = ZodiacSignRecord(sign: sign, symbol: s.symbol, dates: s.dates, element: s.element,
                                           modality: s.modality, traits: s.traits, blurb: s.blurb)
        }

        let rules = try Self.read([RuleDTO].self, "aspect-rules.json", in: directory).map {
            AspectRule(kind: try AspectKind.fromId($0.kind), angle: $0.angle, orb: $0.orb)
        }

        let cultures = try Self.read(CulturesDTO.self, "cultures.json", in: directory)
        var cultureCopy: [Culture: CultureCopy] = [:]
        for c in cultures.cultures {
            let culture = try Culture.fromId(c.id)
            cultureCopy[culture] = CultureCopy(culture: culture, label: c.label, tagline: c.tagline, subtitle: c.subtitle)
        }
        var planetCopy: [Planet: PlanetCopy] = [:]
        for p in cultures.planets {
            let planet = try Planet.fromId(p.id)
            planetCopy[planet] = PlanetCopy(planet: planet, label: p.label, symbol: p.symbol, received: p.received)
        }

        let cities = try Self.read([CityDTO].self, "cities.json", in: directory).map {
            City(name: $0.name, country: $0.country, latitude: $0.latitude, longitude: $0.longitude,
                 popular: $0.popular, timeZone: $0.timeZone)
        }

        let palettesDTO = try Self.read(PalettesDTO.self, "palettes.json", in: directory)
        var palettes: [Culture: Palette] = [:]
        for (id, p) in palettesDTO.cultures {
            let culture = try Culture.fromId(id)
            palettes[culture] = Palette(ground: p.ground, accent: p.accent)
        }

        let m = try Self.read(MethodDTO.self, "method.json", in: directory)
        let method = MethodContent(
            sections: m.sections.map { MethodSection(heading: $0.heading, paragraphs: $0.paragraphs) },
            notes: try m.notes.map { n in
                InterpretiveNote(id: n.id, cultures: try n.cultures.map(Culture.fromId), title: n.title, body: n.body)
            },
            sources: m.sources.map { SourceReference(author: $0.author, title: $0.title, detail: $0.detail) })

        var glyphs: [String: DeityGlyph] = [:]
        for g in try Self.read([GlyphDTO].self, "glyphs.json", in: directory) {
            guard let status = GlyphStatus(rawValue: g.status) else { throw ContentError.unknown("glyph status", g.status) }
            let glyph = DeityGlyph(
                culture: try Culture.fromId(g.culture), planet: try Planet.fromId(g.planet), deity: g.deity, status: status,
                paths: g.paths.map { GlyphPath(data: $0.d, fill: $0.fill, stroke: $0.stroke, strokeWidth: $0.strokeWidth,
                                               lineCap: $0.lineCap, lineJoin: $0.lineJoin) })
            glyphs["\(glyph.culture.id)|\(glyph.planet.id)"] = glyph
        }

        let l = try Self.read(LearnDTO.self, "learn.json", in: directory)
        var rulings: [CultureKind: String] = [:]
        for (c, byKind) in l.aspectRulings {
            let culture = try Culture.fromId(c)
            for (k, text) in byKind {
                let kind = try AspectKind.fromId(k)
                rulings[CultureKind(culture, kind)] = text
            }
        }
        var geometry: [AspectKind: String] = [:]
        for (k, text) in l.aspectGeometry {
            let kind = try AspectKind.fromId(k)
            geometry[kind] = text
        }
        let learn = LearnContent(
            sections: l.sections.map { s in
                LearnSection(n: s.n, title: s.title, href: s.href, blurb: s.blurb, table: s.table,
                             blocks: s.blocks.map { LearnBlock(kind: $0.kind, text: $0.text, kicker: $0.kicker) })
            },
            planetVerbs: l.planetVerbs.map { PlanetVerb(symbol: $0.symbol, name: $0.name, verb: $0.verb) },
            houseSystems: l.houseSystems.map { HouseSystem(name: $0.name, age: $0.age, body: $0.body, ours: $0.ours) },
            aspectRulings: rulings,
            aspectGeometry: geometry)

        let banks = try ReadingBanks.load(from: directory)
        let day = try DayBanks.load(from: directory)

        for culture in Culture.allCases {
            if cultureCopy[culture] == nil { gaps.append("culture copy \(culture.id)") }
            if palettes[culture] == nil { gaps.append("palette \(culture.id)") }
            for planet in Planet.allCases {
                if deities["\(culture.id)|\(planet.id)"] == nil { gaps.append("deity \(culture.id)/\(planet.id)") }
                if glyphs["\(culture.id)|\(planet.id)"] == nil { gaps.append("glyph \(culture.id)/\(planet.id)") }
            }
        }
        for planet in Planet.allCases {
            if planetCopy[planet] == nil { gaps.append("planet copy \(planet.id)") }
            for sign in ZodiacSign.allCases where placements["\(planet.id)|\(sign.name)"] == nil {
                gaps.append("placement \(planet.id) in \(sign.name)")
            }
        }
        for h in 1...12 where houses[h] == nil { gaps.append("house \(h)") }
        for sign in ZodiacSign.allCases where signs[sign] == nil { gaps.append("sign record \(sign.name)") }
        if rules.count != 5 { gaps.append("aspect rules: expected 5, got \(rules.count)") }
        if cities.isEmpty { gaps.append("cities") }
        if method.sections.isEmpty { gaps.append("method sections") }
        if learn.sections.count != 7 { gaps.append("learn sections: expected 7, got \(learn.sections.count)") }
        if rulings.count != 25 { gaps.append("aspect rulings: expected 25, got \(rulings.count)") }
        if !gaps.isEmpty { throw ContentError.incomplete("shared/content", gaps) }

        self.deities = deities
        self.placements = placements
        self.houses = houses
        self.signs = signs
        self.aspectRules = rules
        self.cultureCopies = cultureCopy
        self.planetCopies = planetCopy
        self.cities = cities
        self.palettes = palettes
        self.neutralPalette = Palette(ground: palettesDTO.neutral.ground, accent: palettesDTO.neutral.accent)
        self.method = method
        self.glyphs = glyphs
        self.learn = learn
        self.banks = banks
        self.day = day
        self.strings = strings
        self.formats = formats
    }
}
