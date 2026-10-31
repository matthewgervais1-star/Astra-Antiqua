import Foundation

/// One figure of the day's sky: two bodies, the aspect between them and its orb.
public struct DayFigure: Sendable, Hashable {
    public let a: Planet
    public let b: Planet
    public let kind: AspectKind
    public let orb: Double

    public init(a: Planet, b: Planet, kind: AspectKind, orb: Double) {
        self.a = a; self.b = b; self.kind = kind; self.orb = orb
    }
}

/// The day's decree (web's DayDecree): a headline to the reader, an evidence
/// line naming the figure, and one paragraph of five sentences (meaning,
/// consequence, the institution's image, the second figure, the instruction).
public struct DayDecree: Sendable, Hashable {
    /// One sentence to the reader, in sentence case.
    public let headline: String
    /// "ISIS □ OSIRIS · 0°25′", or "" on a quiet day.
    public let evidence: String
    /// The five sentences joined with spaces, or the quiet line.
    public let paragraph: String
    public let sentences: [String]
    public let tone: WeekTone
    /// The headline figure, then the second figure, then every other candidate by orb.
    public let figures: [DayFigure]
}

/// Port of web/src/lib/decree.ts. The headline figure is the tightest one
/// touching a fast body; the sky decides it. The second figure is the
/// tightest of another kind. The UTC day number picks among each bank's
/// three variants.
public enum DayDecreeComposer {
    private static let oneArcminute = 1.0 / 60.0
    private static let fastBodies: Set<Planet> = [.sun, .moon, .mercury, .venus, .mars]

    /// The UTC day number of an instant (epoch milliseconds / one day, floored).
    public static func utcDayNumber(_ date: Date) -> Int {
        Int((Instant.toMs(date) / Instant.msPerDay).rounded(.down))
    }

    /// 00:00 UTC of the day `date` falls in.
    public static func utcDayStart(_ date: Date) -> Date {
        Instant.fromMs(Double(utcDayNumber(date)) * Instant.msPerDay)
    }

    /// Which of a bank's three variants a day uses.
    public static func variant(_ day: Int) -> Int { ((day % 3) + 3) % 3 }

    /// The headline body of a figure (its fast body, the faster when both
    /// are) and the partner. Nil when neither body is fast.
    public static func headlineBody(_ a: Planet, _ b: Planet, store: ContentStore) -> (body: Planet, partner: Planet)? {
        for fast in store.day.fastOrder {
            if a == fast { return (fast, b) }
            if b == fast { return (fast, a) }
        }
        return nil
    }

    /// "0°19′", minutes carried at 60.
    public static func formatOrb(_ orb: Double) -> String {
        let deg = Int(orb.rounded(.down))
        let min = Int(jsRound((orb - Double(deg)) * 60))
        let (d, m) = min == 60 ? (deg + 1, 0) : (deg, min)
        return "\(d)°\(m < 10 ? "0" : "")\(m)′"
    }

    /// The measured orb, or "EXACT" only under one minute of arc.
    public static func orbMeasure(_ orb: Double) -> String {
        orb < oneArcminute ? "EXACT" : formatOrb(orb)
    }

