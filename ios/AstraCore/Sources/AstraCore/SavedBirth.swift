import Foundation

/// The one birth record this surface keeps, and the culture it reads in. The
/// record holds what the person entered (the wall clock and the place) and
/// the zone it was read in, never only a derived instant, so it can be
/// re-resolved if a zone rule changes. A second party entered for synastry
/// is never turned into one of these: nothing about another person is stored.
///
/// The JSON is the C# core's: PascalCase keys in declaration order, the
/// culture as its capitalised name ("Egypt"), read back case-insensitively.
/// Port of the C# core's SavedBirth.
public struct SavedBirth: Codable, Hashable, Sendable {
    public let name: String
    public let culture: Culture
    public let year: Int
    public let month: Int
    public let day: Int
    public let hour: Int
    public let minute: Int
    public let latitude: Double
    public let longitude: Double
    public let placeName: String
    public let timeZone: String
    public let zoneEstimated: Bool

    public init(
        name: String,
        culture: Culture,
        year: Int,
        month: Int,
        day: Int,
        hour: Int,
        minute: Int,
        latitude: Double,
        longitude: Double,
        placeName: String,
        timeZone: String,
        zoneEstimated: Bool
    ) {
        self.name = name
        self.culture = culture
        self.year = year
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.latitude = latitude
        self.longitude = longitude
        self.placeName = placeName
        self.timeZone = timeZone
        self.zoneEstimated = zoneEstimated
    }

    // Computed from the fields above, so never written to the record.
    public var input: BirthInput {
        BirthInput(year: year, month: month, day: day, hour: hour, minute: minute, latitude: latitude, longitude: longitude)
    }

    /// The zone the wall clock is read in: the longitude estimate when the
    /// record says so, otherwise the stored IANA id. An id this runtime does
    /// not know also falls back to the estimate.
    public var zone: TimeZone {
        if zoneEstimated { return BirthResolver.estimateZoneForLongitude(longitude) }
        return BirthResolver.findZone(timeZone) ?? BirthResolver.estimateZoneForLongitude(longitude)
    }

    public func resolve() -> ResolvedBirth { BirthResolver.resolve(input, zone: zone) }

    public func cast(rules: [AspectRule]) -> NatalChart {
        NatalChart.cast(resolve().utc, latitude: latitude, longitude: longitude, rules: rules)
    }

    // MARK: JSON

