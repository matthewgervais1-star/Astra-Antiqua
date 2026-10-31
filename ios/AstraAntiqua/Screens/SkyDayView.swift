import AstraCore
import SwiftUI

/// Sky Day on the glass chrome: the Glass-Day board's sections in its order
/// (canvas page "Glass", Round 7), filled with the web's composition
/// (SkyDayBuilder in AstraCore). Every size, face, colour and gap is the
/// board's markup at its default levers; the IDs are the Day table P4 to P16
/// (`.superpowers/sdd/glass-build/report.md` in the design worktree).
///
/// The page is composed off the main thread when the screen appears and when
/// the culture, the chart or the UTC day changes; the long-transit search
/// takes the longest.
struct SkyDayView: View {
    @Environment(AppState.self) private var state
    var onSection: (ChromeSection) -> Void = { _ in }
    var onHorizon: (SkyHorizon) -> Void = { _ in }
    var onMenu: () -> Void = {}
    @State private var loaded: (key: SkyDayKey, page: SkyDayPage)?

    var body: some View {
        let culture = state.cultureOrDefault
        let key = SkyDayKey(culture: culture, chart: state.chart, day: DayDecreeComposer.utcDayNumber(Date()))
        GlassScreen(culture: culture, section: .sky, horizon: .day, contentBottom: SkyDayMetrics.bottom,
                    onSection: onSection, onHorizon: onHorizon, onMenu: onMenu) {
            if let loaded, loaded.key == key {
                SkyDayContent(culture: culture, page: loaded.page, onSection: onSection)
            } else {
                Working(text: "Reading the sky…")
            }
        }
        .task(id: key) {
            let store = state.store
            let zone = state.zone
            let page = await Task.detached(priority: .userInitiated) {
                SkyDayView.compose(culture: key.culture, chart: key.chart, now: Date(), zone: zone, store: store)
            }.value
            loaded = (key, page)
        }
    }

    /// The whole page, the long-transit spans included.
    nonisolated static func compose(culture: Culture, chart: NatalChart?, now: Date, zone: TimeZone,
                                    store: ContentStore) -> SkyDayPage {
        let spans = chart.map {
            LongTransitPick.spans(natal: $0.longitudes, ascendant: $0.ascendant, midheaven: $0.midheaven, now: now)
        }
        return SkyDayBuilder.build(culture: culture, now: now, zone: zone, natal: chart, spans: spans, store: store)
    }
}

/// What a composed page depends on.
struct SkyDayKey: Hashable, Sendable {
    let culture: Culture
    let chart: NatalChart?
    let day: Int
}

/// The board's numbers (Glass-Day, default levers), in points.
enum SkyDayMetrics {
    /// main padding-bottom.
    static let bottom: CGFloat = 140
    static let side: CGFloat = 24
    /// P5: glyph size and the gap above it.
    static let heroGlyph: CGFloat = 34
    static let heroGap: CGFloat = 24
    /// P6: gap above the headline.
    static let headlineGap: CGFloat = 16
    /// P7: gap above the evidence line.
    static let evidenceGap: CGFloat = 10
    /// P8: the short rule and the space above and below it.
    static let ruleWidth: CGFloat = 44
    static let ruleGap: CGFloat = 24
    /// Section labels: lever sectionGap above; 14 below (4 above the chart rows).
    static let sectionGap: CGFloat = 40
    static let labelGap: CGFloat = 14
    static let chartLabelGap: CGFloat = 4

    static let kicker = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 17.6, tracking: 11 * 0.16, color: Ink.dim, center: true)
    static let evidence = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 17.6, tracking: 11 * 0.14, color: Ink.dim, center: true)
    static let prose = CSSTextStyle(font: Ink.proseLight, size: 18, lineHeight: 18 * 1.65, color: Ink.proseInk)
    static let rowSentence = CSSTextStyle(font: Ink.prose, size: 17, lineHeight: 17 * 1.5)
    static let rowData = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 11 * 1.4, tracking: 11 * 0.1, color: Ink.dim)
    static let cardMeta = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 11 * 1.4, tracking: 11 * 0.14, color: Ink.dim)
    static let cardTitle = CSSTextStyle(font: Ink.proseSCStrong, size: 16, lineHeight: 16 * 1.45, tracking: 16 * 0.06)

    /// P6: Spectral SC, tracking .06em; Rome keeps Cinzel at .08em (2026-10-21).
    static func headline(_ culture: Culture) -> CSSTextStyle {
        culture == .rome
            ? CSSTextStyle(font: Ink.displayMedium, size: 26, lineHeight: 26 * 1.35, tracking: 26 * 0.08, center: true)
            : CSSTextStyle(font: Ink.proseSCStrong, size: 26, lineHeight: 26 * 1.35, tracking: 26 * 0.06, center: true)
    }

    /// Rules: section lines rgba(230,222,204,.16), row lines .10, the short rule .32, the card .24.
    static let sectionRule = Ink.bone.opacity(0.16)
    static let rowRule = Ink.bone.opacity(0.10)
    static let shortRule = Ink.bone.opacity(0.32)
    static let cardBorder = Ink.bone.opacity(0.24)
    static let barTrack = Ink.bone.opacity(0.14)
}

