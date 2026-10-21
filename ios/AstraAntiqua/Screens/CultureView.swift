import AstraCore
import SwiftUI

/// The five doorways. One sky is computed; the culture chosen here is the
/// voice every screen speaks in until it is changed. Port of the MAUI
/// CulturePage.
///
/// During onboarding the root shows this screen only while the device holds
/// neither a culture nor a birth, and swaps to the tabs the moment either
/// appears. Choosing a doorway there would end onboarding before the birth
/// could be entered, so the choice travels to BirthView in the environment
/// instead, and BirthView's save records it with the birth. Outside
/// onboarding the choice is made at once and the screen closes; the root
/// re-dresses every screen in the new culture on its own.
struct CultureView: View {
    let onboarding: Bool

    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    /// The doorway chosen during onboarding, carried to the birth entry.
    @State private var pending: Culture?
    @State private var showBirth = false
    /// A second tap while the first is still closing the screen would pop twice.
    @State private var leaving = false

    init(onboarding: Bool) {
        self.onboarding = onboarding
    }

    var body: some View {
        Page(title: "Choose your doorway") {
            NaveHead(kicker: "Astra Antiqua", headline: "Choose your doorway")
            Inset {
                Prose(text: "One sky is computed. Five ancient cultures read it, each in its own theology. "
                    + "Choose yours: the app renders in that culture's voice until you change it.")
            }
            Rule()
            ForEach(Culture.allCases, id: \.self) { culture in
                doorway(culture)
            }
        }
        .navigationDestination(isPresented: $showBirth) {
            BirthView(mode: .own)
                .environment(\.culture, pending)
        }
    }

    private func doorway(_ culture: Culture) -> some View {
        let copy = state.store.cultureCopy(culture)
        let accent = Ink.accent(culture)
        let chosen = (state.culture ?? pending) == culture
        return Button {
            choose(culture)
        } label: {
            RowBody {
                HStack(alignment: .center, spacing: 16) {
                    GlyphView(culture: culture, planet: .sun, size: 36, tint: accent)
                    VStack(alignment: .leading, spacing: 4) {
                        Title(text: copy.label, size: 22, color: chosen ? accent : Ink.bone)
                        Caption(text: copy.tagline, color: accent)
                        Prose(text: copy.subtitle, italic: true, color: Ink.dim)
                    }
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityAddTraits(chosen ? AccessibilityTraits.isSelected : [])
    }

    private func choose(_ culture: Culture) {
        guard !leaving else { return }
        if onboarding && state.birth == nil {
            pending = culture
            showBirth = true
            return
        }
        leaving = true
        state.chooseCulture(culture)
        if !onboarding { dismiss() }
    }
}