    /// "RA △ NUT · 0°19′".
    public static func evidence(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> String {
        let nameA = store.deity(culture, f.a).name.uppercased()
        let nameB = store.deity(culture, f.b).name.uppercased()
        return "\(nameA) \(store.day.aspectGlyph(f.kind)) \(nameB) · \(orbMeasure(f.orb))"
    }

    /// The unpunctuated meaning clause: two domains and the day's relation.
    public static func meaningClause(_ culture: Culture, _ f: DayFigure, day: Int, store: ContentStore) -> String {
        let banks = store.day
        let relation = banks.decree(culture).relations[f.kind]![variant(day)]
        return "\(banks.domain(culture, f.a)) and \(banks.domain(culture, f.b)) \(relation)"
    }

    /// Sentence (a): the meaning, with the tight tail under half a degree.
    public static func meaning(_ culture: Culture, _ f: DayFigure, day: Int, store: ContentStore) -> String {
        let tail = f.orb < store.day.tightOrb ? store.day.decree(culture).tightTails[variant(day)] : ""
        return "\(ReadingBanks.cap(meaningClause(culture, f, day: day, store: store)))\(tail)."
    }

    /// Sentence (b): the consequence, keyed by kind and partner body.
    public static func consequence(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> String {
        let partner = headlineBody(f.a, f.b, store: store)!.partner
        return store.day.decree(culture).consequences[f.kind]![partner]!
    }

    /// The headline for a figure, keyed by culture, kind and headline body.
    public static func headline(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> String {
        let body = headlineBody(f.a, f.b, store: store)!.body
        return store.day.decree(culture).headlines[f.kind]![body]!
    }

    private static func fill(_ template: String, _ slots: [String: String]) -> String {
        // Web's fill: every "{word}" whose key is known is replaced; others stay.
        var out = ""
        var rest = Substring(template)
        while let open = rest.firstIndex(of: "{") {
            out += rest[..<open]
            let afterOpen = rest.index(after: open)
            if let close = rest[afterOpen...].firstIndex(of: "}") {
                let key = String(rest[afterOpen..<close])
                let isWord = !key.isEmpty && key.allSatisfy { $0.isLetter || $0.isNumber || $0 == "_" }
                if isWord, let value = slots[key] {
                    out += value
                } else {
                    out += rest[open...close]
                }
                rest = rest[rest.index(after: close)...]
            } else {
                out += rest[open...]
                rest = rest[rest.endIndex...]
            }
        }
        out += rest
        return out
    }

    private static func godSlots(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> [String: String] {
        let hb = headlineBody(f.a, f.b, store: store)!
        return ["god": store.deity(culture, hb.body).name, "partner": store.deity(culture, hb.partner).name]
    }

    /// Sentence (c): the institution's image, naming the headline god.
    public static func image(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> String {
        let body = headlineBody(f.a, f.b, store: store)!.body
        return fill(store.day.decree(culture).images[f.kind]![body]!, godSlots(culture, f, store: store))
    }

    /// Sentence (e): the one instruction, for the headline body's domain.
    public static func instruction(_ culture: Culture, _ f: DayFigure, store: ContentStore) -> String {
        let body = headlineBody(f.a, f.b, store: store)!.body
        return fill(store.day.decree(culture).instructions[f.kind]![body]!, godSlots(culture, f, store: store))
    }

    /// Sentence (d): the second figure. Its opener names the headline
    /// figure's gods unless the two figures share a god (compared by name:
    /// Carthage gives Jupiter and Saturn one god).
    public static func second(_ culture: Culture, top: DayFigure, _ f: DayFigure, day: Int, store: ContentStore) -> String {
        let name = { (p: Planet) in store.deity(culture, p).name }
        let headlineGods: Set<String> = [name(top.a), name(top.b)]
        let shared = headlineGods.contains(name(f.a)) || headlineGods.contains(name(f.b))
        let bank = store.day.decree(culture)
        let opener = shared
            ? bank.secondFigurePlain[variant(day)]
            : fill(bank.secondFigure[variant(day)], godSlots(culture, top, store: store))
        let verb = store.banks.aspectVerb(culture, f.kind)
        return "\(opener) \(name(f.a)) \(verb) \(name(f.b)): \(meaningClause(culture, f, day: day, store: store))."
    }

    /// The day's candidates: every aspect touching a fast body, tightest
    /// first, ties kept in detection order.
    public static func dayFigures(_ chart: [Planet: Double], store: ContentStore) -> [DayFigure] {
        AspectDetector.detect(chart, rules: store.aspectRules)
            .filter { fastBodies.contains($0.a) || fastBodies.contains($0.b) }
            .enumerated()
            .sorted { $0.element.orb != $1.element.orb ? $0.element.orb < $1.element.orb : $0.offset < $1.offset }
            .map { DayFigure(a: $0.element.a, b: $0.element.b, kind: $0.element.kind, orb: $0.element.orb) }
    }

    /// The decree for one chart (web's composeDecree).
    public static func compose(_ culture: Culture, chart: [Planet: Double], day: Int, store: ContentStore) -> DayDecree {
        let candidates = dayFigures(chart, store: store)
        guard let top = candidates.first else {
            let quiet = store.day.quietLine(culture)
            return DayDecree(headline: store.day.quietHeadline(culture), evidence: "", paragraph: quiet,
                             sentences: [quiet], tone: .quiet, figures: [])
        }
        let secondFigure = candidates.first { $0.kind != top.kind }
        let secondSentence = secondFigure.map { second(culture, top: top, $0, day: day, store: store) }
            ?? store.day.decree(culture).noSecondFigure
        let sentences = [
            meaning(culture, top, day: day, store: store),
            consequence(culture, top, store: store),
            image(culture, top, store: store),
            secondSentence,
            instruction(culture, top, store: store),
        ]
        var figures = [top]
        if let s = secondFigure { figures.append(s) }
        figures += candidates.filter { $0 != top && $0 != secondFigure }
        return DayDecree(
            headline: headline(culture, top, store: store),
            evidence: evidence(culture, top, store: store),
            paragraph: sentences.joined(separator: " "),
            sentences: sentences,
            tone: top.kind.isHard ? .tension : .harmony,
            figures: figures)
    }

    /// The day page for the UTC day containing `date`: the sky at 00:00 UTC
    /// (web's composeDayPage).
    public static func composeDayPage(_ culture: Culture, date: Date, store: ContentStore) -> DayDecree {
        let day = utcDayNumber(date)
        let chart = Ephemeris.computeChart(Instant.fromMs(Double(day) * Instant.msPerDay))
        return compose(culture, chart: chart, day: day, store: store)
    }

    /// JavaScript's Math.round: halves go up, toward positive infinity.
    static func jsRound(_ x: Double) -> Double { (x + 0.5).rounded(.down) }
}
