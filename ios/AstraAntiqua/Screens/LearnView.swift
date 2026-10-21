import AstraCore
import SwiftUI

/// The seven Learn sections, as web lists them. Port of the MAUI LearnPage.
struct LearnView: View {
    @Environment(\.culture) private var culture

    init() {}

    private var sections: [LearnSection] {
        Content.store.learn.sections.sorted { $0.n < $1.n }
    }

    var body: some View {
        Page(title: "Learn") {
            NaveHead(kicker: "How the reading is made", headline: "Learn")
            ForEach(sections) { section in
                sectionRow(section)
            }
        }
    }

    private func sectionRow(_ section: LearnSection) -> some View {
        LinkRow(destination: {
            LearnSectionView(section: section)
        }, content: {
            Caption(text: Format.toRoman(section.n), color: Ink.accent(culture))
            Title(text: section.title, size: 19)
            Prose(text: section.blurb, color: Ink.dim)
        })
    }
}

/// One Learn section: web's own prose, block for block, then the reference
/// table the section is built around. Port of the MAUI LearnSectionPage.
struct LearnSectionView: View {
    @Environment(AppState.self) private var state
    @Environment(\.culture) private var culture
    let section: LearnSection

    init(section: LearnSection) {
        self.section = section
    }

    private var store: ContentStore { state.store }

    /// The culture in force, whose name fills a kicker's %s.
    private var label: String { Words(state.cultureOrDefault, zone: state.zone).cultureLabel }

    var body: some View {
        Page(title: section.title) {
            ForEach(section.blocks.indices, id: \.self) { i in
                blockView(section.blocks[i])
            }
            table
        }
    }

    // MARK: Blocks

    @ViewBuilder
    private func blockView(_ block: LearnBlock) -> some View {
        switch block.kind {
        case "head":
            NaveHead(kicker: (block.kicker ?? "").replacingOccurrences(of: "%s", with: label), headline: block.text)
        case "divider":
            SectionDivider(label: block.text)
        case "heading":
            Title(text: block.text, size: 20)
                .padding(.horizontal, Metrics.gutter)
                .padding(.top, 16)
                .padding(.bottom, 4)
        default:
            Inset { Prose(text: block.text) }
        }
    }

    // MARK: Tables

    @ViewBuilder
    private var table: some View {
        switch section.table ?? "" {
        case "PLANET_VERBS":
            SectionDivider(label: "The bodies as verbs")
            ForEach(store.learn.planetVerbs.indices, id: \.self) { i in
                verbRow(store.learn.planetVerbs[i])
            }
        case "ZODIAC_SIGNS":
            SectionDivider(label: "The twelve signs")
            ForEach(ZodiacSign.allCases, id: \.self) { sign in
                signRow(store.signInfo(sign))
            }
        case "HOUSES":
            SectionDivider(label: "The twelve houses")
            ForEach(1...12, id: \.self) { h in
                houseRow(h)
            }
        case "HOUSE_SYSTEMS":
            SectionDivider(label: "Three systems")
            ForEach(store.learn.houseSystems.indices, id: \.self) { i in
                systemRow(store.learn.houseSystems[i])
            }
        case "ASPECTS":
            SectionDivider(label: "The five, as \(label) rules them")
            ForEach(store.aspectRules, id: \.self) { rule in
                aspectRow(rule)
            }
        default:
            EmptyView()
        }
    }

    /// The symbol in a 36pt column, the body's name in a 110pt column, its verb.
    private func verbRow(_ v: PlanetVerb) -> some View {
        RowBody {
            HStack(alignment: .top, spacing: 0) {
                Symbol(glyph: v.symbol)
                    .frame(width: 36)
                    .frame(maxHeight: .infinity)
                Title(text: v.name, size: 17)
                    .frame(width: 110, alignment: .leading)
                Prose(text: v.verb, italic: true)
            }
            .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func signRow(_ s: ZodiacSignRecord) -> some View {
        RowBody {
            Caption(text: "\(s.dates) · \(s.element) · \(s.modality)", color: Ink.accent(culture))
            Title(text: "\(s.symbol) \(s.sign.name)", size: 19)
            Caption(text: s.traits)
            Prose(text: s.blurb)
        }
    }

    private func houseRow(_ h: Int) -> some View {
        let house = store.house(h)
        let group = store.banks.houseGroupName(state.cultureOrDefault, h)
        return RowBody {
            Caption(text: "\(house.ordinal) house · \(group)", color: Ink.accent(culture))
            Title(text: house.title, size: 18)
            Prose(text: house.domain)
        }
    }

    private func systemRow(_ system: HouseSystem) -> some View {
        let line = system.ours ? "\(system.age) · the one this app uses" : system.age
        return RowBody {
            Caption(text: line, color: system.ours ? Ink.accent(culture) : Ink.dim)
            Title(text: system.name, size: 18)
            Prose(text: system.body)
        }
    }

    private func aspectRow(_ rule: AspectRule) -> some View {
        let kind = rule.kind
        let glyph = store.banks.aspectGlyph(kind)
        let line = "\(glyph) \(kind.rawValue.capitalized) · \(Self.whole(rule.angle))° within \(Self.whole(rule.orb))°"
        let geometry = store.learn.aspectGeometry[kind] ?? ""
        let ruling = store.learn.aspectRulings[CultureKind(state.cultureOrDefault, kind)] ?? ""
        return RowBody {
            Caption(text: line, color: kind.isHard ? Ink.conflict : Ink.harmony)
            Prose(text: geometry)
            Prose(text: ruling, italic: true)
        }
    }

    /// C#'s "0" format: a whole number, rounded half away from zero.
    private static func whole(_ value: Double) -> String {
        String(Int(value.rounded(.toNearestOrAwayFromZero)))
    }
}
