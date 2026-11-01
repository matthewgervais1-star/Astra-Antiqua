import AstraCore
import SwiftUI
import UIKit

// The Liquid Glass chrome, from the approved canvas
// (https://claude.ai/artifact/LKiWRGTi16LRZ5GvyHbD3V, page "Glass", version 39,
// the Round 7 spec boards). Glass is the navigation layer only: the tab bar,
// the top bar's capsules, the horizon control, the back button, menus and
// sheets. Content stays flat on the culture's ground with square corners and
// 1px rules. Every number here is a canvas lever at its default, in points on
// the 390x844 frame, and names the ID it places.

enum Chrome {
    /// P1, P3, P55: the top of their 44-tall row. The canvas frame's safe top;
    /// a phone whose safe area reaches lower uses its own.
    static let safeTop: CGFloat = 62
    /// P1, P3, P55: the row's height.
    static let barH: CGFloat = 44
    /// P17, P3, P55, P2: distance from the screen's sides (lever inset).
    static let inset: CGFloat = 16
    /// P1: left edge on a tab screen (lever contentSide).
    static let contentSide: CGFloat = 24

    /// P17: the tab bar's height (lever tabH, 44 to 72).
    static let tabH: CGFloat = 56
    /// P17: gap above the home indicator's safe line (lever homeGap, 0 to 24).
    static let homeGap: CGFloat = 6
    /// P17: padding inside the capsule; four segments of 87.5x48.
    static let tabPadding: CGFloat = 4

    /// P2: gap under the culture menu, so the control sits at y 113.
    static let horizonGap: CGFloat = 7
    /// P2: the horizon control's height.
    static let horizonH: CGFloat = 44
    /// P2: padding inside the capsule; four segments of 88x38.
    static let horizonPadding: CGFloat = 3

    /// P3: horizontal padding inside the culture menu.
    static let menuPadding: CGFloat = 14
    /// P3: the accent square and the gap after it.
    static let menuSquare: CGFloat = 8
    static let menuSquareGap: CGFloat = 8

    /// P55: the round back button.
    static let backSize: CGFloat = 44
    /// P55: lever backLabel; the canvas default is the chevron alone.
    static let backTitled = false

    /// Content top: the chrome's bottom plus this (189 under P2, 138 without).
    static let contentGap: CGFloat = 32
    /// P20: the scroll edge runs this far past the chrome's bottom (173, 122).
    static let edgeOverhang: CGFloat = 16

    /// P3: width by culture, whole points, never under Egypt's 104, right
    /// edge at 374 (Round 6, Matthew's call of 2026-10-29).
    static func menuWidth(_ culture: Culture) -> CGFloat {
        switch culture {
        case .egypt, .rome: return 104
        case .greece, .canaan: return 113
        case .carthage: return 129
        }
    }

    /// The bottom of the top chrome: 106 on a tab or pushed screen, 157 with P2.
    static func chromeBottom(top: CGFloat, horizon: Bool) -> CGFloat {
        top + barH + (horizon ? horizonGap + horizonH : 0)
    }
}

/// The glass and its states, as the canvas draws them. On iOS 26 the system
/// material draws the glass and the press of a whole capsule; the numbers
/// here are its tint and the approximation below iOS 26.
enum GlassInk {
    /// Glass fill rgba(24,21,16,.80) (lever glassAlpha, .4 to .95).
    static let glassAlpha = 0.80
    static let fill = Color(.sRGB, red: 24 / 255, green: 21 / 255, blue: 16 / 255, opacity: glassAlpha)
    /// The same fill, opaque, when Reduce Transparency is on.
    static let opaqueFill = Color(.sRGB, red: 24 / 255, green: 21 / 255, blue: 16 / 255, opacity: 1)
    /// Inset 0 1px 0 rgba(255,255,255,.16).
    static let highlight = Color.white.opacity(0.16)
    /// Inset 0 0 0 1px rgba(230,222,204,.14).
    static let hairline = Ink.bone.opacity(0.14)
    /// 0 10px 30px rgba(0,0,0,.45): a CSS blur of 30 is a radius of 15 here.
    static let shadow = Color.black.opacity(0.45)
    static let shadowRadius: CGFloat = 15
    static let shadowY: CGFloat = 10

