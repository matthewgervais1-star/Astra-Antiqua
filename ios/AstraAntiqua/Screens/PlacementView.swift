import AstraCore
import SwiftUI

/// One placement: the deity the culture names it by, the line of myth under
/// the name, the body's domain, the universal sign reading, the house it
/// stands in, and the aspects it makes. Port of the MAUI PlacementPage.
struct PlacementView: View {
    @Environment(AppState.self) private var state
    @Environment(\.culture) private var culture
    let planet: Planet

    init(planet: Planet) {
        self.planet = planet
    }

    private var words: Words { Words(state.cultureOrDefault, zone: state.zone) }

    var body: some View {
        // The MAUI page is titled with the enum's name: "Sun", "Moon".
        Page(title: planet.rawValue.capitalized) {
            if let chart = state.chart, let reading = state.reading {
                let p = reading.placements[planet.index]
                let position = chart[planet]

                headSection(p, position)

                SectionDivider(label: "What the body governs")
                Inset { Prose(text: p.domain) }

                SectionDivider(label: "In \(p.sign.name)")
                Inset { Prose(text: p.signReading) }

                houseSection(p, position)
                aspectSection(reading)
                recordSection()
            } else {
                PlacementsView.NeedsChart(why: "There is no chart on this device yet.")
            }
        }
    }

    /// The glyph over the deity's name and epithet, the status line and the
    /// cultural line.
    @ViewBuilder
    private func headSection(_ p: PlanetPlacement, _ position: BodyPosition) -> some View {
        let received = planet.isReceived
        let glyph = state.store.glyph(state.cultureOrDefault, planet)
        let tint = received ? Ink.accent(culture) : Ink.bone
        let kicker = "\(words.label(planet)) in \(p.sign.name) · House \(Format.toRoman(position.house))"
        let retrograde = position.retrograde ? " · retrograde" : ""
        let receivedNote = received ? " · received" : ""
        let status = "\(p.sign.name) \(Format.degree(p.degreeInSign))\(retrograde) · glyph \(glyph.status.rawValue)\(receivedNote)"
        let glyphCulture = state.cultureOrDefault

        NaveHead(kicker: kicker, headline: p.deityName, sub: p.deityEpithet) {
            GlyphView(culture: glyphCulture, planet: planet, size: 56, tint: tint)
        }
        Inset { Caption(text: status, center: true) }
        Inset { Prose(text: p.culturalLine, italic: true) }
    }

    /// The house the body stands in: its title, what the body turns toward
    /// there, and the house's own domain.
    @ViewBuilder
    private func houseSection(_ p: PlanetPlacement, _ position: BodyPosition) -> some View {
        let house = state.store.house(position.house)
        let reading = state.store.banks.houseReading(deityName: p.deityName, planet: planet, arena: house.arena)

        SectionDivider(label: "In the \(house.ordinal) house")
        Inset {
            Title(text: house.title)
            Prose(text: reading)
            Prose(text: house.domain, color: Ink.dim)
        }
    }

    /// The aspects this body makes, when it makes any.
    @ViewBuilder
    private func aspectSection(_ reading: NatalReading) -> some View {
        let aspects = reading.aspects.filter { $0.aspect.a == planet || $0.aspect.b == planet }
        if !aspects.isEmpty {
            SectionDivider(label: "The aspects it makes")
            ForEach(aspects, id: \.self) { a in
                aspectRow(a)
            }
        }
    }

    private func aspectRow(_ a: AspectReading) -> some View {
        let kind = a.aspect.kind
        let orb = String(format: "%.1f", a.aspect.orb)
        let line = "\(kind.rawValue.capitalized) · \(orb)° from exact"
        let lineColor = kind.isHard ? Ink.conflict : Ink.harmony
        return RowBody {
            Caption(text: line, color: lineColor)
            Title(text: a.verbLine, size: 17)
            Prose(text: a.pairTheme)
        }
    }

    /// The deity's own note: the sources, any contest over the seat, and, for
    /// a received body, the statement that the reception is modern work.
    @ViewBuilder
    private func recordSection() -> some View {
        let deity = state.store.deity(state.cultureOrDefault, planet)
        SectionDivider(label: deity.contested ? "The record · contested" : "The record")
        Inset { Prose(text: deity.note, color: Ink.dim) }
    }
}
