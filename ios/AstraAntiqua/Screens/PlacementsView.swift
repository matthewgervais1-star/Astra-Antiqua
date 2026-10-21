import AstraCore
import SwiftUI

/// The ten placements, fixed at the hour of birth, and the chart's aspects.
/// Port of the MAUI PlacementsPage.
struct PlacementsView: View {
    @Environment(AppState.self) private var state
    @Environment(\.culture) private var culture

    init() {}

    private var words: Words { Words(state.cultureOrDefault, zone: state.zone) }

    var body: some View {
        Page(title: "Your chart") {
            NaveHead(kicker: "Fixed at the hour of your birth", headline: "The placements")
            if let chart = state.chart, let reading = state.reading, let birth = state.birth {
                Inset { Caption(text: risingLine(chart, birth), center: true) }
                Inset { Prose(text: reading.summary, italic: true) }

                SectionDivider(label: "Ten bodies")
                ForEach(reading.placements, id: \.planet) { p in
                    placementRow(p, position: chart[p.planet])
                }
                Inset {
                    Caption(text: "Whole-sign houses · R is retrograde, read from the body's own velocity · nothing here is estimated")
                }

                SectionDivider(label: "\(reading.aspects.count) aspects")
                ForEach(reading.aspects, id: \.self) { a in
                    aspectRow(a)
                }
            } else {
                NeedsChart(why: "The placements are read from a chart cast at the hour of a birth. There is none on this device yet.")
            }
        }
    }

    /// "Name · Place · rising Leo 12°34′"
    private func risingLine(_ chart: NatalChart, _ birth: SavedBirth) -> String {
        let rising = Format.degree(ZodiacMath.longitudeToSign(chart.ascendant).degree)
        return "\(birth.name) · \(birth.placeName) · rising \(chart.ascendantSign.name) \(rising)"
    }

    /// One body: its glyph (received bodies in the accent), the deity, the
    /// sign and degree (in the conflict ink when retrograde) and the house.
    private func placementRow(_ p: PlanetPlacement, position: BodyPosition) -> some View {
        let planet = p.planet
        let tint = planet.isReceived ? Ink.accent(culture) : Ink.bone
        let retrograde = position.retrograde ? " · R" : ""
        let line = "\(words.label(planet)) · \(p.sign.name) \(Format.degree(p.degreeInSign))\(retrograde)"
        let lineColor = position.retrograde ? Ink.conflict : Ink.dim
        let house = "House \(Format.toRoman(position.house))"
        let glyphCulture = state.cultureOrDefault
        return LinkRow(destination: {
            PlacementView(planet: planet)
        }, content: {
            HStack(alignment: .center, spacing: 12) {
                GlyphView(culture: glyphCulture, planet: planet, size: 34, tint: tint)
                    .frame(width: 44)
                VStack(alignment: .leading, spacing: 2) {
                    Title(text: p.deityName, size: 18)
                    Caption(text: line, color: lineColor)
                }
                Caption(text: house)
                    .fixedSize()
            }
        })
    }

    /// One aspect of the chart: the two symbols and the aspect's glyph, its
    /// kind and orb, the line the two deities speak, the pair's theme and the
    /// culture's reflection on the kind.
    private func aspectRow(_ a: AspectReading) -> some View {
        let kind = a.aspect.kind
        let glyph = state.store.banks.aspectGlyph(kind)
        let orb = String(format: "%.1f", a.aspect.orb)
        let line = "\(words.symbol(a.aspect.a)) \(glyph) \(words.symbol(a.aspect.b)) · \(kind.rawValue.capitalized) · \(orb)°"
        let lineColor = kind.isHard ? Ink.conflict : Ink.harmony
        return RowBody {
            Caption(text: line, color: lineColor)
            Title(text: a.verbLine, size: 17)
            Prose(text: a.pairTheme)
            Prose(text: a.culturalReflection, italic: true, color: Ink.dim)
        }
    }
}

extension PlacementsView {
    /// What the chart screens show in place of a reading when no chart is on
    /// the device: why, and the way to cast one. PlacementView uses it too.
    struct NeedsChart: View {
        let why: String
        @State private var casting = false

        init(why: String) {
            self.why = why
        }

        var body: some View {
            VStack(alignment: .leading, spacing: 0) {
                Panel { Prose(text: why) }
                ActionButton(title: "Cast your chart") { casting = true }
            }
            .navigationDestination(isPresented: $casting) {
                BirthView(mode: .own)
            }
        }
    }
}