    /// The lit tab and lit segment: rgba(230,222,204,.14), highlight .18.
    static let thumb = Ink.bone.opacity(0.14)
    static let thumbHighlight = Color.white.opacity(0.18)
    /// P163 to P167, P169, P170: rgba(230,222,204,.26), highlight .24.
    static let pressed = Ink.bone.opacity(0.26)
    static let pressedHighlight = Color.white.opacity(0.24)
    /// P168: a side that cannot be tapped.
    static let disabledOpacity = 0.4
    /// P3's chevron stroke; P55's chevron strokes in bone.
    static let chevronStroke: CGFloat = 1.2
}

/// Whether the chrome uses the system's Liquid Glass where iOS offers it.
/// Off draws the canvas approximation on every version (a screenshot run sets
/// it to compare the two).
private struct SystemGlassKey: EnvironmentKey {
    static let defaultValue = true
}

/// The canvas IDs drawn pressed, for the screenshot run that photographs the
/// proposed states P163 to P170 as the spec boards show them.
private struct PressedPreviewKey: EnvironmentKey {
    static let defaultValue: Set<String> = []
}

/// A screenshot run's drawn scroll (GlassScreen's `scrolled`), in points.
/// The live scroll is not here: a layer that moves with it reads it at draw
/// time against `GlassScroll.contentSpace` (Sky Week's Moon, P171).
private struct GlassScrollOffsetKey: EnvironmentKey {
    static let defaultValue: CGFloat = 0
}

/// The scroll content's coordinate space, named outside the drawn offset:
/// a view's minY here less its minY in `.scrollView` is the live scroll.
enum GlassScroll {
    static let contentSpace = "glass-content"
}

extension EnvironmentValues {
    var glassScrollOffset: CGFloat {
        get { self[GlassScrollOffsetKey.self] }
        set { self[GlassScrollOffsetKey.self] = newValue }
    }

    var systemGlass: Bool {
        get { self[SystemGlassKey.self] }
        set { self[SystemGlassKey.self] = newValue }
    }

    var pressedPreview: Set<String> {
        get { self[PressedPreviewKey.self] }
        set { self[PressedPreviewKey.self] = newValue }
    }
}

/// The 1px highlight along a shape's top inner edge: the shape less itself
/// moved down one point, which is what inset 0 1px 0 draws.
struct TopHighlight<S: Shape>: Shape {
    let shape: S

    func path(in rect: CGRect) -> Path {
        shape.path(in: rect).subtracting(shape.path(in: rect.offsetBy(dx: 0, dy: 1)))
    }
}

/// The canvas glass, for iOS before 26: fill, blur, 1px inset highlight,
/// hairline and shadow. SwiftUI offers no blur radius or saturation for a
/// material, so the thin material stands in for blur 24 and saturate 1.5.
struct GlassApproximation<S: InsettableShape>: View {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    let shape: S

    init(shape: S) {
        self.shape = shape
    }

    var body: some View {
        ZStack {
            if !reduceTransparency {
                shape.fill(.ultraThinMaterial)
            }
            shape.fill(reduceTransparency ? GlassInk.opaqueFill : GlassInk.fill)
            TopHighlight(shape: shape).fill(GlassInk.highlight)
            shape.strokeBorder(GlassInk.hairline, lineWidth: 1)
        }
        .compositingGroup()
        .shadow(color: GlassInk.shadow, radius: GlassInk.shadowRadius, x: 0, y: GlassInk.shadowY)
    }
}

/// Puts a view on glass: the system's Liquid Glass tinted with the canvas
/// fill on iOS 26 and later, the canvas approximation before it or when
/// Reduce Transparency is on.
struct GlassSurface<S: InsettableShape>: ViewModifier {
    @Environment(\.systemGlass) private var systemGlass
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    let shape: S
    let interactive: Bool

    init(shape: S, interactive: Bool) {
        self.shape = shape
        self.interactive = interactive
    }

