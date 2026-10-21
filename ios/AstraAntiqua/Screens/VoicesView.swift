import AstraCore
import SwiftUI

/// The five voices: one computed sky, five theologies it passes through.
/// Port of the MAUI VoicesPage.
struct VoicesView: View {
    init() {}

    var body: some View {
        Page(title: "The five voices") {
            NaveHead(kicker: "One sky · five theologies", headline: "The five voices")
            Inset {
                Prose(text: "Every culture reads the same computed sky. What changes is the theology it must pass through.")
            }
            ForEach(Culture.allCases, id: \.self) { culture in
                cultureRow(culture)
            }
        }
    }

    /// One culture: its Jupiter glyph, its name and its tagline, in its own accent.
    private func cultureRow(_ culture: Culture) -> some View {
        let copy = Content.store.cultureCopy(culture)
        let accent = Ink.accent(culture)
        return LinkRow(destination: {
            VoiceView(culture: culture)
        }, content: {
            HStack(alignment: .center, spacing: 16) {
                GlyphView(culture: culture, planet: .jupiter, size: 34, tint: accent)
                VStack(alignment: .leading, spacing: 4) {
                    Title(text: copy.label, size: 21, color: accent)
                    Prose(text: copy.tagline, italic: true)
                }
            }
        })
    }
}

/// One culture: its subtitle and the ten gods it seats, each with its glyph,
/// epithet and line of myth. Port of the MAUI VoicePage.
struct VoiceView: View {
    @Environment(AppState.self) private var state
    let culture: Culture

    init(culture: Culture) {
        self.culture = culture
    }

    var body: some View {
        let copy = Content.store.cultureCopy(culture)
        Page(title: Self.enumName(culture)) {
            NaveHead(kicker: copy.tagline, headline: copy.label, sub: copy.subtitle)
            ForEach(Planet.allCases, id: \.self) { planet in
                if planet == .uranus {
                    SectionDivider(label: "Received")
                }
                deityRow(planet)
            }
            if state.culture != culture {
                ActionButton(title: "Read in the voice of \(copy.label)") {
                    state.chooseCulture(culture)
                }
            }
        }
    }

    /// One god: the glyph (received bodies in the culture's accent), the
    /// body and the glyph's honesty status, the name and epithet, and the
    /// inscription.
    private func deityRow(_ planet: Planet) -> some View {
        let store = Content.store
        let accent = Ink.accent(culture)
        let deity = store.deity(culture, planet)
        let glyph = store.glyph(culture, planet)
        let label = Words(culture, zone: state.zone).label(planet)
        let contested = deity.contested ? " · contested" : ""
        let line = "\(label) · glyph \(glyph.status.rawValue)\(contested)"
        let tint = planet.isReceived ? accent : Ink.bone
        return RowBody {
            HStack(alignment: .center, spacing: 12) {
                GlyphView(culture: culture, planet: planet, size: 34, tint: tint)
                    .frame(width: 44)
                VStack(alignment: .leading, spacing: 4) {
                    Caption(text: line, color: accent)
                    Title(text: "\(deity.name), \(deity.epithet)", size: 17)
                    Prose(text: store.banks.inscription(culture, planet), italic: true)
                }
            }
        }
    }

    /// The culture as the C# enum prints it ("Egypt"), the MAUI page's title.
    private static func enumName(_ culture: Culture) -> String {
        culture.rawValue.capitalized
    }
}

/// The translation matrix: ten bodies across five pantheons. Port of the
/// MAUI MatrixPage.
struct MatrixView: View {
    @Environment(AppState.self) private var state

    init() {}

    private var words: Words { Words(state.cultureOrDefault, zone: state.zone) }

    var body: some View {
        Page(title: "The matrix") {
            NaveHead(kicker: "One sky · ten bodies · five theologies", headline: "The matrix")
            ForEach(Planet.allCases, id: \.self) { planet in
                if planet == .uranus {
                    Rule()
                    Inset {
                        Caption(text: "The three below the rule are received: no ancient culture named them, and each is admitted under a native name.")
                    }
                }
                bodyRow(planet)
            }
        }
    }

    /// One body: its symbol and name, then its god in each of the five.
    private func bodyRow(_ planet: Planet) -> some View {
        let heading = "\(words.symbol(planet)) \(words.label(planet))"
        return RowBody {
            VStack(alignment: .leading, spacing: 6) {
                Caption(text: heading, color: Ink.bone)
                ForEach(Culture.allCases, id: \.self) { culture in
                    pantheonLine(culture, planet)
                }
            }
        }
    }

    /// The glyph in a 30pt column, the culture in a 92pt column, the god's name.
    private func pantheonLine(_ culture: Culture, _ planet: Planet) -> some View {
        let accent = Ink.accent(culture)
        let label = Content.store.cultureCopy(culture).label
        let name = Content.store.deity(culture, planet).name
        return HStack(alignment: .top, spacing: 8) {
            GlyphView(culture: culture, planet: planet, size: 22, tint: accent)
                .frame(width: 30)
                .frame(maxHeight: .infinity)
            Caption(text: label, color: accent)
                .frame(width: 92, alignment: .leading)
            Title(text: name, size: 16)
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}
