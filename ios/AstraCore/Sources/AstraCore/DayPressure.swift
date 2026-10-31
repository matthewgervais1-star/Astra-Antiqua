import Foundation

/// How loud a house group reads today (web's PressureLevel).
public enum PressureLevel: String, CaseIterable, Sendable, Hashable {
    case loud, strained, quiet

    /// "LOUD", "STRAINED", "QUIET".
    public var label: String { rawValue.uppercased() }
}

/// One of today's transits to the natal chart: a moving body against a natal one.
public struct PressureContact: Sendable, Hashable {
    public let transit: Planet
    public let natal: Planet
    public let kind: AspectKind
    public let orb: Double

    public init(transit: Planet, natal: Planet, kind: AspectKind, orb: Double) {
        self.transit = transit; self.natal = natal; self.kind = kind; self.orb = orb
    }
}

/// One house group of "where the day falls" (web's PressureGroup), with the
/// contact it reads.
public struct PressureGroup: Sendable, Hashable {
    public let name: String
    public let sub: String
    public let level: PressureLevel
    /// The lead contact's orb, nil when nothing in orb touches the group.
    public let orb: Double?
    /// The lead contact's kind's orb from the rule table; 8 on a quiet group.
    public let maxOrb: Double
    public let sentence: String
    /// The contact rankContacts puts first, nil on an untouched group.
    public let lead: PressureContact?
}

/// Port of web/src/lib/dayPressure.ts: today's transits bucketed by the
/// whole-sign house of the natal point they touch, into the culture's four
/// house groups, each read by its first-ranked contact.
public enum DayPressure {
    private static let houseGroups: [[Int]] = [[2, 6, 10], [4, 8], [3, 7, 11], [1, 5, 9, 12]]
    private static let fastTransits: Set<Planet> = [.moon, .sun, .mercury, .venus, .mars]
    private static let ordinals = ["", "first", "second", "third", "fourth", "fifth", "sixth",
                                   "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"]

    static func ordinal(_ house: Int) -> String {
        (1...12).contains(house) ? ordinals[house] : "\(house)th"
    }

    /// The contacts in the order the day page reads them: a body that moves
    /// daily before a slow one, a body against its own natal place after the
    /// others of its speed, then by orb; the Moon against the natal Moon last.
    public static func rankContacts(_ hits: [PressureContact]) -> [PressureContact] {
        func key(_ h: PressureContact) -> [Int] {
            [h.transit == .moon && h.natal == .moon ? 1 : 0,
             fastTransits.contains(h.transit) ? 0 : 1,
             h.transit == h.natal ? 1 : 0]
        }
        return hits.enumerated().sorted { x, y in
            let kx = key(x.element), ky = key(y.element)
            if kx != ky { return kx.lexicographicallyPrecedes(ky) }
            if x.element.orb != y.element.orb { return x.element.orb < y.element.orb }
            return x.offset < y.offset
        }.map { $0.element }
    }

    /// Today's transits (web's computeTransits: transit body outer, natal inner).
    public static func transits(today: [Planet: Double], natal: [Planet: Double], store: ContentStore) -> [PressureContact] {
        CrossAspects.compute(today, natal, rules: store.aspectRules)
            .map { PressureContact(transit: $0.from, natal: $0.to, kind: $0.kind, orb: $0.orb) }
    }

    /// The transits in each of the four groups, in the groups' fixed order.
    public static func byGroup(natal: [Planet: Double], ascendant: Double, today: [Planet: Double],
                               store: ContentStore) -> [[PressureContact]] {
        let ascIndex = ZodiacMath.longitudeToSign(ascendant).sign.index
        let hits = transits(today: today, natal: natal, store: store)
        return houseGroups.map { houses in
            hits.filter { houses.contains(WholeSignHouses.houseOfLongitude(natal[$0.natal]!, ascSignIndex: ascIndex)) }
        }
    }

    private static func level(_ hits: [PressureContact]) -> PressureLevel {
        guard let lead = rankContacts(hits).first else { return .quiet }
        if lead.orb < 1.5 { return .loud }
        let tension = hits.filter { $0.kind.isHard }.count
        if lead.orb < 4 && Double(tension) > Double(hits.count) / 2 { return .strained }
        return .quiet
    }