    // Self.Content: a bare Content names the app's corpus (Ink.swift).
    func body(content: Self.Content) -> some View {
        if #available(iOS 26.0, *) {
            if systemGlass && !reduceTransparency {
                let glass = Glass.regular.tint(GlassInk.fill)
                content.glassEffect(interactive ? glass.interactive() : glass, in: shape)
            } else {
                content.background { GlassApproximation(shape: shape) }
            }
        } else {
            content.background { GlassApproximation(shape: shape) }
        }
    }
}

extension View {
    func glassSurface<S: InsettableShape>(_ shape: S, interactive: Bool = false) -> some View {
        modifier(GlassSurface(shape: shape, interactive: interactive))
    }
}

/// A fill with the 1px top highlight: the lit thumb, or the pressed fill.
struct LitFill<S: Shape>: View {
    let shape: S
    let fill: Color
    let highlight: Color

    var body: some View {
        ZStack {
            shape.fill(fill)
            TopHighlight(shape: shape).fill(highlight)
        }
    }
}

/// P163 to P167, P169, P170: the segment or row under the finger takes the
/// pressed fill. A whole capsule on iOS 26 (P164, P165) is pressed by the
/// system's interactive glass instead and passes `fill: false`.
struct PressedFill<S: Shape>: ButtonStyle {
    @Environment(\.pressedPreview) private var preview
    let shape: S
    let id: String
    var fill = true

    init(shape: S, id: String, fill: Bool = true) {
        self.shape = shape
        self.id = id
        self.fill = fill
    }

    func makeBody(configuration: Configuration) -> some View {
        configuration.label.background {
            if (configuration.isPressed && fill) || preview.contains(id) {
                LitFill(shape: shape, fill: GlassInk.pressed, highlight: GlassInk.pressedHighlight)
            }
        }
    }
}

/// A chevron drawn as the canvas draws it: 10x6 pointing down (P3), 6x10
/// pointing left or right (P55, P56).
struct Chevron: Shape {
    enum Direction { case down, left, right }
    let direction: Direction

    func path(in rect: CGRect) -> Path {
        // The canvas paths, in their own viewBoxes: M1 1L5 5L9 1 (10x6),
        // M5 1L1 5L5 9 (6x10), M1 1L5 5L1 9 (6x10).
        let sx = rect.width / (direction == .down ? 10 : 6)
        let sy = rect.height / (direction == .down ? 6 : 10)
        let points: [CGPoint]
        switch direction {
        case .down: points = [CGPoint(x: 1, y: 1), CGPoint(x: 5, y: 5), CGPoint(x: 9, y: 1)]
        case .left: points = [CGPoint(x: 5, y: 1), CGPoint(x: 1, y: 5), CGPoint(x: 5, y: 9)]
        case .right: points = [CGPoint(x: 1, y: 1), CGPoint(x: 5, y: 5), CGPoint(x: 1, y: 9)]
        }
        var path = Path()
        path.addLines(points.map { CGPoint(x: rect.minX + $0.x * sx, y: rect.minY + $0.y * sy) })
        return path
    }
}

// MARK: - The tab bar (P17)

/// The four sections of the tab bar.
enum ChromeSection: String, CaseIterable, Identifiable {
    case sky, transits, chart, more
    var id: String { rawValue }
    var title: String { rawValue.uppercased() }
}

/// P17: a floating glass capsule with four text tabs. The lit tab is the
/// screen's section; a pushed screen keeps its parent lit.
struct GlassTabBar: View {
    let selection: ChromeSection
    var onSelect: (ChromeSection) -> Void = { _ in }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(ChromeSection.allCases) { section in
                let lit = section == selection
                Button { onSelect(section) } label: {
                    Text(section.title)
                        .font(.custom(lit ? Ink.monoStrong : Ink.mono, fixedSize: 11))
                        .tracking(11 * 0.18)
                        .foregroundStyle(lit ? Ink.bone : Ink.dim)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background {
                            if lit { LitFill(shape: Capsule(), fill: GlassInk.thumb, highlight: GlassInk.thumbHighlight) }
                        }
                        .contentShape(Capsule())
                }
                .buttonStyle(PressedFill(shape: Capsule(), id: "P163.\(section.rawValue)"))
                .accessibilityAddTraits(lit ? .isSelected : [])
                .accessibilityShowsLargeContentViewer()
            }
        }
        .padding(Chrome.tabPadding)
        .frame(height: Chrome.tabH)
        .glassSurface(Capsule())
        .placement("P17")
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Sections")
    }
}

