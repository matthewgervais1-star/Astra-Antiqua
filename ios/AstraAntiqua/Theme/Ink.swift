import AstraCore
import SwiftUI

/// "The Instrument in the Temple": one flat ground and one muted accent per
/// culture (shared/content/palettes.json), bone and prose inks, two signals,
/// 1px rules. The same values web's tokens and Android's theme use. No
/// gradients or glow on content; the navigation layer's glass is in Glass.swift.
enum Ink {
    // Faces, by PostScript name (the same files Android ships).
    static let display = "Cinzel-Regular"
    static let displayMedium = "Cinzel-Medium"
    static let displayStrong = "Cinzel-SemiBold"
    static let prose = "Spectral-Regular"
    static let proseItalic = "Spectral-Italic"
    static let proseLight = "Spectral-Light"
    static let mono = "IBMPlexMono-Regular"
    static let monoStrong = "IBMPlexMono-Medium"
    static let symbols = "NotoSansSymbols-Regular"

    static let bone = Color(hex: "#E6DECC")
    static let proseInk = Color(hex: "#D9D1BF")
    static let dim = Color(hex: "#9A917D")
    static let faint = Color(hex: "#6F6B60")

    /// Harmony is the gold signal; conflict also carries retrograde and destructive actions.
    static let harmony = Color(hex: "#B59A55")
    static let conflict = Color(hex: "#B56B71")

    static let rule = Color(hex: "#E6DECC").opacity(0x29 / 255.0)
    static let ruleRow = Color(hex: "#E6DECC").opacity(0x1C / 255.0)

    static func ground(_ culture: Culture?) -> Color {
        Color(hex: culture.map { Content.store.palette($0).ground } ?? Content.store.neutralPalette.ground)
    }

    static func accent(_ culture: Culture?) -> Color {
        Color(hex: culture.map { Content.store.palette($0).accent } ?? Content.store.neutralPalette.accent)
    }
}

extension Color {
    /// "#rrggbb" or "#aarrggbb".
    init(hex: String) {
        var s = hex.trimmingCharacters(in: .whitespaces)
        if s.hasPrefix("#") { s.removeFirst() }
        // Scanner.scanHexInt64 is deprecated from iOS 13; the palette values
        // are bare hex digits, which UInt64(_:radix:) reads the same way.
        let value = UInt64(s, radix: 16) ?? 0
        let a, r, g, b: Double
        if s.count == 8 {
            a = Double((value >> 24) & 0xFF) / 255
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >> 8) & 0xFF) / 255
            b = Double(value & 0xFF) / 255
        } else {
            a = 1
            r = Double((value >> 16) & 0xFF) / 255
            g = Double((value >> 8) & 0xFF) / 255
            b = Double(value & 0xFF) / 255
        }
        self.init(.sRGB, red: r, green: g, blue: b, opacity: a)
    }
}

/// The corpus, loaded once from the bundle's copy of shared/content. A
/// corpus with a hole stops the app at launch with the missing cells named,
/// which is the same discipline web's buildMatrix() keeps.
enum Content {
    static let store: ContentStore = {
        guard let base = Bundle.main.resourceURL?.appendingPathComponent("content") else {
            fatalError("The app bundle has no resource folder.")
        }
        do {
            return try ContentStore(directory: base)
        } catch {
            fatalError("shared/content could not be loaded: \(error)")
        }
    }()
}