/// The page's content, from P4 down to P16.
struct SkyDayContent: View {
    let culture: Culture
    let page: SkyDayPage
    var onSection: (ChromeSection) -> Void = { _ in }

    private typealias M = SkyDayMetrics

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            CSSText(page.kicker, style: M.kicker)
                .placement("P4")
            if let hero = page.heroPlanet {
                GlyphView(culture: culture, planet: hero, size: M.heroGlyph, tint: glyphTint(hero))
                    .frame(width: M.heroGlyph, height: M.heroGlyph)
                    .accessibilityLabel("\(Content.store.deity(culture, hero).name), \(Content.store.planetCopy(hero).label)")
                    .placement("P5")
                    .frame(maxWidth: .infinity)
                    .padding(.top, M.heroGap)
            }
            CSSText(page.headline, style: M.headline(culture), isHeader: true)
                .placement("P6")
                .padding(.top, M.headlineGap)
            if !page.evidence.isEmpty {
                CSSText(page.evidence, style: M.evidence)
                    .placement("P7")
                    .padding(.top, M.evidenceGap)
            }
            Rectangle().fill(M.shortRule)
                .frame(width: M.ruleWidth, height: 1)
                .accessibilityHidden(true)
                .placement("P8")
                .frame(maxWidth: .infinity)
                .padding(.vertical, M.ruleGap)
            CSSText(page.paragraph, style: M.prose)
                .placement("P9")

            SkyDaySectionLabel(text: "THE SKY, COMPUTED")
                .placement("P10")
                .padding(.top, M.sectionGap)
                .padding(.bottom, M.labelGap)
            SkyBox(page: page)
                .placement("P11")

            if let rows = page.chartRows {
                SkyDaySectionLabel(text: "ON YOUR CHART TODAY")
                    .placement("P12")
                    .padding(.top, M.sectionGap)
                    .padding(.bottom, M.chartLabelGap)
                ForEach(Array(rows.enumerated()), id: \.offset) { i, row in
                    Button { onSection(.transits) } label: {
                        ChartTodayRow(culture: culture, row: row)
                    }
                    .buttonStyle(.plain)
                    .placement(Self.rowID(i))
                }
            }

            if let card = page.longTransit {
                SkyDaySectionLabel(text: "THE LONG TRANSIT")
                    .placement("P15")
                    .padding(.top, M.sectionGap)
                    .padding(.bottom, M.labelGap)
                Button { onSection(.transits) } label: {
                    LongTransitCardView(card: card)
                }
                .buttonStyle(.plain)
                .placement("P16")
            }
        }
        .padding(.horizontal, M.side)
    }

    /// The board draws two rows, P13 and P14; the web's day pressure can
    /// give up to four, and the rows past the second carry P14's ID with a
    /// suffix.
    static func rowID(_ i: Int) -> String {
        switch i {
        case 0: return "P13"
        case 1: return "P14"
        default: return "P14+\(i - 1)"
        }
    }

    private func glyphTint(_ planet: Planet) -> Color {
        planet.isReceived ? Ink.harmony : Ink.bone
    }
}

/// A section label between two hairlines, 11 tall.
struct SkyDaySectionLabel: View {
    let text: String

    var body: some View {
        HStack(spacing: 14) {
            Rectangle().fill(SkyDayMetrics.sectionRule).frame(height: 1)
            BoxLabel(text: text, height: 11, tracking: 11 * 0.2)
                .accessibilityAddTraits(.isHeader)
            Rectangle().fill(SkyDayMetrics.sectionRule).frame(height: 1)
        }
        .frame(height: 11)
    }
}