// MARK: - The top bar (P1, P3, P55)

// The chrome's type is fixed at the canvas sizes and does not follow Dynamic
// Type, as the system tab bar does not (Matthew, 2026-10-31); the tabs, the
// horizons and the culture menu show the large content viewer on a long press.

/// P1: the wordmark, on the ground.
struct Wordmark: View {
    var body: some View {
        Text("ASTRA ANTIQVA")
            .font(.custom(Ink.displayMedium, fixedSize: 13))
            .tracking(13 * 0.28)
            .foregroundStyle(Ink.bone)
            .lineLimit(1)
            .fixedSize()
            .placement("P1")
            .accessibilityAddTraits(.isHeader)
    }
}

/// P3: the culture menu, a glass capsule at the right of the top bar: the
/// accent square, the culture's name and a chevron. It opens the culture sheet.
struct CultureMenu: View {
    let culture: Culture
    var action: () -> Void = {}

    var body: some View {
        let name = Content.store.cultureCopy(culture).label
        Button(action: action) {
            HStack(spacing: 0) {
                HStack(spacing: Chrome.menuSquareGap) {
                    Rectangle().fill(Ink.accent(culture)).frame(width: Chrome.menuSquare, height: Chrome.menuSquare)
                    Text(name.uppercased())
                        .font(.custom(Ink.mono, fixedSize: 11))
                        .tracking(11 * 0.14)
                        .foregroundStyle(Ink.bone)
                        .lineLimit(1)
                        .fixedSize()
                }
                Spacer(minLength: 0)
                Chevron(direction: .down)
                    .stroke(Ink.dim, lineWidth: GlassInk.chevronStroke)
                    .frame(width: 10, height: 6)
            }
            .padding(.horizontal, Chrome.menuPadding)
            .frame(width: Chrome.menuWidth(culture), height: Chrome.barH)
            .contentShape(Capsule())
        }
        .buttonStyle(PressedFill(shape: Capsule(), id: "P164", fill: !systemPress))
        .glassSurface(Capsule(), interactive: true)
        .placement("P3")
        .accessibilityLabel("Culture: \(name). Change culture")
        .accessibilityShowsLargeContentViewer()
    }
}

/// P55: the round glass back button of a pushed screen. `title` names the
/// parent ("CHART"); the canvas shows the chevron alone (lever backLabel).
struct BackButton: View {
    let title: String
    var action: () -> Void = {}

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Chevron(direction: .left)
                    .stroke(Ink.bone, lineWidth: GlassInk.chevronStroke)
                    .frame(width: 6, height: 10)
                if Chrome.backTitled {
                    Text(title)
                        .font(.custom(Ink.mono, fixedSize: 11))
                        .tracking(11 * 0.14)
                        .foregroundStyle(Ink.bone)
                }
            }
            .frame(minWidth: Chrome.backSize, minHeight: Chrome.backSize)
            .contentShape(Capsule())
        }
        .buttonStyle(PressedFill(shape: Capsule(), id: "P165", fill: !systemPress))
        .glassSurface(Capsule(), interactive: true)
        .placement("P55")
        .accessibilityLabel("Back to \(title.prefix(1))\(title.dropFirst().lowercased())")
    }
}

/// Whether the system's interactive glass draws the press of a whole capsule.
private var systemPress: Bool {
    if #available(iOS 26.0, *) { return true }
    return false
}

/// The top bar: no bar, the wordmark on the ground at the safe top and the
/// culture menu at the right; a pushed screen adds the back button at the
/// left and centres the wordmark between the two capsules (P1 at 88.1).
struct GlassTopBar: View {
    let culture: Culture
    /// The parent's title on a pushed screen, nil on a tab screen.
    var back: String? = nil
    var onBack: () -> Void = {}
    var onMenu: () -> Void = {}

