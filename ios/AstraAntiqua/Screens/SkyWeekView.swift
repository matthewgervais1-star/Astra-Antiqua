import AstraCore
import SwiftUI

/// Sky Week on the glass chrome: the Glass-Week board's sections in its
/// order (canvas page "Glass", Round 7), filled with the web's week
/// (SkyWeekBuilder in AstraCore). Every size, face, colour and gap is the
/// board's markup at its default levers; the IDs are the Week table P21 to
/// P31 and P53 (`.superpowers/sdd/glass-build/report-r3b.md` in the design
/// worktree) and the Moon behind the text, P171.
///
/// The page is composed off the main thread when the screen appears and when
/// the culture or the reader's calendar day changes. The day is read again
/// each minute and whenever the app comes back to the front, so TODAY moves
/// at the reader's midnight. The web's week reads no chart, so a change of
/// birth does not recompose it.
struct SkyWeekView: View {
    @Environment(AppState.self) private var state
    @Environment(\.scenePhase) private var scenePhase
    var onSection: (ChromeSection) -> Void = { _ in }
    var onHorizon: (SkyHorizon) -> Void = { _ in }
    var onMenu: () -> Void = {}
    /// The reader's calendar day as last read; nil until the first refresh.
    @State private var day: Int?
    /// The reader's zone as last read; a zone change on the same calendar day still recomposes.
    @State private var zoneID: String?
    @State private var loaded: (key: SkyWeekKey, page: SkyWeekPage)?

    var body: some View {
        let culture = state.cultureOrDefault
        let zone = state.zone
        let key = SkyWeekKey(culture: culture, zone: zoneID ?? zone.identifier,
                             day: day ?? SkyWeekKey.localDay(Date(), zone: zone))
        GlassScreen(culture: culture, section: .sky, horizon: .week, contentBottom: SkyWeekMetrics.bottom,
                    onSection: onSection, onHorizon: onHorizon, onMenu: onMenu) {
            if let loaded {
                SkyWeekContent(culture: loaded.key.culture, page: loaded.page)
            } else {
                Working(text: "Reading the sky…")
            }
        }
        .task(id: key) { await load(key) }
        .task {
            while !Task.isCancelled {
                do { try await Task.sleep(for: .seconds(60)) } catch { return }
                refreshDay()
            }
        }
        .onChange(of: scenePhase) { _, phase in
            if phase == .active { refreshDay() }
        }
    }

    private func refreshDay() {
        let zone = state.zone
        let now = SkyWeekKey.localDay(Date(), zone: zone)
        if now != day { day = now }
        if zone.identifier != zoneID { zoneID = zone.identifier }
    }

    private func load(_ key: SkyWeekKey) async {
        let store = state.store
        let zone = TimeZone(identifier: key.zone) ?? state.zone
        let page = await Task.detached(priority: .userInitiated) {
            SkyWeekBuilder.build(culture: key.culture, now: Date(), zone: zone, store: store)
        }.value
        guard !Task.isCancelled else { return }
        loaded = (key, page)
    }
}

/// What a composed week depends on: the culture, the reader's zone and
/// calendar day, which decide the week and its TODAY row.
struct SkyWeekKey: Hashable, Sendable {
    let culture: Culture
    /// The zone's identifier, "Europe/Rome".
    let zone: String
    let day: Int

    /// 20261021 for 21 Oct 2026 in `zone`.
    static func localDay(_ date: Date, zone: TimeZone) -> Int {
        let ymd = Instant.localYMD(date, zone)
        return ymd.year * 10_000 + ymd.month * 100 + ymd.day
    }
}

/// The board's numbers (Glass-Week, default levers), in points.
enum SkyWeekMetrics {
    /// main padding-bottom.
    static let bottom: CGFloat = 120
    static let side: CGFloat = 24
    /// P22: gap above the headline.
    static let headlineGap: CGFloat = 18
    /// P23: gap above the count line.
    static let countGap: CGFloat = 10
    /// P24: the short rule, 24 above it and 8 below.
    static let ruleWidth: CGFloat = 44
    static let ruleTop: CGFloat = 24
    static let ruleBottom: CGFloat = 8

    /// P53: the Moon band, full width, 136 tall; its five lines start at
    /// x 194, the disc's 170 on screen plus the side.
    static let bandHeight: CGFloat = 136
    static let bandLabelX: CGFloat = 194

    /// P25 to P31: a grid of 48 and the rest, 16 apart; lever sectionGap 18
    /// above and below; 6 between weekday and number, 8 between shorthand and line.
    static let dateColumn: CGFloat = 48
    static let columnGap: CGFloat = 16
    static let rowPadding: CGFloat = 18
    static let dateGap: CGFloat = 6
    static let lineGap: CGFloat = 8
    /// P27, the framed TODAY row: padding 18 14, margin 10 -14, border .32.
    static let todayInset: CGFloat = 14
    static let todayMargin: CGFloat = 10

