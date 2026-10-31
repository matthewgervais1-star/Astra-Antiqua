import AstraCore
import Foundation

/// The small lookups and date strings every screen prints with, in the
/// culture in force and the reader's own time zone.
struct Words {
    let culture: Culture
    let zone: TimeZone
    var store: ContentStore { Content.store }

    init(_ culture: Culture, zone: TimeZone = .current) {
        self.culture = culture
        self.zone = zone
    }

    func deity(_ planet: Planet) -> String { store.deity(culture, planet).name }
    func symbol(_ planet: Planet) -> String { store.planetCopy(planet).symbol }
    func label(_ planet: Planet) -> String { store.planetCopy(planet).label }
    var cultureLabel: String { store.cultureCopy(culture).label }

    /// How a natal point is named: its deity, or "your rising".
    func natalPoint(_ key: String) -> String {
        switch key {
        case "sun": return deity(.sun)
        case "moon": return deity(.moon)
        case "asc": return "your rising"
        case "mc": return "your midheaven"
        default: return key
        }
    }

    /// "23 JUL 2026"
    func dayMonthYear(_ date: Date) -> String {
        "\(Format.dayMonth(date, zone: zone)) \(Instant.localYMD(date, zone).year)"
    }

    /// "JUL 2026"
    func monthYear(_ date: Date) -> String { Format.monthYear(date, zone: zone) }

    /// "WED 21 OCT 2026"
    func weekdayDate(_ date: Date) -> String { "\(Format.weekday(date, zone: zone)) \(dayMonthYear(date))" }

    /// "Hermes goes on to the shrine of the Scorpion. {ruling}" (web's ingress line).
    func ingressLine(_ planet: Planet, _ sign: ZodiacSign) -> String {
        let banks = store.banks
        return "\(deity(planet)) \(banks.ingressVerb(culture)) the \(Format.properCase(banks.signPhrase(sign))). "
            + banks.ingressFrame(culture, banks.deityCharge(culture, planet))
    }

    /// "☉ □ ♄ · TIGHT", "♂ → SCO", or "QUIET", as web's week strip prints it.
    func shorthand(_ s: WeekShorthand) -> String {
        switch s.kind {
        case .aspect:
            guard let a = s.a, let b = s.b, let k = s.aspect else { return "" }
            return "\(symbol(a)) \(store.banks.aspectGlyph(k)) \(symbol(b))\(s.tight ? " · TIGHT" : "")"
        case .ingress:
            guard let p = s.planet, let sign = s.sign else { return "" }
            return "\(symbol(p)) \u{2192} \(store.banks.signAbbreviation(sign))"
        case .quiet:
            return "QUIET"
        }
    }
}
