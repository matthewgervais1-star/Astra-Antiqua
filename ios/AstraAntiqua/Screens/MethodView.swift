import AstraCore
import SwiftUI

/// The method: the numbers the app runs, which are the numbers it publishes,
/// and the sources and interpretive notes behind the five pantheons. Port of
/// the MAUI MethodPage.
struct MethodView: View {
    @Environment(\.culture) private var culture

    init() {}

    private var store: ContentStore { Content.store }

    var body: some View {
        Page(title: "The method") {
            NaveHead(kicker: "What is computed, and how", headline: "The method")

            SectionDivider(label: "The orb table")
            ForEach(store.aspectRules, id: \.self) { rule in
                orbRow(rule)
            }
            Inset {
                Caption(text: orbNote)
            }

            ForEach(store.method.sections.indices, id: \.self) { i in
                sectionBlock(store.method.sections[i])
            }

            SectionDivider(label: "Notes on the five")
            ForEach(store.method.notes.indices, id: \.self) { i in
                noteRow(store.method.notes[i])
            }

            SectionDivider(label: "Sources")
            ForEach(store.method.sources.indices, id: \.self) { i in
                sourceRow(store.method.sources[i])
            }
        }
    }

    private var orbNote: String {
        "Tighter is louder · whole-sign houses · a long transit holds within \(Self.whole(TransitSpans.spanOrb))° of exact · "
            + "positions from the same ephemeris web and Android use"
    }

    /// The aspect's glyph in a 36pt column, its kind, and its angle and orb.
    private func orbRow(_ rule: AspectRule) -> some View {
        let glyph = store.banks.aspectGlyph(rule.kind)
        let numbers = "\(Self.whole(rule.angle))° within \(Self.whole(rule.orb))°"
        return RowBody {
            HStack(alignment: .top, spacing: 0) {
                Symbol(glyph: glyph)
                    .frame(width: 36)
                    .frame(maxHeight: .infinity)
                Title(text: rule.kind.rawValue.capitalized, size: 17)
                Caption(text: numbers)
                    .fixedSize()
            }
            .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func sectionBlock(_ section: MethodSection) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            SectionDivider(label: section.heading)
            ForEach(section.paragraphs.indices, id: \.self) { i in
                Inset { Prose(text: section.paragraphs[i]) }
            }
        }
    }

    private func noteRow(_ note: InterpretiveNote) -> some View {
        let cultures = note.cultures.map { store.cultureCopy($0).label }.joined(separator: " · ")
        return RowBody {
            Caption(text: cultures, color: Ink.accent(culture))
            Title(text: note.title, size: 17)
            Prose(text: note.body)
        }
    }

    private func sourceRow(_ source: SourceReference) -> some View {
        RowBody {
            VStack(alignment: .leading, spacing: 2) {
                Title(text: "\(source.author), \(source.title)", size: 16)
                Caption(text: source.detail)
            }
        }
    }

    /// C#'s "0" format: a whole number, rounded half away from zero.
    private static func whole(_ value: Double) -> String {
        String(Int(value.rounded(.toNearestOrAwayFromZero)))
    }
}