    /// The four groups for a natal chart and a day's sky (web's dayPressure).
    /// `today` is the sky the day page reads: 00:00 UTC of the day.
    public static func compute(natal: [Planet: Double], ascendant: Double, today: [Planet: Double],
                               culture: Culture, store: ContentStore) -> [PressureGroup] {
        let ascIndex = ZodiacMath.longitudeToSign(ascendant).sign.index
        let buckets = byGroup(natal: natal, ascendant: ascendant, today: today, store: store)
        let voices = store.day.houseGroups(culture)
        return houseGroups.enumerated().map { i, houses in
            let voice = voices[i]
            let hits = buckets[i]
            let lvl = level(hits)
            guard let lead = rankContacts(hits).first else {
                return PressureGroup(name: voice.name, sub: voice.sub, level: lvl, orb: nil, maxOrb: 8,
                                     sentence: "Nothing exact touches your \(ordinal(houses[0])).", lead: nil)
            }
            let tDeity = store.deity(culture, lead.transit).name
            let nDeity = store.deity(culture, lead.natal).name
            let verb = store.banks.aspectVerb(culture, lead.kind)
            let house = WholeSignHouses.houseOfLongitude(natal[lead.natal]!, ascSignIndex: ascIndex)
            let arena = store.house(house).arena
            let maxOrb = store.aspectRules.first { $0.kind == lead.kind }?.orb ?? 8
            return PressureGroup(
                name: voice.name, sub: voice.sub, level: lvl, orb: lead.orb, maxOrb: maxOrb,
                sentence: "\(tDeity) \(verb) your \(nDeity) in the \(ordinal(house)). It touches \(arena).",
                lead: lead)
        }
    }
}

/// The long transit the day page shows (web's LongTransitData, active or
/// upcoming; nil stands for web's "none").
public struct LongTransit: Sendable, Hashable {
    public let active: Bool
    public let span: TransitSpan
    /// "AMUN IN THE LION"
    public let title1: String
    /// "ROWS IN TIME WITH YOUR NATAL ASCENDANT"
    public let title2: String
    /// "OCT 2026 → JUN 2027"
    public let rangeLabel: String
    /// Where today sits in the span, 0 to 100.
    public let progressPct: Double
}

/// Port of buildLongTransit in web/src/components/home/buildHomeBundle.ts:
/// slow bodies against the natal Sun, Moon, Ascendant and Midheaven over
/// 1200 days from 420 days back; the active span with the smallest orb
/// today, or else the next one to open.
public enum LongTransitPick {
    private static let utc = TimeZone(secondsFromGMT: 0)!

    public static func natalPoints(natal: [Planet: Double], ascendant: Double, midheaven: Double) -> [NatalPoint] {
        [
            NatalPoint(key: "sun", longitude: natal[.sun]!),
            NatalPoint(key: "moon", longitude: natal[.moon]!),
            NatalPoint(key: "asc", longitude: ascendant),
            NatalPoint(key: "mc", longitude: midheaven),
        ]
    }

    /// The label for a natal point: the deity's name, or ASCENDANT and MIDHEAVEN.
    public static func natalPointLabel(_ culture: Culture, _ key: String, store: ContentStore) -> String {
        if key == "asc" { return "ASCENDANT" }
        if key == "mc" { return "MIDHEAVEN" }
        if let planet = Planet(rawValue: key) { return store.deity(culture, planet).name.uppercased() }
        return key.uppercased()
    }

    /// How far, today, the span's moving body stands from exact.
    public static func currentOrb(_ span: TransitSpan, today: [Planet: Double]) -> Double {
        abs(AspectDetector.separation(today[span.transitPlanet]!, span.natalLongitude) - span.kind.angle)
    }

    /// The spans the pick chooses from, computed once per chart.
    public static func spans(natal: [Planet: Double], ascendant: Double, midheaven: Double, now: Date) -> [TransitSpan] {
        TransitSpans.compute(
            natalPoints: natalPoints(natal: natal, ascendant: ascendant, midheaven: midheaven),
            transitPlanets: SkyEvents.slowBodies,
            start: Instant.addDays(now, -420),
            days: 1200)
    }

    public static func pick(spans: [TransitSpan], now: Date, today: [Planet: Double], culture: Culture,
                            store: ContentStore) -> LongTransit? {
        guard !spans.isEmpty else { return nil }
        let active = spans.filter { $0.start <= now && now <= $0.end }
        let chosen: TransitSpan
        if !active.isEmpty {
            chosen = active.enumerated().sorted { x, y in
                let ox = currentOrb(x.element, today: today), oy = currentOrb(y.element, today: today)
                return ox != oy ? ox < oy : x.offset < y.offset
            }[0].element
        } else {
            let upcoming = spans.filter { $0.start > now }
            guard !upcoming.isEmpty else { return nil }
            chosen = upcoming.enumerated().sorted { x, y in
                x.element.start != y.element.start ? x.element.start < y.element.start : x.offset < y.offset
            }[0].element
        }
        let deity = store.deity(culture, chosen.transitPlanet).name.uppercased()
        let title1 = "\(deity) IN THE \(store.day.signImage(chosen.transitSign))"
        let verb = store.banks.aspectVerb(culture, chosen.kind).uppercased()
        let title2 = "\(verb) YOUR NATAL \(natalPointLabel(culture, chosen.natalKey, store: store))"
        let range = "\(Format.monthYear(chosen.start, zone: utc)) → \(Format.monthYear(chosen.end, zone: utc))"
        let length = chosen.end.timeIntervalSince(chosen.start)
        let pct = length > 0 ? min(100, max(0, now.timeIntervalSince(chosen.start) / length * 100)) : 0
        return LongTransit(active: !active.isEmpty, span: chosen, title1: title1, title2: title2,
                           rangeLabel: range, progressPct: pct)
    }
}
