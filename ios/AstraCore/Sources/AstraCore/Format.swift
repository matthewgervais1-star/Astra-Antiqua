import Foundation

/// The numeric rules the named formats share (web/src/strings/formats.ts and
/// web/src/components/horizons/format.ts). The word lists (months, weekdays,
/// counts, ordinals, signs) and the named date formats live in `Formats`,
/// read from shared/strings/formats.json; this file keeps only the rules that
/// need no word list.
public enum Format {
    private static let roman: [(amount: Int, symbol: String)] = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
        (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]

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

    /// F5 `angle.degMin`: "12°34′". Degree unpadded, minutes two digits and
    /// rounded half up (web's Math.round); a value under 30 that rounds to
    /// 30°00′ prints 29°59′, so a body never reads as standing in the next sign.
    public static func degree(_ degrees: Double) -> String {
        let v = max(0, degrees)
        let total = Int((v * 60 + 0.5).rounded(.down))
        var deg = total / 60
        var min = total - deg * 60
        if v < 30 && deg >= 30 {
            deg = 29
            min = 59
        }
        return "\(deg)\u{00B0}\(min < 10 ? "0" : "")\(min)\u{2032}"
    }
}