    var body: some View {
        HStack(spacing: 0) {
            if let back {
                BackButton(title: back, action: onBack)
                Wordmark().frame(maxWidth: .infinity)
            } else {
                Wordmark().padding(.leading, Chrome.contentSide - Chrome.inset)
                Spacer(minLength: 0)
            }
            CultureMenu(culture: culture, action: onMenu)
        }
        .padding(.horizontal, Chrome.inset)
        .frame(height: Chrome.barH)
    }
}

// MARK: - The horizon control (P2)

/// The four horizons of the Sky tab.
enum SkyHorizon: String, CaseIterable, Identifiable {
    case day, week, season, year
    var id: String { rawValue }
    var title: String { rawValue.uppercased() }
}

/// P2: DAY · WEEK · SEASON · YEAR, a glass capsule under the top bar on the
/// four Sky screens, the screen's horizon lit.
struct HorizonControl: View {
    let selection: SkyHorizon
    var onSelect: (SkyHorizon) -> Void = { _ in }

    var body: some View {
        HStack(spacing: 0) {
            ForEach(SkyHorizon.allCases) { horizon in
                let lit = horizon == selection
                Button { onSelect(horizon) } label: {
                    Text(horizon.title)
                        .font(.custom(lit ? Ink.monoStrong : Ink.mono, fixedSize: 11))
                        .tracking(11 * 0.12)
                        .foregroundStyle(lit ? Ink.bone : Ink.dim)
                        .lineLimit(1)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background {
                            if lit { LitFill(shape: Capsule(), fill: GlassInk.thumb, highlight: GlassInk.thumbHighlight) }
                        }
                        .contentShape(Capsule())
                }
                .buttonStyle(PressedFill(shape: Capsule(), id: "P166.\(horizon.rawValue)"))
                .accessibilityAddTraits(lit ? .isSelected : [])
                .accessibilityShowsLargeContentViewer()
            }
        }
        .padding(Chrome.horizonPadding)
        .frame(height: Chrome.horizonH)
        .glassSurface(Capsule())
        .placement("P2")
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Horizon")
    }
}

// MARK: - The scroll edge (P20)

/// P20: the fade under the top chrome, ground at .94, .86 at 55%, clear at
/// the bottom. It is not glass. Over the ground at rest it draws nothing.
struct ScrollEdge: View {
    let ground: Color
    let height: CGFloat

    var body: some View {
        LinearGradient(
            stops: [
                .init(color: ground.opacity(0.94), location: 0),
                .init(color: ground.opacity(0.86), location: 0.55),
                .init(color: ground.opacity(0), location: 1),
            ],
            startPoint: .top, endPoint: .bottom)
            .frame(height: height)
            .allowsHitTesting(false)
            .accessibilityHidden(true)
            .placement("P20")
    }
}

// MARK: - The screen

/// One glass screen: the culture's ground, the content scrolling under the
/// chrome, the scroll edge, the top bar (with the horizon control on the Sky
/// screens) and the floating tab bar. Positions follow the canvas: the top
/// row at the safe top (62 on the canvas frame), content from 189 under P2
/// and from 138 without it, the tab bar 6 above the home line.
struct GlassScreen<Content: View>: View {
    let culture: Culture
    let section: ChromeSection
    var horizon: SkyHorizon? = nil
    var back: String? = nil
    /// Room under the content for the tab bar (the boards' padBottom).
    var contentBottom: CGFloat = 120
    /// A screenshot run's scroll, drawn as an offset so the frame is exact.
    var scrolled: CGFloat = 0
    var onSection: (ChromeSection) -> Void = { _ in }
    var onHorizon: (SkyHorizon) -> Void = { _ in }
    var onBack: () -> Void = {}
    var onMenu: () -> Void = {}
    @ViewBuilder var content: () -> Content