    private enum CodingKeys: String, CodingKey {
        case name = "Name"
        case culture = "Culture"
        case year = "Year"
        case month = "Month"
        case day = "Day"
        case hour = "Hour"
        case minute = "Minute"
        case latitude = "Latitude"
        case longitude = "Longitude"
        case placeName = "PlaceName"
        case timeZone = "TimeZone"
        case zoneEstimated = "ZoneEstimated"
    }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        name = try c.decode(String.self, forKey: .name)
        culture = try SavedBirth.decodeCulture(c)
        year = try c.decode(Int.self, forKey: .year)
        month = try c.decode(Int.self, forKey: .month)
        day = try c.decode(Int.self, forKey: .day)
        hour = try c.decode(Int.self, forKey: .hour)
        minute = try c.decode(Int.self, forKey: .minute)
        latitude = try c.decode(Double.self, forKey: .latitude)
        longitude = try c.decode(Double.self, forKey: .longitude)
        placeName = try c.decode(String.self, forKey: .placeName)
        timeZone = try c.decode(String.self, forKey: .timeZone)
        zoneEstimated = try c.decode(Bool.self, forKey: .zoneEstimated)
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(name, forKey: .name)
        try c.encode(SavedBirth.jsonName(culture), forKey: .culture)
        try c.encode(year, forKey: .year)
        try c.encode(month, forKey: .month)
        try c.encode(day, forKey: .day)
        try c.encode(hour, forKey: .hour)
        try c.encode(minute, forKey: .minute)
        try c.encode(latitude, forKey: .latitude)
        try c.encode(longitude, forKey: .longitude)
        try c.encode(placeName, forKey: .placeName)
        try c.encode(timeZone, forKey: .timeZone)
        try c.encode(zoneEstimated, forKey: .zoneEstimated)
    }

    /// The record as the C# core writes it with System.Text.Json: compact,
    /// keys in declaration order, strings escaped by its default encoder and
    /// numbers in shortest round-trip form. Written by hand because
    /// JSONEncoder fixes neither key order nor escaping, and the smoke run's
    /// seed record must read back to the same bytes.
    public func toJSON() -> String {
        var out = "{"
        out += "\"Name\":" + SavedBirth.jsonString(name)
        out += ",\"Culture\":" + SavedBirth.jsonString(SavedBirth.jsonName(culture))
        out += ",\"Year\":" + String(year)
        out += ",\"Month\":" + String(month)
        out += ",\"Day\":" + String(day)
        out += ",\"Hour\":" + String(hour)
        out += ",\"Minute\":" + String(minute)
        out += ",\"Latitude\":" + SavedBirth.jsonNumber(latitude)
        out += ",\"Longitude\":" + SavedBirth.jsonNumber(longitude)
        out += ",\"PlaceName\":" + SavedBirth.jsonString(placeName)
        out += ",\"TimeZone\":" + SavedBirth.jsonString(timeZone)
        out += ",\"ZoneEstimated\":" + (zoneEstimated ? "true" : "false")
        out += "}"
        return out
    }

    /// Nil for anything unreadable, so a damaged record sends the reader to onboarding.
    public static func fromJSON(_ json: String?) -> SavedBirth? {
        guard let json = json, !json.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return nil }
        return try? JSONDecoder().decode(SavedBirth.self, from: Data(json.utf8))
    }

    // MARK: Helpers

    /// The C# enum member's name, which is what System.Text.Json writes.
    static func jsonName(_ culture: Culture) -> String {
        switch culture {
        case .egypt: return "Egypt"
        case .greece: return "Greece"
        case .canaan: return "Canaan"
        case .carthage: return "Carthage"
        case .rome: return "Rome"
        }
    }

    /// Reads the culture as the C# core's string-enum converter does: the
    /// member name in any case, or the member's number (as a JSON number or
    /// a numeric string).
    private static func decodeCulture(_ c: KeyedDecodingContainer<CodingKeys>) throws -> Culture {
        if let text = try? c.decode(String.self, forKey: .culture) {
            let trimmed = text.trimmingCharacters(in: .whitespaces)
            if let number = Int(trimmed), let found = SavedBirth.cultureNumbered(number) { return found }
            if let found = Culture(rawValue: trimmed.lowercased()) { return found }
            throw DecodingError.dataCorruptedError(forKey: .culture, in: c, debugDescription: "Unknown culture '\(text)'")
        }
        let number = try c.decode(Int.self, forKey: .culture)
        guard let found = SavedBirth.cultureNumbered(number) else {
            throw DecodingError.dataCorruptedError(forKey: .culture, in: c, debugDescription: "Unknown culture \(number)")
        }
        return found
    }

    /// The C# enum's numbering is declaration order, which Culture.allCases keeps.
    private static func cultureNumbered(_ index: Int) -> Culture? {
        let all = Culture.allCases
        return all.indices.contains(index) ? all[index] : nil
    }

    /// A JSON string as System.Text.Json's default encoder writes it: ASCII
    /// printable characters as they are, except the HTML-sensitive
    /// quote, ampersand, apostrophe, plus, angle brackets and backtick, which
    /// become \u00XX like every other control and non-ASCII UTF-16 unit;
    /// backslash and the five common controls take their short escapes.
    private static func jsonString(_ value: String) -> String {
        var out = "\""
        for unit in value.utf16 {
            switch unit {
            case 0x5C: out += "\\\\"
            case 0x0A: out += "\\n"
            case 0x0D: out += "\\r"
            case 0x09: out += "\\t"
            case 0x08: out += "\\b"
            case 0x0C: out += "\\f"
            case 0x22, 0x26, 0x27, 0x2B, 0x3C, 0x3E, 0x60: out += hexEscape(unit)
            case 0x20...0x7E: out.append(Character(Unicode.Scalar(UInt8(unit))))
            default: out += hexEscape(unit)
            }
        }
        out += "\""
        return out
    }

    private static func hexEscape(_ unit: UInt16) -> String {
        let hex = String(unit, radix: 16, uppercase: true)
        return "\\u" + String(repeating: "0", count: 4 - hex.count) + hex
    }

    /// A double as .NET writes it: shortest round-trip digits, a whole value
    /// without ".0", and an upper-case exponent ("1E-05"). Swift's
    /// description already gives the shortest digits and switches to an
    /// exponent at the same small magnitudes. A non-finite value, which C#
    /// refuses to write, becomes null, so the record reads back as nil.
    private static func jsonNumber(_ value: Double) -> String {
        guard value.isFinite else { return "null" }
        var text = value.description
        if text.hasSuffix(".0") { text.removeLast(2) }
        return text.replacingOccurrences(of: "e", with: "E")
    }
}
