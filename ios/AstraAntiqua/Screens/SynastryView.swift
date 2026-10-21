import AstraCore
import SwiftUI

/// Two charts read against each other. This surface keeps one birth record,
/// so the second party is entered for the reading and never stored: the
/// bond lives in this screen's state and goes when the screen does.
/// Port of SynastryPage.cs.
struct SynastryView: View {
    /// Which birth form is pushed: the reader's own (no chart yet) or the second person's.
    private enum BirthForm: Hashable {
        case own, theirs
    }

    /// What a reading of the bond was made for: one entry of the second
    /// person, against one record of the reader's own.
    private struct BondKey: Equatable {
        let generation: Int
        let birth: SavedBirth?
    }

    @Environment(AppState.self) private var state
    @State private var theirs: BirthEntry?
    @State private var bonds: [CrossAspect]?
    @State private var generation = 0
    @State private var readFor: BondKey?
    @State private var form: BirthForm?

    init() {}

    var body: some View {
        Page(title: "Synastry") {
            NaveHead(kicker: "The bond between two skies", headline: "Synastry")
            if let birth = state.birth, state.chart != nil {
                if let theirs {
                    bond(birth: birth, theirs: theirs)
                } else {
                    Inset {
                        Prose(text: "Your chart is on this device as \(birth.name). Enter the second person's birth to read the bond. Nothing about them is saved.")
                    }
                    ActionButton(title: "Enter the second birth") { form = .theirs }
                }
            } else {
                Panel {
                    Prose(text: "A synastry is read between two charts. There is none on this device yet.")
                }
                ActionButton(title: "Cast your chart") { form = .own }
            }
        }
        // BirthView dismisses itself once the entry is handed back or saved.
        .navigationDestination(item: $form) { which in
            switch which {
            case .own:
                BirthView(mode: .own)
            case .theirs:
                BirthView(mode: .other, onEntered: { entry in entered(entry) })
            }
        }
        .task(id: BondKey(generation: generation, birth: state.birth)) { await read() }
    }

    private func entered(_ entry: BirthEntry) {
        theirs = entry
        bonds = nil
        readFor = nil
        generation += 1
    }

    private func readAnother() {
        theirs = nil
        bonds = nil
        readFor = nil
        generation += 1
    }

    /// Casts the second chart off the main thread and reads every contact
    /// between the two, tightest first (ties keep their order).
    private func read() async {
        let key = BondKey(generation: generation, birth: state.birth)
        guard let theirs, let mine = state.chart, readFor != key else { return }
        bonds = nil
        let rules = state.store.aspectRules
        let mineLongitudes = mine.longitudes
        let contacts = await Task.detached(priority: .userInitiated) { () -> [CrossAspect] in
            let chart = NatalChart.cast(
                theirs.resolve().utc,
                latitude: theirs.input.latitude,
                longitude: theirs.input.longitude,
                rules: rules)
            let all = CrossAspects.compute(mineLongitudes, chart.longitudes, rules: rules)
            return CrossAspects.tightest(all, count: all.count)
        }.value
        guard !Task.isCancelled else { return }
        bonds = contacts
        readFor = key
    }

    @ViewBuilder
    private func bond(birth: SavedBirth, theirs: BirthEntry) -> some View {
        if let bonds {
            let words = Words(state.cultureOrDefault, zone: state.zone)
            Inset {
                Caption(text: "\(birth.name) and \(theirs.name) · \(bonds.count) contacts in orb", center: true)
            }
            if theirs.estimated {
                Inset {
                    Caption(
                        text: "The birth zone is estimated from the place's longitude · a transition date may be off by up to an hour",
                        color: Ink.conflict)
                }
            }

            if bonds.isEmpty {
                Panel {
                    Caption(text: "Nothing between these two charts is in orb")
                }
            }

            ForEach(Array(bonds.enumerated()), id: \.offset) { index, contact in
                if index == 0 { SectionDivider(label: "The tightest five") }
                if index == 5 { SectionDivider(label: "Every other contact") }
                contactRow(contact, words: words)
            }

            Panel {
                Caption(text: "Nothing about the second person is saved · this reading lives only as long as the screen does")
            }
            ActionButton(title: "Read another bond") { readAnother() }
        } else {
            Working(text: "Reading the bond…")
        }
    }

    private func contactRow(_ contact: CrossAspect, words: Words) -> some View {
        let banks = state.store.banks
        let line = "\(words.symbol(contact.from)) \(banks.aspectGlyph(contact.kind)) \(words.symbol(contact.to)) · "
            + "\(contact.kind.rawValue) · \(String(format: "%.1f", contact.orb))°"
        let verbLine = "Your \(words.deity(contact.from)) \(banks.aspectVerb(words.culture, contact.kind)) their \(words.deity(contact.to))."
        return RowBody {
            Caption(text: line, color: contact.kind.isHard ? Ink.conflict : Ink.harmony)
            Title(text: verbLine, size: 17)
            Prose(text: banks.pairTheme(contact.from, contact.to))
        }
    }
}