    static let kicker = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 17.6, tracking: 11 * 0.16, color: Ink.dim, center: true)
    static let count = CSSTextStyle(font: Ink.mono, size: 11, lineHeight: 17.6, tracking: 11 * 0.14, color: Ink.dim, center: true)
    static let line = CSSTextStyle(font: Ink.proseLight, size: 16.5, lineHeight: 16.5 * 1.6, color: Ink.proseInk)

    /// P22: Spectral SC, tracking .06em; Rome keeps Cinzel at .08em (2026-10-21).
    static func headline(_ culture: Culture) -> CSSTextStyle {
        SkyDayMetrics.headline(culture)
    }

    /// Rules: the short rule .32, row lines .10, the TODAY frame .32.
    static let shortRule = Ink.bone.opacity(0.32)
    static let rowRule = Ink.bone.opacity(0.10)
    static let todayBorder = Ink.bone.opacity(0.32)
}

/// P171: the Moon behind the text, from the board's renderVals (discSize,
/// discShow, moonRate, moonAlpha) and `measure-moon-parallax.json`.
enum MoonParallax {
    /// P171: the disc's diameter (lever discSize).
    static let discSize: CGFloat = 220
    /// P171: the part on screen from the left edge (lever discShow); the
    /// other 50 run off the screen.
    static let discShow: CGFloat = 170
    /// P171: points the disc rises per point of scroll (lever moonRate).
    static let rate: CGFloat = 0.5
    /// P171: under Reduce Motion the disc moves with the text.
    static let reducedRate: CGFloat = 1
    /// P171: the lit part, bone at this opacity (lever moonAlpha).
    static let litAlpha = 0.1
    /// P171: the disc's 1 pt outline, rgba(230,222,204,.24).
    static let strokeAlpha = 0.24
    static let strokeWidth: CGFloat = 1
}

/// The page's content, from P21 down to P31, with the Moon (P171) drawn
/// under all of it.
struct SkyWeekContent: View {
    let culture: Culture
    let page: SkyWeekPage

    private typealias M = SkyWeekMetrics

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            CSSText(page.kicker, style: M.kicker)
                .placement("P21")
            CSSText(page.headline, style: M.headline(culture), isHeader: true)
                .placement("P22")
                .padding(.top, M.headlineGap)
            CSSText(page.count, style: M.count)
                .placement("P23")
                .padding(.top, M.countGap)
            Rectangle().fill(M.shortRule)
                .frame(width: M.ruleWidth, height: 1)
                .accessibilityHidden(true)
                .placement("P24")
                .frame(maxWidth: .infinity)
                .padding(.top, M.ruleTop)
                .padding(.bottom, M.ruleBottom)
            // Probed before the full-bleed margin, so P53 reports 0 to 390.
            MoonFactsBand(lines: page.moonLines)
                .placement("P53")
                .anchorPreference(key: MoonBandBoundsKey.self, value: .bounds) { $0 }
                .padding(.horizontal, -M.side)
            ForEach(Array(page.rows.enumerated()), id: \.offset) { i, row in
                if row.isToday {
                    SkyWeekRow(row: row)
                        .padding(.vertical, M.rowPadding)
                        .padding(.horizontal, M.todayInset)
                        .padding(1)
                        .overlay(Rectangle().strokeBorder(M.todayBorder, lineWidth: 1))
                        .placement(Self.rowID(i))
                        .padding(.horizontal, -M.todayInset)
                        .padding(.vertical, M.todayMargin)
                } else {
                    VStack(spacing: 0) {
                        SkyWeekRow(row: row)
                            .padding(.vertical, M.rowPadding)
                        Rectangle().fill(M.rowRule).frame(height: 1)
                    }
                    .placement(Self.rowID(i))
                }
            }
        }
        .padding(.horizontal, M.side)
        .backgroundPreferenceValue(MoonBandBoundsKey.self) { anchor in
            GeometryReader { g in
                if let anchor {
                    MoonBehindText(bandMidY: g[anchor].midY, lit: page.moonLit, waxing: page.moonWaxing,
                                   ground: Ink.ground(culture))
                }
            }
        }
    }

    /// P25 to P31, Monday to Sunday.
    static func rowID(_ i: Int) -> String { "P\(25 + i)" }
}

/// The Moon band's bounds, for the disc behind the text to centre on.
private struct MoonBandBoundsKey: PreferenceKey {
    static let defaultValue: Anchor<CGRect>? = nil
    static func reduce(value: inout Anchor<CGRect>?, nextValue: () -> Anchor<CGRect>?) {
        value = value ?? nextValue()
    }
}

/// P53: the band the Moon's disc sits behind; its five facts at x 194.
struct MoonFactsBand: View {
    let lines: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(lines.enumerated()), id: \.offset) { i, line in
                // MOON and the quarter dim; the phase and the lit share in bone.
                BoxLabel(text: line, height: 11 * 1.8, tracking: 11 * 0.14,
                         color: i == 1 || i == 2 ? Ink.bone : Ink.dim)
            }
        }
        .padding(.leading, SkyWeekMetrics.bandLabelX)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .frame(height: SkyWeekMetrics.bandHeight)
        .accessibilityElement(children: .combine)
    }
}

