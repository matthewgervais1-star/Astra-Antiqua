import Foundation

/// A birth as a person states it: wall-clock date and time, and where.
public struct BirthInput: Sendable, Hashable {
    public let year: Int
    public let month: Int
    public let day: Int
    public let hour: Int
    public let minute: Int
    public let latitude: Double
    public let longitude: Double

    public init(year: Int, month: Int, day: Int, hour: Int, minute: Int, latitude: Double, longitude: Double) {
        self.year = year
        self.month = month
        self.day = day
        self.hour = hour
        self.minute = minute
        self.latitude = latitude
        self.longitude = longitude
    }
}

/// The birth as an instant, with the zone and offset that produced it.
public struct ResolvedBirth: Sendable, Hashable {
    public let utc: Date
    public let timeZone: String
    public let offsetMinutes: Int

    public init(utc: Date, timeZone: String, offsetMinutes: Int) {
        self.utc = utc
        self.timeZone = timeZone
        self.offsetMinutes = offsetMinutes
    }
}

/// Port of resolveBirth in web/src/lib/birthDateTime.ts. Web finds the zone
/// from the coordinates with tz-lookup; this surface is handed the zone (from
/// the offline city list, which carries tz-lookup's answer, or from the
/// platform's geocoder) and applies web's two-pass offset rule, so a birth in
/// the hour a clock springs forward resolves to the instant web gives it.
/// Port of the C# core's BirthResolver.
public enum BirthResolver {
    public static func resolve(_ input: BirthInput, zone: TimeZone) -> ResolvedBirth {
        let naive = naiveUTC(input)

        // First pass: read the wall clock as if it were UTC and take the
        // zone's offset at that moment. Second pass: if a DST boundary sits
        // between, the offset at the first candidate is the one that holds.
        let offset1 = zone.secondsFromGMT(for: naive)
        let candidate = naive.addingTimeInterval(-TimeInterval(offset1))
        let offset2 = zone.secondsFromGMT(for: candidate)
        let utc = naive.addingTimeInterval(-TimeInterval(offset2))

        // The C# core rounds the offset in minutes half to even (Math.Round);
        // only a local-mean-time offset with seconds in it is ever fractional.
        let minutes = (Double(offset2) / 60).rounded(.toNearestOrEven)
        return ResolvedBirth(utc: utc, timeZone: zone.identifier, offsetMinutes: Int(minutes))
    }

    /// Looks a zone up by IANA id, the form the city list and web use. Nil
    /// when this runtime does not know the id.
    public static func findZone(_ id: String) -> TimeZone? {
        TimeZone(identifier: id)
    }

    /// A standard-time zone estimated from longitude alone, for a birthplace
    /// whose real zone could not be found: round(longitude / 15) hours, which
    /// is right for most of the globe and never reflects daylight saving.
    /// The same stand-in Android uses (domain/BirthInstant.kt).
    public static func estimateZoneForLongitude(_ longitude: Double) -> TimeZone {
        // Whole hours in -12...14 are always within TimeZone's +/-18 h range.
        TimeZone(secondsFromGMT: estimatedOffsetHours(longitude) * 3_600)!
    }

    /// The id the C# core gives the estimated zone: "Etc/GMT" for UTC, and
    /// otherwise the POSIX-signed "Etc/GMT-5" for five hours ahead of UTC.
    /// A Foundation zone made from an offset carries its own identifier
    /// ("GMT+0500"), so this keeps the C# core's id available where a record
    /// or a screen wants it.
    public static func estimatedZoneId(forLongitude longitude: Double) -> String {
        let hours = estimatedOffsetHours(longitude)
        if hours == 0 { return "Etc/GMT" }
        return "Etc/GMT\(hours > 0 ? "-" : "+")\(hours.magnitude)"
    }

    /// "UTC+05:30" (web's formatOffset).
    public static func formatOffset(_ offsetMinutes: Int) -> String {
        let sign = offsetMinutes >= 0 ? "+" : "-"
        let total = offsetMinutes.magnitude
        return "UTC\(sign)\(twoDigits(total / 60)):\(twoDigits(total % 60))"
    }

    // MARK: Helpers

    /// round(longitude / 15), half away from zero as C#'s
    /// MidpointRounding.AwayFromZero, clamped to the zones that exist.
    private static func estimatedOffsetHours(_ longitude: Double) -> Int {
        let clamped = max(-180, min(180, longitude))
        let hours = max(-12, min(14, (clamped / 15.0).rounded(.toNearestOrAwayFromZero)))
        return Int(hours)
    }

    /// The wall clock read as if it were UTC, counted on the proleptic
    /// Gregorian calendar as JavaScript's Date.UTC and C#'s DateTime count it.
    /// Foundation's Gregorian calendar switches to Julian dates before
    /// 1582-10-15, so the count is done here in whole seconds instead. A
    /// month outside 1...12 carries into the year, and a day, hour or minute
    /// past its range into the next unit, as Date.UTC does.
    static func naiveUTC(_ input: BirthInput) -> Date {
        let monthIndex = input.month - 1
        let carry = monthIndex >= 0 ? monthIndex / 12 : (monthIndex - 11) / 12
        let year = input.year + carry
        let month = monthIndex - carry * 12 + 1
        let days = daysFromCivil(year: year, month: month, day: input.day)
        let seconds = days * 86_400 + input.hour * 3_600 + input.minute * 60
        return Date(timeIntervalSince1970: TimeInterval(seconds))
    }

    /// Days from 1970-01-01 to a proleptic Gregorian date, month 1...12
    /// (Howard Hinnant's days_from_civil). Linear in `day`, so a day outside
    /// the month rolls over.
    private static func daysFromCivil(year: Int, month: Int, day: Int) -> Int {
        let y = month <= 2 ? year - 1 : year
        let era = (y >= 0 ? y : y - 399) / 400
        let yearOfEra = y - era * 400
        let monthFromMarch = month > 2 ? month - 3 : month + 9
        let dayOfYear = (153 * monthFromMarch + 2) / 5 + day - 1
        let dayOfEra = yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear
        return era * 146_097 + dayOfEra - 719_468
    }

    private static func twoDigits(_ value: UInt) -> String {
        let text = String(value)
        return text.count < 2 ? "0" + text : text
    }
}