    var body: some View {
        // The reader keeps to the safe area, so its frame's top in window
        // coordinates is the safe top (47 on a 390x844 phone) whatever
        // safeAreaInsets reports. The ground, the scroll view and the edge
        // ignore the safe area and run from the screen's top, as the canvas
        // frame does; the top bar is padded down to the canvas's 62; the tab
        // bar keeps to the safe area, so it sits 6 above the home line.
        GeometryReader { proxy in
            let safeTop = proxy.frame(in: .global).minY
            let top = max(safeTop, Chrome.safeTop)
            let chromeBottom = Chrome.chromeBottom(top: top, horizon: horizon != nil)
            let ground = Ink.ground(culture)
            ZStack(alignment: .top) {
                ground.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        content()
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.top, chromeBottom + Chrome.contentGap)
                    .padding(.bottom, contentBottom)
                    .offset(y: -scrolled)
                    .coordinateSpace(.named(GlassScroll.contentSpace))
                    .environment(\.glassScrollOffset, scrolled)
                }
                .scrollIndicators(.hidden)
                .ignoresSafeArea()
                ScrollEdge(ground: ground, height: chromeBottom + Chrome.edgeOverhang)
                    .frame(maxHeight: .infinity, alignment: .top)
                    .ignoresSafeArea()
                VStack(spacing: Chrome.horizonGap) {
                    GlassTopBar(culture: culture, back: back, onBack: onBack, onMenu: onMenu)
                    if let horizon {
                        HorizonControl(selection: horizon, onSelect: onHorizon)
                            .padding(.horizontal, Chrome.inset)
                    }
                }
                .padding(.top, top - safeTop)
                .frame(maxHeight: .infinity, alignment: .top)
                GlassTabBar(selection: section, onSelect: onSection)
                    .padding(.horizontal, Chrome.inset)
                    .padding(.bottom, Chrome.homeGap)
                    .frame(maxHeight: .infinity, alignment: .bottom)
            }
        }
        .environment(\.culture, culture)
        .toolbar(.hidden, for: .navigationBar)
    }
}

// MARK: - Placement probes

extension View {
    /// Tags a view with its canvas ID. In a screenshot run the app writes the
    /// view's frame, in points from the screen's top left, to standard output,
    /// where CI checks it against ios/placement/*.json to within a point.
    func placement(_ id: String) -> some View {
        modifier(PlacementProbe(id: id))
    }
}

private struct PlacementProbe: ViewModifier {
    let id: String

    func body(content: Self.Content) -> some View {
        if ScreenshotMode.requested == nil {
            content
        } else {
            content.background {
                GeometryReader { geometry in
                    let frame = geometry.frame(in: .global)
                    Color.clear
                        .onAppear { MainActor.assumeIsolated { PlacementLog.record(id, frame) } }
                        .onChange(of: frame) { _, latest in MainActor.assumeIsolated { PlacementLog.record(id, latest) } }
                }
            }
        }
    }
}

/// Collects the probes' frames and prints them once the layout has settled:
/// one line per ID, `PLACEMENT <screen> <id> <x> <y> <width> <height>`, and
/// one `WINDOW` line with the window's size.
@MainActor
enum PlacementLog {
    private static var frames: [String: CGRect] = [:]
    private static var scheduled = false

    static func record(_ id: String, _ frame: CGRect) {
        frames[id] = frame
        guard !scheduled else { return }
        scheduled = true
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 3_000_000_000)
            let screen = ScreenshotMode.requested ?? "day"
            // The window the frames were measured in, so CI can tell a
            // 390x844 run from one on another phone.
            let window = UIApplication.shared.connectedScenes
                .compactMap { ($0 as? UIWindowScene)?.coordinateSpace.bounds.size }.first ?? .zero
            print(String(format: "PLACEMENT %@ WINDOW 0.0 0.0 %.1f %.1f", screen, window.width, window.height))
            for (id, f) in frames.sorted(by: { $0.key < $1.key }) {
                print(String(format: "PLACEMENT %@ %@ %.1f %.1f %.1f %.1f", screen, id, f.minX, f.minY, f.width, f.height))
            }
            fflush(stdout)
        }
    }
}
