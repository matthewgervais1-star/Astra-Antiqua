import Foundation

/// Port of web/src/components/horizons/format.ts: the small date and word
/// helpers the horizon readings print with.
///
/// Web reads a JavaScript Date on the device's wall clock. Here each date
/// helper takes the instant and the zone whose wall clock it is read on.
public enum Format {
    private static let weekdayAbbr = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

    private static let monthAbbr = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

    private static let roman: [(amount: Int, symbol: String)] = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
        (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]

    /// "MON" for the local calendar date `date` falls on in `zone`.
    public static func weekday(_ date: Date, zone: TimeZone) -> String {
        // Gregorian weekday: 1 is Sunday through 7 Saturday, whatever the locale.
        let weekday = Instant.calendar(zone).component(.weekday, from: date)
        return weekdayAbbr[weekday - 1]
    }

    /// "JUL" for the local month `date` falls in on the wall clock of `zone`.
    public static func month(_ date: Date, zone: TimeZone) -> String {
        monthAbbr[Instant.localYMD(date, zone).month - 1]
    }

    /// "23 JUL"
    public static func dayMonth(_ date: Date, zone: TimeZone) -> String {
        "\(Instant.localYMD(date, zone).day) \(month(date, zone: zone))"
    }

    /// "MAY 2027"
    public static func monthYear(_ date: Date, zone: TimeZone) -> String {
        "\(month(date, zone: zone)) \(Instant.localYMD(date, zone).year)"
    }

    /// Joins two formatted strings with the house en dash (never an em dash).
    public static func enDashRange(_ a: String, _ b: String) -> String {
        "\(a) \u{2013} \(b)"
    }

    /// Roman numerals for a value rounded half away from zero, never below I.
    public static func toRoman(_ value: Double) -> String {
        let rounded = value.rounded(.toNearestOrAwayFromZero)
        // A value outside 32-bit range, or not a number, prints as I instead
        // of trapping on the conversion to Int.
        var n = 1
        if rounded.isFinite, rounded >= Double(Int32.min), rounded <= Double(Int32.max) {
            n = max(1, Int(rounded))
        }
        var output = ""
        for (amount, symbol) in roman {
            while n >= amount {
                output += symbol
                n -= amount
            }
        }
        return output
    }

    /// Roman numerals for a whole number (a house, a section), never below I.
    public static func toRoman(_ value: Int) -> String {
        toRoman(Double(value))
    }

    /// "WATER-BEARER" becomes "Water-Bearer", for dropping a capitals label into prose.
    public static func properCase(_ s: String) -> String {
        let lower = s.lowercased()
        var output = ""
        output.reserveCapacity(lower.utf8.count)
        var startOfPart = true
        for ch in lower {
            if ch.isWhitespace || ch == "-" {
                output.append(ch)
                startOfPart = true
                continue
            }
            if startOfPart {
                output += String(ch).uppercased()
            } else {
                output.append(ch)
            }
            startOfPart = false
        }
        return output
    }

    /// "12°34′" for a degree within a sign.
    public static func degree(_ degreeInSign: Double) -> String {
        let whole = Int(degreeInSign.rounded(.down))
        let minutes = Int(((degreeInSign - Double(whole)) * 60).rounded(.down))
        return "\(whole)\u{00B0}\(twoDigits(minutes))\u{2032}"
    }

    /// C#'s "00" custom format: at least two digits, the sign kept in front.
    private static func twoDigits(_ n: Int) -> String {
        let digits = String(n.magnitude)
        let padded = digits.count < 2 ? "0" + digits : digits
        return n < 0 ? "-" + padded : padded
    }
}