/// P11: the Moon, the next quarter, the season and its bar, in a 1px box.
struct SkyBox: View {
    let page: SkyDayPage

    var body: some View {
        VStack(spacing: 0) {
            dataRow("MOON", page.moon, bottom: 13, rule: true)
            dataRow(page.nextQuarterName, page.nextQuarterDate, bottom: 13, rule: true)
            dataRow("SEASON", page.season, bottom: 10, rule: false)
            VStack(spacing: 9) {
                Rectangle().fill(SkyDayMetrics.barTrack)
                    .frame(height: 3)
                    .overlay(alignment: .leading) {
                        GeometryReader { g in
                            Rectangle().fill(Ink.bone).frame(width: g.size.width * page.seasonProgress)
                        }
                    }
                    .accessibilityHidden(true)
                HStack(spacing: 0) {
                    BoxLabel(text: page.seasonStart, height: 11, tracking: 11 * 0.1)
                    Spacer(minLength: 0)
                    BoxLabel(text: page.seasonToGo, height: 11, tracking: 11 * 0.1)
                    Spacer(minLength: 0)
                    BoxLabel(text: page.seasonEnd, height: 11, tracking: 11 * 0.1)
                }
            }
            .padding(.top, 4)
            .padding(.bottom, 14)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
        .padding(1)
        .overlay(Rectangle().strokeBorder(SkyDayMetrics.sectionRule, lineWidth: 1))
    }

    private func dataRow(_ label: String, _ value: String, bottom: CGFloat, rule: Bool) -> some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                BoxLabel(text: label, size: 12, height: 16.8, tracking: 12 * 0.06)
                Spacer(minLength: 0)
                BoxLabel(text: value, size: 12, height: 16.8, tracking: 12 * 0.06, color: Ink.bone)
            }
            .padding(.top, 13)
            .padding(.bottom, bottom)
            if rule { Rectangle().fill(SkyDayMetrics.rowRule).frame(height: 1) }
        }
        .accessibilityElement(children: .combine)
    }
}

/// P13, P14: one house group's contact: the moving body's glyph, the web's
/// clause, and the board's data line built from the web's numbers.
struct ChartTodayRow: View {
    let culture: Culture
    let row: SkyDayPage.ChartRow

    var body: some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 14) {
                GlyphView(culture: culture, planet: row.planet, size: 24,
                          tint: row.planet.isReceived ? Ink.harmony : Ink.bone)
                    .frame(width: 24, height: 24)
                    .padding(.top, 3)
                    .frame(width: 26, alignment: .leading)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 6) {
                    CSSText(row.sentence, style: SkyDayMetrics.rowSentence)
                    if let data = row.data {
                        CSSText(data + (row.tone ?? ""), style: SkyDayMetrics.rowData,
                                accent: row.tension ? (suffix: row.tone ?? "", color: Ink.conflict) : nil)
                    }
                }
            }
            .padding(.vertical, 16)
            Rectangle().fill(SkyDayMetrics.rowRule).frame(height: 1)
        }
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}

/// P16: the long transit: meta line, the web's two title lines, the span's
/// progress and the passes.
struct LongTransitCardView: View {
    let card: SkyDayPage.LongTransitCard

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            CSSText(card.meta, style: SkyDayMetrics.cardMeta)
            CSSText("\(card.title1)\n\(card.title2)", style: SkyDayMetrics.cardTitle)
                .padding(.top, 10)
                .padding(.bottom, 16)
            Rectangle().fill(SkyDayMetrics.barTrack)
                .frame(height: 3)
                .overlay(alignment: .leading) {
                    GeometryReader { g in
                        Rectangle().fill(Ink.harmony).frame(width: g.size.width * card.progress)
                    }
                }
                .accessibilityHidden(true)
            HStack(spacing: 0) {
                BoxLabel(text: card.footer, height: 11, tracking: 11 * 0.1)
                Spacer(minLength: 0)
                BoxLabel(text: "READ →", height: 11, tracking: 11 * 0.1, color: Ink.bone)
            }
            .padding(.top, 10)
        }
        .padding(.top, 18)
        .padding(.horizontal, 18)
        .padding(.bottom, 16)
        .padding(1)
        .overlay(Rectangle().strokeBorder(SkyDayMetrics.cardBorder, lineWidth: 1))
        .contentShape(Rectangle())
        .accessibilityElement(children: .combine)
    }
}