/// P171: the Moon's disc under the text, its centre on the band's at rest.
/// It rises `MoonParallax.rate` points for each point the page scrolls, so
/// within the scrolling content it is moved down by the rest of the scroll.
/// A screenshot run's drawn scroll (the environment) places it in layout,
/// where the P171 probe measures it; the live scroll moves it at draw time
/// (`visualEffect`), read from its own geometry, with no state written per
/// frame.
struct MoonBehindText: View {
    @Environment(\.glassScrollOffset) private var scroll
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let bandMidY: CGFloat
    let lit: Double
    let waxing: Bool
    let ground: Color

    private typealias P = MoonParallax

    var body: some View {
        let rate = reduceMotion ? P.reducedRate : P.rate
        MoonDiscShape(lit: lit, waxing: waxing, ground: ground)
            .frame(width: P.discShow, height: P.discSize)
            .accessibilityHidden(true)
            .placement("P171")
            .position(x: P.discShow / 2, y: bandMidY + (1 - rate) * scroll)
            .visualEffect { content, proxy in
                let live = proxy.frame(in: .named(GlassScroll.contentSpace)).minY - proxy.frame(in: .scrollView).minY
                return content.offset(y: (1 - rate) * max(0, live))
            }
    }
}

/// The disc, 220 across with its centre 50 in from the frame's left edge
/// (the frame shows 170 of it): filled with the ground, outlined at .24,
/// and the lit part in bone at .1. The terminator is the half-ellipse the
/// board draws, of semi-axis r × |1 − 2 × lit|, on the lit side's far half
/// for a gibbous Moon and the near half for a crescent; a waxing Moon is lit
/// on the right. The outline's outer half falls outside the frame at the
/// top, the bottom and the right, where the board's SVG (viewBox 220 tall,
/// circle r 110, stroke 1) clips it too; kept as the board draws it.
struct MoonDiscShape: View {
    let lit: Double
    let waxing: Bool
    let ground: Color

    var body: some View {
        Canvas { context, size in
            let r = MoonParallax.discSize / 2
            let centre = CGPoint(x: MoonParallax.discShow - r, y: size.height / 2)
            let disc = Path(ellipseIn: CGRect(x: centre.x - r, y: centre.y - r, width: 2 * r, height: 2 * r))
            context.fill(disc, with: .color(ground))
            context.fill(Self.litPath(centre: centre, r: r, lit: lit, waxing: waxing),
                         with: .color(Ink.bone.opacity(MoonParallax.litAlpha)))
            context.stroke(disc, with: .color(Ink.bone.opacity(MoonParallax.strokeAlpha)),
                           lineWidth: MoonParallax.strokeWidth)
        }
    }

    /// The lit limb from the top to the bottom, then the terminator back.
    static func litPath(centre: CGPoint, r: CGFloat, lit: Double, waxing: Bool) -> Path {
        let f = min(1, max(0, lit))
        let side: CGFloat = waxing ? 1 : -1
        let terminator = CGFloat(1 - 2 * f)
        let steps = 96
        var path = Path()
        for i in 0...steps {
            let a = -Double.pi / 2 + Double.pi * Double(i) / Double(steps)
            let p = CGPoint(x: centre.x + side * r * CGFloat(cos(a)), y: centre.y + r * CGFloat(sin(a)))
            if i == 0 { path.move(to: p) } else { path.addLine(to: p) }
        }
        for i in 0...steps {
            let a = Double.pi / 2 - Double.pi * Double(i) / Double(steps)
            path.addLine(to: CGPoint(x: centre.x + side * terminator * r * CGFloat(cos(a)),
                                     y: centre.y + r * CGFloat(sin(a))))
        }
        path.closeSubpath()
        return path
    }
}

/// P25 to P31: one day. Weekday over the day's number at the left; the
/// shorthand (with TODAY at the right on the framed row) over the web's line.
struct SkyWeekRow: View {
    let row: SkyWeekPage.Row

    private typealias M = SkyWeekMetrics

    var body: some View {
        HStack(alignment: .top, spacing: M.columnGap) {
            VStack(alignment: .leading, spacing: M.dateGap) {
                BoxLabel(text: row.weekday, height: 11, tracking: 11 * 0.14)
                BoxLabel(text: row.dayNumber, font: Ink.proseSCStrong, size: 24, height: 24, color: Ink.bone)
            }
            .frame(width: M.dateColumn, alignment: .leading)
            VStack(alignment: .leading, spacing: M.lineGap) {
                HStack(spacing: 8) {
                    BoxLabel(text: row.shorthand, height: 11 * 1.4, tracking: 11 * 0.1,
                             color: row.tension ? Ink.conflict : Ink.dim)
                    Spacer(minLength: 0)
                    if row.isToday {
                        BoxLabel(text: "TODAY", height: 11 * 1.4, tracking: 11 * 0.1, color: Ink.bone)
                    }
                }
                CSSText(row.line, style: M.line)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .accessibilityElement(children: .combine)
    }
}
