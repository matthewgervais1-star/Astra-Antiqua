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

    /// "23 JUL 2026" (date.dayMonthYear, shared/strings/formats.json)
    func dayMonthYear(_ date: Date) -> String { store.formats.dayMonthYear(date, zone: zone) }

    /// "JUL 2026" (date.monthYear)
    func monthYear(_ date: Date) -> String { store.formats.monthYear(date, zone: zone) }

    /// "WED 21 OCT 2026" (date.day, read in the reader's zone)
    func weekdayDate(_ date: Date) -> String { store.formats.dateDay(date, zone: zone) }

    /// "Hermes goes on to the shrine of the Scorpion. {ruling}" (web's ingress line).
    func ingressLine(_ planet: Planet, _ sign: ZodiacSign) -> String {
        let banks = store.banks
        return "\(deity(planet)) \(banks.ingressVerb(culture)) the \(Format.properCase(banks.signPhrase(sign))). "
            + banks.ingressFrame(culture, banks.deityCharge(culture, planet))
    }

    /// "☉ □ ♄ · TIGHT · TENSION", "♂ INTO SCORPIO", or "QUIET": the catalog's
    /// week.row.shorthand forms, as Sky Week prints them.
    func shorthand(_ s: WeekShorthand) -> String {
        SkyWeekBuilder.shorthand(s, culture: culture, store: store)
    }
}
