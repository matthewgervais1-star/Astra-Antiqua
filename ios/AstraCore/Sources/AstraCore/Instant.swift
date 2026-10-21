import Foundation

/// Web's time arithmetic, reproduced. JavaScript holds an instant as a double
/// count of milliseconds since 1970 and truncates to a whole millisecond
/// whenever it builds a Date. The searches bisect on those doubles and read
/// the sky at the truncated instant, as web's do, so a pass found here lands
/// on the millisecond web's lands on. Port of the C# core's Instant.
public enum Instant {
    public static let msPerDay: Double = 86_400_000
    public static let msPerHour: Double = 3_600_000

    /// Unix milliseconds of a Date. A Date built from whole milliseconds can
    /// carry floating-point dust either side of the integer; that dust is
    /// rounded away rather than floored to the millisecond below.
    public static func toMs(_ date: Date) -> Double {
        let x = date.timeIntervalSince1970 * 1000
        let r = x.rounded()
        return abs(x - r) < 1e-3 ? r : x.rounded(.down)
    }

    /// The Date JavaScript builds from a double: truncated toward zero.
    public static func fromMs(_ ms: Double) -> Date {
        Date(timeIntervalSince1970: ms.rounded(.towardZero) / 1000)
    }

    public static func addDays(_ date: Date, _ days: Double) -> Date {
        fromMs(toMs(date) + days * msPerDay)
    }

    /// Parses web's ISO strings ("2026-10-20T12:00:00.000Z" or without the
    /// fraction) to the exact millisecond.
    public static func parseISO(_ s: String) -> Date? {
        let withFraction = ISO8601DateFormatter()
        withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = withFraction.date(from: s) { return fromMs(toMs(d)) }
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        return plain.date(from: s)
    }

    /// A calendar in a time zone, Gregorian, for local-day arithmetic.
    public static func calendar(_ zone: TimeZone) -> Calendar {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = zone
        return cal
    }

    /// The UTC instant of local midnight on the calendar day containing `date`
    /// in `zone`. A midnight skipped by a clock change moves to the first
    /// valid instant, as JavaScript's Date does.
    public static func startOfLocalDay(_ date: Date, _ zone: TimeZone) -> Date {
        calendar(zone).startOfDay(for: date)
    }

    /// Year, month and day of `date` on the wall clock of `zone`.
    public static func localYMD(_ date: Date, _ zone: TimeZone) -> (year: Int, month: Int, day: Int) {
        let c = calendar(zone).dateComponents([.year, .month, .day], from: date)
        return (c.year!, c.month!, c.day!)
    }

    /// Local midnight of a wall-clock calendar date in `zone`.
    public static func localMidnight(year: Int, month: Int, day: Int, _ zone: TimeZone) -> Date {
        let cal = calendar(zone)
        let noon = cal.date(from: DateComponents(year: year, month: month, day: day, hour: 12))!
        return cal.startOfDay(for: noon)
    }

    /// Noon UTC of a wall-clock calendar date: the instant a day is read for.
    public static func noonUTC(year: Int, month: Int, day: Int) -> Date {
        calendar(TimeZone(identifier: "UTC")!).date(from: DateComponents(year: year, month: month, day: day, hour: 12))!
    }
}
